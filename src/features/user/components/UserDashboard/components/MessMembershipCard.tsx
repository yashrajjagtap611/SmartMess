import React from 'react';
import { 
  MapPinIcon, 
  CalendarDaysIcon, 
  ClockIcon, 
  CreditCardIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  BuildingOfficeIcon,
  StarIcon
} from '@heroicons/react/24/outline';
import type { MessMembership } from '../UserDashboard.types';

interface MessMembershipCardProps {
  mess: MessMembership;
  onPayBill: (billId: string, amount: number, messName: string) => void;
  onLeavePlan: (messId: string, mealPlanId: string, messName: string, mealPlanName: string) => void;
  onCancelRequest?: (messId: string, mealPlanId: string, messName: string, mealPlanName: string) => void;
  onResendRequest?: (messId: string, mealPlanId: string, messName: string, mealPlanName: string) => void;
  loading?: boolean;
}

const MessMembershipCard: React.FC<MessMembershipCardProps> = ({
  mess,
  onPayBill,
  onLeavePlan,
  onCancelRequest,
  onResendRequest,
  loading = false
}) => {
  // Debug logging removed - uncomment only when needed for debugging
  // console.log('🔍 MessMembershipCard Debug:', {
  //   messId: mess.messId,
  //   messName: mess.messName,
  //   status: mess.status,
  //   paymentStatus: mess.paymentStatus,
  //   canLeave: mess.canLeave,
  //   mealPlans: mess.mealPlans?.length || 0
  // });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-600 dark:text-green-400';
      case 'pending':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'inactive':
        return 'text-gray-600 dark:text-gray-400';
      case 'suspended':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircleIcon className="w-4 h-4 text-green-500" />;
      case 'pending':
        return <ClockIcon className="w-4 h-4 text-yellow-500" />;
      case 'suspended':
        return <XCircleIcon className="w-4 h-4 text-red-500" />;
      default:
        return <ClockIcon className="w-4 h-4 text-gray-500" />;
    }
  };

  // Unused function - commented out
  // const getPaymentStatusColor = (status: string) => {
  //   switch (status) {
  //     case 'paid':
  //       return 'text-green-600 dark:text-green-400';
  //     case 'pending':
  //       return 'text-yellow-600 dark:text-yellow-400';
  //     case 'overdue':
  //       return 'text-red-600 dark:text-red-400';
  //     default:
  //       return 'text-gray-600 dark:text-gray-400';
  //   }
  // };

  const getPaymentStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircleIcon className="w-4 h-4 text-green-500" />;
      case 'pending':
        return <ExclamationTriangleIcon className="w-4 h-4 text-yellow-500" />;
      case 'overdue':
        return <XCircleIcon className="w-4 h-4 text-red-500" />;
      default:
        return <CreditCardIcon className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className="p-4 border border-border rounded-xl bg-card hover:shadow-lg transition-all duration-300 group">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
              <BuildingOfficeIcon className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-foreground">
                {mess.messName}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <StarIcon className="w-4 h-4 text-yellow-500" />
                <span className="text-sm text-muted-foreground">Premium Mess</span>
              </div>
            </div>
          </div>
          
          {/* Status Badges */}
          <div className="flex items-center gap-3">
            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium border ${
              mess.status === 'active' 
                ? 'bg-green-50 border-green-200 text-green-700 dark:bg-green-900/20 dark:border-green-800 dark:text-green-300'
                : mess.status === 'pending'
                ? 'bg-yellow-50 border-yellow-200 text-yellow-700 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-300'
                : 'bg-gray-50 border-gray-200 text-gray-700 dark:bg-gray-900/20 dark:border-gray-800 dark:text-gray-300'
            }`}>
              {getStatusIcon(mess.status)}
              <span>{mess.status.charAt(0).toUpperCase() + mess.status.slice(1)}</span>
            </div>
            
            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium border ${
              mess.paymentStatus === 'paid'
                ? 'bg-green-50 border-green-200 text-green-700 dark:bg-green-900/20 dark:border-green-800 dark:text-green-300'
                : mess.paymentStatus === 'pending'
                ? 'bg-yellow-50 border-yellow-200 text-yellow-700 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-300'
                : 'bg-red-50 border-red-200 text-red-700 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300'
            }`}>
              {getPaymentStatusIcon(mess.paymentStatus)}
              <span>{mess.paymentStatus.charAt(0).toUpperCase() + mess.paymentStatus.slice(1)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Mess Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4 p-3 bg-muted/30 rounded-lg border border-border">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-lg bg-background border border-border">
            <MapPinIcon className="w-4 h-4 text-primary" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Location</p>
            <p className="text-sm font-medium text-foreground">
              {mess.messLocation?.city}, {mess.messLocation?.state}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-lg bg-background border border-border">
            <CalendarDaysIcon className="w-4 h-4 text-primary" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Member Since</p>
            <p className="text-sm font-medium text-foreground">
              {new Date(mess.joinDate).toLocaleDateString()}
            </p>
          </div>
        </div>
        
        {mess.subscriptionStartDate && (
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-background border border-border">
              <ClockIcon className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Subscription Start</p>
              <p className="text-sm font-medium text-foreground">
                {new Date(mess.subscriptionStartDate).toLocaleDateString()}
              </p>
            </div>
          </div>
        )}
        
        {mess.nextPaymentDate && (
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-background border border-border">
              <CreditCardIcon className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Next Payment</p>
              <p className="text-sm font-medium text-foreground">
                {new Date(mess.nextPaymentDate).toLocaleDateString()}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Meal Plans */}
      {mess.mealPlans && mess.mealPlans.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-foreground flex items-center gap-2">
              <CreditCardIcon className="w-5 h-5 text-primary" />
              <span>Meal Plans ({mess.mealPlans.length})</span>
            </h4>
            {mess.totalMonthlyAmount && (
              <div className="px-3 py-1 bg-primary/10 border border-primary/20 rounded-full">
                <span className="text-sm font-medium text-primary">
                  ₹{mess.totalMonthlyAmount}/month
                </span>
              </div>
            )}
          </div>
          
          <div className="space-y-2">
            {mess.mealPlans.map((mealPlan) => (
              <div 
                key={mealPlan.id} 
                className="p-4 border border-border rounded-xl bg-card hover:shadow-lg transition-all duration-300"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h5 className="text-base font-semibold text-foreground">
                      {mealPlan.name}
                    </h5>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {mealPlan.description}
                    </p>
                  </div>
                  <div className="text-right ml-4 flex-shrink-0">
                    <div className="text-xl font-bold text-primary">
                      ₹{mealPlan.pricing.amount}
                    </div>
                    <div className="text-xs text-muted-foreground font-medium mt-0.5">
                      {mealPlan.pricing.period === 'month' ? 'per month' : mealPlan.pricing.period === 'day' ? 'per day' : `per ${mealPlan.pricing.period}`}
                    </div>
                  </div>
                </div>
                
                {/* Plan Details Grid */}
                {((mealPlan as any).subscriptionStartDate || (mealPlan as any).subscriptionEndDate) && (
                  <div className={`grid gap-3 pt-3 border-t border-border ${
                    (mealPlan as any).subscriptionStartDate && (mealPlan as any).subscriptionEndDate
                      ? 'grid-cols-2' 
                      : 'grid-cols-1'
                  }`}>
                    {(mealPlan as any).subscriptionStartDate && (
                      <div className="text-center sm:text-left">
                        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-1">Start Date</p>
                        <p className="text-sm font-medium text-foreground">
                          {new Date((mealPlan as any).subscriptionStartDate).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                    {(mealPlan as any).subscriptionEndDate && (
                      <div className="text-center sm:text-left">
                        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-1">End Date</p>
                        <p className="text-sm font-medium text-foreground">
                          {new Date((mealPlan as any).subscriptionEndDate).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                  </div>
                )}
                
                {/* Additional Info Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-3 border-t border-border">
                  <div className="text-center sm:text-left">
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-1">Type</p>
                    <p className="text-sm font-medium text-foreground">{mealPlan.mealType}</p>
                  </div>
                  <div className="text-center sm:text-left">
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-1">Meals/Day</p>
                    <p className="text-sm font-medium text-foreground">{mealPlan.mealsPerDay} meals</p>
                  </div>
                  <div className="text-center sm:text-left col-span-2 sm:col-span-1">
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-1">Status</p>
                    <div className="flex items-center justify-center sm:justify-start">
                      {getStatusIcon(mealPlan.status)}
                      <span className={`ml-1 text-sm font-medium ${getStatusColor(mealPlan.status)}`}>
                        {mealPlan.status.charAt(0).toUpperCase() + mealPlan.status.slice(1)}
                      </span>
                    </div>
                  </div>
                  </div>
                  
                {/* Pay and Leave Plan Buttons */}
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border">
                    {/* Show different options based on individual meal plan status */}
                    {mealPlan.status === 'active' ? (
                      <>
                        {/* Payment Button for Pending Bills - Use individual meal plan payment status */}
                        {mealPlan.paymentStatus === 'pending' && (
                          <button
                            disabled={loading}
                            className={`flex-[2] px-3 py-2 rounded-lg text-xs font-medium text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex flex-col items-center justify-center ${
                              mealPlan.paymentRequestStatus === 'sent' 
                                ? 'bg-blue-500' 
                                : mealPlan.paymentRequestStatus === 'rejected' 
                                  ? 'bg-red-500 hover:bg-red-600' 
                                  : 'bg-green-500 hover:bg-green-600'
                            }`}
                            title={
                              mealPlan.paymentRequestStatus === 'sent' 
                                ? 'Payment request sent to mess owner' 
                                : mealPlan.paymentRequestStatus === 'rejected' 
                                  ? 'Payment was rejected by mess owner' 
                                  : 'Pay pending bill for this meal plan'
                            }
                            onClick={() => onPayBill(
                              `bill-${mess.messId}-${mealPlan.id}`,
                              mealPlan.pricing.amount,
                              mess.messName
                            )}
                          >
                            {loading ? (
                              <div className="flex items-center space-x-1">
                                <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                <span className="text-xs">Processing...</span>
                              </div>
                            ) : mealPlan.paymentRequestStatus === 'sent' ? (
                              <div className="flex flex-col items-center">
                                <div className="flex items-center space-x-1">
                                  <ClockIcon className="w-3 h-3" />
                                  <span className="text-xs">Awaiting</span>
                                </div>
                                <span className="text-[10px] font-medium opacity-80">Request sent</span>
                              </div>
                            ) : mealPlan.paymentRequestStatus === 'rejected' ? (
                              <div className="flex flex-col items-center">
                                <div className="flex items-center space-x-1">
                                  <XCircleIcon className="w-3 h-3" />
                                  <span className="text-xs">Rejected</span>
                                </div>
                                <span className="text-[10px] font-medium opacity-80">Retry</span>
                              </div>
                            ) : (
                              <div className="flex flex-col items-center">
                                <div className="flex items-center space-x-1">
                                  <CreditCardIcon className="w-3.5 h-3.5" />
                                  <span className="text-xs font-semibold">Pay</span>
                                </div>
                                <span className="text-[10px] font-bold">₹{mealPlan.pricing.amount}</span>
                              </div>
                            )}
                          </button>
                        )}
                        
                        {/* Leave Plan Button - Only for active meal plans with paid status */}
                        <button
                          onClick={() => onLeavePlan(mess.messId, mealPlan.id, mess.messName, mealPlan.name)}
                          disabled={mealPlan.paymentStatus !== 'paid' || loading}
                          className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-colors flex flex-col items-center justify-center ${
                            mealPlan.paymentStatus === 'paid'
                              ? 'bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300'
                              : 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                          }`}
                          title={mealPlan.paymentStatus === 'paid' ? 'Leave this meal plan' : 'Pay pending bills before leaving this meal plan'}
                        >
                          {loading ? (
                            <div className="flex items-center space-x-1">
                              <div className="w-3 h-3 border-2 border-gray-500 border-t-transparent rounded-full animate-spin"></div>
                              <span className="text-xs">Processing...</span>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center">
                              <div className="flex items-center space-x-1">
                                <div className="w-1.5 h-1.5 bg-gray-500 rounded-full"></div>
                                <span className="text-xs font-semibold">Leave</span>
                              </div>
                              <span className="text-[10px] font-bold">Plan</span>
                            </div>
                          )}
                        </button>
                      </>
                    ) : mealPlan.status === 'pending' ? (
                      /* Show request management options for pending meal plan subscriptions */
                      <div className="flex items-center gap-2 w-full">
                        <div className="px-2 py-1 rounded text-xs font-medium bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                          <ClockIcon className="w-3 h-3 inline mr-1" />
                          Pending
                        </div>
                        
                        {onResendRequest && (
                          <button
                            onClick={() => onResendRequest(mess.messId, mealPlan.id, mess.messName, mealPlan.name)}
                            disabled={loading}
                            className="px-2 py-1 rounded text-xs font-medium bg-blue-500 hover:bg-blue-600 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Resend request to mess owner"
                          >
                            Resend
                          </button>
                        )}
                        
                        {onCancelRequest && (
                          <button
                            onClick={() => onCancelRequest(mess.messId, mealPlan.id, mess.messName, mealPlan.name)}
                            disabled={loading}
                            className="px-2 py-1 rounded text-xs font-medium bg-red-500 hover:bg-red-600 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Cancel this request"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    ) : (
                      /* Show status for other statuses */
                      <div className="px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 w-full text-center">
                        {mealPlan.status.charAt(0).toUpperCase() + mealPlan.status.slice(1)}
                      </div>
                    )}
                  </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Payment Alert - Only for active memberships */}
      {mess.status === 'active' && mess.paymentStatus === 'pending' && (
        <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <div className="flex items-center space-x-2">
            <ExclamationTriangleIcon className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              Payment pending. Please complete the payment to continue enjoying mess services.
            </p>
          </div>
        </div>
      )}
      
      {/* Payment Request Sent Alert */}
      {mess.status === 'active' && mess.paymentStatus === 'pending' && mess.mealPlans?.some(plan => plan.paymentRequestStatus === 'sent') && (
        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <div className="flex items-center space-x-2">
            <ClockIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <p className="text-sm text-blue-800 dark:text-blue-200">
              Your payment request has been sent to the mess owner for approval.
            </p>
          </div>
        </div>
      )}
      
      {/* Payment Rejected Alert */}
      {mess.status === 'active' && mess.paymentStatus === 'pending' && mess.mealPlans?.some(plan => plan.paymentRequestStatus === 'rejected') && (
        <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <div className="flex items-center space-x-2">
            <XCircleIcon className="w-4 h-4 text-red-600 dark:text-red-400" />
            <p className="text-sm text-red-800 dark:text-red-200">
              Your payment was rejected by the mess owner. Please try again or contact the mess owner for more details.
            </p>
          </div>
        </div>
      )}

      {/* Pending Approval Alert - Only for pending memberships */}
      {mess.status === 'pending' && (
        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <div className="flex items-center space-x-2">
            <ClockIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <p className="text-sm text-blue-800 dark:text-blue-200">
              Your join request is pending approval from the mess owner. You'll be notified once approved.
            </p>
          </div>
        </div>
      )}

      {mess.paymentStatus === 'overdue' && (
        <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <div className="flex items-center space-x-2">
            <ExclamationTriangleIcon className="w-4 h-4 text-red-600 dark:text-red-400" />
            <p className="text-sm text-red-800 dark:text-red-200">
              Payment overdue. Please make the payment immediately to avoid service suspension.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MessMembershipCard;
