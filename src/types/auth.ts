// Authentication Types
export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  avatar?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type UserRole = 'user' | 'mess_owner' | 'admin';

export interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, password: string) => Promise<void>;
  verifyOtp: (email: string, otp: string) => Promise<void>;
  updateProfile: (data: UpdateProfileData) => Promise<void>;
  clearError: () => void;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  phone?: string;
}

export interface UpdateProfileData {
  name?: string;
  phone?: string;
  avatar?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
}

export interface PasswordResetData {
  email: string;
  otp: string;
  newPassword: string;
}

// Session Management
export interface SessionData {
  user: User;
  token: string;
  expiresAt: number;
}

export interface TokenPayload {
  userId: string;
  email: string;
  role: UserRole;
  iat: number;
  exp: number;
} 