import { useEffect, useMemo, useState, useRef } from 'react';
import messService from '@/services/api/messService';
import apiClient from '@/services/api';
import type { ApplyLeaveProps } from './ApplyLeave.types';

type MealType = 'breakfast' | 'lunch' | 'dinner';

const isPlanApprovedForLeave = (plan: any) => {
  if (!plan) return false;

  const statuses = [
    (plan as any).status,
    (plan as any).subscriptionStatus,
    (plan as any).approvalStatus,
    (plan as any).membershipStatus,
    (plan as any).joinStatus
  ]
    .filter(Boolean)
    .map((status) => String(status).toLowerCase());

  if (statuses.some((status) => ['pending', 'awaiting', 'in_review', 'requested'].includes(status))) {
    return false;
  }

  if (statuses.some((status) => ['active', 'approved', 'ongoing'].includes(status))) {
    return true;
  }

  return statuses.length === 0;
};

export function useApplyLeave(_props: ApplyLeaveProps) {
  // Use ref to prevent duplicate submissions
  const isSubmittingRef = useRef(false);
  const previousEndDateRef = useRef<string>('');
  
  const [state, setState] = useState<any>({
    isLoading: false,
    isSubmitting: false,
    notification: { show: false, type: 'info', message: '' },
    availableMealPlans: [],
    selectedMealPlans: [] as string[],
    startDate: '',
    endDate: '',
    startDateMealTypes: [] as MealType[],
    endDateMealTypes: [] as MealType[],
    reason: '',
    mealBreakdown: { breakfast: 0, lunch: 0, dinner: 0 },
    planWiseBreakdown: [] as any[],
    totalDays: 0,
    estimatedSavings: 0,
    subscriptions: [] as any[],
    leaveHistory: [] as any[],
    adjustmentMessages: [] as any[],
    extendSubscription: false,
    extensionMeals: 0,
    errors: { mealPlans: '' },
    // Update mode for editing existing leave
    updateMode: false,
    updatingLeaveId: null as string | null,
    updatingLeave: null as any
  });

  const actions = useMemo(() => ({
    // Refresh subscriptions and available plans from backend (needed after updates)
    refreshSubscriptions: async () => {
      try {
        const resp = await messService.getUserMessDetails();
        const availablePlans: any[] = [];
        const subscriptions: any[] = [];
        if (resp?.success && resp.data?.messes) {
          for (const m of resp.data.messes as any[]) {
            for (const plan of (m.mealPlans || [])) {
              if (!isPlanApprovedForLeave(plan)) {
                continue;
              }
              const planStatus = (plan as any).status || (plan as any).subscriptionStatus || 'active';
              availablePlans.push({
                _id: plan.id,
                name: plan.name,
                pricing: plan.pricing,
                mealOptions: plan.mealOptions || { breakfast: true, lunch: true, dinner: true },
                leaveRules: plan.leaveRules || {
                  maxLeaveMeals: 30,
                  requireTwoHourNotice: true,
                  noticeHours: 2,
                  minConsecutiveDays: 2,
                  extendSubscription: true,
                  autoApproval: true,
                  leaveLimitsEnabled: true,
                  consecutiveLeaveEnabled: true,
                  maxLeaveMealsEnabled: true
                },
                status: planStatus
              });
              subscriptions.push({
                messId: m.messId,
                mealPlans: [{ id: plan.id }],
                subscriptionStartDate: (plan as any).subscriptionStartDate,
                subscriptionEndDate: (plan as any).subscriptionEndDate,
                status: planStatus
              });
            }
          }
        }
        setState((s: any) => {
          const validSelected = (s.selectedMealPlans || []).filter((id: string) =>
            availablePlans.some((plan: any) => plan._id === id)
          );
          return { ...s, availableMealPlans: availablePlans, subscriptions, selectedMealPlans: validSelected };
        });
      } catch (_e) {
        // ignore refresh failures
      }
    },
    updateField: (key: string, value: any) => setState((s: any) => ({ ...s, [key]: value })),
    updateSelectedMealPlans: (ids: string[]) => setState((s: any) => ({ ...s, selectedMealPlans: ids })),
    hideNotification: () => setState((s: any) => ({ ...s, notification: { ...s.notification, show: false } })),
    submitLeaveRequest: () => {
      // Get current state values by calling setState and capturing them
      setState((s: any) => {
        // Validate
        if (!s.selectedMealPlans || s.selectedMealPlans.length === 0) {
          return {
            ...s,
            notification: { show: true, type: 'error', message: 'Please select at least one meal plan' }
          };
        }
        if (!s.startDate || !s.endDate) {
          return {
            ...s,
            notification: { show: true, type: 'error', message: 'Please select start and end dates' }
          };
        }
        
        // Prevent double submission using ref
        if (isSubmittingRef.current || s.isSubmitting) {
          return s;
        }
        
        // Mark as submitting immediately
        isSubmittingRef.current = true;
        
        // Set submitting state
        setState((prev: any) => ({ ...prev, isSubmitting: true }));
        
        // Perform async submission with captured state values
        (async () => {
          try {
            if (s.updateMode && s.updatingLeaveId) {
              // Use extend endpoint to update end date and create a separate history entry
              await apiClient.post(`/user/leave-requests/${s.updatingLeaveId}/extend`, {
                newEndDate: s.endDate,
                reason: s.reason
              });
            } else {
              // Create new leave
              const payload = {
                mealPlanIds: s.selectedMealPlans,
                startDate: s.startDate,
                endDate: s.endDate,
                mealTypes: ['breakfast', 'lunch', 'dinner'],
                startDateMealTypes: s.startDateMealTypes,
                endDateMealTypes: s.endDateMealTypes,
                reason: s.reason
              };
              await apiClient.post('/user/leave-requests', payload);
            }
            
            // Reload leave history from server to avoid duplicates
            let history: any[] = [];
            try {
              const h = await apiClient.get('/user/leave-requests');
              if (h?.data?.success) {
                const rawHistory = h.data.data || [];
                // Deduplicate by _id
                history = rawHistory.filter((item: any, index: number, self: any[]) => {
                  return item && item._id && index === self.findIndex((t: any) => t._id === item._id);
                });
              }
            } catch (histError) {
            // If history reload fails, keep existing history
            console.error('Failed to reload leave history:', histError);
            }
            // Enrich history with plan names from current availableMealPlans
            const planIdToName = new Map<string, string>();
            for (const p of (state.availableMealPlans || [])) planIdToName.set(String(p._id || p.id), p.name);
            history = (history || []).map((it: any) => ({
              ...it,
              mealPlanIds: Array.isArray(it.mealPlanIds)
                ? it.mealPlanIds.map((pid: any) => {
                    const key = typeof pid === 'object' ? (pid._id || pid.id) : pid;
                    const name = planIdToName.get(String(key));
                    return name ? { _id: key, name } : pid;
                  })
                : it.mealPlanIds
            }));
          
          // Determine the status of the newly submitted leave
          const newLeave = history.length > 0 ? history[0] : null;
          const statusMessage = s.updateMode
            ? (newLeave?.status === 'approved' 
              ? 'Leave updated and auto-approved! Subscription has been recalculated.' 
              : newLeave?.status === 'rejected'
              ? 'Leave updated but rejected. Please review the reason.'
              : 'Leave updated! Request is pending approval with recalculated values.')
            : (newLeave?.status === 'approved' 
              ? 'Leave request auto-approved! Subscription has been extended.' 
              : newLeave?.status === 'rejected'
              ? 'Leave request rejected. Please review the reason.'
              : 'Leave request submitted and pending approval');
          
          setState((prev: any) => ({
            ...prev,
            isSubmitting: false,
            notification: { show: true, type: 'success', message: statusMessage },
            leaveHistory: history.length > 0 ? history : prev.leaveHistory,
            // Reset update mode
            updateMode: false,
            updatingLeaveId: null,
            updatingLeave: null,
            // Clear form or keep it? Let's keep it for now, user can see the result
          }));
            // Refresh subscriptions to reflect the latest subscription end date in UI
            try { await (actions as any).refreshSubscriptions(); } catch {}
          isSubmittingRef.current = false;
          } catch (e: any) {
            setState((prev: any) => ({
              ...prev,
              isSubmitting: false,
              notification: { show: true, type: 'error', message: e?.response?.data?.message || 'Failed to submit leave request' }
            }));
            isSubmittingRef.current = false;
          }
        })();
        
        return s;
      });
    },
    // Start update mode - opens the form with existing leave data
    // IMPORTANT: startDate is locked (cannot be changed) to ensure calculation is always from original start date
    // When user updates endDate, calculation happens from original startDate to new endDate
    // Example: Original leave 30/10/2025 - 31/10/2025, update to 30/10/2025 - 8/11/2025
    // Calculation will be from 30/10/2025 to 8/11/2025 (not from 31/10/2025)
    startUpdateMode: (leave: any) => {
      setState((s: any) => {
        // Pre-populate form with existing leave data
        // startDate will be locked (disabled) so user can only change endDate
        const startDateStr = leave.startDate ? new Date(leave.startDate).toISOString().split('T')[0] : '';
        const endDateStr = leave.endDate ? new Date(leave.endDate).toISOString().split('T')[0] : '';
        
        return {
          ...s,
          updateMode: true,
          updatingLeaveId: leave._id,
          updatingLeave: leave,
          selectedMealPlans: leave.mealPlanIds || [],
          startDate: startDateStr,  // Locked - cannot be changed
          endDate: endDateStr,      // Editable - user can update this
          startDateMealTypes: leave.startDateMealTypes || ['breakfast', 'lunch', 'dinner'],
          // Default end date meals to all meals if not provided so extension/savings include end day
          endDateMealTypes: (leave.endDateMealTypes && leave.endDateMealTypes.length > 0)
            ? leave.endDateMealTypes
            : ['breakfast', 'lunch', 'dinner'],
          reason: leave.reason || '',
          // Switch to apply tab to show the form
        };
      });
      // Ensure latest subscription end date is shown while updating
      (actions as any).refreshSubscriptions();
    },
    // Cancel update mode and reset form
    cancelUpdateMode: () => {
      setState((s: any) => ({
        ...s,
        updateMode: false,
        updatingLeaveId: null,
        updatingLeave: null,
        // Optionally clear form fields
        // selectedMealPlans: [],
        // startDate: '',
        // endDate: '',
        // startDateMealTypes: [],
        // endDateMealTypes: [],
        // reason: ''
      }));
    },
    cancelLeaveRequest: async (_id: string) => {
      try {
        const resp = await apiClient.delete(`/user/leave-requests/${_id}`);
        const updated = resp?.data?.data;
        setState((s: any) => ({
          ...s,
          notification: { 
            show: true, 
            type: 'success', 
            message: updated?.extendSubscription 
              ? 'Leave cancelled. Subscription extension reverted to original end date.' 
              : 'Leave cancelled successfully' 
          },
          leaveHistory: s.leaveHistory.map((it: any) => it._id === updated?._id ? updated : it)
        }));
      } catch (e: any) {
        setState((s: any) => ({
          ...s,
          notification: { show: true, type: 'error', message: e?.response?.data?.message || 'Failed to cancel leave' }
        }));
      }
    }
  }), []);

  useEffect(() => {
    // Load user's active/pending subscriptions and expose meal plans for selection
    const load = async () => {
      setState((s: any) => ({ ...s, isLoading: true }));
      try {
        const resp = await messService.getUserMessDetails();
        const availablePlans: any[] = [];
        const subscriptions: any[] = [];
        if (resp?.success && resp.data?.messes) {
          for (const m of resp.data.messes as any[]) {
            for (const plan of (m.mealPlans || [])) {
              if (!isPlanApprovedForLeave(plan)) {
                continue;
              }
              const planStatus = (plan as any).status || (plan as any).subscriptionStatus || 'active';
              availablePlans.push({
                _id: plan.id,
                name: plan.name,
                pricing: plan.pricing,
                mealOptions: plan.mealOptions || { breakfast: true, lunch: true, dinner: true },
                leaveRules: plan.leaveRules || {
                  maxLeaveMeals: 30,
                  requireTwoHourNotice: true,
                  noticeHours: 2,
                  minConsecutiveDays: 2,
                  extendSubscription: true,
                  autoApproval: true,
                  leaveLimitsEnabled: true,
                  consecutiveLeaveEnabled: true,
                  maxLeaveMealsEnabled: true
                },
                status: planStatus
              });
              subscriptions.push({
                messId: m.messId,
                mealPlans: [{ id: plan.id }],
                // Use per-plan membership dates from response
                subscriptionStartDate: (plan as any).subscriptionStartDate,
                subscriptionEndDate: (plan as any).subscriptionEndDate,
                status: planStatus
              });
            }
          }
        }
        // Also load existing leave history
        let history: any[] = [];
        try {
          const h = await apiClient.get('/user/leave-requests');
          if (h?.data?.success) {
            const rawHistory = h.data.data || [];
            // Deduplicate by _id
            history = rawHistory.filter((item: any, index: number, self: any[]) => {
              return item && item._id && index === self.findIndex((t: any) => t._id === item._id);
            });
          }
        } catch (_e) {
          // ignore history failure; keep empty
        }
        // Enrich history with plan names if available
        const planIdToName = new Map<string, string>();
        for (const p of availablePlans) planIdToName.set(String(p._id || p.id), p.name);
        const enrichedHistory = (history || []).map((it: any) => ({
          ...it,
          mealPlanIds: Array.isArray(it.mealPlanIds)
            ? it.mealPlanIds.map((pid: any) => {
                const key = typeof pid === 'object' ? (pid._id || pid.id) : pid;
                const name = planIdToName.get(String(key));
                return name ? { _id: key, name } : pid;
              })
            : it.mealPlanIds
        }));

        setState((s: any) => {
          const validSelected = (s.selectedMealPlans || []).filter((id: string) =>
            availablePlans.some((plan: any) => plan._id === id)
          );
          return {
            ...s,
            availableMealPlans: availablePlans,
            subscriptions,
            leaveHistory: enrichedHistory,
            isLoading: false,
            selectedMealPlans: validSelected
          };
        });
      } catch (e) {
        setState((s: any) => ({ ...s, isLoading: false }));
      }
    };
    load();
  }, []);

  // Recalculate summary via backend preview endpoint
  // IMPORTANT: This always calculates from startDate to endDate (not from any intermediate point)
  // When updating a leave: startDate is locked to original start, endDate can change, 
  // calculation is always from original start to new end (e.g., 30/10/2025 - 8/11/2025)
  useEffect(() => {
    // If end date changed and end-day meals are empty, default to all meals to ensure
    // Estimated Extension/Savings include the end date by default. Do not override
    // if the user has explicitly selected some meals.
    if (state.endDate && state.endDate !== previousEndDateRef.current) {
      previousEndDateRef.current = state.endDate;
      if (!state.endDateMealTypes || state.endDateMealTypes.length === 0) {
        setState((s: any) => ({ ...s, endDateMealTypes: ['breakfast', 'lunch', 'dinner'] }));
        // Wait for state to carry the defaulted end-day meals, then rerun effect
        return;
      }
    }

    const run = async () => {
      if (!state.startDate || !state.endDate || (state.selectedMealPlans || []).length === 0) {
        setState((s: any) => ({
          ...s,
          totalDays: 0,
          mealBreakdown: { breakfast: 0, lunch: 0, dinner: 0 },
          extensionMeals: 0,
          estimatedSavings: 0,
          extendSubscription: false
        }));
        return;
      }
      try {
        // Preview endpoint calculates meals/savings from startDate to endDate
        // In update mode: startDate is locked, endDate is editable, so calculation is from original start to new end
        const resp = await apiClient.post('/user/leave-requests/preview', {
          mealPlanIds: state.selectedMealPlans,
          startDate: state.startDate,  // Always from this start date
          endDate: state.endDate,      // To this end date (can be updated)
          mealTypes: ['breakfast', 'lunch', 'dinner'], // Auto-count all meals for middle days
          startDateMealTypes: state.startDateMealTypes,
          endDateMealTypes: state.endDateMealTypes
        });
        let d = resp.data?.data || {};
        // Fallback if backend did not compute
        if (!d || typeof d.totalDays !== 'number') {
          const start = new Date(state.startDate);
          const end = new Date(state.endDate);
          const totalDays = Math.max(0, Math.ceil((end.getTime() - start.getTime()) / (24 * 60 * 60 * 1000)) + 1);
          d = {
            totalDays,
            mealBreakdown: { breakfast: totalDays, lunch: totalDays, dinner: totalDays },
            extensionMeals: totalDays * 3,
            estimatedSavings: 0,
            extendSubscription: true
          };
        }
        setState((s: any) => ({
          ...s,
          totalDays: d.totalDays || 0,
          mealBreakdown: d.mealBreakdown || { breakfast: 0, lunch: 0, dinner: 0 },
          extensionMeals: d.extensionMeals || 0,
          estimatedSavings: d.estimatedSavings || 0,
          extendSubscription: !!d.extendSubscription,
          // Accept optional per-plan breakdown from backend (includes fresh subscription end dates)
          planWiseBreakdown: Array.isArray(d.planWiseBreakdown) ? d.planWiseBreakdown : s.planWiseBreakdown
        }));
      } catch (e) {
        // Leave summary remains unchanged on preview error
      }
    };
    run();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.startDate, state.endDate, state.selectedMealPlans, state.startDateMealTypes, state.endDateMealTypes]);

  return { state, actions };
}


