import apiClient from '../api';

export interface LeaveRequest {
  _id: string;
  userId: string;
  mealPlanIds: string[];
  startDate: string;
  endDate: string;
  mealTypes: string[];
  startDateMealTypes?: string[];
  endDateMealTypes?: string[];
  reason?: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  totalDays?: number;
  totalMealsMissed?: number;
  estimatedSavings?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface GetLeaveRequestsParams {
  status?: 'pending' | 'approved' | 'rejected' | 'cancelled' | 'all';
}

export interface LeaveRequestsResponse {
  success: boolean;
  data: LeaveRequest[];
  message?: string;
}

class LeaveService {
  /**
   * Get user's leave requests
   * @param params - Optional filter parameters
   * @returns Promise with leave requests response
   */
  async getLeaveRequests(params?: GetLeaveRequestsParams): Promise<LeaveRequestsResponse> {
    try {
      const response = await apiClient.get<LeaveRequestsResponse>('/user/leave-requests');
      
      if (!response.data.success) {
        return {
          success: false,
          data: [],
          message: response.data.message || 'Failed to fetch leave requests'
        };
      }

      let leaveRequests = response.data.data || [];

      // Filter by status if provided
      if (params?.status && params.status !== 'all') {
        leaveRequests = leaveRequests.filter(
          (leave) => leave.status === params.status
        );
      }

      return {
        success: true,
        data: leaveRequests
      };
    } catch (error: any) {
      console.error('Error fetching leave requests:', error);
      return {
        success: false,
        data: [],
        message: error.response?.data?.message || error.message || 'Failed to fetch leave requests'
      };
    }
  }

  /**
   * Get a specific leave request by ID
   * @param leaveId - Leave request ID
   * @returns Promise with leave request response
   */
  async getLeaveRequest(leaveId: string): Promise<{ success: boolean; data?: LeaveRequest; message?: string }> {
    try {
      const response = await apiClient.get<{ success: boolean; data: LeaveRequest; message?: string }>(
        `/user/leave-requests/${leaveId}`
      );
      return response.data;
    } catch (error: any) {
      console.error('Error fetching leave request:', error);
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Failed to fetch leave request'
      };
    }
  }

  /**
   * Create a new leave request
   * @param leaveData - Leave request data
   * @returns Promise with created leave request response
   */
  async createLeaveRequest(leaveData: {
    mealPlanIds: string[];
    startDate: string;
    endDate: string;
    mealTypes?: string[];
    startDateMealTypes?: string[];
    endDateMealTypes?: string[];
    reason?: string;
  }): Promise<{ success: boolean; data?: LeaveRequest; message?: string }> {
    try {
      const response = await apiClient.post<{ success: boolean; data: LeaveRequest; message?: string }>(
        '/user/leave-requests',
        leaveData
      );
      return response.data;
    } catch (error: any) {
      console.error('Error creating leave request:', error);
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Failed to create leave request'
      };
    }
  }

  /**
   * Extend an existing leave request
   * @param leaveId - Leave request ID
   * @param extendData - Extension data
   * @returns Promise with extended leave request response
   */
  async extendLeaveRequest(
    leaveId: string,
    extendData: {
      newEndDate: string;
      reason?: string;
    }
  ): Promise<{ success: boolean; data?: LeaveRequest; message?: string }> {
    try {
      const response = await apiClient.post<{ success: boolean; data: LeaveRequest; message?: string }>(
        `/user/leave-requests/${leaveId}/extend`,
        extendData
      );
      return response.data;
    } catch (error: any) {
      console.error('Error extending leave request:', error);
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Failed to extend leave request'
      };
    }
  }

  /**
   * Cancel a leave request
   * @param leaveId - Leave request ID
   * @returns Promise with cancellation response
   */
  async cancelLeaveRequest(leaveId: string): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await apiClient.delete<{ success: boolean; message?: string }>(
        `/user/leave-requests/${leaveId}`
      );
      return response.data;
    } catch (error: any) {
      console.error('Error cancelling leave request:', error);
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Failed to cancel leave request'
      };
    }
  }

  /**
   * Get leave statistics summary
   * @returns Promise with leave statistics
   */
  async getLeaveStats(): Promise<{ success: boolean; data?: any; message?: string }> {
    try {
      const response = await apiClient.get<{ success: boolean; data: any; message?: string }>(
        '/user/leave-requests/stats/summary'
      );
      return response.data;
    } catch (error: any) {
      console.error('Error fetching leave stats:', error);
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Failed to fetch leave statistics'
      };
    }
  }
}

// Export a singleton instance
const leaveService = new LeaveService();
export default leaveService;

