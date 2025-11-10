import { Request, Response } from 'express';
import { razorpayService } from '../services/razorpayService';
import { razorpayConfig } from '../config/razorpay';
import logger from '../utils/logger';

interface AuthRequest extends Request {
  user?: any; // User document from database
}

export class PaymentController {
  /**
   * Get Razorpay configuration (key ID only, never expose secret)
   */
  async getRazorpayConfig(req: Request, res: Response): Promise<Response> {
    try {
      return res.json({
        success: true,
        data: {
          keyId: razorpayConfig.keyId,
          currency: razorpayConfig.currency
        }
      });
    } catch (error) {
      logger.error('Failed to get Razorpay config:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to get payment configuration'
      });
    }
  }

  /**
   * Create a payment order for credit purchase
   */
  async createOrder(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const { planId } = req.body;
      const userId = req.user?.id || req.user?._id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      if (!planId) {
        return res.status(400).json({
          success: false,
          message: 'Plan ID is required'
        });
      }

      // Get mess profile for the user
      const { MessProfile, CreditPurchasePlan } = require('../models');
      const messProfile = await MessProfile.findOne({ userId });
      
      if (!messProfile) {
        return res.status(404).json({
          success: false,
          message: 'Mess profile not found. Please complete your mess profile first.'
        });
      }

      const messId = messProfile._id.toString();

      // Fetch plan to get amount
      const plan = await CreditPurchasePlan.findById(planId);
      
      if (!plan) {
        return res.status(404).json({
          success: false,
          message: 'Credit plan not found'
        });
      }

      if (!plan.isActive) {
        return res.status(400).json({
          success: false,
          message: 'This credit plan is not currently available'
        });
      }

      // Create Razorpay order
      const order = await razorpayService.createOrder({
        messId,
        userId: userId.toString(),
        planId,
        amount: Math.round(plan.price * 100), // Convert to paise
        currency: 'INR'
      });

      return res.json({
        success: true,
        data: {
          ...order,
          plan: {
            id: plan._id,
            name: plan.name,
            price: plan.price,
            baseCredits: plan.baseCredits,
            bonusCredits: plan.bonusCredits,
            totalCredits: plan.totalCredits
          }
        }
      });
    } catch (error: any) {
      logger.error('Failed to create payment order:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to create payment order'
      });
    }
  }

  /**
   * Verify payment and credit the account
   */
  async verifyPayment(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const { orderId, paymentId, signature } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      if (!orderId || !paymentId || !signature) {
        return res.status(400).json({
          success: false,
          message: 'Order ID, Payment ID, and Signature are required'
        });
      }

      // Verify and process payment
      const result = await razorpayService.handlePaymentSuccess({
        orderId,
        paymentId,
        signature
      });

      return res.json({
        success: true,
        message: `Payment successful! ${result.creditsAdded} credits have been added to your account.`,
        data: {
          creditsAdded: result.creditsAdded,
          transaction: result.transaction
        }
      });
    } catch (error: any) {
      logger.error('Payment verification failed:', error);
      
      // Try to mark payment as failed
      try {
        if (req.body.orderId) {
          await razorpayService.handlePaymentFailure({
            orderId: req.body.orderId,
            errorDescription: error.message
          });
        }
      } catch (failureError) {
        logger.error('Failed to mark payment as failed:', failureError);
      }

      return res.status(400).json({
        success: false,
        message: error.message || 'Payment verification failed'
      });
    }
  }

  /**
   * Get payment transaction details
   */
  async getTransactionDetails(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const { orderId } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      if (!orderId) {
        return res.status(400).json({
          success: false,
          message: 'Order ID is required'
        });
      }

      const transaction = await razorpayService.getPaymentTransaction(orderId);

      if (!transaction) {
        return res.status(404).json({
          success: false,
          message: 'Transaction not found'
        });
      }

      // Verify user owns this transaction
      if (transaction.userId.toString() !== userId) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }

      return res.json({
        success: true,
        data: transaction
      });
    } catch (error: any) {
      logger.error('Failed to get transaction details:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch transaction details'
      });
    }
  }

  /**
   * Get payment history for the mess
   */
  async getPaymentHistory(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const userId = req.user?.id || req.user?._id;
      const { page, limit } = req.query;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      // Get mess profile for the user
      const { MessProfile } = require('../models');
      const messProfile = await MessProfile.findOne({ userId });
      
      if (!messProfile) {
        return res.status(404).json({
          success: false,
          message: 'Mess profile not found'
        });
      }

      const messId = messProfile._id.toString();

      const result = await razorpayService.getPaymentHistory(messId, {
        page: page ? parseInt(page as string) : 1,
        limit: limit ? parseInt(limit as string) : 20
      });

      return res.json({
        success: true,
        data: result
      });
    } catch (error: any) {
      logger.error('Failed to get payment history:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch payment history'
      });
    }
  }

  /**
   * Handle Razorpay webhook events
   */
  async handleWebhook(req: Request, res: Response): Promise<Response> {
    try {
      const signature = req.headers['x-razorpay-signature'] as string;
      const payload = JSON.stringify(req.body);

      // Verify webhook signature
      const isValid = razorpayService.verifyWebhookSignature(payload, signature);
      if (!isValid) {
        logger.error('Invalid webhook signature');
        return res.status(400).json({
          success: false,
          message: 'Invalid signature'
        });
      }

      const event = req.body.event;
      const paymentEntity = req.body.payload?.payment?.entity;

      logger.info(`Webhook received: ${event}`);

      switch (event) {
        case 'payment.captured':
          // Payment was successful
          await razorpayService.handlePaymentSuccess({
            orderId: paymentEntity.order_id,
            paymentId: paymentEntity.id,
            signature: '' // Signature already verified via webhook
          });
          break;

        case 'payment.failed':
          // Payment failed
          await razorpayService.handlePaymentFailure({
            orderId: paymentEntity.order_id,
            errorCode: paymentEntity.error_code,
            errorDescription: paymentEntity.error_description
          });
          break;

        default:
          logger.info(`Unhandled webhook event: ${event}`);
      }

      return res.json({ success: true });
    } catch (error: any) {
      logger.error('Webhook processing failed:', error);
      return res.status(500).json({
        success: false,
        message: 'Webhook processing failed'
      });
    }
  }
}

export const paymentController = new PaymentController();

