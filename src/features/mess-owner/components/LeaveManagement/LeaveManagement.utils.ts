import type { LeaveRequest } from './LeaveManagement.types';

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const getStatusColor = (status: LeaveRequest['status']): string => {
  switch (status) {
    case 'approved':
      return 'bg-green-100 text-green-700';
    case 'cancelled':
      return 'bg-gray-100 text-gray-700';
    case 'extended':
      return 'bg-blue-100 text-blue-700';
    case 'rejected':
      return 'bg-red-100 text-red-700';
    case 'pending':
    default:
      return 'bg-yellow-100 text-yellow-700';
  }
};

export const getStatusBadge = (status: LeaveRequest['status']): string => {
  switch (status) {
    case 'approved':
      return 'Approved';
    case 'rejected':
      return 'Rejected';
    case 'cancelled':
      return 'Cancelled';
    case 'extended':
      return 'Extended';
    case 'pending':
    default:
      return 'Pending';
  }
};

// Mess off day utility functions
export const formatMessOffDayDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  });
};

export const getMessOffDayStatusColor = (status: 'pending' | 'approved' | 'rejected'): string => {
  switch (status) {
    case 'approved':
      return 'bg-green-100 text-green-700';
    case 'rejected':
      return 'bg-red-100 text-red-700';
    case 'pending':
    default:
      return 'bg-yellow-100 text-yellow-700';
  }
};

export const getMessOffDayStatusBadge = (status: 'pending' | 'approved' | 'rejected'): string => {
  switch (status) {
    case 'approved':
      return 'Approved';
    case 'rejected':
      return 'Rejected';
    case 'pending':
    default:
      return 'Pending';
  }
};

export const calculateOffDayImpact = (
  _offDate: string,
  billingDeduction: boolean,
  subscriptionExtension: boolean,
  extensionDays: number
): {
  affectedMembers: number;
  totalBillingDeduction: number;
  totalExtensionDays: number;
} => {
  // This would typically fetch from API, but for now return mock data
  return {
    affectedMembers: 25, // Mock data
    totalBillingDeduction: billingDeduction ? 1250 : 0, // Mock calculation
    totalExtensionDays: subscriptionExtension ? extensionDays : 0
  };
};

export const validateMessOffDayRequest = (data: {
  offDate: string;
  reason: string;
  mealTypes: ('breakfast' | 'lunch' | 'dinner')[];
  billingDeduction: boolean;
  subscriptionExtension: boolean;
  extensionDays: number;
}): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!data.offDate) {
    errors.push('Off date is required');
  } else {
    const selectedDate = new Date(data.offDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDate < today) {
      errors.push('Off date cannot be in the past');
    }
  }

  if (!data.reason.trim()) {
    errors.push('Reason is required');
  } else if (data.reason.trim().length < 10) {
    errors.push('Reason must be at least 10 characters long');
  }

  if (!data.mealTypes || data.mealTypes.length === 0) {
    errors.push('At least one meal type must be selected');
  }

  if (data.subscriptionExtension && data.extensionDays <= 0) {
    errors.push('Extension days must be greater than 0 when subscription extension is enabled');
  }

  if (data.subscriptionExtension && data.extensionDays > 30) {
    errors.push('Extension days cannot exceed 30 days');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const getDayName = (dayOfWeek: number): string => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[dayOfWeek] || 'Unknown';
};

export const getNextOffDay = (settings: {
  pattern: 'weekly' | 'monthly';
  weeklySettings?: { dayOfWeek: number; enabled: boolean };
  monthlySettings?: { dayOfMonth: number; enabled: boolean };
}): Date | null => {
  const today = new Date();
  
  if (settings.pattern === 'weekly' && settings.weeklySettings?.enabled) {
    const targetDay = settings.weeklySettings.dayOfWeek;
    const currentDay = today.getDay();
    const daysUntilTarget = (targetDay - currentDay + 7) % 7;
    
    const nextOffDay = new Date(today);
    nextOffDay.setDate(today.getDate() + (daysUntilTarget === 0 ? 7 : daysUntilTarget));
    return nextOffDay;
  }
  
  if (settings.pattern === 'monthly' && settings.monthlySettings?.enabled) {
    const targetDay = settings.monthlySettings.dayOfMonth;
    const nextOffDay = new Date(today.getFullYear(), today.getMonth(), targetDay);
    
    // If the target day has passed this month, move to next month
    if (nextOffDay < today) {
      nextOffDay.setMonth(nextOffDay.getMonth() + 1);
    }
    
    return nextOffDay;
  }
  
  return null;
};

export const calculateLeaveDays = (startDate: string, endDate: string): number => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays + 1; // Include both start and end dates
};

export const validateLeaveRequest = (data: { startDate: string; endDate: string; reason: string }): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!data.startDate) {
    errors.push('Start date is required');
  }

  if (!data.endDate) {
    errors.push('End date is required');
  }

  if (data.startDate && data.endDate) {
    const start = new Date(data.startDate);
    const end = new Date(data.endDate);
    
    if (start > end) {
      errors.push('Start date cannot be after end date');
    }
  }

  if (!data.reason || data.reason.trim().length < 10) {
    errors.push('Reason must be at least 10 characters long');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};



