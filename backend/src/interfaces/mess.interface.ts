import { Request } from 'express';

export interface IMessProfile {
  _id: string;
  ownerId: string;
  name: string;
  description?: string;
  address: string;
  phone: string;
  email: string;
  logo?: string;
  photos?: string[];
  location?: {
    latitude: number;
    longitude: number;
    address: string;
    street?: string;
    city?: string;
    district?: string;
    state?: string;
    pincode?: string;
    country?: string;
  };
  colleges?: string[];
  ownerPhone?: string;
  ownerEmail?: string;
  types?: string[];
  operatingHours: {
    open: string;
    close: string;
  };
  mealPlan: {
    breakfast: boolean;
    lunch: boolean;
    dinner: boolean;
  };
  pricing: {
    monthly: number;
    daily?: number;
  };
  capacity: number;
  currentMembers: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IMessMembership {
  _id: string;
  userId: string;
  messId: string;
  status: 'pending' | 'active' | 'inactive' | 'cancelled';
  startDate: Date;
  endDate?: Date;
  mealPlan: {
    breakfast: boolean;
    lunch: boolean;
    dinner: boolean;
  };
  paymentStatus: 'pending' | 'paid' | 'overdue';
  createdAt: Date;
  updatedAt: Date;
}

export interface ICreateMessProfileRequest {
  name: string;
  description?: string;
  address: string;
  phone: string;
  email: string;
  operatingHours: {
    open: string;
    close: string;
  };
  mealPlan: {
    breakfast: boolean;
    lunch: boolean;
    dinner: boolean;
  };
  pricing: {
    monthly: number;
    daily?: number;
  };
  capacity: number;
}

export interface IUpdateMessProfileRequest {
  name?: string;
  description?: string;
  address?: string;
  phone?: string;
  email?: string;
  operatingHours?: {
    open: string;
    close: string;
  };
  mealPlan?: {
    breakfast: boolean;
    lunch: boolean;
    dinner: boolean;
  };
  pricing?: {
    monthly: number;
    daily?: number;
  };
  capacity?: number;
}

export interface IMessPhotoRequest {
  messId: string;
  photo: Express.Multer.File;
}

export interface IMessSearchRequest {
  location?: string;
  priceRange?: {
    min: number;
    max: number;
  };
  mealPlan?: {
    breakfast?: boolean;
    lunch?: boolean;
    dinner?: boolean;
  };
  capacity?: number;
  page?: number;
  limit?: number;
}

export interface IMessResponse {
  success: boolean;
  message: string;
  data?: IMessProfile | IMessProfile[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface IMessAuthenticatedRequest extends Request {
  user?: {
    id: string;
    _id: string;
    email: string;
    role: string;
    isVerified: boolean;
  };
  messId?: string;
} 