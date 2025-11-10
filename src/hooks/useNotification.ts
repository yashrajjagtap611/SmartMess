import { useNotifications } from '../contexts/NotificationContext';
import type { NotificationData } from '../services/notificationService';

// Simple hook for common notification operations
export const useNotification = () => {
  const {
    sendNotification,
    sendLocalNotification,
    sendSystemNotification,
    sendMealPlanNotification,
    sendPaymentReminder,
    sendJoinRequestNotification,
    requestPermission,
    permissionStatus,
    isSupported,
    unreadCount
  } = useNotifications();

  // Quick notification methods
  const notify = {
    // Send a simple notification
    simple: (title: string, message: string, data?: any) => 
      sendLocalNotification({ type: 'general', title, message, data }),

    // Send a success notification
    success: (title: string, message: string, data?: any) =>
      sendLocalNotification({ type: 'general', title, message, data }),

    // Send an error notification
    error: (title: string, message: string, data?: any) =>
      sendLocalNotification({ type: 'general', title, message, data }),

    // Send a warning notification
    warning: (title: string, message: string, data?: any) =>
      sendLocalNotification({ type: 'general', title, message, data }),

    // Send an info notification
    info: (title: string, message: string, data?: any) =>
      sendLocalNotification({ type: 'general', title, message, data }),

    // Send a meal plan update
    mealPlan: (messName: string, mealType: string, date: string) =>
      sendMealPlanNotification(messName, mealType, date),

    // Send a payment reminder
    payment: (userName: string, amount: number, dueDate: string) =>
      sendPaymentReminder(userName, amount, dueDate),

    // Send a join request
    joinRequest: (userName: string, messName: string) =>
      sendJoinRequestNotification(userName, messName),

    // Send a system update
    system: (title: string, message: string, data?: any) =>
      sendSystemNotification(title, message, data),

    // Send a custom notification
    custom: (notification: NotificationData) => sendNotification(notification)
  };

  return {
    // Quick notification methods
    notify,
    
    // Permission management
    requestPermission,
    permissionStatus,
    isSupported,
    
    // Status
    unreadCount,
    
    // Full service access
    sendNotification,
    sendLocalNotification,
    sendSystemNotification,
    sendMealPlanNotification,
    sendPaymentReminder,
    sendJoinRequestNotification
  };
};

export default useNotification; 