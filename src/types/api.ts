// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ErrorResponse {
  success: false;
  message: string;
  error: string;
  statusCode?: number;
}

// Auth API Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
  refreshToken?: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  role: 'user' | 'mess_owner' | 'admin';
  phone?: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
}

export interface VerifyOtpRequest {
  email: string;
  otp: string;
}

// Mess API Types
export interface MessProfileRequest {
  name: string;
  location: MessLocation;
  colleges: string[];
  ownerPhone: string;
  ownerEmail: string;
  types: string[];
  logo?: string;
}

export interface MessProfileResponse {
  id: string;
  name: string;
  location: MessLocation;
  colleges: string[];
  ownerPhone: string;
  ownerEmail: string;
  types: string[];
  logo?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MessLocation {
  street: string;
  city: string;
  district: string;
  state: string;
  pincode: string;
  country: string;
}

// User API Types
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'mess_owner' | 'admin';
  phone?: string;
  avatar?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateUserRequest {
  name?: string;
  phone?: string;
  avatar?: string;
}

// Notification API Types
export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  isRead: boolean;
  createdAt: string;
  userId: string;
}

export interface CreateNotificationRequest {
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  userId: string;
}

// Meal Plan API Types
export interface MealPlan {
  id: string;
  date: string;
  breakfast: string;
  lunch: string;
  dinner: string;
  snacks?: string;
  messId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMealPlanRequest {
  date: string;
  breakfast: string;
  lunch: string;
  dinner: string;
  snacks?: string;
}

// Payment API Types
export interface Payment {
  id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed';
  method: string;
  userId: string;
  messId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePaymentRequest {
  amount: number;
  currency: string;
  method: string;
  messId: string;
} 