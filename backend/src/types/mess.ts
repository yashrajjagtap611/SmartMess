// Mess Types
// TypeScript interfaces for mess-related data structures

export interface IMessLocation {
  street: string;
  city: string;
  state: string;
  pincode: string;
  country?: string;
}

export interface IMessProfile {
  _id?: string;
  userId: string;
  name: string;
  description?: string;
  location: IMessLocation;
  types: string[];
  colleges: string[];
  ownerPhone?: string;
  ownerEmail?: string;
  logo?: string;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IMessMembership {
  _id?: string;
  userId: string;
  messId: string;
  mealPlanId: string;
  status: 'active' | 'pending' | 'inactive';
  paymentStatus: 'paid' | 'pending' | 'overdue';
  joinDate: Date;
  subscriptionStartDate?: Date;
  subscriptionEndDate?: Date;
  lastPaymentDate?: Date;
  nextPaymentDate?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IMealPlan {
  _id?: string;
  messId: string;
  name: string;
  description?: string;
  pricing: {
    amount: number;
    period: 'daily' | 'weekly' | '15days' | 'monthly' | '3months' | '6months' | 'yearly';
  };
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'all';
  mealsPerDay: number;
  isActive: boolean;
  leaveRules: {
    maxLeaveMeals: number;
    requireTwoHourNotice: boolean;
    noticeHours: number;
    minConsecutiveDays: number;
    extendSubscription: boolean;
    autoApproval: boolean;
    leaveLimitsEnabled: boolean;
    consecutiveLeaveEnabled: boolean;
    maxLeaveMealsEnabled: boolean;
  };
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IUserMessDetails {
  messId: string;
  messName: string;
  messLocation: IMessLocation;
  joinDate: string;
  status: string;
  mealPlans: IUserMealPlan[];
  paymentStatus: string;
  subscriptionStartDate: string;
  subscriptionEndDate?: string;
  lastPaymentDate?: string;
  nextPaymentDate?: string;
  canLeave: boolean;
  totalPlans: number;
  totalMonthlyAmount: number;
}

export interface IUserMealPlan {
  id: string;
  name: string;
  description: string;
  pricing: {
    amount: number;
    period: string;
  };
  mealType: string;
  mealsPerDay: number;
  status: string;
  subscriptionDate: string;
}

export interface IMessSearchResult {
  id: string;
  name: string;
  description: string;
  address: string;
  capacity: number;
  currentMembers: number;
  monthlyRate: number;
  ownerName: string;
  ownerPhone: string;
  ownerEmail: string;
  types: string[];
  colleges: string[];
  rating: number;
  reviews: number;
  upiId: string;
  mealPlans: IMealPlan[];
} 