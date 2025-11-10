import { useState, useEffect, useCallback, useMemo } from 'react';
import { billingService } from '@/services/api/billingService';
import { 
  UserBillingData, 
  BillingRecord, 
  PaymentRequest, 
  PaymentResponse,
  BillingFilters,
  BillingStats
} from './BillingPayments.types';

export const useBillingPayments = () => {
  const [billingData, setBillingData] = useState<UserBillingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch user billing data
  const fetchBillingData = useCallback(async () => {
    try {
      setError(null);
      const response = await billingService.getUserBillingData();
      
      if (response.success && response.data) {
        // Debug logging
        console.log('Billing data received from API:', {
          bills: response.data.bills?.map((bill: any) => ({
            id: bill.id,
            messName: bill.messName,
            hasSubscriptionExtension: !!bill.subscriptionExtension,
            subscriptionExtension: bill.subscriptionExtension,
            hasAdjustments: !!bill.adjustments?.length,
            adjustments: bill.adjustments,
            hasLeaveCredits: !!bill.leaveCredits?.length,
            leaveCredits: bill.leaveCredits
          }))
        });
        
        // Transform the service data to match our component types
        const transformedData: UserBillingData = {
          userId: response.data.userId,
          summary: {
            ...response.data.summary,
            thisMonthBills: response.data.summary.totalBills || 0,
            thisMonthAmount: response.data.summary.totalAmount || 0,
            lastPaymentDate: response.data.transactions?.[0]?.createdAt || undefined,
            nextPaymentDate: response.data.memberships?.[0]?.nextPaymentDate || undefined
          },
          memberships: response.data.memberships || [],
          bills: response.data.bills.map((bill: any) => ({
            id: bill.id,
            messId: bill.messId || bill.messName?.toLowerCase().replace(/\s+/g, '-') || 'unknown-mess',
            messName: bill.messName,
            membershipId: bill.membershipId || bill.id, // Use bill ID as fallback
            planName: bill.planName,
            billingPeriod: {
              startDate: bill.createdAt,
              endDate: bill.dueDate,
              period: 'monthly' as const
            },
            subscription: {
              planId: bill.planId || bill.id,
              planName: bill.planName,
              baseAmount: bill.amount,
              discountAmount: bill.discountAmount || 0,
              taxAmount: bill.taxAmount || 0,
              totalAmount: bill.amount
            },
            payment: {
              status: bill.paymentStatus as any,
              method: bill.method as any,
              dueDate: bill.dueDate,
              paidDate: bill.paidDate,
              transactionId: bill.id
            },
            adjustments: (bill.adjustments || []).map((adj: any) => ({
              type: adj.type,
              amount: adj.amount,
              reason: adj.reason,
              appliedBy: adj.appliedBy,
              appliedDate: adj.appliedDate
            })),
            leaveCredits: (bill.leaveCredits || []).map((credit: any) => ({
              leaveId: credit.leaveId || credit.leaveId?.toString(),
              creditAmount: credit.creditAmount,
              appliedDate: credit.appliedDate
            })),
            ...(bill.subscriptionExtension && {
              subscriptionExtension: {
                extensionMeals: bill.subscriptionExtension.extensionMeals || 0,
                extensionDays: bill.subscriptionExtension.extensionDays || 0,
                originalEndDate: typeof bill.subscriptionExtension.originalEndDate === 'string' ? bill.subscriptionExtension.originalEndDate : bill.subscriptionExtension.originalEndDate?.toString() || '',
                newEndDate: typeof bill.subscriptionExtension.newEndDate === 'string' ? bill.subscriptionExtension.newEndDate : bill.subscriptionExtension.newEndDate?.toString() || ''
              }
            }),
            metadata: {
              generatedBy: 'system' as const,
              notes: '',
              tags: []
            },
            createdAt: bill.createdAt,
            updatedAt: bill.createdAt
          })),
          transactions: (response.data.transactions || []).map((txn: any) => ({
            id: txn.id,
            transactionId: txn.transactionId || txn.id,
            messName: txn.messName || 'Unknown Mess',
            amount: txn.amount || 0,
            status: txn.status === 'success' ? 'completed' : (txn.status as any), // Map 'success' to 'completed'
            method: (txn.method || txn.paymentMethod || 'cash') as any,
            description: txn.description || 'Payment transaction',
            paymentDate: txn.paymentDate || txn.createdAt,
            createdAt: txn.createdAt
          })),
          subscriptions: (response.data as any).subscriptions || [], // Add default empty array
          invoices: response.data.invoices || [],
          receipts: response.data.receipts || []
        };
        
        // Debug logging for transformed data
        console.log('Transformed billing data:', {
          billsCount: transformedData.bills.length,
          billsWithExtensions: transformedData.bills.filter(b => b.subscriptionExtension).length,
          billsWithAdjustments: transformedData.bills.filter(b => b.adjustments.length > 0).length,
          billsWithLeaveCredits: transformedData.bills.filter(b => b.leaveCredits.length > 0).length,
          transactionsCount: transformedData.transactions.length,
          sampleBill: transformedData.bills[0],
          sampleTransaction: transformedData.transactions[0]
        });
        
        // Debug: Log raw transactions from API
        console.log('Raw transactions from API:', response.data.transactions);
        console.log('Mapped transactions:', transformedData.transactions);
        
        setBillingData(transformedData);
      } else {
        setError(response.message || 'Failed to fetch billing data');
      }
    } catch (err) {
      console.error('Error fetching billing data:', err);
      setError('Failed to fetch billing data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Refresh data
  const refreshData = useCallback(async () => {
    setRefreshing(true);
    await fetchBillingData();
  }, [fetchBillingData]);

  // Initial load
  useEffect(() => {
    fetchBillingData();
  }, [fetchBillingData]);

  return {
    billingData,
    loading,
    error,
    refreshing,
    refreshData,
    fetchBillingData
  };
};

export const useBillingFilters = (bills: BillingRecord[] = []) => {
  const [filters, setFilters] = useState<BillingFilters>({});
  const [searchQuery, setSearchQuery] = useState('');

  // Filter bills based on current filters and search
  const filteredBills = useMemo(() => {
    let filtered = [...bills];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(bill => 
        bill.messName.toLowerCase().includes(query) ||
        bill.planName.toLowerCase().includes(query) ||
        bill.id.toLowerCase().includes(query)
      );
    }

    // Apply status filter
    if (filters.status) {
      filtered = filtered.filter(bill => bill.payment.status === filters.status);
    }

    // Apply mess filter
    if (filters.messId) {
      filtered = filtered.filter(bill => bill.messId === filters.messId);
    }

    // Apply date range filter
    if (filters.dateRange) {
      const { startDate, endDate } = filters.dateRange;
      filtered = filtered.filter(bill => {
        const billDate = new Date(bill.createdAt);
        return billDate >= new Date(startDate) && billDate <= new Date(endDate);
      });
    }

    // Apply amount range filter
    if (filters.amountRange) {
      const { min, max } = filters.amountRange;
      filtered = filtered.filter(bill => 
        bill.subscription.totalAmount >= min && bill.subscription.totalAmount <= max
      );
    }

    return filtered;
  }, [bills, filters, searchQuery]);

  const updateFilters = useCallback((newFilters: Partial<BillingFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({});
    setSearchQuery('');
  }, []);

  return {
    filters,
    searchQuery,
    setSearchQuery,
    filteredBills,
    updateFilters,
    clearFilters
  };
};

export const usePaymentProcessing = () => {
  const [processing, setProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  const processPayment = useCallback(async (paymentRequest: PaymentRequest): Promise<PaymentResponse | null> => {
    try {
      setProcessing(true);
      setPaymentError(null);

      // Transform our PaymentRequest to match the service interface
      const servicePaymentRequest = {
        billingId: paymentRequest.billingId || '',
        subscriptionId: paymentRequest.subscriptionId || '',
        amount: paymentRequest.amount,
        currency: paymentRequest.currency,
        method: paymentRequest.method,
        gateway: paymentRequest.gateway,
        description: paymentRequest.description,
        customerInfo: paymentRequest.customerInfo
      };

      const response = await billingService.processPayment(servicePaymentRequest);
      
      if (response.success && response.data) {
        // Transform the service response to match our component interface
        const transformedResponse: PaymentResponse = {
          ...response.data,
          transactionId: response.data.paymentId || undefined,
          message: response.data.error || 'Payment processed successfully'
        };
        return transformedResponse;
      } else {
        setPaymentError(response.message || 'Payment failed');
        return null;
      }
    } catch (err) {
      console.error('Error processing payment:', err);
      setPaymentError('Payment processing failed');
      return null;
    } finally {
      setProcessing(false);
    }
  }, []);

  return {
    processing,
    paymentError,
    processPayment
  };
};

export const useBillingStats = (billingData: UserBillingData | null) => {
  const stats = useMemo((): BillingStats | null => {
    if (!billingData) return null;

    const { bills, transactions } = billingData;
    
    // Calculate total spent
    const totalSpent = transactions
      .filter(t => t.status === 'completed')
      .reduce((sum, t) => sum + t.amount, 0);

    // Calculate average monthly spend
    const completedTransactions = transactions.filter(t => t.status === 'completed');
    const monthlySpend = completedTransactions.reduce((acc, t) => {
      const month = new Date(t.paymentDate).toISOString().slice(0, 7);
      acc[month] = (acc[month] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);

    const averageMonthlySpend = Object.values(monthlySpend).length > 0 
      ? Object.values(monthlySpend).reduce((sum, amount) => sum + amount, 0) / Object.values(monthlySpend).length
      : 0;

    // Find most used mess
    const messUsage = bills.reduce((acc, bill) => {
      acc[bill.messName] = (acc[bill.messName] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const mostUsedMess = Object.entries(messUsage).reduce((max, [mess, count]) => 
      count > (max.count || 0) ? { mess, count } : max, 
      { mess: '', count: 0 }
    ).mess;

    // Payment method breakdown
    const paymentMethodBreakdown = completedTransactions.reduce((acc, t) => {
      acc[t.method] = (acc[t.method] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Monthly trend
    const monthlyTrend = Object.entries(monthlySpend).map(([month, amount]) => ({
      month,
      amount,
      bills: bills.filter(bill => 
        new Date(bill.createdAt).toISOString().slice(0, 7) === month
      ).length
    })).sort((a, b) => a.month.localeCompare(b.month));

    return {
      totalSpent,
      averageMonthlySpend,
      mostUsedMess,
      paymentMethodBreakdown,
      monthlyTrend
    };
  }, [billingData]);

  return stats;
};

