import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  ExclamationTriangleIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  CreditCardIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';

import { useBillingPayments } from './BillingPayments.hooks';
import { useToast } from '@/hooks/use-toast';
import messService from '@/services/api/messService';
import { isSubscriptionPlansEnabled } from './config';
import { ROUTES } from '@/constants/routes';

// Import sub-components
import { PlanDetails, PaymentHistory } from './components';
import CommonHeader from '@/components/common/Header/CommonHeader';

const BillingPayments: React.FC = () => {
  const { billingData, loading, error, refreshing, refreshData } = useBillingPayments();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // Filters removed in single-page view
  const [selectedPlan, setSelectedPlan] = useState<string>('');
  const [availablePlans, setAvailablePlans] = useState<any[]>([]);
  const [approvedLeaves, setApprovedLeaves] = useState<any[]>([]);
  const [actionLoading, setActionLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('plan-details');

  // Fetch subscription plans from backend
  const fetchSubscriptionPlans = async () => {
    console.log('🔍 Fetching subscription plans...', {
      billingData: !!billingData,
      memberships: billingData?.memberships?.length || 0,
      featureEnabled: isSubscriptionPlansEnabled()
    });
    
    if (!billingData?.memberships?.length) {
      console.log('❌ No active memberships found, clearing plans');
      setAvailablePlans([]);
      return;
    }
    
    // Check if subscription plans feature is enabled
    if (!isSubscriptionPlansEnabled()) {
      console.log('Subscription plans feature is disabled');
      setAvailablePlans([]);
      return;
    }
    
    try {
      console.log('🔍 Debug - All memberships:', billingData.memberships);
      
      if (!billingData.memberships.length) {
        console.log('❌ No memberships found');
        return;
      }

      // Create plans directly from memberships instead of fetching from backend
      // This ensures we get all plans for all memberships, even multiple plans from same mess
      // Filter to only show active/approved plans, not pending ones
      const allPlans = [];
      console.log('🔍 Creating plans from', billingData.memberships.length, 'memberships');
      
      for (const membership of billingData.memberships) {
        // Filter to only show active/approved plans, exclude pending, inactive, and suspended
        const membershipStatus = membership.status || 'active';
        if (membershipStatus !== 'active') {
          console.log(`⏭️ Skipping ${membershipStatus} membership:`, membership.membershipId);
          continue;
        }
        
        console.log('🔍 Processing membership:', membership);
        
        // Create a plan object from membership data
        const plan = {
          id: membership.membershipId,
          mealPlanId: (membership as any).mealPlanId || null, // Add mealPlanId for leave plan
          name: membership.planName || 'Unknown Plan',
          description: `${membership.planName || 'Plan'} - ${membership.messName}`,
          basePrice: membership.amount || 0,
          duration: 30, // Default to 30 days
          subscriptionStartDate: (membership as any).subscriptionStartDate || membership.nextPaymentDate, // Use subscription start date, fallback to nextPaymentDate
          subscriptionEndDate: (membership as any).subscriptionEndDate || membership.dueDate, // Use subscription end date (includes extensions), fallback to dueDate
          messId: membership.messId,
          messName: membership.messName,
          status: membershipStatus,
          paymentStatus: membership.paymentStatus || 'paid',
          paymentRequestStatus: (membership as any).paymentRequestStatus || 'none',
          features: ['Breakfast', 'Lunch', 'Dinner', 'Leave Management', 'Bill Adjustments'],
          pricing: {
            amount: membership.amount || 0,
            period: 'month'
          }
        };
        
        console.log('✅ Created plan from membership:', plan);
        allPlans.push(plan);
      }
      
      console.log('🔍 Total plans collected from all messes:', allPlans.length);
      console.log('🔍 All plans data:', allPlans);
      
      if (allPlans.length > 0) {
        // Plans are already in the correct format, just add some additional properties
        const transformedPlans = allPlans.map((plan: any) => ({
          ...plan,
          platformFee: 0,
          discount: undefined,
          extensions: []
        }));
        
        console.log('✅ Subscription plans created successfully:', transformedPlans);
        setAvailablePlans(transformedPlans);
        
        // Set default plan if none selected
        if (transformedPlans.length > 0 && !selectedPlan) {
          setSelectedPlan(transformedPlans[0]?.id || '');
        }
      }
    } catch (error: any) {
      console.error('❌ Error fetching subscription plans:', error);
      setAvailablePlans([]);
    }
  };

  // Fetch approved leaves for billing calculations
  const fetchApprovedLeaves = async () => {
    try {
      // Import leaveService dynamically to avoid circular dependencies
      const { default: leaveService } = await import('@/services/api/leaveService');
      const response = await leaveService.getLeaveRequests({ status: 'approved' });
      
      if (response.success && response.data) {
        const approvedLeavesData = response.data.map((leave: any) => ({
          id: leave._id,
          startDate: leave.startDate,
          endDate: leave.endDate,
          totalDays: leave.totalDays || 0,
          estimatedSavings: leave.estimatedSavings || 0,
          status: 'approved',
          extendSubscription: leave.extendSubscription || false,
          extensionMeals: leave.extensionMeals || 0,
          extensionDays: leave.extensionDays || 0
        }));
        
        console.log('✅ Approved leaves fetched:', approvedLeavesData);
        console.log('🔍 Approved leaves details:', approvedLeavesData.map((leave: any) => ({
          id: leave.id,
          startDate: leave.startDate,
          endDate: leave.endDate,
          totalDays: leave.totalDays,
          estimatedSavings: leave.estimatedSavings,
          rawStartDate: leave.startDate,
          rawEndDate: leave.endDate
        })));
        setApprovedLeaves(approvedLeavesData);
      } else {
        console.log('No approved leaves data received from backend');
        setApprovedLeaves([]);
      }
    } catch (error: any) {
      console.error('❌ Error fetching approved leaves:', error);
      setApprovedLeaves([]);
    }
  };

  

  // Handle bill selection for payment (kept for future use)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  // no-op

  // Handle Pay Bill
  const handlePayBill = useCallback(async (billId: string, amount: number, messName: string) => {
    try {
      setActionLoading(true);
      
      // Find the membership and plan details
      const membership = billingData?.memberships?.find((m: any) => m.membershipId === billId);
      const plan = availablePlans.find((p: any) => p.id === billId);
      
      if (!membership || !plan) {
        setActionLoading(false);
        toast({
          title: 'Payment Error',
          description: 'Membership or plan not found. Please refresh and try again.',
          variant: 'destructive',
        });
        return;
      }
      
      // Find the actual billing record ID from bills array
      let actualBillId: string | null = null;
      
      if (billingData?.bills && billingData.bills.length > 0) {
        // Find pending bill for this membership
        const pendingBill = billingData.bills.find(
          (bill: any) => bill.membershipId === billId && bill.payment?.status === 'pending'
        );
        if (pendingBill?.id) {
          actualBillId = pendingBill.id;
        }
      }
      
      // If no bill found, navigate to PaymentOptions to submit payment request
      if (!actualBillId) {
        setActionLoading(false);
        
        // Try to fetch mess UPI ID from mess details
        let messUpiId: string | undefined = undefined;
        try {
          const messDetailsResponse = await messService.getMessDetailsById(membership.messId);
          if (messDetailsResponse.success && messDetailsResponse.data) {
            messUpiId = (messDetailsResponse.data as any).upiId || (messDetailsResponse.data as any).paymentSettings?.upiId;
          }
        } catch (error) {
          console.warn('Could not fetch mess UPI ID:', error);
          // Continue without UPI ID - PaymentMethods will handle it gracefully
        }
        
        // Navigate to PaymentOptions with bill payment context
        // PaymentOptions will handle submitting the payment request
        navigate(ROUTES.USER.PAYMENT_OPTIONS, {
          state: {
            isBillPayment: true,
            paymentType: 'pay_now',
            mess: {
              id: membership.messId,
              name: messName,
              upiId: messUpiId
            },
            selectedMealPlan: {
              id: plan.id,
              name: plan.name,
              description: plan.description,
              pricing: {
                amount: amount,
                period: 'month' as const
              },
              mealType: 'All Meals',
              mealsPerDay: 3,
              isActive: true,
              leaveRules: {
                maxLeaveDays: 5,
                maxLeaveMeals: 15,
                requireTwoHourNotice: true,
                noticeHours: 2,
                minConsecutiveDays: 1,
                extendSubscription: true,
                autoApproval: false,
                leaveLimitsEnabled: true,
                consecutiveLeaveEnabled: true,
                maxLeaveDaysEnabled: true,
                maxLeaveMealsEnabled: true
              }
            },
            membershipId: billId,
            amount: amount,
            billId: billId // Pass membershipId as billId for payment request
          }
        });
        return;
      }
      
      // If bill exists, try to pay directly
      const response = await messService.payBill(actualBillId, 'online');
      
      if (response.success) {
        toast({
          title: 'Payment Successful',
          description: `Payment of ₹${amount} processed successfully for ${messName}.`,
          variant: 'default',
        });
        // Refresh billing data
        await refreshData();
        // Refresh plans
        if (billingData?.memberships?.length) {
          await fetchSubscriptionPlans();
        }
      } else {
        toast({
          title: 'Payment Failed',
          description: response.message || 'Failed to process payment. Please try again.',
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      console.error('Error processing payment:', error);
      toast({
        title: 'Payment Error',
        description: error.message || 'An unexpected error occurred during payment.',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(false);
    }
  }, [toast, refreshData, billingData, availablePlans, navigate]);

  // Handle Leave Plan
  const handleLeavePlan = useCallback(async (messId: string, mealPlanId: string, messName: string, planName: string) => {
    try {
      setActionLoading(true);
      
      // mealPlanId is the actual meal plan ID (not membershipId)
      // Call the backend API to leave the meal plan
      if (!mealPlanId) {
        setActionLoading(false);
        toast({
          title: 'Leave Plan Error',
          description: 'Meal plan ID is missing. Please refresh and try again.',
          variant: 'destructive',
        });
        return;
      }
      
      const response = await messService.leaveMess(messId, mealPlanId);
      
      if (response.success) {
        toast({
          title: 'Successfully Left',
          description: `You have successfully left ${planName} from ${messName}.`,
          variant: 'default',
        });
        
        // Refresh billing data
        await refreshData();
        // Refresh plans
        if (billingData?.memberships?.length) {
          await fetchSubscriptionPlans();
        }

        // Dispatch event to refresh chat rooms (remove user from mess chat groups)
        window.dispatchEvent(new CustomEvent('messMembershipChanged'));
        // Also set storage event for cross-tab synchronization
        localStorage.setItem('messMembershipChanged', Date.now().toString());
        setTimeout(() => localStorage.removeItem('messMembershipChanged'), 100);
      } else {
        toast({
          title: 'Leave Failed',
          description: response.message || 'Failed to leave the meal plan. Please try again.',
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      console.error('Error leaving meal plan:', error);
      toast({
        title: 'Leave Error',
        description: error.message || 'An unexpected error occurred. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(false);
    }
  }, [toast, refreshData, billingData]);

  // Fetch plans when billing data is available
  useEffect(() => {
    if (billingData?.memberships?.length) {
      fetchSubscriptionPlans();
    }
    // Also fetch approved leaves for billing calculations
    fetchApprovedLeaves();
  }, [billingData]);

  // Filter handlers
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  // no-op

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  // no-op

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="flex items-center space-x-2">
          <ArrowPathIcon className="h-6 w-6 animate-spin text-primary" />
          <span className="text-foreground">Loading billing information...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <ExclamationTriangleIcon className="h-12 w-12 text-destructive mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">Error Loading Billing Data</h3>
              <p className="text-muted-foreground mb-4">{error}</p>
              <Button onClick={refreshData} disabled={refreshing}>
                <ArrowPathIcon className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Check if user has left all mess plans
  if (billingData && (!billingData.memberships || billingData.memberships.length === 0)) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <CheckCircleIcon className="h-12 w-12 text-green-600 dark:text-green-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No Active Memberships</h3>
              <p className="text-muted-foreground mb-4">
                You have left all mess plans. You don't have any active subscriptions to manage.
              </p>
              <p className="text-sm text-muted-foreground">
                To join a new mess, go to the Dashboard and search for available mess options.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!billingData) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <ExclamationTriangleIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No Billing Data</h3>
              <p className="text-muted-foreground">You don't have any billing information yet.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-[72px] sm:pb-6">
      <CommonHeader
        title="Billing & Payments"
        subtitle="Manage your subscriptions, bills, and payment history"
      >

      </CommonHeader>

      {/* Tabs for Plan Details and Payment History */}
      <div className="mb-6">
        <div className="flex space-x-1 bg-card rounded-lg p-1 border border-border w-full sm:w-auto">
          <button
            onClick={() => setActiveTab('plan-details')}
            className={`flex-1 sm:flex-none px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
              activeTab === 'plan-details'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <DocumentTextIcon className="h-4 w-4" />
            <span className="hidden sm:inline">Plan Details</span>
            <span className="sm:hidden">Plans</span>
          </button>
          <button
            onClick={() => setActiveTab('payment-history')}
            className={`flex-1 sm:flex-none px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
              activeTab === 'payment-history'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <CreditCardIcon className="h-4 w-4" />
            <span className="hidden sm:inline">Payment History</span>
            <span className="sm:hidden">Payments</span>
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'plan-details' && (
        <PlanDetails
          selectedPlan={selectedPlan}
          onPlanChange={setSelectedPlan}
          plans={availablePlans}
          showExtensions={true}
          approvedLeaves={approvedLeaves}
          onPayBill={handlePayBill}
          onLeavePlan={handleLeavePlan}
          loading={actionLoading}
        />
      )}

      {activeTab === 'payment-history' && (
        <PaymentHistory 
          transactions={billingData?.transactions || []} 
          loading={loading}
        />
      )}
      
    </div>
  );
};

export default BillingPayments;
