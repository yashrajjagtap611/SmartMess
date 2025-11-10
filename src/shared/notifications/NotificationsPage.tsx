import React, { useEffect, useRef, useState } from 'react';
import { 
  BellIcon, 
  CheckCircleIcon, 
  XMarkIcon,
  ClockIcon,
  UserIcon,
  CreditCardIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline';
import messService from '@/services/api/messService';
import { NotificationsSection } from './NotificationsSection';
import type { CommonNotification, NotificationAction, NotificationTabConfig } from './types';

const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<CommonNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const inFlightRef = useRef<AbortController | null>(null);
  const lastSignatureRef = useRef<string>('');

  useEffect(() => {
    const init = async () => {
      try {
        console.log('NotificationsPage: Starting initialization...');
        await loadNotifications();
        try {
          await messService.markAllNotificationsAsRead();
          setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        } catch (markError) {
          console.warn('NotificationsPage: Failed to mark all as read:', markError);
        }
      } catch (initError) {
        console.error('NotificationsPage: Initialization failed:', initError);
        setError(initError instanceof Error ? initError.message : 'Failed to load notifications');
      }
    };
    init();

    const interval = setInterval(() => {
      loadNotifications(true).then(async (changed) => {
        if (changed) {
          try {
            await messService.markAllNotificationsAsRead();
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
          } catch (markError) {
            console.warn('NotificationsPage: Failed to mark all as read in background:', markError);
          }
        }
      }).catch(intervalError => {
        console.error('NotificationsPage: Background update failed:', intervalError);
      });
    }, 15000);

    return () => {
      clearInterval(interval);
      if (inFlightRef.current) inFlightRef.current.abort();
    };
  }, []);

  const computeSignature = (items: CommonNotification[]): string => {
    const normalized = items
      .map((n: any) => ({ id: n._id || n.id, isRead: n.isRead, status: n.status, t: n.updatedAt || n.createdAt }))
      .sort((a, b) => String(a.id).localeCompare(String(b.id)));
    return JSON.stringify(normalized);
  };

  const dedupe = (arr: any[]) => arr.filter((n: any, index: number, self: any[]) => index === self.findIndex((x: any) => (x._id || x.id) === (n._id || n.id)));

  const loadNotifications = async (background: boolean = false): Promise<boolean> => {
    try {
      if (!background) setLoading(true);
      if (inFlightRef.current) inFlightRef.current.abort();
      const controller = new AbortController();
      inFlightRef.current = controller;

      console.log('NotificationsPage: Loading notifications...');
      const response = await messService.getNotifications();
      console.log('NotificationsPage: API response:', response);
      
      if (response.success && response.data) {
        const unique = dedupe(response.data);
        console.log('NotificationsPage: Unique notifications:', unique.length);
        const nextSignature = computeSignature(unique);
        if (nextSignature !== lastSignatureRef.current) {
          setNotifications(unique);
          lastSignatureRef.current = nextSignature;
          setError(null); // Clear any previous errors
          return true;
        }
      } else {
        console.warn('NotificationsPage: API returned no data or failed');
        if (!background) {
          setError('Failed to load notifications');
        }
      }
    } catch (error) {
      console.error('NotificationsPage: load error', error);
      if (!background) {
        setError(error instanceof Error ? error.message : 'Failed to load notifications');
      }
    } finally {
      if (!background) setLoading(false);
    }
    return false;
  };

  const handleAction = async (notificationId: string, action: NotificationAction) => {
    try {
      console.log('NotificationsPage: Handling action:', { notificationId, action });
      if (action === 'mark_read') {
        await messService.markNotificationAsRead(notificationId);
      } else if (action === 'delete') {
        setNotifications(prev => prev.filter(notif => ((notif as any)._id !== notificationId && notif.id !== notificationId)));
        await messService.deleteNotification(notificationId);
        return;
      } else if (action === 'approve' || action === 'reject') {
        await messService.handleNotificationAction(notificationId, action);
      }
      setNotifications(prev => prev.map(notif => {
        if ((notif as any)._id === notificationId || notif.id === notificationId) {
          if (action === 'mark_read') return { ...notif, isRead: true };
          if (action === 'approve') return { ...notif, status: 'approved', isRead: true } as CommonNotification;
          if (action === 'reject') return { ...notif, status: 'rejected', isRead: true } as CommonNotification;
        }
        return notif;
      }));
    } catch (error) {
      console.error('NotificationsPage: action error', error);
      if (action === 'delete') {
        loadNotifications(true);
      }
    }
  };

  const renderIcon = (n: CommonNotification) => {
    switch (n.type) {
      case 'join_request':
      case 'subscription_request': {
        const isSuccess = n.status === 'approved' || n.status === 'completed';
        return n.status === 'pending' ? <ClockIcon className="w-5 h-5 text-yellow-500" /> : 
               isSuccess ? <CheckCircleIcon className="w-5 h-5 text-green-500" /> : 
               <XMarkIcon className="w-5 h-5 text-red-500" />;
      }
      case 'payment_request':
      case 'payment_received':
        return <CreditCardIcon className="w-5 h-5 text-green-500" />;
      case 'leave_request':
        return <UserIcon className="w-5 h-5 text-blue-500" />;
      case 'bill_due':
        return <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />;
      default:
        return <InformationCircleIcon className="w-5 h-5 text-gray-500" />;
    }
  };

  const tabs: NotificationTabConfig[] = [
    { key: 'requests', label: 'Requests', filter: (n) => ['join_request', 'leave_request', 'subscription_request'].includes(n.type) },
    { key: 'payments', label: 'Payments', filter: (n) => ['payment_received', 'bill_due', 'payment_request'].includes(n.type) },
    { key: 'general', label: 'General', filter: (n) => n.type === 'general' || n.type === 'meal_plan_change' },
  ];

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <strong>Error:</strong> {error}
          <button 
            onClick={() => {
              setError(null);
              loadNotifications();
            }} 
            className="ml-4 text-red-700 hover:text-red-900 underline"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-SmartMess-light-bg dark:SmartMess-dark-bg dark:bg-SmartMess-light-bg dark:SmartMess-dark-bg transition-all duration-300">
      <div className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-SmartMess-light-text dark:SmartMess-dark-text dark:text-SmartMess-light-text dark:SmartMess-dark-text">Notifications</h1>
            <p className="text-sm text-SmartMess-light-text dark:SmartMess-dark-text-muted dark:text-SmartMess-light-text dark:SmartMess-dark-text-muted">
              {notifications.length} total • {notifications.filter(n => !n.isRead).length} unread
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <BellIcon className="w-6 h-6 text-SmartMess-light-primary dark:SmartMess-dark-primary dark:text-SmartMess-light-primary dark:SmartMess-dark-primary" />
          </div>
        </div>

        <NotificationsSection
          title="Notifications"
          tabs={tabs}
          notifications={notifications}
          onAction={handleAction}
          renderIcon={renderIcon}
        />
      </div>
    </div>
  );
};

export default NotificationsPage; 