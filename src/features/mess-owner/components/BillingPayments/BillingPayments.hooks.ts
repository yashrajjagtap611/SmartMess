import { useState, useEffect, useCallback } from 'react';
import { billingService } from '@/services/api/billingService';
import type { MessOwnerBillingData, MessOwnerInstallmentPlan, MessOwnerInstallmentPayment } from './BillingPayments.types';
import { formatCurrency, formatDate, getStatusColor, getStatusIcon, getStatusText } from './BillingPayments.utils';

export const useBillingPayments = (messId: string) => {
  const [billingData, setBillingData] = useState<MessOwnerBillingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [filterPaymentMethod, setFilterPaymentMethod] = useState<string>('');
  const [filterDateRange, setFilterDateRange] = useState<{ start?: string; end?: string }>({});

  // Default billing data structure to prevent undefined errors
  const defaultBillingData: MessOwnerBillingData = {
    summary: {
      totalRevenue: 0,
      monthlyRevenue: 0,
      pendingAmount: 0,
      overdueAmount: 0,
      totalMembers: 0,
      activeMembers: 0,
      collectionRate: 0,
      averagePaymentTime: 0
    },
    members: [],
    recentBills: [],
    recentTransactions: [],
    paymentRequests: [],
    bulkActions: {
      isProcessing: false,
      processedCount: 0,
      totalCount: 0,
      errors: []
    }
  };

  const loadBillingData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await billingService.getMessOwnerBillingData(messId);
      if (response.success && response.data) {
        // Merge with default data to ensure all properties are present
        const responseData = response.data as any;
        const mergedData: MessOwnerBillingData = {
          ...defaultBillingData,
          ...responseData,
          summary: {
            ...defaultBillingData.summary,
            ...responseData.summary
          },
          members: responseData.members || [],
          recentBills: responseData.recentBills || [],
          recentTransactions: responseData.recentTransactions || [],
          paymentRequests: responseData.paymentRequests || [],
          bulkActions: {
            ...defaultBillingData.bulkActions,
            ...(responseData.bulkActions || {})
          }
        };
        setBillingData(mergedData);
      } else {
        setError(response.message || 'Failed to load billing data');
        // Set default data even on API failure to show something
        setBillingData(defaultBillingData);
      }
    } catch (err) {
      console.error('Error loading billing data:', err);
      setError('Failed to load billing data');
      // Set default data even on error to show something
      setBillingData(defaultBillingData);
    } finally {
      setLoading(false);
    }
  }, [messId]);

  const refreshData = useCallback(async () => {
    try {
      setRefreshing(true);
      setError(null);
      const response = await billingService.getMessOwnerBillingData(messId);
      if (response.success && response.data) {
        // Merge with default data to ensure all properties are present
        const responseData = response.data as any;
        const mergedData: MessOwnerBillingData = {
          ...defaultBillingData,
          ...responseData,
          summary: {
            ...defaultBillingData.summary,
            ...responseData.summary
          },
          members: responseData.members || [],
          recentBills: responseData.recentBills || [],
          recentTransactions: responseData.recentTransactions || [],
          paymentRequests: responseData.paymentRequests || [],
          bulkActions: {
            ...defaultBillingData.bulkActions,
            ...(responseData.bulkActions || {})
          }
        };
        setBillingData(mergedData);
      } else {
        setError(response.message || 'Failed to refresh billing data');
      }
    } catch (err) {
      console.error('Error refreshing billing data:', err);
      setError('Failed to refresh billing data');
    } finally {
      setRefreshing(false);
    }
  }, [messId]);

  const sendPaymentReminder = useCallback(async (membershipId: string) => {
    try {
      const response = await billingService.sendPaymentReminder(membershipId);
      if (response.success) {
        await refreshData();
        return { success: true, message: 'Payment reminder sent successfully' };
      } else {
        return { success: false, message: response.message || 'Failed to send payment reminder' };
      }
    } catch (err) {
      console.error('Error sending payment reminder:', err);
      return { success: false, message: 'Failed to send payment reminder' };
    }
  }, [refreshData]);

  const generateReport = useCallback(async () => {
    try {
      if (!messId) {
        return { success: false, message: 'Mess ID is required' };
      }

      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 1);
      const endDate = new Date();

      const response = await (billingService.generateBillingReport as any)(
        messId,
        startDate.toISOString().split('T')[0],
        endDate.toISOString().split('T')[0]
      );

      if (response.success) {
        // Download report
        console.log('Report generated:', response.data);
        return { success: true, data: response.data };
      } else {
        return { success: false, message: response.message || 'Failed to generate billing report' };
      }
    } catch (err) {
      console.error('Error generating billing report:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      return { success: false, message: `Failed to generate billing report: ${errorMessage}` };
    }
  }, [messId]);

  const updatePaymentStatus = useCallback(async (membershipId: string, status: string, notes?: string, paymentMethod?: string) => {
    try {
      const response = await billingService.updateBillingStatus(membershipId, status, notes, paymentMethod);
      if (response.success) {
        // Refresh data after successful update
        await refreshData();
        return response;
      } else {
        setError(response.message || 'Failed to update payment status');
        return response;
      }
    } catch (err) {
      console.error('Error updating payment status:', err);
      setError('Failed to update payment status');
      return { success: false, message: 'Failed to update payment status' };
    }
  }, [refreshData]);

  const bulkUpdatePaymentStatus = useCallback(async (membershipIds: string[], status: string, notes?: string) => {
    try {
      const response = await billingService.bulkUpdatePaymentStatus(membershipIds, status, notes);
      if (response.success) {
        await refreshData();
        return response;
      } else {
        setError(response.message || 'Failed to bulk update payment status');
        return response;
      }
    } catch (err) {
      console.error('Error bulk updating payment status:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError('Failed to bulk update payment status');
      return { success: false, message: 'Failed to bulk update payment status', processed: 0, errors: [errorMessage] };
    }
  }, [refreshData]);

  const verifyPaymentRequest = useCallback(async (requestId: string, verified: boolean, notes?: string) => {
    try {
      const response = await billingService.verifyPaymentRequest(requestId, verified, notes);
      if (response.success) {
        await refreshData();
        return response;
      } else {
        setError(response.message || 'Failed to verify payment request');
        return response;
      }
    } catch (err) {
      console.error('Error verifying payment request:', err);
      setError('Failed to verify payment request');
      return { success: false, message: 'Failed to verify payment request' };
    }
  }, [refreshData]);

  const approvePaymentRequest = useCallback(async (membershipId: string, method?: string) => {
    try {
      console.log('Approving payment request:', { membershipId, method });
      const response = await billingService.approvePaymentRequest(membershipId, method);
      console.log('Approval response:', response);
      if (response.success) {
        await refreshData();
        return response;
      } else {
        // Don't set error state for insufficient credits - let the UI handle it
        if (response.data?.requiredCredits === undefined) {
          setError(response.message || 'Failed to approve payment request');
        }
        return response;
      }
    } catch (err: any) {
      console.error('Error approving payment request:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to approve payment request';
      setError(errorMessage);
      return { 
        success: false, 
        message: errorMessage,
        data: err.response?.data?.data 
      };
    }
  }, [refreshData]);

  const rejectPaymentRequest = useCallback(async (membershipId: string, remarks?: string) => {
    try {
      const response = await billingService.rejectPaymentRequest(membershipId, remarks);
      if (response.success) {
        await refreshData();
        return response;
      } else {
        setError(response.message || 'Failed to reject payment request');
        return response;
      }
    } catch (err) {
      console.error('Error rejecting payment request:', err);
      setError('Failed to reject payment request');
      return { success: false, message: 'Failed to reject payment request' };
    }
  }, [refreshData]);

  // Removed: uploadReceipt, generateIndividualBill

  const sendBulkReminders = useCallback(async (membershipIds: string[], message?: string) => {
    try {
      const response = await billingService.sendBulkReminders(membershipIds, message);
      if (response.success) {
        return response;
      } else {
        setError(response.message || 'Failed to send bulk reminders');
        return response;
      }
    } catch (err) {
      console.error('Error sending bulk reminders:', err);
      setError('Failed to send bulk reminders');
      return { success: false, message: 'Failed to send bulk reminders', sent: 0, failed: membershipIds.length };
    }
  }, []);

  // Removed: calculateBillWithLeaves


  useEffect(() => {
    if (messId) {
      loadBillingData();
    }
  }, [messId]);

  // Installment Plan Management
  const [installmentPlans, setInstallmentPlans] = useState<MessOwnerInstallmentPlan[]>([]);
  const [installmentPayments, setInstallmentPayments] = useState<MessOwnerInstallmentPayment[]>([]);

  const createInstallmentPlan = useCallback(async (planData: Omit<MessOwnerInstallmentPlan, 'id' | 'createdAt' | 'createdBy'>) => {
    try {
      const response = await billingService.createInstallmentPlan(planData);
      if (response.success && response.data) {
        setInstallmentPlans(prev => [response.data, ...prev]);
        return { success: true, data: response.data };
      } else {
        return { success: false, message: response.message || 'Failed to create installment plan' };
      }
    } catch (error) {
      console.error('Error creating installment plan:', error);
      return { success: false, message: 'Failed to create installment plan' };
    }
  }, []);

  const updateInstallmentPlan = useCallback(async (planId: string, updates: Partial<MessOwnerInstallmentPlan>) => {
    try {
      const response = await billingService.updateInstallmentPlan(planId, updates);
      if (response.success) {
        setInstallmentPlans(prev => 
          prev.map(plan => plan.id === planId ? { ...plan, ...updates } : plan)
        );
        return { success: true };
      } else {
        return { success: false, message: response.message || 'Failed to update installment plan' };
      }
    } catch (error) {
      console.error('Error updating installment plan:', error);
      return { success: false, message: 'Failed to update installment plan' };
    }
  }, []);

  const deleteInstallmentPlan = useCallback(async (planId: string) => {
    try {
      const response = await billingService.deleteInstallmentPlan(planId);
      if (response.success) {
        setInstallmentPlans(prev => prev.filter(plan => plan.id !== planId));
        return { success: true };
      } else {
        return { success: false, message: response.message || 'Failed to delete installment plan' };
      }
    } catch (error) {
      console.error('Error deleting installment plan:', error);
      return { success: false, message: 'Failed to delete installment plan' };
    }
  }, []);

  const getInstallmentPlans = useCallback(async () => {
    try {
      const response = await billingService.getInstallmentPlans(messId);
      if (response.success && response.data) {
        setInstallmentPlans(response.data);
        return { success: true, data: response.data };
      } else {
        return { success: false, message: response.message || 'Failed to fetch installment plans' };
      }
    } catch (error) {
      console.error('Error fetching installment plans:', error);
      return { success: false, message: 'Failed to fetch installment plans' };
    }
  }, [messId]);

  const getInstallmentPayments = useCallback(async (planId?: string) => {
    try {
      const response = await billingService.getInstallmentPayments(messId, planId);
      if (response.success && response.data) {
        setInstallmentPayments(response.data);
        return { success: true, data: response.data };
      } else {
        return { success: false, message: response.message || 'Failed to fetch installment payments' };
      }
    } catch (error) {
      console.error('Error fetching installment payments:', error);
      return { success: false, message: 'Failed to fetch installment payments' };
    }
  }, [messId]);

  const updateInstallmentPayment = useCallback(async (paymentId: string, updates: Partial<MessOwnerInstallmentPayment>) => {
    try {
      const response = await billingService.updateInstallmentPayment(paymentId, updates);
      if (response.success) {
        setInstallmentPayments(prev => 
          prev.map(payment => payment.id === paymentId ? { ...payment, ...updates } : payment)
        );
        return { success: true };
      } else {
        return { success: false, message: response.message || 'Failed to update installment payment' };
      }
    } catch (error) {
      console.error('Error updating installment payment:', error);
      return { success: false, message: 'Failed to update installment payment' };
    }
  }, []);

  return {
    // State
    billingData,
    loading,
    error,
    refreshing,
    searchQuery,
    filterStatus,
    filterPaymentMethod,
    filterDateRange,
    installmentPlans,
    installmentPayments,
    
    // Actions
    setSearchQuery,
    setFilterStatus,
    setFilterPaymentMethod,
    setFilterDateRange,
    refreshData,
    sendPaymentReminder,
    generateReport,
    updatePaymentStatus,
    bulkUpdatePaymentStatus,
    verifyPaymentRequest,
    approvePaymentRequest,
    rejectPaymentRequest,
    // uploadReceipt removed
    // generateIndividualBill removed
    sendBulkReminders,
    // calculateBillWithLeaves removed
    createInstallmentPlan,
    updateInstallmentPlan,
    deleteInstallmentPlan,
    getInstallmentPlans,
    getInstallmentPayments,
    updateInstallmentPayment,
    
    // Utilities
    formatCurrency,
    formatDate,
    getStatusColor,
    getStatusIcon,
    getStatusText
  };
};

export default useBillingPayments;

