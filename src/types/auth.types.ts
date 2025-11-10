// Centralized Authentication Types
// This file contains all authentication-related type definitions

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  role: 'user' | 'mess-owner';
}

export interface OtpVerificationRequest {
  email: string;
  otp: string;
  isPasswordReset?: boolean;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  email: string;
  otp: string;
  newPassword: string;
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'user' | 'mess-owner' | 'admin';
  phone?: string;
  profilePicture?: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data?: {
    token?: string;
    user?: User;
  };
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// Additional auth-related types
export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  phone?: string;
  profilePicture?: string;
}
