import React from 'react';
import { X, Calendar, User, Clock, MessageSquare } from 'lucide-react';
import type { LeaveRequest, LeaveRequestAction, ExtensionRequestAction } from '../LeaveManagement.types';
import { formatDate, getStatusColor, getStatusBadge } from '../LeaveManagement.utils';
import { formatDisplayDate } from '@/utils/dateUtils';

interface LeaveRequestDetailsProps {
  request: LeaveRequest;
  onClose?: () => void;
  onProcessRequest?: (requestId: string, action: LeaveRequestAction) => Promise<{ success: boolean; message: string }>;
  onProcessExtensionRequest?: (requestId: string, extensionId: string, action: ExtensionRequestAction) => Promise<{ success: boolean; message: string }>;
  variant?: 'modal' | 'page';
}

const LeaveRequestDetails: React.FC<LeaveRequestDetailsProps> = ({ request, onClose, variant = 'modal' }) => {
  const isAutoApproved = request.status === 'approved' && !(request as any).approvedBy;
  const totalMealsMissed = (request as any).totalMealsMissed ?? 0;
  
  // Calculate totalDays if not provided
  const totalDays = request.totalDays ?? (() => {
    const start = new Date(request.startDate);
    const end = new Date(request.endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start and end days
    return diffDays;
  })();

  const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    variant === 'modal' ? (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-SmartMess-dark-surface rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          {children}
        </div>
      </div>
    ) : (
      <div className="max-w-5xl mx-auto w-full">
        <div className="bg-white dark:bg-SmartMess-dark-surface rounded-lg border SmartMess-light-border dark:SmartMess-dark-border">
          {children}
        </div>
      </div>
    )
  );

  return (
    <Wrapper>
      {variant === 'modal' && (
        <div className="sticky top-0 bg-white dark:bg-SmartMess-dark-surface border-b SmartMess-light-border dark:SmartMess-dark-border p-4 sm:p-6 z-10">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg sm:text-xl font-semibold SmartMess-light-text dark:SmartMess-dark-text">
                Leave Request Details
              </h2>
            </div>
            <div className="flex items-center gap-3">
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(request.status)}`}>
                {isAutoApproved ? 'Auto-approved' : getStatusBadge(request.status)}
              </div>
              <button 
                onClick={onClose} 
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                aria-label="Close modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      )}
        
      <div className="p-4 sm:p-6 space-y-4">
        {/* Status Badge for page variant */}
        {variant === 'page' && (
          <div className="flex items-center gap-3 mb-4">
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(request.status)}`}>
              {isAutoApproved ? 'Auto-approved' : getStatusBadge(request.status)}
            </div>
            {request.updatedAt && request.status === 'approved' && (
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Approved on {formatDate(request.updatedAt)}
              </span>
            )}
          </div>
        )}

        {/* Member Information */}
        <div className="bg-white dark:bg-SmartMess-dark-surface rounded-xl border SmartMess-light-border dark:SmartMess-dark-border p-4 sm:p-5">
          <div className="flex items-center gap-2 mb-4">
            <User className="h-5 w-5 text-gray-500 dark:text-gray-400" />
            <h3 className="text-lg font-semibold SmartMess-light-text dark:SmartMess-dark-text">Member Information</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-gray-600 dark:text-gray-400">Name:</span>
              <span className="ml-2 font-medium SmartMess-light-text dark:SmartMess-dark-text">
                {request.userId.firstName} {request.userId.lastName}
              </span>
            </div>
            <div>
              <span className="text-gray-600 dark:text-gray-400">Email:</span>
              <span className="ml-2 SmartMess-light-text dark:SmartMess-dark-text">{request.userId.email}</span>
            </div>
            {request.userId.phone && (
              <div>
                <span className="text-gray-600 dark:text-gray-400">Phone:</span>
                <span className="ml-2 SmartMess-light-text dark:SmartMess-dark-text">{request.userId.phone}</span>
              </div>
            )}
            {request.approvedBy && (
              <div>
                <span className="text-gray-600 dark:text-gray-400">Approved By:</span>
                <span className="ml-2 SmartMess-light-text dark:SmartMess-dark-text">
                  {request.approvedBy.firstName} {request.approvedBy.lastName}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Leave Period */}
        <div className="bg-white dark:bg-SmartMess-dark-surface rounded-xl border SmartMess-light-border dark:SmartMess-dark-border p-4 sm:p-5">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="h-5 w-5 text-gray-500 dark:text-gray-400" />
            <h3 className="text-lg font-semibold SmartMess-light-text dark:SmartMess-dark-text">Leave Period</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-gray-600 dark:text-gray-400">Start Date:</span>
              <span className="ml-2 font-medium SmartMess-light-text dark:SmartMess-dark-text">{formatDate(request.startDate)}</span>
            </div>
            <div>
              <span className="text-gray-600 dark:text-gray-400">End Date:</span>
              <span className="ml-2 font-medium SmartMess-light-text dark:SmartMess-dark-text">{formatDate(request.endDate)}</span>
            </div>
            <div>
              <span className="text-gray-600 dark:text-gray-400">Total Days:</span>
              <span className="ml-2 font-medium SmartMess-light-text dark:SmartMess-dark-text">{totalDays}</span>
            </div>
          </div>
        </div>

        {/* Meal Plans and Meals Missed */}
        <div className="bg-white dark:bg-SmartMess-dark-surface rounded-xl border SmartMess-light-border dark:SmartMess-dark-border p-4 sm:p-5">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="h-5 w-5 text-gray-500 dark:text-gray-400" />
            <h3 className="text-lg font-semibold SmartMess-light-text dark:SmartMess-dark-text">Meal Plans</h3>
          </div>
          
          {Array.isArray(request.mealPlanIds) && request.mealPlanIds.length > 0 ? (
            <div className="space-y-3">
              {request.mealPlanIds.map((plan: any, i: number) => {
                const name = plan?.name || plan?.planName || `Plan ${i + 1}`;
                const mo = plan?.mealOptions || {};
                const tags = [mo.breakfast && 'B', mo.lunch && 'L', mo.dinner && 'D'].filter(Boolean).join('/');
                return (
                  <div key={i} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border SmartMess-light-border dark:SmartMess-dark-border">
                    <div>
                      <div className="font-medium SmartMess-light-text dark:SmartMess-dark-text">{name}</div>
                      {tags && (
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{tags}</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400">No meal plans available</p>
          )}

          {/* Meals Missed - Single display */}
          <div className="mt-4 pt-4 border-t SmartMess-light-border dark:SmartMess-dark-border">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Meals Missed</span>
              <span className="text-xl font-bold SmartMess-light-text dark:SmartMess-dark-text">{totalMealsMissed}</span>
            </div>
          </div>
        </div>

        {/* Reason */}
        {request.reason && (
          <div className="bg-white dark:bg-SmartMess-dark-surface rounded-xl border SmartMess-light-border dark:SmartMess-dark-border p-4 sm:p-5">
            <div className="flex items-center gap-2 mb-3">
              <MessageSquare className="h-5 w-5 text-gray-500 dark:text-gray-400" />
              <h3 className="text-lg font-semibold SmartMess-light-text dark:SmartMess-dark-text">Reason</h3>
            </div>
            <p className="text-sm SmartMess-light-text dark:SmartMess-dark-text leading-relaxed">{request.reason}</p>
          </div>
        )}

        {/* Approval Remarks */}
        {request.approvalRemarks && (
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800 p-4 sm:p-5">
            <div className="flex items-center gap-2 mb-2">
              <MessageSquare className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <h3 className="font-semibold text-blue-800 dark:text-blue-400">Approval Remarks</h3>
            </div>
            <p className="text-sm text-blue-900 dark:text-blue-300">{request.approvalRemarks}</p>
          </div>
        )}

        {/* Extension Requests */}
        {request.extensionRequests && request.extensionRequests.length > 0 && (
          <div className="bg-white dark:bg-SmartMess-dark-surface rounded-xl border SmartMess-light-border dark:SmartMess-dark-border p-4 sm:p-5">
            <h3 className="text-lg font-semibold SmartMess-light-text dark:SmartMess-dark-text mb-4">Extension Requests</h3>
            <div className="space-y-3">
              {request.extensionRequests.map((ext, idx) => (
                <div key={idx} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 border SmartMess-light-border dark:SmartMess-dark-border">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">New End Date:</span>
                    <span className="text-sm font-medium SmartMess-light-text dark:SmartMess-dark-text">{formatDate(ext.newEndDate)}</span>
                  </div>
                  {ext.reason && (
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      <span className="font-medium">Reason:</span> {ext.reason}
                    </div>
                  )}
                  <div className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                    ext.status === 'approved' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                    ext.status === 'rejected' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                    'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                  }`}>
                    {ext.status.charAt(0).toUpperCase() + ext.status.slice(1)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

          {/* Update History */}
          {((Array.isArray((request as any).subscriptionExtensionTracking) && (request as any).subscriptionExtensionTracking.length > 0) || (request as any).originalEndDate) && (
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">Update History</h3>
              <div className="space-y-3">
                {/* Show original end date update if different from current end date */}
                {(request as any).originalEndDate && new Date((request as any).originalEndDate).getTime() !== new Date(request.endDate).getTime() && (
                  <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                      <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">End Date Update</span>
                      <span className="ml-auto text-xs text-gray-500 dark:text-gray-400">
                        {formatDisplayDate(new Date(request.updatedAt || request.createdAt))}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Previous End Date:</span>
                        <span className="ml-2 font-medium text-gray-這里900 dark:text-gray-100">{formatDisplayDate(new Date((request as any).originalEndDate))}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Updated End Date:</span>
                        <span className="ml-2 font-medium text-green-600 dark:text-green-400">{formatDisplayDate(new Date(request.endDate))}</span>
                      </div>
                    </div>
                    {(request as any).approvalRemarks && (request as any).approvalRemarks.includes('Update Reason') && (
                      <div className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                        <span className="font-medium">Update Reason:</span> {(request as any).approvalRemarks.split('Update Reason')[1]?.trim() || 'N/A'}
                      </div>
                    )}
                  </div>
                )}

                {/* Show subscription extension tracking entries as separate updates */}
                {Array.isArray((request as any).subscriptionExtensionTracking) && (request as any).subscriptionExtensionTracking.map((t: any, i: number) => {
                  const planMatch = Array.isArray((request as any).mealPlanIds)
                    ? (request as any).mealPlanIds.find((mp: any) => {
                        const mpId = mp?._id || mp?.id || mp;
                        return String(mpId) === String(t.mealPlanId);
                      })
                    : null;
                  const planName = planMatch?.name || t.mealPlanId || `Plan ${i + 1}`;
                  
                  return (
                    <div key={i} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                        <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                          Subscription Extension #{i + 1} - {planName}
                        </span>
                        {t.extensionAppliedAt && (
                          <span className="ml-auto text-xs text-gray-500 dark:text-gray-400">
                            {formatDisplayDate(new Date(t.extensionAppliedAt))}
                          </span>
                        )}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                        {t.originalSubscriptionEndDate && (
                          <div>
                            <span className="text-gray-500 dark:text-gray-400">Original Subscription End:</span>
                            <span className="ml-2 font-medium text-gray-900 dark:text-gray-100">{formatDisplayDate(new Date(t.originalSubscriptionEndDate))}</span>
                          </div>
                        )}
                        {t.newSubscriptionEndDate && (
                          <div>
                            <span className="text-gray-500 dark:text-gray-400">Extended Subscription End:</span>
                            <span className="ml-2 font-medium text-green-600 dark:text-green-400">{formatDisplayDate(new Date(t.newSubscriptionEndDate))}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Timestamps */}
          <div className="bg-gray-50 dark:bg-gray-800/30 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span className="font-medium">Requested:</span>
                <span>{formatDisplayDate(new Date(request.createdAt))}</span>
              </div>
              {request.updatedAt !== request.createdAt && (
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span className="font-medium">Last Updated:</span>
                  <span>{formatDisplayDate(new Date(request.updatedAt))}</span>
                </div>
              )}
            </div>
          </div>
        </div>
    </Wrapper>
  );
};

export default LeaveRequestDetails;
