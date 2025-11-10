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
  collectionRate: number;
}

export interface SubscriptionSummary {
  totalSubscriptions: number;
  activeSubscriptions: number;
  pausedSubscriptions: number;
  cancelledSubscriptions: number;
  expiredSubscriptions: number;
  monthlyRecurringRevenue: number;
  averageRevenuePerUser: number;
  churnRate: number;
}

export interface PaymentAnalytics {
  totalTransactions: number;
  successfulTransactions: number;
  failedTransactions: number;
  refundedTransactions: number;
  totalVolume: number;
  averageTransactionValue: number;
  successRate: number;
  refundRate: number;
}

export interface RecentBill {
  id: string;
  userId: string;
  userName: string;
  messName: string;
  amount: number;
  status: string;
  dueDate: string;
  createdAt: string;
}

export interface RecentTransaction {
  id: string;
  transactionId: string;
  userId: string;
  userName: string;
  amount: number;
  status: string;
  method: string;
  createdAt: string;
}

export interface OverduePayment {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  messName: string;
  amount: number;
  daysOverdue: number;
  lastReminderSent?: string;
}

export interface BillingDashboardData {
  summary: BillingSummary;
  subscriptions: SubscriptionSummary;
  payments: PaymentAnalytics;
  recentBills: RecentBill[];
  recentTransactions: RecentTransaction[];
  overduePayments: OverduePayment[];
}

export interface BillingFilter {
  startDate?: string;
  endDate?: string;
  status?: string;
  messId?: string;
  userId?: string;
}

export interface SubscriptionFilter {
  status?: string;
  billingCycle?: string;
  messId?: string;
  userId?: string;
  startDate?: string;
  endDate?: string;
}

export interface PaymentFilter {
  status?: string;
  method?: string;
  gateway?: string;
  messId?: string;
  userId?: string;
  startDate?: string;
  endDate?: string;
}


