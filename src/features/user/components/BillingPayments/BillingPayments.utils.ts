import { PaymentStatus, PaymentMethod, BillingPeriod, SubscriptionStatus } from './BillingPayments.types';

/**
 * Format currency amount to display string
 */
export const formatCurrency = (amount: number, currency: string = 'INR'): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
};

/**
 * Format date to display string
 */
export const formatDate = (date: string | Date, format: 'short' | 'long' | 'time' = 'short'): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) {
    return 'Invalid Date';
  }

  switch (format) {
    case 'short':
      return dateObj.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    case 'long':
      return dateObj.toLocaleDateString('en-IN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    case 'time':
      return dateObj.toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    default:
      return dateObj.toLocaleDateString('en-IN');
  }
};

/**
 * Get status color for UI components
 */
export const getStatusColor = (status: PaymentStatus | SubscriptionStatus): string => {
  const statusColors: Record<string, string> = {
    // Payment statuses
    'paid': 'text-green-600 bg-green-50 border-green-200',
    'completed': 'text-green-600 bg-green-50 border-green-200',
    'pending': 'text-yellow-600 bg-yellow-50 border-yellow-200',
    'failed': 'text-red-600 bg-red-50 border-red-200',
    'overdue': 'text-red-600 bg-red-50 border-red-200',
    'refunded': 'text-blue-600 bg-blue-50 border-blue-200',
    'cancelled': 'text-gray-600 bg-gray-50 border-gray-200',
    
    // Subscription statuses
    'active': 'text-green-600 bg-green-50 border-green-200',
    'paused': 'text-yellow-600 bg-yellow-50 border-yellow-200',
    'expired': 'text-red-600 bg-red-50 border-red-200',
  };

  return statusColors[status] || 'text-gray-600 bg-gray-50 border-gray-200';
};

/**
 * Get status text for display
 */
export const getStatusText = (status: PaymentStatus | SubscriptionStatus): string => {
  const statusTexts: Record<string, string> = {
    // Payment statuses
    'paid': 'Paid',
    'completed': 'Completed',
    'pending': 'Pending',
    'failed': 'Failed',
    'overdue': 'Overdue',
    'refunded': 'Refunded',
    'cancelled': 'Cancelled',
    
    // Subscription statuses
    'active': 'Active',
    'paused': 'Paused',
    'expired': 'Expired',
  };

  return statusTexts[status] || status;
};

/**
 * Get payment method display text
 */
export const getPaymentMethodText = (method: PaymentMethod): string => {
  const methodTexts: Record<PaymentMethod, string> = {
    'upi': 'UPI',
    'online': 'Online Banking',
    'cash': 'Cash',
    'bank_transfer': 'Bank Transfer',
    'cheque': 'Cheque',
  };

  return methodTexts[method] || method;
};

/**
 * Get billing period display text
 */
export const getBillingPeriodText = (period: BillingPeriod): string => {
  const periodTexts: Record<BillingPeriod, string> = {
    'daily': 'Daily',
    'weekly': 'Weekly',
    '15days': '15 Days',
    'monthly': 'Monthly',
    '3months': '3 Months',
    '6months': '6 Months',
    'yearly': 'Yearly',
  };

  return periodTexts[period] || period;
};

/**
 * Calculate days until due date
 */
export const getDaysUntilDue = (dueDate: string | Date): number => {
  const due = typeof dueDate === 'string' ? new Date(dueDate) : dueDate;
  const now = new Date();
  const diffTime = due.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

/**
 * Check if payment is overdue
 */
export const isOverdue = (dueDate: string | Date, status: PaymentStatus): boolean => {
  if (status === 'paid' || status === 'cancelled') return false;
  return getDaysUntilDue(dueDate) < 0;
};

/**
 * Get urgency level for payment
 */
export const getPaymentUrgency = (dueDate: string | Date, status: PaymentStatus): 'low' | 'medium' | 'high' | 'critical' => {
  if (status === 'paid' || status === 'cancelled') return 'low';
  
  const daysUntilDue = getDaysUntilDue(dueDate);
  
  if (daysUntilDue < 0) return 'critical';
  if (daysUntilDue <= 1) return 'high';
  if (daysUntilDue <= 3) return 'medium';
  return 'low';
};

/**
 * Format billing period for display
 */
export const formatBillingPeriod = (startDate: string, endDate: string, period: BillingPeriod): string => {
  const start = formatDate(startDate, 'short');
  const end = formatDate(endDate, 'short');
  return `${start} - ${end} (${getBillingPeriodText(period)})`;
};

/**
 * Calculate discount percentage
 */
export const calculateDiscountPercentage = (baseAmount: number, discountAmount: number): number => {
  if (baseAmount === 0) return 0;
  return Math.round((discountAmount / baseAmount) * 100);
};

/**
 * Get subscription status icon
 */
export const getSubscriptionStatusIcon = (status: SubscriptionStatus): string => {
  const icons: Record<SubscriptionStatus, string> = {
    'active': '✅',
    'paused': '⏸️',
    'cancelled': '❌',
    'expired': '⏰',
    'pending': '⏳',
  };

  return icons[status] || '❓';
};

/**
 * Format large numbers with K, M suffixes
 */
export const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
};

/**
 * Generate payment reference number
 */
export const generatePaymentReference = (): string => {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substr(2, 5);
  return `PAY-${timestamp}-${random}`.toUpperCase();
};

/**
 * Validate UPI ID format
 */
export const isValidUPIId = (upiId: string): boolean => {
  const upiRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+$/;
  return upiRegex.test(upiId);
};

/**
 * Validate bank account number
 */
export const isValidAccountNumber = (accountNumber: string): boolean => {
  return /^\d{9,18}$/.test(accountNumber);
};

/**
 * Validate IFSC code
 */
export const isValidIFSC = (ifsc: string): boolean => {
  const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
  return ifscRegex.test(ifsc);
};

/**
 * Get payment method icon
 */
export const getPaymentMethodIcon = (method: PaymentMethod): string => {
  const icons: Record<PaymentMethod, string> = {
    'upi': '📱',
    'online': '💻',
    'cash': '💵',
    'bank_transfer': '🏦',
    'cheque': '📄',
  };

  return icons[method] || '💳';
};

/**
 * Calculate total amount with adjustments
 */
export const calculateTotalAmount = (
  baseAmount: number,
  discountAmount: number = 0,
  taxAmount: number = 0,
  adjustments: Array<{ type: string; amount: number }> = []
): number => {
  let total = baseAmount - discountAmount + taxAmount;
  
  adjustments.forEach(adjustment => {
    if (adjustment.type === 'discount' || adjustment.type === 'leave_credit' || adjustment.type === 'refund') {
      total -= adjustment.amount;
    } else {
      total += adjustment.amount;
    }
  });
  
  return Math.max(0, total);
};

/**
 * Get relative time string
 */
export const getRelativeTime = (date: string | Date): string => {
  const now = new Date();
  const targetDate = typeof date === 'string' ? new Date(date) : date;
  const diffInSeconds = Math.floor((now.getTime() - targetDate.getTime()) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`;
  if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)} months ago`;
  return `${Math.floor(diffInSeconds / 31536000)} years ago`;
};
