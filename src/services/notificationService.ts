
import apiClient from './api';

export interface NotificationData {
  id?: string;
  type: 'join_request' | 'payment_request' | 'payment_received' | 'leave_request' | 'bill_due' | 'meal_plan_change' | 'general' | 'system';
  title: string;
  message: string;
  userId?: string;
  messId?: string;
  data?: any;
  isRead?: boolean;
  status?: 'pending' | 'approved' | 'rejected' | 'completed';
  createdAt?: Date;
}

export interface PushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

class NotificationService {
  private isInitialized = false;
  private pushSubscription: PushSubscription | null = null;

  constructor() {
    this.init();
  }

  private async init() {
    if (this.isInitialized) return;
    
    try {
      // Initialize PWA service - check if notifications are supported
      if ('Notification' in window) {
        console.log('Notification Service: Notifications supported');
      }
      
      // Set up push subscription if supported
      if ('serviceWorker' in navigator && 'PushManager' in window) {
        await this.setupPushSubscription();
      }
      
      this.isInitialized = true;
      console.log('Notification Service: Initialized successfully');
    } catch (error) {
      console.error('Notification Service: Initialization failed', error);
    }
  }

  private async setupPushSubscription(): Promise<void> {
    try {
      const registration = await navigator.serviceWorker.ready;
      const existingSubscription = await registration.pushManager.getSubscription();
      
      if (existingSubscription) {
        this.pushSubscription = {
          endpoint: existingSubscription.endpoint,
          keys: {
            p256dh: btoa(String.fromCharCode(...new Uint8Array(existingSubscription.getKey('p256dh')!))),
            auth: btoa(String.fromCharCode(...new Uint8Array(existingSubscription.getKey('auth')!)))
          }
        };
        console.log('Notification Service: Existing push subscription found');
        return;
      }

      // Request new subscription
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        console.log('Notification Service: Push notification permission denied');
        return;
      }

      // Subscribe to push notifications only if VAPID key is configured
      const vapidKey = import.meta.env['VITE_VAPID_PUBLIC_KEY'];
      if (!vapidKey) {
        console.log('Notification Service: VAPID public key not configured, skipping push subscription');
        return;
      }

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(vapidKey)
      });

      this.pushSubscription = {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('p256dh')!))),
          auth: btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('auth')!)))
        }
      };

      // Send subscription to backend
      await this.sendSubscriptionToServer(this.pushSubscription);
      
      console.log('Notification Service: Push subscription created successfully');
    } catch (error) {
      console.error('Notification Service: Failed to setup push subscription', error);
    }
  }

  private urlBase64ToUint8Array(base64String: string): ArrayBuffer {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray.buffer;
  }

  private async sendSubscriptionToServer(subscription: PushSubscription): Promise<void> {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) return;

      await apiClient.post('/notifications/push-subscription', {
        subscription,
        userId: localStorage.getItem('userInfo') ? JSON.parse(localStorage.getItem('userInfo')!).id : null
      });
    } catch (error) {
      console.error('Notification Service: Failed to send subscription to server', error);
    }
  }

  // Send local notification
  public async sendLocalNotification(notification: NotificationData): Promise<void> {
    try {
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(notification.title, {
          body: notification.message,
          icon: '/icons/icon-192x192.svg',
          badge: '/icons/badge-72x72.svg',
          tag: notification.id || 'SmartMess-notification',
          data: notification,
          requireInteraction: notification.type === 'bill_due' || notification.type === 'payment_request',
          silent: false
        });
      }
    } catch (error) {
      console.error('Notification Service: Failed to send local notification', error);
    }
  }

  // Send push notification through service worker
  public async sendPushNotification(notification: NotificationData): Promise<void> {
    try {
      // For now, we'll use the local notification as fallback
      // In a real implementation, this would send to a push service
      await this.sendLocalNotification(notification);
    } catch (error) {
      console.error('Notification Service: Failed to send push notification', error);
    }
  }

  // Create notification in backend and send to user
  public async createAndSendNotification(notification: NotificationData): Promise<void> {
    try {
      // Create notification in backend
      const response = await apiClient.post('/notifications/create', notification);
      const createdNotification = response.data.data;

      // Send local notification
      await this.sendLocalNotification(createdNotification);

      // If push subscription exists, send push notification
      if (this.pushSubscription) {
        await this.sendPushNotification(createdNotification);
      }
    } catch (error) {
      console.error('Notification Service: Failed to create and send notification', error);
    }
  }

  // Get notifications from backend
  public async getNotifications(userId: string, limit: number = 50): Promise<NotificationData[]> {
    try {
      const response = await apiClient.get(`/notifications/user/${userId}?limit=${limit}`);
      return response.data.data;
    } catch (error) {
      console.error('Notification Service: Failed to get notifications', error);
      return [];
    }
  }

  // Mark notification as read
  public async markAsRead(notificationId: string): Promise<void> {
    try {
      await apiClient.patch(`/notifications/${notificationId}/read`);
    } catch (error) {
      console.error('Notification Service: Failed to mark notification as read', error);
    }
  }

  // Mark all notifications as read
  public async markAllAsRead(userId: string): Promise<void> {
    try {
      await apiClient.patch(`/notifications/user/${userId}/read-all`);
    } catch (error) {
      console.error('Notification Service: Failed to mark all notifications as read', error);
    }
  }

  // Delete notification
  public async deleteNotification(notificationId: string): Promise<void> {
    try {
      await apiClient.delete(`/notifications/${notificationId}`);
    } catch (error) {
      console.error('Notification Service: Failed to delete notification', error);
    }
  }

  // Handle notification action (approve/reject)
  public async handleNotificationAction(notificationId: string, action: 'approve' | 'reject'): Promise<void> {
    try {
      await apiClient.post(`/notifications/${notificationId}/${action}`);
    } catch (error) {
      console.error('Notification Service: Failed to handle notification action', error);
    }
  }

  // Get notification actions based on type
  // private getNotificationActions(type: string): NotificationAction[] {
  //   switch (type) {
  //     case 'join_request':
  //       return [
  //         { action: 'approve', title: 'Approve', icon: '/icons/check.svg' },
  //         { action: 'reject', title: 'Reject', icon: '/icons/x.svg' }
  //       ];
  //     case 'payment_request':
  //       return [
  //         { action: 'view', title: 'View Details', icon: '/icons/check.svg' },
  //         { action: 'close', title: 'Close', icon: '/icons/x.svg' }
  //       ];
  //     case 'bill_due':
  //       return [
  //         { action: 'pay', title: 'Pay Now', icon: '/icons/check.svg' },
  //         { action: 'remind', title: 'Remind Later', icon: '/icons/clock.svg' }
  //       ];
  //     default:
  //       return [
  //         { action: 'view', title: 'View', icon: '/icons/check.svg' },
  //         { action: 'close', title: 'Close', icon: '/icons/x.svg' }
  //       ];
  //   }
  // }

  // Send system notification (for app updates, maintenance, etc.)
  public async sendSystemNotification(title: string, message: string, data?: any): Promise<void> {
    const systemNotification: NotificationData = {
      type: 'system',
      title,
      message,
      data
    };

    await this.sendLocalNotification(systemNotification);
  }

  // Send meal plan notification
  public async sendMealPlanNotification(messName: string, mealType: string, date: string): Promise<void> {
    const notification: NotificationData = {
      type: 'meal_plan_change',
      title: 'New Meal Plan Available',
      message: `${messName} has updated the ${mealType} menu for ${date}`,
      data: { messName, mealType, date }
    };

    await this.createAndSendNotification(notification);
  }

  // Send payment reminder
  public async sendPaymentReminder(userName: string, amount: number, dueDate: string): Promise<void> {
    const notification: NotificationData = {
      type: 'bill_due',
      title: 'Payment Reminder',
      message: `Hi ${userName}, your payment of $${amount} is due on ${dueDate}`,
      data: { userName, amount, dueDate }
    };

    await this.createAndSendNotification(notification);
  }

  // Send join request notification
  public async sendJoinRequestNotification(userName: string, messName: string): Promise<void> {
    const notification: NotificationData = {
      type: 'join_request',
      title: 'New Join Request',
      message: `${userName} wants to join ${messName}`,
      data: { userName, messName }
    };

    await this.createAndSendNotification(notification);
  }

  // Check if notifications are supported
  public isSupported(): boolean {
    return 'Notification' in window && 'serviceWorker' in navigator;
  }

  // Check if push notifications are supported
  public isPushSupported(): boolean {
    return 'PushManager' in window && 'serviceWorker' in navigator;
  }

  // Get notification permission status
  public getPermissionStatus(): NotificationPermission {
    return Notification.permission;
  }

  // Request notification permission
  public async requestPermission(): Promise<boolean> {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return false;
  }
}


// Create and export singleton instance
const notificationService = new NotificationService();
export default notificationService; 