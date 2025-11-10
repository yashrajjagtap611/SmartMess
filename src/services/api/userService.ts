import apiClient from '../api';

// Types
export interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: 'user' | 'mess-owner' | 'admin';
  avatar?: string;
  createdAt: string;
  updatedAt: string;
  isVerified: boolean;
  lastLogin?: string;
  status?: 'active' | 'suspended';
  address?: string;
  gender?: 'male' | 'female' | 'other';
  dob?: string;
}

export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  phone?: string;
  avatar?: string;
  address?: string;
  gender?: 'male' | 'female' | 'other';
  dob?: string;
  status?: 'active' | 'suspended';
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface UserActivity {
  type: string;
  date: string;
  description: string;
}

export interface UserResponse {
  success: boolean;
  message: string;
  data?: UserProfile;
}

export interface ActivityResponse {
  success: boolean;
  message: string;
  data?: {
    activities: UserActivity[];
  };
}

// User Service
class UserService {
  // Get user profile
  async getProfile(): Promise<UserResponse> {
    try {
      const response = await apiClient.get('/user/profile');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch profile');
    }
  }

  // Update user profile
  async updateProfile(profileData: UpdateProfileRequest): Promise<UserResponse> {
    try {
      const response = await apiClient.put('/user/profile', profileData);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update profile');
    }
  }

  // Get user activity
  async getActivity(): Promise<ActivityResponse> {
    try {
      const response = await apiClient.get('/user/activity');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch activity');
    }
  }

  // Change password
  async changePassword(passwordData: ChangePasswordRequest): Promise<UserResponse> {
    try {
      const response = await apiClient.put('/user/change-password', passwordData);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to change password');
    }
  }

  // Upload avatar
  async uploadAvatar(file: File): Promise<UserResponse> {
    try {
      const formData = new FormData();
      formData.append('avatar', file);
      
      const response = await apiClient.post('/user/profile/avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to upload avatar');
    }
  }

  // Delete account
  async deleteAccount(): Promise<UserResponse> {
    try {
      const response = await apiClient.delete('/user/account');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to delete account');
    }
  }

  // Get user notifications
  async getNotifications(): Promise<any> {
    try {
      const response = await apiClient.get('/user/notifications');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch notifications');
    }
  }

  // Mark notification as read
  async markNotificationAsRead(notificationId: string): Promise<any> {
    try {
      const response = await apiClient.put(`/user/notifications/${notificationId}/read`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to mark notification as read');
    }
  }
}

export default new UserService(); 