export interface BillingSummary {
  totalBills: number;
  paidBills: number;
  pendingBills: number;
  overdueBills: number;
  totalAmount: number;
  paidAmount: number;
  pendingAmount: number;
  overdueAmount: number;
  averageBillAmount: number;
  collectionRate: number; // Percentage
}

// Subscriptions removed

export interface PaymentAnalytics {
  totalTransactions: number;
  successfulTransactions: number;
  failedTransactions: number;
  refundedTransactions: number;
  totalVolume: number;
  averageTransactionValue: number;
  successRate: number; // Percentage
  refundRate: number; // Percentage
}

export interface BillingDashboardData {
  summary: BillingSummary;
  payments: PaymentAnalytics;
  recentBills: Array<{
    id: string;
    userId: string;
    userName: string;
    messName: string;
    amount: number;
    status: string;
    dueDate: Date;
    createdAt: Date;
  }>;
  recentTransactions: Array<{
    id: string;
    transactionId: string;
    userId: string;
    userName: string;
    amount: number;
    status: string;
    method: string;
    createdAt: Date;
  }>;
  overduePayments: Array<{
    id: string;
    userId: string;
    userName: string;
    userEmail: string;
    userPhone: string;
    messName: string;
    amount: number;
    daysOverdue: number;
    lastReminderSent?: Date | undefined;
  }>;
}

export interface CreateBillingRequest {
  userId: string;
  messId: string;
  membershipId: string;
  planId: string;
  billingPeriod: {
    startDate: Date;
    endDate: Date;
    period: 'daily' | 'weekly' | '15days' | 'monthly' | '3months' | '6months' | 'yearly';
  };
  adjustments?: Array<{
    type: 'discount' | 'penalty' | 'leave_credit' | 'late_fee' | 'refund' | 'bonus';
    amount: number;
    reason: string;
    appliedBy: string;
  }>;
  metadata?: {
    generatedBy: 'system' | 'admin' | 'mess_owner';
    notes?: string;
    tags?: string[];
  };
}

// CreateSubscriptionRequest removed

export interface ProcessPaymentRequest {
  billingId: string;
  paymentMethod: 'upi' | 'online' | 'cash' | 'bank_transfer' | 'cheque';
  paymentGateway?: string;
  amount?: number; // Optional, defaults to bill total
  metadata?: {
    ipAddress?: string;
    userAgent?: string;
    deviceInfo?: any;
    location?: {
      latitude?: number;
      longitude?: number;
      city?: string;
      state?: string;
      country?: string;
    };
    notes?: string;
  };
}

export interface RefundRequest {
  transactionId: string;
  refundAmount: number;
  refundReason: string;
  refundedBy: string;
  metadata?: {
    notes?: string;
  };
}

export interface BillingFilter {
  userId?: string;
  messId?: string;
  status?: string;
  paymentStatus?: string;
  startDate?: Date;
  endDate?: Date;
  minAmount?: number;
  maxAmount?: number;
  tags?: string[];
}

// SubscriptionFilter removed

export interface PaymentFilter {
  userId?: string;
  messId?: string;
  status?: string;
  paymentMethod?: string;
  gateway?: string;
  startDate?: Date;
  endDate?: Date;
  minAmount?: number;
  maxAmount?: number;
  type?: string;
}

export interface BillingReport {
  period: {
    startDate: Date;
    endDate: Date;
  };
  summary: BillingSummary;
  bills: Array<{
    id: string;
    userId: string;
    userName: string;
    userEmail: string;
    messName: string;
    planName: string;
    amount: number;
    status: string;
    paymentStatus: string;
    dueDate: Date;
    paidDate?: Date;
    createdAt: Date;
  }>;
  // Subscriptions removed
  transactions: Array<{
    id: string;
    transactionId: string;
    userId: string;
    userName: string;
    messName: string;
    amount: number;
    status: string;
    method: string;
    gateway: string;
    createdAt: Date;
  }>;
}

export interface MessOwnerBillingData {
  messId: string;
  messName: string;
  summary: {
    totalMembers: number;
    activeMembers: number;
    totalRevenue: number;
    monthlyRevenue: number;
    pendingAmount: number;
    overdueAmount: number;
  };
  members: Array<{
    userId: string;
    userName: string;
    userEmail: string;
    userPhone: string;
    membershipId: string;
    planName: string;
    status: string;
    paymentStatus: string;
    amount: number;
    dueDate?: Date | undefined;
    lastPaymentDate?: Date | undefined;
    daysOverdue?: number;
  }>;
  // Pending payment requests raised by users (e.g., pay_now requests awaiting approval)
  paymentRequests?: Array<{
    requestId: string; // use membership id as a stable identifier
    membershipId: string;
    userId: string;
    userName: string;
    userEmail: string;
    userPhone: string;
    planId?: string | null;
    planName: string;
    amount: number;
    status: 'sent' | 'approved' | 'rejected';
    requestedAt?: Date;
    // Additional fields for history and display
    paymentMethod?: string;
    updatedAt?: Date;
    approvedAt?: Date;
    rejectedAt?: Date;
  }>;
  recentBills: Array<{
    id: string;
    userId: string;
    userName: string;
    amount: number;
    status: string;
    dueDate: Date;
    createdAt: Date;
  }>;
  recentTransactions: Array<{
    id: string;
    transactionId: string;
    userId: string;
    userName: string;
    amount: number;
    status: string;
    method: string;
    createdAt: Date;
  }>;
}

export interface UserBillingData {
  userId: string;
  summary: {
    totalBills: number;
    paidBills: number;
    pendingBills: number;
    overdueBills: number;
    totalAmount: number;
    paidAmount: number;
    pendingAmount: number;
    overdueAmount: number;
  };
  memberships: Array<{
    messId: string;
    messName: string;
    membershipId: string;
    planName: string;
    status: string;
    paymentStatus: string;
    amount: number;
    dueDate?: Date | undefined;
    lastPaymentDate?: Date | undefined;
    nextPaymentDate?: Date | undefined;
    autoRenewal: boolean;
  }>;
  bills: Array<{
    id: string;
    messName: string;
    planName: string;
    amount: number;
    status: string;
    paymentStatus: string;
    dueDate: Date;
    paidDate?: Date;
    createdAt: Date;
  }>;
  transactions: Array<{
    id: string;
    transactionId: string;
    messName: string;
    amount: number;
    status: string;
    method: string;
    paymentMethod: string;
    description: string;
    paymentDate: Date;
    createdAt: Date;
  }>;
  // Additional fields for frontend features
  invoices?: Array<any>;
  receipts?: Array<any>;
  subscriptionSettings?: Array<any>;
  renewalHistory?: Array<any>;
  installmentPlans?: Array<any>;
  installmentPayments?: Array<any>;
}
