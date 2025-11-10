import apiClient from './api';
import { ApiResponse } from '@/types/api';

export interface SubscriptionStatus {
  isActive: boolean;
  isTrialActive: boolean;
  isExpired: boolean;
  hasCredits: boolean;
  availableCredits: number;
  message?: string;
}

export interface ModuleAccessCheck {
  module: string;
  allowed: boolean;
  reason?: string;
}

class SubscriptionCheckService {
  /**
   * Get current subscription status
   */
  async getSubscriptionStatus(): Promise<ApiResponse<SubscriptionStatus>> {
    try {
      const response = await apiClient.get('/subscription-check/status');
      return response.data;
    } catch (error: any) {
      // Handle network errors gracefully (backend not available)
      if (error.code === 'ERR_NETWORK' || error.code === 'ECONNREFUSED' || error.message?.includes('Network Error')) {
        console.warn('Subscription check service unavailable (backend not running)');
        // Return a default response that allows access (fail open)
        return {
          success: false,
          message: 'Subscription check service unavailable',
          data: {
            isActive: true, // Fail open - allow access when service is unavailable
            isTrialActive: false,
            isExpired: false,
            hasCredits: true,
            availableCredits: 0,
            message: 'Subscription check service unavailable'
          }
        };
      }
      // For other errors, throw as before
      throw new Error(error.response?.data?.message || 'Failed to check subscription status');
    }
  }

  /**
   * Check if can access a specific module
   */
  async checkModuleAccess(module: string): Promise<ApiResponse<ModuleAccessCheck>> {
    try {
      const response = await apiClient.get(`/subscription-check/check-module/${module}`);
      return response.data;
    } catch (error: any) {
      // Handle network errors gracefully (backend not available)
      if (error.code === 'ERR_NETWORK' || error.code === 'ECONNREFUSED' || error.message?.includes('Network Error')) {
        console.warn('Module access check unavailable (backend not running)');
        // Return a default response that allows access (fail open)
        return {
          success: false,
          message: 'Module access check unavailable',
          data: {
            module,
            allowed: true, // Fail open - allow access when service is unavailable
            reason: 'Service unavailable'
          }
        };
      }
      // For other errors, throw as before
      throw new Error(error.response?.data?.message || 'Failed to check module access');
    }
  }
}

export const subscriptionCheckService = new SubscriptionCheckService();


