import apiClient from '../api';
// import { billingService } from './billingService'; // Unused
// PlatformSubscription types - commented out as module doesn't exist
// import { PlatformPlan, PlatformSubscription, SubscriptionRequest, SubscriptionResponse, SubscriptionStats } from '../../features/mess-owner/components/PlatformSubscription/PlatformSubscription.types';

// Temporary type definitions
export interface PlatformPlan {
  id: string;
  name: string;
  price: number;
  duration: string;
  features: string[];
}

export interface PlatformSubscription {
  id: string;
  messId: string;
  planId: string;
  status: string;
  startDate: string;
  endDate: string;
}

export interface SubscriptionRequest {
  planId: string;
  paymentMethod?: string;
}

export interface SubscriptionResponse {
  success: boolean;
  subscription?: PlatformSubscription;
  message?: string;
}

export interface SubscriptionStats {
  totalSubscriptions: number;
  activeSubscriptions: number;
  revenue: number;
}

export interface MessOwnerResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
  errors?: string[];
}

class MessOwnerService {
  // ===== Mess Management =====

  // Get mess profile
  async getMessProfile(): Promise<MessOwnerResponse<any>> {
    try {
      const response = await apiClient.get('/mess-owner/profile');
      return response.data;
    } catch (error: any) {
      console.error('Error fetching mess profile:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch mess profile');
    }
  }

  // Update mess profile
  async updateMessProfile(profileData: any): Promise<MessOwnerResponse<any>> {
    try {
      const response = await apiClient.put('/mess-owner/profile', profileData);
      return response.data;
    } catch (error: any) {
      console.error('Error updating mess profile:', error);
      throw new Error(error.response?.data?.message || 'Failed to update mess profile');
    }
  }

  // ===== Member Management =====

  // Get mess members
  async getMessMembers(): Promise<MessOwnerResponse<any[]>> {
    try {
      const response = await apiClient.get('/mess-owner/members');
      return response.data;
    } catch (error: any) {
      console.error('Error fetching mess members:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch mess members');
    }
  }

  // Get member details
  async getMemberDetails(memberId: string): Promise<MessOwnerResponse<any>> {
    try {
      const response = await apiClient.get(`/mess-owner/members/${memberId}`);
      return response.data;
    } catch (error: any) {
      // Gracefully handle missing route (404) by returning a safe object
      const status = error?.response?.status;
      const message = error?.response?.data?.message || 'Failed to fetch member details';
      if (status === 404) {
        return { success: false, message, data: null } as MessOwnerResponse<any>;
      }
      // For other errors, still return a failure response to avoid unhandled throw
      return { success: false, message, data: null } as MessOwnerResponse<any>;
    }
  }

  // Update member status
  async updateMemberStatus(memberId: string, status: string): Promise<MessOwnerResponse<any>> {
    try {
      const response = await apiClient.put(`/mess-owner/members/${memberId}/status`, { status });
      return response.data;
    } catch (error: any) {
      console.error('Error updating member status:', error);
      throw new Error(error.response?.data?.message || 'Failed to update member status');
    }
  }

  // ===== Meal Plan Management =====

  // Get mess meal plans
  async getMealPlans(): Promise<MessOwnerResponse<any[]>> {
    try {
      const response = await apiClient.get('/mess-owner/meal-plans');
      return response.data;
    } catch (error: any) {
      console.error('Error fetching meal plans:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch meal plans');
    }
  }

  // Create meal plan
  async createMealPlan(planData: any): Promise<MessOwnerResponse<any>> {
    try {
      const response = await apiClient.post('/mess-owner/meal-plans', planData);
      return response.data;
    } catch (error: any) {
      console.error('Error creating meal plan:', error);
      throw new Error(error.response?.data?.message || 'Failed to create meal plan');
    }
  }

  // Update meal plan
  async updateMealPlan(planId: string, planData: any): Promise<MessOwnerResponse<any>> {
    try {
      const response = await apiClient.put(`/mess-owner/meal-plans/${planId}`, planData);
      return response.data;
    } catch (error: any) {
      console.error('Error updating meal plan:', error);
      throw new Error(error.response?.data?.message || 'Failed to update meal plan');
    }
  }

  // Delete meal plan
  async deleteMealPlan(planId: string): Promise<MessOwnerResponse<any>> {
    try {
      const response = await apiClient.delete(`/mess-owner/meal-plans/${planId}`);
      return response.data;
    } catch (error: any) {
      console.error('Error deleting meal plan:', error);
      throw new Error(error.response?.data?.message || 'Failed to delete meal plan');
    }
  }

  // ===== Billing Management =====
  // Note: Billing methods are now handled directly by billingService
  // Use billingService.getMessOwnerBillingData(), billingService.sendPaymentReminder(), etc.

  // ===== Leave Management =====

  // Get leave requests
  async getLeaveRequests(): Promise<MessOwnerResponse<any[]>> {
    try {
      const response = await apiClient.get('/mess-owner/leave-requests');
      return response.data;
    } catch (error: any) {
      console.error('Error fetching leave requests:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch leave requests');
    }
  }

  // Approve leave request
  async approveLeaveRequest(leaveId: string): Promise<MessOwnerResponse<any>> {
    try {
      const response = await apiClient.put(`/mess-owner/leave-requests/${leaveId}/approve`);
      return response.data;
    } catch (error: any) {
      console.error('Error approving leave request:', error);
      throw new Error(error.response?.data?.message || 'Failed to approve leave request');
    }
  }

  // Reject leave request
  async rejectLeaveRequest(leaveId: string, reason: string): Promise<MessOwnerResponse<any>> {
    try {
      const response = await apiClient.put(`/mess-owner/leave-requests/${leaveId}/reject`, { reason });
      return response.data;
    } catch (error: any) {
      console.error('Error rejecting leave request:', error);
      throw new Error(error.response?.data?.message || 'Failed to reject leave request');
    }
  }

  // ===== Notifications =====

  // Get notifications
  async getNotifications(): Promise<MessOwnerResponse<any[]>> {
    try {
      const response = await apiClient.get('/mess-owner/notifications');
      return response.data;
    } catch (error: any) {
      console.error('Error fetching notifications:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch notifications');
    }
  }

  // Mark notification as read
  async markNotificationAsRead(notificationId: string): Promise<MessOwnerResponse<any>> {
    try {
      const response = await apiClient.put(`/mess-owner/notifications/${notificationId}/read`);
      return response.data;
    } catch (error: any) {
      console.error('Error marking notification as read:', error);
      throw new Error(error.response?.data?.message || 'Failed to mark notification as read');
    }
  }

  // ===== Analytics =====

  // Get mess analytics
  async getMessAnalytics(): Promise<MessOwnerResponse<any>> {
    try {
      const response = await apiClient.get('/mess-owner/analytics');
      return response.data;
    } catch (error: any) {
      console.error('Error fetching mess analytics:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch mess analytics');
    }
  }

  // Get revenue analytics
  async getRevenueAnalytics(startDate?: string, endDate?: string): Promise<MessOwnerResponse<any>> {
    try {
      const response = await apiClient.get('/mess-owner/analytics/revenue', {
        params: { startDate, endDate }
      });
      return response.data;
    } catch (error: any) {
      console.error('Error fetching revenue analytics:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch revenue analytics');
    }
  }

  // ===== Settings =====

  // Get mess settings
  async getMessSettings(): Promise<MessOwnerResponse<any>> {
    try {
      const response = await apiClient.get('/mess-owner/settings');
      return response.data;
    } catch (error: any) {
      console.error('Error fetching mess settings:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch mess settings');
    }
  }

  // Update mess settings
  async updateMessSettings(settings: any): Promise<MessOwnerResponse<any>> {
    try {
      const response = await apiClient.put('/mess-owner/settings', settings);
      return response.data;
    } catch (error: any) {
      console.error('Error updating mess settings:', error);
      throw new Error(error.response?.data?.message || 'Failed to update mess settings');
    }
  }

  // ===== Platform Subscription Management =====

  // Get available platform plans
  async getPlatformPlans(): Promise<MessOwnerResponse<PlatformPlan[]>> {
    try {
      const response = await apiClient.get('/platform-subscription/plans');
      return response.data;
    } catch (error: any) {
      console.error('Error fetching platform plans:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch platform plans');
    }
  }

  // Get platform subscription details
  async getPlatformSubscription(messId: string): Promise<MessOwnerResponse<PlatformSubscription>> {
    try {
      const response = await apiClient.get(`/platform-subscription/${messId}`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching platform subscription:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch platform subscription');
    }
  }

  // Create platform subscription
  async createPlatformSubscription(messId: string, request: SubscriptionRequest): Promise<SubscriptionResponse> {
    try {
      const response = await apiClient.post(`/platform-subscription/${messId}/subscribe`, request);
      return response.data;
    } catch (error: any) {
      console.error('Error creating platform subscription:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to create subscription'
      };
    }
  }

  // Cancel platform subscription
  async cancelPlatformSubscription(subscriptionId: string, reason: string): Promise<MessOwnerResponse<boolean>> {
    try {
      const response = await apiClient.post(`/platform-subscription/${subscriptionId}/cancel`, { reason });
      return response.data;
    } catch (error: any) {
      console.error('Error cancelling platform subscription:', error);
      throw new Error(error.response?.data?.message || 'Failed to cancel subscription');
    }
  }

  // Update platform subscription usage
  async updatePlatformSubscriptionUsage(subscriptionId: string, usage: Record<string, unknown>): Promise<MessOwnerResponse<boolean>> {
    try {
      const response = await apiClient.put(`/platform-subscription/${subscriptionId}/usage`, usage);
      return response.data;
    } catch (error: any) {
      console.error('Error updating platform subscription usage:', error);
      throw new Error(error.response?.data?.message || 'Failed to update usage');
    }
  }

  // Get platform subscription stats
  async getPlatformSubscriptionStats(): Promise<MessOwnerResponse<SubscriptionStats>> {
    try {
      const response = await apiClient.get('/platform-subscription/stats');
      return response.data;
    } catch (error: any) {
      console.error('Error fetching platform subscription stats:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch subscription stats');
    }
  }
}

export default new MessOwnerService();
