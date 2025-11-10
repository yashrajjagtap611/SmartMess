// Core billing types
export interface MessOwnerBillingData {
  summary: {
    totalRevenue: number;
    monthlyRevenue: number;
    pendingAmount: number;
    overdueAmount: number;
    totalMembers: number;
    activeMembers: number;
    collectionRate: number;
    averagePaymentTime: number;
  };
  members: MemberBillingInfo[];
  recentBills: BillingRecord[];
  recentTransactions: TransactionRecord[];
  paymentRequests: PaymentRequest[];
  bulkActions: BulkActionStatus;
}

export interface MemberBillingInfo {
  membershipId: string;
  userId: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  planName: string;
  amount: number;
  paymentStatus: 'paid' | 'pending' | 'overdue' | 'failed' | 'cancelled' | 'partial' | 'refunded';
  paymentMethod?: 'upi' | 'cash' | 'online' | 'bank_transfer' | 'card';
  dueDate: string;
  lastPaymentDate?: string;
  daysOverdue?: number;
  leaveDays?: number;
  leaveCredits?: number;
  adjustments?: BillingAdjustment[];
  paymentHistory?: PaymentRecord[];
  receiptUploaded?: boolean;
  receiptUrl?: string;
  notes?: string;
  verifiedBy?: string;
  verifiedAt?: string;
}

export interface BillingRecord {
  id: string;
  membershipId: string;
  userId: string;
  userName: string;
  amount: number;
  status: string;
  dueDate: string;
  createdAt: string;
}

export interface TransactionRecord {
  id: string;
  membershipId: string;
  userId: string;
  userName: string;
  amount: number;
  status: string;
  method: string;
  createdAt: string;
  receiptUrl?: string;
  verifiedBy?: string;
  verifiedAt?: string;
  notes?: string;
}

export interface PaymentRequest {
  id: string;
  membershipId: string;
  userId: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  amount: number;
  paymentMethod: 'upi' | 'cash' | 'online' | 'bank_transfer' | 'card';
  status: 'pending_verification' | 'verified' | 'rejected' | 'sent';
  receiptUrl?: string;
  transactionId?: string;
  submittedAt: string;
  verifiedBy?: string;
  verifiedAt?: string;
  notes?: string;
  rejectionReason?: string;
}

export interface BillingAdjustment {
  id: string;
  type: 'leave_credit' | 'penalty' | 'discount' | 'refund' | 'late_fee';
  amount: number;
  reason: string;
  appliedAt: string;
  appliedBy: string;
}

export interface PaymentRecord {
  id: string;
  amount: number;
  method: string;
  status: string;
  paidAt: string;
  receiptUrl?: string;
  transactionId?: string;
  notes?: string;
}

export interface BulkActionStatus {
  isProcessing: boolean;
  processedCount: number;
  totalCount: number;
  errors: string[];
  lastAction?: string;
  lastActionAt?: string;
}

export interface BillingFilter {
  status?: string;
  dateRange?: {
    start: string;
    end: string;
  };
  searchQuery?: string;
}

export interface PaymentReminder {
  membershipId: string;
  message: string;
  sentAt: string;
  status: 'sent' | 'failed';
}

export interface BillingReport {
  id: string;
  messId: string;
  startDate: string;
  endDate: string;
  totalRevenue: number;
  totalMembers: number;
  paidMembers: number;
  pendingMembers: number;
  overdueMembers: number;
  generatedAt: string;
}

// Additional types specific to BillingPayments
export interface BillingPaymentsState {
  billingData: MessOwnerBillingData | null;
  loading: boolean;
  error: string | null;
  refreshing: boolean;
  searchQuery: string;
  filterStatus: string;
  filterPaymentMethod?: string;
  filterDateRange?: {
    start?: string;
    end?: string;
  };
}

export interface BillingPaymentsActions {
  setSearchQuery: (query: string) => void;
  setFilterStatus: (status: string) => void;
  setFilterPaymentMethod: (method: string) => void;
  setFilterDateRange: (range: { start?: string; end?: string }) => void;
  refreshData: () => Promise<void>;
  sendPaymentReminder: (membershipId: string) => Promise<{ success: boolean; message: string }>;
  generateReport: () => Promise<{ success: boolean; data?: any; message?: string }>;
  updatePaymentStatus: (membershipId: string, status: string, notes?: string, paymentMethod?: string) => Promise<{ success: boolean; message: string }>;
  bulkUpdatePaymentStatus: (membershipIds: string[], status: string, notes?: string) => Promise<{ success: boolean; message: string; processed: number; errors: string[] }>;
  verifyPaymentRequest: (requestId: string, verified: boolean, notes?: string) => Promise<{ success: boolean; message: string }>;
  uploadReceipt: (membershipId: string, file: File) => Promise<{ success: boolean; message: string; url?: string }>;
  generateIndividualBill: (membershipId: string) => Promise<{ success: boolean; data?: any; message?: string }>;
  sendBulkReminders: (membershipIds: string[], message?: string) => Promise<{ success: boolean; message: string; sent: number; failed: number }>;
  calculateBillWithLeaves: (membershipId: string, leaveDays: number) => Promise<{ success: boolean; data?: any; message?: string }>;
}

export interface BillingPaymentsUtils {
  formatCurrency: (amount: number) => string;
  formatDate: (dateString: string) => string;
  getStatusColor: (status: string) => string;
  getStatusIcon: (status: string) => string;
}

// Installment Plans for Mess Owners
export interface MessOwnerInstallmentPlan {
  id: string;
  messId: string;
  messName: string;
  planName: string;
  totalAmount: number;
  installmentAmount: number;
  totalInstallments: number;
  paidInstallments: number;
  remainingInstallments: number;
  status: 'active' | 'completed' | 'cancelled' | 'overdue';
  startDate: string;
  endDate: string;
  nextDueDate: string;
  paymentMethod: string;
  createdAt: string;
  createdBy: string;
  memberId: string;
  memberName: string;
  memberEmail: string;
  memberPhone: string;
}

export interface MessOwnerInstallmentPayment {
  id: string;
  planId: string;
  memberId: string;
  memberName: string;
  installmentNumber: number;
  amount: number;
  dueDate: string;
  paidDate?: string;
  status: 'pending' | 'paid' | 'overdue' | 'cancelled';
  paymentMethod?: string;
  transactionId?: string;
  receiptUrl?: string;
  notes?: string;
  verifiedBy?: string;
  verifiedAt?: string;
}

export interface BillingPaymentsHook extends BillingPaymentsState, BillingPaymentsActions, BillingPaymentsUtils {}

