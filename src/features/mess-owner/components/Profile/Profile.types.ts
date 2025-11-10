export type Gender = 'male' | 'female' | 'other';
export type AccountStatus = 'active' | 'suspended';
export type MessType = 'Veg' | 'Non-Veg' | 'Mixed';

export interface MessLocation {
  street: string;
  city: string;
  district?: string;
  state: string;
  pincode: string;
  country: string;
}

export interface MessProfileDetails {
  _id?: string;
  id?: string;
  userId?: string;
  name: string;
  location: MessLocation;
  colleges: string[];
  ownerPhone?: string;
  ownerEmail: string;
  types: MessType[];
  logo?: string | null;
  operatingHours?: Array<{
    meal: string;
    enabled: boolean;
    start: string;
    end: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface MessOwnerProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  gender: Gender;
  dateOfBirth: string;
  avatar?: string;
  status: AccountStatus;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
  messProfile?: MessProfileDetails | null;
  messName?: string;
  messAddress?: string;
  ownerEmail?: string;
  ownerPhone?: string;
  messTypes?: MessType[];
  monthlyRevenue?: number;
  totalUsers?: number;
  rating?: number;
  totalReviews?: number;
}

export interface PersonalInfoForm {
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  gender: Gender;
  dob?: string;
  status: AccountStatus;
}

export interface MessFormState {
  name: string;
  street: string;
  city: string;
  district: string;
  state: string;
  pincode: string;
  country: string;
  colleges: string;
  ownerPhone: string;
  ownerEmail: string;
  types: MessType[];
}

export interface UserProfileApiResponse<T = any> {
  success: boolean;
  message?: string;
  data: T;
}

export interface MessProfileApiResponse {
  success: boolean;
  message?: string;
  data: MessProfileDetails;
}






