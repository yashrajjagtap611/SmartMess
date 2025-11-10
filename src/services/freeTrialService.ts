import apiClient from './api';
import { ApiResponse } from '@/types/api';

export interface TrialAvailability {
  available: boolean;
  reason?: string;
  trialDurationDays?: number;
  trialStartDate?: Date;
  trialEndDate?: Date;
  isTrialActive?: boolean;
}

export interface TrialActivationResult {
  trialStartDate: Date;
  trialEndDate: Date;
  trialDurationDays: number;
  isTrialActive: boolean;
  status: string;
}

class FreeTrialService {
  /**
   * Check if free trial is available
   */
  async checkAvailability(): Promise<ApiResponse<TrialAvailability>> {
    try {
      const response = await apiClient.get('/free-trial/check-availability');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to check trial availability');
    }
  }

  /**
   * Activate free trial
   */
  async activateTrial(): Promise<ApiResponse<TrialActivationResult>> {
    try {
      const response = await apiClient.post('/free-trial/activate');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to activate free trial');
    }
  }
}

export const freeTrialService = new FreeTrialService();


