import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  CurrencyDollarIcon,
  UsersIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  ArrowPathIcon,
  ArrowDownTrayIcon,
  PaperAirplaneIcon,
  PencilIcon,
  DocumentTextIcon,
  FunnelIcon,
  XMarkIcon,
  CheckCircleIcon,
  XCircleIcon,
  CreditCardIcon,
  BanknotesIcon,
  QrCodeIcon
} from '@heroicons/react/24/outline';
import { useBillingPayments } from './BillingPayments.hooks';
import { CommonHeader } from '@/components/common/Header/CommonHeader';
import { StatCard } from '@/features/mess-owner/components/BillingPayments/components/StatCard';
import PaymentRequests from '@/features/mess-owner/components/BillingPayments/components/PaymentRequests';
import FilterModal, { FilterOption } from '@/components/common/FilterModal';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { formatNotificationTime } from '@/shared/notifications/utils';
interface BillingPaymentsProps {
  messId: string;
}

const BillingPayments: React.FC<BillingPaymentsProps> = ({ messId }) => {
  const {
    billingData,
    loading,
    error,
    refreshing,
    searchQuery,
    setSearchQuery,
    filterStatus,
    setFilterStatus,
    filterPaymentMethod,
    setFilterPaymentMethod,
    filterDateRange,
    setFilterDateRange,
    refreshData,
    generateReport,
    updatePaymentStatus,
    formatCurrency,
    sendBulkReminders,
    approvePaymentRequest,
    rejectPaymentRequest
  } = useBillingPayments(messId);

  const navigate = useNavigate();
  const [filterOpen, setFilterOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'members' | 'requests'>('members');
  const initializedTabRef = useRef(false);
  
  // Manual payment update states
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [paymentStatus, setPaymentStatus] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [paymentNotes, setPaymentNotes] = useState('');
  // Bulk reminder dialog state
  const [showReminderDialog, setShowReminderDialog] = useState(false);
  const [reminderMessage, setReminderMessage] = useState('Hi, this is a friendly reminder to clear your pending mess bill.');
  
  // Receipt upload removed

  // Memoized handlers to prevent unnecessary re-renders
  const handleCloseFilter = useCallback(() => {
    setFilterOpen(false);
  }, []);

  // Auto-switch to Requests tab for mess owners when there are pending requests (first load only)
  useEffect(() => {
    if (initializedTabRef.current) return;
    const pendingCount = (billingData?.paymentRequests || []).filter((r: any) => r.status === 'pending_verification' || r.status === 'sent').length;
    if (pendingCount > 0) {
      setActiveTab('requests');
      initializedTabRef.current = true;
    }
  }, [billingData?.paymentRequests]);

  // Clear all filters function
  const clearAllFilters = useCallback(() => {
    setFilterStatus('');
    setFilterPaymentMethod('');
    setFilterDateRange({});
    setSearchQuery('');
  }, [setFilterStatus, setFilterPaymentMethod, setFilterDateRange, setSearchQuery]);

  // Count active filters
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filterStatus) count++;
    if (filterPaymentMethod) count++;
    if (filterDateRange?.start || filterDateRange?.end) count++;
    if (searchQuery) count++;
    return count;
  }, [filterStatus, filterPaymentMethod, filterDateRange, searchQuery]);

  // Check if any filters are active
  const hasActiveFilters = activeFiltersCount > 0;

  // Get members safely for filter options (before early returns)
  const members = billingData?.members || [];

  // Filter options for FilterModal - MUST be before early returns
  const filterOptions: FilterOption[] = useMemo(() => {
    const statusOptions: FilterOption[] = [
      {
        id: 'all',
        title: 'All Statuses',
        description: 'Show all payment statuses',
        icon: UsersIcon,
        selected: !filterStatus
      },
      {
        id: 'paid',
        title: 'Paid',
        description: 'Members who have paid',
        icon: CheckCircleIcon,
        selected: filterStatus === 'paid',
        count: members.filter(m => m.paymentStatus === 'paid').length
      },
      {
        id: 'pending',
        title: 'Pending',
        description: 'Members with pending payments',
        icon: ClockIcon,
        selected: filterStatus === 'pending',
        count: members.filter(m => m.paymentStatus === 'pending').length
      },
      {
        id: 'overdue',
        title: 'Overdue',
        description: 'Members with overdue payments',
        icon: ExclamationTriangleIcon,
        selected: filterStatus === 'overdue',
        count: members.filter(m => m.paymentStatus === 'overdue').length
      },
      {
        id: 'failed',
        title: 'Failed',
        description: 'Members with failed payments',
        icon: XCircleIcon,
        selected: filterStatus === 'failed',
        count: members.filter(m => m.paymentStatus === 'failed').length
      }
    ];

    const methodOptions: FilterOption[] = [
      {
        id: 'method_all',
        title: 'All Methods',
        description: 'Show all payment methods',
        icon: CreditCardIcon,
        selected: !filterPaymentMethod
      },
      {
        id: 'method_cash',
        title: 'Cash',
        description: 'Cash payments',
        icon: BanknotesIcon,
        selected: filterPaymentMethod === 'cash',
        count: members.filter(m => m.paymentMethod === 'cash').length
      },
      {
        id: 'method_upi',
        title: 'UPI',
        description: 'UPI payments',
        icon: QrCodeIcon,
        selected: filterPaymentMethod === 'upi',
        count: members.filter(m => m.paymentMethod === 'upi').length
      },
      {
        id: 'method_online',
        title: 'Online Banking',
        description: 'Online banking payments',
        icon: CreditCardIcon,
        selected: filterPaymentMethod === 'online',
        count: members.filter(m => m.paymentMethod === 'online').length
      },
      {
        id: 'method_bank_transfer',
        title: 'Bank Transfer',
        description: 'Bank transfer payments',
        icon: BanknotesIcon,
        selected: filterPaymentMethod === 'bank_transfer',
        count: members.filter(m => m.paymentMethod === 'bank_transfer').length
      }
    ];

    return [...statusOptions, ...methodOptions];
  }, [filterStatus, filterPaymentMethod, members]);

  const handleFilterChange = useCallback((filterId: string) => {
    if (filterId === 'all') {
      setFilterStatus('');
    } else if (filterId === 'method_all') {
      setFilterPaymentMethod('');
    } else if (filterId.startsWith('method_')) {
      setFilterPaymentMethod(filterId.replace('method_', ''));
    } else {
      setFilterStatus(filterId);
    }
  }, []);

  // Filter members based on search and status - memoized for performance
  // Must be called before any early returns to follow Rules of Hooks
  const filteredMembers = useMemo(() => {
    if (!billingData?.members) return [];
    
    return billingData.members.filter(member => {
      const matchesSearch = !searchQuery || 
        member.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.userEmail.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = !filterStatus || member.paymentStatus === filterStatus;
      const matchesMethod = !filterPaymentMethod || (member.paymentMethod || '') === filterPaymentMethod;
      const matchesDueDate = (() => {
        if (!filterDateRange?.start && !filterDateRange?.end) return true;
        if (!member.dueDate) return false;
        const due = new Date(member.dueDate).getTime();
        const afterStart = filterDateRange?.start ? due >= new Date(filterDateRange.start).getTime() : true;
        const beforeEnd = filterDateRange?.end ? due <= new Date(filterDateRange.end).getTime() : true;
        return afterStart && beforeEnd;
      })();
      
      return matchesSearch && matchesStatus && matchesMethod && matchesDueDate;
    });
  }, [billingData?.members, searchQuery, filterStatus, filterPaymentMethod, filterDateRange]);

  // Helpers to collate recent items by user for inline details
  const recentBillsByUser = useCallback((userId: string) => {
    const bills = (billingData?.recentBills || []).filter((b: any) => b.userId === userId);
    return bills;
  }, [billingData?.recentBills]);

  const recentTxByUser = useCallback((userId: string) => {
    const tx = (billingData?.recentTransactions || []).filter((t: any) => t.userId === userId);
    return tx;
  }, [billingData?.recentTransactions]);

  const openMemberDetail = useCallback((member: any) => {
    navigate(ROUTES.MESS_OWNER.BILLING.replace('/billing-payments', `/billing-payments/${member.membershipId}`), {
      state: {
        member,
        summary: billingData?.summary,
        bills: recentBillsByUser(member.userId),
        transactions: recentTxByUser(member.userId)
      }
    });
  }, [navigate, billingData?.summary, recentBillsByUser, recentTxByUser]);


  const handleMemberSelection = useCallback((membershipId: string, selected: boolean) => {
    if (selected) {
      setSelectedMembers(prev => [...prev, membershipId]);
    } else {
      setSelectedMembers(prev => prev.filter(id => id !== membershipId));
    }
  }, []);

  const handleSelectAllMembers = useCallback((selected: boolean) => {
    if (selected) {
      setSelectedMembers(filteredMembers.map(member => member.membershipId));
    } else {
      setSelectedMembers([]);
    }
  }, [filteredMembers]);

  // Manual payment update handlers
  const handleUpdatePaymentStatus = useCallback((member: any) => {
    setSelectedMember(member);
    setPaymentStatus(member.paymentStatus);
    setPaymentMethod(member.paymentMethod || '');
    setPaymentNotes('');
    setShowPaymentDialog(true);
  }, []);

  const handleSubmitPaymentUpdate = useCallback(async () => {
    if (!selectedMember || !paymentStatus) return;

    try {
      const result = await updatePaymentStatus(selectedMember.membershipId, paymentStatus, paymentNotes, paymentMethod);
      if (result.success) {
        setShowPaymentDialog(false);
        setSelectedMember(null);
        setPaymentStatus('');
        setPaymentMethod('');
        setPaymentNotes('');
        // Show success message
        console.log('Payment status updated successfully');
      } else {
        console.error('Failed to update payment status:', result.message);
      }
    } catch (error) {
      console.error('Error updating payment status:', error);
    }
  }, [selectedMember, paymentStatus, paymentNotes, updatePaymentStatus]);

  // Upload receipt handlers removed


  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen lg:ml-72">
        <div className="text-center">
          <ArrowPathIcon className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading billing data...</p>
        </div>
      </div>
    );
  }

  if (error && !billingData) {
    return (
      <div className="flex items-center justify-center min-h-screen lg:ml-72">
        <div className="text-center">
          <ExclamationTriangleIcon className="h-8 w-8 text-destructive mx-auto mb-4" />
          <p className="text-destructive mb-4">{error}</p>
          <Button onClick={refreshData} variant="outline">
            <ArrowPathIcon className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (!billingData) {
    return (
      <div className="flex items-center justify-center min-h-screen lg:ml-72">
        <div className="text-center">
          <ExclamationTriangleIcon className="h-8 w-8 text-yellow-500 mx-auto mb-4" />
          <p className="text-muted-foreground">No billing data available</p>
        </div>
      </div>
    );
  }

  const { summary, paymentRequests } = billingData || {
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
    paymentRequests: []
  };

  const pendingRequestsCount = (paymentRequests || []).filter((r: any) => r.status === 'pending_verification' || r.status === 'sent').length;

  return (
    <div className="flex flex-col gap-4 sm:gap-6 p-2 sm:p-4 pb-[72px] sm:pb-6 lg:pb-4">
      {error && (
        <div className="p-3 sm:p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <div className="flex items-center">
              <ExclamationTriangleIcon className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-600 mr-2 flex-shrink-0" />
              <p className="text-yellow-800 text-xs sm:text-sm">{error}</p>
            </div>
            <Button onClick={refreshData} variant="outline" size="sm" className="w-full sm:w-auto sm:ml-auto">
              <ArrowPathIcon className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
              Retry
            </Button>
          </div>
        </div>
      )}
      <CommonHeader
        title="Billing & Payments"
        subtitle="Comprehensive billing and payment management"
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          title="Revenue"
          value={formatCurrency(summary.totalRevenue)}
          icon={<CurrencyDollarIcon className="h-5 w-5 text-primary" />}
          accentBgClassName="bg-primary/10"
        />

        <StatCard
          title="Pending"
          value={formatCurrency(summary.pendingAmount)}
          valueClassName="text-yellow-600 dark:text-yellow-400"
          icon={<ClockIcon className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />}
          accentBgClassName="bg-yellow-100 dark:bg-yellow-900/20"
        />

        <StatCard
          title="Overdue"
          value={formatCurrency(summary.overdueAmount)}
          valueClassName="text-red-600 dark:text-red-400"
          icon={<ExclamationTriangleIcon className="h-5 w-5 text-red-600 dark:text-red-400" />}
          accentBgClassName="bg-red-100 dark:bg-red-900/20"
        />

        <StatCard
          title="Members"
          value={summary.totalMembers}
          icon={<UsersIcon className="h-5 w-5 text-primary" />}
          accentBgClassName="bg-primary/10"
        />
      </div>

      {/* Main Content Tabs */}
      <div className="w-full">
        <div className="overflow-x-auto scrollbar-hide [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <div className="inline-flex min-w-full sm:min-w-0 gap-1 sm:gap-2 bg-card border border-border rounded-lg p-1">
            <button
              type="button"
              onClick={() => setActiveTab('members')}
              aria-pressed={activeTab === 'members'}
              className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                activeTab === 'members'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <UsersIcon className="h-4 w-4 flex-shrink-0" />
              <span className="whitespace-nowrap">Members ({filteredMembers.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('requests')}
              aria-pressed={activeTab === 'requests'}
              className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                activeTab === 'requests'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <DocumentTextIcon className="h-4 w-4 flex-shrink-0" />
              <span className="whitespace-nowrap">Requests ({pendingRequestsCount})</span>
            </button>
          </div>
        </div>
        </div>

      {activeTab === 'members' && (
        <div className="space-y-4">
          {/* Members Management */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-4">
          <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
            <div className="flex items-center gap-3">
              {/* Select All Checkbox */}
              <div className="shrink-0">
                <Checkbox
                  checked={selectedMembers.length === filteredMembers.length && filteredMembers.length > 0}
                  onCheckedChange={handleSelectAllMembers}
                />
              </div>
            <div>
              <CardTitle className="text-lg text-foreground flex items-center gap-2">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <UsersIcon className="h-5 w-5 text-primary" />
                </div>
                    Member Billing Records ({filteredMembers.length})
              </CardTitle>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {/* Search Icon/Input */}
              {showSearch ? (
                <div className="relative flex-1 sm:flex-none min-w-[200px] sm:min-w-[250px]">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Search by name or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onBlur={() => {
                      if (!searchQuery) {
                        setShowSearch(false);
                      }
                    }}
                    autoFocus
                    className="pl-9 pr-9 h-8 text-sm"
                  />
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setShowSearch(false);
                    }}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 hover:bg-muted rounded"
                  >
                    <XMarkIcon className="h-4 w-4 text-muted-foreground" />
                  </button>
                </div>
              ) : (
                <Button
                  onClick={() => setShowSearch(true)}
                  variant="outline"
                  size="sm"
                  className="h-8 px-2 text-xs w-auto"
                >
                  <MagnifyingGlassIcon className="h-4 w-4" />
                </Button>
              )}
              {/* Filter Button with Active Count Badge */}
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  setFilterOpen(true);
                }}
                variant="outline"
                size="sm"
                className="h-8 px-2 text-xs w-auto relative"
              >
                <FunnelIcon className="h-4 w-4" />
                {hasActiveFilters && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-white text-[10px] flex items-center justify-center font-bold">
                    {activeFiltersCount}
                  </span>
                )}
              </Button>
              
              {/* Clear Filters Button - Shows when filters are active */}
              {hasActiveFilters && (
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    clearAllFilters();
                  }}
                  variant="outline"
                  size="sm"
                  className="h-8 px-2 text-xs w-auto text-muted-foreground hover:text-destructive"
                  title="Clear all filters"
                >
                  <XMarkIcon className="h-3 w-3 mr-1" />
                  <span className="hidden sm:inline">Clear Filters</span>
                </Button>
              )}
              <Button
                onClick={refreshData}
                disabled={refreshing}
                variant="outline"
                size="sm"
                className="h-8 px-2 text-xs w-auto"
              >
                <ArrowPathIcon className={`h-3 w-3 mr-1 ${refreshing ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Refresh</span>
                  </Button>
              <Button
                onClick={() => setShowReminderDialog(true)}
                disabled={selectedMembers.length === 0}
                variant="outline"
                size="sm"
                className="h-8 px-2 text-xs w-auto"
              >
                <PaperAirplaneIcon className="h-3 w-3 mr-1" />
                <span className="hidden sm:inline">Send Reminders</span>
              </Button>
              <Button
                onClick={() => generateReport()}
                variant="outline"
                size="sm"
                className="h-8 px-2 text-xs w-auto"
              >
                <ArrowDownTrayIcon className="h-3 w-3 mr-1" />
                <span className="hidden sm:inline">Report</span>
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-3">
          <div className="space-y-3">
            {filteredMembers.map((member) => {
              // Get status indicator
              const getStatusIndicator = () => {
                const status = member.paymentStatus?.toLowerCase() || '';
                if (status === 'paid' || status === 'completed') {
                  return {
                    icon: CheckCircleIcon,
                    bgColor: 'bg-green-100 dark:bg-green-900/20',
                    iconColor: 'text-green-600 dark:text-green-400'
                  };
                }
                if (status === 'pending' || status === 'overdue') {
                  return {
                    icon: ClockIcon,
                    bgColor: 'bg-yellow-100 dark:bg-yellow-900/20',
                    iconColor: 'text-yellow-600 dark:text-yellow-400'
                  };
                }
                if (status === 'failed' || status === 'cancelled') {
                  return {
                    icon: XCircleIcon,
                    bgColor: 'bg-red-100 dark:bg-red-900/20',
                    iconColor: 'text-red-600 dark:text-red-400'
                  };
                }
                return {
                  icon: ClockIcon,
                  bgColor: 'bg-gray-100 dark:bg-gray-800',
                  iconColor: 'text-gray-400'
                };
              };

              const statusIndicator = getStatusIndicator();
              const StatusIcon = statusIndicator.icon;
              const lastPaymentTime = member.lastPaymentDate ? formatNotificationTime(new Date(member.lastPaymentDate)) : '';
              const dueDateTime = member.dueDate ? formatNotificationTime(new Date(member.dueDate)) : '';

              // Get status badge color
              const getStatusBadgeColor = () => {
                const status = member.paymentStatus?.toLowerCase() || '';
                if (status === 'paid' || status === 'completed') {
                  return 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400';
                }
                if (status === 'pending') {
                  return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400';
                }
                if (status === 'overdue') {
                  return 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400';
                }
                if (status === 'failed' || status === 'cancelled') {
                  return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400';
                }
                return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400';
              };

              // Get member message - only show if not redundant with status badge
              const getMemberMessage = () => {
                // For paid status, don't show redundant "Last paid" message since time is already in badge
                if (member.paymentStatus?.toLowerCase() === 'paid') {
                  return null; // Don't show redundant message
                }
                if (member.daysOverdue && member.daysOverdue > 0) {
                  return `${member.daysOverdue} days overdue - Payment due: ${formatCurrency(member.amount)}`;
                }
                return `Payment due: ${formatCurrency(member.amount)}${dueDateTime ? ` (Due ${dueDateTime})` : ''}`;
              };

              const memberMessage = getMemberMessage();

              return (
                <div
                  key={member.membershipId}
                  className="rounded-lg border border-border bg-card p-3 shadow-sm transition-all hover:shadow-md cursor-pointer"
                  onClick={() => {
                    if (member.userId) {
                      navigate(ROUTES.MESS_OWNER.USER_DETAILS.replace(':userId', member.userId), {
                        state: { from: 'billing', fromBilling: true }
                      });
                    }
                  }}
                >
                  <div className="flex items-start gap-2.5">
                    {/* Checkbox and Status Indicator in Single Column */}
                    <div className="shrink-0 flex flex-col items-center gap-2">
                      {/* Checkbox for Bulk Selection */}
                      <div onClick={(e) => e.stopPropagation()}>
                          <Checkbox
                            checked={selectedMembers.includes(member.membershipId)}
                            onCheckedChange={(checked) => {
                              handleMemberSelection(member.membershipId, checked as boolean);
                            }}
                            onClick={(e) => e.stopPropagation()}
                          />
                          </div>

                      {/* Status Indicator Circle */}
                      <div 
                        className={`w-10 h-10 rounded-full ${statusIndicator.bgColor} flex items-center justify-center`}
                      >
                        <StatusIcon className={`h-5 w-5 ${statusIndicator.iconColor}`} />
                        </div>
                          </div>

                    {/* Main Content */}
                    <div className="flex-1 min-w-0">
                      {/* Header: Name, Status Badge, Time */}
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="font-semibold text-base text-foreground whitespace-nowrap">
                          {member.userName || 'Unknown User'}
                        </h3>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <Badge className={`${getStatusBadgeColor()} text-xs px-2 py-0.5 rounded-full font-medium whitespace-nowrap`}>
                            {member.paymentStatus?.toUpperCase() || 'UNKNOWN'}
                      </Badge>
                          {lastPaymentTime && member.paymentStatus?.toLowerCase() === 'paid' && (
                            <span className="text-xs text-muted-foreground whitespace-nowrap">{lastPaymentTime}</span>
                          )}
                          {dueDateTime && member.paymentStatus?.toLowerCase() !== 'paid' && (
                            <span className="text-xs text-muted-foreground whitespace-nowrap">{dueDateTime}</span>
                          )}
                              </div>
                      </div>

                      {/* Payment Due Message (only if not paid) */}
                      {memberMessage && (
                        <p className="text-sm text-muted-foreground mb-1.5">
                          {memberMessage}
                        </p>
                      )}

                      {/* Plan Name Link */}
                      {member.planName && (
                        <button
                          onClick={() => openMemberDetail(member)}
                          className="text-sm text-blue-600 dark:text-blue-400 hover:underline mb-2 block"
                        >
                          {member.planName}
                        </button>
                      )}

                      {/* Action Buttons - Icon Only */}
                      <div className="flex gap-2 pt-2 border-t border-border" onClick={(e) => e.stopPropagation()}>
                        <Button
                              onClick={(e) => {
                                e.stopPropagation();
                            handleUpdatePaymentStatus(member);
                          }}
                          variant="outline"
                          size="sm"
                          className="h-8 w-8 p-0 border-border text-muted-foreground hover:text-foreground"
                          title="Update Status"
                        >
                          <PencilIcon className="h-4 w-4" />
                            </Button>
                        <Button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedMembers([member.membershipId]);
                                setShowReminderDialog(true);
                              }}
                          variant="outline"
                          size="sm"
                          className="h-8 w-8 p-0 border-border text-muted-foreground hover:text-foreground"
                          title="Send Reminder"
                        >
                          <PaperAirplaneIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
                  
                  {filteredMembers.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <div className="p-4 bg-muted/50 rounded-lg w-fit mx-auto mb-4">
                  <UsersIcon className="h-8 w-8 opacity-50" />
                </div>
                <p className="text-sm font-medium">No billing records found</p>
                <p className="text-xs mt-1">Billing records will appear here when members are added</p>
                    </div>
                  )}
              </div>
        </CardContent>
      </Card>
        </div>
      )}

      {activeTab === 'requests' && (
        <div className="space-y-4">
          <PaymentRequests
            requests={(paymentRequests || [])
              .map((r: any) => ({
                requestId: r.id || r.requestId || r.membershipId,
                membershipId: r.membershipId,
                userName: r.userName || 'Unknown User',
                amount: r.amount || 0,
                status: r.status === 'sent' ? 'pending_verification' : r.status,
                paymentMethod: r.paymentMethod,
                requestedAt: r.requestedAt || r.submittedAt || r.createdAt,
                updatedAt: r.updatedAt,
                approvedAt: r.approvedAt,
                rejectedAt: r.rejectedAt,
                userEmail: r.userEmail,
                userPhone: r.userPhone,
                planName: r.planName,
                paymentScreenshot: r.paymentScreenshot,
                receiptUrl: r.receiptUrl,
                transactionId: r.transactionId
              }))}
            formatCurrency={formatCurrency}
            onApprove={async (membershipId: string, method?: string) => {
              const result = await approvePaymentRequest(membershipId, method);
              if (result.success) {
                await refreshData();
              }
              return result;
            }}
            onReject={async (membershipId: string, remarks?: string) => {
              const result = await rejectPaymentRequest(membershipId, remarks);
              if (result.success) {
                await refreshData();
              }
              return result;
            }}
          />
                </div>
              )}


      {/* Filter Modal */}
      <FilterModal
        isOpen={filterOpen}
        onClose={handleCloseFilter}
        selectedFilter={
          filterStatus 
            ? filterStatus 
            : filterPaymentMethod 
              ? `method_${filterPaymentMethod}` 
              : 'all'
        }
        onFilterChange={handleFilterChange}
        filterOptions={filterOptions}
        title="Filter Members"
        showCounts={true}
      />

      {/* Manual Payment Status Update Dialog */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent className="w-[calc(100vw-2rem)] sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Update Payment Status</DialogTitle>
            <DialogDescription>
              Update the payment status for {selectedMember?.userName}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="payment-status">Payment Status</Label>
              <Select value={paymentStatus} onValueChange={setPaymentStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Select payment status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="paid">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      Paid
                    </div>
                  </SelectItem>
                  <SelectItem value="pending">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                      Pending
                    </div>
                  </SelectItem>
                  <SelectItem value="overdue">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-red-500"></div>
                      Overdue
                    </div>
                  </SelectItem>
                  <SelectItem value="failed">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-gray-500"></div>
                      Failed
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="payment-method">Payment Method</Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger>
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="upi">UPI</SelectItem>
                  <SelectItem value="online">Online Banking</SelectItem>
                  <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                  <SelectItem value="card">Card Payment</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="payment-notes">Notes (Optional)</Label>
              <Textarea
                id="payment-notes"
                placeholder="Add any additional notes..."
                value={paymentNotes}
                onChange={(e) => setPaymentNotes(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
              <Button variant="outline" onClick={() => setShowPaymentDialog(false)}>
                Cancel
              </Button>
            <Button onClick={handleSubmitPaymentUpdate} disabled={!paymentStatus}>
                Update Status
              </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Reminder Dialog */}
      <Dialog open={showReminderDialog} onOpenChange={setShowReminderDialog}>
        <DialogContent className="w-[calc(100vw-2rem)] sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Send Payment Reminders</DialogTitle>
            <DialogDescription>
              This will send a reminder to {selectedMembers.length} selected user(s).
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="reminder-message">Custom Message (optional)</Label>
              <Textarea
                id="reminder-message"
                value={reminderMessage}
                onChange={(e) => setReminderMessage(e.target.value)}
                rows={4}
                placeholder="Enter a message to include in each reminder"
              />
              <p className="text-xs text-muted-foreground">This message will be sent in chat and as a notification.</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReminderDialog(false)}>Cancel</Button>
            <Button
              onClick={async () => {
                try {
                  await sendBulkReminders(selectedMembers, reminderMessage);
                } finally {
                  setShowReminderDialog(false);
                }
              }}
              disabled={selectedMembers.length === 0}
            >
              Send
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
};

export default BillingPayments;