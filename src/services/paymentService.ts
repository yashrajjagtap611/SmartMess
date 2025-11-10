import apiClient from './api';
import { ApiResponse } from '@/types/api';

// Declare Razorpay globally for TypeScript
declare global {
  interface Window {
    Razorpay: any;
  }
}

export interface RazorpayConfig {
  keyId: string;
  currency: string;
}

export interface PaymentOrder {
  orderId: string;
  amount: number;
  currency: string;
  keyId: string;
  plan: {
    id: string;
    name: string;
    price: number;
    baseCredits: number;
    bonusCredits: number;
    totalCredits: number;
  };
}

export interface PaymentTransaction {
  _id: string;
  messId: string;
  userId: string;
  planId: string;
  orderId: string;
  paymentId?: string;
  signature?: string;
  amount: number;
  currency: string;
  credits: number;
  bonusCredits: number;
  totalCredits: number;
  status: 'created' | 'pending' | 'success' | 'failed' | 'refunded';
  paymentMethod?: string;
  errorCode?: string;
  errorDescription?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaymentResult {
  success: boolean;
  message: string;
  creditsAdded?: number;
  transaction?: PaymentTransaction;
}

class PaymentService {
  private razorpayLoaded: boolean = false;

  /**
   * Load Razorpay checkout script
   */
  async loadRazorpayScript(): Promise<boolean> {
    if (this.razorpayLoaded) {
      return true;
    }

    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => {
        this.razorpayLoaded = true;
        resolve(true);
      };
      script.onerror = () => {
        console.error('Failed to load Razorpay SDK');
        resolve(false);
      };
      document.body.appendChild(script);
    });
  }

  /**
   * Get Razorpay configuration
   */
  async getRazorpayConfig(): Promise<ApiResponse<RazorpayConfig>> {
    try {
      const response = await apiClient.get('/razorpay/config');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to get payment configuration');
    }
  }

  /**
   * Create payment order
   */
  async createOrder(planId: string): Promise<ApiResponse<PaymentOrder>> {
    try {
      const response = await apiClient.post('/razorpay/create-order', { planId });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to create payment order');
    }
  }

  /**
   * Verify payment
   */
  async verifyPayment(params: {
    orderId: string;
    paymentId: string;
    signature: string;
  }): Promise<ApiResponse<PaymentResult>> {
    try {
      const response = await apiClient.post('/razorpay/verify', params);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Payment verification failed');
    }
  }

  /**
   * Get transaction details
   */
  async getTransaction(orderId: string): Promise<ApiResponse<PaymentTransaction>> {
    try {
      const response = await apiClient.get(`/razorpay/transaction/${orderId}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to get transaction details');
    }
  }

  /**
   * Get payment history
   */
  async getPaymentHistory(page: number = 1, limit: number = 20): Promise<ApiResponse<{
    transactions: PaymentTransaction[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }>> {
    try {
      const response = await apiClient.get('/razorpay/history', {
        params: { page, limit }
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to get payment history');
    }
  }

  /**
   * Initialize Razorpay payment
   */
  async initializePayment(params: {
    order: PaymentOrder;
    userDetails: {
      name: string;
      email: string;
      contact: string;
    };
    onSuccess: (response: any) => void;
    onFailure: (error: any) => void;
  }): Promise<void> {
    const { order, userDetails, onSuccess, onFailure } = params;

    // Load Razorpay script if not already loaded
    const loaded = await this.loadRazorpayScript();
    if (!loaded) {
      onFailure(new Error('Failed to load payment gateway'));
      return;
    }

    const options = {
      key: order.keyId,
      amount: order.amount,
      currency: order.currency,
      name: 'SmartMess',
      description: `Purchase ${order.plan.name}`,
      order_id: order.orderId,
      handler: async (response: any) => {
        try {
          // Verify payment on server
          const verifyResponse = await this.verifyPayment({
            orderId: response.razorpay_order_id,
            paymentId: response.razorpay_payment_id,
            signature: response.razorpay_signature
          });

          if (verifyResponse.success) {
            onSuccess(verifyResponse.data);
          } else {
            onFailure(new Error(verifyResponse.message || 'Payment verification failed'));
          }
        } catch (error) {
          onFailure(error);
        }
      },
      prefill: {
        name: userDetails.name,
        email: userDetails.email,
        contact: userDetails.contact
      },
      notes: {
        planName: order.plan.name,
        credits: order.plan.totalCredits
      },
      theme: {
        color: '#3b82f6'
      },
      modal: {
        ondismiss: () => {
          onFailure(new Error('Payment cancelled by user'));
        }
      }
    };

    const razorpay = new window.Razorpay(options);
    razorpay.open();
  }

  /**
   * Purchase credits with Razorpay
   */
  async purchaseCredits(params: {
    planId: string;
    userDetails: {
      name: string;
      email: string;
      contact: string;
    };
  }): Promise<PaymentResult> {
    return new Promise(async (resolve, reject) => {
      try {
        // Create order
        const orderResponse = await this.createOrder(params.planId);
        if (!orderResponse.success || !orderResponse.data) {
          throw new Error('Failed to create payment order');
        }

        const order = orderResponse.data;

        // Initialize payment
        await this.initializePayment({
          order,
          userDetails: params.userDetails,
          onSuccess: (result) => {
            resolve(result);
          },
          onFailure: (error) => {
            reject(error);
          }
        });
      } catch (error: any) {
        reject(error);
      }
    });
  }
}

export const paymentService = new PaymentService();


