import { useState, useEffect, useCallback } from 'react';
import { useUser } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useTheme } from '@/components/theme/theme-provider';
import { authService } from '@/services/authService';
import messService from '@/services/api/messService';
import { 
  DashboardStats, 
  RecentActivity, 
  UserMessDetails, 
  AvailableMess
} from './UserDashboard.types';

export const useUserDashboard = () => {
  const { toast } = useToast();
  const { isDarkTheme, toggleTheme } = useTheme();
  
  // Use global theme instead of local state
  const isDarkMode = isDarkTheme;

  // Tab state
  const [activeMessTab, setActiveMessTab] = useState<'our_mess' | 'posted_mess'>('our_mess');

  // Data state
  const [stats, setStats] = useState<DashboardStats>({
    totalBills: 0,
    pendingBills: 0,
    paidBills: 0,
    totalAmount: 0,
    totalMesses: 0,
    totalMealPlanSubscriptions: 0,
    maxMesses: 3,
    maxMealPlanSubscriptions: 3,
    canJoinMore: true,
  });

  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [messDetails, setMessDetails] = useState<UserMessDetails | null>(null);
  const [availableMesses, setAvailableMesses] = useState<AvailableMess[]>([]);
  const [loadingMesses, setLoadingMesses] = useState(false);

  // Modal state
  const [selectedMess, setSelectedMess] = useState<AvailableMess | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Notification state
  const [unreadNotifications] = useState(0);

  // User context
  const { user } = useUser();

  // Theme toggle function - use global theme provider
  const toggleDarkMode = () => {
    toggleTheme();
  };

  // Data loading functions
  const loadUserData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Check authentication status
      // const authToken = localStorage.getItem('authToken');
      
      // Fetch user mess details from backend
      const messDetailsResponse = await messService.getUserMessDetails();
      
      if (messDetailsResponse.success && messDetailsResponse.data) {
        const userMessDetails = messDetailsResponse.data;
        setMessDetails(userMessDetails);
        
        // Update stats based on real data
        const updatedStats: DashboardStats = {
          totalBills: 0, // Will be updated when billing is implemented
          pendingBills: 0,
          paidBills: 0,
          totalAmount: 0,
          totalMesses: userMessDetails.totalMesses || 0,
          totalMealPlanSubscriptions: userMessDetails.totalMealPlanSubscriptions || 0,
          maxMesses: userMessDetails.maxMesses || 3,
          maxMealPlanSubscriptions: userMessDetails.maxMealPlanSubscriptions || 3,
          canJoinMore: userMessDetails.canJoinMore || false,
        };
        setStats(updatedStats);
      } else {
        console.error('Failed to load mess details:', messDetailsResponse);
      }

      // Fetch user billing from backend
      try {
        const billingResponse = await messService.getUserBilling();
        if (billingResponse.success && billingResponse.data) {
          const billingData = Array.isArray(billingResponse.data) ? billingResponse.data : [];
          const totalBills = billingData.length;
          const pendingBills = billingData.filter((bill: any) => bill.status === 'pending').length;
          const paidBills = billingData.filter((bill: any) => bill.status === 'paid').length;
          const totalAmount = billingData.reduce((sum: number, bill: any) => sum + (bill.amount || 0), 0);
          
          setStats(prev => ({
            ...prev,
            totalBills,
            pendingBills,
            paidBills,
            totalAmount,
          }));
        }
      } catch (billingError) {
        console.error('Error loading billing data:', billingError);
        // Continue with other data loading
      }

      // Mock activity data for now (can be replaced with real API later)
      const mockActivity: RecentActivity[] = [
        {
          id: '1',
          type: 'payment',
          title: 'Payment Received',
          description: 'Monthly mess fee paid successfully',
          timestamp: new Date().toISOString(),
          status: 'success',
        },
        {
          id: '2',
          type: 'meal',
          title: 'Meal Plan Updated',
          description: 'Switched to premium meal plan',
          timestamp: new Date(Date.now() - 86400000).toISOString(),
          status: 'info',
        },
      ];

      setRecentActivity(mockActivity);
    } catch (error) {
      console.error('Error loading user data:', error);
      // Set default values on error
      setMessDetails({
        messes: [],
        totalMesses: 0,
        totalMealPlanSubscriptions: 0,
        maxMesses: 3,
        maxMealPlanSubscriptions: 3,
        canJoinMore: true,
      });
    } finally {
      setLoading(false);
    }
  }, []); // Empty dependency array since this function doesn't depend on any props or state

  // Functions
  const handleMessClick = useCallback(async (mess: AvailableMess) => {
    try {
      setLoadingMesses(true);
      // Fetch detailed mess information including UPI details
      const response = await messService.getMessDetailsById(mess.id);
      if (response.success && response.data) {
        setSelectedMess(response.data);
        setIsModalOpen(true);
      }
    } catch (error) {
      console.error('Error fetching mess details:', error);
      // Fallback to basic mess info
      setSelectedMess(mess);
      setIsModalOpen(true);
    } finally {
      setLoadingMesses(false);
    }
  }, []); // Empty dependency array

  const handleJoinMess = useCallback(async (messId: string, mealPlanId: string, paymentType: 'pay_now' | 'pay_later') => {
    try {
      setLoadingMesses(true);
      
      // Check current subscription status
      // Note: This check only prevents joining if user has an active/pending subscription
      // Users can still rejoin after leaving (the backend handles this logic)
      
      // Check if user is already subscribed to this meal plan
      // Note: This only checks for active/pending subscriptions, not inactive ones
      if (messDetails && messDetails.messes) {
        const existingSubscription = messDetails.messes.find(mess => 
          mess.messId === messId && 
          mess.mealPlans && 
          mess.mealPlans.some(plan => plan.id === mealPlanId)
        );
        
        if (existingSubscription) {
          toast({
            title: 'Already Subscribed',
            description: 'You are already subscribed to this meal plan. You can leave and rejoin later if needed.',
            variant: 'default',
          });
          return;
        }
      }
      
      // Check if user has reached the limit
      if (!stats.canJoinMore) {
        toast({
          title: 'Maximum Limit Reached',
          description: 'You have reached the maximum limit of mess subscriptions. Please leave one before joining another.',
          variant: 'destructive',
        });
        return;
      }
      
      // Call the backend API to join the mess
      const response = await messService.joinMess(messId, mealPlanId, paymentType);
      
      if (response.success) {
        toast({
          title: 'Successfully Joined',
          description: response.message || 'You have successfully joined the mess!',
          variant: 'default',
        });
        // After successful join, refresh data
        await loadUserData();
        // Close the modal
        setIsModalOpen(false);
        setSelectedMess(null);
      } else {
        console.error('Failed to join mess:', response.message);
        toast({
          title: 'Join Failed',
          description: response.message || 'Failed to join the mess. Please try again.',
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      console.error('Error joining mess:', error);
      
      // Handle specific error cases
      if (error.message && error.message.includes('already subscribed')) {
        toast({
          title: 'Already Subscribed',
          description: 'You are already subscribed to this meal plan. You can leave and rejoin later if needed.',
          variant: 'default',
        });
      } else if (error.message && error.message.includes('maximum limit')) {
        toast({
          title: 'Maximum Limit Reached',
          description: 'You have reached the maximum limit of mess subscriptions. Please leave one before joining another.',
          variant: 'destructive',
        });
      } else {
        console.error('Unexpected error joining mess:', error);
        toast({
          title: 'Join Failed',
          description: error.message || 'An unexpected error occurred while joining the mess.',
          variant: 'destructive',
        });
      }
    } finally {
      setLoadingMesses(false);
    }
  }, [messDetails, stats, toast, loadUserData]); // Dependencies

  const handleLeaveMess = useCallback(async (messId: string, mealPlanId: string) => {
    try {
      setLoading(true);
      
      // Validate the IDs before sending
      if (!messId || typeof messId !== 'string' || messId.length !== 24) {
        throw new Error(`Invalid messId: ${messId}`);
      }
      
      if (!mealPlanId || typeof mealPlanId !== 'string' || mealPlanId.length !== 24) {
        throw new Error(`Invalid mealPlanId: ${mealPlanId}`);
      }
      
      // Call the backend API to leave the meal plan
      const response = await messService.leaveMess(messId, mealPlanId);
      
      if (response.success) {
        toast({
          title: 'Successfully Left',
          description: response.message || 'You have successfully left the meal plan.',
          variant: 'default',
        });
        
        // Force immediate data refresh to update the UI
        await loadUserData();
        
        // Double-check the data was updated
        const verifyResponse = await messService.getUserMessDetails();
        if (verifyResponse.success && verifyResponse.data) {
        }

        // Dispatch event to refresh chat rooms (remove user from mess chat groups)
        window.dispatchEvent(new CustomEvent('messMembershipChanged'));
        // Also set storage event for cross-tab synchronization
        localStorage.setItem('messMembershipChanged', Date.now().toString());
        setTimeout(() => localStorage.removeItem('messMembershipChanged'), 100);
      } else {
        console.error('Failed to leave meal plan:', response.message);
        toast({
          title: 'Leave Failed',
          description: response.message || 'Failed to leave the meal plan. Please try again.',
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      console.error('Error leaving meal plan:', error);
      // You might want to show an error toast here
    } finally {
      setLoading(false);
    }
  }, [toast, loadUserData]); // Dependencies

  const handlePayBill = useCallback(async (billId: string, paymentMethod: 'online' | 'upi' | 'cash' = 'online') => {
    try {
      setLoading(true);
      
      // Call the backend API to pay the bill
      const response = await messService.payBill(billId, paymentMethod);
      
      if (response.success) {
        toast({
          title: 'Payment Successful',
          description: `Payment of ₹${response.data?.amount || 'N/A'} via ${paymentMethod.toUpperCase()} processed successfully.`,
          variant: 'default',
        });
        // After successful payment, refresh data
        await loadUserData();
      } else {
        console.error('Payment failed:', response.message);
        toast({
          title: 'Payment Failed',
          description: response.message || 'Failed to process payment. Please try again.',
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      console.error('Error processing payment:', error);
      toast({
        title: 'Payment Error',
        description: error.message || 'An unexpected error occurred during payment.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast, loadUserData]); // Dependencies

  const handleLogout = useCallback(() => {
    authService.logout();
    // Redirect to login or home page
    if (typeof window !== 'undefined') {
      window.location.href = '/auth/login';
    }
  }, []); // Empty dependency array

  // Enhanced refresh function that also checks for subscription updates
  const refreshSubscriptionStatus = useCallback(async () => {
    try {
      setLoading(true);
      
      // Force a fresh API call to get latest data
      const response = await messService.getUserMessDetails();
      
      if (response.success && response.data) {
        const userMessDetails = response.data;
        
        // Update both messDetails and stats
        setMessDetails(userMessDetails);
        
        const updatedStats: DashboardStats = {
          ...stats,
          totalMesses: userMessDetails.totalMesses || 0,
          totalMealPlanSubscriptions: userMessDetails.totalMealPlanSubscriptions || 0,
          maxMesses: userMessDetails.maxMesses || 3,
          maxMealPlanSubscriptions: userMessDetails.maxMealPlanSubscriptions || 3,
          canJoinMore: userMessDetails.canJoinMore || false,
        };
        
        setStats(updatedStats);
        
        // Also check for subscription updates specifically
        try {
          const subscriptionResponse = await fetch('/api/notifications/subscription-updates', {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
              'Content-Type': 'application/json'
            }
          });
          
          if (subscriptionResponse.ok) {
            const subscriptionData = await subscriptionResponse.json();
            if (subscriptionData.success) {
              console.log('Subscription updates received:', subscriptionData.data);
              // Update stats with real-time subscription count
              const realTimeStats = {
                ...updatedStats,
                totalMealPlanSubscriptions: subscriptionData.data.totalSubscriptions || 0,
                canJoinMore: (subscriptionData.data.totalSubscriptions || 0) < (subscriptionData.data.maxSubscriptions || 3)
              };
              setStats(realTimeStats);
            }
          }
        } catch (subscriptionError) {
          console.error('Failed to fetch subscription updates:', subscriptionError);
        }
        
        toast({
          title: 'Data Refreshed',
          description: `Current status: ${updatedStats.totalMealPlanSubscriptions}/${updatedStats.maxMealPlanSubscriptions} meal plans. ${updatedStats.canJoinMore ? 'Can join more.' : 'Max limit reached.'}`,
          variant: 'default',
        });
      } else {
        console.error('Failed to refresh data:', response);
        toast({
          title: 'Refresh Failed',
          description: 'Failed to refresh data. Please try again.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error refreshing data:', error);
      toast({
        title: 'Refresh Failed',
        description: 'An error occurred while refreshing data.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [stats, toast]); // Dependencies: stats and toast

  // Manual refresh function for when user explicitly wants to update data
  const manualRefresh = useCallback(async () => {
    try {
      console.log('🔄 Manual refresh initiated by user...');
      setLoading(true);
      await loadUserData();
      console.log('✅ Manual refresh completed');
    } catch (error) {
      console.error('Manual refresh failed:', error);
    } finally {
      setLoading(false);
    }
  }, [loadUserData]);

  // Auto-refresh functionality for real-time updates (disabled to prevent constant reloading)
  // useEffect(() => {
  //   let refreshInterval: NodeJS.Timeout;
    
  //   // Set up automatic refresh every 30 seconds
  //   const setupAutoRefresh = () => {
  //     refreshInterval = setInterval(async () => {
  //       try {
  //         // Only refresh if user is authenticated
  //         const authToken = localStorage.getItem('authToken');
  //         if (authToken) {
  //           console.log('Auto-refreshing user data...');
  //           await loadUserData();
  //         }
  //       } catch (error) {
  //         console.error('Auto-refresh failed:', error);
  //       }
  //     }, 30000); // 30 seconds
  //   };

  //   // Start auto-refresh after initial load
  //   if (user) {
  //     setupAutoRefresh();
  //   }

  //   return () => {
  //     if (refreshInterval) {
  //       clearInterval(refreshInterval);
  //     }
  //   };
  // }, [user]); // Removed 'loading' dependency to prevent recreation cycles

  // Listen for notification updates and refresh dashboard (DISABLED - causes unnecessary refreshes)
  // useEffect(() => {
  //   const handleNotificationUpdate = async (event: MessageEvent) => {
  //     // Check if the message is from our service worker or notification system
  //     if (event.data && event.data.type === 'SUBSCRIPTION_UPDATE') {
  //       console.log('Subscription update received, silently refreshing dashboard...');
  //       await silentRefresh();
  //     }
  //   };

  //   // Listen for messages from service worker
  //   if ('serviceWorker' in navigator) {
  //     navigator.serviceWorker.addEventListener('message', handleNotificationUpdate);
  //   }

  //   // Listen for custom events
  //   window.addEventListener('subscription-update', handleNotificationUpdate as any);

  //   return () => {
  //     if ('serviceWorker' in navigator) {
  //       navigator.serviceWorker.removeEventListener('message', handleNotificationUpdate);
  //     }
  //     window.removeEventListener('subscription-update', handleNotificationUpdate as any);
  //   };
  // }, []);

  const loadAvailableMesses = useCallback(async () => {
    try {
      setLoadingMesses(true);
      
      // Fetch available messes from backend
      const messesResponse = await messService.getAvailableMesses();
      if (messesResponse.success && messesResponse.data) {
        setAvailableMesses(messesResponse.data);
      } else {
        setAvailableMesses([]);
      }
    } catch (error) {
      console.error('Error loading available messes:', error);
      setAvailableMesses([]);
    } finally {
      setLoadingMesses(false);
    }
  }, []); // Empty dependency array

  // Effects
  useEffect(() => {
    loadUserData();
  }, [loadUserData]);

  // Silent data refresh when page becomes visible (DISABLED - causes unnecessary refreshes)
  // useEffect(() => {
  //   const handleVisibilityChange = () => {
  //     if (!document.hidden) {
  //       console.log('🔄 Page became visible, silently updating data...');
  //       // Silent update without showing loading states
  //       silentRefresh();
  //     }
  //   };

  //   document.addEventListener('visibilitychange', handleVisibilityChange);
    
  //   return () => {
  //     document.removeEventListener('visibilitychange', handleVisibilityChange);
  //   };
  // }, [silentRefresh]);

  useEffect(() => {
    if (activeMessTab === 'posted_mess') {
      loadAvailableMesses();
    }
  }, [activeMessTab, loadAvailableMesses]);

  // Removed local theme effect - using global theme provider instead

  // Polling mechanism for payment status updates (DISABLED - causes constant reloading)
  // useEffect(() => {
  //   let pollingInterval: NodeJS.Timeout;
    
  //   const startPolling = () => {
  //     // Poll every 10 seconds for payment status updates
  //     pollingInterval = setInterval(async () => {
  //       try {
  //         const authToken = localStorage.getItem('authToken');
  //         if (authToken && user) {
  //           console.log('🔄 Polling for payment status updates...');
  //           await silentRefresh();
  //         }
  //       } catch (error) {
  //         console.error('Payment status polling failed:', error);
  //       }
  //     }, 10000); // 10 seconds
  //   };

  //   // Start polling if user is authenticated
  //   if (user) {
  //     startPolling();
  //   }

  //   return () => {
  //     if (pollingInterval) {
  //       clearInterval(pollingInterval);
  //     }
  //   };
  // }, [user, silentRefresh]);

  return {
    // State
    isDarkMode,
    activeMessTab,
    stats,
    recentActivity,
    loading,
    messDetails,
    availableMesses,
    loadingMesses,
    selectedMess,
    isModalOpen,
    unreadNotifications,
    user,

    // Setters
    setActiveMessTab,
    setSelectedMess,
    setIsModalOpen,

    // Functions
    toggleDarkMode,
    handleMessClick,
    handleJoinMess,
    handleLeaveMess,
    handlePayBill,
    handleLogout,
    refreshSubscriptionStatus,
    loadUserData,
    manualRefresh
  };
};