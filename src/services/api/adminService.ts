import apiClient from '../api';
import { billingService } from './billingService';
export interface AdminResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
  errors?: string[];
}

class AdminService {

  // ===== Dashboard Statistics =====

  // Get admin dashboard statistics
  async getDashboardStats(): Promise<AdminResponse<any>> {
    try {
      const response = await apiClient.get('/admin/dashboard/stats');
      return response.data;
    } catch (error: any) {
      console.error('Error fetching dashboard stats:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch dashboard statistics');
    }
  }

  // Get recent activity
  async getRecentActivity(): Promise<AdminResponse<any[]>> {
    try {
      const response = await apiClient.get('/admin/recent-activity');
      return response.data;
    } catch (error: any) {
      console.error('Error fetching recent activity:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch recent activity');
    }
  }

  // ===== Default Meal Plans =====

  // Get all default meal plans
  async getDefaultMealPlans(): Promise<AdminResponse<any[]>> {
    try {
      const response = await apiClient.get('/admin/default-meal-plans');
      return response.data;
    } catch (error: any) {
      console.error('Error fetching default meal plans:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch default meal plans');
    }
  }

  // Get a single default meal plan by ID
  async getDefaultMealPlan(id: string): Promise<AdminResponse<any>> {
    try {
      const response = await apiClient.get(`/admin/default-meal-plans/${id}`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching default meal plan:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch default meal plan');
    }
  }

  // Create a new default meal plan
  async createDefaultMealPlan(data: any): Promise<AdminResponse<any>> {
    try {
      const response = await apiClient.post('/admin/default-meal-plans', data);
      return response.data;
    } catch (error: any) {
      console.error('Error creating default meal plan:', error);
      throw new Error(error.response?.data?.message || 'Failed to create default meal plan');
    }
  }

  // Update an existing default meal plan
  async updateDefaultMealPlan(id: string, data: any): Promise<AdminResponse<any>> {
    try {
      const response = await apiClient.put(`/admin/default-meal-plans/${id}`, data);
      return response.data;
    } catch (error: any) {
      console.error('Error updating default meal plan:', error);
      throw new Error(error.response?.data?.message || 'Failed to update default meal plan');
    }
  }

  // Delete a default meal plan
  async deleteDefaultMealPlan(id: string): Promise<AdminResponse<any>> {
    try {
      const response = await apiClient.delete(`/admin/default-meal-plans/${id}`);
      return response.data;
    } catch (error: any) {
      console.error('Error deleting default meal plan:', error);
      throw new Error(error.response?.data?.message || 'Failed to delete default meal plan');
    }
  }

  // Generate meal plans for a specific mess
  async generateMealPlansForMess(messId: string): Promise<AdminResponse<any>> {
    try {
      const response = await apiClient.post(`/admin/default-meal-plans/generate/${messId}`);
      return response.data;
    } catch (error: any) {
      console.error('Error generating meal plans for mess:', error);
      throw new Error(error.response?.data?.message || 'Failed to generate meal plans for mess');
    }
  }

  // Generate meal plans for all messes
  async generateMealPlansForAllMesses(): Promise<AdminResponse<any>> {
    try {
      const response = await apiClient.post('/admin/default-meal-plans/generate-all');
      return response.data;
    } catch (error: any) {
      console.error('Error generating meal plans for all messes:', error);
      throw new Error(error.response?.data?.message || 'Failed to generate meal plans for all messes');
    }
  }

  // Create broadcast notification
  async createBroadcastNotification(data: any): Promise<AdminResponse<any>> {
    try {
      const response = await apiClient.post('/admin/notifications/broadcast', data);
      return response.data;
    } catch (error: any) {
      console.error('Error creating broadcast notification:', error);
      throw new Error(error.response?.data?.message || 'Failed to create broadcast notification');
    }
  }

  // ===== Billing Management =====

  // Get billing dashboard
  async getBillingDashboard(): Promise<AdminResponse<any>> {
    const result = await billingService.getBillingDashboard();
    return {
      success: result.success,
      message: result.message || (result.success ? 'Billing dashboard retrieved successfully' : 'Failed to retrieve billing dashboard'),
      data: result.data
    };
  }

  // Process subscription billing
  async processSubscriptionBilling(): Promise<AdminResponse<any>> {
    // This method doesn't exist in billingService, so we'll implement a placeholder
    try {
      // TODO: Implement subscription billing processing
      return {
        success: false,
        message: 'Subscription billing processing not yet implemented',
        data: null
      };
    } catch (error: any) {
      return {
        success: false,
        message: 'Failed to process subscription billing',
        data: null
      };
    }
  }

  // Create billing record
  async createBilling(billingData: any): Promise<AdminResponse<any>> {
    const result = await billingService.createBilling(billingData);
    return {
      success: result.success,
      message: result.message || (result.success ? 'Billing record created successfully' : 'Failed to create billing record'),
      data: result.data
    };
  }

  // Update billing status
  async updateBillingStatus(billingId: string, status: string, notes?: string): Promise<AdminResponse<any>> {
    const result = await billingService.updateBillingStatus(billingId, status, notes);
    return {
      success: result.success,
      message: result.message || (result.success ? 'Billing status updated successfully' : 'Failed to update billing status'),
      data: result.data
    };
  }

  // Get billing details
  async getBillingDetails(billingId: string): Promise<AdminResponse<any>> {
    const result = await billingService.getBillingDetails(billingId);
    return {
      success: result.success,
      message: result.message || (result.success ? 'Billing details retrieved successfully' : 'Failed to retrieve billing details'),
      data: result.data
    };
  }

  // Create subscription
  async createSubscription(_subscriptionData: any): Promise<AdminResponse<any>> {
    // This method doesn't exist in billingService
    try {
      // TODO: Implement subscription creation
      return {
        success: false,
        message: 'Subscription creation not yet implemented',
        data: null
      };
    } catch (error: any) {
      return {
        success: false,
        message: 'Failed to create subscription',
        data: null
      };
    }
  }

  // Get subscriptions
  async getSubscriptions(_filter?: any): Promise<AdminResponse<any[]>> {
    // This method doesn't exist in billingService
    try {
      // TODO: Implement subscription retrieval
      return {
        success: false,
        message: 'Subscription retrieval not yet implemented',
        data: []
      };
    } catch (error: any) {
      return {
        success: false,
        message: 'Failed to retrieve subscriptions',
        data: []
      };
    }
  }

  // Get subscription details
  async getSubscriptionDetails(_subscriptionId: string): Promise<AdminResponse<any>> {
    // This method doesn't exist in billingService
    try {
      // TODO: Implement subscription details retrieval
      return {
        success: false,
        message: 'Subscription details retrieval not yet implemented',
        data: null
      };
    } catch (error: any) {
      return {
        success: false,
        message: 'Failed to retrieve subscription details',
        data: null
      };
    }
  }

  // Activate subscription
  async activateSubscription(_subscriptionId: string): Promise<AdminResponse<any>> {
    // This method doesn't exist in billingService
    try {
      // TODO: Implement subscription activation
      return {
        success: false,
        message: 'Subscription activation not yet implemented',
        data: null
      };
    } catch (error: any) {
      return {
        success: false,
        message: 'Failed to activate subscription',
        data: null
      };
    }
  }

  // Pause subscription
  async pauseSubscription(_subscriptionId: string, _reason: string): Promise<AdminResponse<any>> {
    // This method doesn't exist in billingService
    try {
      // TODO: Implement subscription pausing
      return {
        success: false,
        message: 'Subscription pausing not yet implemented',
        data: null
      };
    } catch (error: any) {
      return {
        success: false,
        message: 'Failed to pause subscription',
        data: null
      };
    }
  }

  // Resume subscription
  async resumeSubscription(_subscriptionId: string): Promise<AdminResponse<any>> {
    // This method doesn't exist in billingService
    try {
      // TODO: Implement subscription resuming
      return {
        success: false,
        message: 'Subscription resuming not yet implemented',
        data: null
      };
    } catch (error: any) {
      return {
        success: false,
        message: 'Failed to resume subscription',
        data: null
      };
    }
  }

  // Cancel subscription
  async cancelSubscription(_subscriptionId: string, _reason: string): Promise<AdminResponse<any>> {
    // This method doesn't exist in billingService
    try {
      // TODO: Implement subscription cancellation
      return {
        success: false,
        message: 'Subscription cancellation not yet implemented',
        data: null
      };
    } catch (error: any) {
      return {
        success: false,
        message: 'Failed to cancel subscription',
        data: null
      };
    }
  }

  // Process refund
  async processRefund(transactionId: string, amount: number, reason: string): Promise<AdminResponse<any>> {
    const result = await billingService.processRefund(transactionId, amount, reason);
    return {
      success: result.success,
      message: result.message || (result.success ? 'Refund processed successfully' : 'Failed to process refund'),
      data: result.data
    };
  }

  // Get payment history
  async getPaymentHistory(userId?: string, messId?: string): Promise<AdminResponse<any[]>> {
    const result = await billingService.getPaymentHistory(userId, messId);
    return {
      success: result.success,
      message: result.message || (result.success ? 'Payment history retrieved successfully' : 'Failed to retrieve payment history'),
      data: result.data || []
    };
  }

  // Get overdue payments
  async getOverduePayments(): Promise<AdminResponse<any[]>> {
    const result = await billingService.getOverduePayments();
    return {
      success: result.success,
      message: result.message || (result.success ? 'Overdue payments retrieved successfully' : 'Failed to retrieve overdue payments'),
      data: result.data || []
    };
  }

  // ===== Platform Subscription Management =====

  // Get platform subscriptions
  async getPlatformSubscriptions(filter?: any): Promise<AdminResponse<any[]>> {
    try {
      const response = await apiClient.get('/platform-subscription/list', { params: filter });
      return response.data;
    } catch (error: any) {
      console.error('Error fetching platform subscriptions:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch platform subscriptions');
    }
  }

  // Get platform subscription details
  async getPlatformSubscriptionDetails(id: string): Promise<AdminResponse<any>> {
    try {
      const response = await apiClient.get(`/platform-subscription/${id}`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching platform subscription details:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch platform subscription details');
    }
  }

  // Activate platform subscription
  async activatePlatformSubscription(id: string): Promise<AdminResponse<any>> {
    try {
      const response = await apiClient.put(`/platform-subscription/${id}/activate`);
      return response.data;
    } catch (error: any) {
      console.error('Error activating platform subscription:', error);
      throw new Error(error.response?.data?.message || 'Failed to activate platform subscription');
    }
  }

  // Cancel platform subscription
  async cancelPlatformSubscription(id: string, reason: string, refundAmount?: number): Promise<AdminResponse<any>> {
    try {
      const response = await apiClient.put(`/platform-subscription/${id}/cancel`, {
        reason,
        refundAmount
      });
      return response.data;
    } catch (error: any) {
      console.error('Error cancelling platform subscription:', error);
      throw new Error(error.response?.data?.message || 'Failed to cancel platform subscription');
    }
  }

  // Get platform plans
  async getPlatformPlans(filter?: any): Promise<AdminResponse<any[]>> {
    try {
      const response = await apiClient.get('/platform-subscription/plans', { params: filter });
      return response.data;
    } catch (error: any) {
      console.error('Error fetching platform plans:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch platform plans');
    }
  }

  // Get platform plan details
  async getPlatformPlanDetails(id: string): Promise<AdminResponse<any>> {
    try {
      const response = await apiClient.get(`/platform-subscription/plans/${id}`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching platform plan details:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch platform plan details');
    }
  }

  // Create platform plan
  async createPlatformPlan(planData: any): Promise<AdminResponse<any>> {
    try {
      const response = await apiClient.post('/platform-subscription/plans/create', planData);
      return response.data;
    } catch (error: any) {
      console.error('Error creating platform plan:', error);
      throw new Error(error.response?.data?.message || 'Failed to create platform plan');
    }
  }

  // Update platform plan
  async updatePlatformPlan(id: string, planData: any): Promise<AdminResponse<any>> {
    try {
      const response = await apiClient.put(`/platform-subscription/plans/${id}`, planData);
      return response.data;
    } catch (error: any) {
      console.error('Error updating platform plan:', error);
      throw new Error(error.response?.data?.message || 'Failed to update platform plan');
    }
  }

  // Delete platform plan
  async deletePlatformPlan(id: string): Promise<AdminResponse<any>> {
    try {
      const response = await apiClient.delete(`/platform-subscription/plans/${id}`);
      return response.data;
    } catch (error: any) {
      console.error('Error deleting platform plan:', error);
      throw new Error(error.response?.data?.message || 'Failed to delete platform plan');
    }
  }

  // Toggle platform plan status
  async togglePlatformPlanStatus(id: string, isActive: boolean): Promise<AdminResponse<any>> {
    try {
      const response = await apiClient.put(`/platform-subscription/plans/${id}/toggle`, { isActive });
      return response.data;
    } catch (error: any) {
      console.error('Error toggling platform plan status:', error);
      throw new Error(error.response?.data?.message || 'Failed to toggle platform plan status');
    }
  }

  // Get platform subscription analytics
  async getPlatformSubscriptionAnalytics(): Promise<AdminResponse<any>> {
    try {
      const response = await apiClient.get('/platform-subscription/analytics');
      return response.data;
    } catch (error: any) {
      console.error('Error fetching platform subscription analytics:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch platform subscription analytics');
    }
  }

  // Get platform subscription stats
  async getPlatformSubscriptionStats(): Promise<AdminResponse<any>> {
    try {
      const response = await apiClient.get('/platform-subscription/stats');
      return response.data;
    } catch (error: any) {
      console.error('Error fetching platform subscription stats:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch platform subscription stats');
    }
  }
}

export default new AdminService(); 