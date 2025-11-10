import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DocumentTextIcon, CheckCircleIcon, XMarkIcon, MagnifyingGlassIcon, FunnelIcon, PhotoIcon, ArrowDownTrayIcon, EyeIcon, ClockIcon, TrashIcon } from '@heroicons/react/24/outline';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import FilterModal, { FilterOption } from '@/components/common/FilterModal';
import { formatNotificationTime } from '@/shared/notifications/utils';
import ActionModal from '@/components/common/ActionModal';
import InsufficientCreditsDialog from '@/components/common/InsufficientCreditsDialog';

type RequestItem = {
  requestId: string;
  membershipId: string;
  userName: string;
  amount: number;
  status: string;
  paymentMethod?: string;
  requestedAt?: string | Date;
  userEmail?: string;
  userPhone?: string;
  planName?: string;
  updatedAt?: string | Date;
  approvedAt?: string | Date;
  rejectedAt?: string | Date;
  paymentScreenshot?: string;
  receiptUrl?: string;
  transactionId?: string;
};

interface PaymentRequestsProps {
  requests: RequestItem[];
  formatCurrency: (n: number) => string;
  onApprove: (membershipId: string, method?: string) => Promise<any>;
  onReject?: (membershipId: string, remarks?: string) => Promise<any>;
}

const PaymentRequests: React.FC<PaymentRequestsProps> = ({
  requests,
  formatCurrency,
  onApprove,
  onReject
}) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loadingStates, setLoadingStates] = useState<Record<string, 'approve' | 'reject' | null>>({});
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [receiptViewer, setReceiptViewer] = useState<{ isOpen: boolean; imageUrl: string }>({
    isOpen: false,
    imageUrl: ''
  });
  const [actionModal, setActionModal] = useState<{
    isOpen: boolean;
    action: 'approve' | 'reject';
    requestId: string;
    membershipId: string;
    userName: string;
    amount: number;
  }>({
    isOpen: false,
    action: 'approve',
    requestId: '',
    membershipId: '',
    userName: '',
    amount: 0
  });
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

  // Filter requests based on selected status and search query
  const filteredRequests = useMemo(() => {
    if (!requests || requests.length === 0) return [];
    
    let filtered = requests;
    
    // Apply status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(request => {
      const status = request.status.toLowerCase();
      if (filterStatus === 'pending') {
        return status === 'pending_verification' || status === 'sent';
      }
      if (filterStatus === 'approved') {
        return status === 'approved';
      }
      if (filterStatus === 'rejected') {
        return status === 'rejected';
      }
      return true;
    });
    }
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(request => 
        request.userName.toLowerCase().includes(query) ||
        request.userEmail?.toLowerCase().includes(query) ||
        request.userPhone?.toLowerCase().includes(query) ||
        request.planName?.toLowerCase().includes(query) ||
        request.paymentMethod?.toLowerCase().includes(query)
      );
    }
    
    return filtered;
  }, [requests, filterStatus, searchQuery]);

  // Count requests by status
  const statusCounts = useMemo(() => {
    const counts = {
      all: requests?.length || 0,
      pending: 0,
      approved: 0,
      rejected: 0
    };
    
    requests?.forEach(request => {
      const status = request.status.toLowerCase();
      if (status === 'pending_verification' || status === 'sent') {
        counts.pending++;
      } else if (status === 'approved') {
        counts.approved++;
      } else if (status === 'rejected') {
        counts.rejected++;
      }
    });
    
    return counts;
  }, [requests]);

  // Filter options for FilterModal
  const filterOptions: FilterOption[] = useMemo(() => {
    return [
      {
        id: 'all',
        title: 'All Requests',
        description: 'Show all payment requests',
        icon: DocumentTextIcon,
        selected: filterStatus === 'all',
        count: statusCounts.all
      },
      {
        id: 'pending',
        title: 'Pending',
        description: 'Requests pending verification',
        icon: ClockIcon,
        selected: filterStatus === 'pending',
        count: statusCounts.pending
      },
      {
        id: 'approved',
        title: 'Approved',
        description: 'Approved payment requests',
        icon: CheckCircleIcon,
        selected: filterStatus === 'approved',
        count: statusCounts.approved
      },
      {
        id: 'rejected',
        title: 'Rejected',
        description: 'Rejected payment requests',
        icon: XMarkIcon,
        selected: filterStatus === 'rejected',
        count: statusCounts.rejected
      }
    ];
  }, [filterStatus, statusCounts]);

  const handleFilterChange = (filterId: string) => {
    setFilterStatus(filterId as any);
  };

  const handleViewReceipt = (imageUrl: string) => {
    if (imageUrl) {
      setReceiptViewer({ isOpen: true, imageUrl });
    }
  };

  const handleDownloadReceipt = (imageUrl: string, userName: string) => {
    if (imageUrl) {
      const link = document.createElement('a');
      link.href = imageUrl.startsWith('http') ? imageUrl : `${window.location.origin}${imageUrl}`;
      link.download = `receipt-${userName}-${Date.now()}.jpg`;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // Get status indicator icon and color
  const getStatusIndicator = (status: string) => {
    const statusLower = status.toLowerCase();
    if (statusLower === 'pending_verification' || statusLower === 'sent') {
      return {
        icon: ClockIcon,
        bgColor: 'bg-yellow-100 dark:bg-yellow-900/20',
        iconColor: 'text-yellow-600 dark:text-yellow-400'
      };
    }
    if (statusLower === 'approved') {
      return {
        icon: CheckCircleIcon,
        bgColor: 'bg-green-100 dark:bg-green-900/20',
        iconColor: 'text-green-600 dark:text-green-400'
      };
    }
    if (statusLower === 'rejected') {
      return {
        icon: XMarkIcon,
        bgColor: 'bg-red-100 dark:bg-red-900/20',
        iconColor: 'text-red-600 dark:text-red-400'
      };
    }
    // Cancelled or other statuses
    return {
      icon: null,
      bgColor: 'bg-gray-100 dark:bg-gray-800',
      iconColor: 'text-gray-400'
    };
  };

  // Get status badge color
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

  // Get request message
  const getRequestMessage = (request: RequestItem) => {
    const statusLower = request.status.toLowerCase();
    if (statusLower === 'rejected') {
      return 'Request rejected';
    }
    if (statusLower === 'cancelled') {
      return 'Request cancelled by user';
    }
    return `${request.userName} wants to pay ₹${formatCurrency(request.amount)}`;
  };

  const handleApproveClick = (requestId: string, membershipId: string, userName: string, amount: number) => {
    setActionModal({
      isOpen: true,
      action: 'approve',
      requestId,
      membershipId,
      userName,
      amount
    });
  };

  const handleRejectClick = (requestId: string, membershipId: string, userName: string, amount: number) => {
    setActionModal({
      isOpen: true,
      action: 'reject',
      requestId,
      membershipId,
      userName,
      amount
    });
  };

  const handleActionConfirm = async (remarks: string) => {
    const { requestId, membershipId, action } = actionModal;
    setLoadingStates(prev => ({ ...prev, [requestId]: action }));
    
    try {
      if (action === 'approve') {
        const result = await onApprove(membershipId);
      if (result.success) {
        // Show success message with credit info if available
        const creditInfo = result.data;
        const description = creditInfo?.creditsDeducted !== undefined
          ? `${result.message || 'Payment request approved'}. ${creditInfo.creditsDeducted} credits deducted. Remaining: ${creditInfo.remainingCredits || 0}`
          : result.message || 'The payment request has been approved successfully';
        
        toast({
          title: 'Payment Request Approved',
          description: description,
          variant: 'success',
        });
          setActionModal({ isOpen: false, action: 'approve', requestId: '', membershipId: '', userName: '', amount: 0 });
      } else {
        // Check if it's an insufficient credits error
        const creditData = result.data;
        if (creditData?.requiredCredits !== undefined) {
            // Close action modal and show insufficient credits dialog
            setActionModal({ isOpen: false, action: 'approve', requestId: '', membershipId: '', userName: '', amount: 0 });
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
        // Reject action
        const result = await onReject?.(membershipId, remarks || undefined);
      if (result?.success) {
        toast({
          title: 'Payment Request Rejected',
          description: result.message || 'The payment request has been rejected',
          variant: 'default',
        });
          setActionModal({ isOpen: false, action: 'reject', requestId: '', membershipId: '', userName: '', amount: 0 });
      } else {
        toast({
          title: 'Rejection Failed',
          description: result?.message || 'Failed to reject payment request',
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
      setLoadingStates(prev => ({ ...prev, [requestId]: null }));
    }
  };

  return (
    <>
      <Card className="bg-card border-border">
        <CardHeader className="pb-4">
          <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
            <div>
              <CardTitle className="text-base sm:text-lg text-foreground flex items-center gap-2">
                <div className="p-1.5 sm:p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
                  <DocumentTextIcon className="h-4 w-4 sm:h-5 sm:w-5 text-orange-600 dark:text-orange-400" />
                </div>
                <span className="truncate">Payment Requests History ({filteredRequests.length})</span>
              </CardTitle>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {/* Search Icon/Input */}
              {showSearch ? (
                <div className="relative flex-1 sm:flex-none min-w-[200px] sm:min-w-[250px]">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Search by name, email, phone..."
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
              {/* Filter Button */}
              <Button
                onClick={() => setFilterOpen(true)}
                variant="outline"
                size="sm"
                className="h-8 px-2 text-xs w-auto"
              >
                <FunnelIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredRequests && filteredRequests.length > 0 ? filteredRequests.map((request) => {
              const isPending = request.status === 'pending_verification' || request.status === 'sent';
              const isCancelled = request.status.toLowerCase() === 'cancelled';
              const isApproved = request.status.toLowerCase() === 'approved';
              const isRejected = request.status.toLowerCase() === 'rejected';
              const currentState = (loadingStates[request.requestId || request.membershipId] ?? null);
              const isLoading = currentState === 'approve' || currentState === 'reject';
              
              const statusIndicator = getStatusIndicator(request.status);
              const StatusIcon = statusIndicator.icon;
              const requestTime = request.requestedAt ? formatNotificationTime(new Date(request.requestedAt)) : '';
              
              const handleCardClick = () => {
                navigate(ROUTES.MESS_OWNER.PAYMENT_VERIFICATION_DETAIL.replace(':requestId', request.requestId || request.membershipId), {
                  state: { request }
                });
              };
              
              return (
                <div 
                  key={request.requestId || request.membershipId} 
                  onClick={handleCardClick}
                  className="rounded-lg border border-border bg-card p-4 shadow-sm transition-all hover:shadow-md cursor-pointer"
                >
                  <div className="flex items-start gap-3">
                    {/* Status Indicator Circle */}
                    <div className={`shrink-0 w-10 h-10 rounded-full ${statusIndicator.bgColor} flex items-center justify-center`}>
                      {StatusIcon && (
                        <StatusIcon className={`h-5 w-5 ${statusIndicator.iconColor}`} />
                      )}
                    </div>
                    
                    {/* Main Content */}
                    <div className="flex-1 min-w-0">
                      {/* Header: Name, Status Badge, Time */}
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <h3 className="font-semibold text-base text-foreground whitespace-nowrap">
                          {request.userName}
                        </h3>
                        <div className="flex items-center gap-2 shrink-0">
                          <Badge className={`${getStatusBadgeColor(request.status)} text-xs px-2 py-0.5 rounded-full font-medium whitespace-nowrap`}>
                            {request.status.replace('_', ' ').charAt(0).toUpperCase() + request.status.replace('_', ' ').slice(1).toLowerCase()}
                          </Badge>
                          {requestTime && (
                            <span className="text-xs text-muted-foreground whitespace-nowrap">{requestTime}</span>
                          )}
                        </div>
                      </div>
                      
                      {/* Request Message */}
                      <p className="text-sm text-muted-foreground mb-3">
                        {getRequestMessage(request)}
                      </p>
                      
                      {/* Receipt View/Download (if available) */}
                      {(request.paymentScreenshot || request.receiptUrl) && (
                        <div className="flex items-center gap-2 mb-3" onClick={(e) => e.stopPropagation()}>
                          <Button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleViewReceipt(request.paymentScreenshot || request.receiptUrl || '');
                            }}
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 text-xs"
                          >
                            <EyeIcon className="h-3.5 w-3.5 mr-1" />
                            View Receipt
                          </Button>
                          <Button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleDownloadReceipt(request.paymentScreenshot || request.receiptUrl || '', request.userName);
                            }}
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 text-xs"
                          >
                            <ArrowDownTrayIcon className="h-3.5 w-3.5 mr-1" />
                            Download
                          </Button>
                            </div>
                          )}

                        {/* Action Buttons */}
                        {isPending && (
                        <div className="flex gap-2 pt-2 border-t border-border">
                            <Button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                              handleApproveClick(request.requestId || request.membershipId, request.membershipId, request.userName, request.amount);
                              }}
                              disabled={isLoading}
                              className="flex-1 bg-green-600 hover:bg-green-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                              size="sm"
                              type="button"
                            >
                                  Approve
                            </Button>
                            {onReject && (
                              <Button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleRejectClick(request.requestId || request.membershipId, request.membershipId, request.userName, request.amount);
                              }}
                                disabled={isLoading}
                                variant="destructive"
                                size="sm"
                                className="flex-1"
                              >
                                    Reject
                              </Button>
                            )}
                          </div>
                        )}
                      
                      {/* Delete button for non-pending requests */}
                      {(isApproved || isRejected || isCancelled) && (
                        <div className="flex gap-2 pt-2 border-t border-border" onClick={(e) => e.stopPropagation()}>
                          <Button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleRejectClick(request.requestId || request.membershipId, request.membershipId, request.userName, request.amount);
                            }}
                            variant="outline"
                            size="sm"
                            className="flex-1 border-border text-muted-foreground hover:text-foreground"
                          >
                            <TrashIcon className="h-4 w-4 mr-2" />
                            Delete
                          </Button>
                      </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            }) : (
              <div className="text-center py-12 text-muted-foreground">
                <div className="p-4 bg-muted/50 rounded-lg w-fit mx-auto mb-4">
                  <DocumentTextIcon className="h-8 w-8 opacity-50" />
                </div>
                <p className="text-sm font-medium">No payment requests</p>
                <p className="text-xs mt-1">Payment requests will appear here when submitted by members</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Action Modal for Approve/Reject */}
      <ActionModal
        isOpen={actionModal.isOpen}
        onClose={() => {
          setActionModal({ isOpen: false, action: 'approve', requestId: '', membershipId: '', userName: '', amount: 0 });
        }}
        onConfirm={handleActionConfirm}
        action={actionModal.action}
        notificationTitle={`${actionModal.action === 'approve' ? 'Approve' : 'Reject'} Payment Request`}
        notificationMessage={`${actionModal.userName} wants to pay ₹${formatCurrency(actionModal.amount)}`}
        loading={(loadingStates[actionModal.requestId] ?? null) === actionModal.action}
      />

      {/* Insufficient Credits Dialog */}
      <InsufficientCreditsDialog
        isOpen={insufficientCreditsError.isOpen}
        onClose={() => setInsufficientCreditsError({ isOpen: false, requiredCredits: 0, availableCredits: 0, message: '' })}
        requiredCredits={insufficientCreditsError.requiredCredits}
        availableCredits={insufficientCreditsError.availableCredits}
        message={insufficientCreditsError.message}
      />

      {/* Filter Modal */}
      <FilterModal
        isOpen={filterOpen}
        onClose={() => setFilterOpen(false)}
        selectedFilter={filterStatus}
        onFilterChange={handleFilterChange}
        filterOptions={filterOptions}
        title="Filter Payment Requests"
        showCounts={true}
      />

      {/* Receipt Viewer Dialog */}
      <Dialog open={receiptViewer.isOpen} onOpenChange={(open) => {
        if (!open) {
          setReceiptViewer({ isOpen: false, imageUrl: '' });
        }
      }}>
        <DialogContent className="w-[calc(100vw-2rem)] sm:max-w-2xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Payment Receipt</DialogTitle>
            <DialogDescription>
              View payment receipt screenshot
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center items-center p-4 bg-muted/30 rounded-lg overflow-auto max-h-[60vh]">
            {receiptViewer.imageUrl ? (
              <img
                src={receiptViewer.imageUrl.startsWith('http') ? receiptViewer.imageUrl : `${window.location.origin}${receiptViewer.imageUrl}`}
                alt="Payment Receipt"
                className="max-w-full max-h-full rounded-lg"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/placeholder-receipt.png';
                }}
              />
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <PhotoIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Receipt not available</p>
            </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setReceiptViewer({ isOpen: false, imageUrl: '' })}
            >
              Close
            </Button>
            {receiptViewer.imageUrl && (
            <Button
                onClick={() => {
                  const link = document.createElement('a');
                  link.href = receiptViewer.imageUrl.startsWith('http') ? receiptViewer.imageUrl : `${window.location.origin}${receiptViewer.imageUrl}`;
                  link.download = `receipt-${Date.now()}.jpg`;
                  link.target = '_blank';
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                }}
              >
                <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                Download
            </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PaymentRequests;


