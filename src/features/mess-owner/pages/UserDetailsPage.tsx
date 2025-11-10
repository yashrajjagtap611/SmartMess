import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { SideNavigation, BottomNavigation } from '@/components/common/Navbar/CommonNavbar';
import { useTheme } from "@/components/theme/theme-provider";
import { handleLogout as logoutUtil } from "@/utils/logout";
import { CommonHeader } from '@/components/common/Header/CommonHeader';
import { useUser } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  UserIcon, 
  CalendarIcon, 
  DocumentTextIcon,
  ClockIcon,
  CheckCircleIcon,
  XMarkIcon,
  ArrowLeftIcon,
  PhoneIcon,
  EnvelopeIcon,
  CreditCardIcon,
  ArrowDownTrayIcon,
  TrashIcon,
  PhotoIcon,
  CurrencyDollarIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';
import messService from '@/services/api/messService';
import { leaveManagementAPI } from '@/features/mess-owner/components/LeaveManagement/apiService';
import { billingService } from '@/services/api/billingService';
import { useToast } from '@/hooks/use-toast';
import { formatDisplayDate } from '@/utils/dateUtils';
import { formatNotificationTime } from '@/shared/notifications/utils';
import { ROUTES } from '@/constants/routes';
import type { LeaveRequest } from '@/features/mess-owner/components/LeaveManagement/LeaveManagement.types';
import { formatDate, getStatusColor, getStatusBadge } from '@/features/mess-owner/components/LeaveManagement/LeaveManagement.utils';
import { User as UserIconLucide, Calendar as CalendarIconLucide, Clock as ClockIconLucide } from 'lucide-react';

interface UserDetails {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  isActive: boolean;
  overallPaymentStatus: string;
  totalPlans: number;
  activePlans: number;
  paidPlans: number;
  pendingPlans: number;
  overduePlans: number;
  mealPlanDetails: Array<{
    id: string;
    mealPlanId?: string;
    name?: string;
    mealPlanName?: string;
    description?: string;
    mealPlanDescription?: string;
    pricing?: {
      amount: number;
      period: string;
    };
    status: string;
    paymentStatus: string;
    paymentAmount?: number;
    dueDate?: string;
    autoRenewal?: boolean;
    joinDate?: string;
    subscriptionStartDate?: string;
    subscriptionEndDate?: string;
    lastPaymentDate?: string;
    nextPaymentDate?: string;
  }>;
  paymentHistory: Array<any>;
  joinDate?: string;
  lastActive?: string;
}

interface PaymentRequest {
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
}

const UserDetailsPage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const { isDarkTheme: isDarkMode, toggleTheme: toggleDarkMode } = useTheme();
  const { user } = useUser();
  const { toast } = useToast();

  // Check if user came from billing section
  const fromBilling = location.state?.from === 'billing' || location.state?.fromBilling === true;
  
  // Check if user came from chat (preserve chat context)
  // Check both location state and URL params for reliability
  const returnTo = (location.state?.returnTo as string | undefined) || searchParams.get('returnTo') || undefined;
  const roomId = (location.state?.roomId as string | undefined) || searchParams.get('roomId') || undefined;

  // Get active tab from URL, default to 'info'
  const activeTab = searchParams.get('tab') || 'info';
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [leavesLoading, setLeavesLoading] = useState(false);
  const [leavesFetched, setLeavesFetched] = useState(false);
  const [paymentRequests, setPaymentRequests] = useState<PaymentRequest[]>([]);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentFetched, setPaymentFetched] = useState(false);
  const [paymentLoadingStates, setPaymentLoadingStates] = useState<Record<string, 'approve' | 'reject' | null>>({});
  const [receiptViewer, setReceiptViewer] = useState<{ isOpen: boolean; imageUrl: string }>({
    isOpen: false,
    imageUrl: ''
  });
  const [actionLoading, setActionLoading] = useState(false);
  const [showRemoveDialog, setShowRemoveDialog] = useState(false);
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [planStatusLoading, setPlanStatusLoading] = useState<Record<string, boolean>>({});

  // Handle tab change - update URL
  const handleTabChange = (newTab: string) => {
    setSearchParams({ tab: newTab });
  };

  // Fetch user details (always needed)
  useEffect(() => {
    if (!userId) {
      setError('User ID is required');
      setLoading(false);
      return;
    }

    const fetchUserDetails = async () => {
      setLoading(true);
      setError(null);

      try {
        const userResponse = await messService.getUserDetails(userId);
        if (userResponse.success && userResponse.data) {
          setUserDetails(userResponse.data);
        } else {
          throw new Error(userResponse.message || 'Failed to load user details');
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load user details');
        toast({
          title: 'Error',
          description: err.message || 'Failed to load user details',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUserDetails();
  }, [userId, toast]);

  // Fetch leaves only when leaves tab is active and not already fetched
  useEffect(() => {
    if (!userId || activeTab !== 'leaves' || leavesFetched) return;

    const fetchLeaves = async () => {
      setLeavesLoading(true);
      try {
        let allLeaves: any[] = [];
        let currentPage = 1;
        let totalPages = 1;
        let hasMore = true;
        const maxPages = 100; // Increased limit to handle large datasets
        
        console.log('Starting to fetch leaves for userId:', userId);
        
        while (hasMore && currentPage <= maxPages) {
          // Use higher limit (50) to reduce API calls
          const leaveResponse = await leaveManagementAPI.getLeaveRequests(currentPage, {}, 50);
          
          if (leaveResponse.success && leaveResponse.data?.leaveRequests) {
            const pageLeaves = leaveResponse.data.leaveRequests || [];
            allLeaves = [...allLeaves, ...pageLeaves];
            
            const pagination = leaveResponse.data.pagination;
            if (pagination) {
              totalPages = pagination.pages || 1;
              console.log(`Fetched page ${currentPage}/${totalPages}, got ${pageLeaves.length} leaves, total so far: ${allLeaves.length}`);
              
              // Check if there are more pages to fetch
              if (currentPage < totalPages) {
                currentPage++;
              } else {
                hasMore = false;
              }
            } else {
              // No pagination info, assume no more pages
              hasMore = false;
            }
          } else {
            console.warn('Leave response not successful or no data:', leaveResponse);
            hasMore = false;
          }
        }
        
        console.log(`Total leaves fetched: ${allLeaves.length} from ${currentPage - 1} pages`);
        
        const userLeaves = allLeaves.filter((leave: any) => {
          if (!leave || !leave.userId) return false;
          
          let leaveUserId: string | null = null;
          if (typeof leave.userId === 'string') {
            leaveUserId = leave.userId;
          } else if (leave.userId._id) {
            leaveUserId = String(leave.userId._id);
          } else if (leave.userId.id) {
            leaveUserId = String(leave.userId.id);
          } else if (typeof leave.userId === 'object' && leave.userId.toString) {
            leaveUserId = String(leave.userId);
          }
          
          if (!leaveUserId) return false;
          const matches = String(leaveUserId).trim() === String(userId).trim();
          return matches;
        });
        
        console.log(`Filtered user leaves: ${userLeaves.length} out of ${allLeaves.length} total leaves`);
        console.log('Sample leave userId structure:', allLeaves[0]?.userId);
        
        setLeaves(userLeaves);
        setLeavesFetched(true);
      } catch (leaveError) {
        console.error('Error fetching leaves:', leaveError);
        toast({
          title: 'Warning',
          description: 'Failed to load leave requests. Please try refreshing.',
          variant: 'default',
        });
        setLeaves([]);
      } finally {
        setLeavesLoading(false);
      }
    };

    fetchLeaves();
  }, [userId, activeTab, leavesFetched, toast]);

  // Fetch payment requests only when payments tab is active and not already fetched
  useEffect(() => {
    if (!userId || activeTab !== 'payments' || paymentFetched) return;

    const fetchPaymentRequests = async () => {
      setPaymentLoading(true);
      try {
        const messProfile = await messService.getMessDetails();
        if (!messProfile.success || !messProfile.data) {
          setPaymentRequests([]);
          return;
        }
        
        const messId = messProfile.data.messId || messProfile.data._id;
        if (!messId) {
          setPaymentRequests([]);
          return;
        }

        const billingResponse = await billingService.getMessOwnerBillingData(messId);
        
        if (!billingResponse.success || !billingResponse.data) {
          setPaymentRequests([]);
          return;
        }

        const userMemberships = (billingResponse.data.members || []).filter((m: any) => {
          return String(m.userId || '').trim() === String(userId || '').trim();
        });
        
        const membershipIds = userMemberships.map((m: any) => String(m.membershipId || '').trim()).filter(Boolean);
        const allPaymentRequests = billingResponse.data.paymentRequests || [];
        
        const userPaymentRequests = allPaymentRequests.filter((req: any) => {
          const reqUserId = req.userId ? String(req.userId).trim() : '';
          const reqMembershipId = req.membershipId ? String(req.membershipId).trim() : '';
          const reqRequestId = req.requestId ? String(req.requestId).trim() : '';
          const reqId = req.id ? String(req.id).trim() : '';
          const targetUserId = String(userId || '').trim();
          
          const userIdMatch = reqUserId && reqUserId === targetUserId;
          const membershipMatch = reqMembershipId && membershipIds.length > 0 && membershipIds.includes(reqMembershipId);
          const requestIdMatch = (reqRequestId || reqId) && membershipIds.length > 0 && membershipIds.includes(reqRequestId || reqId);
          
          return userIdMatch || membershipMatch || requestIdMatch;
        });
        
        const mappedRequests = userPaymentRequests.map((r: any) => ({
          requestId: r.id || r.requestId || r.membershipId || '',
          membershipId: r.membershipId || '',
          userName: r.userName || 'Unknown User',
          amount: r.amount || 0,
          status: r.status === 'sent' ? 'pending_verification' : (r.status || 'pending_verification'),
          paymentMethod: r.paymentMethod || 'online',
          requestedAt: r.requestedAt || r.submittedAt || r.createdAt || new Date().toISOString(),
          updatedAt: r.updatedAt,
          approvedAt: r.approvedAt,
          rejectedAt: r.rejectedAt,
          userEmail: r.userEmail || '',
          userPhone: r.userPhone || '',
          planName: r.planName || 'Unknown Plan',
          paymentScreenshot: r.paymentScreenshot || r.receiptUrl || null,
          receiptUrl: r.receiptUrl || r.paymentScreenshot || null,
          transactionId: r.transactionId || null
        }));
        
        setPaymentRequests(mappedRequests);
        setPaymentFetched(true);
      } catch (paymentError: any) {
        console.error('Error fetching payment requests:', paymentError);
        toast({
          title: 'Warning',
          description: 'Failed to load payment requests. Please try refreshing.',
          variant: 'default',
        });
        setPaymentRequests([]);
      } finally {
        setPaymentLoading(false);
      }
    };

    fetchPaymentRequests();
  }, [userId, activeTab, paymentFetched, toast]);

  const handleLogout = () => {
    logoutUtil(window.location.href);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusBadgeColor = (status: string) => {
    const statusLower = status.toLowerCase();
    if (statusLower === 'approved' || statusLower === 'paid' || statusLower === 'active') {
      return 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400';
    }
    if (statusLower === 'pending' || statusLower === 'pending_verification' || statusLower === 'sent') {
      return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400';
    }
    if (statusLower === 'rejected' || statusLower === 'overdue' || statusLower === 'failed') {
      return 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400';
    }
    return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400';
  };

  const getStatusIcon = (status: string) => {
    const statusLower = status.toLowerCase();
    if (statusLower === 'approved' || statusLower === 'paid' || statusLower === 'active') {
      return CheckCircleIcon;
    }
    if (statusLower === 'pending' || statusLower === 'pending_verification' || statusLower === 'sent') {
      return ClockIcon;
    }
    if (statusLower === 'rejected' || statusLower === 'overdue' || statusLower === 'failed') {
      return XMarkIcon;
    }
    return DocumentTextIcon;
  };

  const handleViewLeave = (leave: LeaveRequest) => {
    const leaveId = (leave as any)._id || (leave as any).id;
    if (leaveId) {
      navigate(ROUTES.MESS_OWNER.LEAVE_DETAILS.replace(':leaveId', String(leaveId)));
    }
  };

  const handleViewPaymentRequest = (request: PaymentRequest) => {
    navigate(ROUTES.MESS_OWNER.PAYMENT_VERIFICATION_DETAIL.replace(':requestId', request.requestId || request.membershipId), {
      state: { request }
    });
  };


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
    return {
      icon: DocumentTextIcon,
      bgColor: 'bg-gray-100 dark:bg-gray-800',
      iconColor: 'text-gray-400'
    };
  };

  const getRequestMessage = (request: PaymentRequest) => {
    const statusLower = request.status.toLowerCase();
    if (statusLower === 'rejected') {
      return 'Request rejected';
    }
    if (statusLower === 'cancelled') {
      return 'Request cancelled by user';
    }
    return `${request.userName} wants to pay ${formatCurrency(request.amount)}`;
  };

  const handleApprovePayment = async (request: PaymentRequest) => {
    const requestId = request.requestId || request.membershipId;
    setPaymentLoadingStates(prev => ({ ...prev, [requestId]: 'approve' }));
    
    try {
      const result = await billingService.approvePaymentRequest(request.membershipId, request.paymentMethod);
      if (result.success) {
        toast({
          title: 'Payment Request Approved',
          description: result.message || 'The payment request has been approved successfully',
          variant: 'success',
        });
        // Refresh payment requests
        const messProfile = await messService.getMessDetails();
        if (messProfile.success && messProfile.data?.messId) {
          const billingResponse = await billingService.getMessOwnerBillingData(messProfile.data.messId);
          if (billingResponse.success && billingResponse.data?.paymentRequests) {
            const userPaymentRequests = billingResponse.data.paymentRequests.filter((req: any) => {
              const reqUserId = req.userId || req.membershipId;
              return String(reqUserId) === String(userId);
            });
            setPaymentRequests(userPaymentRequests);
          }
        }
      } else {
        toast({
          title: 'Approval Failed',
          description: result.message || 'Failed to approve payment request',
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      console.error('Approve error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to approve payment request',
        variant: 'destructive',
      });
    } finally {
      setPaymentLoadingStates(prev => ({ ...prev, [requestId]: null }));
    }
  };

  const handleRejectPayment = async (request: PaymentRequest) => {
    const requestId = request.requestId || request.membershipId;
    setPaymentLoadingStates(prev => ({ ...prev, [requestId]: 'reject' }));
    
    try {
      const result = await billingService.rejectPaymentRequest(request.membershipId);
      if (result.success) {
        toast({
          title: 'Payment Request Rejected',
          description: result.message || 'The payment request has been rejected',
          variant: 'default',
        });
        // Refresh payment requests
        const messProfile = await messService.getMessDetails();
        if (messProfile.success && messProfile.data?.messId) {
          const billingResponse = await billingService.getMessOwnerBillingData(messProfile.data.messId);
          if (billingResponse.success && billingResponse.data?.paymentRequests) {
            const userPaymentRequests = billingResponse.data.paymentRequests.filter((req: any) => {
              const reqUserId = req.userId || req.membershipId;
              return String(reqUserId) === String(userId);
            });
            setPaymentRequests(userPaymentRequests);
          }
        }
      } else {
        toast({
          title: 'Rejection Failed',
          description: result.message || 'Failed to reject payment request',
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      console.error('Reject error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to reject payment request',
        variant: 'destructive',
      });
    } finally {
      setPaymentLoadingStates(prev => ({ ...prev, [requestId]: null }));
    }
  };

  // Handle user status update (activate/deactivate)
  const handleUpdateUserStatus = async () => {
    if (!userId || !userDetails) return;
    
    setActionLoading(true);
    try {
      const newStatus = !userDetails.isActive;
      const result = await messService.updateUserStatus(userId, newStatus);
      
      if (result.success) {
        setUserDetails(prev => prev ? { ...prev, isActive: newStatus } : null);
        toast({
          title: 'User Status Updated',
          description: `User has been ${newStatus ? 'activated' : 'deactivated'} successfully`,
          variant: 'success',
        });
        setShowStatusDialog(false);
      } else {
        throw new Error(result.message || 'Failed to update user status');
      }
    } catch (error: any) {
      console.error('Error updating user status:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to update user status',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(false);
    }
  };

  // Handle remove user
  const handleRemoveUser = async () => {
    if (!userId) return;
    
    setActionLoading(true);
    try {
      const result = await messService.removeUser(userId);
      
      if (result.success) {
        toast({
          title: 'User Removed',
          description: 'User has been removed from the mess successfully',
          variant: 'success',
        });
        // Navigate back to user management page
        setTimeout(() => {
          navigate(ROUTES.MESS_OWNER.USERS);
        }, 1500);
      } else {
        throw new Error(result.message || 'Failed to remove user');
      }
    } catch (error: any) {
      console.error('Error removing user:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to remove user',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(false);
      setShowRemoveDialog(false);
    }
  };

  // Handle update plan payment status
  const handleUpdatePlanPaymentStatus = async (membershipId: string, newStatus: string) => {
    setPlanStatusLoading(prev => ({ ...prev, [membershipId]: true }));
    try {
      const result = await billingService.updateBillingStatus(membershipId, newStatus);
      
      if (result.success) {
        // Refresh user details to get updated data
        const userResponse = await messService.getUserDetails(userId!);
        if (userResponse.success && userResponse.data) {
          setUserDetails(userResponse.data);
        }
        toast({
          title: 'Payment Status Updated',
          description: `Payment status updated to ${newStatus} successfully`,
          variant: 'success',
        });
      } else {
        throw new Error(result.message || 'Failed to update payment status');
      }
    } catch (error: any) {
      console.error('Error updating payment status:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to update payment status',
        variant: 'destructive',
      });
    } finally {
      setPlanStatusLoading(prev => ({ ...prev, [membershipId]: false }));
    }
  };


  const getImageUrl = (url: string | null | undefined): string => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    if (url.startsWith('/uploads')) {
      return `${window.location.origin}/api${url}`;
    }
    return `${window.location.origin}${url}`;
  };

  const getAvatarUrl = (avatar: string | null | undefined): string => {
    if (!avatar) return '';
    return getImageUrl(avatar);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 transition-all duration-300">
        <SideNavigation
          isDarkMode={isDarkMode}
          toggleDarkMode={toggleDarkMode}
          handleLogout={handleLogout}
        />
        <div className="flex-1">
          <CommonHeader
            title="User Details"
            subtitle="Loading user information..."
            {...(user && {
              user: {
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
                email: user.email
              }
            })}
            showUserProfile={true}
            onUserProfileClick={() => {}}
            variant="settings"
          />
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading user details...</p>
            </div>
          </div>
        </div>
        <BottomNavigation
          isDarkMode={isDarkMode}
          toggleDarkMode={toggleDarkMode}
          handleLogout={handleLogout}
        />
      </div>
    );
  }

  if (error || !userDetails) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 transition-all duration-300">
        <SideNavigation
          isDarkMode={isDarkMode}
          toggleDarkMode={toggleDarkMode}
          handleLogout={handleLogout}
        />
        <div className="flex-1">
          <CommonHeader
            title="User Details"
            subtitle="Error loading user information"
            {...(user && {
              user: {
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
                email: user.email
              }
            })}
            showUserProfile={true}
            onUserProfileClick={() => {}}
            variant="settings"
          />
          <div className="flex items-center justify-center min-h-[60vh] p-4">
            <div className="text-center">
              <XMarkIcon className="h-12 w-12 text-destructive mx-auto mb-4" />
              <p className="text-destructive mb-4">{error || 'User not found'}</p>
              <Button onClick={() => navigate(-1)} variant="outline">
                <ArrowLeftIcon className="h-4 w-4 mr-2" />
                Go Back
              </Button>
            </div>
          </div>
        </div>
        <BottomNavigation
          isDarkMode={isDarkMode}
          toggleDarkMode={toggleDarkMode}
          handleLogout={handleLogout}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 transition-all duration-300">
      <SideNavigation
        isDarkMode={isDarkMode}
        toggleDarkMode={toggleDarkMode}
        handleLogout={handleLogout}
      />
      <div className="flex-1">
        <CommonHeader
          title="User Details"
          subtitle={`Complete information for ${userDetails.name}`}
          {...(user && {
            user: {
              firstName: user.firstName,
              lastName: user.lastName,
              role: user.role,
              email: user.email
            }
          })}
          showUserProfile={true}
          onUserProfileClick={() => {}}
          variant="settings"
          onBack={() => {
            // If we came from chat, return to chat with roomId preserved
            if (returnTo || roomId) {
              // Decode the return path if it exists, default to chat route
              const basePath = returnTo ? decodeURIComponent(returnTo) : ROUTES.MESS_OWNER.CHAT;
              
              // Extract just the pathname (remove query params from returnTo)
              const pathname = basePath.split('?')[0] || ROUTES.MESS_OWNER.CHAT;
              
              // Build the return path with roomId
              if (roomId) {
                const returnPath = `${pathname}?roomId=${roomId}`;
                console.log('🔙 Navigating back to chat:', returnPath, 'with roomId:', roomId);
                navigate(returnPath);
              } else {
                console.log('🔙 Navigating back to chat:', pathname);
                navigate(pathname);
              }
            } else if (fromBilling) {
              navigate(ROUTES.MESS_OWNER.BILLING);
            } else {
              navigate(ROUTES.MESS_OWNER.USERS);
            }
          }}
        >
          <button
            onClick={() => navigate(`${ROUTES.MESS_OWNER.CHAT}?userId=${userId}`)}
            className="p-2 rounded-lg hover:bg-muted transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
            aria-label="Chat with user"
            title="Chat with user"
          >
            <ChatBubbleLeftRightIcon className="w-5 h-5" />
          </button>
        </CommonHeader>
        
        {/* User Profile Section */}
        <div className="p-4 sm:p-6 pb-0 max-w-7xl mx-auto">
          <Card className="rounded-xl border border-border bg-gradient-to-r from-primary/10 via-primary/5 to-background transition-all hover:shadow-md">
            <CardContent>
              <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
                {/* Profile Photo */}
                <div className="relative">
                  {userDetails.avatar ? (
                    <img
                      src={getAvatarUrl(userDetails.avatar)}
                      alt={userDetails.name}
                      className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border-4 border-primary/20 shadow-lg"
                      onError={(e) => {
                        // Fallback to initials if image fails to load
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const parent = target.parentElement;
                        if (parent && !parent.querySelector('.avatar-fallback')) {
                          const fallback = document.createElement('div');
                          fallback.className = 'avatar-fallback w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-primary/20 flex items-center justify-center text-primary text-2xl sm:text-3xl font-bold border-4 border-primary/20 shadow-lg';
                          fallback.textContent = userDetails.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
                          parent.appendChild(fallback);
                        }
                      }}
                    />
                  ) : (
                    <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-primary/20 flex items-center justify-center text-primary text-2xl sm:text-3xl font-bold border-4 border-primary/20 shadow-lg">
                      {userDetails.name.split(' ').map(n => n[0]).filter(Boolean).join('').toUpperCase().slice(0, 2) || 'U'}
                    </div>
                  )}
                  {userDetails.isActive && (
                    <div className="absolute bottom-0 right-0 sm:bottom-2 sm:right-2 w-5 h-5 sm:w-6 sm:h-6 bg-green-500 border-2 border-background rounded-full shadow-md"></div>
                  )}
                </div>
                
                {/* User Name and Info */}
                <div className="flex-1 text-center sm:text-left">
                  <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
                    {userDetails.name}
                  </h2>
                  <div className="flex flex-col sm:flex-row items-center sm:items-center gap-2 sm:gap-4 text-sm text-muted-foreground mb-3">
                      {userDetails.email && (
                        <div className="flex items-center gap-2">
                          <EnvelopeIcon className="h-4 w-4" />
                          <span>{userDetails.email}</span>
                        </div>
                      )}
                      {userDetails.phone && (
                        <div className="flex items-center gap-2">
                          <PhoneIcon className="h-4 w-4" />
                          <span>{userDetails.phone}</span>
                        </div>
                      )}
                    </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      onClick={() => setShowStatusDialog(true)}
                      disabled={actionLoading}
                      variant={userDetails.isActive ? "outline" : "default"}
                      className="w-full"
                    >
                      {userDetails.isActive ? 'Deactivate' : 'Activate'}
                    </Button>
                    <Button
                      onClick={() => setShowRemoveDialog(true)}
                      disabled={actionLoading}
                      variant="destructive"
                      className="w-full"
                    >
                      Remove User
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="p-4 sm:p-6 pb-[72px] sm:pb-6 lg:pb-4 max-w-7xl mx-auto">
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-6 bg-muted/50 p-1 rounded-lg">
              <TabsTrigger 
                value="info"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm transition-all duration-200 rounded-md"
              >
                Info
              </TabsTrigger>
              <TabsTrigger 
                value="plans"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm transition-all duration-200 rounded-md"
              >
                Plans
              </TabsTrigger>
              <TabsTrigger 
                value="leaves"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm transition-all duration-200 rounded-md"
              >
                Leaves
              </TabsTrigger>
              <TabsTrigger 
                value="payments"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm transition-all duration-200 rounded-md"
              >
                Payments
              </TabsTrigger>
            </TabsList>

            {/* Info Tab */}
            <TabsContent value="info" className="space-y-4">
              <Card className="rounded-xl border border-border bg-card transition-all hover:shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <UserIcon className="h-5 w-5 text-primary" />
                    User Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Name and Email - Single Column */}
                  <div className="space-y-4">
                    <div>
                      <span className="text-sm text-muted-foreground">Name:</span>
                      <p className="text-base font-semibold text-foreground">{userDetails.name}</p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Email:</span>
                      <p className="text-base text-foreground flex items-center gap-2">
                        <EnvelopeIcon className="h-4 w-4" />
                        {userDetails.email}
                      </p>
                    </div>
                  </div>

                  {/* Phone, Status, Join Date, Last Active - Two Columns */}
                  <div className="grid grid-cols-2 gap-4">
                    {userDetails.phone && (
                      <div>
                        <span className="text-sm text-muted-foreground">Phone:</span>
                        <p className="text-base text-foreground flex items-center gap-2">
                          <PhoneIcon className="h-4 w-4" />
                          {userDetails.phone}
                        </p>
                      </div>
                    )}
                    <div>
                      <span className="text-sm text-muted-foreground">Status:</span>
                      <div className="mt-1">
                        <Badge className={getStatusBadgeColor(userDetails.isActive ? 'active' : 'inactive')}>
                          {userDetails.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                    </div>
                    {userDetails.joinDate && (
                      <div>
                        <span className="text-sm text-muted-foreground">Join Date:</span>
                        <p className="text-base text-foreground">{formatDisplayDate(new Date(userDetails.joinDate))}</p>
                      </div>
                    )}
                    {userDetails.lastActive && (
                      <div>
                        <span className="text-sm text-muted-foreground">Last Active:</span>
                        <p className="text-base text-foreground">{formatDisplayDate(new Date(userDetails.lastActive))}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Plans Tab */}
            <TabsContent value="plans" className="space-y-4">
              {userDetails.mealPlanDetails && userDetails.mealPlanDetails.length > 0 ? (
                userDetails.mealPlanDetails.map((plan) => {
                  const StatusIcon = getStatusIcon(plan.status);
                  const planName = plan.name || plan.mealPlanName || 'No Plan';
                  const planDescription = plan.description || plan.mealPlanDescription;
                  
                  return (
                    <Card key={plan.id} className="rounded-xl border border-border  bg-card transition-all hover:shadow-md">
                      <CardHeader className="pb-4">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary/10 rounded-lg">
                              <CreditCardIcon className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <CardTitle className="text-lg sm:text-xl">{planName}</CardTitle>
                              {plan.mealPlanId && (
                                <p className="text-xs text-muted-foreground mt-1">Plan ID: {plan.mealPlanId}</p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={getStatusBadgeColor(plan.status)}>
                              <StatusIcon className="h-3 w-3 mr-1" />
                              {plan.status}
                            </Badge>
                            <Badge className={getStatusBadgeColor(plan.paymentStatus)}>
                              {plan.paymentStatus}
                            </Badge>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {/* Description - Full Width */}
                        {planDescription && (
                          <div className="p-2.5 bg-muted/30 rounded-lg border border-border">
                            <p className="text-xs text-foreground line-clamp-2">{planDescription}</p>
                          </div>
                        )}

                        {/* Pricing Information - Two Columns */}
                        <div className="grid grid-cols-2 gap-3">
                          {plan.pricing && (
                            <div className="p-3 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg border border-primary/20">
                              <div className="flex items-center gap-1.5 mb-1.5">
                                <CurrencyDollarIcon className="h-3.5 w-3.5 text-primary" />
                                <span className="text-xs font-semibold text-muted-foreground uppercase">Price</span>
                              </div>
                              <p className="text-lg font-bold text-foreground">
                                {formatCurrency(plan.pricing.amount)}
                              </p>
                              <p className="text-xs text-muted-foreground">per {plan.pricing.period}</p>
                            </div>
                          )}
                          {plan.paymentAmount && (
                            <div className="p-3 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-900/10 rounded-lg border border-blue-200 dark:border-blue-800">
                              <div className="flex items-center gap-1.5 mb-1.5">
                                <CreditCardIcon className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                                <span className="text-xs font-semibold text-muted-foreground uppercase">Payment</span>
                              </div>
                              <p className="text-lg font-bold text-foreground">
                                {formatCurrency(plan.paymentAmount)}
                              </p>
                            </div>
                          )}
                        </div>

                        {/* All Dates in Two Column Grid */}
                        <div className="grid grid-cols-2 gap-2">
                          {plan.joinDate && (
                            <div className="flex items-center justify-between p-2 bg-muted/30 rounded-lg">
                              <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                                <ClockIcon className="h-3.5 w-3.5" />
                                Join:
                              </span>
                              <span className="text-xs font-medium text-foreground">{formatDisplayDate(new Date(plan.joinDate))}</span>
                            </div>
                          )}
                          {plan.subscriptionStartDate && (
                            <div className="flex items-center justify-between p-2 bg-muted/30 rounded-lg">
                              <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                                <CalendarIcon className="h-3.5 w-3.5" />
                                Start:
                              </span>
                              <span className="text-xs font-medium text-foreground">{formatDisplayDate(new Date(plan.subscriptionStartDate))}</span>
                            </div>
                          )}
                          {plan.subscriptionEndDate && (
                            <div className="flex items-center justify-between p-2 bg-muted/30 rounded-lg">
                              <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                                <CalendarIcon className="h-3.5 w-3.5" />
                                End:
                              </span>
                              <span className="text-xs font-medium text-foreground">{formatDisplayDate(new Date(plan.subscriptionEndDate))}</span>
                            </div>
                          )}
                          {plan.dueDate && (
                            <div className="flex items-center justify-between p-2 bg-muted/30 rounded-lg">
                              <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                                <ClockIcon className="h-3.5 w-3.5" />
                                Due:
                              </span>
                              <span className="text-xs font-medium text-foreground">{formatDisplayDate(new Date(plan.dueDate))}</span>
                            </div>
                          )}
                          {plan.lastPaymentDate && (
                            <div className="flex items-center justify-between p-2 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                              <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                                <CheckCircleIcon className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
                                Last Payment:
                              </span>
                              <span className="text-xs font-medium text-foreground">{formatDisplayDate(new Date(plan.lastPaymentDate))}</span>
                            </div>
                          )}
                          {plan.nextPaymentDate && (
                            <div className="flex items-center justify-between p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                              <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                                <ClockIcon className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                                Next Payment:
                              </span>
                              <span className="text-xs font-medium text-foreground">{formatDisplayDate(new Date(plan.nextPaymentDate))}</span>
                            </div>
                          )}
                          {plan.autoRenewal !== undefined && (
                            <div className="flex items-center justify-between p-2 bg-muted/30 rounded-lg">
                              <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                                <DocumentTextIcon className="h-3.5 w-3.5" />
                                Auto Renewal:
                              </span>
                              <Badge className={plan.autoRenewal ? 'bg-green-500/20 text-green-700 dark:text-green-400 text-xs' : 'bg-gray-500/20 text-gray-700 dark:text-gray-400 text-xs'}>
                                {plan.autoRenewal ? 'Enabled' : 'Disabled'}
                              </Badge>
                            </div>
                          )}
                        </div>

                        {/* Bottom Row: Membership ID and Payment Status Update - Two Columns */}
                        <div className="grid grid-cols-2 gap-3">
                          <div className="flex flex-col p-2 bg-muted/30 rounded-lg">
                            <span className="text-xs text-muted-foreground mb-1">Membership ID:</span>
                            <span className="text-xs font-mono text-foreground break-all">{plan.id || 'N/A'}</span>
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-xs font-medium text-muted-foreground">Update Payment Status</label>
                            <Select
                              value={plan.paymentStatus.toLowerCase()}
                              onValueChange={(value) => handleUpdatePlanPaymentStatus(plan.id, value)}
                              disabled={!!planStatusLoading[plan.id]}
                            >
                              <SelectTrigger className="w-full h-8 text-xs">
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="paid">Paid</SelectItem>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="overdue">Overdue</SelectItem>
                                <SelectItem value="failed">Failed</SelectItem>
                                <SelectItem value="refunded">Refunded</SelectItem>
                              </SelectContent>
                            </Select>
                            {planStatusLoading[plan.id] && (
                              <p className="text-xs text-muted-foreground">Updating...</p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              ) : (
                <Card className="rounded-xl border border-border bg-card transition-all hover:shadow-md">
                  <CardContent className="py-12 text-center">
                    <CreditCardIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                    <p className="text-muted-foreground">No meal plans found</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Leaves Tab */}
            <TabsContent value="leaves" className="space-y-4">
              {leavesLoading ? (
                <Card className="rounded-xl border border-border bg-card transition-all hover:shadow-md">
                  <CardContent className="py-12 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading leave requests...</p>
                  </CardContent>
                </Card>
              ) : leaves.length > 0 ? (
                leaves.map((leave) => {
                  const user = leave.userId as any;
                  const leaveId = (leave as any)._id || (leave as any).id || String(Math.random());
                  const isAutoApproved = leave.status === 'approved' && !leave.approvedBy;
                  const totalMealsMissed = (leave as any).totalMealsMissed ?? 0;
                  
                  return (
                    <div
                      key={leaveId}
                      className="rounded-xl border border-border bg-card transition-all hover:shadow-md cursor-pointer p-4 sm:p-5"
                      role="button"
                      tabIndex={0}
                      aria-label="Open leave request details"
                      onClick={() => handleViewLeave(leave)}
                      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleViewLeave(leave); } }}
                    >
                      {/* Header: Status, Name */}
                      <div className="flex items-start justify-between mb-4 pb-4 border-b border-border">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            {(() => {
                              const label = isAutoApproved ? 'Auto-approved' : getStatusBadge(leave.status);
                              return (
                                <div className={`px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusColor(leave.status)}`}>
                                  {label}
                                </div>
                              );
                            })()}
                            <div className="flex items-center gap-1.5 text-gray-700 dark:text-gray-300">
                              <UserIconLucide className="h-4 w-4" />
                              <span className="text-sm font-medium">
                                {user?.firstName} {user?.lastName}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <CalendarIconLucide className="h-4 w-4" />
                            <span>{formatDate(leave.startDate)} - {formatDate(leave.endDate)}</span>
                            <span className="px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-xs font-medium">
                              {leave.totalDays} {leave.totalDays === 1 ? 'day' : 'days'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Meal Plans and Meals Missed */}
                      <div className="mb-3">
                        <div className="grid grid-cols-2 gap-4">
                          {/* Meal Plans */}
                          <div>
                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">MEAL PLANS</p>
                            {Array.isArray(leave.mealPlanIds) && leave.mealPlanIds.length > 0 ? (
                              <div className="flex flex-wrap gap-2">
                                {leave.mealPlanIds.map((plan: any, i: number) => {
                                  const name = plan?.name || plan?.planName || `Plan ${i + 1}`;
                                  const mo = plan?.mealOptions || {};
                                  const tags = [mo.breakfast && 'B', mo.lunch && 'L', mo.dinner && 'D'].filter(Boolean).join('/');
                                  return (
                                    <span key={i} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                                      <span>{name}</span>
                                      {tags && <span className="text-blue-500 dark:text-blue-400">({tags})</span>}
                                    </span>
                                  );
                                })}
                              </div>
                            ) : (
                              <p className="text-sm text-gray-400 dark:text-gray-500">No plans</p>
                            )}
                          </div>
                          
                          {/* Meals Missed */}
                          <div>
                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">MEALS MISSED</p>
                            <div>
                              <p className="text-xl font-bold text-gray-900 dark:text-gray-100">{totalMealsMissed}</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Reason */}
                      {leave.reason && (
                        <div className="mb-3">
                          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">REASON</p>
                          <p className="text-sm text-gray-900 dark:text-gray-100 line-clamp-2">{leave.reason}</p>
                        </div>
                      )}

                      {/* Extension Requests */}
                      {leave.extensionRequests && leave.extensionRequests.length > 0 && (
                        <div className="mb-3">
                          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">EXTENSION REQUESTS</p>
                          <div className="space-y-2">
                            {leave.extensionRequests.map((extension: any) => (
                              <div key={extension._id} className="flex items-center gap-2 p-2 bg-yellow-50 dark:bg-yellow-900/30 rounded-lg border border-yellow-200 dark:border-yellow-800">
                                <ClockIconLucide className="h-4 w-4 text-yellow-600 dark:text-yellow-400 flex-shrink-0" />
                                <span className="text-sm text-gray-900 dark:text-gray-100 flex-1">
                                  {formatDate(extension.originalEndDate)} → {formatDate(extension.newEndDate)}
                                </span>
                                {extension.status === 'pending' && (
                                  <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
                                    {extension.status}
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <Card className="rounded-xl border border-border bg-card transition-all hover:shadow-md">
                  <CardContent className="py-12 text-center">
                    <CalendarIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                    <p className="text-muted-foreground">No leave requests found</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Payments Tab */}
            <TabsContent value="payments" className="space-y-4">
              {paymentLoading ? (
                <Card className="rounded-xl border border-border bg-card transition-all hover:shadow-md">
                  <CardContent className="py-12 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading payment requests...</p>
                  </CardContent>
                </Card>
              ) : (
              <Card className="rounded-xl border border-border bg-card transition-all hover:shadow-md">
                <CardHeader className="pb-4">
                  <CardTitle className="text-base sm:text-lg text-foreground flex items-center gap-2">
                    <div className="p-1.5 sm:p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
                      <DocumentTextIcon className="h-4 w-4 sm:h-5 sm:w-5 text-orange-600 dark:text-orange-400" />
                    </div>
                    <span className="truncate">Payment Requests History ({paymentRequests.length})</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {paymentRequests.length > 0 ? paymentRequests.map((request) => {
                      const isPending = request.status === 'pending_verification' || request.status === 'sent';
                      const isCancelled = request.status.toLowerCase() === 'cancelled';
                      const isApproved = request.status.toLowerCase() === 'approved';
                      const isRejected = request.status.toLowerCase() === 'rejected';
                      const currentState = (paymentLoadingStates[request.requestId || request.membershipId] ?? null);
                      const isLoading = currentState === 'approve' || currentState === 'reject';
                      
                      const statusIndicator = getStatusIndicator(request.status);
                      const StatusIcon = statusIndicator.icon;
                      const requestTime = request.requestedAt ? formatNotificationTime(new Date(request.requestedAt)) : '';
                      
                      const handleCardClick = () => {
                        handleViewPaymentRequest(request);
                      };
                      
                      return (
                        <div 
                          key={request.requestId || request.membershipId} 
                          onClick={handleCardClick}
                          className="rounded-xl border border-border bg-card p-4 transition-all hover:shadow-md cursor-pointer"
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

                              {/* Action Buttons */}
                              {isPending && (
                                <div className="flex gap-2 pt-2 border-t border-border">
                                  <Button
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      handleApprovePayment(request);
                                    }}
                                    disabled={isLoading}
                                    className="flex-1 bg-green-600 hover:bg-green-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                                    size="sm"
                                    type="button"
                                  >
                                    Approve
                                  </Button>
                                  <Button
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      handleRejectPayment(request);
                                    }}
                                    disabled={isLoading}
                                    variant="destructive"
                                    size="sm"
                                    className="flex-1"
                                  >
                                    Reject
                                  </Button>
                                </div>
                              )}
                              
                              {/* Delete button for non-pending requests */}
                              {(isApproved || isRejected || isCancelled) && (
                                <div className="flex gap-2 pt-2 border-t border-border" onClick={(e) => e.stopPropagation()}>
                                  <Button
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      handleRejectPayment(request);
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
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
      <BottomNavigation
        isDarkMode={isDarkMode}
        toggleDarkMode={toggleDarkMode}
        handleLogout={handleLogout}
      />

      {/* Status Update Confirmation Dialog */}
      <AlertDialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
        <AlertDialogContent className="w-[calc(100vw-2rem)] sm:max-w-md bg-background border-2 shadow-xl">
          <AlertDialogHeader>
            <AlertDialogTitle>
              {userDetails?.isActive ? 'Deactivate User' : 'Activate User'}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm">
              Are you sure you want to <strong>{userDetails?.isActive ? 'deactivate' : 'activate'}</strong> <strong>{userDetails?.name}</strong>? 
              {userDetails?.isActive 
                ? ' The user will no longer be able to access the mess services.' 
                : ' The user will regain access to the mess services.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col-reverse sm:flex-row gap-2 sm:gap-0">
            <AlertDialogCancel 
              disabled={actionLoading}
              className="w-full sm:w-auto"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleUpdateUserStatus}
              disabled={actionLoading}
              className={`w-full sm:w-auto ${
                userDetails?.isActive 
                  ? "bg-orange-600 text-white hover:bg-orange-700 focus:ring-orange-600" 
                  : "bg-primary text-primary-foreground hover:bg-primary/90"
              }`}
            >
              {actionLoading ? 'Processing...' : (userDetails?.isActive ? 'Deactivate' : 'Activate')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Remove User Confirmation Dialog */}
      <AlertDialog open={showRemoveDialog} onOpenChange={setShowRemoveDialog}>
        <AlertDialogContent className="w-[calc(100vw-2rem)] sm:max-w-md bg-background border-2 shadow-xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Remove User</AlertDialogTitle>
            <AlertDialogDescription className="text-sm">
              Are you sure you want to remove <strong>{userDetails?.name}</strong> from the mess? This action cannot be undone and will remove all their memberships and associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col-reverse sm:flex-row gap-2 sm:gap-0">
            <AlertDialogCancel 
              disabled={actionLoading}
              className="w-full sm:w-auto"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemoveUser}
              disabled={actionLoading}
              className="w-full sm:w-auto bg-orange-600 text-white hover:bg-orange-700 focus:ring-orange-600"
            >
              {actionLoading ? 'Removing...' : 'Remove User'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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
                src={getImageUrl(receiptViewer.imageUrl)}
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
                  link.href = getImageUrl(receiptViewer.imageUrl);
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
    </div>
  );
};

export default UserDetailsPage;

