export interface IUser {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  role: UserRole;
  isVerified: boolean;
  profilePicture?: string;
  messPhotoUrl?: string;
  status: UserStatus;
  address?: string;
  gender?: Gender;
  dob?: Date;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type UserRole = 'user' | 'mess-owner' | 'admin';
export type UserStatus = 'active' | 'suspended' | 'inactive';
export type Gender = 'male' | 'female' | 'other';

export interface IUserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: UserRole;
  avatar?: string;
  status: UserStatus;
  address?: string;
  gender?: Gender;
  dob?: Date;
  isVerified: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserRegistration {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  role?: UserRole;
}

export interface IUserLogin {
  email: string;
  password: string;
}

export interface IUserUpdate {
  firstName?: string;
  lastName?: string;
  phone?: string;
  avatar?: string;
  address?: string;
  gender?: Gender;
  dob?: Date;
  status?: UserStatus;
}

export interface IAuthResponse {
  success: boolean;
  message: string;
  data?: {
    token?: string;
    user?: IUserProfile;
  };
  code?: string;
}

export interface IJWTPayload {
  userId: string;
  email: string;
  role: UserRole;
  iat?: number;
  exp?: number;
} 