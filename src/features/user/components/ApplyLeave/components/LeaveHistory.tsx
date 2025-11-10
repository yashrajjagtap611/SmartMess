import React from 'react';
import { formatDisplayDate } from '@/utils/dateUtils';

type LeaveItem = {
  _id: string;
  messId?: any;
  mealPlanIds?: string[];
  startDate: string | Date;
  endDate: string | Date;
  mealTypes?: ('breakfast' | 'lunch' | 'dinner')[];
  startDateMealTypes?: ('breakfast' | 'lunch' | 'dinner')[];
  endDateMealTypes?: ('breakfast' | 'lunch' | 'dinner')[];
  reason?: string;
  status: 'pending' | 'approved' | 'rejected' | 'extended' | 'cancelled';
  approvedBy?: any;
  approvedAt?: string | Date;
  approvalRemarks?: string;
  totalMealsMissed?: number;
  estimatedSavings?: number;
  extendSubscription?: boolean;
  extensionMeals?: number;
  subscriptionExtensionTracking?: Array<{
    mealPlanId?: any;
    originalSubscriptionEndDate?: string | Date;
    newSubscriptionEndDate?: string | Date;
    extensionAppliedAt?: string | Date;
  }>;
  createdAt?: string | Date;
};

interface LeaveHistoryProps {
  items: LeaveItem[];
  onCancel: (id: string) => Promise<void> | void;
  onUpdate?: (leave: LeaveItem) => void;
}

export const LeaveHistory: React.FC<LeaveHistoryProps> = ({ items, onCancel, onUpdate }) => {
  
  // Remove duplicates based on _id - handle both array and undefined/null
  const uniqueItems = (Array.isArray(items) ? items : [])
    .filter((item) => item && item._id) // Filter out any invalid items
    .filter((item, index, self) => {
      // Find first occurrence of this _id
      const firstIndex = self.findIndex((t) => t._id === item._id);
      return index === firstIndex;
    });

  // Build display cards: base entry + synthetic update entry when end date changed
  const displayCards = uniqueItems.flatMap((leave) => {
    const cards: Array<{ key: string; type: 'base' | 'update'; leave: LeaveItem }> = [];
    cards.push({ key: leave._id, type: 'base', leave });
    const hasOriginal = (leave as any).originalEndDate;
    const originalEnd = hasOriginal ? new Date((leave as any).originalEndDate as any) : null;
    const currentEnd = new Date(leave.endDate);
    if (originalEnd && originalEnd.getTime() !== currentEnd.getTime()) {
      cards.push({ key: `${leave._id}-update-1`, type: 'update', leave });
    }
    return cards;
  });
  
  const getStatusBadge = (status: LeaveItem['status']) => {
    const base = 'px-2 py-1 rounded text-xs font-medium';
    switch (status) {
      case 'approved': return `${base} bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300`;
      case 'pending': return `${base} bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300`;
      case 'rejected': return `${base} bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300`;
      case 'cancelled': return `${base} bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300`;
      case 'extended': return `${base} bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300`;
      default: return `${base} bg-muted text-foreground`;
    }
  };

  const canCancel = (leave: LeaveItem) => !['cancelled', 'rejected'].includes(leave.status);

  if (!uniqueItems || uniqueItems.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto mb-4 rounded-lg bg-muted flex items-center justify-center">
          <svg className="w-8 h-8 SmartMess-light-text-secondary dark:SmartMess-dark-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <p className="SmartMess-light-text-secondary dark:SmartMess-dark-text-secondary">No leave requests found</p>
        <p className="text-sm SmartMess-light-text-secondary dark:SmartMess-dark-text-secondary mt-1">
          Submit a leave request to see it here
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {displayCards.map(({ key, type, leave }) => (
        <div key={key}
          className="p-4 sm:p-6 border SmartMess-light-border dark:SmartMess-dark-border rounded-lg SmartMess-light-surface dark:SmartMess-dark-surface"
        >
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className={getStatusBadge(leave.status)}>{leave.status.toUpperCase()}</span>
                {type === 'update' && (
                  <span className="px-2 py-1 rounded text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300">
                    Updated End Date
                  </span>
                )}
                {leave.extendSubscription && (
                  <span className="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                    Extends Subscription
                  </span>
                )}
              </div>
              
              <div className="text-sm space-y-1">
                {type === 'base' ? (
                  <div className="flex items-center gap-2">
                    <span className="font-medium SmartMess-light-text dark:SmartMess-dark-text">Period:</span>
                    <span>{formatDisplayDate(new Date(leave.startDate))} - {formatDisplayDate(new Date(leave.endDate))}</span>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-2">
                      <span className="font-medium SmartMess-light-text dark:SmartMess-dark-text">Previous End Date:</span>
                      <span>{formatDisplayDate(new Date((leave as any).originalEndDate as any))}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium SmartMess-light-text dark:SmartMess-dark-text">Updated End Date:</span>
                      <span className="text-green-600 dark:text-green-400">{formatDisplayDate(new Date(leave.endDate))}</span>
                    </div>
                  </>
                )}

                {/* Plan names */}
                <div className="flex items-center gap-2">
                  <span className="font-medium SmartMess-light-text dark:SmartMess-dark-text">Plans:</span>
                  <span className="SmartMess-light-text-secondary dark:SmartMess-dark-text-secondary">
                    {(() => {
                      const plans: any[] = Array.isArray((leave as any).mealPlanIds) ? (leave as any).mealPlanIds : [];
                      const names = plans
                        .map((p: any) => (p && typeof p === 'object' && p.name) ? p.name : null)
                        .filter(Boolean) as string[];
                      if (names.length > 0) return names.join(', ');
                      const count = plans.length || 0;
                      return `${count} plan${count === 1 ? '' : 's'}`;
                    })()}
                  </span>
                </div>
                
                {type === 'base' && leave.totalMealsMissed != null && (
                  <div className="flex items-center gap-2">
                    <span className="font-medium SmartMess-light-text dark:SmartMess-dark-text">Total Meals:</span>
                    <span>{leave.totalMealsMissed}</span>
                  </div>
                )}
                
                {type === 'base' && leave.estimatedSavings != null && leave.estimatedSavings > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="font-medium SmartMess-light-text dark:SmartMess-dark-text">Estimated Savings:</span>
                    <span className="text-green-600 dark:text-green-400">₹{Number(leave.estimatedSavings).toFixed(2)}</span>
                  </div>
                )}
                
                {type === 'base' && leave.extendSubscription && leave.extensionMeals != null && leave.extensionMeals > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="font-medium SmartMess-light-text dark:SmartMess-dark-text">Extension Meals:</span>
                    <span className="text-blue-600 dark:text-blue-400">+{leave.extensionMeals} meals</span>
                  </div>
                )}
                
                {type === 'base' && leave.reason && (
                  <div className="mt-2 pt-2 border-t SmartMess-light-border dark:SmartMess-dark-border">
                    <span className="font-medium SmartMess-light-text dark:SmartMess-dark-text">Reason: </span>
                    <span className="SmartMess-light-text-secondary dark:SmartMess-dark-text-secondary">{leave.reason}</span>
                  </div>
                )}
              </div>

              {/* Subscription Extension History */}
              {leave.status === 'approved' && leave.extendSubscription && Array.isArray(leave.subscriptionExtensionTracking) && leave.subscriptionExtensionTracking.length > 0 && (
                <div className="mt-3 space-y-2">
                  <div className="text-xs font-medium text-blue-700 dark:text-blue-300 mb-1">🔄 Subscription Extension History</div>
                  {leave.subscriptionExtensionTracking.map((tracking, idx) => (
                    <div key={idx} className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                      <div className="text-xs font-medium text-blue-700 dark:text-blue-300 mb-2">
                        Update #{idx + 1}
                        {tracking.extensionAppliedAt && (
                          <span className="text-blue-600 dark:text-blue-400 font-normal ml-2">
                            ({formatDisplayDate(new Date(tracking.extensionAppliedAt))})
                          </span>
                        )}
                      </div>
                      {tracking.originalSubscriptionEndDate && tracking.newSubscriptionEndDate && (
                        <>
                          <div className="flex justify-between mb-1">
                            <span className="text-xs text-blue-600 dark:text-blue-400">From:</span>
                            <span className="text-xs font-medium text-blue-700 dark:text-blue-300">{formatDisplayDate(new Date(tracking.originalSubscriptionEndDate))}</span>
                          </div>
                          <div className="flex justify-between mb-1">
                            <span className="text-xs text-blue-600 dark:text-blue-400">To:</span>
                            <span className="text-xs font-medium text-green-600">{formatDisplayDate(new Date(tracking.newSubscriptionEndDate))}</span>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Cancellation/Approval info */}
              {leave.status === 'cancelled' && (
                <div className="mt-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-900/30 border SmartMess-light-border dark:SmartMess-dark-border">
                  <div className="text-sm font-medium SmartMess-light-text dark:SmartMess-dark-text mb-1">Cancelled</div>
                  <div className="text-xs SmartMess-light-text-secondary dark:SmartMess-dark-text-secondary">
                    {leave.approvedAt && (
                      <span>On {formatDisplayDate(new Date(leave.approvedAt))}</span>
                    )}
                    {leave.approvedBy && (
                      <span className="ml-2">by {typeof leave.approvedBy === 'object' ? (leave.approvedBy.name || leave.approvedBy.email || 'You') : 'You'}</span>
                    )}
                    {leave.estimatedSavings !== undefined && (
                      <span className="block mt-1">Estimated Savings: ₹{Number(leave.estimatedSavings || 0).toFixed(2)} (reset to 0)</span>
                    )}
                  </div>
                </div>
              )}

              {leave.status === 'rejected' && leave.approvalRemarks && (
                <div className="mt-3 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-xs">
                  <span className="font-medium">Reason:</span> {leave.approvalRemarks}
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 sm:flex-col sm:items-end sm:gap-2">
              {type === 'base' && canCancel(leave) && (
                <>
                  {onUpdate && leave.status === 'approved' && (
                    <button
                      onClick={() => {
                        onUpdate(leave);
                      }}
                      className="px-3 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors"
                    >
                      Update End Date
                    </button>
                  )}
                  <button
                    onClick={() => {
                      if (confirm('Cancel this leave request? This action cannot be undone.')) {
                        onCancel(leave._id);
                      }
                    }}
                    className="px-3 py-2 border SmartMess-light-border dark:SmartMess-dark-border rounded-lg text-sm hover:bg-muted"
                  >
                    Cancel
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default LeaveHistory;
