import React, { useState } from 'react';
import { useApplyLeave } from './ApplyLeave.hooks';
import { ApplyLeaveProps } from './ApplyLeave.types';
import { formatDisplayDate } from '@/utils/dateUtils';
import { CommonHeader } from '@/components/common/Header/CommonHeader';
import LeaveHistory from './components/LeaveHistory';

const ApplyLeave: React.FC<ApplyLeaveProps> = (props) => {
  const { state, actions } = useApplyLeave(props);
  const [activeTab, setActiveTab] = useState<'apply' | 'history' | 'extend'>('apply');
  const [mobileStep, setMobileStep] = useState<'form' | 'summary'>('form');
  

  // Helper function to get meal type icon
  const getMealTypeIcon = (type: string) => {
    switch (type) {
      case 'breakfast': return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      );
      case 'lunch': return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      );
      case 'dinner': return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      );
      default: return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
        </svg>
      );
    }
  };

  

  if (state.isLoading) {
    return (
      <div className="min-h-screen SmartMess-light-bg dark:SmartMess-dark-bg flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="SmartMess-light-text-secondary dark:SmartMess-dark-text-secondary">Loading your leave management...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen SmartMess-light-bg dark:SmartMess-dark-bg pb-20">
      {/* Header */}
      <CommonHeader
        title="Leave Management"
        subtitle="Apply for meal leaves and manage your requests"
        variant="default"
      >
        <div className="hidden sm:flex items-center space-x-2 bg-green-100 dark:bg-green-900 px-3 py-1 rounded-full">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span className="text-sm font-medium text-green-700 dark:text-green-300">Active</span>
        </div>
      </CommonHeader>

      {/* Navigation Tabs */}
      <div className="SmartMess-light-surface dark:SmartMess-dark-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 sm:py-4">
          <div className="flex space-x-1 bg-card rounded-lg p-1 border border-border w-full sm:w-auto">
            {[
              { 
                id: 'apply', 
                label: 'Apply Leave', 
                shortLabel: 'Apply',
                icon: (
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                )
              },
              { 
                id: 'history', 
                label: 'Leave History', 
                shortLabel: 'History',
                icon: (
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v11a2 2 0 002 2h5.586a1 1 0 00.707-.293l5.414-5.414a1 1 0 00.293-.707V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                )
              },

            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as any);
                  setMobileStep('form');
                }}
                className={`flex-1 sm:flex-none flex items-center justify-center space-x-1 sm:space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab.icon}
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">{tab.shortLabel}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 pb-20 sm:pb-24">
        {/* Notification */}
        {state.notification.show && (
          <div className={`mb-6 rounded-lg border p-4 ${
            state.notification.type === 'success' ? 'bg-green-50 border-green-200 dark:bg-green-900 dark:border-green-800' :
            state.notification.type === 'error' ? 'bg-red-50 border-red-200 dark:bg-red-900 dark:border-red-800' :
            state.notification.type === 'warning' ? 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900 dark:border-yellow-800' :
            'bg-blue-50 border-blue-200 dark:bg-blue-900 dark:border-blue-800'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                  state.notification.type === 'success' ? 'bg-green-500' :
                  state.notification.type === 'error' ? 'bg-red-500' :
                  state.notification.type === 'warning' ? 'bg-yellow-500' :
                  'bg-blue-500'
                }`}>
                  <span className="text-white text-xs">
                    {state.notification.type === 'success' ? '✓' :
                     state.notification.type === 'error' ? '✕' :
                     state.notification.type === 'warning' ? '⚠' : 'ℹ'}
                  </span>
                </div>
                <p className={`font-medium ${
                  state.notification.type === 'success' ? 'text-green-800 dark:text-green-200' :
                  state.notification.type === 'error' ? 'text-red-800 dark:text-red-200' :
                  state.notification.type === 'warning' ? 'text-yellow-800 dark:text-yellow-200' :
                  'text-blue-800 dark:text-blue-200'
                }`}>
                  {state.notification.message}
                </p>
              </div>
              <button
                onClick={actions.hideNotification}
                className="SmartMess-light-text-secondary dark:SmartMess-dark-text-secondary hover:SmartMess-light-text dark:SmartMess-dark-text"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Apply Leave Tab */}
        {activeTab === 'apply' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {/* Leave Application Form */}
            <div className={`lg:col-span-2 order-2 lg:order-1 ${mobileStep === 'summary' ? 'hidden lg:block' : 'block lg:block'}`}>
              <div className="rounded-xl border border-border bg-card transition-all p-4 sm:p-6 space-y-4 sm:space-y-6">
                <div>
                  <h2 className="text-xl font-semibold SmartMess-light-text dark:SmartMess-dark-text mb-2">
                    {state.updateMode ? 'Update Leave End Date' : 'Apply for Leave'}
                  </h2>
                  <p className="SmartMess-light-text-secondary dark:SmartMess-dark-text-secondary">
                    {state.updateMode
                      ? 'Update the end date to modify your leave. Start date and start-day meals are locked. All values will be recalculated.'
                      : 'Select your meal plans and dates to apply for leave'}
                  </p>
                </div>

                {/* Meal Plans Selection */}
                <div>
                  <label className="block text-sm font-medium SmartMess-light-text dark:SmartMess-dark-text mb-3">
                    Select Meal Plans *
                  </label>
                  {state.availableMealPlans.length === 0 ? (
                    <div className="text-center py-8 border-2 border-dashed border-border rounded-lg bg-card transition-all">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-lg bg-muted flex items-center justify-center">
                        <svg className="w-8 h-8 SmartMess-light-text-secondary dark:SmartMess-dark-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                        </svg>
                      </div>
                      <p className="SmartMess-light-text-secondary dark:SmartMess-dark-text-secondary">No active meal plans found</p>
                      <p className="text-sm SmartMess-light-text-secondary dark:SmartMess-dark-text-secondary mt-1">
                        Please subscribe to a meal plan first
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-3 sm:gap-4">
                      {(state.selectedMealPlans.length > 0
                        ? state.availableMealPlans.filter((p: any) => state.selectedMealPlans.includes(p._id))
                        : state.availableMealPlans
                      ).map((plan: any) => (
                        <label
                          key={plan._id}
                          className={`flex items-start sm:items-center space-x-3 p-3 sm:p-4 rounded-xl border border-border bg-card transition-all cursor-pointer ${
                            state.selectedMealPlans.includes(plan._id)
                              ? 'border-primary'
                              : 'hover:bg-muted'
                          }`}
                        >
                          <input
                            type="radio"
                            name="applyLeaveSelectedPlan"
                            checked={state.selectedMealPlans.includes(plan._id)}
                            onChange={() => {
                              if (state.updateMode) return;
                              actions.updateSelectedMealPlans([plan._id]);
                            }}
                            disabled={state.updateMode}
                            className="rounded SmartMess-light-border dark:SmartMess-dark-border text-primary focus:ring-primary"
                          />
                          <div className="flex-1">
                            <h3 className="font-medium SmartMess-light-text dark:SmartMess-dark-text">{plan.name}</h3>
                            <p className="text-sm SmartMess-light-text-secondary dark:SmartMess-dark-text-secondary">
                              ₹{plan.pricing.amount}/{plan.pricing.period}
                            </p>
                            {/* Show subscription dates if available */}
                            {(() => {
                              const subscription = state.subscriptions.find((sub: any) => 
                                sub.mealPlans.some((p: any) => p.id === plan._id)
                              );
                              if (subscription && subscription.status === 'active') {
                                return (
                                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    {subscription.subscriptionStartDate && (
                                      <span>Start: {formatDisplayDate(new Date(subscription.subscriptionStartDate))}</span>
                                    )}
                                    {subscription.subscriptionStartDate && subscription.subscriptionEndDate && ' • '}
                                    {subscription.subscriptionEndDate && (
                                      <span>End: {formatDisplayDate(new Date(subscription.subscriptionEndDate))}</span>
                                    )}
                                  </div>
                                );
                              }
                              return null;
                            })()}
                            <div className="flex flex-wrap items-center gap-1 sm:gap-2 mt-1">
                              {plan.mealOptions.breakfast && (
                                <span className="text-xs bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300 px-2 py-1 rounded">
                                  🌅 Breakfast
                                </span>
                              )}
                              {plan.mealOptions.lunch && (
                                <span className="text-xs bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300 px-2 py-1 rounded">
                                  ☀️ Lunch
                                </span>
                              )}
                              {plan.mealOptions.dinner && (
                                <span className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 px-2 py-1 rounded">
                                  🌙 Dinner
                                </span>
                              )}
                            </div>
                            
                            {/* Leave Rules Information */}
                            {plan.leaveRules && (
                              <div className="mt-3 pt-2 border-t border-gray-200 dark:border-gray-700">
                                <div className="grid grid-cols-2 gap-1 text-xs">
                                  {plan.leaveRules.leaveLimitsEnabled && plan.leaveRules.maxLeaveDaysEnabled && (
                                    <div className="flex justify-between">
                                      <span className="SmartMess-light-text-secondary dark:SmartMess-dark-text-secondary">Max Days:</span>
                                      <span className="font-medium SmartMess-light-text dark:SmartMess-dark-text">{plan.leaveRules.maxLeaveDays}</span>
                                    </div>
                                  )}
                                  {plan.leaveRules.leaveLimitsEnabled && plan.leaveRules.maxLeaveMealsEnabled && (
                                    <div className="flex justify-between">
                                      <span className="SmartMess-light-text-secondary dark:SmartMess-dark-text-secondary">Max Meals:</span>
                                      <span className="font-medium SmartMess-light-text dark:SmartMess-dark-text">{plan.leaveRules.maxLeaveMeals}</span>
                                    </div>
                                  )}
                                  {plan.leaveRules.consecutiveLeaveEnabled && (
                                    <div className="flex justify-between">
                                      <span className="SmartMess-light-text-secondary dark:SmartMess-dark-text-secondary">Min Days:</span>
                                      <span className="font-medium SmartMess-light-text dark:SmartMess-dark-text">{plan.leaveRules.minConsecutiveDays}</span>
                                    </div>
                                  )}
                                  {plan.leaveRules.requireTwoHourNotice && (
                                    <div className="flex justify-between">
                                      <span className="SmartMess-light-text-secondary dark:SmartMess-dark-text-secondary">Notice:</span>
                                      <span className="font-medium SmartMess-light-text dark:SmartMess-dark-text">{plan.leaveRules.noticeHours}h</span>
                                    </div>
                                  )}
                                  <div className="flex justify-between">
                                    <span className="SmartMess-light-text-secondary dark:SmartMess-dark-text-secondary">Auto-Approve:</span>
                                    <span className={`font-medium ${plan.leaveRules.autoApproval ? 'text-green-600 dark:text-green-400' : 'text-orange-600 dark:text-orange-400'}`}>
                                      {plan.leaveRules.autoApproval ? 'Yes' : 'No'}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="SmartMess-light-text-secondary dark:SmartMess-dark-text-secondary">Extend Sub:</span>
                                    <span className={`font-medium ${plan.leaveRules.extendSubscription ? 'text-green-600 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'}`}>
                                      {plan.leaveRules.extendSubscription ? 'Yes' : 'No'}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </label>
                      ))}
                    </div>
                  )}
                </div>

                {/* Validation Errors */}
                {state.errors.mealPlans && (
                  <div className="rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 transition-all p-3">
                    <p className="text-sm text-red-800 dark:text-red-200">{state.errors.mealPlans}</p>
                  </div>
                )}

                {/* Date Selection */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-sm font-medium SmartMess-light-text dark:SmartMess-dark-text mb-2">
                      Start Date *
                    </label>
                    <input
                      type="date"
                      value={state.startDate}
                      onChange={(e) => { if (state.updateMode) return; actions.updateField('startDate', e.target.value); }}
                      disabled={state.updateMode}
                      className={`w-full px-3 py-3 border SmartMess-light-border dark:SmartMess-dark-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent SmartMess-light-bg dark:SmartMess-dark-bg SmartMess-light-text dark:SmartMess-dark-text ${state.updateMode ? 'opacity-60 cursor-not-allowed' : ''}`}
                      min={new Date().toISOString().split('T')[0]}
                      title={state.updateMode ? 'Start Date is locked while updating a leave' : ''}
                    />
                    {state.startDate && (
                      <p className="mt-1 text-xs SmartMess-light-text-secondary dark:SmartMess-dark-text-secondary">
                        {formatDisplayDate(new Date(state.startDate))}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium SmartMess-light-text dark:SmartMess-dark-text mb-2">
                      End Date *
                    </label>
                    <input
                      type="date"
                      value={state.endDate}
                      onChange={(e) => actions.updateField('endDate', e.target.value)}
                      className="w-full px-3 py-3 border SmartMess-light-border dark:SmartMess-dark-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent SmartMess-light-bg dark:SmartMess-dark-bg SmartMess-light-text dark:SmartMess-dark-text"
                      min={state.startDate || new Date().toISOString().split('T')[0]}
                    />
                    {state.endDate && (
                      <p className="mt-1 text-xs SmartMess-light-text-secondary dark:SmartMess-dark-text-secondary">
                        {formatDisplayDate(new Date(state.endDate))}
                      </p>
                    )}
                  </div>
                </div>

                {/* Meal Types Selection */}
                {state.selectedMealPlans.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <div>
                      <label className="block text-sm font-medium SmartMess-light-text dark:SmartMess-dark-text mb-3">
                        Start Date Meals
                      </label>
                      <div className="space-y-2">
                            {['breakfast', 'lunch', 'dinner'].map((mealType: any) => {
                          const isAvailable = state.availableMealPlans
                            .filter((plan: any) => state.selectedMealPlans.includes(plan._id))
                            .some((plan: any) => plan.mealOptions[mealType as keyof typeof plan.mealOptions]);
                          
                          if (!isAvailable) return null;
                          
                          // Check if we can still request this meal today
                          const canRequest = (() => {
                            if (!state.startDate) return true;
                            
                            const today = new Date().toDateString();
                            const startDate = new Date(state.startDate).toDateString();
                            
                            // Only check for today
                            if (today !== startDate) return true;
                            
                            // Get the notice hours requirement from selected plans
                            const selectedPlans = state.availableMealPlans.filter(
                              (plan: any) => state.selectedMealPlans.includes(plan._id)
                            );
                            
                            // Default meal times (would be fetched from backend in production)
                            const mealTimes: Record<string, { start: string; end: string }> = {
                              breakfast: { start: '07:00', end: '09:00' },
                              lunch: { start: '12:00', end: '14:00' },
                              dinner: { start: '19:00', end: '21:00' }
                            };
                            
                            const mealTime = mealTimes[mealType];
                            if (!mealTime) return true;
                            
                            // Check if any plan requires notice
                            const requiresNotice = selectedPlans.some(
                              (plan: any) => plan.leaveRules?.requireTwoHourNotice && plan.leaveRules?.leaveLimitsEnabled
                            );
                            
                            const now = new Date();
                            const timeParts = mealTime.start.split(':').map(Number);
                            const startHour = timeParts[0] || 7;
                            const startMinute = timeParts[1] || 0;
                            const mealStartTime = new Date();
                            mealStartTime.setHours(startHour, startMinute, 0, 0);
                            
                            // If notice hours are required, use deadline (meal start time MINUS notice hours)
                            // If notice hours are NOT required, use meal start time as deadline
                            let deadline: Date;
                            
                            if (requiresNotice) {
                              const noticeHours = selectedPlans[0]?.leaveRules?.noticeHours || 2;
                              // Example: Breakfast at 8:00 AM with 2h notice = deadline at 6:00 AM
                              deadline = new Date(mealStartTime.getTime() - (noticeHours * 60 * 60 * 1000));
                            } else {
                              // No notice required - only block if meal has already started
                              deadline = mealStartTime;
                            }
                            
                            return now < deadline;
                          })();
                          
                          return (
                            <label key={mealType} className={`flex items-center space-x-3 ${(state.updateMode || !canRequest) ? 'opacity-50 cursor-not-allowed' : ''}`}>
                              <input
                                type="checkbox"
                                checked={state.startDateMealTypes.includes(mealType as any)}
                                disabled={state.updateMode || !canRequest}
                                onChange={(e) => {
                                  if (state.updateMode || !canRequest) return;
                                  const newTypes = e.target.checked
                                    ? [...state.startDateMealTypes, mealType as any]
                                    : state.startDateMealTypes.filter((t: any) => t !== mealType);
                                  actions.updateField('startDateMealTypes', newTypes);
                                }}
                                className="rounded SmartMess-light-border dark:SmartMess-dark-border text-primary focus:ring-primary disabled:cursor-not-allowed"
                              />
                              <span className="flex items-center space-x-2">
                                <span>{getMealTypeIcon(mealType)}</span>
                                <span className="text-sm font-medium SmartMess-light-text dark:SmartMess-dark-text capitalize">
                                  {mealType}
                                </span>
                                {!canRequest && (
                                  <span className="text-xs text-red-600 dark:text-red-400">
                                    (Too late)
                                  </span>
                                )}
                              </span>
                            </label>
                          );
                        })}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium SmartMess-light-text dark:SmartMess-dark-text mb-3">
                        End Date Meals
                      </label>
                      <div className="space-y-2">
                        {['breakfast', 'lunch', 'dinner'].map((mealType: any) => {
                          const isAvailable = state.availableMealPlans
                            .filter((plan: any) => state.selectedMealPlans.includes(plan._id))
                            .some((plan: any) => plan.mealOptions[mealType as keyof typeof plan.mealOptions]);
                          
                          if (!isAvailable) return null;
                          
                          return (
                            <label key={mealType} className="flex items-center space-x-3">
                              <input
                                type="checkbox"
                                checked={state.endDateMealTypes.includes(mealType as any)}
                                onChange={(e) => {
                                  const newTypes = e.target.checked
                                    ? [...state.endDateMealTypes, mealType as any]
                                    : state.endDateMealTypes.filter((t: any) => t !== mealType);
                                  actions.updateField('endDateMealTypes', newTypes);
                                }}
                                className="rounded SmartMess-light-border dark:SmartMess-dark-border text-primary focus:ring-primary"
                              />
                              <span className="flex items-center space-x-2">
                                <span>{getMealTypeIcon(mealType)}</span>
                                <span className="text-sm font-medium SmartMess-light-text dark:SmartMess-dark-text capitalize">
                                  {mealType}
                                </span>
                              </span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {/* Reason */}
                <div>
                  <label className="block text-sm font-medium SmartMess-light-text dark:SmartMess-dark-text mb-2">
                    Reason (Optional)
                  </label>
                  <textarea
                    value={state.reason}
                    onChange={(e) => actions.updateField('reason', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-3 border SmartMess-light-border dark:SmartMess-dark-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent SmartMess-light-bg dark:SmartMess-dark-bg SmartMess-light-text dark:SmartMess-dark-text placeholder-muted-foreground resize-none"
                    placeholder="Enter reason for leave (optional)"
                    maxLength={500}
                  />
                  <p className="text-xs SmartMess-light-text-secondary dark:SmartMess-dark-text-secondary mt-1">
                    {state.reason.length}/500 characters
                  </p>
                </div>

                {/* Mobile Next Button - Only show on small screens */}
                <div className="flex justify-end lg:hidden">
                  <button
                    onClick={() => setMobileStep('summary')}
                    disabled={state.selectedMealPlans.length === 0 || !state.startDate || !state.endDate}
                    className="w-full px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
                  >
                    <span>Next</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>

                {/* Submit Button - Hidden on mobile, shown on desktop */}
                <div className="hidden lg:flex justify-end">
                  <button
                    onClick={actions.submitLeaveRequest}
                    disabled={state.isSubmitting || state.selectedMealPlans.length === 0}
                    className="w-full sm:w-auto px-6 py-3 SmartMess-light-primary dark:SmartMess-dark-primary text-primary-foreground rounded-lg font-medium hover:SmartMess-light-primary dark:hover:SmartMess-dark-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
                  >
                    {state.isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin"></div>
                        <span>Submitting...</span>
                      </>
                    ) : (
                      <>
                        <span>📝</span>
                        <span>{state.updateMode ? 'Update Leave Request' : 'Submit Leave Request'}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Leave Summary */}
            <div className={`space-y-4 sm:space-y-6 order-1 lg:order-2 ${mobileStep === 'form' ? 'hidden lg:block' : 'block lg:block'}`}>
              {/* Mobile Back Button */}
              <div className="lg:hidden mb-4">
                <button
                  onClick={() => setMobileStep('form')}
                  className="flex items-center space-x-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  <span>Back to Form</span>
                </button>
              </div>
              {/* Backend Adjustment Messages */}
              {state.adjustmentMessages && Array.isArray(state.adjustmentMessages) && state.adjustmentMessages.length > 0 && (
                <div className="rounded-xl border border-orange-300 dark:border-orange-700 bg-orange-50 dark:bg-orange-900/20 transition-all p-4 sm:p-6">
                  <h3 className="text-lg font-semibold text-orange-700 dark:text-orange-300 mb-3 flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Important Information
                  </h3>
                  <div className="space-y-3">
                    {state.adjustmentMessages.map((msg: any, index: number) => (
                      <div key={index} className="text-sm text-orange-800 dark:text-orange-200 bg-orange-100 dark:bg-orange-900/30 rounded-lg p-3">
                        <p className="font-medium">{msg.message}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Calculation Summary */}
              <div className="rounded-xl border border-border bg-card transition-all p-4 sm:p-6">
                <h3 className="text-lg font-semibold SmartMess-light-text dark:SmartMess-dark-text mb-4">Leave Summary</h3>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-b SmartMess-light-border dark:SmartMess-dark-border">
                    <span className="SmartMess-light-text-secondary dark:SmartMess-dark-text-secondary">Total Days</span>
                    <span className="font-medium SmartMess-light-text dark:SmartMess-dark-text">{state.totalDays || 0}</span>
                  </div>
                  
                  <div className="flex justify-between items-center py-2 border-b SmartMess-light-border dark:SmartMess-dark-border">
                    <span className="SmartMess-light-text-secondary dark:SmartMess-dark-text-secondary">Total Meals</span>
                    <span className="font-medium SmartMess-light-text dark:SmartMess-dark-text">
                      {/* Use calculated meals that respect limits and consecutive requirements */}
                      {state.extendSubscription 
                        ? (state.extensionMeals || 0) 
                        : ((state.mealBreakdown?.breakfast || 0) + (state.mealBreakdown?.lunch || 0) + (state.mealBreakdown?.dinner || 0))}
                    </span>
                  </div>
                  
                  {/* Decide using backend-computed flag (respects consecutive-day rules) */}
                  {state.extendSubscription ? (
                    <div className="flex justify-between items-center py-2 border-b SmartMess-light-border dark:SmartMess-dark-border">
                      <span className="SmartMess-light-text-secondary dark:SmartMess-dark-text-secondary flex items-center gap-2">
                        <span>🔄</span>
                        <span>Estimated Subscription Extension</span>
                      </span>
                      <span className="font-medium text-blue-600">+{state.extensionMeals || 0} meals</span>
                    </div>
                  ) : (
                    <div className="flex justify-between items-center py-2 border-b SmartMess-light-border dark:SmartMess-dark-border">
                      <span className="SmartMess-light-text-secondary dark:SmartMess-dark-text-secondary">Estimated Savings</span>
                      <span className="font-medium text-green-600">₹{(state.estimatedSavings || 0).toFixed(2)}</span>
                    </div>
                  )}

                  {/* Meal Breakdown */}
                  {(state.mealBreakdown.breakfast > 0 || state.mealBreakdown.lunch > 0 || state.mealBreakdown.dinner > 0) && (
                    <div className="pt-4">
                      <h4 className="text-sm font-medium SmartMess-light-text dark:SmartMess-dark-text mb-3">Meal Breakdown</h4>
                      <div className="space-y-2">
                        {state.mealBreakdown.breakfast > 0 && (
                          <div className="flex justify-between items-center text-sm">
                            <span className="flex items-center space-x-2">
                              <span>🌅</span>
                              <span>Breakfast</span>
                            </span>
                            <span className="font-medium">{state.mealBreakdown.breakfast}</span>
                          </div>
                        )}
                        {state.mealBreakdown.lunch > 0 && (
                          <div className="flex justify-between items-center text-sm">
                            <span className="flex items-center space-x-2">
                              <span>☀️</span>
                              <span>Lunch</span>
                            </span>
                            <span className="font-medium">{state.mealBreakdown.lunch}</span>
                          </div>
                        )}
                        {state.mealBreakdown.dinner > 0 && (
                          <div className="flex justify-between items-center text-sm">
                            <span className="flex items-center space-x-2">
                              <span>🌙</span>
                              <span>Dinner</span>
                            </span>
                            <span className="font-medium">{state.mealBreakdown.dinner}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Plan-wise Breakdown */}
              {state.planWiseBreakdown.length > 0 && (
                <div className="rounded-xl border border-border bg-card transition-all p-4 sm:p-6">
                  <h3 className="text-lg font-semibold SmartMess-light-text dark:SmartMess-dark-text mb-4">Plan-wise Breakdown</h3>
                  <div className="space-y-3">
                    {state.planWiseBreakdown.map((plan: any) => {
                      const selectedPlan = state.availableMealPlans.find((p: any) => p._id === plan.planId);
                      const extendSub = selectedPlan?.leaveRules?.extendSubscription ?? false;
                      
                      return (
                      <div key={plan.planId} className="rounded-xl border border-border bg-card transition-all p-3">
                        <h4 className="font-medium SmartMess-light-text dark:SmartMess-dark-text mb-2">{plan.planName}</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                          <div className="flex justify-between">
                            <span className="SmartMess-light-text-secondary dark:SmartMess-dark-text-secondary">Total Meals:</span>
                              <span className="font-medium">{plan.breakfast + plan.lunch + plan.dinner}</span>
                          </div>
                            {extendSub ? (
                              <div className="flex justify-between">
                                <span className="SmartMess-light-text-secondary dark:SmartMess-dark-text-secondary">Extension:</span>
                                <span className="font-medium text-blue-600">+{((plan as any).extensionMeals || 0)} meals</span>
                              </div>
                            ) : (
                          <div className="flex justify-between">
                            <span className="SmartMess-light-text-secondary dark:SmartMess-dark-text-secondary">Savings:</span>
                            <span className="font-medium text-green-600">₹{((plan.estimatedSavings || 0)).toFixed(2)}</span>
                          </div>
                            )}
                        </div>
                          {/* Show subscription dates if available */}
                          {(plan.subscriptionStartDate || plan.subscriptionEndDate) && (
                            <div className="mt-3 pt-2 border-t border-gray-200 dark:border-gray-700 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                              {plan.subscriptionStartDate && (
                                <div className="flex justify-between">
                                  <span className="SmartMess-light-text-secondary dark:SmartMess-dark-text-secondary">Plan Start:</span>
                                  <span className="font-medium text-green-600 dark:text-green-400">{formatDisplayDate(new Date(plan.subscriptionStartDate))}</span>
                      </div>
                              )}
                              {plan.subscriptionEndDate && (
                                <div className="flex justify-between">
                                  <span className="SmartMess-light-text-secondary dark:SmartMess-dark-text-secondary">Plan Ends:</span>
                                  <span className="font-medium text-orange-600 dark:text-orange-400">{formatDisplayDate(new Date(plan.subscriptionEndDate))}</span>
                  </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Mobile Submit Button - Only show on small screens in summary step */}
              <div className="lg:hidden">
                <button
                  onClick={actions.submitLeaveRequest}
                  disabled={state.isSubmitting || state.selectedMealPlans.length === 0}
                  className="w-full px-6 py-3 SmartMess-light-primary dark:SmartMess-dark-primary text-primary-foreground rounded-lg font-medium hover:SmartMess-light-primary dark:hover:SmartMess-dark-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
                >
                  {state.isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin"></div>
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <span>📝</span>
                      <span>{state.updateMode ? 'Update Leave Request' : 'Submit Leave Request'}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <div className="rounded-xl border border-border bg-card transition-all p-3 sm:p-4">
            <h2 className="text-xl font-semibold SmartMess-light-text dark:SmartMess-dark-text mb-3">Leave History</h2>
            <LeaveHistory 
              items={state.leaveHistory} 
              onCancel={actions.cancelLeaveRequest}
              onUpdate={(leave: any) => {
                setActiveTab('apply');
                setMobileStep('form');
                actions.startUpdateMode(leave);
              }}
            />
          </div>
        )}

      </div>


    </div>
  );
};

export default ApplyLeave;