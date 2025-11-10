import { useState, useEffect } from 'react';
import { useTheme } from '@/components/theme/theme-provider';
import adminService from '@/services/api/adminService';
import type { 
  BillingDashboardData, 
  BillingFilter, 
  SubscriptionFilter, 
  PaymentFilter 
} from './BillingDashboard.types';

export const useBillingDashboard = () => {
  const { isDarkTheme: isDarkMode, toggleTheme: toggleDarkMode } = useTheme();
  const [dashboardData, setDashboardData] = useState<BillingDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await adminService.getBillingDashboard();
      if (response.success && response.data) {
        setDashboardData(response.data);
      } else {
        setError('Failed to load billing dashboard data');
      }
    } catch (err) {
      console.error('Error loading billing dashboard:', err);
      setError('Failed to load billing dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const refreshDashboard = async () => {
    try {
      setRefreshing(true);
      setError(null);
      const response = await adminService.getBillingDashboard();
      if (response.success && response.data) {
        setDashboardData(response.data);
      } else {
        setError('Failed to refresh billing dashboard data');
      }
    } catch (err) {
      console.error('Error refreshing billing dashboard:', err);
      setError('Failed to refresh billing dashboard data');
    } finally {
      setRefreshing(false);
    }
  };

  const processBilling = async () => {
    try {
      setRefreshing(true);
      const response = await adminService.processSubscriptionBilling();
      if (response.success) {
        await refreshDashboard();
        return { success: true, message: 'Billing processed successfully' };
      } else {
        return { success: false, message: 'Failed to process billing' };
      }
    } catch (err) {
      console.error('Error processing billing:', err);
      return { success: false, message: 'Failed to process billing' };
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  return {
    // State
    isDarkMode,
    toggleDarkMode,
    dashboardData,
    loading,
    error,
    refreshing,
    
    // Functions
    loadDashboardData,
    refreshDashboard,
    processBilling
  };
};

export const useBillingFilters = () => {
  const [billingFilter, setBillingFilter] = useState<BillingFilter>({});
  const [subscriptionFilter, setSubscriptionFilter] = useState<SubscriptionFilter>({});
  const [paymentFilter, setPaymentFilter] = useState<PaymentFilter>({});

  const updateBillingFilter = (filter: Partial<BillingFilter>) => {
    setBillingFilter(prev => ({ ...prev, ...filter }));
  };

  const updateSubscriptionFilter = (filter: Partial<SubscriptionFilter>) => {
    setSubscriptionFilter(prev => ({ ...prev, ...filter }));
  };

  const updatePaymentFilter = (filter: Partial<PaymentFilter>) => {
    setPaymentFilter(prev => ({ ...prev, ...filter }));
  };

  const clearFilters = () => {
    setBillingFilter({});
    setSubscriptionFilter({});
    setPaymentFilter({});
  };

  return {
    // State
    billingFilter,
    subscriptionFilter,
    paymentFilter,
    
    // Functions
    updateBillingFilter,
    updateSubscriptionFilter,
    updatePaymentFilter,
    clearFilters
  };
};

export const useBillingStats = (_dashboardData: BillingDashboardData | null) => {
  const getCollectionRateColor = (rate: number) => {
    if (rate >= 90) return 'text-green-600 dark:text-green-400';
    if (rate >= 70) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid':
      case 'success':
        return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20';
      case 'pending':
        return 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20';
      case 'overdue':
      case 'failed':
        return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20';
      case 'cancelled':
        return 'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/20';
      default:
        return 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid':
      case 'success':
        return '✓';
      case 'pending':
        return '⏳';
      case 'overdue':
      case 'failed':
        return '⚠️';
      case 'cancelled':
        return '✗';
      default:
        return 'ℹ️';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDaysOverdue = (dueDate: string) => {
    const due = new Date(dueDate);
    const now = new Date();
    const diffTime = now.getTime() - due.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  const getOverdueColor = (daysOverdue: number) => {
    if (daysOverdue === 0) return 'text-green-600 dark:text-green-400';
    if (daysOverdue <= 7) return 'text-yellow-600 dark:text-yellow-400';
    if (daysOverdue <= 30) return 'text-orange-600 dark:text-orange-400';
    return 'text-red-600 dark:text-red-400';
  };

  return {
    getCollectionRateColor,
    getStatusColor,
    getStatusIcon,
    formatCurrency,
    formatPercentage,
    formatDate,
    formatDateTime,
    getDaysOverdue,
    getOverdueColor
  };
};

export default useBillingDashboard;


