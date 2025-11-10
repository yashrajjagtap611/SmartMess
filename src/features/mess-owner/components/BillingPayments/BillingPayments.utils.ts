import type { MessOwnerBillingData, MemberBillingInfo } from './BillingPayments.types';

/**
 * Filter members based on search query and status
 */
export const filterMembers = (
  members: MemberBillingInfo[],
  searchQuery: string,
  statusFilter: string
): MemberBillingInfo[] => {
  return members.filter(member => {
    const matchesSearch = !searchQuery || 
      member.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.userEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.userPhone.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = !statusFilter || member.paymentStatus === statusFilter;
    
    return matchesSearch && matchesStatus;
  });
};

/**
 * Calculate collection rate percentage
 */
export const calculateCollectionRate = (billingData: MessOwnerBillingData): number => {
  const { summary } = billingData;
  if (summary.totalRevenue === 0) return 0;
  
  const collectedAmount = summary.totalRevenue - summary.pendingAmount - summary.overdueAmount;
  return (collectedAmount / summary.totalRevenue) * 100;
};

/**
 * Get overdue members
 */
export const getOverdueMembers = (members: MemberBillingInfo[]): MemberBillingInfo[] => {
  return members.filter(member => member.paymentStatus === 'overdue');
};

/**
 * Get pending members
 */
export const getPendingMembers = (members: MemberBillingInfo[]): MemberBillingInfo[] => {
  return members.filter(member => member.paymentStatus === 'pending');
};

/**
 * Get members by status
 */
export const getMembersByStatus = (members: MemberBillingInfo[], status: string): MemberBillingInfo[] => {
  return members.filter(member => member.paymentStatus === status);
};

/**
 * Calculate total amount by status
 */
export const calculateTotalByStatus = (members: MemberBillingInfo[], status: string): number => {
  return members
    .filter(member => member.paymentStatus === status)
    .reduce((sum, member) => sum + member.amount, 0);
};

/**
 * Format currency for display
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

/**
 * Format date for display
 */
export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

/**
 * Format date and time for display
 */
export const formatDateTime = (dateString: string): string => {
  return new Date(dateString).toLocaleString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Get status color class
 */
export const getStatusColor = (status: string): string => {
  switch (status.toLowerCase()) {
    case 'active':
    case 'paid':
    case 'success':
      return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20';
    case 'pending':
      return 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20';
    case 'overdue':
    case 'failed':
      return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20';
    case 'inactive':
    case 'cancelled':
      return 'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/20';
    default:
      return 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20';
  }
};

/**
 * Get status text
 */
export const getStatusText = (status: string): string => {
  switch (status) {
    case 'paid':
      return 'Paid';
    case 'pending':
      return 'Pending';
    case 'overdue':
      return 'Overdue';
    case 'failed':
      return 'Failed';
    case 'cancelled':
      return 'Cancelled';
    case 'active':
      return 'Active';
    case 'completed':
      return 'Completed';
    case 'verified':
      return 'Verified';
    case 'rejected':
      return 'Rejected';
    case 'success':
      return 'Success';
    default:
      return status.charAt(0).toUpperCase() + status.slice(1);
  }
};

/**
 * Get status icon
 */
export const getStatusIcon = (status: string): string => {
  switch (status.toLowerCase()) {
    case 'active':
    case 'paid':
    case 'success':
    case 'verified':
      return '✓';
    case 'pending':
      return '⏳';
    case 'overdue':
    case 'failed':
      return '⚠️';
    case 'inactive':
    case 'cancelled':
    case 'rejected':
      return '✗';
    default:
      return 'ℹ️';
  }
};

export const calculateDaysOverdue = (dueDate: string): number => {
  const due = new Date(dueDate);
  const now = new Date();
  const diffTime = now.getTime() - due.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
};

/**
 * Get overdue color based on days
 */
export const getOverdueColor = (daysOverdue: number): string => {
  if (daysOverdue === 0) return 'text-green-600 dark:text-green-400';
  if (daysOverdue <= 7) return 'text-yellow-600 dark:text-yellow-400';
  if (daysOverdue <= 30) return 'text-orange-600 dark:text-orange-400';
  return 'text-red-600 dark:text-red-400';
};

/**
 * Sort members by various criteria
 */
export const sortMembers = (
  members: MemberBillingInfo[],
  sortBy: 'name' | 'amount' | 'dueDate' | 'status',
  order: 'asc' | 'desc' = 'asc'
): MemberBillingInfo[] => {
  return [...members].sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case 'name':
        comparison = a.userName.localeCompare(b.userName);
        break;
      case 'amount':
        comparison = a.amount - b.amount;
        break;
      case 'dueDate':
        const dateA = a.dueDate ? new Date(a.dueDate).getTime() : 0;
        const dateB = b.dueDate ? new Date(b.dueDate).getTime() : 0;
        comparison = dateA - dateB;
        break;
      case 'status':
        comparison = a.paymentStatus.localeCompare(b.paymentStatus);
        break;
    }
    
    return order === 'asc' ? comparison : -comparison;
  });
};

