import apiClient from '../api';

export interface PaymentVerificationRequest {
  messId: string;
  mealPlanId: string;
  amount: number;
  paymentMethod: 'upi' | 'online' | 'cash';
  paymentScreenshot?: File;
}

export interface PaymentVerificationResponse {
  success: boolean;
  data: any;
  message: string;
}

export interface VerificationStats {
  pending: number;
  approved: number;
  rejected: number;
  total: number;
}

class PaymentVerificationService {
  /**
   * Create a new payment verification request
   */
  async createPaymentVerification(data: PaymentVerificationRequest): Promise<PaymentVerificationResponse> {
    const formData = new FormData();
    formData.append('messId', data.messId);
    formData.append('mealPlanId', data.mealPlanId);
    formData.append('amount', data.amount.toString());
    formData.append('paymentMethod', data.paymentMethod);
    
    if (data.paymentScreenshot) {
      formData.append('paymentScreenshot', data.paymentScreenshot);
    }

    const response = await apiClient.post('/payment-verification/create', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  }

  /**
   * Get payment verification requests for mess owner
   */
  async getMessOwnerVerificationRequests(messId: string, status?: string): Promise<PaymentVerificationResponse> {
    const params = new URLSearchParams();
    if (status) {
      params.append('status', status);
    }

    const response = await apiClient.get(`/payment-verification/mess-owner/${messId}?${params.toString()}`);
    return response.data;
  }

  /**
   * Update payment verification status
   */
  async updatePaymentVerification(
    verificationId: string, 
    status: 'approved' | 'rejected', 
    rejectionReason?: string
  ): Promise<PaymentVerificationResponse> {
    const response = await apiClient.put(`/payment-verification/${verificationId}`, {
      status,
      rejectionReason
    });

    return response.data;
  }

  /**
   * Get user's payment verification requests
   */
  async getUserVerificationRequests(): Promise<PaymentVerificationResponse> {
    const response = await apiClient.get('/payment-verification/user');
    return response.data;
  }

  /**
   * Get payment verification statistics for mess owner
   */
  async getVerificationStats(messId: string): Promise<{ success: boolean; data: VerificationStats; message: string }> {
    const response = await apiClient.get(`/payment-verification/stats/${messId}`);
    return response.data;
  }
}

export const paymentVerificationService = new PaymentVerificationService();
export default paymentVerificationService;
