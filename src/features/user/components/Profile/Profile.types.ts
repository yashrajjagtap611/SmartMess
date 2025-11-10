export interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other' | undefined;
  address?: string; // Legacy field
  currentAddress?: {
    street?: string;
    city?: string;
    district?: string;
    taluka?: string;
    state?: string;
    pincode?: string;
    country?: string;
    latitude?: number;
    longitude?: number;
  };
  college?: string;
  course?: string;
  role: 'user' | 'mess-owner' | 'admin';
  avatar?: string;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  createdAt: string;
  updatedAt: string;
  // Student information
  isStudent?: boolean;
  studentInfo?: {
    college?: string;
    course?: string;
    year?: string;
    branch?: string;
    collegeEmailId?: string;
    educationCategory?: 'school' | 'college' | 'competitive' | 'other';
    schoolClass?: string;
    schoolStream?: string;
    competitiveExam?: string;
    academyName?: string;
  };
  // Profession information
  isWorking?: boolean;
  professionInfo?: {
    company?: string;
    designation?: string;
    department?: string;
    workExperience?: number;
    workLocation?: string;
    employeeId?: string;
    joiningDate?: string;
  };
  messDetails?: {
    messId: string;
    messName: string;
    joinDate: string;
    status: 'active' | 'inactive' | 'suspended';
    mealPlan?: {
      id: string;
      name: string;
      amount: number;
      period: string;
    };
  };
}

export interface ProfileFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender?: 'male' | 'female' | 'other' | undefined;
  address: string; // Legacy field
  currentAddress?: {
    street?: string;
    city?: string;
    district?: string;
    taluka?: string;
    state?: string;
    pincode?: string;
    country?: string;
    latitude?: number;
    longitude?: number;
  };
  college: string;
  course: string;
  // Student information
  isStudent?: boolean;
  studentInfo?: {
    college?: string;
    course?: string;
    year?: string;
    branch?: string;
    collegeEmailId?: string;
    educationCategory?: 'school' | 'college' | 'competitive' | 'other';
    schoolClass?: string;
    schoolStream?: string;
    competitiveExam?: string;
    academyName?: string;
  };
  // Profession information
  isWorking?: boolean;
  professionInfo?: {
    company?: string;
    designation?: string;
    department?: string;
    workExperience?: number;
    workLocation?: string;
    employeeId?: string;
    joiningDate?: string;
  };
}

export interface ProfileProps {
  className?: string;
}

export interface ProfileStats {
  totalBills: number;
  paidBills: number;
  pendingBills: number;
  totalAmount: number;
  messRating?: number;
  daysAsMember: number;
}

export interface ProfileActivity {
  id: string;
  type: 'payment' | 'leave' | 'join' | 'update';
  title: string;
  description: string;
  timestamp: string;
  status: 'success' | 'pending' | 'failed';
}

export interface Subscription {
  id: string;
  messId: string;
  messName: string;
  messLocation?: {
    street: string;
    city: string;
    state: string;
    pincode: string;
  };
  mealPlan: {
    id: string;
    name: string;
    description: string;
    pricing: {
      amount: number;
      period: string;
    };
    mealType: string;
    mealsPerDay: number;
  };
  status: string;
  paymentStatus: string;
  joinDate: string;
  subscriptionStartDate: string;
  subscriptionEndDate?: string;
  lastPaymentDate?: string;
  nextPaymentDate?: string;
}

