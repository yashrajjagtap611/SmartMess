import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card';
import { CheckCircleIcon, XMarkIcon, ClockIcon, InformationCircleIcon, CreditCardIcon, UserIcon } from '@heroicons/react/24/outline';
import { formatNotificationTime, getStatusBadge, getNotificationId } from './utils';
import type { CommonNotification, NotificationAction } from './types';
import ActionModal from '@/components/common/ActionModal';
import InsufficientCreditsDialog from '@/components/common/InsufficientCreditsDialog';

type FilterStatus = 'all' | 'unread' | 'read' | 'pending' | 'approved' | 'rejected';

interface NotificationsSectionNewProps {
  notifications: CommonNotification[];
  loading?: boolean;
  onAction: (notificationId: string, action: NotificationAction, remarks?: string) => Promise<void>;
  onRefresh?: () => void;
  filterStatus?: FilterStatus;
}

const NotificationsSectionNew: React.FC<NotificationsSectionNewProps> = ({
  notifications,
  loading = false,
  onAction,
  onRefresh,
  filterStatus: externalFilterStatus
}) => {
  const [loadingStates, setLoadingStates] = useState<Record<string, NotificationAction | null>>({});
  const [actionDialog, setActionDialog] = useState<{
    isOpen: boolean;
    action: 'approve' | 'reject';
    notificationId: string;
    title: string;
    message: string;
  }>({
    isOpen: false,
    action: 'approve',
    notificationId: '',
    title: '',
    message: ''
  });
  const [insufficientCreditsError, setInsufficientCreditsError] = useState<{
    isOpen: boolean;
    requiredCredits: number;
    availableCredits: number;
    message: string;
  }>({
    isOpen: false,
    requiredCredits: 0,
    availableCredits: 0,
    message: ''
  });

  // Filter notifications based on selected status
  // Note: For 'unread' and 'read' filters, notifications are already filtered in parent component
  const filteredNotifications = useMemo(() => {
    if (!notifications || notifications.length === 0) return [];
    
    // If external filter is provided, notifications are already filtered by parent
    if (externalFilterStatus === undefined) {
      return notifications;
    }
    
    // Filter by status
    if (externalFilterStatus === 'all') return notifications;
    
    // For unread/read filters, notifications are already filtered in parent
    if (externalFilterStatus === 'unread' || externalFilterStatus === 'read') {
      return notifications;
    }
    
    // Filter by notification status (pending, approved, rejected)
    const filterStatusLower = externalFilterStatus.toLowerCase().trim();
    
    return notifications.filter(notification => {
      const notificationStatus = (notification.status || '').toLowerCase().trim();
      
      // Exact match
      return notificationStatus === filterStatusLower;
    });
  }, [notifications, externalFilterStatus]);

  const renderIcon = (notification: CommonNotification): React.ReactNode => {
    const status = (notification.status || 'pending').toLowerCase();
    
    switch (notification.type) {
      case 'join_request':
        if (status === 'pending') {
          return (
            <div className="w-5 h-5 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
              <UserIcon className="w-3 h-3 text-yellow-600 dark:text-yellow-400" />
            </div>
          );
        } else if (status === 'approved' || status === 'completed') {
          return (
            <div className="w-5 h-5 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <CheckCircleIcon className="w-3 h-3 text-green-600 dark:text-green-400" />
            </div>
          );
        } else {
          return (
            <div className="w-5 h-5 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
              <XMarkIcon className="w-3 h-3 text-red-600 dark:text-red-400" />
            </div>
          );
        }
      case 'leave_request':
        return (
          <div className="w-5 h-5 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
            <UserIcon className="w-3 h-3 text-orange-600 dark:text-orange-400" />
          </div>
        );
      case 'payment_request':
      case 'payment_received':
      case 'payment_reminder':
      case 'bill_due':
      case 'payment_overdue':
        return (
          <div className="w-5 h-5 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
            <CreditCardIcon className="w-3 h-3 text-purple-600 dark:text-purple-400" />
          </div>
        );
      case 'payment_success':
        return (
          <div className="w-5 h-5 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
            <CheckCircleIcon className="w-3 h-3 text-green-600 dark:text-green-400" />
          </div>
        );
      case 'payment_failed':
        return (
          <div className="w-5 h-5 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
            <XMarkIcon className="w-3 h-3 text-red-600 dark:text-red-400" />
          </div>
        );
      case 'meal_plan_change':
        return (
          <div className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
            <InformationCircleIcon className="w-3 h-3 text-blue-600 dark:text-blue-400" />
          </div>
        );
      case 'subscription_request':
        return (
          <div className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
            <ClockIcon className="w-3 h-3 text-blue-600 dark:text-blue-400" />
          </div>
        );
      default:
        return (
          <div className="w-5 h-5 rounded-full bg-gray-100 dark:bg-gray-900/30 flex items-center justify-center">
            <InformationCircleIcon className="w-3 h-3 text-gray-600 dark:text-gray-400" />
          </div>
        );
    }
  };

  const handleActionClick = (action: 'approve' | 'reject', notificationId: string, title: string, message: string) => {
    setActionDialog({
      isOpen: true,
      action,
      notificationId,
      title,
      message
    });
  };

  const handleActionConfirm = async (remarks: string) => {
    const { notificationId, action } = actionDialog;
    setLoadingStates(prev => ({ ...prev, [notificationId]: action }));
    try {
      await onAction(notificationId, action, remarks || undefined);
      setActionDialog({ isOpen: false, action: 'approve', notificationId: '', title: '', message: '' });
      onRefresh?.();
    } catch (error: any) {
      console.error(`${action} error:`, error);
      
      // Check if it's an insufficient credits error (only for approve)
      if (action === 'approve' && error.creditData) {
        setInsufficientCreditsError({
          isOpen: true,
          requiredCredits: error.creditData.requiredCredits || 0,
          availableCredits: error.creditData.availableCredits || 0,
          message: error.message || `Insufficient credits to approve this request. You need ${error.creditData.requiredCredits} credits but only have ${error.creditData.availableCredits} available. Please purchase more credits to continue.`
        });
        // Close action dialog when showing insufficient credits
        setActionDialog({ isOpen: false, action: 'approve', notificationId: '', title: '', message: '' });
      }
    } finally {
      setLoadingStates(prev => ({ ...prev, [notificationId]: null }));
    }
  };

  const handleDelete = async (notificationId: string) => {
    setLoadingStates(prev => ({ ...prev, [notificationId]: 'delete' }));
    try {
      await onAction(notificationId, 'delete');
      onRefresh?.();
    } catch (error) {
      console.error('Delete error:', error);
    } finally {
      setLoadingStates(prev => ({ ...prev, [notificationId]: null }));
    }
  };

  const handleMarkRead = async (notificationId: string) => {
    setLoadingStates(prev => ({ ...prev, [notificationId]: 'mark_read' }));
    try {
      await onAction(notificationId, 'mark_read');
      onRefresh?.();
    } catch (error) {
      console.error('Mark read error:', error);
    } finally {
      setLoadingStates(prev => ({ ...prev, [notificationId]: null }));
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="text-center text-muted-foreground py-12">Loading notifications...</div>
      </div>
    );
  }

  // Render notification card
  const renderNotificationCard = (notification: CommonNotification) => {
    const id = getNotificationId(notification);
    const badge = getStatusBadge(notification.status);
    const timeVal = notification.timestamp || notification.createdAt || notification.updatedAt;
    const isLoading = loadingStates[id] !== null && loadingStates[id] !== undefined;
    const status = (notification.status || 'pending').toLowerCase();
    const isPending = status === 'pending';
    const canApproveReject = isPending && ['join_request', 'leave_request'].includes(notification.type);

    return (
      <div
        key={id}
        className={`rounded-xl border border-border p-4 bg-card transition-all ${
          !notification.isRead ? 'ring-2 ring-primary/10 bg-accent/5' : ''
        }`}
      >
        <div className="flex items-start gap-3">
          <div className="shrink-0 mt-1">
            {renderIcon(notification)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2 mb-1">
              <h3 className="font-semibold truncate text-card-foreground">
                {notification.title}
              </h3>
              <div className="flex items-center gap-2 shrink-0">
                <span className={`px-2 py-0.5 rounded-full text-xs ${badge.colorClassNames}`}>
                  {badge.text}
                </span>
                {timeVal && (
                  <span className="text-xs text-muted-foreground">
                    {formatNotificationTime(timeVal)}
                  </span>
                )}
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-3 break-words">
              {notification.message}
            </p>
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                {canApproveReject ? (
                  <>
                    <button
                      onClick={() => {
                        if (!isLoading && id) {
                          handleActionClick('approve', id, notification.title, notification.message);
                        }
                      }}
                      disabled={isLoading}
                      className="px-2 py-1 text-xs bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loadingStates[id] === 'approve' ? 'Approving...' : 'Approve'}
                    </button>
                    <button
                      onClick={() => {
                        if (!isLoading && id) {
                          handleActionClick('reject', id, notification.title, notification.message);
                        }
                      }}
                      disabled={isLoading}
                      className="px-2 py-1 text-xs bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loadingStates[id] === 'reject' ? 'Rejecting...' : 'Reject'}
                    </button>
                  </>
                ) : (
                  <>
                    {!notification.isRead && (
                      <button
                        onClick={() => {
                          if (!isLoading && id) {
                            handleMarkRead(id);
                          }
                        }}
                        disabled={isLoading}
                        className="px-2 py-1 text-xs border border-border rounded-lg hover:bg-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Mark read
                      </button>
                    )}
                    <button
                      onClick={() => {
                        if (!isLoading && id) {
                          handleDelete(id);
                        }
                      }}
                      disabled={isLoading}
                      className="px-2 py-1 text-xs border border-border rounded-lg hover:bg-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loadingStates[id] === 'delete' ? 'Deleting...' : 'Delete'}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const emptyState = (
    <div className="text-center text-muted-foreground py-12">
      {externalFilterStatus === 'unread'
        ? 'No unread notifications'
        : externalFilterStatus === 'read'
        ? 'No read notifications'
        : externalFilterStatus === 'pending' 
        ? 'No pending notifications' 
        : externalFilterStatus === 'approved'
        ? 'No approved notifications'
        : externalFilterStatus === 'rejected'
        ? 'No rejected notifications'
        : 'No notifications found'}
    </div>
  );

  return (
    <>
      <div className="space-y-4">
        {/* Card wrapper for large screens */}
        <Card className="hidden lg:block">
          <CardHeader>
            <CardDescription>
              {filteredNotifications.length} {filteredNotifications.length === 1 ? 'notification' : 'notifications'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {filteredNotifications.length === 0 ? emptyState : filteredNotifications.map(renderNotificationCard)}
            </div>
          </CardContent>
        </Card>

        {/* Mobile/Tablet view without card wrapper */}
        <div className="lg:hidden space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                {filteredNotifications.length} {filteredNotifications.length === 1 ? 'notification' : 'notifications'}
              </p>
            </div>
          </div>
          <div className="space-y-3">
            {filteredNotifications.length === 0 ? emptyState : filteredNotifications.map(renderNotificationCard)}
          </div>
        </div>
      </div>

      {/* Action Modal for Approve/Reject */}
      <ActionModal
        isOpen={actionDialog.isOpen}
        onClose={() => setActionDialog({ isOpen: false, action: 'approve', notificationId: '', title: '', message: '' })}
        onConfirm={handleActionConfirm}
        action={actionDialog.action}
        notificationTitle={actionDialog.title}
        notificationMessage={actionDialog.message}
        loading={loadingStates[actionDialog.notificationId] === actionDialog.action}
      />

      {/* Insufficient Credits Dialog */}
      <InsufficientCreditsDialog
        isOpen={insufficientCreditsError.isOpen}
        onClose={() => setInsufficientCreditsError(prev => ({ ...prev, isOpen: false }))}
        requiredCredits={insufficientCreditsError.requiredCredits}
        availableCredits={insufficientCreditsError.availableCredits}
        message={insufficientCreditsError.message}
      />
    </>
  );
};

export default NotificationsSectionNew;

