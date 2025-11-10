export interface BillingRecord {
  id: string;
  messId: string;
  messName: string;
  membershipId: string;
  planName: string;
  billingPeriod: {
    startDate: string;
    endDate: string;
    period: 'daily' | 'weekly' | 'monthly' | 'yearly';
  };
  subscription: {
    planId: string;
    planName: string;
    baseAmount: number;
    discountAmount: number;
    taxAmount: number;
    totalAmount: number;
  };
  payment: {
    status: 'pending' | 'paid' | 'failed' | 'overdue' | 'refunded' | 'cancelled';
    method?: 'upi' | 'online' | 'cash' | 'bank_transfer' | 'cheque';
    dueDate: string;
    paidDate?: string;
    transactionId?: string;
  };
  adjustments: Array<{
    type: 'discount' | 'penalty' | 'leave_credit' | 'late_fee' | 'refund' | 'bonus' | 'subscription_extension';
    amount: number;
    reason: string;
    appliedBy: string;
    appliedDate: string;
  }>;
  leaveCredits: Array<{
    leaveId: string;
    creditAmount: number;
    appliedDate: string;
  }>;
  subscriptionExtension?: {
    extensionMeals: number;
    extensionDays: number;
    originalEndDate: string;
    newEndDate: string;
  };
  metadata: {
    generatedBy: 'system' | 'admin' | 'mess_owner';
    notes?: string;
    tags?: string[];
  };
  createdAt: string;
  updatedAt: string;
}

export interface PaymentHistory {
  id: string;
  transactionId: string;
  messName: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  method: 'upi' | 'online' | 'cash' | 'bank_transfer' | 'cheque';
  description: string;
  paymentDate: string;
  createdAt: string;
  gatewayResponse?: any;
}

export interface SubscriptionDetails {
  id: string;
  messId: string;
  messName: string;
  planId: string;
  planName: string;
  status: 'active' | 'paused' | 'cancelled' | 'expired' | 'pending';
  billingCycle: 'monthly' | 'yearly' | 'daily' | 'weekly';
  pricing: {
    baseAmount: number;
    totalAmount: number;
    currency: string;
    discountAmount?: number;
    taxAmount?: number;
  };
  paymentSettings: {
    paymentMethod: string;
    autoRenew: boolean;
  };
  schedule: {
    startDate: string;
    lastBillingDate?: string;
    nextBillingDate: string;
  };
  limits: {
    maxLeaveDays: number;
    maxLeaveMeals: number;
  };
  features: {
    mealOptions: {
      breakfast: boolean;
      lunch: boolean;
      dinner: boolean;
    };
    specialDietary: boolean;
    prioritySupport: boolean;
    advanceBooking: boolean;
    customTimings: boolean;
  };
  cancellation?: {
    cancelledAt?: string;
    cancelledBy?: string;
    reason?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface BillingSummary {
  totalBills: number;
  paidBills: number;
  pendingBills: number;
  overdueBills: number;
  totalAmount: number;
  paidAmount: number;
  pendingAmount: number;
  overdueAmount: number;
  thisMonthBills: number;
  thisMonthAmount: number;
  lastPaymentDate?: string | undefined;
  nextPaymentDate?: string | undefined;
}

export interface UserBillingData {
  userId: string;
  summary: BillingSummary;
  memberships: Array<{
    messId: string;
    messName: string;
    membershipId: string;
    mealPlanId?: string; // Add mealPlanId for leave plan functionality
    planName: string;
    status: string;
    paymentStatus: string;
    paymentRequestStatus?: string;
    amount: number;
    dueDate?: string;
    lastPaymentDate?: string;
    nextPaymentDate?: string;
    subscriptionStartDate?: string;
    subscriptionEndDate?: string;
    autoRenewal: boolean;
  }>;
  bills: BillingRecord[];
  transactions: PaymentHistory[];
  subscriptions?: SubscriptionDetails[]; // Make optional to match service
  invoices?: Array<{
    id: string;
    billId: string;
    messName: string;
    amount: number;
    status: string;
    generatedDate: string;
    downloadUrl: string;
  }>;
  receipts?: Array<{
    id: string;
    transactionId: string;
    messName: string;
    amount: number;
    paymentDate: string;
    downloadUrl: string;
  }>;
}

export interface PaymentRequest {
  billingId?: string | undefined;
  subscriptionId?: string | undefined;
  amount: number;
  currency: string;
  method: string;
  gateway: string;
  description: string;
  customerInfo: {
    name: string;
    email: string;
    phone: string;
  };
  // Additional fields for our component
  upiId?: string | undefined;
  bankDetails?: {
    accountNumber: string;
    ifscCode: string;
    accountHolderName: string;
  } | undefined;
  notes?: string | undefined;
}

export interface PaymentResponse {
  success: boolean;
  paymentId?: string;
  orderId?: string;
  amount?: number;
  currency?: string;
  status?: string;
  gatewayResponse?: any;
  error?: string;
  // Additional fields for our component
  transactionId?: string | undefined;
  paymentUrl?: string | undefined;
  message?: string | undefined;
  data?: any;
}

export interface BillingFilters {
  status?: string | undefined;
  messId?: string | undefined;
  dateRange?: {
    startDate: string;
    endDate: string;
  } | undefined;
  amountRange?: {
    min: number;
    max: number;
  } | undefined;
}

export interface BillingStats {
  totalSpent: number;
  averageMonthlySpend: number;
  mostUsedMess: string;
  paymentMethodBreakdown: Record<string, number>;
  monthlyTrend: Array<{
    month: string;
    amount: number;
    bills: number;
  }>;
}

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'overdue' | 'refunded' | 'cancelled';
export type PaymentMethod = 'upi' | 'online' | 'cash' | 'bank_transfer' | 'cheque';
export type BillingPeriod = 'daily' | 'weekly' | '15days' | 'monthly' | '3months' | '6months' | 'yearly';
export type SubscriptionStatus = 'active' | 'paused' | 'cancelled' | 'expired' | 'pending';
