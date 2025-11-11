import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  InformationCircleIcon,
  CurrencyDollarIcon,
  ExclamationTriangleIcon,
  ArrowDownTrayIcon,
  CreditCardIcon,
  ClockIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import { formatCurrency } from '../BillingPayments.utils';
import { BILLING_CONFIG, setSubscriptionPlansEnabled } from '../config';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';

interface PlanDetailsProps {
  selectedPlan?: string;
  onPlanChange: (planId: string) => void;
  plans: SubscriptionPlan[];
  showExtensions?: boolean;
  approvedLeaves?: Array<{
    id: string;
    startDate: string;
    endDate: string;
    totalDays: number;
    estimatedSavings: number;
    status: 'approved';
  }>; // Add approved leaves data
  onPayBill?: (billId: string, amount: number, messName: string) => void;
  onLeavePlan?: (messId: string, planId: string, messName: string, planName: string) => void;
  loading?: boolean;
}

interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  duration: number; // in days
  features: string[];
  isPopular?: boolean;
  subscriptionStartDate?: string; // Add subscription start date
  subscriptionEndDate?: string;   // Add subscription end date
  discount?: {
    amount: number;
    percentage: number;
    validUntil?: string;
  };
  platformFee?: number;
  extensions?: PlanExtension[];
  messId?: string;
  messName?: string;
  status?: 'active' | 'pending' | 'inactive' | 'suspended';
  paymentStatus?: 'paid' | 'pending' | 'overdue';
  paymentRequestStatus?: 'sent' | 'rejected' | null;
}

interface PlanExtension {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number;
  isActive: boolean;
}

const PlanDetails: React.FC<PlanDetailsProps> = ({
  selectedPlan,
  onPlanChange,
  plans,
  showExtensions = true,
  approvedLeaves = [],
  onPayBill,
  onLeavePlan,
  loading = false
}) => {
  const [selectedExtension, setSelectedExtension] = useState<string>('none');
  const [hasUserInteracted, setHasUserInteracted] = useState(false);
  const navigate = useNavigate();

  const currentPlan = plans.find(plan => plan.id === selectedPlan) || plans[0];
  const selectedExtensionData = selectedExtension && selectedExtension !== 'none' 
    ? currentPlan?.extensions?.find(ext => ext.id === selectedExtension)
    : null;

  // Set default plan if none selected (only on initial load, not after user interaction)
  useEffect(() => {
    if (!selectedPlan && plans.length > 0 && !hasUserInteracted) {
      onPlanChange(plans[0]?.id || '');
    }
  }, [selectedPlan, plans, onPlanChange, hasUserInteracted]);

  // State for backend calculation results
  const [pricing, setPricing] = useState<any>(null);
  const [calculationLoading, setCalculationLoading] = useState(false);
  const [calculationError, setCalculationError] = useState<string | null>(null);

  // Calculate pricing using backend
  const calculatePricing = useCallback(async () => {
    if (!currentPlan) {
      setPricing(null);
      return;
    }

    setCalculationLoading(true);
    setCalculationError(null);

    try {
      const { billingService } = await import('@/services/api/billingService');
      
      const calculationData = {
        planId: currentPlan.id,
        ...(currentPlan.subscriptionStartDate && { subscriptionStartDate: currentPlan.subscriptionStartDate }),
        ...(currentPlan.subscriptionEndDate && { subscriptionEndDate: currentPlan.subscriptionEndDate }),
        approvedLeaves: approvedLeaves,
        ...(selectedExtension && { extensionId: selectedExtension }),
        discountAmount: currentPlan.discount?.amount || 0
      } as {
        planId: string;
        subscriptionStartDate?: string;
        subscriptionEndDate?: string;
        approvedLeaves?: any[];
        extensionId?: string;
        discountAmount?: number;
      };

      const result = await billingService.calculateUserBilling(calculationData);
      
      if (result.success && result.data) {
        setPricing(result.data);
      } else {
        setCalculationError(result.message || 'Failed to calculate pricing');
        setPricing(null);
      }
    } catch (error) {
      console.error('Error calculating pricing:', error);
      setCalculationError('Failed to calculate pricing');
      setPricing(null);
    } finally {
      setCalculationLoading(false);
    }
  }, [currentPlan, selectedExtension, approvedLeaves]);

  // Trigger calculation when dependencies change
  useEffect(() => {
    calculatePricing();
  }, [calculatePricing]);

  // Debug logging removed - uncomment only when needed for debugging
  // console.log('PlanDetails Debug:', {
  //   selectedPlan,
  //   plans: plans.length,
  //   currentPlan: currentPlan?.name,
  //   pricing: pricing ? 'calculated' : 'null',
  //   calculationLoading,
  //   calculationError,
  //   totalApprovedLeaves: approvedLeaves.length,
  //   processedLeaves: pricing?.processedLeaves?.length || 0
  // });

  // Show message if no plans available
  if (plans.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center text-lg font-semibold text-foreground">
            <CurrencyDollarIcon className="h-5 w-5 mr-2 text-muted-foreground" />
            Plan Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <CurrencyDollarIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No Subscribed Plans</h3>
            <p className="text-muted-foreground mb-4">
              You don't have any active subscriptions for this mess. Please subscribe to a meal plan to see your subscription details here.
            </p>
            <p className="text-sm text-muted-foreground">
              Go to the mess search page to subscribe to available meal plans.
            </p>
            <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                <strong>Debug Info:</strong> Plans array is empty. Check console for details.
              </p>
            </div>
            {!BILLING_CONFIG.ENABLE_SUBSCRIPTION_PLANS && (
                <div className="mt-3">
                  <p className="text-xs text-muted-foreground mb-2">
                    To enable this feature for testing:
                  </p>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => setSubscriptionPlansEnabled(true)}
                    className="text-xs"
                  >
                    Enable Subscription Plans Feature
                  </Button>
                  <p className="text-xs text-muted-foreground mt-1">
                    Note: This will reload the page and may show errors if the backend endpoint is not implemented.
                  </p>
                </div>
              )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full">
    <Card className="w-full">
      <CardContent className="space-y-4">
          {/* Plan Selection - Card Based */}
          <div className="space-y-2">
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-foreground">Select Plan</label>
              {selectedPlan && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(ROUTES.USER.INVOICE_PREVIEW.replace(':planId', selectedPlan))}
                  className="text-xs"
                >
                  <ArrowDownTrayIcon className="h-4 w-4 mr-1" />
                  Download Invoice
                </Button>
              )}
            </div>
            
            <div className="space-y-3">
              {plans
                .filter(plan => !selectedPlan || plan.id === selectedPlan)
                .map((plan) => {
                  const isSelected = selectedPlan === plan.id;
                  return (
                    <div
                      key={plan.id}
                      onClick={() => {
                        setHasUserInteracted(true);
                        onPlanChange(plan.id);
                      }}
                      className={`
                        p-4 border rounded-xl bg-card cursor-pointer transition-all duration-300 group
                        ${isSelected 
                          ? 'border-primary shadow-md bg-primary/5 dark:bg-primary/10' 
                          : 'border-border hover:shadow-lg hover:border-primary/50'
                        }
                      `}
                    >
                      <div className="flex items-start space-x-3">
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => {
                          setHasUserInteracted(true);
                          onPlanChange(plan.id);
                        }}
                        onClick={(e) => e.stopPropagation()}
                          className="mt-1"
                      />
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h5 className="text-base font-semibold text-foreground">{plan.name}</h5>
                            {plan.isPopular && (
                              <Badge className="bg-primary/20 text-primary dark:bg-primary/30 dark:text-primary-light text-xs">
                                Popular
                              </Badge>
                            )}
                          </div>
                              <p className="text-sm text-muted-foreground">{plan.description}</p>
                            </div>
                            <div className="text-right ml-4 flex-shrink-0">
                              <div className="text-xl font-bold text-primary">
                                {formatCurrency(plan.basePrice)}
                              </div>
                              <div className="text-xs text-muted-foreground font-medium mt-0.5">
                                {plan.duration} days
                              </div>
                            </div>
                          </div>
                          
                          {/* Plan Details Grid */}
                          {(plan.subscriptionStartDate || plan.subscriptionEndDate) && (
                            <div className={`grid gap-3 pt-3 border-t border-border ${
                              plan.subscriptionStartDate && plan.subscriptionEndDate
                                ? 'grid-cols-2' 
                                : 'grid-cols-1'
                            }`}>
                              {plan.subscriptionStartDate && (
                                <div className="text-center sm:text-left">
                                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-1">Start Date</p>
                                  <p className="text-sm font-medium text-foreground">
                                    {new Date(plan.subscriptionStartDate).toLocaleDateString()}
                                  </p>
                                </div>
                              )}
                            {(() => {
                              // Calculate actual end date considering subscription extensions
                              // The plan.subscriptionEndDate from backend already includes extensions (updated by leave requests)
                              // But we should also check pricing calculation for the most up-to-date end date
                              let actualEndDate = plan.subscriptionEndDate;
                              
                              // Priority 1: Use pricing.subscriptionPeriod.endDate if available (from billing calculation)
                              // This is the most accurate as it's calculated with current leaves
                              if (pricing?.subscriptionPeriod?.endDate) {
                                actualEndDate = pricing.subscriptionPeriod.endDate;
                              }
                              
                              // Priority 2: If pricing has processed leaves with extensions, check for newEndDate
                              if (pricing?.processedLeaves && pricing.processedLeaves.length > 0) {
                                // Check if any leave has a newEndDate (from extension tracking)
                                const extensionData = pricing.processedLeaves.find((leave: any) => leave.newEndDate);
                                if (extensionData?.newEndDate) {
                                  const extensionEndDate = new Date(extensionData.newEndDate);
                                  const currentEndDate = actualEndDate ? new Date(actualEndDate) : null;
                                  
                                  // Use the later date (most extended)
                                  if (!currentEndDate || extensionEndDate > currentEndDate) {
                                    actualEndDate = extensionData.newEndDate;
                                  }
                                } else {
                                  // Fallback: Calculate from extension days if newEndDate not available
                                  const totalExtensionDays = pricing.processedLeaves.reduce((sum: number, leave: any) => {
                                    return sum + (leave.extensionDays || 0);
                                  }, 0);
                                  
                                  if (totalExtensionDays > 0 && plan.subscriptionEndDate) {
                                    // Start from original subscription end date (before extensions)
                                    // The backend should have already updated membership.subscriptionEndDate
                                    // But if not, we calculate it here
                                    const baseEndDate = new Date(plan.subscriptionEndDate);
                                    baseEndDate.setDate(baseEndDate.getDate() + totalExtensionDays);
                                    
                                    const calculatedEndDate = baseEndDate.toISOString();
                                    const currentEndDate = actualEndDate ? new Date(actualEndDate) : null;
                                    
                                    // Use the later date
                                    if (!currentEndDate || baseEndDate > currentEndDate) {
                                      actualEndDate = calculatedEndDate;
                                    }
                                  }
                                }
                              }
                              
                              return actualEndDate ? (
                                <div className="text-center sm:text-left">
                                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-1">End Date</p>
                                  <p className="text-sm font-medium text-foreground">
                                    {new Date(actualEndDate).toLocaleDateString()}
                                  </p>
                                </div>
                              ) : null;
                            })()}
                            </div>
                          )}

                          {/* Pay and Leave Plan Buttons */}
                          {plan.status === 'active' && (onPayBill || onLeavePlan) && (
                            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border">
                              {/* Payment Button for Pending Bills */}
                              {onPayBill && plan.paymentStatus === 'pending' && (
                                <button
                                  disabled={loading}
                                  className={`flex-[2] px-3 py-2 rounded-lg text-xs font-medium text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex flex-col items-center justify-center ${
                                    plan.paymentRequestStatus === 'sent' 
                                      ? 'bg-blue-500' 
                                      : plan.paymentRequestStatus === 'rejected' 
                                        ? 'bg-red-500 hover:bg-red-600' 
                                        : 'bg-green-500 hover:bg-green-600'
                                  }`}
                                  title={
                                    plan.paymentRequestStatus === 'sent' 
                                      ? 'Payment request sent to mess owner' 
                                      : plan.paymentRequestStatus === 'rejected' 
                                        ? 'Payment was rejected by mess owner' 
                                        : 'Pay pending bill for this meal plan'
                                  }
                                  onClick={() => onPayBill(
                                    plan.id, // Use membershipId as billId (backend will handle it)
                                    plan.basePrice,
                                    plan.messName || 'Mess'
                                  )}
                                >
                                  {loading ? (
                                    <div className="flex items-center space-x-1">
                                      <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                      <span className="text-xs">Processing...</span>
                                    </div>
                                  ) : plan.paymentRequestStatus === 'sent' ? (
                                    <div className="flex flex-col items-center">
                                      <div className="flex items-center space-x-1">
                                        <ClockIcon className="w-3 h-3" />
                                        <span className="text-xs">Awaiting</span>
                                      </div>
                                      <span className="text-[10px] font-medium opacity-80">Request sent</span>
                                    </div>
                                  ) : plan.paymentRequestStatus === 'rejected' ? (
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
                                      <span className="text-[10px] font-bold">₹{plan.basePrice}</span>
                                    </div>
                                  )}
                                </button>
                              )}
                              
                              {/* Leave Plan Button - Only for active meal plans with paid status */}
                              {onLeavePlan && (
                                <button
                                  onClick={() => onLeavePlan(
                                    plan.messId || '',
                                    (plan as any).mealPlanId || plan.id, // Use mealPlanId if available, fallback to membershipId
                                    plan.messName || 'Mess',
                                    plan.name
                                  )}
                                  disabled={plan.paymentStatus !== 'paid' || loading}
                                  className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-colors flex flex-col items-center justify-center ${
                                    plan.paymentStatus === 'paid'
                                      ? 'bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300'
                                      : 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                                  }`}
                                  title={plan.paymentStatus === 'paid' ? 'Leave this meal plan' : 'Pay pending bills before leaving this meal plan'}
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
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
            
            {/* Show "Show All Plans" button when a plan is selected */}
            {selectedPlan && plans.length > 1 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setHasUserInteracted(true);
                  onPlanChange('');
                }}
                className="w-full text-xs text-muted-foreground"
              >
                Show All Plans
              </Button>
            )}
          </div>

          {/* Selected Plan Details */}
          {currentPlan && selectedPlan && (
            <div className="space-y-3">
              {/* Extensions Selection */}
              {showExtensions && currentPlan.extensions && currentPlan.extensions.length > 0 && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Add Extensions (Optional)</label>
                  <Select value={selectedExtension} onValueChange={setSelectedExtension}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select an extension" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No Extension</SelectItem>
                      {currentPlan.extensions.map((extension) => (
                        <SelectItem key={extension.id} value={extension.id}>
                          <div className="flex items-center justify-between w-full">
                            <div>
                              <span className="font-medium text-foreground">{extension.name}</span>
                              <p className="text-xs text-muted-foreground">{extension.description}</p>
                            </div>
                            <span className="text-sm text-muted-foreground">
                              {formatCurrency(extension.price)}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}


              {/* Loading State */}
              {calculationLoading && (
                <div className="flex items-center justify-center py-4">
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                    <span className="text-sm text-muted-foreground">Calculating pricing...</span>
                  </div>
                </div>
              )}

              {/* Error State */}
              {calculationError && (
                <div className="p-3 bg-destructive/10 dark:bg-destructive/20 rounded-lg border border-destructive/20">
                  <div className="flex items-center">
                    <ExclamationTriangleIcon className="h-5 w-5 text-destructive mr-2" />
                    <span className="text-sm text-destructive">{calculationError}</span>
                  </div>
                </div>
              )}

              {/* Price Breakdown */}
              {pricing && (
                <div className="border-t border-border pt-4">
                  <h4 className="text-lg font-semibold text-foreground mb-3">Price Breakdown</h4>
                  <div className="p-4 border border-border rounded-xl bg-card space-y-3">
                    {/* Base Price */}
                    <div className="flex justify-between items-center py-2 border-b border-border">
                      <span className="text-sm font-medium text-foreground">
                        Plan Price ({currentPlan.duration} days)
                      </span>
                      <span className="text-sm font-semibold text-foreground">
                        {formatCurrency(pricing.basePrice)}
                      </span>
                    </div>

                    {/* Extension Price */}
                    {selectedExtensionData && (
                      <>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">
                            Extension: {selectedExtensionData.name} ({selectedExtensionData.duration} days)
                          </span>
                          <span className="text-sm font-medium text-foreground">
                            {formatCurrency(pricing.extensionPrice)}
                          </span>
                        </div>
                        {/* Estimated Extension Savings */}
                        {pricing.extensionPrice > 0 && selectedExtensionData && (
                          <div className="ml-4 pl-4 border-l-2 border-primary/30">
                            <div className="flex justify-between items-center">
                              <span className="text-xs text-muted-foreground">
                                Estimated Extension Savings
                              </span>
                              <span className="text-xs font-medium text-primary">
                                {formatCurrency((selectedExtensionData.price / selectedExtensionData.duration) * currentPlan.duration - pricing.basePrice)}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              Extended plan: {currentPlan.duration + selectedExtensionData.duration} days total
                            </p>
                          </div>
                        )}
                      </>
                    )}

                    {/* Subtotal */}
                    <div className="flex justify-between items-center pt-2 border-t-2 border-border">
                      <span className="text-sm font-semibold text-foreground">Subtotal</span>
                      <span className="text-sm font-semibold text-foreground">
                        {formatCurrency(pricing.pricing.subtotal)}
                      </span>
                    </div>

                    {/* Discount */}
                    {pricing.discountAmount > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-green-600 dark:text-green-400">
                          Discount ({currentPlan.discount?.percentage}% OFF)
                        </span>
                        <span className="text-sm font-medium text-green-600 dark:text-green-400">
                          -{formatCurrency(pricing.discountAmount)}
                        </span>
                      </div>
                    )}

                    {/* Approved Leaves Deduction */}
                    {pricing.approvedLeavesDeduction > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-green-600 dark:text-green-400">
                          Approved Leaves Deduction
                        </span>
                        <span className="text-sm font-medium text-green-600 dark:text-green-400">
                          -{formatCurrency(pricing.approvedLeavesDeduction)}
                        </span>
                      </div>
                    )}

                    {/* Platform Fee */}
                    {pricing.platformFee > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">
                          Platform Fee
                          <InformationCircleIcon className="h-3 w-3 inline ml-1" />
                        </span>
                        <span className="text-sm font-medium text-foreground">
                          {formatCurrency(pricing.platformFee)}
                        </span>
                      </div>
                    )}

                    {/* Total Amount */}
                    <div className="flex justify-between items-center pt-4 mt-4 border-t-2 border-primary/30 bg-primary/5 dark:bg-primary/10 -mx-4 -mb-4 px-4 py-4 rounded-b-xl">
                      <span className="text-base font-bold text-foreground">Total Amount</span>
                      <span className="text-2xl font-bold text-primary">
                        {formatCurrency(pricing.pricing.finalTotal)}
                      </span>
                    </div>
                  </div>

                  {/* Approved Leaves Summary - After Total Bill */}
                  {pricing?.processedLeaves && pricing.processedLeaves.length > 0 ? (
                    <div className="space-y-2 mt-4">
                      <label className="text-sm font-semibold text-foreground uppercase tracking-wide">
                        Approved Leaves (Subscription Period)
                      </label>
                      <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
                        <div className="mb-3 text-xs text-muted-foreground">
                          <span className="font-semibold text-foreground uppercase tracking-wide">Subscription Period:</span>{' '}
                          {new Date(pricing.subscriptionPeriod.startDate).toLocaleDateString()} - {new Date(pricing.subscriptionPeriod.endDate).toLocaleDateString()}
                        </div>
                        <div className="space-y-3">
                          {pricing.processedLeaves.map((leave: any, index: number) => {
                            // Find the original leave from approvedLeaves to get extension info
                            const originalLeave = approvedLeaves.find((al: any) => al.id === leave.leaveId) as any;
                            
                            // Check if this leave has subscription extension enabled and has values
                            // Check both the processed leave data and original leave data
                            const extensionDays = leave.extensionDays || (originalLeave?.['extensionDays'] as number) || 0;
                            const extensionMeals = leave.extensionMeals || (originalLeave?.['extensionMeals'] as number) || 0;
                            const extendSubscription = leave.extendSubscription !== undefined ? leave.extendSubscription : (originalLeave?.['extendSubscription'] as boolean);
                            
                            const hasExtension = (extensionMeals > 0 || extensionDays > 0) && extendSubscription === true;
                            
                            // Check if there's actual savings (deduction > 0)
                            const hasSavings = leave.overlap.deduction > 0;
                            
                            // Don't render if neither extension nor savings
                            if (!hasExtension && !hasSavings) {
                              return null;
                            }
                            
                            return (
                              <div key={leave.id || `leave-${index}`} className="p-3 bg-background rounded-lg border border-border">
                                {/* Leave Dates */}
                                <div className="flex justify-between items-center text-sm mb-2">
                                  <span className="text-foreground font-medium">
                                    {new Date(leave.originalLeave.startDate).toLocaleDateString()} - {new Date(leave.originalLeave.endDate).toLocaleDateString()}
                              </span>
                                  <span className="text-muted-foreground text-xs">
                                    {leave.overlap.days} days
                            </span>
                          </div>
                        
                                {/* Show Extension or Savings based on leave type */}
                                {hasExtension ? (
                                  <div className="flex justify-between items-center text-sm bg-blue-100 dark:bg-blue-900/30 px-3 py-2 rounded-lg border border-blue-200 dark:border-blue-800">
                                    <span className="text-blue-700 dark:text-blue-300 font-medium">
                                      Estimated Subscription Extension: +{extensionDays} days
                                    </span>
                                    <span className="text-blue-600 dark:text-blue-400 font-bold">
                                      +{extensionMeals} meals
                              </span>
                            </div>
                                ) : hasSavings ? (
                                  <div className="flex justify-between items-center text-sm bg-green-100 dark:bg-green-900/30 px-3 py-2 rounded-lg border border-green-200 dark:border-green-800">
                                    <span className="text-green-700 dark:text-green-300 font-medium">
                                      Estimated Savings
                                    </span>
                                    <span className="text-green-600 dark:text-green-400 font-bold">
                                      -{formatCurrency(leave.overlap.deduction)}
                            </span>
                          </div>
                                ) : null}
                              </div>
                            );
                          }).filter(Boolean)}
                          {/* Only show total deduction if there's actual deduction */}
                          {pricing?.approvedLeavesDeduction > 0 && (
                            <div className="flex justify-between items-center pt-3 mt-3 border-t-2 border-green-200 dark:border-green-800">
                              <span className="text-sm font-semibold text-green-800 dark:text-green-200">Total Approved Deduction:</span>
                              <span className="text-base font-bold text-green-800 dark:text-green-200">
                                -{formatCurrency(pricing.approvedLeavesDeduction)}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : null}
                </div>
              )}
            </div>
          )}
        </CardContent>

    </Card>
  </div>
  );
};

export default PlanDetails;
