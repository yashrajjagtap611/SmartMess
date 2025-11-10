import crypto from 'crypto';
import { razorpayInstance, razorpayConfig, validateRazorpayConfig } from '../config/razorpay';
import PaymentTransaction from '../models/PaymentTransaction';
import { MessCredits, CreditTransaction, CreditPurchasePlan } from '../models';
import logger from '../utils/logger';

export class RazorpayService {
  /**
   * Create a Razorpay order for credit purchase
   */
  async createOrder(params: {
    messId: string;
    userId: string;
    planId: string;
    amount: number;
    currency?: string;
  }): Promise<{
    orderId: string;
    amount: number;
    currency: string;
    keyId: string;
  }> {
    if (!validateRazorpayConfig()) {
      throw new Error('Razorpay is not configured. Please contact administrator.');
    }

    const { messId, userId, planId, amount, currency = 'INR' } = params;

    try {
      // Fetch the plan details
      const plan = await CreditPurchasePlan.findById(planId);
      if (!plan) {
        throw new Error('Credit purchase plan not found');
      }

      if (!plan.isActive) {
        throw new Error('This credit plan is not currently available');
      }

      // Verify amount matches plan price (convert to paise for Razorpay)
      const amountInPaise = Math.round(plan.price * 100);
      if (amount !== amountInPaise) {
        throw new Error('Amount mismatch with plan price');
      }

      // Create Razorpay order
      const orderOptions = {
        amount: amountInPaise, // Amount in paise
        currency: currency.toUpperCase(),
        receipt: `${razorpayConfig.receiptPrefix}${Date.now()}`,
        notes: {
          messId,
          userId,
          planId,
          planName: plan.name,
          credits: plan.baseCredits,
          bonusCredits: plan.bonusCredits
        }
      };

      const razorpayOrder = await razorpayInstance.orders.create(orderOptions);

      // Create payment transaction record
      const paymentTransaction = await PaymentTransaction.create({
        messId,
        userId,
        planId,
        orderId: razorpayOrder.id,
        amount: plan.price, // Store in rupees for our records
        currency: currency.toUpperCase(),
        credits: plan.baseCredits,
        bonusCredits: plan.bonusCredits,
        totalCredits: plan.totalCredits,
        status: 'created',
        metadata: {
          razorpayOrderId: razorpayOrder.id,
          receipt: razorpayOrder.receipt
        }
      });

      logger.info(`Razorpay order created: ${razorpayOrder.id} for mess ${messId}`);

      return {
        orderId: razorpayOrder.id,
        amount: amountInPaise,
        currency: currency.toUpperCase(),
        keyId: razorpayConfig.keyId
      };
    } catch (error) {
      logger.error('Failed to create Razorpay order:', error);
      throw error;
    }
  }

  /**
   * Verify Razorpay payment signature
   */
  verifyPaymentSignature(params: {
    orderId: string;
    paymentId: string;
    signature: string;
  }): boolean {
    try {
      const { orderId, paymentId, signature } = params;

      const generatedSignature = crypto
        .createHmac('sha256', razorpayConfig.keySecret)
        .update(`${orderId}|${paymentId}`)
        .digest('hex');

      return generatedSignature === signature;
    } catch (error) {
      logger.error('Signature verification failed:', error);
      return false;
    }
  }

  /**
   * Handle successful payment and credit the mess account
   */
  async handlePaymentSuccess(params: {
    orderId: string;
    paymentId: string;
    signature: string;
  }): Promise<{
    success: boolean;
    transaction: any;
    creditsAdded: number;
  }> {
    const { orderId, paymentId, signature } = params;

    try {
      // Verify signature
      const isValid = this.verifyPaymentSignature({ orderId, paymentId, signature });
      if (!isValid) {
        throw new Error('Invalid payment signature');
      }

      // Find the payment transaction
      const paymentTransaction = await PaymentTransaction.findOne({ orderId });
      if (!paymentTransaction) {
        throw new Error('Payment transaction not found');
      }

      // Check if already processed
      if (paymentTransaction.status === 'success') {
        logger.warn(`Payment ${paymentId} already processed`);
        return {
          success: true,
          transaction: paymentTransaction,
          creditsAdded: paymentTransaction.totalCredits
        };
      }

      // Update payment transaction
      paymentTransaction.paymentId = paymentId;
      paymentTransaction.signature = signature;
      paymentTransaction.status = 'success';
      await paymentTransaction.save();

      // Credit the mess account
      const messCredits = await MessCredits.findOne({ messId: paymentTransaction.messId });
      if (!messCredits) {
        throw new Error('Mess credits account not found');
      }

      // Add credits using instance method
      // @ts-ignore - Custom instance method
      await messCredits.addCredits(paymentTransaction.totalCredits);

      // Create credit transaction record
      await CreditTransaction.create({
        messId: paymentTransaction.messId,
        type: 'purchase',
        amount: paymentTransaction.totalCredits,
        description: `Credit purchase: ${paymentTransaction.credits} credits + ${paymentTransaction.bonusCredits} bonus credits`,
        metadata: {
          paymentId,
          orderId,
          planId: paymentTransaction.planId,
          amountPaid: paymentTransaction.amount,
          currency: paymentTransaction.currency,
          baseCredits: paymentTransaction.credits,
          bonusCredits: paymentTransaction.bonusCredits
        },
        status: 'completed'
      });

      logger.info(
        `Payment successful: ${paymentId}, ${paymentTransaction.totalCredits} credits added to mess ${paymentTransaction.messId}`
      );

      return {
        success: true,
        transaction: paymentTransaction,
        creditsAdded: paymentTransaction.totalCredits
      };
    } catch (error) {
      logger.error('Failed to handle payment success:', error);
      throw error;
    }
  }

  /**
   * Handle failed payment
   */
  async handlePaymentFailure(params: {
    orderId: string;
    errorCode?: string;
    errorDescription?: string;
  }): Promise<void> {
    const { orderId, errorCode, errorDescription } = params;

    try {
      const paymentTransaction = await PaymentTransaction.findOne({ orderId });
      if (!paymentTransaction) {
        logger.error(`Payment transaction not found for order ${orderId}`);
        return;
      }

      paymentTransaction.status = 'failed';
      if (errorCode !== undefined) {
        paymentTransaction.errorCode = errorCode;
      }
      if (errorDescription !== undefined) {
        paymentTransaction.errorDescription = errorDescription;
      }
      await paymentTransaction.save();

      logger.warn(`Payment failed for order ${orderId}: ${errorDescription}`);
    } catch (error) {
      logger.error('Failed to handle payment failure:', error);
      throw error;
    }
  }

  /**
   * Get payment transaction by order ID
   */
  async getPaymentTransaction(orderId: string) {
    return await PaymentTransaction.findOne({ orderId }).populate('planId');
  }

  /**
   * Get payment history for a mess
   */
  async getPaymentHistory(messId: string, options: { page?: number; limit?: number } = {}) {
    const { page = 1, limit = 20 } = options;
    const skip = (page - 1) * limit;

    const [transactions, total] = await Promise.all([
      PaymentTransaction.find({ messId })
        .populate('planId', 'name baseCredits bonusCredits')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      PaymentTransaction.countDocuments({ messId })
    ]);

    return {
      transactions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Verify webhook signature (for Razorpay webhooks)
   */
  verifyWebhookSignature(payload: string, signature: string): boolean {
    try {
      const generatedSignature = crypto
        .createHmac('sha256', razorpayConfig.webhookSecret)
        .update(payload)
        .digest('hex');

      return generatedSignature === signature;
    } catch (error) {
      logger.error('Webhook signature verification failed:', error);
      return false;
    }
  }
}

export const razorpayService = new RazorpayService();

