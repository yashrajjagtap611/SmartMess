import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  Eye, 
  CheckCircle, 
  XCircle, 
  Clock, 
  User, 
  Mail, 
  Phone, 
  CreditCard,
  Calendar,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';
import { useMessProfile } from '@/contexts/MessProfileContext';
import { paymentVerificationService } from '@/services/api/paymentVerificationService';
import { formatCurrency } from '@/utils/format';

interface PaymentVerification {
  _id: string;
  userId: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  messId: {
    _id: string;
    name: string;
  };
  mealPlanId: {
    _id: string;
    name: string;
    description: string;
    pricing: {
      amount: number;
      period: string;
    };
  };
  amount: number;
  paymentMethod: 'upi' | 'online' | 'cash';
  paymentScreenshot?: string;
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  verifiedBy?: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  verifiedAt?: string;
  createdAt: string;
  updatedAt: string;
}

const PaymentVerification: React.FC = () => {
  const { messProfile } = useMessProfile();
  const messId = messProfile._id;
  const [verifications, setVerifications] = useState<PaymentVerification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedVerification, setSelectedVerification] = useState<PaymentVerification | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [processing, setProcessing] = useState<string | null>(null);

  const loadVerifications = useCallback(async () => {
    if (!messId) return;
    
    try {
      setError(null);
      const response = await paymentVerificationService.getMessOwnerVerificationRequests(messId);
      if (response.success) {
        setVerifications(response.data);
      } else {
        setError(response.message);
      }
    } catch (err) {
      console.error('Error loading verifications:', err);
      setError('Failed to load payment verifications');
    } finally {
      setLoading(false);
    }
  }, [messId]);

  const refreshData = useCallback(async () => {
    setRefreshing(true);
    await loadVerifications();
    setRefreshing(false);
  }, [loadVerifications]);

  useEffect(() => {
    loadVerifications();
  }, [loadVerifications]);

  const handleApprove = async (verificationId: string) => {
    try {
      setProcessing(verificationId);
      const response = await paymentVerificationService.updatePaymentVerification(
        verificationId, 
        'approved'
      );
      
      if (response.success) {
        await refreshData();
        setShowDetailsDialog(false);
        setSelectedVerification(null);
      } else {
        setError(response.message);
      }
    } catch (err) {
      console.error('Error approving verification:', err);
      setError('Failed to approve payment verification');
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async () => {
    if (!selectedVerification || !rejectionReason.trim()) return;
    
    try {
      setProcessing(selectedVerification._id);
      const response = await paymentVerificationService.updatePaymentVerification(
        selectedVerification._id, 
        'rejected',
        rejectionReason.trim()
      );
      
      if (response.success) {
        await refreshData();
        setShowRejectDialog(false);
        setShowDetailsDialog(false);
        setSelectedVerification(null);
        setRejectionReason('');
      } else {
        setError(response.message);
      }
    } catch (err) {
      console.error('Error rejecting verification:', err);
      setError('Failed to reject payment verification');
    } finally {
      setProcessing(null);
    }
  };

  const handleViewDetails = (verification: PaymentVerification) => {
    setSelectedVerification(verification);
    setShowDetailsDialog(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
      case 'approved': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'rejected': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-3 w-3" />;
      case 'approved': return <CheckCircle className="h-3 w-3" />;
      case 'rejected': return <XCircle className="h-3 w-3" />;
      default: return <AlertTriangle className="h-3 w-3" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const pendingVerifications = verifications.filter(v => v.status === 'pending');
  const approvedVerifications = verifications.filter(v => v.status === 'approved');
  const rejectedVerifications = verifications.filter(v => v.status === 'rejected');

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Payment Verification</h1>
          <p className="text-muted-foreground">Review and approve payment requests from users</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            onClick={refreshData}
            disabled={refreshing}
            variant="outline"
            size="sm"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 mr-2" />
            <span className="text-red-800 dark:text-red-200">{error}</span>
          </div>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{pendingVerifications.length}</div>
            <p className="text-xs text-muted-foreground">Awaiting your approval</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{approvedVerifications.length}</div>
            <p className="text-xs text-muted-foreground">Successfully verified</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejected</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{rejectedVerifications.length}</div>
            <p className="text-xs text-muted-foreground">Payment rejected</p>
          </CardContent>
        </Card>
      </div>

      {/* Verification Requests */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Verification Requests ({verifications.length})</CardTitle>
          <CardDescription>Review payment screenshots and approve or reject requests</CardDescription>
        </CardHeader>
        <CardContent>
          {verifications.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No payment verification requests found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {verifications.map((verification) => (
                <div key={verification._id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">
                          {verification.userId.firstName} {verification.userId.lastName}
                        </span>
                        <Badge className={getStatusColor(verification.status)}>
                          {getStatusIcon(verification.status)} {verification.status}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <Mail className="h-3 w-3" />
                          <span>{verification.userId.email}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Phone className="h-3 w-3" />
                          <span>{verification.userId.phone}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4 text-sm">
                        <div className="flex items-center space-x-1">
                          <CreditCard className="h-3 w-3 text-muted-foreground" />
                          <span className="font-semibold">{formatCurrency(verification.amount)}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          <span>{formatDate(verification.createdAt)}</span>
                        </div>
                      </div>
                      
                      <div className="text-sm">
                        <span className="text-muted-foreground">Plan: </span>
                        <span className="font-medium">{verification.mealPlanId.name}</span>
                        <span className="text-muted-foreground ml-2">
                          ({verification.paymentMethod.toUpperCase()})
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button
                        onClick={() => handleViewDetails(verification)}
                        variant="outline"
                        size="sm"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Review
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Payment Verification Details</DialogTitle>
            <DialogDescription>
              Review the payment screenshot and user details
            </DialogDescription>
          </DialogHeader>
          
          {selectedVerification && (
            <div className="space-y-6">
              {/* User Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">User Information</Label>
                  <div className="mt-2 space-y-2">
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span>{selectedVerification.userId.firstName} {selectedVerification.userId.lastName}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span>{selectedVerification.userId.email}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{selectedVerification.userId.phone}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <Label className="text-sm font-medium">Payment Details</Label>
                  <div className="mt-2 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Amount:</span>
                      <span className="font-semibold">{formatCurrency(selectedVerification.amount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Method:</span>
                      <span className="font-medium">{selectedVerification.paymentMethod.toUpperCase()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Plan:</span>
                      <span className="font-medium">{selectedVerification.mealPlanId.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Date:</span>
                      <span className="font-medium">{formatDate(selectedVerification.createdAt)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Screenshot */}
              {selectedVerification.paymentScreenshot && (
                <div>
                  <Label className="text-sm font-medium">Payment Screenshot</Label>
                  <div className="mt-2 border rounded-lg p-4">
                    <img
                      src={selectedVerification.paymentScreenshot}
                      alt="Payment Screenshot"
                      className="max-w-full max-h-96 rounded-lg border border-gray-200 dark:border-gray-700"
                    />
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              {selectedVerification.status === 'pending' && (
                <div className="flex space-x-4">
                  <Button
                    onClick={() => handleApprove(selectedVerification._id)}
                    disabled={processing === selectedVerification._id}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    {processing === selectedVerification._id ? (
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <CheckCircle className="h-4 w-4 mr-2" />
                    )}
                    Approve Payment
                  </Button>
                  <Button
                    onClick={() => setShowRejectDialog(true)}
                    disabled={processing === selectedVerification._id}
                    variant="destructive"
                    className="flex-1"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject Payment
                  </Button>
                </div>
              )}

              {/* Status Information */}
              {selectedVerification.status !== 'pending' && (
                <div className="bg-muted rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Badge className={getStatusColor(selectedVerification.status)}>
                      {getStatusIcon(selectedVerification.status)} {selectedVerification.status}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {selectedVerification.verifiedAt && formatDate(selectedVerification.verifiedAt)}
                    </span>
                  </div>
                  {selectedVerification.rejectionReason && (
                    <div>
                      <Label className="text-sm font-medium">Rejection Reason:</Label>
                      <p className="text-sm text-muted-foreground mt-1">{selectedVerification.rejectionReason}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Reject Payment Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Payment</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this payment verification request.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="rejectionReason">Rejection Reason</Label>
              <Textarea
                id="rejectionReason"
                placeholder="Please explain why this payment is being rejected..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="mt-2"
                rows={4}
              />
            </div>
            
            <div className="flex space-x-4">
              <Button
                onClick={() => setShowRejectDialog(false)}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleReject}
                disabled={!rejectionReason.trim() || processing === selectedVerification?._id}
                variant="destructive"
                className="flex-1"
              >
                {processing === selectedVerification?._id ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <XCircle className="h-4 w-4 mr-2" />
                )}
                Reject Payment
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PaymentVerification;