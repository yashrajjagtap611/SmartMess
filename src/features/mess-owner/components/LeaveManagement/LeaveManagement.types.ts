export interface ExtensionRequest {
  _id: string;
  originalEndDate: string;
  newEndDate: string;
  requestedAt: string;
  status: 'pending' | 'approved' | 'rejected';
  reason?: string;
  approvedBy?: string;
  approvedAt?: string;
  rejectionReason?: string;
}

export interface LeaveRequest {
  _id: string;
  userId: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  messId: {
    _id: string;
    name: string;
    location: string | {
      street: string;
      city: string;
      district: string;
      state: string;
      pincode: string;
      country: string;
      _id?: string;
    };
  };
  mealPlanIds: Array<{
    _id: string;
    name: string;
    pricing: {
      amount?: number;
      period?: string;
      daily?: number;
      weekly?: number;
      monthly?: number;
    };
    mealOptions: {
      breakfast: boolean;
      lunch: boolean;
      dinner: boolean;
    };
    leaveRules?: {
      maxLeaveDays: number;
      maxLeaveMeals: number;
      requireTwoHourNotice: boolean;
      noticeHours: number;
      minConsecutiveDays: number;
      extendSubscription: boolean;
      autoApproval: boolean;
      leaveLimitsEnabled: boolean;
      consecutiveLeaveEnabled: boolean;
      maxLeaveDaysEnabled: boolean;
      maxLeaveMealsEnabled: boolean;
    };
  }>;
  startDate: string;
  endDate: string;
  mealTypes: string[];
  startDateMealTypes: string[];
  endDateMealTypes: string[];
  middleDaysMealTypes: string[];
  reason?: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled' | 'extended';
  totalDays: number;
  totalMealsMissed: number;
  estimatedSavings: number;
  mealBreakdown: {
    breakfast: number;
    lunch: number;
    dinner: number;
  };
  planWiseBreakdown: Array<{
    planId: string;
    planName: string;
    breakfast: number;
    lunch: number;
    dinner: number;
    estimatedSavings: number;
  }>;
  extensionRequests: ExtensionRequest[];
  approvedBy?: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  approvalRemarks?: string;
  calculatedDeduction?: {
    allowedDays: number;
    allowedMeals: number;
    totalDays: number;
    extendSubscription: boolean;
    extensionMeals: number;
    extensionDays: number;
    adjustmentMessages?: Array<{
      type: string;
      date: string;
      message: string;
      daysBeyond?: number;
    }>;
  };
  createdAt: string;
  updatedAt: string;
}

export interface LeaveManagementProps {
  // Add any props if needed
}

export interface LeaveManagementState {
  leaveRequests: LeaveRequest[];
  loading: boolean;
  error: string | null;
  selectedRequest: LeaveRequest | null;
  filters: LeaveManagementFilters;
  stats: LeaveRequestStats;
  pagination: {
    current: number;
    pages: number;
    total: number;
  };
}

export interface LeaveRequestAction {
  action: 'approve' | 'reject';
  rejectionReason?: string;
}

export interface ExtensionRequestAction {
  action: 'approve' | 'reject';
  rejectionReason?: string;
}

export interface LeaveManagementFilters {
  status: 'all' | 'pending' | 'approved' | 'rejected' | 'cancelled';
  dateRange: {
    start: string;
    end: string;
  };
  search: string;
  dateFilter?: string;
}

export interface LeaveRequestStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  cancelled: number;
  thisWeek: number;
  thisMonth: number;
}

// Mess Off Day Types
export interface MessOffDayRequest {
  _id: string;
  messId: string;
  offDate: string;
  reason: string;
  mealTypes: ('breakfast' | 'lunch' | 'dinner')[];
  billingDeduction: boolean;
  subscriptionExtension: boolean;
  extensionDays?: number;
  status?: 'active' | 'cancelled';
  createdBy: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface DefaultOffDaySettings {
  _id: string;
  messId: string;
  pattern: 'weekly' | 'monthly';
  weeklySettings?: {
    dayOfWeek: number; // 0-6 (Sunday-Saturday)
    enabled: boolean;
    mealTypes: ('breakfast' | 'lunch' | 'dinner')[];
  };
  monthlySettings?: {
    daysOfMonth: number[]; // Array of days 1-31
    enabled: boolean;
    mealTypes: ('breakfast' | 'lunch' | 'dinner')[];
  };
  billingDeduction: boolean;
  subscriptionExtension: boolean;
  extensionDays: number;
  createdAt: string;
  updatedAt: string;
}

export interface MessOffDayFormData {
  offDate: string;
  reason: string;
  mealTypes: ('breakfast' | 'lunch' | 'dinner')[];
  billingDeduction: boolean;
  subscriptionExtension: boolean;
  extensionDays: number;
  // Optional range support
  startDate?: string;
  endDate?: string;
  startDateMealTypes?: ('breakfast' | 'lunch' | 'dinner')[];
  endDateMealTypes?: ('breakfast' | 'lunch' | 'dinner')[];
  // Announcement options
  sendAnnouncement?: boolean;
  announcementMessage?: string;
}

export interface MessOffDayStats {
  total: number;
  thisWeek: number;
  thisMonth: number;
  upcoming: number;
}



