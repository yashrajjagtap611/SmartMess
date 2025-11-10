import React, { useState, useMemo, useCallback } from "react";
import { SideNavigation, BottomNavigation } from '@/components/common/Navbar/CommonNavbar';
import { useTheme } from "@/components/theme/theme-provider";
import { useNavigate } from 'react-router-dom';
import { 
  UserGroupIcon, 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  CurrencyRupeeIcon, 
  CheckCircleIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import { handleLogout as logoutUtil } from "@/utils/logout";
import { useMealPlan } from '../MealPlan.hooks';
import { ROUTES } from '@/constants/routes';
// import { useUser } from '@/contexts/AuthContext';
import { CommonHeader } from '@/components/common/Header/CommonHeader';
import { ArrowLeft, Plus } from 'lucide-react';
import { getMealPlanStatistics, getStatusColor, getMealTypeColor } from '../MealPlan.utils';
import type { MealPlan, MessPlansProps } from '../MealPlan.types';

export const MessPlans: React.FC<MessPlansProps> = (props) => {
  const { isDarkTheme: isDarkMode, toggleTheme: toggleDarkMode } = useTheme();
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  
  const {
    mealPlans,
    isLoading,
    error,
    deletingPlanId,
    deleteMealPlan,
  } = useMealPlan(props);

  // User context available if needed
  // const { user } = useUser();

  const handleLogout = () => {
    logoutUtil(navigate);
  };

  const handleAddMealPlan = useCallback(() => {
    if (props?.onMealPlanCreate) {
      // Call with empty data since we're just opening the form
      props.onMealPlanCreate({
        name: '',
        pricing: { amount: 0, period: 'month' },
        mealType: 'Mixed',
        mealsPerDay: 3,
        mealOptions: { breakfast: true, lunch: true, dinner: true },
        description: '',
        isActive: true,
        leaveRules: {
          maxLeaveMeals: 30,
          requireTwoHourNotice: true,
          noticeHours: 2,
          minConsecutiveDays: 2,
          extendSubscription: true,
          autoApproval: true,
          leaveLimitsEnabled: true,
          consecutiveLeaveEnabled: true,
          maxLeaveMealsEnabled: true,
        }
      });
    } else {
      navigate(ROUTES.MESS_OWNER.SETTINGS_MEAL_PLANS.replace('*', 'new'));
    }
  }, [props, navigate]);

  const handleEditMealPlan = useCallback((plan: MealPlan) => {
    if (props?.onMealPlanEdit) {
      props.onMealPlanEdit(plan);
    } else {
      navigate(ROUTES.MESS_OWNER.SETTINGS_MEAL_PLANS.replace('*', `edit/${plan._id}`));
    }
  }, [props, navigate]);

  const handleDeleteMealPlan = useCallback(async (id: string) => {
    const isConfirmed = window.confirm('Are you sure you want to delete this meal plan? This action cannot be undone.');
    if (!isConfirmed) {
      return;
    }

    const success = await deleteMealPlan(id);
    if (success) {
      if (props?.onMealPlanDelete) {
        props.onMealPlanDelete(id);
      }
    } else {
      alert('Failed to delete meal plan');
    }
  }, [deleteMealPlan, props]);

  // Filter plans based on status
  const filteredPlans = useMemo(() => {
    return mealPlans.filter(plan => {
      if (filterStatus === 'active') return plan.isActive;
      if (filterStatus === 'inactive') return !plan.isActive;
      return true;
    });
  }, [mealPlans, filterStatus]);

  // Calculate statistics
  const { totalPlans, activePlans, avgPrice, totalRevenue } = useMemo(() => {
    return getMealPlanStatistics(mealPlans);
  }, [mealPlans]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 transition-all duration-300">
      <SideNavigation
        isDarkMode={isDarkMode}
        toggleDarkMode={toggleDarkMode}
        handleLogout={handleLogout}
      />
      
      <div className="lg:ml-90 transition-all duration-300 relative">
        {/* Mobile: Back arrow absolutely positioned over header */}
        <button
          onClick={() => navigate(ROUTES.MESS_OWNER.SETTINGS)}
          className="absolute left-2 top-4 z-20 flex lg:hidden items-center p-2 rounded-full SmartMess-light-hover dark:SmartMess-dark-hover focus:outline-none focus:ring-2 focus:ring-primary"
          aria-label="Back to settings"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <CommonHeader
          title="Meal Plans"
          subtitle="Manage all your mess meal plans here"
          variant="default"
          className="relative"
          children={
            <button
              onClick={handleAddMealPlan}
              className="hidden lg:inline-flex items-center gap-2 px-5 py-2.5 rounded-xl SmartMess-light-primary dark:SmartMess-dark-primary text-primary-foreground font-semibold shadow hover:SmartMess-light-primary dark:SmartMess-dark-primary/90 transition-colors ml-4"
            >
              <Plus className="w-5 h-5" />
              Create New Plan
            </button>
          }
        />
        {/* Floating action button for mobile */}
        <button
          onClick={handleAddMealPlan}
          className="lg:hidden fixed bottom-6 right-6 z-50 SmartMess-light-primary dark:SmartMess-dark-primary text-primary-foreground rounded-full shadow-lg p-4 flex items-center justify-center hover:SmartMess-light-primary dark:SmartMess-dark-primary/90 transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
          aria-label="Create new meal plan"
        >
          <Plus className="w-6 h-6" />
        </button>
        
        <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto pb-20 lg:pb-6">
          {isLoading && (
            <div className="flex items-center justify-center py-16">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mx-auto mb-4"></div>
                <p className="SmartMess-light-text-secondary dark:SmartMess-dark-text-secondary text-lg font-medium">
                  Loading your meal plans...
                </p>
              </div>
            </div>
          )}

          {error && !isLoading && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-6 mb-8">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-destructive/20 rounded-lg flex-shrink-0">
                  <svg className="h-6 w-6 text-destructive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-destructive mb-2">Error Loading Meal Plans</h3>
                  <p className="text-destructive/80 mb-4">{error}</p>
                  <button
                    onClick={() => window.location.reload()}
                    className="px-4 py-2 bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90 transition-colors"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            </div>
          )}

          {!isLoading && !error && (
            <>
              {/* Enhanced Statistics Cards - Hidden on small devices (mobile) */}
              <div className="hidden md:grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-1">Total Plans</p>
                      <p className="text-3xl font-bold text-blue-900 dark:text-blue-100">{totalPlans}</p>
                    </div>
                    <div className="p-3 bg-blue-500/20 rounded-xl">
                      <UserGroupIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl p-6 border border-green-200 dark:border-green-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-green-600 dark:text-green-400 mb-1">Active Plans</p>
                      <p className="text-3xl font-bold text-green-900 dark:text-green-100">{activePlans}</p>
                    </div>
                    <div className="p-3 bg-green-500/20 rounded-xl">
                      <CheckCircleIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl p-6 border border-purple-200 dark:border-purple-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-purple-600 dark:text-purple-400 mb-1">Avg. Price</p>
                      <p className="text-3xl font-bold text-purple-900 dark:text-purple-100">₹{avgPrice}</p>
                    </div>
                    <div className="p-3 bg-purple-500/20 rounded-xl">
                      <CurrencyRupeeIcon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-xl p-6 border border-orange-200 dark:border-orange-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-orange-600 dark:text-orange-400 mb-1">Revenue</p>
                      <p className="text-3xl font-bold text-orange-900 dark:text-orange-100">₹{totalRevenue}</p>
                    </div>
                    <div className="p-3 bg-orange-500/20 rounded-xl">
                      <ChartBarIcon className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Controls */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 SmartMess-light-surface dark:SmartMess-dark-surface rounded-lg border SmartMess-light-border dark:SmartMess-dark-border p-1">
                    <button
                      onClick={() => setFilterStatus('all')}
                      className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                        filterStatus === 'all'
                          ? 'SmartMess-light-primary dark:SmartMess-dark-primary text-primary-foreground shadow-sm'
                          : 'SmartMess-light-text-secondary dark:SmartMess-dark-text-secondary hover:SmartMess-light-text dark:SmartMess-dark-text'
                      }`}
                    >
                      All ({mealPlans.length})
                    </button>
                    <button
                      onClick={() => setFilterStatus('active')}
                      className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                        filterStatus === 'active'
                          ? 'bg-green-500 text-white shadow-sm'
                          : 'SmartMess-light-text-secondary dark:SmartMess-dark-text-secondary hover:SmartMess-light-text dark:SmartMess-dark-text'
                      }`}
                    >
                      Active ({activePlans})
                    </button>
                    <button
                      onClick={() => setFilterStatus('inactive')}
                      className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                        filterStatus === 'inactive'
                          ? 'bg-gray-500 text-white shadow-sm'
                          : 'SmartMess-light-text-secondary dark:SmartMess-dark-text-secondary hover:SmartMess-light-text dark:SmartMess-dark-text'
                      }`}
                    >
                      Inactive ({mealPlans.length - activePlans})
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-lg transition-all ${
                      viewMode === 'grid'
                        ? 'SmartMess-light-primary dark:SmartMess-dark-primary text-primary-foreground'
                        : 'SmartMess-light-surface dark:SmartMess-dark-surface SmartMess-light-text-secondary dark:SmartMess-dark-text-secondary hover:SmartMess-light-text dark:SmartMess-dark-text'
                    }`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-lg transition-all ${
                      viewMode === 'list'
                        ? 'SmartMess-light-primary dark:SmartMess-dark-primary text-primary-foreground'
                        : 'SmartMess-light-surface dark:SmartMess-dark-surface SmartMess-light-text-secondary dark:SmartMess-dark-text-secondary hover:SmartMess-light-text dark:SmartMess-dark-text'
                    }`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Meal Plans Grid/List */}
              {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {filteredPlans.map((plan) => (
                    <div key={plan._id} className="group SmartMess-light-surface dark:SmartMess-dark-surface rounded-xl border SmartMess-light-border dark:SmartMess-dark-border p-4 sm:p-6 hover:shadow-xl transition-all duration-300 hover:border-primary/30 hover:scale-[1.02] h-fit">
                      <div className="flex flex-col h-full">
                        {/* Header section with plan name and actions */}
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1 min-w-0 pr-2">
                            <div className="flex flex-col gap-2 mb-2">
                              {/* Plan name with proper truncation */}
                              <h3 className="text-base sm:text-lg font-bold SmartMess-light-text dark:SmartMess-dark-text break-words leading-tight">
                                {plan.name}
                              </h3>
                              {/* Status badge */}
                              <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(plan.isActive)} self-start w-fit`}>
                                {plan.isActive ? 'Active' : 'Inactive'}
                              </span>
                            </div>
                            {/* Description with controlled height */}
                            <p className="text-sm SmartMess-light-text-secondary dark:SmartMess-dark-text-secondary line-clamp-2 mb-3 break-words leading-relaxed">
                              {plan.description}
                            </p>
                          </div>
                          {/* Action buttons - always on top right */}
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <button
                              onClick={() => handleEditMealPlan(plan)}
                              className="p-2 rounded-lg SmartMess-light-hover dark:SmartMess-dark-hover transition-colors"
                              title="Edit plan"
                            >
                              <PencilIcon className="h-4 w-4 SmartMess-light-text-secondary dark:SmartMess-dark-text-secondary" />
                            </button>
                            <button
                              onClick={() => handleDeleteMealPlan(plan._id!)}
                              className="p-2 rounded-lg hover:bg-destructive/10 transition-colors"
                              title="Delete plan"
                              disabled={deletingPlanId === plan._id}
                            >
                              <TrashIcon className="h-4 w-4 text-destructive" />
                            </button>
                          </div>
                        </div>

                        {/* Details section */}
                        <div className="space-y-3 flex-1">
                          <div className="flex items-center justify-between">
                            <span className="text-sm SmartMess-light-text-secondary dark:SmartMess-dark-text-secondary">Price</span>
                            <span className="text-lg font-bold SmartMess-light-text dark:SmartMess-dark-text">₹{plan.pricing.amount}</span>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <span className="text-sm SmartMess-light-text-secondary dark:SmartMess-dark-text-secondary">Type</span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getMealTypeColor(plan.mealType)}`}>
                              {plan.mealType}
                            </span>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <span className="text-sm SmartMess-light-text-secondary dark:SmartMess-dark-text-secondary">Meals/Day</span>
                            <span className="text-sm font-medium SmartMess-light-text dark:SmartMess-dark-text">{plan.mealsPerDay}</span>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <span className="text-sm SmartMess-light-text-secondary dark:SmartMess-dark-text-secondary">Period</span>
                            <span className="text-sm font-medium SmartMess-light-text dark:SmartMess-dark-text capitalize">{plan.pricing.period}</span>
                          </div>
                        </div>

                        {/* Footer section */}
                        <div className="mt-4 pt-4 border-t SmartMess-light-border dark:SmartMess-dark-border">
                          <div className="flex items-center justify-between text-sm">
                            <span className="SmartMess-light-text-secondary dark:SmartMess-dark-text-secondary">Subscribers</span>
                            <span className="font-medium SmartMess-light-text dark:SmartMess-dark-text">0</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="max-h-[70vh] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent hover:scrollbar-thumb-gray-400 dark:hover:scrollbar-thumb-gray-500">
                  <div className="divide-y divide-border">
                    {filteredPlans.map((plan) => (
                      <div key={plan._id} className="py-4 SmartMess-light-hover dark:SmartMess-dark-hover/50 transition-colors duration-200">
                        {/* List item layout - clean and minimal */}
                        <div className="flex items-center gap-4">
                          {/* Left section with icon and plan info */}
                          <div className="flex items-start gap-3 flex-1 min-w-0">
                            <div className="p-2 SmartMess-light-primary dark:SmartMess-dark-primary/10 rounded-lg flex-shrink-0">
                              <UserGroupIcon className="h-5 w-5 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              {/* Plan name and status badges */}
                              <div className="flex flex-col gap-2 mb-2">
                                <h3 className="text-base font-semibold SmartMess-light-text dark:SmartMess-dark-text truncate">
                                  {plan.name}
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(plan.isActive)}`}>
                                    {plan.isActive ? 'Active' : 'Inactive'}
                                  </span>
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getMealTypeColor(plan.mealType)}`}>
                                    {plan.mealType}
                                  </span>
                                </div>
                              </div>
                              {/* Description */}
                              <p className="text-sm SmartMess-light-text-secondary dark:SmartMess-dark-text-secondary break-words line-clamp-2">
                                {plan.description}
                              </p>
                            </div>
                          </div>
                          
                          {/* Right section with price and actions */}
                          <div className="flex items-center gap-4 flex-shrink-0">
                            {/* Price section */}
                            <div className="text-right">
                              <div className="text-lg font-semibold SmartMess-light-text dark:SmartMess-dark-text">₹{plan.pricing.amount}</div>
                              <div className="text-xs SmartMess-light-text-secondary dark:SmartMess-dark-text-secondary capitalize">{plan.pricing.period}</div>
                            </div>
                            
                            {/* Action buttons */}
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleEditMealPlan(plan)}
                                className="p-2 rounded-md SmartMess-light-hover dark:SmartMess-dark-hover transition-colors flex-shrink-0"
                                title="Edit plan"
                              >
                                <PencilIcon className="h-4 w-4 SmartMess-light-text-secondary dark:SmartMess-dark-text-secondary" />
                              </button>
                              <button
                                onClick={() => handleDeleteMealPlan(plan._id!)}
                                className="p-2 rounded-md hover:bg-destructive/10 transition-colors flex-shrink-0"
                                title="Delete plan"
                                disabled={deletingPlanId === plan._id}
                              >
                                <TrashIcon className="h-4 w-4 text-destructive" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {filteredPlans.length === 0 && (
                <div className="text-center py-16">
                  <div className="max-w-md mx-auto">
                    <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-primary/10 to-primary/20 rounded-full flex items-center justify-center">
                      <UserGroupIcon className="h-10 w-10 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold SmartMess-light-text dark:SmartMess-dark-text mb-2">
                      No meal plans found
                    </h3>
                    <p className="SmartMess-light-text-secondary dark:SmartMess-dark-text-secondary mb-6">
                      {filterStatus === 'all' 
                        ? "You haven't created any meal plans yet. Get started by creating your first plan."
                        : `No ${filterStatus} meal plans found.`
                      }
                    </p>
                    {filterStatus === 'all' && (
                      <button
                        onClick={handleAddMealPlan}
                        className="inline-flex items-center gap-2 px-6 py-3 SmartMess-light-primary dark:SmartMess-dark-primary text-primary-foreground rounded-xl hover:SmartMess-light-primary dark:SmartMess-dark-primary/90 transition-colors font-medium"
                      >
                        <PlusIcon className="h-4 w-4" />
                        Create Your First Plan
                      </button>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <BottomNavigation
          isDarkMode={isDarkMode}
          toggleDarkMode={toggleDarkMode}
          handleLogout={handleLogout}
        />
      </div>
    </div>
  );
};









