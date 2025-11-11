"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.paymentController = exports.PaymentController = void 0;
const razorpayService_1 = require("../services/razorpayService");
const razorpay_1 = require("../config/razorpay");
const logger_1 = __importDefault(require("../utils/logger"));
class PaymentController {
    /**
     * Get Razorpay configuration (key ID only, never expose secret)
     */
    async getRazorpayConfig(req, res) {
        try {
            return res.json({
                success: true,
                data: {
                    keyId: razorpay_1.razorpayConfig.keyId,
                    currency: razorpay_1.razorpayConfig.currency
                }
            });
        }
        catch (error) {
            logger_1.default.error('Failed to get Razorpay config:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to get payment configuration'
            });
        }
    }
    /**
     * Create a payment order for credit purchase
     */
    async createOrder(req, res) {
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
            const order = await razorpayService_1.razorpayService.createOrder({
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
        }
        catch (error) {
            logger_1.default.error('Failed to create payment order:', error);
            return res.status(500).json({
                success: false,
                message: error.message || 'Failed to create payment order'
            });
        }
    }
    /**
     * Verify payment and credit the account
     */
    async verifyPayment(req, res) {
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
            const result = await razorpayService_1.razorpayService.handlePaymentSuccess({
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
        }
        catch (error) {
            logger_1.default.error('Payment verification failed:', error);
            // Try to mark payment as failed
            try {
                if (req.body.orderId) {
                    await razorpayService_1.razorpayService.handlePaymentFailure({
                        orderId: req.body.orderId,
                        errorDescription: error.message
                    });
                }
            }
            catch (failureError) {
                logger_1.default.error('Failed to mark payment as failed:', failureError);
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
    async getTransactionDetails(req, res) {
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
            const transaction = await razorpayService_1.razorpayService.getPaymentTransaction(orderId);
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
        }
        catch (error) {
            logger_1.default.error('Failed to get transaction details:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to fetch transaction details'
            });
        }
    }
    /**
     * Get payment history for the mess
     */
    async getPaymentHistory(req, res) {
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
            const result = await razorpayService_1.razorpayService.getPaymentHistory(messId, {
                page: page ? parseInt(page) : 1,
                limit: limit ? parseInt(limit) : 20
            });
            return res.json({
                success: true,
                data: result
            });
        }
        catch (error) {
            logger_1.default.error('Failed to get payment history:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to fetch payment history'
            });
        }
    }
    /**
     * Handle Razorpay webhook events
     */
    async handleWebhook(req, res) {
        try {
            const signature = req.headers['x-razorpay-signature'];
            const payload = JSON.stringify(req.body);
            // Verify webhook signature
            const isValid = razorpayService_1.razorpayService.verifyWebhookSignature(payload, signature);
            if (!isValid) {
                logger_1.default.error('Invalid webhook signature');
                return res.status(400).json({
                    success: false,
                    message: 'Invalid signature'
                });
            }
            const event = req.body.event;
            const paymentEntity = req.body.payload?.payment?.entity;
            logger_1.default.info(`Webhook received: ${event}`);
            switch (event) {
                case 'payment.captured':
                    // Payment was successful
                    await razorpayService_1.razorpayService.handlePaymentSuccess({
                        orderId: paymentEntity.order_id,
                        paymentId: paymentEntity.id,
                        signature: '' // Signature already verified via webhook
                    });
                    break;
                case 'payment.failed':
                    // Payment failed
                    await razorpayService_1.razorpayService.handlePaymentFailure({
                        orderId: paymentEntity.order_id,
                        errorCode: paymentEntity.error_code,
                        errorDescription: paymentEntity.error_description
                    });
                    break;
                default:
                    logger_1.default.info(`Unhandled webhook event: ${event}`);
            }
            return res.json({ success: true });
        }
        catch (error) {
            logger_1.default.error('Webhook processing failed:', error);
            return res.status(500).json({
                success: false,
                message: 'Webhook processing failed'
            });
        }
    }
}
exports.PaymentController = PaymentController;
exports.paymentController = new PaymentController();
//# sourceMappingURL=paymentController.js.map