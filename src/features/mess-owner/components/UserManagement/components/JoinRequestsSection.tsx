import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card';
import { CheckCircleIcon, XMarkIcon, ClockIcon } from '@heroicons/react/24/outline';
import { toast } from 'sonner';
import { formatNotificationTime, getStatusBadge } from '@/shared/notifications/utils';
import InsufficientCreditsDialog from '@/components/common/InsufficientCreditsDialog';
import ActionModal from '@/components/common/ActionModal';

export interface JoinRequest {
  id: string;
  notificationId: string;
  userId: string;
  userName: string;
  userEmail?: string;
  userPhone?: string;
  planName?: string;
  mealPlanId?: string;
  paymentType?: 'pay_now' | 'pay_later';
  amount?: number;
  status: 'pending' | 'approved' | 'rejected';
  requestedAt?: string | Date;
  message?: string;
  data?: any;
}

interface JoinRequestsSectionProps {
  requests: JoinRequest[];
  loading?: boolean;
  onApprove: (notificationId: string, remarks?: string) => Promise<void>;
  onReject: (notificationId: string, remarks?: string) => Promise<void>;
  onRefresh?: () => void;
  filterStatus?: 'all' | 'pending' | 'approved' | 'rejected';
}

const JoinRequestsSection: React.FC<JoinRequestsSectionProps> = ({
  requests,
  loading = false,
  onApprove,
  onReject,
  onRefresh,
  filterStatus: externalFilterStatus
}) => {
  const [loadingStates, setLoadingStates] = useState<Record<string, 'approve' | 'reject' | null>>({});
  const [internalFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  
  // Use external filter status if provided, otherwise use internal
  const filterStatus = externalFilterStatus !== undefined ? externalFilterStatus : internalFilterStatus;
  const [actionDialog, setActionDialog] = useState<{
    isOpen: boolean;
    action: 'approve' | 'reject';
    notificationId: string;
    userName: string;
    userMessage?: string;
  }>({
    isOpen: false,
    action: 'approve',
    notificationId: '',
    userName: '',
    userMessage: ''
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

  // Filter requests based on selected status
  // Note: If externalFilterStatus is provided, filtering is done in parent component
  const filteredRequests = useMemo(() => {
    if (!requests || requests.length === 0) return [];
    
    // If external filter is provided, requests are already filtered
    if (externalFilterStatus !== undefined) {
      return requests;
    }
    
    // Otherwise, filter internally
    if (filterStatus === 'all') return requests;
    
    return requests.filter(request => {
      // Normalize status to lowercase for comparison
      const requestStatus = (request.status || '').toLowerCase().trim();
      const filterStatusLower = filterStatus.toLowerCase().trim();
      
      // Exact match
      return requestStatus === filterStatusLower;
    });
  }, [requests, filterStatus, externalFilterStatus]);




  const renderIcon = (request: JoinRequest): React.ReactNode => {
    const status = (request.status || 'pending').toLowerCase();
    switch (status) {
      case 'pending':
        return (
          <div className="w-5 h-5 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
            <ClockIcon className="w-3 h-3 text-yellow-600 dark:text-yellow-400" />
          </div>
        );
      case 'approved':
        return (
          <div className="w-5 h-5 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
            <CheckCircleIcon className="w-3 h-3 text-green-600 dark:text-green-400" />
          </div>
        );
      case 'rejected':
        return (
          <div className="w-5 h-5 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
            <XMarkIcon className="w-3 h-3 text-red-600 dark:text-red-400" />
          </div>
        );
      default:
        return <div className="w-5 h-5 rounded-full bg-muted" />;
    }
  };

  const handleActionClick = (action: 'approve' | 'reject', notificationId: string, userName: string, userMessage?: string) => {
    setActionDialog({
      isOpen: true,
      action,
      notificationId,
      userName,
      userMessage: userMessage || ''
    });
  };

  const handleActionConfirm = async (remarks: string) => {
    const { notificationId, action } = actionDialog;
    setLoadingStates(prev => ({ ...prev, [notificationId]: action }));
    try {
      if (action === 'approve') {
        await onApprove(notificationId, remarks || undefined);
        toast.success('Join request approved successfully');
      } else {
        await onReject(notificationId, remarks || undefined);
        toast.success('Join request rejected');
      }
      setActionDialog({ isOpen: false, action: 'approve', notificationId: '', userName: '', userMessage: '' });
      onRefresh?.();
    } catch (error: any) {
      console.error(`${action} error:`, error);
      
      // Check if it's an insufficient credits error (only for approve)
      if (action === 'approve' && error.creditData) {
        setInsufficientCreditsError({
          isOpen: true,
          requiredCredits: error.creditData.requiredCredits || 0,
          availableCredits: error.creditData.availableCredits || 0,
          message: error.message || `Insufficient credits to approve this user. You need ${error.creditData.requiredCredits} credits but only have ${error.creditData.availableCredits} available. Please purchase more credits to continue.`
        });
        // Close action dialog when showing insufficient credits
        setActionDialog({ isOpen: false, action: 'approve', notificationId: '', userName: '', userMessage: '' });
      } else {
        toast.error(error.message || `Failed to ${action} join request`);
      }
    } finally {
      setLoadingStates(prev => ({ ...prev, [notificationId]: null }));
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="text-center text-muted-foreground py-12">Loading join requests...</div>
      </div>
    );
  }

  // Render request card
  const renderRequestCard = (request: JoinRequest) => {
    const id = request.notificationId || request.id;
    const badge = getStatusBadge(request.status as any);
    const timeVal = request.requestedAt;
    const notificationId = request.notificationId || request.id;
    const isLoading = loadingStates[notificationId] !== null && loadingStates[notificationId] !== undefined;
    const isApproving = loadingStates[notificationId] === 'approve';
    const isRejecting = loadingStates[notificationId] === 'reject';
    const status = (request.status || 'pending').toLowerCase();
    const isPending = status === 'pending';

    return (
      <div
        key={id || request.id || Math.random()}
        className="rounded-xl border border-border p-4 bg-card transition-all"
      >
        <div className="flex items-start gap-3">
          <div className="shrink-0 mt-1">
            {renderIcon(request)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2 mb-1">
              <h3 className="font-semibold truncate text-card-foreground">
                {request.userName}
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
              {request.message || 'wants to join your mess'}
            </p>
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                {isPending ? (
                  <>
                              <button
                                onClick={() => {
                                  if (!isLoading && notificationId) {
                                    handleActionClick('approve', notificationId, request.userName, request.message);
                                  }
                                }}
                                disabled={isLoading}
                                className="px-2 py-1 text-xs bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {isApproving ? 'Approving...' : 'Approve'}
                              </button>
                              <button
                                onClick={() => {
                                  if (!isLoading && notificationId) {
                                    handleActionClick('reject', notificationId, request.userName, request.message);
                                  }
                                }}
                                disabled={isLoading}
                                className="px-2 py-1 text-xs bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {isRejecting ? 'Rejecting...' : 'Reject'}
                              </button>
                  </>
                ) : (
                  <button
                    onClick={() => {
                      // Handle delete action
                      toast.info('Delete functionality coming soon');
                    }}
                    className="px-2 py-1 text-xs border border-border rounded-lg hover:bg-accent transition-colors"
                  >
                    Delete
                  </button>
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
      {filterStatus === 'pending' 
        ? 'No pending join requests' 
        : filterStatus === 'approved'
        ? 'No approved join requests'
        : filterStatus === 'rejected'
        ? 'No rejected join requests'
        : 'No join requests found'}
    </div>
  );

  return (
    <>
      <div className="space-y-4">
        {/* Card wrapper for large screens */}
        <Card className="hidden lg:block">
          <CardHeader>
            <CardDescription>
              {filteredRequests.length} {filteredRequests.length === 1 ? 'request' : 'requests'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {filteredRequests.length === 0 ? emptyState : filteredRequests.map(renderRequestCard)}
            </div>
          </CardContent>
        </Card>

        {/* Mobile/Tablet view without card wrapper */}
        <div className="lg:hidden space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                {filteredRequests.length} {filteredRequests.length === 1 ? 'request' : 'requests'}
              </p>
            </div>
          </div>
          <div className="space-y-3">
            {filteredRequests.length === 0 ? emptyState : filteredRequests.map(renderRequestCard)}
          </div>
        </div>
      </div>

      {/* Action Modal for Approve/Reject */}
      <ActionModal
        isOpen={actionDialog.isOpen}
        onClose={() => setActionDialog({ isOpen: false, action: 'approve', notificationId: '', userName: '', userMessage: '' })}
        onConfirm={handleActionConfirm}
        action={actionDialog.action}
        notificationTitle={`${actionDialog.userName} - Join Request`}
        notificationMessage={actionDialog.userMessage || `${actionDialog.userName} wants to join your mess`}
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

export default JoinRequestsSection;

