// Centralized API service for LeaveManagement
import { useAuth } from './useAuth';

export class LeaveManagementAPI {
  private baseURL = '/api/mess';
  private auth: ReturnType<typeof useAuth>;

  constructor() {
    this.auth = useAuth();
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    try {
      const { checkMessOwnerRole, getAuthHeaders } = this.auth;
      
      // Check authentication
      const authCheck = checkMessOwnerRole();
      if (!authCheck.isValid) {
        throw new Error(authCheck.error || 'Authentication failed');
      }

      const response = await fetch(`${this.baseURL}${endpoint}`, {
        ...options,
        headers: {
          ...getAuthHeaders(),
          ...options.headers
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Authentication required. Please login again.');
        }
        if (response.status === 403) {
          throw new Error('Access denied. This feature is only available for mess owners.');
        }
        if (response.status === 500) {
          throw new Error('Server error. Please try again later.');
        }
        
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Leave Requests API
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

    return this.makeRequest(`/leave-requests?${queryParams}`);
  }

  async getLeaveStats() {
    return this.makeRequest('/leave-requests/stats');
  }

  async getLeaveRequestById(id: string) {
    return this.makeRequest(`/leave-requests/${id}`);
  }

  async processLeaveRequest(requestId: string, action: any) {
    return this.makeRequest(`/leave-requests/${requestId}/action`, {
      method: 'POST',
      body: JSON.stringify(action)
    });
  }

  async processExtensionRequest(requestId: string, extensionId: string, action: any) {
    return this.makeRequest(`/leave-requests/${requestId}/extension/${extensionId}/action`, {
      method: 'POST',
      body: JSON.stringify(action)
    });
  }

  // Mess Off Days API
  async getMessOffDays(page = 1, filters?: any) {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: '10'
    });

    if (filters?.dateFilter && filters.dateFilter !== 'all') {
      queryParams.append('dateFilter', filters.dateFilter);
    }

    return this.makeRequest(`/off-days?${queryParams}`);
  }

  async getMessOffDayStats() {
    return this.makeRequest('/off-days/stats');
  }

  async createMessOffDay(formData: any) {
    return this.makeRequest('/off-days', {
      method: 'POST',
      body: JSON.stringify(formData)
    });
  }

  async updateMessOffDay(requestId: string, data: any) {
    return this.makeRequest(`/off-days/${requestId}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async deleteMessOffDay(requestId: string, announcementData?: { sendAnnouncement?: boolean; announcementMessage?: string }) {
    const options: RequestInit = {
      method: 'DELETE'
    };
    
    if (announcementData) {
      options.body = JSON.stringify(announcementData);
      options.headers = {
        'Content-Type': 'application/json'
      };
    }
    
    return this.makeRequest(`/off-days/${requestId}`, options);
  }

  async getMessOffDayById(requestId: string) {
    return this.makeRequest(`/off-days/${requestId}`);
  }

  async getMessOffDayHistory(requestId: string) {
    return this.makeRequest(`/off-days/${requestId}/history`);
  }

  // Default Off Day Settings API
  async getDefaultOffDaySettings() {
    return this.makeRequest('/off-day-settings');
  }

  async saveDefaultOffDaySettings(settings: any) {
    return this.makeRequest('/off-day-settings', {
      method: 'POST',
      body: JSON.stringify(settings)
    });
  }
}

// Singleton instance
export const leaveManagementAPI = new LeaveManagementAPI();
