import React, { useState, useEffect } from 'react';
import { Play, Calendar, AlertTriangle, CheckCircle, XCircle, Users, CreditCard, Clock, RefreshCw, Download } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card';
import { Button } from '../../../../components/ui/button';
import { Badge } from '../../../../components/ui/badge';
import { Alert, AlertDescription } from '../../../../components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../../../components/ui/dialog';
import { creditManagementService } from '../../../../services/creditManagementService';
import { MonthlyBillingResult } from '../../../../types/creditManagement';

const MonthlyBillingDashboard: React.FC = () => {
  const [billingResults, _setBillingResults] = useState<MonthlyBillingResult[]>([]);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [lastProcessedDate, setLastProcessedDate] = useState<string | null>(null);

  useEffect(() => {
    // Load last processed date from localStorage
    const lastDate = localStorage.getItem('lastBillingProcessed');
    if (lastDate) {
      setLastProcessedDate(lastDate);
    }
  }, []);

  const processBilling = async () => {
    try {
      setProcessing(true);
      setError(null);
      setSuccess(null);

      // TODO: Implement monthly billing processing endpoint
      // Monthly billing automation has been removed from creditManagementService
      // This feature needs to be re-implemented or removed from the UI
      setError('Monthly billing processing is not currently available');
      
      // Placeholder for future implementation
      // const response = await creditManagementService.processMonthlyBilling();
      // if (response.success && response.data) {
      //   setBillingResults(response.data);
      //   const now = new Date().toISOString();
      //   setLastProcessedDate(now);
      //   localStorage.setItem('lastBillingProcessed', now);
      //   
      //   const successCount = response.data.filter((result: MonthlyBillingResult) => result.status === 'success').length;
      //   const suspendedCount = response.data.filter((result: MonthlyBillingResult) => result.status === 'suspended').length;
      //   const errorCount = response.data.filter((result: MonthlyBillingResult) => result.status === 'error').length;
      //   
      //   setSuccess(`Billing processed: ${successCount} successful, ${suspendedCount} suspended, ${errorCount} errors`);
      // } else {
      //   setError(response.message || 'Failed to process monthly billing');
      // }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process billing');
    } finally {
      setProcessing(false);
      setShowConfirmDialog(false);
    }
  };

  const handleProcessBilling = () => {
    setShowConfirmDialog(true);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'suspended':
        return <AlertTriangle className="h-5 w-5 text-red-600" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Clock className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'text-green-600 bg-green-50';
      case 'suspended':
        return 'text-red-600 bg-red-50';
      case 'error':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const exportResults = () => {
    if (billingResults.length === 0) return;

    const csvContent = [
      ['Mess ID', 'Status', 'Credits Deducted', 'User Count', 'Required Credits', 'Available Credits', 'Reason', 'Error'],
      ...billingResults.map((result: MonthlyBillingResult) => [
        result.messId,
        result.status,
        result.creditsDeducted || '',
        result.userCount || '',
        result.requiredCredits || '',
        result.availableCredits || '',
        result.reason || '',
        result.error || ''
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `billing-results-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getStats = () => {
    if (billingResults.length === 0) return null;

    const successful = billingResults.filter((r: MonthlyBillingResult) => r.status === 'success');
    const suspended = billingResults.filter((r: MonthlyBillingResult) => r.status === 'suspended');
    const errors = billingResults.filter((r: MonthlyBillingResult) => r.status === 'error');
    
    const totalCreditsDeducted = successful.reduce((sum: number, r: MonthlyBillingResult) => sum + (r.creditsDeducted || 0), 0);
    const totalUsersProcessed = successful.reduce((sum: number, r: MonthlyBillingResult) => sum + (r.userCount || 0), 0);

    return {
      total: billingResults.length,
      successful: successful.length,
      suspended: suspended.length,
      errors: errors.length,
      totalCreditsDeducted,
      totalUsersProcessed
    };
  };

  const stats = getStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Monthly Billing Automation</h2>
          <p className="text-gray-600 mt-1">
            Process monthly billing for all messes based on user count and credit slabs
          </p>
        </div>
        <div className="flex items-center gap-3">
          {lastProcessedDate && (
            <div className="text-sm text-gray-600">
              Last processed: {new Date(lastProcessedDate).toLocaleString()}
            </div>
          )}
          <Button 
            onClick={handleProcessBilling} 
            disabled={processing}
            className="flex items-center gap-2"
          >
            {processing ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Play className="h-4 w-4" />
                Process Billing
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Success Alert */}
      {success && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">{success}</AlertDescription>
        </Alert>
      )}

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Processed</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <Calendar className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Successful</p>
                  <p className="text-2xl font-bold text-green-600">{stats.successful}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Suspended</p>
                  <p className="text-2xl font-bold text-red-600">{stats.suspended}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Credits Deducted</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {creditManagementService.formatCredits(stats.totalCreditsDeducted)}
                  </p>
                </div>
                <CreditCard className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Billing Results */}
      {billingResults.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Billing Results</CardTitle>
              <Button variant="outline" onClick={exportResults} className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                Export CSV
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {billingResults.map((result: MonthlyBillingResult, index: number) => (
                <div key={index} className={`p-4 rounded-lg border ${getStatusColor(result.status)}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(result.status)}
                      <div>
                        <div className="font-medium">Mess ID: {result.messId}</div>
                        <div className="text-sm opacity-75">
                          Status: <Badge variant="outline">{result.status}</Badge>
                        </div>
                      </div>
                    </div>
                    <div className="text-right text-sm">
                      {result.status === 'success' && (
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            {result.userCount} users
                          </div>
                          <div className="flex items-center gap-2">
                            <CreditCard className="h-4 w-4" />
                            {creditManagementService.formatCredits(result.creditsDeducted || 0)} credits
                          </div>
                        </div>
                      )}
                      {result.status === 'suspended' && (
                        <div className="space-y-1">
                          <div className="text-red-600 font-medium">Insufficient Credits</div>
                          <div className="text-xs">
                            Required: {creditManagementService.formatCredits(result.requiredCredits || 0)}
                          </div>
                          <div className="text-xs">
                            Available: {creditManagementService.formatCredits(result.availableCredits || 0)}
                          </div>
                        </div>
                      )}
                      {result.status === 'error' && (
                        <div className="text-red-600 text-xs max-w-xs">
                          {result.error}
                        </div>
                      )}
                    </div>
                  </div>
                  {result.reason && (
                    <div className="mt-2 text-sm opacity-75">
                      <strong>Reason:</strong> {result.reason}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {billingResults.length === 0 && !processing && (
        <Card className="p-8 text-center">
          <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Billing Results</h3>
          <p className="text-gray-600 mb-4">
            Click "Process Billing" to run monthly billing for all messes
          </p>
          <div className="bg-blue-50 p-4 rounded-lg text-left max-w-md mx-auto">
            <h4 className="font-medium text-blue-900 mb-2">What happens during billing:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Check each mess's current user count</li>
              <li>• Calculate credits needed based on slabs</li>
              <li>• Deduct credits from mess accounts</li>
              <li>• Suspend messes with insufficient credits</li>
              <li>• Send notifications to mess owners</li>
              <li>• Generate billing reports</li>
            </ul>
          </div>
        </Card>
      )}

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Monthly Billing</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                This will process monthly billing for all active messes. Credits will be deducted based on current user counts and credit slabs.
              </AlertDescription>
            </Alert>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Before proceeding, ensure:</h4>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>✓ Credit slabs are properly configured</li>
                <li>✓ User counts are up to date</li>
                <li>✓ Email notifications are working</li>
                <li>✓ You have reviewed any pending issues</li>
              </ul>
            </div>
            <p className="text-sm text-gray-600">
              This action cannot be undone. Are you sure you want to continue?
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowConfirmDialog(false)}
              disabled={processing}
            >
              Cancel
            </Button>
            <Button
              onClick={processBilling}
              disabled={processing}
              className="flex items-center gap-2"
            >
              {processing ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" />
                  Process Billing
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MonthlyBillingDashboard;
