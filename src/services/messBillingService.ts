import apiClient from './api';
import { ApiResponse } from '@/types/api';

export interface MessCredits {
  _id: string;
  messId: string;
  totalCredits: number;
  usedCredits: number;
  availableCredits: number;
  lastBillingDate?: Date;
  nextBillingDate?: Date;
  isTrialActive: boolean;
  trialStartDate?: Date;
  trialEndDate?: Date;
  trialCreditsUsed: number;
  monthlyUserCount: number;
  lastUserCountUpdate: Date;
  status: 'active' | 'suspended' | 'trial' | 'expired';
  autoRenewal: boolean;
  lastBillingAmount?: number;
  pendingBillAmount?: number;
  lowCreditThreshold: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreditTransaction {
  _id: string;
  messId: string;
  type: 'purchase' | 'deduction' | 'adjustment' | 'bonus' | 'refund';
  amount: number;
  description: string;
  referenceId?: string;
  balanceBefore: number;
  balanceAfter: number;
  createdBy?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface BillingDetails {
  credits: MessCredits;
  recentTransactions: CreditTransaction[];
  currentUserCount: number;
  nextBillingAmount: number;
}

export interface MonthlyBillResult {
  success: boolean;
  creditsDeducted: number;
  remainingCredits: number;
  message: string;
}

export interface CreditUsageReport {
  totalCreditsUsed: number;
  transactionsByType: {
    type: string;
    count: number;
    totalAmount: number;
  }[];
  transactions: CreditTransaction[];
}

class MessBillingService {
  /**
   * Get billing details for a mess
   */
  async getBillingDetails(messId: string): Promise<ApiResponse<BillingDetails>> {
    try {
      const response = await apiClient.get(`/mess-billing/${messId}/details`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch billing details');
    }
  }

  /**
   * Process monthly bill for a mess
   */
  async processMonthlyBill(messId: string): Promise<ApiResponse<MonthlyBillResult>> {
    try {
      const response = await apiClient.post(`/mess-billing/${messId}/process-bill`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to process monthly bill');
    }
  }

  /**
   * Toggle auto-renewal for a mess
   */
  async toggleAutoRenewal(messId: string, enabled: boolean): Promise<ApiResponse<MessCredits>> {
    try {
      const response = await apiClient.put(`/mess-billing/${messId}/toggle-auto-renewal`, { enabled });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to toggle auto-renewal');
    }
  }

  /**
   * Check if mess has sufficient credits for user addition
   */
  async checkCreditsForUserAddition(messId: string): Promise<ApiResponse<{
    hasEnoughCredits: boolean;
    currentCredits: number;
    requiredCredits: number;
    message: string;
  }>> {
    try {
      const response = await apiClient.get(`/mess-billing/${messId}/check-user-addition-credits`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to check credits');
    }
  }

  /**
   * Get credit usage report
   */
  async getCreditUsageReport(
    messId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<ApiResponse<CreditUsageReport>> {
    try {
      const params: any = {};
      if (startDate) params.startDate = startDate.toISOString();
      if (endDate) params.endDate = endDate.toISOString();
      
      const response = await apiClient.get(`/mess-billing/${messId}/credit-usage-report`, { params });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch usage report');
    }
  }

  /**
   * Get billing history
   */
  async getBillingHistory(
    messId: string,
    limit: number = 10,
    skip: number = 0
  ): Promise<ApiResponse<CreditTransaction[]>> {
    try {
      const response = await apiClient.get(`/mess-billing/${messId}/billing-history`, {
        params: { limit, skip }
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch billing history');
    }
  }
}

export const messBillingService = new MessBillingService();

