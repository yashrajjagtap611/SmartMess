import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useBillingPayments } from '../BillingPayments.hooks';
import { useUser } from '@/contexts/AuthContext';
import InvoiceDownload from '../components/InvoiceDownload';
import CommonHeader from '@/components/common/Header/CommonHeader';
import { ArrowPathIcon } from '@heroicons/react/24/outline';

const InvoicePreviewPage: React.FC = () => {
  const { planId } = useParams<{ planId: string }>();
  const navigate = useNavigate();
  const { billingData, loading } = useBillingPayments();
  const { user } = useUser();
  
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [pricing, setPricing] = useState<any>(null);
  const [calculationLoading, setCalculationLoading] = useState(false);
  const [approvedLeaves, setApprovedLeaves] = useState<any[]>([]);

  // Fetch approved leaves
  useEffect(() => {
    const fetchApprovedLeaves = async () => {
      try {
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
          setApprovedLeaves(approvedLeavesData);
        }
      } catch (error) {
        console.error('Error fetching approved leaves:', error);
      }
    };
    fetchApprovedLeaves();
  }, []);

  // Find and set the selected plan
  useEffect(() => {
    if (billingData?.memberships && planId) {
      const membership = billingData.memberships.find((m: any) => m.membershipId === planId);
      if (membership) {
        const plan = {
          id: membership.membershipId,
          name: membership.planName || 'Unknown Plan',
          description: `${membership.planName || 'Plan'} - ${membership.messName}`,
          basePrice: membership.amount || 0,
          duration: 30,
          subscriptionStartDate: membership.nextPaymentDate,
          subscriptionEndDate: membership.dueDate,
          messId: membership.messId,
          messName: membership.messName,
          features: ['Breakfast', 'Lunch', 'Dinner', 'Leave Management', 'Bill Adjustments'],
        };
        setSelectedPlan(plan);
      }
    }
  }, [billingData, planId]);

  // Calculate pricing
  const calculatePricing = useCallback(async () => {
    if (!selectedPlan) {
      setPricing(null);
      return;
    }

    setCalculationLoading(true);

    try {
      const { billingService } = await import('@/services/api/billingService');
      
      const calculationData = {
        planId: selectedPlan.id,
        ...(selectedPlan.subscriptionStartDate && { subscriptionStartDate: selectedPlan.subscriptionStartDate }),
        ...(selectedPlan.subscriptionEndDate && { subscriptionEndDate: selectedPlan.subscriptionEndDate }),
        approvedLeaves: approvedLeaves,
        discountAmount: 0
      };

      const result = await billingService.calculateUserBilling(calculationData);
      
      if (result.success && result.data) {
        setPricing(result.data);
      } else {
        setPricing(null);
      }
    } catch (error) {
      console.error('Error calculating pricing:', error);
      setPricing(null);
    } finally {
      setCalculationLoading(false);
    }
  }, [selectedPlan, approvedLeaves]);

  useEffect(() => {
    calculatePricing();
  }, [calculatePricing]);

  const handleClose = () => {
    navigate('/user/billing');
  };

  if (loading || calculationLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="flex items-center space-x-2">
          <ArrowPathIcon className="h-6 w-6 animate-spin text-primary" />
          <span className="text-foreground">Loading invoice...</span>
        </div>
      </div>
    );
  }

  if (!selectedPlan) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-foreground mb-2">Plan Not Found</h3>
          <p className="text-muted-foreground mb-4">The requested plan could not be found.</p>
          <button
            onClick={handleClose}
            className="text-primary hover:underline"
          >
            Back to Billing
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4 pb-20 sm:pb-6">
      <CommonHeader
        title="Invoice Preview"
        subtitle="Review and download your invoice"
      />
      
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6">
        <InvoiceDownload
          plans={[selectedPlan]}
          selectedPlan={selectedPlan}
          pricing={pricing}
          approvedLeaves={approvedLeaves}
          user={user}
          billingData={billingData}
          onClose={handleClose}
        />
      </div>
    </div>
  );
};

export default InvoicePreviewPage;

