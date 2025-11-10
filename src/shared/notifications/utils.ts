import type { CommonNotification, NotificationStatus, NotificationPriority, NotificationType } from './types';

export const getNotificationId = (notification: CommonNotification): string => {
  return notification.id || (notification as any)._id || Math.random().toString(36).substring(2);
};

export const formatNotificationTime = (time: Date | string | number): string => {
  if (!time) return 'Unknown';
  
  const date = new Date(time);
  if (isNaN(date.getTime())) return 'Invalid date';
  
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
  
  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  if (diffInHours < 24) return `${diffInHours}h ago`;
  if (diffInDays < 7) return `${diffInDays}d ago`;
  
  return date.toLocaleDateString();
};

export const getStatusBadge = (status: NotificationStatus) => {
  const configs = {
    pending: {
      text: 'Pending',
      colorClassNames: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300'
    },
    approved: {
      text: 'Approved',
      colorClassNames: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
    },
    rejected: {
      text: 'Rejected',
      colorClassNames: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
    },
    completed: {
      text: 'Completed',
      colorClassNames: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300'
    },
    failed: {
      text: 'Failed',
      colorClassNames: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
    },
    cancelled: {
      text: 'Cancelled',
      colorClassNames: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300'
    }
  };
  
  return configs[status] || configs.pending;
};

export const getPriorityBadge = (priority: NotificationPriority) => {
  const configs = {
    low: {
      text: 'Low',
      colorClassNames: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300'
    },
    medium: {
      text: 'Medium',
      colorClassNames: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300'
    },
    high: {
      text: 'High',
      colorClassNames: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300'
    },
    urgent: {
      text: 'Urgent',
      colorClassNames: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
    }
  };
  
  return configs[priority] || configs.medium;
};

export const getNotificationIcon = (type: NotificationType, status?: NotificationStatus) => {
  const iconMap = {
    join_request: status === 'pending' ? '👤' : status === 'approved' ? '✅' : '❌',
    payment_request: '💳',
    payment_received: '💰',
    payment_reminder: '⏰',
    payment_overdue: '🚨',
    payment_success: '✅',
    payment_failed: '❌',
    leave_request: '🏖️',
    bill_due: '📋',
    meal_plan_change: '🍽️',
    general: 'ℹ️',
    subscription_request: '📝',
    subscription_renewal: '🔄',
    payment_method_update: '🔧',
    system: '⚙️'
  };
  
  return iconMap[type] || 'ℹ️';
};

export const getNotificationColor = (type: NotificationType, priority?: NotificationPriority): string => {
  // Priority-based colors override type-based colors
  if (priority === 'urgent') return 'border-red-500 bg-red-50 dark:bg-red-900/10';
  if (priority === 'high') return 'border-orange-500 bg-orange-50 dark:bg-orange-900/10';
  
  const colorMap = {
    join_request: 'border-blue-500 bg-blue-50 dark:bg-blue-900/10',
    payment_request: 'border-purple-500 bg-purple-50 dark:bg-purple-900/10',
    payment_received: 'border-green-500 bg-green-50 dark:bg-green-900/10',
    payment_reminder: 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/10',
    payment_overdue: 'border-red-500 bg-red-50 dark:bg-red-900/10',
    payment_success: 'border-green-500 bg-green-50 dark:bg-green-900/10',
    payment_failed: 'border-red-500 bg-red-50 dark:bg-red-900/10',
    leave_request: 'border-orange-500 bg-orange-50 dark:bg-orange-900/10',
    bill_due: 'border-red-500 bg-red-50 dark:bg-red-900/10',
    meal_plan_change: 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/10',
    general: 'border-gray-500 bg-gray-50 dark:bg-gray-900/10',
    subscription_request: 'border-blue-500 bg-blue-50 dark:bg-blue-900/10',
    subscription_renewal: 'border-cyan-500 bg-cyan-50 dark:bg-cyan-900/10',
    payment_method_update: 'border-teal-500 bg-teal-50 dark:bg-teal-900/10',
    system: 'border-gray-500 bg-gray-50 dark:bg-gray-900/10'
  };
  
  return colorMap[type] || 'border-gray-500 bg-gray-50 dark:bg-gray-900/10';
};

export const sortByPriorityAndTime = (notifications: CommonNotification[]): CommonNotification[] => {
  const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
  
  return [...notifications].sort((a, b) => {
    // First sort by priority
    const priorityA = priorityOrder[a.priority || 'medium'];
    const priorityB = priorityOrder[b.priority || 'medium'];
    
    if (priorityA !== priorityB) {
      return priorityB - priorityA;
    }
    
    // Then sort by time (newest first)
    const timeA = new Date(a.createdAt || a.timestamp || 0).getTime();
    const timeB = new Date(b.createdAt || b.timestamp || 0).getTime();
    
    return timeB - timeA;
  });
};

export const filterNotifications = (
  notifications: CommonNotification[],
  filters: {
    type?: NotificationType;
    status?: NotificationStatus;
    priority?: NotificationPriority;
    isRead?: boolean;
    messId?: string;
    search?: string;
  }
): CommonNotification[] => {
  return notifications.filter(notification => {
    if (filters.type && notification.type !== filters.type) return false;
    if (filters.status && notification.status !== filters.status) return false;
    if (filters.priority && notification.priority !== filters.priority) return false;
    if (filters.isRead !== undefined && notification.isRead !== filters.isRead) return false;
    if (filters.messId && notification.messId !== filters.messId) return false;
    
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const matchesTitle = notification.title.toLowerCase().includes(searchLower);
      const matchesMessage = notification.message.toLowerCase().includes(searchLower);
      if (!matchesTitle && !matchesMessage) return false;
    }
    
    return true;
  });
};

export const getNotificationStats = (notifications: CommonNotification[]) => {
  const stats = {
    total: notifications.length,
    unread: notifications.filter(n => !n.isRead).length,
    byType: {} as Record<NotificationType, number>,
    byStatus: {} as Record<NotificationStatus, number>,
    byPriority: {} as Record<NotificationPriority, number>,
    overduePayments: 0,
    pendingApprovals: 0
  };
  
  // Initialize counters
  const types: NotificationType[] = [
    'join_request', 'payment_request', 'payment_received', 'payment_reminder',
    'payment_overdue', 'payment_success', 'payment_failed', 'leave_request',
    'bill_due', 'meal_plan_change', 'general', 'subscription_request',
    'subscription_renewal', 'payment_method_update', 'system'
  ];
  
  const statuses: NotificationStatus[] = ['pending', 'approved', 'rejected', 'completed', 'failed', 'cancelled'];
  const priorities: NotificationPriority[] = ['low', 'medium', 'high', 'urgent'];
  
  types.forEach(type => stats.byType[type] = 0);
  statuses.forEach(status => stats.byStatus[status] = 0);
  priorities.forEach(priority => stats.byPriority[priority] = 0);
  
  // Count notifications
  notifications.forEach(notification => {
    stats.byType[notification.type]++;
    stats.byStatus[notification.status]++;
    stats.byPriority[notification.priority || 'medium']++;
    
    if (notification.type === 'payment_overdue') {
      stats.overduePayments++;
    }
    
    if (notification.status === 'pending' && 
        ['join_request', 'payment_request', 'leave_request'].includes(notification.type)) {
      stats.pendingApprovals++;
    }
  });
  
  return stats;
};

export const isNotificationExpired = (notification: CommonNotification): boolean => {
  if (!notification.expiresAt) return false;
  return new Date() > new Date(notification.expiresAt);
};

export const getNotificationSummary = (notification: CommonNotification): string => {
  const { type, data, status } = notification;
  
  switch (type) {
    case 'payment_reminder':
      if (data?.overdue) {
        return `Payment overdue: ₹${data.amount} (Late fees: ₹${data.lateFees || 0})`;
      }
      return `Payment due: ₹${data?.amount} on ${data?.dueDate ? new Date(data.dueDate).toLocaleDateString() : 'unknown date'}`;
    
    case 'payment_success':
      return `Payment successful: ₹${data?.amount} via ${data?.['method']}`;
    
    case 'payment_failed':
      return `Payment failed: ₹${data?.amount} via ${data?.['method']}`;
    
    case 'join_request':
      return `Join request ${status === 'pending' ? 'pending approval' : status === 'approved' ? 'approved' : 'rejected'}`;
    
    case 'leave_request':
      return `Leave request for ${data?.['leaveDays']} days ${status === 'pending' ? 'pending approval' : status === 'approved' ? 'approved' : 'rejected'}`;
    
    default:
      return notification.message;
  }
}; 