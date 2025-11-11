// Centralized API service for LeaveManagement
import { useAuth } from './useAuth';
import apiClient from '@/services/api';

export class LeaveManagementAPI {
  private auth: ReturnType<typeof useAuth>;

  constructor() {
    this.auth = useAuth();
  }

  private async makeRequest(endpoint: string, options: { method?: string; body?: any } = {}) {
    try {
      const { checkMessOwnerRole } = this.auth;
      
      // Check authentication
      const authCheck = checkMessOwnerRole();
      if (!authCheck.isValid) {
        throw new Error(authCheck.error || 'Authentication failed');
      }

      // Use API client instead of raw fetch
      const method = options.method || 'GET';
      let response;
      
      if (method === 'GET') {
        response = await apiClient.get(endpoint);
      } else if (method === 'POST') {
        response = await apiClient.post(endpoint, options.body);
      } else if (method === 'PUT') {
        response = await apiClient.put(endpoint, options.body);
      } else if (method === 'DELETE') {
        response = await apiClient.delete(endpoint);
      } else {
        throw new Error(`Unsupported HTTP method: ${method}`);
      }

      return response.data;
    } catch (error: any) {
      console.error('API request failed:', error);
      
      if (error.response?.status === 401) {
        throw new Error('Authentication required. Please login again.');
      }
      if (error.response?.status === 403) {
        throw new Error('Access denied. This feature is only available for mess owners.');
      }
      if (error.response?.status === 500) {
        throw new Error('Server error. Please try again later.');
      }
      
      throw new Error(error.response?.data?.message || error.message || `HTTP error! status: ${error.response?.status || 'unknown'}`);
    }
  }

  // Leave Requests API - endpoints are relative to /api/mess
  async getLeaveRequests(page = 1, filters?: any, limit?: number) {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: (limit || 10).toString()
    });

    if (filters?.dateFilter && filters.dateFilter !== 'all') {
      queryParams.append('dateFilter', filters.dateFilter);
    }
    if (filters?.status && filters.status !== 'all') {
      queryParams.append('status', filters.status);
    }
    if (filters?.search) {
      queryParams.append('search', filters.search);
    }

    return this.makeRequest(`/mess/leave-requests?${queryParams}`);
  }

  async getLeaveStats() {
    return this.makeRequest('/mess/leave-requests/stats');
  }

  async getLeaveRequestById(id: string) {
    return this.makeRequest(`/mess/leave-requests/${id}`);
  }

  async processLeaveRequest(requestId: string, action: any) {
    return this.makeRequest(`/mess/leave-requests/${requestId}/action`, {
      method: 'POST',
      body: action
    });
  }

  async processExtensionRequest(requestId: string, extensionId: string, action: any) {
    return this.makeRequest(`/mess/leave-requests/${requestId}/extension/${extensionId}/action`, {
      method: 'POST',
      body: action
    });
  }

  // Mess Off Days API - endpoints are relative to /api/mess
  async getMessOffDays(page = 1, filters?: any) {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: '10'
    });

    if (filters?.dateFilter && filters.dateFilter !== 'all') {
      queryParams.append('dateFilter', filters.dateFilter);
    }

    return this.makeRequest(`/mess/off-days?${queryParams}`);
  }

  async getMessOffDayStats() {
    return this.makeRequest('/mess/off-days/stats');
  }

  async createMessOffDay(formData: any) {
    return this.makeRequest('/mess/off-days', {
      method: 'POST',
      body: formData
    });
  }

  async updateMessOffDay(requestId: string, data: any) {
    return this.makeRequest(`/mess/off-days/${requestId}`, {
      method: 'PUT',
      body: data
    });
  }

  async deleteMessOffDay(requestId: string, announcementData?: { sendAnnouncement?: boolean; announcementMessage?: string }) {
    return this.makeRequest(`/mess/off-days/${requestId}`, {
      method: 'DELETE',
      body: announcementData
    });
  }

  async getMessOffDayById(requestId: string) {
    return this.makeRequest(`/mess/off-days/${requestId}`);
  }

  async getMessOffDayHistory(requestId: string) {
    return this.makeRequest(`/mess/off-days/${requestId}/history`);
  }

  // Default Off Day Settings API - endpoints are relative to /api/mess
  async getDefaultOffDaySettings() {
    return this.makeRequest('/mess/off-day-settings');
  }

  async saveDefaultOffDaySettings(settings: any) {
    return this.makeRequest('/mess/off-day-settings', {
      method: 'POST',
      body: settings
    });
  }
}

// Singleton instance
export const leaveManagementAPI = new LeaveManagementAPI();
