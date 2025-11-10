export type NotificationType = 
  | 'join_request'
  | 'payment_request'
  | 'payment_received'
  | 'payment_reminder'
  | 'payment_overdue'
  | 'payment_success'
  | 'payment_failed'
  | 'leave_request'
  | 'bill_due'
  | 'meal_plan_change'
  | 'general'
  | 'subscription_request'
  | 'subscription_renewal'
  | 'payment_method_update'
  | 'system';

export type NotificationStatus = 'pending' | 'approved' | 'rejected' | 'completed' | 'failed' | 'cancelled';

export type NotificationPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface CommonNotification {
  id: string;
  userId?: string;
  messId?: string;
  type: NotificationType;
  title: string;
  message: string;
  status: NotificationStatus;
  priority?: NotificationPriority;
  data?: {
    requestingUserId?: string;
    mealPlanId?: string;
    paymentType?: 'pay_now' | 'pay_later';
    amount?: number;
    plan?: string;
    approvedBy?: string;
    approvedAt?: string;
    rejectedBy?: string;
    rejectedAt?: string;
    paymentMethod?: string;
    dueDate?: string;
    reminderCount?: number;
    lastReminderSent?: string;
    paymentAttempts?: number;
    transactionId?: string;
    lateFees?: number;
    overdue?: boolean;
    [key: string]: any;
  };
  isRead: boolean;
  createdAt?: string;
  updatedAt?: string;
  timestamp?: string;
  expiresAt?: string;
}

export type NotificationAction = 'approve' | 'reject' | 'mark_read' | 'delete' | 'remind' | 'update_status';

export interface NotificationTabConfig {
  key: string;
  label: string;
  filter: (notification: CommonNotification) => boolean;
  count?: number;
}

export interface NotificationFilters {
  type?: NotificationType;
  status?: NotificationStatus;
  priority?: NotificationPriority;
  isRead?: boolean;
  messId?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
}

export interface NotificationStats {
  total: number;
  unread: number;
  byType: Record<NotificationType, number>;
  byStatus: Record<NotificationStatus, number>;
  byPriority: Record<NotificationPriority, number>;
  overduePayments: number;
  pendingApprovals: number;
}

export interface PaymentNotificationData {
  amount: number;
  method: string;
  plan?: string;
  dueDate?: string;
  overdue?: boolean;
  lateFees?: number;
  transactionId?: string;
  error?: string;
}

export interface JoinRequestNotificationData {
  requestingUserId: string;
  mealPlanId: string;
  paymentType: 'pay_now' | 'pay_later';
  plan?: string;
  amount?: number;
}

export interface LeaveRequestNotificationData {
  requestingUserId: string;
  leaveDays: number;
  reason?: string;
}

export interface MealPlanChangeNotificationData {
  oldPlan: string;
  newPlan: string;
  effectiveDate: string;
  priceChange?: number;
}

export interface SystemNotificationData {
  category: 'maintenance' | 'update' | 'announcement' | 'security';
  severity: 'info' | 'warning' | 'error' | 'critical';
  actionRequired?: boolean;
}

export interface StatusBadgeConfig {
  colorClassNames: string;
  text: string;
} 