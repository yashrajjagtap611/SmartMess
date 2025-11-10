import React, { useState, useEffect } from 'react';
import { Search, Filter, Download, Plus, Minus, Edit, Eye, Calendar, TrendingUp, BarChart3, PieChart } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import { Label } from '../../../../components/ui/label';
import { Textarea } from '../../../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../../../components/ui/dialog';
import { Badge } from '../../../../components/ui/badge';
import { Alert, AlertDescription } from '../../../../components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../../components/ui/tabs';
import { creditManagementService } from '../../../../services/creditManagementService';
import { 
  CreditTransaction, 
  CreditAnalytics, 
  AdjustCreditsRequest 
} from '../../../../types/creditManagement';

const AdminControlsDashboard: React.FC = () => {
  const [transactions, setTransactions] = useState<CreditTransaction[]>([]);
  const [analytics, setAnalytics] = useState<CreditAnalytics[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Credit Adjustment Dialog
  const [showAdjustDialog, setShowAdjustDialog] = useState(false);
  const [adjustmentData, setAdjustmentData] = useState<AdjustCreditsRequest & { messId: string }>({
    messId: '',
    amount: 0,
    description: ''
  });
  const [adjusting, setAdjusting] = useState(false);

  useEffect(() => {
    fetchTransactions();
    fetchAnalytics();
  }, [currentPage, typeFilter, statusFilter, searchTerm]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const response = await creditManagementService.getCreditTransactions({
        messId: searchTerm || undefined,
        type: typeFilter as any || undefined,
        status: statusFilter as any || undefined,
        page: currentPage,
        limit: 20
      });
      
      if (response.success && response.data) {
        setTransactions(response.data.transactions);
        setTotalPages(response.data.pagination.pages);
      } else {
        setError('Failed to fetch transactions');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch transactions');
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const response = await creditManagementService.getCreditAnalytics({
        startDate: dateRange.start || undefined,
        endDate: dateRange.end || undefined
      });
      
      if (response.success && response.data) {
        setAnalytics(response.data);
      }
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
    }
  };

  const handleCreditAdjustment = async () => {
    if (!adjustmentData.messId || !adjustmentData.description.trim()) {
      setError('Mess ID and description are required');
      return;
    }

    try {
      setAdjusting(true);
      setError(null);
      
      const response = await creditManagementService.adjustCredits(
        adjustmentData.messId,
        {
          amount: adjustmentData.amount,
          description: adjustmentData.description
        }
      );
      
      if (response.success) {
        setSuccess('Credits adjusted successfully');
        setShowAdjustDialog(false);
        setAdjustmentData({ messId: '', amount: 0, description: '' });
        fetchTransactions();
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(response.message || 'Failed to adjust credits');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to adjust credits');
    } finally {
      setAdjusting(false);
    }
  };

  const exportTransactions = () => {
    if (transactions.length === 0) return;

    const csvContent = [
      ['Date', 'Mess', 'Type', 'Amount', 'Description', 'Status', 'Reference ID'],
      ...transactions.map(tx => [
        new Date(tx.createdAt).toLocaleDateString(),
        tx.messId.name,
        tx.type,
        tx.amount,
        tx.description,
        tx.status,
        tx.referenceId || ''
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `credit-transactions-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'purchase':
        return <Plus className="h-4 w-4 text-green-600" />;
      case 'deduction':
        return <Minus className="h-4 w-4 text-red-600" />;
      case 'bonus':
        return <Plus className="h-4 w-4 text-blue-600" />;
      case 'refund':
        return <Plus className="h-4 w-4 text-purple-600" />;
      case 'adjustment':
        return <Edit className="h-4 w-4 text-yellow-600" />;
      case 'trial':
        return <Plus className="h-4 w-4 text-indigo-600" />;
      default:
        return <Eye className="h-4 w-4 text-gray-600" />;
    }
  };

  const getTotalByType = (type: string) => {
    return analytics.find(a => a._id === type)?.totalAmount || 0;
  };

  const getCountByType = (type: string) => {
    return analytics.find(a => a._id === type)?.count || 0;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Admin Controls & Reports</h2>
          <p className="text-muted-foreground mt-1">
            Monitor credit transactions, adjust credits, and view analytics
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={exportTransactions} className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Button onClick={() => setShowAdjustDialog(true)} className="flex items-center gap-2">
            <Edit className="h-4 w-4" />
            Adjust Credits
          </Button>
        </div>
      </div>

      {/* Success/Error Alerts */}
      {success && (
        <Alert className="border-green-200 bg-green-50">
          <AlertDescription className="text-green-800">{success}</AlertDescription>
        </Alert>
      )}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="analytics" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          {/* Analytics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Purchases</p>
                    <p className="text-2xl font-bold text-green-600">
                      {creditManagementService.formatCredits(getTotalByType('purchase'))}
                    </p>
                    <p className="text-xs text-gray-500">{getCountByType('purchase')} transactions</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Deductions</p>
                    <p className="text-2xl font-bold text-red-600">
                      {creditManagementService.formatCredits(Math.abs(getTotalByType('deduction')))}
                    </p>
                    <p className="text-xs text-gray-500">{getCountByType('deduction')} transactions</p>
                  </div>
                  <BarChart3 className="h-8 w-8 text-red-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Bonuses Given</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {creditManagementService.formatCredits(getTotalByType('bonus'))}
                    </p>
                    <p className="text-xs text-gray-500">{getCountByType('bonus')} transactions</p>
                  </div>
                  <PieChart className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Trial Credits</p>
                    <p className="text-2xl font-bold text-indigo-600">
                      {creditManagementService.formatCredits(getTotalByType('trial'))}
                    </p>
                    <p className="text-xs text-gray-500">{getCountByType('trial')} trials</p>
                  </div>
                  <Calendar className="h-8 w-8 text-indigo-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Date Range Filter for Analytics */}
          <Card>
            <CardHeader>
              <CardTitle>Analytics Filters</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={dateRange.start}
                    onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={dateRange.end}
                    onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                  />
                </div>
                <div className="flex items-end">
                  <Button onClick={fetchAnalytics} className="w-full">
                    <Filter className="h-4 w-4 mr-2" />
                    Apply Filter
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Transactions Tab */}
        <TabsContent value="transactions" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle>Transaction Filters</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="search">Search Mess ID</Label>
                  <Input
                    id="search"
                    placeholder="Enter mess ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="typeFilter">Transaction Type</Label>
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All types</SelectItem>
                      <SelectItem value="purchase">Purchase</SelectItem>
                      <SelectItem value="deduction">Deduction</SelectItem>
                      <SelectItem value="bonus">Bonus</SelectItem>
                      <SelectItem value="refund">Refund</SelectItem>
                      <SelectItem value="adjustment">Adjustment</SelectItem>
                      <SelectItem value="trial">Trial</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="statusFilter">Status</Label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All statuses</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <Button onClick={fetchTransactions} className="w-full">
                    <Search className="h-4 w-4 mr-2" />
                    Search
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Transactions List */}
          <Card>
            <CardHeader>
              <CardTitle>Credit Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center p-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                </div>
              ) : (
                <div className="space-y-3">
                  {transactions.map((transaction) => (
                    <div key={transaction._id} className="border rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          {getTransactionIcon(transaction.type)}
                          <div>
                            <div className="font-medium">{transaction.messId.name}</div>
                            <div className="text-sm text-gray-600">{transaction.description}</div>
                            <div className="text-xs text-gray-500">
                              {new Date(transaction.createdAt).toLocaleString()}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`text-lg font-semibold ${
                            transaction.amount >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {transaction.amount >= 0 ? '+' : ''}{creditManagementService.formatCredits(transaction.amount)}
                          </div>
                          <Badge variant={transaction.status === 'completed' ? 'default' : 'secondary'}>
                            {transaction.status}
                          </Badge>
                          <div className="text-xs text-gray-500 mt-1">
                            {transaction.type}
                          </div>
                        </div>
                      </div>
                      {transaction.referenceId && (
                        <div className="text-xs text-gray-500 mt-2">
                          Ref: {transaction.referenceId}
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {transactions.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      No transactions found
                    </div>
                  )}
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-6">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <span className="flex items-center px-4">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Coming Soon</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Advanced reporting features will be available in the next update.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Credit Adjustment Dialog */}
      <Dialog open={showAdjustDialog} onOpenChange={setShowAdjustDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adjust Credits</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="messId">Mess ID</Label>
              <Input
                id="messId"
                value={adjustmentData.messId}
                onChange={(e) => setAdjustmentData({ ...adjustmentData, messId: e.target.value })}
                placeholder="Enter mess ID..."
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount">Credit Amount</Label>
              <Input
                id="amount"
                type="number"
                value={adjustmentData.amount}
                onChange={(e) => setAdjustmentData({ ...adjustmentData, amount: parseInt(e.target.value) || 0 })}
                placeholder="Enter amount (positive to add, negative to deduct)"
                required
              />
              <p className="text-sm text-gray-500">
                Use positive numbers to add credits, negative to deduct
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={adjustmentData.description}
                onChange={(e) => setAdjustmentData({ ...adjustmentData, description: e.target.value })}
                placeholder="Reason for credit adjustment..."
                rows={3}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowAdjustDialog(false)}
              disabled={adjusting}
            >
              Cancel
            </Button>
            <Button onClick={handleCreditAdjustment} disabled={adjusting}>
              {adjusting ? 'Adjusting...' : 'Adjust Credits'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminControlsDashboard;
