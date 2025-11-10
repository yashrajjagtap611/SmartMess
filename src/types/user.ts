// Frontend User Types
// These types match the backend User model structure

export interface UserPreferences {
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  privacy: {
    profileVisibility: 'public' | 'private' | 'mess-only';
    showEmail: boolean;
    showPhone: boolean;
  };
  theme: 'light' | 'dark' | 'auto';
  language: string;
  dietary?: string[];
  allergies?: string[];
  mealTimes?: {
    breakfast?: string;
    lunch?: string;
    dinner?: string;
  };
}

export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: 'user' | 'mess-owner' | 'admin';
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
  messPhotoUrl?: string;
  profilePicture?: string;
  lastLogin?: string;
  status?: 'active' | 'suspended';
  address?: string;
  gender?: 'male' | 'female' | 'other';
  dob?: string;
  joinDate?: string;
  preferences?: UserPreferences;
}

export interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address?: string;
  gender?: 'male' | 'female' | 'other';
  dob?: string;
  profilePicture?: string;
}

export interface UserUpdateData {
  firstName?: string;
  lastName?: string;
  phone?: string;
  address?: string;
  gender?: 'male' | 'female' | 'other';
  dob?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  role?: 'user' | 'mess-owner' | 'admin';
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data?: {
    user: User;
    token: string;
    expiresIn: number;
  };
}

export interface APIResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}

// Dietary preference options
export const DIETARY_OPTIONS = [
  'vegetarian',
  'vegan',
  'non-vegetarian',
  'halal',
  'kosher',
  'gluten-free',
  'dairy-free',
  'nut-free',
  'no-pork',
  'no-beef',
  'pescatarian',
  'keto',
  'paleo',
  'low-carb',
  'low-sodium'
] as const;

export type DietaryOption = typeof DIETARY_OPTIONS[number];

// Allergy options
export const ALLERGY_OPTIONS = [
  'nuts',
  'peanuts',
  'tree-nuts',
  'shellfish',
  'fish',
  'eggs',
  'milk',
  'soy',
  'wheat',
  'gluten',
  'sesame',
  'sulfites',
  'lactose',
  'dairy'
] as const;

export type AllergyOption = typeof ALLERGY_OPTIONS[number];

// Theme options
export const THEME_OPTIONS = ['light', 'dark', 'auto'] as const;
export type ThemeOption = typeof THEME_OPTIONS[number];

// Language options
export const LANGUAGE_OPTIONS = [
  { code: 'en', name: 'English' },
  { code: 'hi', name: 'Hindi' },
  { code: 'bn', name: 'Bengali' },
  { code: 'te', name: 'Telugu' },
  { code: 'mr', name: 'Marathi' },
  { code: 'ta', name: 'Tamil' },
  { code: 'gu', name: 'Gujarati' },
  { code: 'kn', name: 'Kannada' },
  { code: 'ml', name: 'Malayalam' },
  { code: 'pa', name: 'Punjabi' }
] as const;

export type LanguageCode = typeof LANGUAGE_OPTIONS[number]['code']; 