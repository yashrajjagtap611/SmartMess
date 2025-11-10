import apiClient from '@/services/api';
import type { 
  AuthResponse, 
  LoginRequest, 
  RegisterRequest, 
  ForgotPasswordRequest,
  ResetPasswordRequest,
  OtpVerificationRequest 
} from '@/types/auth.types';
import { ENDPOINTS } from '@/constants/api';

class AuthService {
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    try {
      const response = await apiClient.post(ENDPOINTS.AUTH.LOGIN, credentials);
      const { token, user } = response.data.data;
      
      if (token) {
        this.setAuthData(token, user);
      }
      
      return response.data;
    } catch (error: any) {
      this.handleAuthError(error);
    }
  }

  async register(userData: RegisterRequest): Promise<AuthResponse> {
    try {
      const response = await apiClient.post(ENDPOINTS.AUTH.REGISTER, userData);
      return response.data;
    } catch (error: any) {
      this.handleAuthError(error);
    }
  }

  async sendRegistrationOtp(email: string): Promise<AuthResponse> {
    try {
      const response = await apiClient.post(ENDPOINTS.AUTH.SEND_OTP, { email, type: 'registration' });
      return response.data;
    } catch (error: any) {
      this.handleAuthError(error);
    }
  }

  async verifyRegistrationOtp(email: string, otp: string): Promise<AuthResponse> {
    try {
      const response = await apiClient.post(ENDPOINTS.AUTH.VERIFY_OTP, { 
        email, 
        otp,
        type: 'registration'
      } as OtpVerificationRequest);
      return response.data;
    } catch (error: any) {
      this.handleAuthError(error);
    }
  }

  async forgotPassword(email: string): Promise<AuthResponse> {
    try {
      const response = await apiClient.post(ENDPOINTS.AUTH.FORGOT_PASSWORD, { email } as ForgotPasswordRequest);
      return response.data;
    } catch (error: any) {
      this.handleAuthError(error);
    }
  }

  async verifyPasswordResetOtp(email: string, otp: string): Promise<AuthResponse> {
    try {
      const response = await apiClient.post(ENDPOINTS.AUTH.VERIFY_OTP, {
        email,
        otp,
        isPasswordReset: true
      } as OtpVerificationRequest);
      return response.data;
    } catch (error: any) {
      this.handleAuthError(error);
    }
  }

  async resetPassword(data: ResetPasswordRequest): Promise<AuthResponse> {
    try {
      const response = await apiClient.post(ENDPOINTS.AUTH.RESET_PASSWORD, data);
      return response.data;
    } catch (error: any) {
      this.handleAuthError(error);
    }
  }

  async logout(): Promise<void> {
    try {
      await apiClient.post(ENDPOINTS.AUTH.LOGOUT);
    } finally {
      this.clearAuthData();
    }
  }

  async refreshToken(): Promise<AuthResponse> {
    try {
      const response = await apiClient.post(ENDPOINTS.AUTH.REFRESH_TOKEN);
      const { token, user } = response.data.data;
      
      if (token) {
        this.setAuthData(token, user);
      }
      
      return response.data;
    } catch (error: any) {
      this.handleAuthError(error);
    }
  }

  getCurrentUserRole(): string | null {
    return localStorage.getItem('userRole');
  }

  // Mock authentication for development/testing
  mockAuthenticate(role: string): void {
    const mockUser = {
      id: 'mock-user-id',
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      role: role,
      phone: '1234567890'
    };
    
    const mockToken = 'mock-jwt-token';
    this.setAuthData(mockToken, mockUser);
  }

  getCurrentUser(): any | null {
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      try {
        return JSON.parse(userInfo);
      } catch (error) {
        console.error('Error parsing user info:', error);
        return null;
      }
    }
    return null;
  }

  isAuthenticated(): boolean {
    const token = localStorage.getItem('authToken');
    if (!token) return false;

    // If offline, allow access with stored token (offline mode)
    if (!navigator.onLine) {
      return true;
    }

    // When online, consider the user authenticated if a token exists.
    return true;
  }

  isTokenExpired(): boolean {
    // If offline, don't consider token expired
    if (!navigator.onLine) {
      return false;
    }
    
    const token = localStorage.getItem('authToken');
    const expiresAt = localStorage.getItem('authExpires');
    
    if (!token || !expiresAt) {
      return true;
    }
    
    try {
      const expirationDate = new Date(expiresAt);
      const now = new Date();
      // Add 5 minute buffer
      const bufferTime = 5 * 60 * 1000;
      return expirationDate.getTime() - now.getTime() < bufferTime;
    } catch (error) {
      console.error('Error parsing expiration date:', error);
      return true;
    }
  }

  private setAuthData(token: string, user: any): void {
    localStorage.setItem('authToken', token);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);
    localStorage.setItem('authExpires', expiresAt.toISOString());
    
    if (user?.role) {
      localStorage.setItem('userRole', user.role);
    }
    if (user) {
      localStorage.setItem('userInfo', JSON.stringify(user));
    }
  }

  private clearAuthData(): void {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userInfo');
    localStorage.removeItem('authExpires');
  }

  private handleAuthError(error: any): never {
    if (error.response?.data) {
      throw error.response.data;
    }
    throw {
      success: false,
      message: error.message || 'An unexpected error occurred',
      error: error
    };
  }
}

export const authService = new AuthService();
export default authService;
