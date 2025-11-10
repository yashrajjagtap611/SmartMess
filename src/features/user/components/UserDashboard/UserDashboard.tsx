import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { SideNavigation, BottomNavigation } from "@/components/common/Navbar/CommonNavbar";
import { CommonHeader } from "@/components/common/Header/CommonHeader";
import MessDetailsModal from "@/features/user/components/MessDetailsModal/MessDetailsModal";
import { useUserDashboard } from './UserDashboard.hooks';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { ROUTES } from "@/constants/routes";
import type { MessMembership, RecentActivity, AvailableMess } from './UserDashboard.types';
import { 
  BellIcon,
  BuildingOfficeIcon,
  MagnifyingGlassIcon,
  StarIcon,
  MapPinIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import {
  MessMembershipCard,
  ActivityItem,
  LeaveConfirmationModal,
  TodaysMenu
} from './components';
import { QuickActions } from '@/components/common/QuickActions';



const UserDashboard: React.FC = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const { token } = useAuth();
  
  const {
    isDarkMode,
    toggleDarkMode,
    activeMessTab,
    setActiveMessTab,
    stats,
    recentActivity,
    loading,
    messDetails,
    availableMesses,
    loadingMesses,
    selectedMess,
    setSelectedMess,
    isModalOpen,
    setIsModalOpen,
    unreadNotifications,
    user,
    
    // Functions
    handleMessClick,
    handleLeaveMess,
    handleLogout,
    refreshSubscriptionStatus,
    loadUserData,
    manualRefresh
  } = useUserDashboard();

  // Refresh data when returning from payment page
  useEffect(() => {
    // Check if we're returning from payment options page
    if (location.state?.fromPayment) {
      console.log('🔄 Returning from payment page, silently updating data...');
      // Use silent refresh to avoid showing loading states
      loadUserData().catch(console.error);
    }
  }, [location.state, loadUserData]);

  const [leaveConfirmModal, setLeaveConfirmModal] = useState<{
    isOpen: boolean;
    messId: string;
    mealPlanId: string;
    messName: string;
    mealPlanName: string;
  }>({
    isOpen: false,
    messId: '',
    mealPlanId: '',
    messName: '',
    mealPlanName: ''
  });

  const handlePayment = async (messId: string, mealPlanId: string, paymentType: 'pay_now' | 'pay_later', membershipId?: string) => {
    console.log('🚀 Pay button clicked!', { messId, mealPlanId, paymentType, membershipId });
    try {
      // Find the complete meal plan and mess data
      const mess = messDetails?.messes.find(m => m.messId === messId);
      const mealPlan = mess?.mealPlans.find(p => p.id === mealPlanId);
      
      console.log('🔍 Found mess data:', mess);
      console.log('🔍 Found meal plan data:', mealPlan);
      
      if (!mess || !mealPlan) {
        console.error('❌ Missing data:', { mess, mealPlan });
        toast({
          title: 'Error',
          description: 'Unable to find meal plan details. Please try again.',
          variant: 'destructive',
        });
        return;
      }
      
      // Use membershipId from mealPlan if not provided
      const finalMembershipId = membershipId || mealPlan.membershipId;
      console.log('🔍 Using membershipId:', finalMembershipId);
      
      // Navigate to Payment Options page with complete data
      console.log('📍 Navigating to payment options...');
      navigate(ROUTES.USER.PAYMENT_OPTIONS, {
        state: {
          mess: {
            id: mess.messId,
            name: mess.messName,
            description: 'Mess subscription',
            address: mess.messLocation ? `${mess.messLocation.street}, ${mess.messLocation.city}` : 'Address not available',
            capacity: 50,
            currentMembers: 25,
            monthlyRate: mealPlan.pricing.amount,
            ownerName: 'Mess Owner',
            ownerPhone: '+91-0000000000',
            ownerEmail: 'owner@mess.com',
            types: ['Veg', 'Non-Veg'],
            colleges: ['Local College'],
            rating: 4.5,
            reviews: 100,
            upiId: mess.upiId || 'messowner@upi',
            mealPlans: []
          },
          selectedMealPlan: {
            id: mealPlan.id,
            name: mealPlan.name,
            description: mealPlan.description,
            pricing: mealPlan.pricing,
            mealType: mealPlan.mealType,
            mealsPerDay: mealPlan.mealsPerDay,
            isActive: mealPlan.status === 'active',
            leaveRules: {
              maxLeaveDays: 5,
              maxLeaveMeals: 15,
              requireTwoHourNotice: true,
              noticeHours: 2,
              minConsecutiveDays: 1,
              extendSubscription: true,
              autoApproval: false,
              leaveLimitsEnabled: true,
              consecutiveLeaveEnabled: true,
              maxLeaveDaysEnabled: true,
              maxLeaveMealsEnabled: true
            }
          },
          paymentType,
          amount: mealPlan.pricing.amount,
          messName: mess.messName,
          isBillPayment: paymentType === 'pay_now', // Mark as bill payment when paying existing subscription
          membershipId: finalMembershipId, // Pass membershipId for bill payments
          billId: finalMembershipId // Also pass as billId for backward compatibility
        }
      });
      console.log('✅ Navigation completed');
    } catch (error) {
      console.error('❌ Payment navigation error:', error);
      toast({
        title: 'Navigation Error',
        description: 'There was an error opening the payment page. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleLeaveConfirm = (messId: string, mealPlanId: string, messName: string, mealPlanName: string) => {
    // Validate the IDs before proceeding
    if (!messId || typeof messId !== 'string' || messId.length !== 24) {
      console.error('Invalid messId:', messId);
      toast({
        title: 'Error',
        description: 'Invalid mess ID. Please refresh the page and try again.',
        variant: 'destructive',
      });
      return;
    }
    
    if (!mealPlanId || typeof mealPlanId !== 'string' || mealPlanId.length !== 24) {
      console.error('Invalid mealPlanId:', mealPlanId);
      toast({
        title: 'Error',
        description: 'Invalid meal plan ID. Please refresh the page and try again.',
        variant: 'destructive',
      });
      return;
    }
    
    setLeaveConfirmModal({
      isOpen: true,
      messId,
      mealPlanId,
      messName,
      mealPlanName
    });
  };

  const handleCancelRequest = async (messId: string, mealPlanId: string, messName: string, mealPlanName: string) => {
    if (!token) {
      toast({
        title: 'Authentication Error',
        description: 'Please log in again to continue.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const response = await fetch('/api/mess/user-management/cancel-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ messId, mealPlanId })
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'Request Cancelled',
          description: `Your request for ${mealPlanName} at ${messName} has been cancelled.`,
        });
        await refreshSubscriptionStatus();
      } else {
        throw new Error(data.message || 'Failed to cancel request');
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to cancel request',
        variant: 'destructive',
      });
    }
  };

  const handleResendRequest = async (messId: string, mealPlanId: string, messName: string, mealPlanName: string) => {
    if (!token) {
      toast({
        title: 'Authentication Error',
        description: 'Please log in again to continue.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const response = await fetch('/api/mess/user-management/resend-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ messId, mealPlanId })
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'Request Resent',
          description: `Your request for ${mealPlanName} at ${messName} has been resent to the mess owner.`,
        });
      } else {
        throw new Error(data.message || 'Failed to resend request');
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to resend request',
        variant: 'destructive',
      });
    }
  };

  const confirmLeavePlan = async () => {
    try {
      await handleLeaveMess(leaveConfirmModal.messId, leaveConfirmModal.mealPlanId);
      setLeaveConfirmModal({ ...leaveConfirmModal, isOpen: false });
      toast({
        title: 'Leave Successful',
        description: `You have successfully left the meal plan "${leaveConfirmModal.mealPlanName}" at "${leaveConfirmModal.messName}".`,
      });
    } catch (error) {
      console.error('Leave plan failed:', error);
      toast({
        title: 'Leave Failed',
        description: `Failed to leave meal plan. Please try again.`,
        variant: 'destructive',
      });
    }
  };

  const MessCard: React.FC<{ mess: AvailableMess }> = ({ mess }) => (
    <div 
      className="bg-SmartMess-light-surface dark:SmartMess-dark-surface dark:bg-SmartMess-light-surface dark:SmartMess-dark-surface rounded-xl p-6 shadow-soft hover:shadow-medium transition-all duration-300 border SmartMess-light-border dark:SmartMess-dark-SmartMess-light-border dark:SmartMess-dark-border dark:SmartMess-light-border dark:SmartMess-dark-SmartMess-light-border dark:SmartMess-dark-border cursor-pointer"
      onClick={() => handleMessClick(mess)}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-SmartMess-light-text dark:SmartMess-dark-text dark:text-SmartMess-light-text dark:SmartMess-dark-text mb-1">
            {mess.name}
          </h3>
          <p className="text-sm text-SmartMess-light-text dark:SmartMess-dark-text-muted dark:text-SmartMess-light-text dark:SmartMess-dark-text-muted mb-2">
            {mess.description}
          </p>
          <div className="flex items-center space-x-2 mb-3">
            <MapPinIcon className="w-4 h-4 text-SmartMess-light-primary dark:SmartMess-dark-primary dark:text-SmartMess-light-primary dark:SmartMess-dark-primary" />
            <span className="text-sm text-SmartMess-light-text dark:SmartMess-dark-text-muted dark:text-SmartMess-light-text dark:SmartMess-dark-text-muted">
              {mess.address}
            </span>
          </div>
        </div>
        {mess.rating && (
          <div className="flex items-center space-x-1">
            <StarIcon className="w-4 h-4 text-yellow-500" />
            <span className="text-sm font-medium text-SmartMess-light-text dark:SmartMess-dark-text dark:text-SmartMess-light-text dark:SmartMess-dark-text">
              {mess.rating}
            </span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-xs text-SmartMess-light-text dark:SmartMess-dark-text-muted dark:text-SmartMess-light-text dark:SmartMess-dark-text-muted">Monthly Rate</p>
          <p className="text-lg font-semibold text-SmartMess-light-primary dark:SmartMess-dark-primary dark:text-SmartMess-light-primary dark:SmartMess-dark-primary">
            ₹{mess.monthlyRate}
          </p>
        </div>
        <div>
          <p className="text-xs text-SmartMess-light-text dark:SmartMess-dark-text-muted dark:text-SmartMess-light-text dark:SmartMess-dark-text-muted">Available Spots</p>
          <p className="text-lg font-semibold text-SmartMess-light-text dark:SmartMess-dark-text dark:text-SmartMess-light-text dark:SmartMess-dark-text">
            {mess.capacity - mess.currentMembers}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {mess.types.map((type, index) => (
          <span
            key={index}
            className="px-2 py-1 text-xs bg-SmartMess-light-accent dark:SmartMess-dark-accent dark:bg-SmartMess-light-hover dark:SmartMess-dark-hover text-SmartMess-light-text dark:SmartMess-dark-text dark:text-SmartMess-light-text dark:SmartMess-dark-text rounded-full"
          >
            {type}
          </span>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <div className="text-xs text-SmartMess-light-text dark:SmartMess-dark-text-muted dark:text-SmartMess-light-text dark:SmartMess-dark-text-muted">
          <p>Owner: {mess.ownerName}</p>
          <p>{mess.ownerPhone}</p>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleMessClick(mess);
          }}
          className="bg-SmartMess-light-primary dark:SmartMess-dark-primary dark:bg-SmartMess-light-primary dark:SmartMess-dark-primary text-black px-4 py-2 rounded-lg hover:opacity-90 transition-opacity text-sm font-medium"
        >
          View Details
        </button>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-background transition-all duration-300">
        <SideNavigation

          isDarkMode={isDarkMode}
          toggleDarkMode={toggleDarkMode}
          handleLogout={handleLogout}
        />
        <div className="flex items-center justify-center min-h-screen lg:ml-72">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
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
    <div className="min-h-screen bg-background transition-all duration-300">
      <SideNavigation

        isDarkMode={isDarkMode}
        toggleDarkMode={toggleDarkMode}
        handleLogout={handleLogout}
      />
      
      {/* Common Header */}
      <CommonHeader
        title={`Welcome back, ${user?.firstName || 'User'}! 👋`}
        subtitle="Here's what's happening with your mess account today."
        showUserProfile={true}
        onUserProfileClick={() => navigate(ROUTES.USER.PROFILE)}
        {...(user && {
          user: {
            ...(user.firstName && { firstName: user.firstName }),
            ...(user.lastName && { lastName: user.lastName }),
            ...(user.role && { role: user.role }),
            ...(user.profilePicture && { avatar: user.profilePicture }),
            ...(user.email && { email: user.email })
          }
        })}
        className="lg:hidden"
      >
        {/* Mobile Header Actions */}
        <div className="flex items-center space-x-2">
          {/* Notification Icon - Always visible */}
          <button
            onClick={() => navigate(ROUTES.USER.NOTIFICATIONS)}
            className="relative p-2 rounded-full hover:bg-accent transition-colors"
            title="View notifications"
          >
            <BellIcon className="w-6 h-6 text-primary" />
            {unreadNotifications > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[18px] h-[18px] flex items-center justify-center">
                {unreadNotifications}
              </span>
            )}
          </button>
        </div>
      </CommonHeader>

      {/* Desktop Header */}
      <div className="hidden lg:block border-b border-border bg-card">
        <div className="flex items-center justify-between p-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Welcome back, {user?.firstName || 'User'}! 👋
            </h1>
            <p className="text-muted-foreground">
              Here's what's happening with your mess account today.
            </p>
          </div>
          <div className="flex items-center space-x-4">
            {/* Notification Icon - Always visible */}
            <button
              onClick={() => navigate(ROUTES.USER.NOTIFICATIONS)}
              className="relative p-2 rounded-lg hover:bg-accent transition-colors"
              title="View notifications"
            >
              <BellIcon className="w-6 h-6 text-primary" />
              {unreadNotifications > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[18px] h-[18px] flex items-center justify-center">
                  {unreadNotifications}
                </span>
              )}
            </button>
            <button
              onClick={() => navigate(ROUTES.USER.PROFILE)}
              className="flex items-center space-x-2 p-2 rounded-lg hover:bg-accent transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-semibold">
                {user?.firstName?.[0] || 'U'}
              </div>
              <div className="text-left">
                <div className="text-sm font-medium text-foreground">
                  {user?.firstName || 'User'}
                </div>
                <div className="text-xs text-muted-foreground">
                  {user?.role?.replace(/-/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase()) || 'User'}
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>

      <div className="p-4 lg:p-6 pb-24 transition-all duration-300">
        {/* Meal Plan Subscription Status */}
        {messDetails && (
          <div className="mb-6">
            <div className="flex items-center justify-between px-4 py-2 rounded-lg bg-card border border-border">
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${
                  stats.canJoinMore ? 'bg-green-500' : 'bg-red-500'
                }`} />
                <span className={`text-sm font-medium ${
                  stats.canJoinMore ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                }`}>
                  Meal Plans: {stats.totalMealPlanSubscriptions}/{stats.maxMealPlanSubscriptions} {stats.canJoinMore ? '(Can join more)' : '(Max limit reached)'}
                </span>
              </div>
              <button
                onClick={manualRefresh}
                disabled={loading}
                className="p-1 rounded-full hover:bg-accent transition-colors"
                title="Refresh subscription status"
              >
                <ArrowPathIcon className={`w-4 h-4 text-muted-foreground ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        )}

        {/* Mess Tabs */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex space-x-1 bg-card rounded-lg p-1 border border-border w-full sm:w-auto">
              <button
                onClick={() => setActiveMessTab('our_mess')}
                className={`flex-1 sm:flex-none px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeMessTab === 'our_mess'
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Our Mess
              </button>
              <button
                onClick={() => setActiveMessTab('posted_mess')}
                className={`flex-1 sm:flex-none px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeMessTab === 'posted_mess'
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Find a Mess
              </button>
            </div>

          </div>
        </div>

        {activeMessTab === 'our_mess' ? (
          <>


        {/* Today's Menu */}
        {messDetails && messDetails.messes.length > 0 && (
          <div className="mb-8">
            <TodaysMenu />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Mess Memberships */}
          <div className="lg:col-span-2">
            <div className="bg-card rounded-2xl p-4 lg:p-6 shadow-lg border border-border">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-foreground flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
                    <BuildingOfficeIcon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <span>My Meal Plan Subscriptions</span>
                    <div className="text-sm text-muted-foreground font-normal mt-1">
                      {messDetails?.totalMealPlanSubscriptions || 0} of {messDetails?.maxMealPlanSubscriptions || 3} subscriptions active
                    </div>
                  </div>
                </h2>
                <div className="flex items-center gap-2">
                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                    (messDetails?.totalMealPlanSubscriptions || 0) < (messDetails?.maxMealPlanSubscriptions || 3)
                      ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800'
                      : 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800'
                  }`}>
                    {(messDetails?.totalMealPlanSubscriptions || 0) < (messDetails?.maxMealPlanSubscriptions || 3) ? 'Can join more' : 'Limit reached'}
                  </div>
                </div>
              </div>
              
              {messDetails && messDetails.messes.length > 0 ? (
                <div className="space-y-4">
                  {/* Quick Stats Bar */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-muted/30 rounded-lg border border-border">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">
                        {messDetails.messes.filter(m => m.status === 'active').length}
                      </div>
                      <div className="text-xs text-muted-foreground">Active</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                        {messDetails.messes.filter(m => m.status === 'pending').length}
                      </div>
                      <div className="text-xs text-muted-foreground">Pending</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                        {messDetails.messes.filter(m => m.paymentStatus === 'paid').length}
                      </div>
                      <div className="text-xs text-muted-foreground">Paid</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-foreground">
                        ₹{messDetails.messes.reduce((total, mess) => total + (mess.totalMonthlyAmount || 0), 0)}
                      </div>
                      <div className="text-xs text-muted-foreground">Total/Month</div>
                    </div>
                  </div>
                  
                  {messDetails.messes.map((mess: MessMembership) => (
                    <MessMembershipCard
                      key={mess.messId}
                      mess={mess}
                      onPayBill={(billId, _amount, _messName) => {
                        console.log('💰 onPayBill called!', { billId, messId: mess.messId, messName: mess.messName });
                        console.log('🔍 Available meal plans:', mess.mealPlans);
                        
                        // Extract meal plan ID from billId (format: bill-{messId}-{mealPlanId})
                        const mealPlanId = billId.replace(`bill-${mess.messId}-`, '');
                        console.log('🔍 Extracted meal plan ID:', mealPlanId);
                        
                        // Find the meal plan for this bill
                        const mealPlan = mess.mealPlans.find(plan => plan.id === mealPlanId);
                        console.log('🔍 Found meal plan:', mealPlan);
                        
                        if (mealPlan) {
                          console.log('✅ Calling handlePayment...');
                          handlePayment(mess.messId, mealPlan.id, 'pay_now', mealPlan.membershipId);
                        } else {
                          console.error('❌ No meal plan found for mealPlanId:', mealPlanId);
                          console.error('❌ Available meal plan IDs:', mess.mealPlans.map(p => p.id));
                        }
                      }}
                      onLeavePlan={handleLeaveConfirm}
                      onCancelRequest={handleCancelRequest}
                      onResendRequest={handleResendRequest}
                      loading={loading}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-muted/50 flex items-center justify-center">
                    <BuildingOfficeIcon className="w-10 h-10 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    No Meal Plan Subscriptions
                  </h3>
                  <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                    You haven't subscribed to any meal plans yet. Browse available messes and find the perfect meal plan for you.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <button 
                      onClick={() => setActiveMessTab('posted_mess')}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
                    >
                      <BuildingOfficeIcon className="w-5 h-5" />
                      Find a Mess
                    </button>
                    <button 
                      onClick={manualRefresh}
                      disabled={loading}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors font-medium disabled:opacity-50"
                    >
                      <ArrowPathIcon className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                      Refresh Status
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="lg:col-span-1">
            <div className="bg-card rounded-2xl p-4 lg:p-6 shadow-lg border border-border">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-foreground flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                    <BellIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  Recent Activity
                </h2>
                <button
                  onClick={() => navigate(ROUTES.USER.NOTIFICATIONS)}
                  className="text-sm text-primary hover:text-primary/80 font-medium transition-colors"
                >
                  View All
                </button>
              </div>
              
              <div className="space-y-2">
                {recentActivity.length > 0 ? (
                  recentActivity.map((activity: RecentActivity) => (
                    <ActivityItem key={activity.id} activity={activity} />
                  ))
                ) : (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted/50 flex items-center justify-center">
                      <BellIcon className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-sm font-medium text-foreground mb-1">
                      No Recent Activity
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Your activity will appear here
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8">
          <QuickActions
            hasPendingPayments={messDetails?.messes.some(mess => mess.status === 'active' && mess.paymentStatus === 'pending') || false}
            hasOverduePayments={messDetails?.messes.some(mess => mess.status === 'active' && mess.paymentStatus === 'overdue') || false}
            onPayBills={() => {
              // Find first pending payment and navigate to payment page
              const pendingMess = messDetails?.messes.find(mess => mess.status === 'active' && mess.paymentStatus === 'pending');
              if (pendingMess && pendingMess.mealPlans && pendingMess.mealPlans.length > 0) {
                const firstPlan = pendingMess.mealPlans[0];
                if (firstPlan) {
                  handlePayment(pendingMess.messId, firstPlan.id, 'pay_now');
                }
              }
            }}
            onApplyLeave={() => {
              // Navigate to Apply Leave page
              navigate(ROUTES.USER.APPLY_LEAVE);
            }}
            onViewCommunity={() => {
              // Navigate to community page
              navigate(ROUTES.USER.CHAT);
            }}
            onViewNotifications={() => {
              // Navigate to notifications page
              navigate(ROUTES.USER.NOTIFICATIONS);
            }}
            isDarkMode={isDarkMode}
            onToggleTheme={toggleDarkMode}
          />
        </div>
          </>
        ) : (
          /* Find a Mess Tab */
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-SmartMess-light-text dark:SmartMess-dark-text dark:text-SmartMess-light-text dark:SmartMess-dark-text mb-2">
                Available Messes
              </h2>
              <p className="text-SmartMess-light-text dark:SmartMess-dark-text-muted dark:text-SmartMess-light-text dark:SmartMess-dark-text-muted">
                Discover and join messes in your area
              </p>
            </div>

            {loadingMesses ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary"></div>
                <span className="ml-3 text-SmartMess-light-text dark:SmartMess-dark-text-muted dark:text-SmartMess-light-text dark:SmartMess-dark-text-muted">Loading messes...</span>
              </div>
            ) : availableMesses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {availableMesses.map((mess: AvailableMess) => (
                  <MessCard key={mess.id} mess={mess} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <MagnifyingGlassIcon className="w-16 h-16 text-SmartMess-light-text dark:SmartMess-dark-text-muted dark:text-SmartMess-light-text dark:SmartMess-dark-text-muted mx-auto mb-4" />
                <p className="text-SmartMess-light-text dark:SmartMess-dark-text-muted dark:text-SmartMess-light-text dark:SmartMess-dark-text-muted mb-2">
                  No messes available at the moment
                </p>
                <p className="text-sm text-SmartMess-light-text dark:SmartMess-dark-text-muted dark:text-SmartMess-light-text dark:SmartMess-dark-text-muted">
                  Check back later for new mess listings
                </p>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Mess Details Modal */}
      <MessDetailsModal
        mess={selectedMess}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedMess(null);
        }}
      />
      

      {/* Leave Confirmation Modal */}
      <LeaveConfirmationModal
        isOpen={leaveConfirmModal.isOpen}
        onClose={() => setLeaveConfirmModal({ ...leaveConfirmModal, isOpen: false })}
        messId={leaveConfirmModal.messId}
        mealPlanId={leaveConfirmModal.mealPlanId}
        messName={leaveConfirmModal.messName}
        mealPlanName={leaveConfirmModal.mealPlanName}
        onConfirm={confirmLeavePlan}
        loading={loading}
      />
      
      <BottomNavigation
        isDarkMode={isDarkMode}
        toggleDarkMode={toggleDarkMode}
        handleLogout={handleLogout}
      />
    </div>
  );
};

export default UserDashboard;
