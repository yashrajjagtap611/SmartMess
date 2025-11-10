import { DashboardStats, RecentActivity } from './UserDashboard.types';

/**
 * Formats currency amount to Indian Rupee format
 */
export const formatCurrency = (amount: number): string => {
  return `₹${amount.toLocaleString('en-IN')}`;
};

/**
 * Formats date to a readable string
 */
export const formatDate = (dateString: string): string => {
  try {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch (error) {
    return 'Invalid Date';
  }
};

/**
 * Formats date to relative time (e.g., "2 days ago")
 */
export const formatRelativeTime = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`;
    
    return `${Math.floor(diffInDays / 365)} years ago`;
  } catch (error) {
    return 'Unknown';
  }
};

/**
 * Calculates dashboard statistics from billing data
 */
export const calculateDashboardStats = (bills: any[], messDetails?: any): DashboardStats => {
  const pendingBills = bills.filter(bill => bill.status === 'pending').length;
  const paidBills = bills.filter(bill => bill.status === 'paid').length;
  const totalAmount = bills.reduce((sum, bill) => sum + (bill.amount || 0), 0);
  
  return {
    totalBills: bills.length,
    pendingBills,
    paidBills,
    totalAmount,
    totalMesses: 0,
    totalMealPlanSubscriptions: 0,
    maxMesses: 3,
    maxMealPlanSubscriptions: 3,
    canJoinMore: true,
    messName: messDetails?.messName,
    memberSince: messDetails?.joinDate,
    currentPlan: messDetails?.mealPlan?.name
  };
};

/**
 * Generates recent activity from billing data
 */
export const generateRecentActivity = (bills: any[]): RecentActivity[] => {
  return bills.slice(0, 5).map(bill => ({
    id: bill.id,
    type: 'payment' as const,
    title: bill.status === 'paid' ? 'Payment Successful' : 'Payment Due',
    description: `${formatCurrency(bill.amount)} - ${bill.description}`,
    timestamp: bill.status === 'paid' ? bill.paidDate : bill.dueDate,
    status: bill.status === 'paid' ? 'success' : 'warning'
  }));
};

/**
 * Gets color classes based on activity status
 */
export const getActivityStatusColor = (status?: string): string => {
  switch (status) {
    case 'success':
      return 'text-green-500';
    case 'warning':
      return 'text-yellow-500';
    case 'info':
    default:
      return 'text-blue-500';
  }
};

/**
 * Gets the status badge color for bill status
 */
export const getBillStatusColor = (status: string): string => {
  switch (status) {
    case 'paid':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
    case 'pending':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
    case 'overdue':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
  }
};

/**
 * Validates if a mess is available for joining
 */
export const isMessAvailable = (mess: any): boolean => {
  return mess.capacity > mess.currentMembers;
};

/**
 * Formats mess capacity string
 */
export const formatCapacity = (capacity: number, currentMembers: number): string => {
  const available = capacity - currentMembers;
  return `${available} of ${capacity} spots available`;
};

/**
 * Generates a default avatar URL based on name
 */
export const generateAvatarUrl = (name: string): string => {
  const initials = name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
  
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff&size=128&format=svg&bold=true&initials=${initials}`;
};

/**
 * Debounce function for search inputs
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

/**
 * Handles error messages for API calls
 */
export const getErrorMessage = (error: any): string => {
  if (typeof error === 'string') return error;
  if (error?.message) return error.message;
  if (error?.response?.data?.message) return error.response.data.message;
  return 'An unexpected error occurred';
};

