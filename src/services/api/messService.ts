import apiClient from '../api';
import { billingService } from './billingService';

// Types
export interface Mess {
  id: string;
  name: string;
  description: string;
  address: string;
  ownerId: string;
  capacity: number;
  currentMembers: number;
  monthlyRate: number;
  createdAt: string;
  updatedAt: string;
}

export interface MealPlan {
  _id: string;
  messId: string;
  name: string;
  pricing: {
    amount: number;
    period: 'day' | 'week' | '15days' | 'month' | '3months' | '6months' | 'year';
  };
  mealType: string;
  mealsPerDay: number;
  mealOptions: {
    breakfast: boolean;
    lunch: boolean;
    dinner: boolean;
  };
  description: string;
  isActive: boolean;
  leaveRules: {
    maxLeaveDays: number;
    maxLeaveMeals: number;
    requireTwoHourNotice: boolean;
    noticeHours: number;
    minConsecutiveDays: number;
    extendSubscription: boolean;
    autoApproval: boolean;
    leaveLimitsEnabled: boolean;
    consecutiveLeaveEnabled: boolean;
    maxLeaveDaysEnabled: boolean;
    maxLeaveMealsEnabled: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Billing {
  id: string;
  userId: string;
  messId: string;
  amount: number;
  dueDate: string;
  paidDate?: string;
  status: 'pending' | 'paid' | 'overdue';
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface MessMember {
  id: string;
  userId: string;
  messId: string;
  joinDate: string;
  status: 'active' | 'inactive' | 'suspended';
  mealPlanId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MessResponse {
  success: boolean;
  message: string;
  data?: any;
  errors?: string[];
}

export interface OperatingHour {
  meal: string;
  enabled: boolean;
  start: string;
  end: string;
}

export interface PaymentSettings {
  upiId: string;
  bankAccount: string;
  autoPayment: boolean;
  lateFee: boolean;
  lateFeeAmount: number;
  isCashPayment: boolean;
}

// Mess Service
class MessService {
  // Mess Owner Operations
  
  // Get mess details
  async getMessDetails(): Promise<MessResponse> {
    try {
      const response = await apiClient.get('/mess/profile');
      return response.data;
    } catch (error: any) {
      console.error('Error fetching mess details:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch mess details');
    }
  }

  // Update mess details
  async updateMessDetails(messData: Partial<Mess>): Promise<MessResponse> {
    try {
      const response = await apiClient.put('/mess/profile', messData);
      return response.data;
    } catch (error: any) {
      console.error('Error updating mess details:', error);
      throw new Error(error.response?.data?.message || 'Failed to update mess details');
    }
  }

  // Get meal plans
  async getMealPlans(): Promise<MessResponse> {
    try {
      const response = await apiClient.get('/meal-plan');
      return response.data;
    } catch (error: any) {
      console.error('Error fetching meal plans:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch meal plans');
    }
  }

  // Get meal plan by ID
  async getMealPlanById(planId: string): Promise<MessResponse> {
    try {
      const response = await apiClient.get(`/meal-plan/${planId}`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching meal plan:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch meal plan');
    }
  }

  // Create meal plan
  async createMealPlan(mealPlanData: Partial<MealPlan>): Promise<MessResponse> {
    try {
      const response = await apiClient.post('/meal-plan', mealPlanData);
      return response.data;
    } catch (error: any) {
      console.error('Error creating meal plan:', error);
      throw new Error(error.response?.data?.message || 'Failed to create meal plan');
    }
  }

  // Update meal plan
  async updateMealPlan(planId: string, mealPlanData: Partial<MealPlan>): Promise<MessResponse> {
    try {
      const response = await apiClient.put(`/meal-plan/${planId}`, mealPlanData);
      return response.data;
    } catch (error: any) {
      console.error('Error updating meal plan:', error);
      throw new Error(error.response?.data?.message || 'Failed to update meal plan');
    }
  }

  // Delete meal plan
  async deleteMealPlan(planId: string): Promise<MessResponse> {
    try {
      const response = await apiClient.delete(`/meal-plan/${planId}`);
      return response.data;
    } catch (error: any) {
      console.error('Error deleting meal plan:', error);
      throw new Error(error.response?.data?.message || 'Failed to delete meal plan');
    }
  }

  // Get billing information
  async getBilling(): Promise<MessResponse> {
    try {
      const response = await apiClient.get('/payment-settings');
      return response.data;
    } catch (error: any) {
      console.error('Error fetching billing information:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch billing information');
    }
  }

  // Get payment settings
  async getPaymentSettings(): Promise<MessResponse> {
    try {
      const response = await apiClient.get('/payment-settings');
      return response.data;
    } catch (error: any) {
      console.error('Error fetching payment settings:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch payment settings');
    }
  }

  // Update billing information
  async updateBilling(billingData: Partial<PaymentSettings>): Promise<MessResponse> {
    try {
      const response = await apiClient.put('/payment-settings', billingData);
      return response.data;
    } catch (error: any) {
      console.error('Error updating billing information:', error);
      throw new Error(error.response?.data?.message || 'Failed to update billing information');
    }
  }

  // Update payment settings
  async updatePaymentSettings(paymentData: Partial<PaymentSettings>): Promise<MessResponse> {
    try {
      const response = await apiClient.put('/payment-settings', paymentData);
      return response.data;
    } catch (error: any) {
      console.error('Error updating payment settings:', error);
      throw new Error(error.response?.data?.message || 'Failed to update payment settings');
    }
  }

  // Get operating hours
  async getOperatingHours(): Promise<MessResponse> {
    try {
      const response = await apiClient.get('/mess/operating-hours');
      return response.data;
    } catch (error: any) {
      console.error('Error fetching operating hours:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch operating hours');
    }
  }

  // Update operating hours
  async updateOperatingHours(operatingHours: OperatingHour[]): Promise<MessResponse> {
    try {
      const response = await apiClient.put('/mess/operating-hours', { operatingHours });
      return response.data;
    } catch (error: any) {
      console.error('Error updating operating hours:', error);
      throw new Error(error.response?.data?.message || 'Failed to update operating hours');
    }
  }

  // Get notifications
  async getNotifications(): Promise<MessResponse> {
    try {
      const response = await apiClient.get('/notifications');
      return response.data;
    } catch (error: any) {
      console.error('Error fetching notifications:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch notifications');
    }
  }

  // Handle notification action (deprecated for join requests - use handleJoinRequestAction instead)
  async handleNotificationAction(notificationId: string, action: 'approve' | 'reject', remarks?: string): Promise<MessResponse> {
    try {
      const response = await apiClient.put(`/notifications/${notificationId}/action`, { action, remarks });
      return response.data;
    } catch (error: any) {
      console.error('Error handling notification action:', error);
      // Preserve error data including credit information
      const errorMessage = error.response?.data?.message || 'Failed to handle notification action';
      const errorData = error.response?.data?.data;
      const enhancedError: any = new Error(errorMessage);
      enhancedError.creditData = errorData; // Include credit info (requiredCredits, availableCredits, redirectTo)
      enhancedError.statusCode = error.response?.status;
      throw enhancedError;
    }
  }

  // Handle join request action (dedicated endpoint)
  async handleJoinRequestAction(notificationId: string, action: 'approve' | 'reject', remarks?: string): Promise<MessResponse> {
    try {
      const endpoint = action === 'approve' 
        ? `/join-requests/${notificationId}/approve`
        : `/join-requests/${notificationId}/reject`;
      const response = await apiClient.post(endpoint, { remarks });
      return response.data;
    } catch (error: any) {
      console.error('Error handling join request action:', error);
      // Preserve error data including credit information
      const errorMessage = error.response?.data?.message || 'Failed to handle join request action';
      const errorData = error.response?.data?.data;
      const enhancedError: any = new Error(errorMessage);
      enhancedError.creditData = errorData; // Include credit info (requiredCredits, availableCredits, redirectTo)
      enhancedError.statusCode = error.response?.status;
      throw enhancedError;
    }
  }

  // Mark notification as read
  async markNotificationAsRead(notificationId: string): Promise<MessResponse> {
    try {
      const response = await apiClient.put(`/notifications/${notificationId}/read`);
      return response.data;
    } catch (error: any) {
      console.error('Error marking notification as read:', error);
      throw new Error(error.response?.data?.message || 'Failed to mark notification as read');
    }
  }

  // Mark all notifications as read
  async markAllNotificationsAsRead(): Promise<MessResponse> {
    try {
      const response = await apiClient.put('/notifications/read-all');
      return response.data;
    } catch (error: any) {
      console.error('Error marking all notifications as read:', error);
      throw new Error(error.response?.data?.message || 'Failed to mark all notifications as read');
    }
  }

  // Delete notification
  async deleteNotification(notificationId: string): Promise<MessResponse> {
    try {
      const response = await apiClient.delete(`/notifications/${notificationId}`);
      return response.data;
    } catch (error: any) {
      console.error('Error deleting notification:', error);
      throw new Error(error.response?.data?.message || 'Failed to delete notification');
    }
  }

  // Get mess members (for mess owners)
  async getMessMembers(): Promise<MessResponse> {
    try {
      const response = await apiClient.get('/mess/members');
      return response.data;
    } catch (error: any) {
      // Gracefully handle missing mess profile (backend returns 404)
      const status = error?.response?.status;
      const message = error?.response?.data?.message || error?.message;
      if (status === 404 && typeof message === 'string' && message.includes('No mess profile')) {
        return { success: true, message, data: [] };
      }
      console.error('Error fetching mess members:', error);
      throw new Error(message || 'Failed to fetch mess members');
    }
  }

  // Get detailed user information (for mess owners)
  async getUserDetails(userId: string): Promise<MessResponse> {
    try {
      const response = await apiClient.get(`/mess/user/${userId}`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching user details:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch user details');
    }
  }

  // Update user status (activate/deactivate) - for mess owners
  async updateUserStatus(userId: string, isActive: boolean): Promise<MessResponse> {
    try {
      const response = await apiClient.put(`/mess/user/${userId}/status`, { isActive });
      return response.data;
    } catch (error: any) {
      console.error('Error updating user status:', error);
      throw new Error(error.response?.data?.message || 'Failed to update user status');
    }
  }

  // Update user payment status - for mess owners
  async updateUserPaymentStatus(userId: string, paymentStatus: 'Paid' | 'Pending' | 'Overdue'): Promise<MessResponse> {
    try {
      const response = await apiClient.put(`/mess/user/${userId}/payment-status`, { paymentStatus });
      return response.data;
    } catch (error: any) {
      console.error('Error updating user payment status:', error);
      throw new Error(error.response?.data?.message || 'Failed to update user payment status');
    }
  }

  // Update user plan - for mess owners (future implementation)
  async updateUserPlan(userId: string, plan: string): Promise<MessResponse> {
    try {
      const response = await apiClient.put(`/mess/user/${userId}/plan`, { plan });
      return response.data;
    } catch (error: any) {
      console.error('Error updating user plan:', error);
      throw new Error(error.response?.data?.message || 'Failed to update user plan');
    }
  }

  // Remove user from mess - for mess owners
  async removeUser(userId: string): Promise<MessResponse> {
    try {
      const response = await apiClient.delete(`/mess/user/${userId}`);
      return response.data;
    } catch (error: any) {
      console.error('Error removing user:', error);
      throw new Error(error.response?.data?.message || 'Failed to remove user');
    }
  }

  // ===== Meal Management Operations =====

  // Get all meals
  async getMeals(filters?: { date?: string; type?: string; category?: string; mealPlanId?: string }): Promise<MessResponse> {
    try {
      const params = new URLSearchParams();
      if (filters?.date) params.append('date', filters.date);
      if (filters?.type) params.append('type', filters.type);
      if (filters?.category) params.append('category', filters.category);
      if (filters?.mealPlanId) params.append('mealPlanId', filters.mealPlanId);
      
      const queryString = params.toString();
      const url = queryString ? `/meals?${queryString}` : '/meals';
      
      const response = await apiClient.get(url);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching meals:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch meals');
    }
  }

  // Get meals for a specific date
  async getMealsByDate(date: string): Promise<MessResponse> {
    try {
      const response = await apiClient.get(`/meals/date/${date}`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching meals by date:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch meals for date');
    }
  }

  // Get today's menu for user dashboard based on subscriptions
  async getTodaysMenuForUser(): Promise<MessResponse> {
    try {
      const response = await apiClient.get('/meals/user/today');
      return response.data;
    } catch (error: any) {
      console.error('Error fetching today\'s menu for user:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch today\'s menu');
    }
  }

  // Get meal by ID
  async getMealById(mealId: string): Promise<MessResponse> {
    try {
      const response = await apiClient.get(`/meals/${mealId}`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching meal:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch meal');
    }
  }

  // Create meal
  async createMeal(mealData: any): Promise<MessResponse> {
    try {
      const formData = new FormData();
      
      // Add all meal data to FormData
      Object.keys(mealData).forEach(key => {
        if (key === 'image' && mealData[key]) {
          formData.append('image', mealData[key]);
        } else if (key === 'date') {
          // Ensure date is properly formatted for backend in local timezone
          const dateValue = mealData[key] instanceof Date ? mealData[key] : new Date(mealData[key]);
          const year = dateValue.getFullYear();
          const month = String(dateValue.getMonth() + 1).padStart(2, '0');
          const day = String(dateValue.getDate()).padStart(2, '0');
          formData.append(key, `${year}-${month}-${day}`);
        } else if (typeof mealData[key] === 'object' && mealData[key] !== null) {
          formData.append(key, JSON.stringify(mealData[key]));
        } else if (mealData[key] !== undefined && mealData[key] !== null) {
          formData.append(key, mealData[key].toString());
        }
      });

      const response = await apiClient.post('/meals', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return response.data;
    } catch (error: any) {
      console.error('Error creating meal:', error);
      throw new Error(error.response?.data?.message || 'Failed to create meal');
    }
  }

  // Update meal
  async updateMeal(mealId: string, mealData: any): Promise<MessResponse> {
    try {
      const formData = new FormData();
      
      // Add all meal data to FormData
      Object.keys(mealData).forEach(key => {
        if (key === 'image' && mealData[key]) {
          formData.append('image', mealData[key]);
        } else if (key === 'date') {
          // Ensure date is properly formatted for backend in local timezone
          const dateValue = mealData[key] instanceof Date ? mealData[key] : new Date(mealData[key]);
          const year = dateValue.getFullYear();
          const month = String(dateValue.getMonth() + 1).padStart(2, '0');
          const day = String(dateValue.getDate()).padStart(2, '0');
          formData.append(key, `${year}-${month}-${day}`);
        } else if (typeof mealData[key] === 'object' && mealData[key] !== null) {
          formData.append(key, JSON.stringify(mealData[key]));
        } else if (mealData[key] !== undefined && mealData[key] !== null) {
          formData.append(key, mealData[key].toString());
        }
      });

      const response = await apiClient.put(`/meals/${mealId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error: any) {
      console.error('Error updating meal:', error);
      throw new Error(error.response?.data?.message || 'Failed to update meal');
    }
  }

  // Delete meal
  async deleteMeal(mealId: string): Promise<MessResponse> {
    try {
      const response = await apiClient.delete(`/meals/${mealId}`);
      return response.data;
    } catch (error: any) {
      console.error('Error deleting meal:', error);
      throw new Error(error.response?.data?.message || 'Failed to delete meal');
    }
  }

  // ===== User Dashboard (Student) Operations =====

  // Get user's mess details (active/pending memberships and plans)
  async getUserMessDetails(): Promise<MessResponse> {
    try {
      const response = await apiClient.get('/mess/search/user-details');
      return response.data;
    } catch (error: any) {
      console.error('Error fetching user mess details:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch user mess details');
    }
  }

  // Get available messes for user to join
  async getAvailableMesses(): Promise<MessResponse> {
    try {
      const response = await apiClient.get('/mess/search/available');
      return response.data;
    } catch (error: any) {
      console.error('Error fetching available messes:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch available messes');
    }
  }

  // Get detailed mess info by id (from available list)
  async getMessDetailsById(messId: string): Promise<MessResponse> {
    try {
      // Backend doesn't expose /mess/search/:id; fetch list and find client-side
      const list = await this.getAvailableMesses();
      if (list.success && Array.isArray(list.data)) {
        const found = list.data.find((m: any) => m.id === messId);
        return found
          ? { success: true, message: 'Mess found', data: found }
          : { success: false, message: 'Mess not found' } as MessResponse;
      }
      return { success: false, message: 'Failed to fetch mess list' } as MessResponse;
    } catch (err: any) {
      console.error('Error resolving mess details by id:', err);
      throw new Error(err.response?.data?.message || 'Failed to fetch mess details');
    }
  }

  // Join a mess with a specific meal plan
  async joinMess(messId: string, mealPlanId: string, paymentType: 'pay_now' | 'pay_later'): Promise<MessResponse> {
    try {
      const response = await apiClient.post('/mess/user-management/join', { messId, mealPlanId, paymentType });
      return response.data;
    } catch (error: any) {
      console.error('Error joining mess:', error);
      throw new Error(error.response?.data?.message || 'Failed to join mess');
    }
  }

  // Leave a mess meal plan subscription
  async leaveMess(messId: string, mealPlanId: string): Promise<MessResponse> {
    try {
      const response = await apiClient.post('/mess/user-management/leave', { messId, mealPlanId });
      return response.data;
    } catch (error: any) {
      console.error('Error leaving mess:', error);
      throw new Error(error.response?.data?.message || 'Failed to leave mess');
    }
  }

  // Get user's billing records
  async getUserBilling(): Promise<MessResponse> {
    const response = await billingService.getUserBillingData();
    return {
      success: response.success,
      message: response.message || 'Success',
      data: response.data
    };
  }

  // Pay a bill
  async payBill(billId: string, paymentMethod: 'online' | 'upi' | 'cash' = 'online'): Promise<MessResponse> {
    const response = await billingService.payBill(billId, paymentMethod);
    return {
      success: response.success,
      message: response.message || response.error || 'Success',
      data: (response as any).data
    };
  }

  // Process payment
  async processPayment(paymentRequest: any) {
    return billingService.processPayment(paymentRequest);
  }

  // Verify payment
  async verifyPayment(transactionId: string, paymentData: any) {
    return billingService.verifyPayment(transactionId, paymentData);
  }

  // Get payment gateways
  async getPaymentGateways() {
    return billingService.getPaymentGateways();
  }

  // Note: Subscription plans methods removed - subscriptions are now handled through credit management
  // Use creditManagementService for platform subscription management instead


  // Download invoice
  async downloadInvoice(billId: string) {
    return billingService.downloadInvoice(billId);
  }

  // ===== Security Settings Operations =====

  // Get security settings
  async getSecuritySettings(): Promise<MessResponse> {
    try {
      const response = await apiClient.get('/security-settings');
      return response.data;
    } catch (error: any) {
      console.error('Error fetching security settings:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch security settings');
    }
  }

  // Update security settings
  async updateSecuritySettings(settings: { privacy?: any; security?: any }): Promise<MessResponse> {
    try {
      const response = await apiClient.put('/security-settings', settings);
      return response.data;
    } catch (error: any) {
      console.error('Error updating security settings:', error);
      throw new Error(error.response?.data?.message || 'Failed to update security settings');
    }
  }

  // Update password
  async updatePassword(currentPassword: string, newPassword: string): Promise<MessResponse> {
    try {
      const response = await apiClient.put('/security-settings/password', { currentPassword, newPassword });
      return response.data;
    } catch (error: any) {
      console.error('Error updating password:', error);
      throw new Error(error.response?.data?.message || 'Failed to update password');
    }
  }
}

export default new MessService(); 