import React from 'react';
import { useBillingDashboard, useBillingStats } from './BillingDashboard.hooks';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  DollarSign, 
  Users, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  XCircle,
  RefreshCw,
  Play
} from 'lucide-react';

const BillingDashboard: React.FC = () => {
  const {
    isDarkMode,
    toggleDarkMode,
    dashboardData,
    loading,
    error,
    refreshing,
    loadDashboardData,
    refreshDashboard,
    processBilling
  } = useBillingDashboard();

  // Filters are available but not currently used in the UI
  // const {
  //   billingFilter,
  //   subscriptionFilter,
  //   paymentFilter,
  //   updateBillingFilter,
  //   updateSubscriptionFilter,
  //   updatePaymentFilter,
  //   clearFilters
  // } = useBillingFilters();

  const {
    getCollectionRateColor,
    getStatusColor,
    getStatusIcon,
    formatCurrency,
    formatPercentage,
    formatDate,
    formatDateTime,
    getOverdueColor
  } = useBillingStats(dashboardData);

  const handleProcessBilling = async () => {
    const result = await processBilling();
    if (result.success) {
      // Show success message
      console.log('Billing processed successfully');
    } else {
      // Show error message
      console.error('Failed to process billing');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading billing dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-4" />
          <p className="text-red-500 mb-4">{error}</p>
          <Button onClick={loadDashboardData} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertTriangle className="h-8 w-8 text-yellow-500 mx-auto mb-4" />
          <p className="text-muted-foreground">No billing data available</p>
        </div>
      </div>
    );
  }

  const { summary, subscriptions, recentBills, recentTransactions, overduePayments } = dashboardData;

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Billing Dashboard</h1>
          <p className="text-muted-foreground">Manage billing, subscriptions, and payments</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            onClick={refreshDashboard}
            disabled={refreshing}
            variant="outline"
            size="sm"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            onClick={handleProcessBilling}
            disabled={refreshing}
            variant="default"
            size="sm"
          >
            <Play className="h-4 w-4 mr-2" />
            Process Billing
          </Button>
          <Button
            onClick={toggleDarkMode}
            variant="outline"
            size="sm"
          >
            {isDarkMode ? '☀️' : '🌙'}
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Billing Summary */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(summary.totalAmount)}</div>
            <p className="text-xs text-muted-foreground">
              {summary.totalBills} total bills
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Collection Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getCollectionRateColor(summary.collectionRate)}`}>
              {formatPercentage(summary.collectionRate)}
            </div>
            <p className="text-xs text-muted-foreground">
              {summary.paidBills} of {summary.totalBills} bills paid
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{subscriptions.activeSubscriptions}</div>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(subscriptions.monthlyRecurringRevenue)} MRR
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue Payments</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">
              {summary.overdueBills}
            </div>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(summary.overdueAmount)} overdue
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="bills">Bills</TabsTrigger>
          <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="overdue">Overdue</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Billing Status */}
            <Card>
              <CardHeader>
                <CardTitle>Billing Status</CardTitle>
                <CardDescription>Current billing status breakdown</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Paid</span>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">{summary.paidBills}</div>
                    <div className="text-xs text-muted-foreground">
                      {formatCurrency(summary.paidAmount)}
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm">Pending</span>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">{summary.pendingBills}</div>
                    <div className="text-xs text-muted-foreground">
                      {formatCurrency(summary.pendingAmount)}
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                    <span className="text-sm">Overdue</span>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">{summary.overdueBills}</div>
                    <div className="text-xs text-muted-foreground">
                      {formatCurrency(summary.overdueAmount)}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Subscription Status */}
            <Card>
              <CardHeader>
                <CardTitle>Subscription Status</CardTitle>
                <CardDescription>Current subscription breakdown</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Active</span>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">{subscriptions.activeSubscriptions}</div>
                    <div className="text-xs text-muted-foreground">
                      {formatPercentage((subscriptions.activeSubscriptions / subscriptions.totalSubscriptions) * 100)}
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm">Paused</span>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">{subscriptions.pausedSubscriptions}</div>
                    <div className="text-xs text-muted-foreground">
                      {formatPercentage((subscriptions.pausedSubscriptions / subscriptions.totalSubscriptions) * 100)}
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <XCircle className="h-4 w-4 text-red-500" />
                    <span className="text-sm">Cancelled</span>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">{subscriptions.cancelledSubscriptions}</div>
                    <div className="text-xs text-muted-foreground">
                      {formatPercentage((subscriptions.cancelledSubscriptions / subscriptions.totalSubscriptions) * 100)}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Bills Tab */}
        <TabsContent value="bills" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Bills</CardTitle>
              <CardDescription>Latest billing records</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentBills.map((bill) => (
                  <div key={bill.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium">{bill.userName}</span>
                        <Badge variant="outline" className="text-xs">
                          {bill.messName}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Due: {formatDate(bill.dueDate)}
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div className="font-semibold">{formatCurrency(bill.amount)}</div>
                        <Badge className={getStatusColor(bill.status)}>
                          {getStatusIcon(bill.status)} {bill.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Subscriptions Tab */}
        <TabsContent value="subscriptions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Subscription Analytics</CardTitle>
              <CardDescription>Subscription performance metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold">{formatCurrency(subscriptions.monthlyRecurringRevenue)}</div>
                  <div className="text-sm text-muted-foreground">Monthly Recurring Revenue</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{formatCurrency(subscriptions.averageRevenuePerUser)}</div>
                  <div className="text-sm text-muted-foreground">Average Revenue Per User</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{formatPercentage(subscriptions.churnRate)}</div>
                  <div className="text-sm text-muted-foreground">Churn Rate</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payments Tab */}
        <TabsContent value="payments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>Latest payment transactions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentTransactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium">{transaction.userName}</span>
                        <Badge variant="outline" className="text-xs">
                          {transaction.method}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {formatDateTime(transaction.createdAt)}
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div className="font-semibold">{formatCurrency(transaction.amount)}</div>
                        <Badge className={getStatusColor(transaction.status)}>
                          {getStatusIcon(transaction.status)} {transaction.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Overdue Tab */}
        <TabsContent value="overdue" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Overdue Payments</CardTitle>
              <CardDescription>Payments that require immediate attention</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {overduePayments.map((payment) => (
                  <div key={payment.id} className="flex items-center justify-between p-4 border rounded-lg border-red-200 dark:border-red-800">
                    <div className="flex items-center space-x-4">
                      <div>
                        <div className="font-medium">{payment.userName}</div>
                        <div className="text-sm text-muted-foreground">{payment.userEmail}</div>
                        <div className="text-sm text-muted-foreground">{payment.messName}</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div className="font-semibold">{formatCurrency(payment.amount)}</div>
                        <div className={`text-sm ${getOverdueColor(payment.daysOverdue)}`}>
                          {payment.daysOverdue} days overdue
                        </div>
                      </div>
                      <Button size="sm" variant="outline">
                        Send Reminder
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BillingDashboard;


