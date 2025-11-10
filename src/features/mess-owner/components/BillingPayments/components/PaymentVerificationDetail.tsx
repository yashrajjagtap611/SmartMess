import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CommonHeader } from '@/components/common/Header/CommonHeader';
import {
  DocumentTextIcon,
  PhotoIcon,
  ArrowDownTrayIcon,
  EyeIcon,
  ClockIcon,
  CheckCircleIcon,
  XMarkIcon,
  UserIcon,
  CurrencyDollarIcon,
  CreditCardIcon,
  CalendarIcon,
  QrCodeIcon
} from '@heroicons/react/24/outline';
import { formatNotificationTime } from '@/shared/notifications/utils';
import { formatCurrency } from '../BillingPayments.utils';
import { billingService } from '@/services/api/billingService';
import { useToast } from '@/hooks/use-toast';
import ActionModal from '@/components/common/ActionModal';
import InsufficientCreditsDialog from '@/components/common/InsufficientCreditsDialog';

const PaymentVerificationDetail: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation() as any;
  const { toast } = useToast();
  const request = location?.state?.request;

  // Debug: Log the request data to see what we're receiving
  React.useEffect(() => {
    if (request) {
      console.log('🔍 PaymentVerificationDetail - Request data:', {
        transactionId: request.transactionId,
        paymentScreenshot: request.paymentScreenshot,
        receiptUrl: request.receiptUrl,
        paymentMethod: request.paymentMethod,
        fullRequest: request
      });
    }
  }, [request]);
  
  const [actionModal, setActionModal] = useState<{
    isOpen: boolean;
    action: 'approve' | 'reject';
  }>({
    isOpen: false,
    action: 'approve'
  });
  const [loading, setLoading] = useState<'approve' | 'reject' | null>(null);
  const [insufficientCreditsError, setInsufficientCreditsError] = useState<{
    isOpen: boolean;
    requiredCredits: number;
    availableCredits: number;
    message: string;
  }>({
    isOpen: false,
    requiredCredits: 0,
    availableCredits: 0,
    message: ''
  });

  if (!request) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4 pb-[72px] sm:pb-6 lg:pb-4">
        <div className="text-center">
          <DocumentTextIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-sm sm:text-base text-muted-foreground mb-4">Payment request not found</p>
          <Button onClick={() => navigate(-1)} variant="outline" size="sm" className="sm:size-default">
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  const getStatusBadgeColor = (status: string) => {
    const statusLower = status.toLowerCase();
    if (statusLower === 'pending_verification' || statusLower === 'sent') {
      return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400';
    }
    if (statusLower === 'approved') {
      return 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400';
    }
    if (statusLower === 'rejected') {
      return 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400';
    }
    return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400';
  };

  const getStatusIcon = (status: string) => {
    const statusLower = status.toLowerCase();
    if (statusLower === 'pending_verification' || statusLower === 'sent') {
      return ClockIcon;
    }
    if (statusLower === 'approved') {
      return CheckCircleIcon;
    }
    if (statusLower === 'rejected') {
      return XMarkIcon;
    }
    return DocumentTextIcon;
  };

  const StatusIcon = getStatusIcon(request.status);
  const requestTime = request.requestedAt ? formatNotificationTime(new Date(request.requestedAt)) : '';
  const paymentScreenshot = request.paymentScreenshot || request.receiptUrl;
  
  // Debug: Log payment screenshot URL
  React.useEffect(() => {
    if (paymentScreenshot) {
      console.log('🔍 Payment Screenshot URL:', {
        original: paymentScreenshot,
        processed: getImageUrl(paymentScreenshot),
        startsWithHttp: paymentScreenshot.startsWith('http'),
        startsWithUploads: paymentScreenshot.startsWith('/uploads')
      });
    }
  }, [paymentScreenshot]);

  // Helper function to get the correct image URL
  const getImageUrl = (url: string | null | undefined): string => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    // If URL starts with /uploads, prepend /api for proxy
    if (url.startsWith('/uploads')) {
      return `${window.location.origin}/api${url}`;
    }
    // Otherwise, prepend origin
    return `${window.location.origin}${url}`;
  };

  const handleDownloadReceipt = (imageUrl: string, userName: string) => {
    if (imageUrl) {
      const fullUrl = getImageUrl(imageUrl);
      const link = document.createElement('a');
      link.href = fullUrl;
      link.download = `receipt-${userName}-${Date.now()}.jpg`;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleApproveClick = () => {
    setActionModal({
      isOpen: true,
      action: 'approve'
    });
  };

  const handleRejectClick = () => {
    setActionModal({
      isOpen: true,
      action: 'reject'
    });
  };

  const handleActionConfirm = async (remarks: string) => {
    const { action } = actionModal;
    setLoading(action);
    
    try {
      if (action === 'approve') {
        const result = await billingService.approvePaymentRequest(request.membershipId, request.paymentMethod);
        if (result.success) {
          const creditInfo = result.data;
          const description = creditInfo?.creditsDeducted !== undefined
            ? `${result.message || 'Payment request approved'}. ${creditInfo.creditsDeducted} credits deducted. Remaining: ${creditInfo.remainingCredits || 0}`
            : result.message || 'The payment request has been approved successfully';
          
          toast({
            title: 'Payment Request Approved',
            description: description,
            variant: 'success',
          });
          setActionModal({ isOpen: false, action: 'approve' });
          // Navigate back after a short delay to show the success message
          setTimeout(() => {
            navigate(-1);
          }, 1500);
        } else {
          const creditData = result.data;
          if (creditData?.requiredCredits !== undefined) {
            setActionModal({ isOpen: false, action: 'approve' });
            setInsufficientCreditsError({
              isOpen: true,
              requiredCredits: creditData.requiredCredits,
              availableCredits: creditData.availableCredits,
              message: result.message || `Insufficient credits to approve this user. You need ${creditData.requiredCredits} credits but only have ${creditData.availableCredits} available. Please purchase more credits to continue.`
            });
          } else {
            toast({
              title: 'Approval Failed',
              description: result.message || 'Failed to approve payment request',
              variant: 'destructive',
            });
          }
        }
      } else {
        const result = await billingService.rejectPaymentRequest(request.membershipId, remarks || undefined);
        if (result.success) {
          toast({
            title: 'Payment Request Rejected',
            description: result.message || 'The payment request has been rejected',
            variant: 'default',
          });
          setActionModal({ isOpen: false, action: 'reject' });
          // Navigate back after a short delay to show the success message
          setTimeout(() => {
            navigate(-1);
          }, 1500);
        } else {
          toast({
            title: 'Rejection Failed',
            description: result.message || 'Failed to reject payment request',
            variant: 'destructive',
          });
        }
      }
    } catch (error: any) {
      console.error(`${action} error:`, error);
      toast({
        title: 'Error',
        description: error.message || error.response?.data?.message || `Failed to ${action} payment request`,
        variant: 'destructive',
      });
    } finally {
      setLoading(null);
    }
  };

  const isPending = request?.status === 'pending_verification' || request?.status === 'sent';

  return (
    <div className="flex flex-col gap-3 sm:gap-4 md:gap-6 p-2 sm:p-4 pb-[72px] sm:pb-6 lg:pb-4 max-w-7xl mx-auto w-full">
      <CommonHeader
        title="Payment Verification Details"
        subtitle={`Verify payment request from ${request.userName}`}
        variant="default"
        onBack={() => navigate(-1)}
      />

      <div className="space-y-3 sm:space-y-4 md:space-y-6">
        {/* User Information and Payment Details - Side by side on larger screens */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
          {/* User Information Card */}
          <Card className="bg-card border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                <UserIcon className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" />
                <span className="truncate">User Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2.5 sm:space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2">
                <span className="text-xs sm:text-sm text-muted-foreground">Name:</span>
                <span className="text-sm sm:text-base font-semibold text-foreground break-words text-right sm:text-left">{request.userName}</span>
              </div>
              {request.userEmail && (
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2">
                  <span className="text-xs sm:text-sm text-muted-foreground">Email:</span>
                  <span className="text-xs sm:text-sm text-foreground break-all text-right sm:text-left">{request.userEmail}</span>
                </div>
              )}
              {request.userPhone && (
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2">
                  <span className="text-xs sm:text-sm text-muted-foreground">Phone:</span>
                  <span className="text-xs sm:text-sm text-foreground break-words text-right sm:text-left">{request.userPhone}</span>
                </div>
              )}
              {request.planName && (
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2">
                  <span className="text-xs sm:text-sm text-muted-foreground">Plan:</span>
                  <span className="text-xs sm:text-sm text-foreground break-words text-right sm:text-left">{request.planName}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Payment Details Card */}
          <Card className="bg-card border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                <CurrencyDollarIcon className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" />
                <span className="truncate">Payment Details</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2.5 sm:space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2">
                <span className="text-xs sm:text-sm text-muted-foreground">Amount:</span>
                <span className="text-base sm:text-lg font-bold text-foreground text-right sm:text-left">{formatCurrency(request.amount)}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2">
                <span className="text-xs sm:text-sm text-muted-foreground">Status:</span>
                <Badge className={`${getStatusBadgeColor(request.status)} text-xs px-2 py-0.5 rounded-full font-medium flex items-center gap-1 w-fit sm:ml-auto`}>
                  <StatusIcon className="h-3 w-3 flex-shrink-0" />
                  <span className="truncate">{request.status.replace('_', ' ').charAt(0).toUpperCase() + request.status.replace('_', ' ').slice(1).toLowerCase()}</span>
                </Badge>
              </div>
              {request.paymentMethod && (
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2">
                  <span className="text-xs sm:text-sm text-muted-foreground">Payment Method:</span>
                  <div className="flex items-center gap-2 w-fit sm:ml-auto">
                    {request.paymentMethod.toLowerCase() === 'upi' && <QrCodeIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary flex-shrink-0" />}
                    {request.paymentMethod.toLowerCase() === 'cash' && <CurrencyDollarIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary flex-shrink-0" />}
                    {request.paymentMethod.toLowerCase() === 'online' && <CreditCardIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary flex-shrink-0" />}
                    <span className="text-xs sm:text-sm font-medium text-foreground capitalize">{request.paymentMethod}</span>
                  </div>
                </div>
              )}
              {requestTime && (
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2">
                  <span className="text-xs sm:text-sm text-muted-foreground">Requested:</span>
                  <div className="flex items-center gap-1 w-fit sm:ml-auto">
                    <ClockIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
                    <span className="text-xs sm:text-sm text-foreground">{requestTime}</span>
                  </div>
                </div>
              )}
              {/* Transaction ID - Always show for UPI/bank transfers, or if provided */}
              {((request.paymentMethod && ['upi', 'bank_transfer'].includes(request.paymentMethod.toLowerCase())) || request.transactionId) && (
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1 sm:gap-2 pt-2 border-t border-border">
                  <span className="text-xs sm:text-sm text-muted-foreground flex-shrink-0">Transaction ID:</span>
                  <div className="flex flex-col items-end sm:items-end gap-1 w-full sm:w-auto">
                    <span className="text-xs sm:text-sm font-mono font-semibold text-foreground break-all text-right w-full sm:max-w-xs">
                      {request.transactionId || 'Not provided'}
                    </span>
                    <span className="text-xs text-muted-foreground">For verification</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Payment Screenshot Card - Show if screenshot exists */}
        {paymentScreenshot && (
          <Card className="bg-card border-border">
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
                <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                  <PhotoIcon className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" />
                  <span className="truncate">Payment Receipt</span>
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => {
                      const newWindow = window.open();
                      if (newWindow && paymentScreenshot) {
                        newWindow.location.href = getImageUrl(paymentScreenshot);
                      }
                    }}
                    variant="outline"
                    size="sm"
                    className="h-8 sm:h-9 px-2 sm:px-3 text-xs flex-1 sm:flex-initial"
                  >
                    <EyeIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 flex-shrink-0" />
                    View
                  </Button>
                  <Button
                    onClick={() => handleDownloadReceipt(paymentScreenshot, request.userName)}
                    variant="outline"
                    size="sm"
                    className="h-8 sm:h-9 px-2 sm:px-3 text-xs flex-1 sm:flex-initial"
                  >
                    <ArrowDownTrayIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 flex-shrink-0" />
                    Download
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="relative w-full bg-muted/30 rounded-lg overflow-hidden border border-border">
                <img
                  src={getImageUrl(paymentScreenshot)}
                  alt="Payment Receipt"
                  className="w-full h-auto max-h-[300px] sm:max-h-[400px] md:max-h-[500px] object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/placeholder-receipt.png';
                  }}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Verification Status Card */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-base sm:text-lg flex items-center gap-2">
              <DocumentTextIcon className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" />
              <span className="truncate">Verification Status</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2.5 sm:space-y-3">
            {request.requestedAt && (
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2">
                <span className="text-xs sm:text-sm text-muted-foreground">Requested At:</span>
                <div className="flex items-center gap-1 w-fit sm:ml-auto">
                  <CalendarIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
                  <span className="text-xs sm:text-sm text-foreground">
                    {new Date(request.requestedAt).toLocaleString()}
                  </span>
                </div>
              </div>
            )}
            {request.approvedAt && (
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2">
                <span className="text-xs sm:text-sm text-muted-foreground">Approved At:</span>
                <div className="flex items-center gap-1 w-fit sm:ml-auto">
                  <CheckCircleIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-green-600 dark:text-green-400 flex-shrink-0" />
                  <span className="text-xs sm:text-sm text-foreground">
                    {new Date(request.approvedAt).toLocaleString()}
                  </span>
                </div>
              </div>
            )}
            {request.rejectedAt && (
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2">
                <span className="text-xs sm:text-sm text-muted-foreground">Rejected At:</span>
                <div className="flex items-center gap-1 w-fit sm:ml-auto">
                  <XMarkIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-red-600 dark:text-red-400 flex-shrink-0" />
                  <span className="text-xs sm:text-sm text-foreground">
                    {new Date(request.rejectedAt).toLocaleString()}
                  </span>
                </div>
              </div>
            )}
            {request.updatedAt && (
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2 pt-2 border-t border-border">
                <span className="text-xs sm:text-sm text-muted-foreground">Last Updated:</span>
                <span className="text-xs sm:text-sm text-foreground text-right sm:text-left">
                  {new Date(request.updatedAt).toLocaleString()}
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Action Buttons - Only show for pending requests */}
        {isPending && (
          <Card className="bg-card border-border">
            <CardContent className="p-3 sm:p-4">
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <Button
                  onClick={handleApproveClick}
                  disabled={loading !== null}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base h-10 sm:h-12"
                >
                  {loading === 'approve' ? (
                    <>
                      <span className="animate-spin mr-2">⏳</span>
                      <span className="hidden sm:inline">Processing...</span>
                      <span className="sm:hidden">Processing</span>
                    </>
                  ) : (
                    <>
                      <CheckCircleIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-1.5 sm:mr-2 flex-shrink-0" />
                      <span className="hidden sm:inline">Approve Payment</span>
                      <span className="sm:hidden">Approve</span>
                    </>
                  )}
                </Button>
                <Button
                  onClick={handleRejectClick}
                  disabled={loading !== null}
                  variant="destructive"
                  className="flex-1 text-sm sm:text-base h-10 sm:h-12"
                >
                  {loading === 'reject' ? (
                    <>
                      <span className="animate-spin mr-2">⏳</span>
                      <span className="hidden sm:inline">Processing...</span>
                      <span className="sm:hidden">Processing</span>
                    </>
                  ) : (
                    <>
                      <XMarkIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-1.5 sm:mr-2 flex-shrink-0" />
                      <span className="hidden sm:inline">Reject Payment</span>
                      <span className="sm:hidden">Reject</span>
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Action Modal for Approve/Reject */}
      <ActionModal
        isOpen={actionModal.isOpen}
        onClose={() => {
          setActionModal({ isOpen: false, action: 'approve' });
        }}
        onConfirm={handleActionConfirm}
        action={actionModal.action}
        notificationTitle={`${actionModal.action === 'approve' ? 'Approve' : 'Reject'} Payment Request`}
        notificationMessage={`${request?.userName} wants to pay ${formatCurrency(request?.amount || 0)}`}
        loading={loading === actionModal.action}
      />

      {/* Insufficient Credits Dialog */}
      <InsufficientCreditsDialog
        isOpen={insufficientCreditsError.isOpen}
        onClose={() => setInsufficientCreditsError({ isOpen: false, requiredCredits: 0, availableCredits: 0, message: '' })}
        requiredCredits={insufficientCreditsError.requiredCredits}
        availableCredits={insufficientCreditsError.availableCredits}
        message={insufficientCreditsError.message}
      />
    </div>
  );
};

export default PaymentVerificationDetail;

