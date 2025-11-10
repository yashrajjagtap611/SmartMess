import crypto from 'crypto';
import PaymentGateway from '../models/PaymentGateway';
import Transaction from '../models/Transaction';
import Billing from '../models/Billing';
import User from '../models/User';
import MessProfile from '../models/MessProfile';

export interface PaymentRequest {
  amount: number;
  currency: string;
  userId: string;
  messId: string;
  billingId?: string;
  subscriptionId?: string;
  description: string;
  customerInfo: {
    name: string;
    email: string;
    phone: string;
  };
  metadata?: any;
}

export interface PaymentResponse {
  success: boolean;
  paymentId?: string;
  orderId?: string;
  amount?: number;
  currency?: string;
  status?: string;
  gatewayResponse?: any;
  error?: string;
}

export interface RefundRequest {
  transactionId: string;
  amount: number;
  reason: string;
  refundedBy: string;
}

export interface RefundResponse {
  success: boolean;
  refundId?: string;
  amount?: number;
  status?: string;
  gatewayResponse?: any;
  error?: string;
}

export class PaymentGatewayService {
  private static gateways: Map<string, any> = new Map();

  /**
   * Initialize payment gateways
   */
  static async initializeGateways() {
    try {
      const gateways = await PaymentGateway.find({ isActive: true });
      
      for (const gateway of gateways) {
        switch (gateway.type) {
          case 'razorpay':
            this.gateways.set(gateway.type, {
              ...gateway,
              client: await this.initializeRazorpay(gateway)
            });
            break;
          case 'stripe':
            this.gateways.set(gateway.type, {
              ...gateway,
              client: await this.initializeStripe(gateway)
            });
            break;
          default:
            console.log(`Gateway ${gateway.type} not supported yet`);
        }
      }

      console.log(`Initialized ${this.gateways.size} payment gateways`);
    } catch (error: any) {
      console.error('Error initializing payment gateways:', error);
    }
  }

  /**
   * Initialize Razorpay
   */
  private static async initializeRazorpay(gateway: any) {
    // In a real implementation, you would use the Razorpay SDK
    // const Razorpay = require('razorpay');
    // return new Razorpay({
    //   key_id: gateway.configuration.apiKey,
    //   key_secret: gateway.configuration.secretKey
    // });
    
    return {
      keyId: gateway.configuration.apiKey,
      keySecret: gateway.configuration.secretKey,
      environment: gateway.configuration.environment
    };
  }

  /**
   * Initialize Stripe
   */
  private static async initializeStripe(gateway: any) {
    // In a real implementation, you would use the Stripe SDK
    // const Stripe = require('stripe');
    // return new Stripe(gateway.configuration.secretKey);
    
    return {
      secretKey: gateway.configuration.secretKey,
      publishableKey: gateway.configuration.apiKey,
      environment: gateway.configuration.environment
    };
  }

  /**
   * Create payment order
   */
  static async createPaymentOrder(
    request: PaymentRequest,
    gatewayType: string = 'razorpay'
  ): Promise<PaymentResponse> {
    try {
      const gateway = this.gateways.get(gatewayType);
      if (!gateway) {
        throw new Error(`Payment gateway ${gatewayType} not found`);
      }

      // Get user and mess details
      const user = await User.findById(request.userId);
      const mess = await MessProfile.findById(request.messId);
      
      if (!user || !mess) {
        throw new Error('User or mess not found');
      }

      // Create transaction record
      const transaction = new Transaction({
        userId: request.userId,
        messId: request.messId,
        billingId: request.billingId,
        subscriptionId: request.subscriptionId,
        type: 'payment',
        amount: request.amount,
        currency: request.currency,
        status: 'pending',
        paymentMethod: 'online',
        gateway: {
          name: gateway.name,
          transactionId: `ORDER_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`
        },
        description: request.description,
        metadata: request.metadata
      });

      await transaction.save();

      // Create payment order based on gateway
      let orderResponse;
      switch (gatewayType) {
        case 'razorpay':
          orderResponse = await this.createRazorpayOrder(gateway, request, transaction);
          break;
        case 'stripe':
          orderResponse = await this.createStripePaymentIntent(gateway, request, transaction);
          break;
        default:
          throw new Error(`Unsupported gateway: ${gatewayType}`);
      }

      if (orderResponse.success) {
        // Update transaction with gateway response
        transaction.gateway.gatewayResponse = orderResponse.gatewayResponse;
        transaction.gateway.transactionId = orderResponse.orderId || orderResponse.paymentId || '';
        await transaction.save();

        return {
          success: true,
          paymentId: orderResponse.paymentId || '',
          orderId: orderResponse.orderId || '',
          amount: request.amount,
          currency: request.currency,
          status: 'created',
          gatewayResponse: orderResponse.gatewayResponse
        };
      } else {
        // Update transaction as failed
        transaction.status = 'failed';
        transaction.gateway.gatewayResponse = orderResponse.gatewayResponse;
        await transaction.save();

        return {
          success: false,
          error: orderResponse.error || 'Payment order creation failed',
          gatewayResponse: orderResponse.gatewayResponse
        };
      }
    } catch (error: any) {
      console.error('Error creating payment order:', error);
      return {
        success: false,
        error: error?.message || 'Unknown error occurred'
      };
    }
  }

  /**
   * Create Razorpay order
   */
  private static async createRazorpayOrder(
    gateway: any,
    request: PaymentRequest,
    transaction: any
  ): Promise<PaymentResponse> {
    try {
      // In a real implementation, you would use the Razorpay SDK
      // const order = await gateway.client.orders.create({
      //   amount: request.amount * 100, // Razorpay expects amount in paise
      //   currency: request.currency,
      //   receipt: transaction.transactionId,
      //   notes: {
      //     userId: request.userId,
      //     messId: request.messId,
      //     description: request.description
      //   }
      // });

      // Simulate Razorpay order creation
      const orderId = `order_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
      
      return {
        success: true,
        orderId,
        amount: request.amount,
        currency: request.currency,
        status: 'created',
        gatewayResponse: {
          id: orderId,
          amount: request.amount * 100,
          currency: request.currency,
          status: 'created',
          receipt: transaction.transactionId,
          created_at: Date.now()
        }
      };
    } catch (error: any) {
      return {
        success: false,
        error: error?.message || 'Unknown error occurred',
        gatewayResponse: { error: error.message }
      };
    }
  }

  /**
   * Create Stripe payment intent
   */
  private static async createStripePaymentIntent(
    gateway: any,
    request: PaymentRequest,
    transaction: any
  ): Promise<PaymentResponse> {
    try {
      // In a real implementation, you would use the Stripe SDK
      // const paymentIntent = await gateway.client.paymentIntents.create({
      //   amount: request.amount * 100, // Stripe expects amount in cents
      //   currency: request.currency.toLowerCase(),
      //   metadata: {
      //     userId: request.userId,
      //     messId: request.messId,
      //     transactionId: transaction.transactionId
      //   }
      // });

      // Simulate Stripe payment intent creation
      const paymentIntentId = `pi_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
      
      return {
        success: true,
        paymentId: paymentIntentId,
        amount: request.amount,
        currency: request.currency,
        status: 'requires_payment_method',
        gatewayResponse: {
          id: paymentIntentId,
          amount: request.amount * 100,
          currency: request.currency.toLowerCase(),
          status: 'requires_payment_method',
          client_secret: `${paymentIntentId}_secret_${Math.random().toString(36).substring(2, 8)}`
        }
      };
    } catch (error: any) {
      return {
        success: false,
        error: error?.message || 'Unknown error occurred',
        gatewayResponse: { error: error.message }
      };
    }
  }

  /**
   * Verify payment
   */
  static async verifyPayment(
    transactionId: string,
    paymentData: any,
    gatewayType: string = 'razorpay'
  ): Promise<PaymentResponse> {
    try {
      const transaction = await Transaction.findById(transactionId);
      if (!transaction) {
        throw new Error('Transaction not found');
      }

      const gateway = this.gateways.get(gatewayType);
      if (!gateway) {
        throw new Error(`Payment gateway ${gatewayType} not found`);
      }

      let verificationResult;
      switch (gatewayType) {
        case 'razorpay':
          verificationResult = await this.verifyRazorpayPayment(gateway, paymentData, transaction);
          break;
        case 'stripe':
          verificationResult = await this.verifyStripePayment(gateway, paymentData, transaction);
          break;
        default:
          throw new Error(`Unsupported gateway: ${gatewayType}`);
      }

      if (verificationResult.success) {
        // Update transaction
        transaction.status = 'success';
        transaction.gateway.gatewayResponse = verificationResult.gatewayResponse;
        await transaction.save();

        // Update billing if exists
        if (transaction.billingId) {
          const billing = await Billing.findById(transaction.billingId);
          if (billing) {
            billing.payment.status = 'paid';
            billing.payment.paidDate = new Date();
            billing.payment.transactionId = transaction.transactionId;
            billing.payment.gatewayResponse = verificationResult.gatewayResponse;
            await billing.save();
          }
        }

        // Subscription handling removed

        return {
          success: true,
          paymentId: verificationResult.paymentId || '',
          amount: transaction.amount,
          currency: transaction.currency,
          status: 'success',
          gatewayResponse: verificationResult.gatewayResponse
        };
      } else {
        // Update transaction as failed
        transaction.status = 'failed';
        transaction.gateway.gatewayResponse = verificationResult.gatewayResponse;
        await transaction.save();

        return {
          success: false,
          error: verificationResult.error || 'Payment verification failed',
          gatewayResponse: verificationResult.gatewayResponse
        };
      }
    } catch (error: any) {
      console.error('Error verifying payment:', error);
      return {
        success: false,
        error: error?.message || 'Unknown error occurred'
      };
    }
  }

  /**
   * Verify Razorpay payment
   */
  private static async verifyRazorpayPayment(
    gateway: any,
    paymentData: any,
    transaction: any
  ): Promise<PaymentResponse> {
    try {
      // In a real implementation, you would verify the signature
      // const crypto = require('crypto');
      // const expectedSignature = crypto
      //   .createHmac('sha256', gateway.keySecret)
      //   .update(paymentData.razorpay_order_id + '|' + paymentData.razorpay_payment_id)
      //   .digest('hex');
      // 
      // if (expectedSignature !== paymentData.razorpay_signature) {
      //   throw new Error('Invalid signature');
      // }

      // Simulate Razorpay payment verification
      const isValid = Math.random() > 0.1; // 90% success rate

      if (isValid) {
        return {
          success: true,
          paymentId: paymentData.razorpay_payment_id,
          amount: transaction.amount,
          currency: transaction.currency,
          status: 'success',
          gatewayResponse: {
            razorpay_payment_id: paymentData.razorpay_payment_id,
            razorpay_order_id: paymentData.razorpay_order_id,
            razorpay_signature: paymentData.razorpay_signature,
            status: 'success'
          }
        };
      } else {
        return {
          success: false,
          error: 'Payment verification failed',
          gatewayResponse: { error: 'Invalid signature' }
        };
      }
    } catch (error: any) {
      return {
        success: false,
        error: error?.message || 'Unknown error occurred',
        gatewayResponse: { error: error.message }
      };
    }
  }

  /**
   * Verify Stripe payment
   */
  private static async verifyStripePayment(
    gateway: any,
    paymentData: any,
    transaction: any
  ): Promise<PaymentResponse> {
    try {
      // In a real implementation, you would verify the payment intent
      // const paymentIntent = await gateway.client.paymentIntents.retrieve(
      //   paymentData.payment_intent_id
      // );

      // Simulate Stripe payment verification
      const isValid = Math.random() > 0.1; // 90% success rate

      if (isValid) {
        return {
          success: true,
          paymentId: paymentData.payment_intent_id,
          amount: transaction.amount,
          currency: transaction.currency,
          status: 'success',
          gatewayResponse: {
            id: paymentData.payment_intent_id,
            status: 'succeeded',
            amount: transaction.amount * 100,
            currency: transaction.currency
          }
        };
      } else {
        return {
          success: false,
          error: 'Payment verification failed',
          gatewayResponse: { error: 'Payment failed' }
        };
      }
    } catch (error: any) {
      return {
        success: false,
        error: error?.message || 'Unknown error occurred',
        gatewayResponse: { error: error.message }
      };
    }
  }

  /**
   * Process refund
   */
  static async processRefund(request: RefundRequest): Promise<RefundResponse> {
    try {
      const transaction = await Transaction.findById(request.transactionId);
      if (!transaction) {
        throw new Error('Transaction not found');
      }

      if (transaction.status !== 'success') {
        throw new Error('Cannot refund non-successful transaction');
      }

      if (request.amount > transaction.amount) {
        throw new Error('Refund amount cannot exceed transaction amount');
      }

      const gateway = this.gateways.get(transaction.gateway.name);
      if (!gateway) {
        throw new Error(`Payment gateway ${transaction.gateway.name} not found`);
      }

      let refundResult;
      switch (transaction.gateway.name) {
        case 'razorpay':
          refundResult = await this.processRazorpayRefund(gateway, transaction, request);
          break;
        case 'stripe':
          refundResult = await this.processStripeRefund(gateway, transaction, request);
          break;
        default:
          throw new Error(`Unsupported gateway: ${transaction.gateway.name}`);
      }

      if (refundResult.success) {
        // Update transaction with refund
        (transaction as any).processRefund(
          request.amount,
          request.reason,
          request.refundedBy,
          refundResult.refundId
        );
        await transaction.save();

        return {
          success: true,
          refundId: refundResult.refundId || '',
          amount: request.amount,
          status: 'success',
          gatewayResponse: refundResult.gatewayResponse
        };
      } else {
        return {
          success: false,
          error: refundResult.error || 'Refund processing failed',
          gatewayResponse: refundResult.gatewayResponse
        };
      }
    } catch (error: any) {
      console.error('Error processing refund:', error);
      return {
        success: false,
        error: error?.message || 'Unknown error occurred'
      };
    }
  }

  /**
   * Process Razorpay refund
   */
  private static async processRazorpayRefund(
    gateway: any,
    transaction: any,
    request: RefundRequest
  ): Promise<RefundResponse> {
    try {
      // In a real implementation, you would use the Razorpay SDK
      // const refund = await gateway.client.payments.refund(
      //   transaction.gateway.transactionId,
      //   {
      //     amount: request.amount * 100, // Razorpay expects amount in paise
      //     notes: {
      //       reason: request.reason,
      //       refundedBy: request.refundedBy
      //     }
      //   }
      // );

      // Simulate Razorpay refund
      const refundId = `rfnd_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
      const isValid = Math.random() > 0.1; // 90% success rate

      if (isValid) {
        return {
          success: true,
          refundId,
          amount: request.amount,
          status: 'success',
          gatewayResponse: {
            id: refundId,
            amount: request.amount * 100,
            status: 'processed',
            notes: {
              reason: request.reason,
              refundedBy: request.refundedBy
            }
          }
        };
      } else {
        return {
          success: false,
          error: 'Refund processing failed',
          gatewayResponse: { error: 'Refund failed' }
        };
      }
    } catch (error: any) {
      return {
        success: false,
        error: error?.message || 'Unknown error occurred',
        gatewayResponse: { error: error.message }
      };
    }
  }

  /**
   * Process Stripe refund
   */
  private static async processStripeRefund(
    gateway: any,
    transaction: any,
    request: RefundRequest
  ): Promise<RefundResponse> {
    try {
      // In a real implementation, you would use the Stripe SDK
      // const refund = await gateway.client.refunds.create({
      //   payment_intent: transaction.gateway.transactionId,
      //   amount: request.amount * 100, // Stripe expects amount in cents
      //   reason: 'requested_by_customer',
      //   metadata: {
      //     reason: request.reason,
      //     refundedBy: request.refundedBy
      //   }
      // });

      // Simulate Stripe refund
      const refundId = `re_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
      const isValid = Math.random() > 0.1; // 90% success rate

      if (isValid) {
        return {
          success: true,
          refundId,
          amount: request.amount,
          status: 'success',
          gatewayResponse: {
            id: refundId,
            amount: request.amount * 100,
            status: 'succeeded',
            reason: 'requested_by_customer'
          }
        };
      } else {
        return {
          success: false,
          error: 'Refund processing failed',
          gatewayResponse: { error: 'Refund failed' }
        };
      }
    } catch (error: any) {
      return {
        success: false,
        error: error?.message || 'Unknown error occurred',
        gatewayResponse: { error: error.message }
      };
    }
  }

  /**
   * Get available payment gateways
   */
  static getAvailableGateways() {
    const gateways = [];
    for (const [type, gateway] of this.gateways) {
      gateways.push({
        type,
        name: gateway.name,
        features: gateway.features,
        limits: gateway.limits,
        fees: gateway.fees
      });
    }
    return gateways;
  }

  /**
   * Get gateway configuration for frontend
   */
  static getGatewayConfig(gatewayType: string) {
    const gateway = this.gateways.get(gatewayType);
    if (!gateway) {
      return null;
    }

    return {
      type: gateway.type,
      name: gateway.name,
      apiKey: gateway.configuration.apiKey,
      environment: gateway.configuration.environment,
      supportedCurrencies: gateway.configuration.supportedCurrencies,
      supportedMethods: gateway.configuration.supportedMethods,
      features: gateway.features,
      limits: gateway.limits
    };
  }
}

export default PaymentGatewayService;
