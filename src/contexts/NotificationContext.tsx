import React, { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import notificationService from '../services/notificationService';

// Use the same NotificationData interface as the service
export interface NotificationData {
  id?: string;
  userId?: string;
  title: string;
  message: string;
  type: 'system' | 'join_request' | 'payment_request' | 'payment_received' | 'leave_request' | 'bill_due' | 'meal_plan_change' | 'general';
  isRead?: boolean;
  status?: 'pending' | 'approved' | 'rejected' | 'completed';
  createdAt?: Date;
  data?: any;
}

interface NotificationContextType {
  // Permission and support
  isSupported: boolean;
  isPushSupported: boolean;
  permissionStatus: NotificationPermission;
  requestPermission: () => Promise<boolean>;
  
  // Notification management
  notifications: NotificationData[];
  unreadCount: number;
  isLoading: boolean;
  
  // Actions
  sendNotification: (notification: NotificationData) => Promise<void>;
  sendLocalNotification: (notification: NotificationData) => Promise<void>;
  sendSystemNotification: (title: string, message: string, data?: any) => Promise<void>;
  sendMealPlanNotification: (messName: string, mealType: string, date: string) => Promise<void>;
  sendPaymentReminder: (userName: string, amount: number, dueDate: string) => Promise<void>;
  sendJoinRequestNotification: (userName: string, messName: string) => Promise<void>;
  
  // Notification management
  getNotifications: (userId: string, limit?: number) => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: (userId: string) => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
  handleNotificationAction: (notificationId: string, action: 'approve' | 'reject') => Promise<void>;
  
  // Refresh and sync
  refreshNotifications: () => Promise<void>;
  clearNotifications: () => void;
}

interface NotificationProviderProps {
  children: ReactNode;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission>('default');
  const [isSupported, setIsSupported] = useState(false);
  const [isPushSupported, setIsPushSupported] = useState(false);

  // Initialize notification service
  useEffect(() => {
    const initNotifications = async () => {
      try {
        // Check support
        setIsSupported(notificationService.isSupported());
        setIsPushSupported(notificationService.isPushSupported());
        setPermissionStatus(notificationService.getPermissionStatus());

        // Set up service worker message handling
        setupServiceWorkerMessaging();

        console.log('Notification Context: Initialized successfully');
      } catch (error) {
        console.error('Notification Context: Initialization failed', error);
      }
    };

    initNotifications();
  }, []);

  // Set up service worker messaging
  const setupServiceWorkerMessaging = () => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        console.log('Notification Context: Service worker message received', event.data);
        
        if (event.data.type === 'NOTIFICATION_ACTION') {
          handleServiceWorkerNotificationAction(event.data);
        }
      });
    }
  };

  // Handle service worker notification actions
  const handleServiceWorkerNotificationAction = async (data: any) => {
    try {
      if (data.action === 'approve' || data.action === 'reject') {
        await handleNotificationAction(data.notificationId, data.action);
      } else if (data.action === 'markAsRead') {
        await markAsRead(data.notificationId);
      }
    } catch (error) {
      console.error('Notification Context: Error handling service worker action', error);
    }
  };

  // Request notification permission
  const requestPermission = async (): Promise<boolean> => {
    try {
      const granted = await notificationService.requestPermission();
      setPermissionStatus(notificationService.getPermissionStatus());
      return granted;
    } catch (error) {
      console.error('Notification Context: Error requesting permission', error);
      return false;
    }
  };

  // Send notification
  const sendNotification = async (notification: NotificationData): Promise<void> => {
    try {
      await notificationService.createAndSendNotification(notification);
      
      // Add to local notifications if it's for current user
      const currentUserId = localStorage.getItem('userId');
      if (notification.userId === currentUserId) {
        setNotifications(prev => [notification, ...prev]);
        if (!notification.isRead) {
          setUnreadCount(prev => prev + 1);
        }
      }
    } catch (error) {
      console.error('Notification Context: Error sending notification', error);
    }
  };

  // Send local notification
  const sendLocalNotification = async (notification: NotificationData): Promise<void> => {
    try {
      await notificationService.sendLocalNotification(notification);
      
      // Add to local notifications
      setNotifications(prev => [notification, ...prev]);
      if (!notification.isRead) {
        setUnreadCount(prev => prev + 1);
      }
    } catch (error) {
      console.error('Notification Context: Error sending local notification', error);
    }
  };

  // Send system notification
  const sendSystemNotification = async (title: string, message: string, data?: any): Promise<void> => {
    try {
      await notificationService.sendSystemNotification(title, message, data);
    } catch (error) {
      console.error('Notification Context: Error sending system notification', error);
    }
  };

  // Send meal plan notification
  const sendMealPlanNotification = async (messName: string, mealType: string, date: string): Promise<void> => {
    try {
      await notificationService.sendMealPlanNotification(messName, mealType, date);
    } catch (error) {
      console.error('Notification Context: Error sending meal plan notification', error);
    }
  };

  // Send payment reminder
  const sendPaymentReminder = async (userName: string, amount: number, dueDate: string): Promise<void> => {
    try {
      await notificationService.sendPaymentReminder(userName, amount, dueDate);
    } catch (error) {
      console.error('Notification Context: Error sending payment reminder', error);
    }
  };

  // Send join request notification
  const sendJoinRequestNotification = async (userName: string, messName: string): Promise<void> => {
    try {
      await notificationService.sendJoinRequestNotification(userName, messName);
    } catch (error) {
      console.error('Notification Context: Error sending join request notification', error);
    }
  };

  // Get notifications
  const getNotifications = async (userId: string, limit: number = 50): Promise<void> => {
    try {
      setIsLoading(true);
      const fetchedNotifications = await notificationService.getNotifications(userId, limit);
      setNotifications(fetchedNotifications);
      // Set local flags to drive UI for payment approval/rejection
      try {
        fetchedNotifications.forEach((n: any) => {
          if (!n) return;
          const type = n.type; const status = n.status;
          const messId = (n as any).messId; const mealPlanId = n.data?.mealPlanId || n.data?.planId;
          if (!messId || !mealPlanId) return;
          if (type === 'payment_received' && (status === 'approved' || status === 'completed')) {
            // Payment approved - no need for localStorage flags, API will handle this
            console.log('Payment approved notification received:', { messId, mealPlanId });
          }
          if (type === 'payment_received' && status === 'rejected') {
            // Payment rejected - no need for localStorage flags, API will handle this
            console.log('Payment rejected notification received:', { messId, mealPlanId, reason: n.data?.remarks });
          }
        });
      } catch {}
      
      // Calculate unread count
      const unread = fetchedNotifications.filter(n => !n.isRead).length;
      setUnreadCount(unread);
    } catch (error) {
      console.error('Notification Context: Error fetching notifications', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Mark notification as read
  const markAsRead = async (notificationId: string): Promise<void> => {
    try {
      await notificationService.markAsRead(notificationId);
      
      // Update local state
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Notification Context: Error marking notification as read', error);
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async (userId: string): Promise<void> => {
    try {
      await notificationService.markAllAsRead(userId);
      
      // Update local state
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Notification Context: Error marking all notifications as read', error);
    }
  };

  // Delete notification
  const deleteNotification = async (notificationId: string): Promise<void> => {
    try {
      await notificationService.deleteNotification(notificationId);
      
      // Update local state
      setNotifications(prev => {
        const notification = prev.find(n => n.id === notificationId);
        const newNotifications = prev.filter(n => n.id !== notificationId);
        
        // Update unread count if deleted notification was unread
        if (notification && !notification.isRead) {
          setUnreadCount(prev => Math.max(0, prev - 1));
        }
        
        return newNotifications;
      });
    } catch (error) {
      console.error('Notification Context: Error deleting notification', error);
    }
  };

  // Handle notification action
  const handleNotificationAction = async (notificationId: string, action: 'approve' | 'reject'): Promise<void> => {
    try {
      await notificationService.handleNotificationAction(notificationId, action);
      
      // Mark as read after action
      await markAsRead(notificationId);
    } catch (error) {
      console.error('Notification Context: Error handling notification action', error);
    }
  };

  // Refresh notifications
  const refreshNotifications = async (): Promise<void> => {
    try {
      const currentUserId = localStorage.getItem('userId');
      if (currentUserId) {
        await getNotifications(currentUserId);
      }
    } catch (error) {
      console.error('Notification Context: Error refreshing notifications', error);
    }
  };

  // Clear notifications
  const clearNotifications = (): void => {
    setNotifications([]);
    setUnreadCount(0);
  };

  const value: NotificationContextType = {
    isSupported,
    isPushSupported,
    permissionStatus,
    requestPermission,
    notifications,
    unreadCount,
    isLoading,
    sendNotification,
    sendLocalNotification,
    sendSystemNotification,
    sendMealPlanNotification,
    sendPaymentReminder,
    sendJoinRequestNotification,
    getNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    handleNotificationAction,
    refreshNotifications,
    clearNotifications,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}; 