// Mess-related Types
export interface MessProfile {
  id?: string;
  name: string;
  location: MessLocation;
  colleges: string[];
  collegeInput: string;
  ownerPhone: string;
  ownerEmail: string;
  types: string[];
  logo: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface MessLocation {
  street: string;
  city: string;
  district: string;
  state: string;
  pincode: string;
  country: string;
}

export interface MessType {
  id: string;
  name: string;
  description?: string;
}

export interface MessMembership {
  id: string;
  userId: string;
  messId: string;
  status: MembershipStatus;
  startDate: string;
  endDate?: string;
  monthlyFee: number;
  createdAt: string;
  updatedAt: string;
}

export type MembershipStatus = 'pending' | 'active' | 'inactive' | 'cancelled';

export interface MessSettings {
  id: string;
  messId: string;
  operatingHours: OperatingHours;
  mealTimings: MealTimings;
  paymentSettings: PaymentSettings;
  notificationSettings: NotificationSettings;
  createdAt: string;
  updatedAt: string;
}

export interface OperatingHours {
  monday: DaySchedule;
  tuesday: DaySchedule;
  wednesday: DaySchedule;
  thursday: DaySchedule;
  friday: DaySchedule;
  saturday: DaySchedule;
  sunday: DaySchedule;
}

export interface DaySchedule {
  isOpen: boolean;
  openTime: string;
  closeTime: string;
}

export interface MealTimings {
  breakfast: string;
  lunch: string;
  dinner: string;
}

export interface PaymentSettings {
  monthlyFee: number;
  currency: string;
  paymentMethods: string[];
  dueDate: number; // Day of month
}

export interface NotificationSettings {
  emailNotifications: boolean;
  smsNotifications: boolean;
  pushNotifications: boolean;
}

export interface MessPhoto {
  id: string;
  messId: string;
  url: string;
  type: 'logo' | 'gallery';
  createdAt: string;
}

export interface MessSearchFilters {
  location?: string;
  types?: string[];
  priceRange?: {
    min: number;
    max: number;
  };
  rating?: number;
  features?: string[];
}

export interface MessSearchResult {
  id: string;
  name: string;
  location: MessLocation;
  types: string[];
  logo?: string;
  rating: number;
  monthlyFee: number;
  distance?: number;
  isOpen: boolean;
}

export interface MessReview {
  id: string;
  messId: string;
  userId: string;
  rating: number;
  comment: string;
  createdAt: string;
  updatedAt: string;
}

export interface MessStats {
  totalMembers: number;
  activeMembers: number;
  monthlyRevenue: number;
  averageRating: number;
  totalReviews: number;
} 