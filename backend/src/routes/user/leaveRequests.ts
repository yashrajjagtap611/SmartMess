import express, { Response } from 'express';
import requireAuth from '../../middleware/requireAuth';
import type { AuthenticatedRequest, CreateLeaveRequestBody, ExtendLeaveRequestBody, LeaveRequestParams } from '../../types/requests';
import UserLeave from '../../models/UserLeave';
import MessOffDay from '../../models/MessOffDay';
import MessMembership from '../../models/MessMembership';
import MealPlan from '../../models/MealPlan';

const router: express.Router = express.Router();

// Default meal time windows (can be later moved to DB/config)
type MealTimeWindow = { mealType: 'breakfast'|'lunch'|'dinner'; startTime: string; endTime: string; enabled: boolean };
type MealNoticeValidation = { mealType: 'breakfast'|'lunch'|'dinner'; date: Date; meetsNotice: boolean; hoursRemaining: number; mealEndTime: Date; reason: string };

const DEFAULT_MEAL_WINDOWS: MealTimeWindow[] = [
  { mealType: 'breakfast', startTime: '07:00', endTime: '09:00', enabled: true },
  { mealType: 'lunch', startTime: '12:00', endTime: '14:00', enabled: true },
  { mealType: 'dinner', startTime: '19:00', endTime: '21:00', enabled: true }
];

function validateMealsForDate(
  date: Date,
  mealWindows: MealTimeWindow[],
  noticeHours: number,
  requestedMealTypes: Array<'breakfast' | 'lunch' | 'dinner'>
): MealNoticeValidation[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const requestDate = new Date(date);
  requestDate.setHours(0, 0, 0, 0);

  const isToday = today.getTime() === requestDate.getTime();
  const results: MealNoticeValidation[] = [];

  for (const mealType of requestedMealTypes) {
    const mealWindow = mealWindows.find(w => w.mealType === mealType && w.enabled);
    if (!mealWindow) {
      results.push({ mealType, date, meetsNotice: false, hoursRemaining: 0, mealEndTime: new Date(), reason: `${mealType} is not available today` });
      continue;
    }

    if (!isToday) {
      results.push({ mealType, date, meetsNotice: true, hoursRemaining: 24, mealEndTime: new Date(), reason: 'Future date - notice period will be checked at request time' });
    } else {
      const now = new Date();
      const mealEndTime = new Date();
      const [endHoursStr, endMinutesStr] = mealWindow.endTime.split(':');
      const endHours = Number(endHoursStr) || 0;
      const endMinutes = Number(endMinutesStr) || 0;
      mealEndTime.setHours(endHours, endMinutes, 0, 0);

      if (now > mealEndTime) {
        results.push({ mealType, date, meetsNotice: false, hoursRemaining: 0, mealEndTime, reason: `${mealType} has already ended at ${mealWindow.endTime}` });
        continue;
      }

      const noticeDeadline = new Date(mealEndTime.getTime() - (noticeHours * 60 * 60 * 1000));
      const meetsNotice = now <= noticeDeadline;
      const hoursRemaining = (mealEndTime.getTime() - now.getTime()) / (1000 * 60 * 60);

      results.push({ mealType, date, meetsNotice, hoursRemaining, mealEndTime, reason: meetsNotice ? `Meets ${noticeHours}-hour notice period` : `Within ${noticeHours}-hour notice window` });
    }
  }

  return results;
}

// POST /api/user/leave-requests/preview - Calculate totals/extension without persisting
router.post('/preview', requireAuth, async (req: any, res: Response) => {
  try {
    const userId = req.user.id;
    const { mealPlanIds = [], startDate, endDate, mealTypes = [], startDateMealTypes = [], endDateMealTypes = [] } = req.body || {};
    if (!startDate || !endDate || !Array.isArray(mealPlanIds) || mealPlanIds.length === 0) {
      return res.json({
        success: true,
        data: {
          totalDays: 0,
          totalMealsMissed: 0,
          mealBreakdown: { breakfast: 0, lunch: 0, dinner: 0 },
          extendSubscription: false,
          extensionMeals: 0,
          extensionDays: 0,
          estimatedSavings: 0,
          planWiseBreakdown: []
        }
      });
    }

    // Normalize to local day boundaries to avoid TZ off-by-one errors
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    // For overlap, find memberships per plan and clamp to subscription window
    const memberships = await MessMembership.find({
      userId,
      mealPlanId: { $in: mealPlanIds },
      status: { $in: ['active', 'pending'] }
    }).lean();

    const plans = await MealPlan.find({ _id: { $in: mealPlanIds } }).lean();
    const planIdToPlan: Record<string, any> = Object.fromEntries(plans.map((p: any) => [p._id.toString(), p]));

    // If multiple memberships exist for the same plan, select the one with the
    // most recent subscriptionEndDate (current effective membership).
    const latestMembershipByPlan: Record<string, any> = {};
    for (const m of (memberships as any[])) {
      const key = m.mealPlanId.toString();
      const current = latestMembershipByPlan[key];
      const mEnd = m.subscriptionEndDate ? new Date(m.subscriptionEndDate).getTime() : 0;
      const cEnd = current?.subscriptionEndDate ? new Date(current.subscriptionEndDate).getTime() : -1;
      if (!current || mEnd >= cEnd) {
        latestMembershipByPlan[key] = m;
      }
    }
    const effectiveMemberships = Object.values(latestMembershipByPlan);

    // Build Mess Off map to ignore overlaps (date->Set(meal))
    const offMealsByDate: Record<string, Set<string>> = {};
    try {
      const offDays = await MessOffDay.find({
        messId: (req as any).messId || undefined,
        status: 'active',
        $or: [
          { offDate: { $gte: start, $lte: end } },
          { rangeStartDate: { $lte: end }, rangeEndDate: { $gte: start } }
        ]
      }).lean();

      for (const od of offDays as any[]) {
        if (od.isRange && od.rangeStartDate && od.rangeEndDate) {
          const s = new Date(od.rangeStartDate); s.setHours(0,0,0,0);
          const e = new Date(od.rangeEndDate); e.setHours(0,0,0,0);
          for (let d = new Date(s); d <= e; d.setDate(d.getDate() + 1)) {
            const key: string = (d.toISOString().split('T')[0] || '') as string;
            if (!key) continue;
            if (!offMealsByDate[key]) offMealsByDate[key] = new Set<string>();
            const isFirst = d.getTime() === s.getTime();
            const isLast = d.getTime() === e.getTime();
            const meals: string[] = isFirst ? (od.startDateMealTypes?.length ? od.startDateMealTypes : ['breakfast','lunch','dinner'])
              : isLast ? (od.endDateMealTypes?.length ? od.endDateMealTypes : ['breakfast','lunch','dinner'])
              : ['breakfast','lunch','dinner'];
            meals.forEach((m) => offMealsByDate[key]!.add(m));
          }
        } else {
          const key: string = (new Date(od.offDate).toISOString().split('T')[0] || '') as string;
          if (!key) continue;
          if (!offMealsByDate[key]) offMealsByDate[key] = new Set<string>();
          (od.mealTypes || ['breakfast','lunch','dinner']).forEach((m: string) => offMealsByDate[key]!.add(m));
        }
      }
    } catch {}

    // New per-plan rules and aggregation
    const now = new Date();
    const mealBreakdownAgg: any = { breakfast: 0, lunch: 0, dinner: 0 };
    let extensionMealsAgg = 0;
    let extensionDaysAgg = 0;
    let estimatedSavingsAgg = 0;
    let anyExtension = false;
    // Overlap days across memberships (before applying caps/limits)
    let overlapDaysMax = 0;
    let totalDaysAgg = 0;
    let totalRequestedDays = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (24 * 60 * 60 * 1000)) + 1);
    const planWiseBreakdown: any[] = [];

    for (const m of (effectiveMemberships as any[])) {
      const plan = planIdToPlan[m.mealPlanId.toString()];
      if (!plan) continue;

      const mealsPerDay = Math.max(1, plan.mealsPerDay || 3);
      const subStartRaw = m.subscriptionStartDate ? new Date(m.subscriptionStartDate) : start;
      const subEndRaw = m.subscriptionEndDate ? new Date(m.subscriptionEndDate) : end;
      const subStart = new Date(subStartRaw); subStart.setHours(0, 0, 0, 0);
      const subEnd = new Date(subEndRaw); subEnd.setHours(23, 59, 59, 999);
      const effStart = new Date(Math.max(start.getTime(), subStart.getTime()));
      const effEnd = new Date(Math.min(end.getTime(), subEnd.getTime()));
      if (effEnd < effStart) {
        planWiseBreakdown.push({
          planId: m.mealPlanId.toString(),
          planName: plan.name,
          extendSubscription: !!plan.leaveRules?.extendSubscription,
          eligibleDays: 0,
          eligibleMeals: 0,
          deductionEligibleDays: 0,
          deductionEligibleMeals: 0,
          extendEligibleDays: 0,
          extendEligibleMeals: 0,
          estimatedSavings: 0,
          rate: 0,
          reasons: ['No overlap with subscription period']
        });
        continue;
      }

      const overlapDays = Math.max(0, Math.floor((effEnd.getTime() - effStart.getTime()) / (24 * 60 * 60 * 1000)) + 1);
      overlapDaysMax = Math.max(overlapDaysMax, overlapDays);

      // Per-day meal selection within overlap
      const dayTypes: Array<'breakfast'|'lunch'|'dinner'> = [];
      if (plan.mealOptions?.breakfast) dayTypes.push('breakfast');
      if (plan.mealOptions?.lunch) dayTypes.push('lunch');
      if (plan.mealOptions?.dinner) dayTypes.push('dinner');

      let requestedMealsWithinOverlap = 0;
      const mealBreakdownForPlan: any = { breakfast: 0, lunch: 0, dinner: 0 };
      const lastIsClampedToSubscription = end.getTime() > subEnd.getTime();
      for (let d = 0; d < overlapDays; d++) {
        const isFirst = d === 0;
        const isLast = d === overlapDays - 1;
        for (const t of dayTypes) {
          const takeStart = isFirst && startDateMealTypes.includes(t);
          const allowEndDaySelection = !lastIsClampedToSubscription;
          const takeEnd = allowEndDaySelection && isLast && endDateMealTypes.includes(t) && overlapDays > 1;
          const isMiddle = !isFirst && (!isLast || lastIsClampedToSubscription);
          const takeMiddle = isMiddle && mealTypes.includes(t);
          if (takeStart || takeEnd || takeMiddle) {
            // Ignore if mess-off overlaps for this date+meal
            const dayKey: string = (new Date(effStart.getTime() + d * 24 * 60 * 60 * 1000).toISOString().split('T')[0] || '') as string;
            if (dayKey && offMealsByDate[dayKey] && offMealsByDate[dayKey]!.has(t)) {
              continue;
            }
            mealBreakdownForPlan[t] += 1;
            requestedMealsWithinOverlap += 1;
          }
        }
      }

      // Eligibility checks
      const reasons: string[] = [];
      const noticeHours = Math.max(1, plan.leaveRules?.noticeHours || 2);
      const requireTwoHourNotice = !!plan.leaveRules?.requireTwoHourNotice;
      if (requireTwoHourNotice) {
        const threshold = new Date(now.getTime() + noticeHours * 60 * 60 * 1000);
        if (start < threshold) {
          reasons.push(`Fails notice period (${noticeHours}h required)`);
        }
      }

      const minConsecutiveDays = Math.max(1, plan.leaveRules?.minConsecutiveDays || 1);
      if (overlapDays < minConsecutiveDays) {
        reasons.push(`Below minimum consecutive days (${minConsecutiveDays})`);
      }

      // Limits
      let eligibleMeals = requestedMealsWithinOverlap;
      let eligibleDays = overlapDays;
      if (plan.leaveRules?.leaveLimitsEnabled) {
        if (plan.leaveRules?.maxLeaveMealsEnabled) {
          const maxLeaveMeals = Math.max(0, plan.leaveRules?.maxLeaveMeals || 0);
          if (eligibleMeals > maxLeaveMeals) {
            eligibleMeals = maxLeaveMeals;
            eligibleDays = Math.max(0, Math.ceil(eligibleMeals / mealsPerDay));
            reasons.push(`Capped by maxLeaveMeals (${maxLeaveMeals})`);
          }
        }
      }

      const invalidByRules = reasons.some(r => r.startsWith('Fails notice period') || r.startsWith('Below minimum consecutive days'));

      // Rate and savings if deduction
      const subscriptionDays = Math.max(1, Math.ceil((subEnd.getTime() - subStart.getTime()) / (24 * 60 * 60 * 1000)) + 1);
      const baseAmount = m.paymentAmount || plan.pricing?.amount || 0;
      const dailyRate = subscriptionDays > 0 ? (baseAmount / subscriptionDays) : 0;
      const perMealRate = mealsPerDay > 0 ? (dailyRate / mealsPerDay) : 0;

      let planEstimatedSavings = 0;
      let planExtendMeals = 0;
      let planExtendDays = 0;
      let deductionEligibleMeals = 0;
      let deductionEligibleDays = 0;

      if (!invalidByRules) {
        if (plan.leaveRules?.extendSubscription) {
          planExtendMeals = eligibleMeals;
          planExtendDays = Math.ceil(planExtendMeals / mealsPerDay);
          anyExtension = anyExtension || planExtendMeals > 0;
        } else {
          deductionEligibleMeals = eligibleMeals;
          deductionEligibleDays = eligibleDays;
          planEstimatedSavings = perMealRate * deductionEligibleMeals;
        }
      }

      // Calculate subscription extension date
      // IMPORTANT: Only use meals within the subscription overlap period (not beyond subscription end)
      // planExtendMeals is already based on eligibleMeals which is clamped to overlapDays
      let newSubscriptionEndDate = null;
      if (plan.leaveRules?.extendSubscription && planExtendDays > 0 && planExtendMeals > 0) {
        const originalSubEnd = new Date(subEnd);
        newSubscriptionEndDate = new Date(originalSubEnd);
        // Add only the days calculated from meals within the subscription period
        // planExtendDays is calculated from eligibleMeals (overlap meals only)
        newSubscriptionEndDate.setDate(newSubscriptionEndDate.getDate() + planExtendDays);
      }

      // Aggregate
      // Keep eligibleDays for deduction/extension calculations, but Total Days comes from overlapDays
      totalDaysAgg = Math.max(totalDaysAgg, eligibleDays);
      mealBreakdownAgg.breakfast += mealBreakdownForPlan.breakfast;
      mealBreakdownAgg.lunch += mealBreakdownForPlan.lunch;
      mealBreakdownAgg.dinner += mealBreakdownForPlan.dinner;
      extensionMealsAgg += planExtendMeals;
      extensionDaysAgg += planExtendDays;
      estimatedSavingsAgg += planEstimatedSavings;

      // Helper function to format date to dd/mm/yyyy
      const formatDateDDMMYYYY = (date: Date): string => {
        const d = date;
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();
        return `${day}/${month}/${year}`;
      };

      planWiseBreakdown.push({
        planId: m.mealPlanId.toString(),
        planName: plan.name,
        extendSubscription: !!plan.leaveRules?.extendSubscription,
        // Requested vs processed info
        requestedDays: Math.max(0, Math.ceil((end.getTime() - start.getTime()) / (24 * 60 * 60 * 1000)) + 1),
        processedDays: eligibleDays, // Days within subscription period
        ignoredDays: Math.max(0, Math.ceil((end.getTime() - subEnd.getTime()) / (24 * 60 * 60 * 1000))),
        // Overlap period (ISO strings for API, formatted strings for display)
        overlapPeriod: {
          startDate: effStart.toISOString(),
          endDate: effEnd.toISOString(),
          startDateFormatted: formatDateDDMMYYYY(effStart),
          endDateFormatted: formatDateDDMMYYYY(effEnd),
          days: overlapDays
        },
        // Subscription dates (ISO strings for API, formatted strings for display)
        subscriptionPeriod: {
          startDate: subStart.toISOString(),
          endDate: subEnd.toISOString(),
          newEndDate: newSubscriptionEndDate ? newSubscriptionEndDate.toISOString() : null,
          startDateFormatted: formatDateDDMMYYYY(subStart),
          endDateFormatted: formatDateDDMMYYYY(subEnd),
          newEndDateFormatted: newSubscriptionEndDate ? formatDateDDMMYYYY(newSubscriptionEndDate) : null
        },
        // Eligible counts
        eligibleDays,
        eligibleMeals,
        deductionEligibleDays,
        deductionEligibleMeals,
        extendEligibleDays: planExtendDays,
        extendEligibleMeals: planExtendMeals,
        estimatedSavings: Math.max(0, Math.round(planEstimatedSavings * 100) / 100),
        rate: Math.max(0, Math.round(perMealRate * 100) / 100),
        reasons
      });
    }

    return res.json({
      success: true,
      data: {
        // Summary
        requestedDays: totalRequestedDays,
        processedDays: overlapDaysMax,
        ignoredDays: Math.max(0, totalRequestedDays - overlapDaysMax),
        totalDays: overlapDaysMax,
        totalMealsMissed: mealBreakdownAgg.breakfast + mealBreakdownAgg.lunch + mealBreakdownAgg.dinner,
        mealBreakdown: mealBreakdownAgg,
        extendSubscription: anyExtension,
        extensionMeals: extensionMealsAgg,
        extensionDays: extensionDaysAgg,
        estimatedSavings: Math.max(0, Math.round(estimatedSavingsAgg * 100) / 100),
        planWiseBreakdown
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to preview leave request' });
  }
});

// GET /api/user/leave-requests
router.get('/', requireAuth, async (req: any, res: Response) => {
  try {
    const userId = req.user.id;
    const leaves = await UserLeave.find({ userId }).sort({ createdAt: -1 }).lean();
    
    // Deduplicate by _id as a safety measure
    const uniqueLeaves = leaves.filter((leave: any, index: number, self: any[]) => {
      return leave && leave._id && index === self.findIndex((l: any) => l._id?.toString() === leave._id?.toString());
    });
    
    return res.json({ success: true, data: uniqueLeaves });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch leave requests' });
  }
});

// POST /api/user/leave-requests
router.post('/', requireAuth, async (req: any, res: Response) => {
  try {
    const userId = req.user.id;
    const {
      mealPlanIds,
      startDate,
      endDate,
      mealTypes,
      startDateMealTypes = [],
      endDateMealTypes = [],
      reason
    } = req.body;

    // Validate required fields
    if (!mealPlanIds || !Array.isArray(mealPlanIds) || mealPlanIds.length === 0) {
      return res.status(400).json({ success: false, message: 'At least one meal plan is required' });
    }
    if (!startDate || !endDate) {
      return res.status(400).json({ success: false, message: 'Start date and end date are required' });
    }

    // Check for duplicate leave requests (same user, dates, and meal plans)
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    const existingLeaves = await UserLeave.find({
      userId,
      status: { $in: ['pending', 'approved'] },
      startDate: { $lte: end },
      endDate: { $gte: start }
    }).lean();

    // Check if any existing leave overlaps with the same meal plans
    for (const existing of existingLeaves) {
      const hasCommonMealPlans = (existing.mealPlanIds as any[]).some((id: any) => 
        mealPlanIds.includes(id.toString())
      );
      if (hasCommonMealPlans) {
        return res.status(400).json({ 
          success: false, 
          message: 'You already have an active leave request for the selected dates and meal plan(s)' 
        });
      }
    }

    // For middle days, use all meals if not specified (same as preview)
    const midMealTypes: Array<'breakfast'|'lunch'|'dinner'> = Array.isArray(mealTypes) && mealTypes.length > 0 
      ? (mealTypes as any) 
      : ['breakfast', 'lunch', 'dinner'];

    const avgMealCost = 50;

    // Load selected plans and current memberships for overlap computation
    const plans = await MealPlan.find({ _id: { $in: mealPlanIds } }).lean();
    const memberships = await MessMembership.find({
      userId,
      mealPlanId: { $in: mealPlanIds },
      status: { $in: ['active', 'pending'] }
    }).lean();

    const planIdToPlan: Record<string, any> = Object.fromEntries(plans.map((p: any) => [p._id.toString(), p]));
    
    // Get messId from the first membership (all should have the same messId)
    const messId = (memberships.length > 0 && (memberships[0] as any).messId) 
      ? (memberships[0] as any).messId 
      : (req.user as any).messId;

    // Compute meals strictly within each membership's subscription overlap
    // Track both requested (within overlap) and eligible (after limits) per plan
    let processedMealsSumRequested = 0;
    let processedMealsSumEligible = 0;
    let processedDaysMax = 0;
    const mealBreakdownAgg: any = { breakfast: 0, lunch: 0, dinner: 0 };
    const adjustmentMessages: any[] = [];
    for (const m of (memberships as any[])) {
      const subStart = m.subscriptionStartDate ? new Date(m.subscriptionStartDate) : start;
      const subEnd = m.subscriptionEndDate ? new Date(m.subscriptionEndDate) : end;
      subStart.setHours(0,0,0,0);
      subEnd.setHours(23,59,59,999);
      const effStart = new Date(Math.max(start.getTime(), subStart.getTime())); effStart.setHours(0,0,0,0);
      let effEnd = new Date(Math.min(end.getTime(), subEnd.getTime())); effEnd.setHours(23,59,59,999);
      if (end > subEnd) {
        const daysBeyondSubscription = Math.ceil((end.getTime() - subEnd.getTime()) / (1000 * 3600 * 24));
        if (daysBeyondSubscription > 0) {
          const adjustedEnd = new Date(subEnd); adjustedEnd.setHours(23,59,59,999);
          (req as any).adjustedEndDate = adjustedEnd;
          adjustmentMessages.push({ type: 'subscription_limit', date: subEnd.toISOString().split('T')[0], message: `Requested end exceeds subscription end; clamped to ${subEnd.toLocaleDateString()}`, daysBeyond: daysBeyondSubscription });
          effEnd = adjustedEnd;
        }
      }
      if (effEnd < effStart) continue;
      const overlapDays = Math.max(0, Math.floor((effEnd.getTime() - effStart.getTime()) / (24 * 60 * 60 * 1000)) + 1);
      processedDaysMax = Math.max(processedDaysMax, overlapDays);
      // Count meals using edge-day selection rules
      const plan = planIdToPlan[m.mealPlanId.toString()];
      const dayTypes: Array<'breakfast'|'lunch'|'dinner'> = [];
      if (plan?.mealOptions?.breakfast) dayTypes.push('breakfast');
      if (plan?.mealOptions?.lunch) dayTypes.push('lunch');
      if (plan?.mealOptions?.dinner) dayTypes.push('dinner');
      
      // Check if leave extends beyond subscription end
      const lastIsClampedToSubscription = end.getTime() > subEnd.getTime();
      
      let requestedMealsWithinOverlap = 0;
      for (let d = 0; d < overlapDays; d++) {
        const isFirst = d === 0;
        const isLast = d === overlapDays - 1;
        for (const t of dayTypes) {
          const takeStart = isFirst && (startDateMealTypes as any[]).includes(t);
          const allowEndDaySelection = !lastIsClampedToSubscription;
          const takeEnd = allowEndDaySelection && isLast && (endDateMealTypes as any[]).includes(t) && overlapDays > 1;
          const isMiddle = !isFirst && (!isLast || lastIsClampedToSubscription);
          const takeMiddle = isMiddle && (midMealTypes as any[]).includes(t);
          if (takeStart || takeEnd || takeMiddle) {
            mealBreakdownAgg[t] += 1;
            requestedMealsWithinOverlap += 1;
          }
        }
      }

      // Apply Leave Application Limits per plan (max meals)
      const mealsPerDay = Math.max(1, plan?.mealsPerDay || 3);
      let eligibleMealsForPlan = requestedMealsWithinOverlap;
      if (plan?.leaveRules?.leaveLimitsEnabled && plan?.leaveRules?.maxLeaveMealsEnabled) {
        const maxLeaveMeals = Math.max(0, plan.leaveRules?.maxLeaveMeals || 0);
        if (eligibleMealsForPlan > maxLeaveMeals) {
          eligibleMealsForPlan = maxLeaveMeals;
        }
      }

      processedMealsSumRequested += requestedMealsWithinOverlap;
      processedMealsSumEligible += eligibleMealsForPlan;
    }

    // Fallback when membership not yet created: count full requested range
    if (memberships.length === 0) {
      const totalDaysRequested = Math.max(1, Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1);
      processedDaysMax = totalDaysRequested;
      const dayTypes: Array<'breakfast'|'lunch'|'dinner'> = ['breakfast', 'lunch', 'dinner'];
      for (let d = 0; d < totalDaysRequested; d++) {
        const isFirst = d === 0;
        const isLast = d === totalDaysRequested - 1;
        for (const t of dayTypes) {
          const takeStart = isFirst && (startDateMealTypes as any[]).includes(t);
          const takeEnd = isLast && (endDateMealTypes as any[]).includes(t) && totalDaysRequested > 1;
          const isMiddle = !isFirst && !isLast;
          const takeMiddle = isMiddle && (midMealTypes as any[]).includes(t);
          if (takeStart || takeEnd || takeMiddle) {
            mealBreakdownAgg[t] += 1;
            processedMealsSumRequested += 1;
          }
        }
      }
      // No membership -> cannot infer plan limits; treat requested as eligible
      processedMealsSumEligible = processedMealsSumRequested;
    }

    // Check if ANY of the meal plans has extendSubscription enabled
    const extendSubscription = plans.some((p: any) => p.leaveRules?.extendSubscription);
    
    // Check minimum consecutive days requirement
    const minConsecutiveDaysRequired = Math.max(...plans.map((p: any) => p.leaveRules?.minConsecutiveDays || 1));
    const meetsConsecutiveDaysRequirement = processedDaysMax >= minConsecutiveDaysRequired;
    
    // If minimum consecutive days not met, no extension or savings
    const finalEstimatedSavings = meetsConsecutiveDaysRequirement 
      ? (extendSubscription ? 0 : processedMealsSumEligible * avgMealCost)
      : 0;
    const finalExtendSubscription = meetsConsecutiveDaysRequirement ? extendSubscription : false;
    const finalExtensionMeals = meetsConsecutiveDaysRequirement && finalExtendSubscription ? processedMealsSumEligible : 0;
    const finalDeductionEligibleMeals = meetsConsecutiveDaysRequirement && !finalExtendSubscription ? processedMealsSumEligible : 0;
    const finalNonDeductionMeals = meetsConsecutiveDaysRequirement && finalExtendSubscription ? processedMealsSumRequested - processedMealsSumEligible : 0;

    const leave = await UserLeave.create({
      userId,
      messId,
      mealPlanIds,
      startDate: start,
      endDate: end,
      originalEndDate: end,
      mealTypes,
      reason,
      status: 'pending',
      totalMealsMissed: processedMealsSumEligible,
      estimatedSavings: finalEstimatedSavings, // Respects consecutive days requirement
      mealBreakdown: mealBreakdownAgg,
      planWiseBreakdown: mealPlanIds.map((planId: string) => ({
        planId,
        planName: undefined,
        breakfast: mealTypes.includes('breakfast' as any) ? processedDaysMax : 0,
        lunch: mealTypes.includes('lunch' as any) ? processedDaysMax : 0,
        dinner: mealTypes.includes('dinner' as any) ? processedDaysMax : 0,
        totalMealsMissed: processedMealsSumEligible,
        estimatedSavings: finalEstimatedSavings,
      })),
      extendSubscription: finalExtendSubscription, // Respects consecutive days requirement
      extensionMeals: finalExtensionMeals,
      extensionDays: 0, // will compute below when we know mealsPerDay
      deductionEligibleMeals: finalDeductionEligibleMeals,
      deductionEligibleDays: meetsConsecutiveDaysRequirement && !finalExtendSubscription ? processedDaysMax : 0,
      nonDeductionMeals: finalNonDeductionMeals,
      subscriptionExtensionTracking: []
    });

    // Check if auto-approval is enabled for any plan
    const hasAutoApproval = plans.some((p: any) => p.leaveRules?.autoApproval);
    
    // Auto-approve if all plans have auto-approval enabled and the request is valid
    if (hasAutoApproval) {
      leave.status = 'approved';
      leave.approvedBy = userId as any;
      leave.approvedAt = new Date();
      leave.approvalRemarks = 'Auto-approved: Request complies with leave rules';
      await leave.save();
    }
    
    // If plan allows extendSubscription, calculate extension and apply if approved
    // Only extend if consecutive days requirement is met
    if (finalExtendSubscription && leave.status === 'approved' && meetsConsecutiveDaysRequirement) {
    try {
      const extensionEntries: any[] = [];
      let maxAddedDays = 0;
        let totalProcessedMeals = 0;

      for (const plan of (plans as any[])) {
          // Only extend if this specific plan allows it
          if (!plan.leaveRules?.extendSubscription) continue;

          // Find membership for this plan
        const membership = await MessMembership.findOne({
          userId,
          messId,
          mealPlanId: plan._id,
          status: { $in: ['active', 'pending'] }
        });

        if (membership) {
            const mealsPerDay = Math.max(1, plan.mealsPerDay || 3);
            
            // Calculate overlap with subscription period
            const subStart = membership.subscriptionStartDate ? new Date(membership.subscriptionStartDate) : start;
            const subEnd = membership.subscriptionEndDate ? new Date(membership.subscriptionEndDate) : new Date();
            const effStart = new Date(Math.max(start.getTime(), subStart.getTime()));
            const effEnd = new Date(Math.min(end.getTime(), subEnd.getTime()));
            
            if (effEnd >= effStart) {
              // Use the actual processed meals from the leave calculation
              const processedMeals = leave.totalMealsMissed || 0;
              const addedDays = Math.ceil(processedMeals / mealsPerDay);
              maxAddedDays = Math.max(maxAddedDays, addedDays);
              totalProcessedMeals += processedMeals;

              const originalEnd = subEnd;
              
              // Determine extension starting point based on leave relationship to subscription
              let newEnd: Date;
              
              if (end.getTime() > subEnd.getTime()) {
                // If leave extends beyond subscription: extend FROM leave end date
                newEnd = new Date(end);
                newEnd.setDate(newEnd.getDate() + addedDays);
              } else {
                // If leave is within subscription period: extend FROM subscription end date
                newEnd = new Date(subEnd);
          newEnd.setDate(newEnd.getDate() + addedDays);
              }

          extensionEntries.push({
            mealPlanId: plan._id,
            originalSubscriptionEndDate: originalEnd,
            newSubscriptionEndDate: newEnd,
            extensionAppliedAt: new Date()
          });
            }
        }
      }

        // Update leave with extension details
      leave.extensionDays = maxAddedDays;
        leave.extensionMeals = totalProcessedMeals;
      leave.subscriptionExtensionTracking = extensionEntries;
      
      // Apply subscription extension immediately since leave is auto-approved
      for (const tr of extensionEntries) {
        const membership = await MessMembership.findOne({
          userId,
          messId,
          mealPlanId: tr.mealPlanId,
          status: { $in: ['active', 'pending'] }
        });
        
        if (membership) {
          membership.leaveExtensionMeals = (membership.leaveExtensionMeals || 0) + totalProcessedMeals;
          membership.subscriptionEndDate = tr.newSubscriptionEndDate;
          await membership.save();
        }
      }
      
      await leave.save();
    } catch (e) {
      // Non-fatal; leave stays created even if extension update fails
        console.warn('Leave extension calculation failed:', e);
      }
    }

    return res.status(201).json({ success: true, data: { ...leave.toObject(), adjustmentMessages } });
  } catch (error: any) {
    console.error('Error creating leave request:', error);
    return res.status(500).json({ success: false, message: error?.message || 'Failed to create leave request' });
  }
});

// POST /api/user/leave-requests/:id/extend
router.post('/:id/extend', requireAuth, async (req: any, res: Response) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { newEndDate, reason } = req.body;

    const leave = await UserLeave.findOne({ _id: id, userId });
    if (!leave) return res.status(404).json({ success: false, message: 'Leave request not found' });

    const oldEnd = leave.endDate;
    const newEnd = new Date(newEndDate);
    
    // Validate new end date is not before start date
    if (newEnd < leave.startDate) return res.status(400).json({ success: false, message: 'New end date cannot be before start date' });
    
    // If end date hasn't changed, don't do anything
    if (newEnd.getTime() === oldEnd.getTime()) {
      return res.status(400).json({ success: false, message: 'New end date is the same as current end date' });
    }

    // Calculate change in days
    const changedDays = Math.ceil((newEnd.getTime() - oldEnd.getTime()) / (1000 * 60 * 60 * 24));
    const changedMeals = changedDays * (leave.mealTypes?.length || 3);
    
    // Calculate new total days after update
    const leaveStartDate = new Date(leave.startDate);
    const newTotalDays = Math.max(1, Math.ceil((newEnd.getTime() - leaveStartDate.getTime()) / (1000 * 60 * 60 * 24)) + 1);

    // Update end date
    leave.originalEndDate = leave.originalEndDate || oldEnd;
    leave.endDate = newEnd;
    
    // Save reason for the update in the reason field
    if (reason) {
      const updateDate = new Date().toLocaleDateString('en-GB');
      leave.reason = `${leave.reason || ''}\n\nUpdate Reason (${updateDate}): ${reason}`;
    }
    
    // Fetch meal plans to check for auto-approval and subscription extension
    const plans = await MealPlan.find({ _id: { $in: leave.mealPlanIds } });
    
    // IMPORTANT: Calculate meals ONLY within subscription overlap period (not beyond subscription enddate)
    // Need to recalculate meals based on subscription period for each plan
    let totalProcessedMeals = 0;
    let maxProcessedDays = 0;
    
    for (const plan of plans) {
      const membership = await MessMembership.findOne({
        userId,
        messId: leave.messId,
        mealPlanId: plan._id,
        status: { $in: ['active', 'pending'] }
      });
      
      if (membership) {
        const subStart = membership.subscriptionStartDate ? new Date(membership.subscriptionStartDate) : leave.startDate;
        const subEnd = membership.subscriptionEndDate ? new Date(membership.subscriptionEndDate) : new Date();
        subStart.setHours(0, 0, 0, 0);
        subEnd.setHours(23, 59, 59, 999);
        
        // Calculate overlap with subscription period (clamp to subscription boundaries)
        const effStart = new Date(Math.max(leave.startDate.getTime(), subStart.getTime()));
        const effEnd = new Date(Math.min(newEnd.getTime(), subEnd.getTime()));
        
        if (effEnd >= effStart) {
          // Count meals only within the overlap period (NOT beyond subscription end)
          const overlapDays = Math.max(0, Math.floor((effEnd.getTime() - effStart.getTime()) / (24 * 60 * 60 * 1000)) + 1);
          const mealsPerDay = Math.max(1, plan.mealsPerDay || 3);
          const mealsInOverlap = overlapDays * mealsPerDay;
          
          totalProcessedMeals = Math.max(totalProcessedMeals, mealsInOverlap);
          maxProcessedDays = Math.max(maxProcessedDays, overlapDays);
        }
      }
    }
    
    // If no membership found, fallback to calculating from full leave period
    // But ideally this shouldn't happen for existing leaves
    if (totalProcessedMeals === 0) {
      totalProcessedMeals = newTotalDays * (leave.mealTypes?.length || 3);
      maxProcessedDays = newTotalDays;
    }
    
    // Check minimum consecutive days requirement with processed days (within subscription)
    const minConsecutiveDaysRequired = Math.max(...plans.map((p: any) => p.leaveRules?.minConsecutiveDays || 1));
    const meetsConsecutiveDaysRequirement = maxProcessedDays >= minConsecutiveDaysRequired;
    
    // Update extension/savings based on consecutive days requirement
    // Use totalProcessedMeals (only meals within subscription period, NOT beyond subscription end)
    
    // If consecutive days requirement not met, set all to 0
    leave.estimatedSavings = meetsConsecutiveDaysRequirement ? leave.estimatedSavings : 0;
    leave.extensionMeals = meetsConsecutiveDaysRequirement ? totalProcessedMeals : 0;
    leave.deductionEligibleMeals = meetsConsecutiveDaysRequirement ? (leave.extendSubscription ? 0 : totalProcessedMeals) : 0;
    leave.deductionEligibleDays = meetsConsecutiveDaysRequirement ? (leave.extendSubscription ? 0 : maxProcessedDays) : 0;
    leave.totalMealsMissed = totalProcessedMeals;
    
    // Check if ALL plans have auto-approval enabled
    const allHaveAutoApproval = plans.length > 0 && plans.every((p: any) => p.leaveRules?.autoApproval);

    // Track subscription extension changes for each plan
    // Only extend if consecutive days requirement is met
    if (leave.extendSubscription && meetsConsecutiveDaysRequirement && leave.subscriptionExtensionTracking && leave.subscriptionExtensionTracking.length > 0) {
      const latestTracking = leave.subscriptionExtensionTracking[leave.subscriptionExtensionTracking.length - 1];
      
      if (latestTracking) {
        for (const plan of plans) {
          if (plan.leaveRules?.extendSubscription) {
            const membership = await MessMembership.findOne({
              userId,
              messId: leave.messId,
              mealPlanId: plan._id,
              status: { $in: ['active', 'pending'] }
            });
            
            if (membership) {
              // Get ORIGINAL subscription end date (before any leave extensions)
              // This should always come from the first tracking entry's original date
              const originalSubscriptionEnd = latestTracking.originalSubscriptionEndDate 
                ? new Date(latestTracking.originalSubscriptionEndDate)
                : membership.subscriptionEndDate || new Date();
              
              // Calculate new subscription end date based on processed meals (within subscription only)
              // Always calculate from the ORIGINAL subscription end date
              // Use totalProcessedMeals (only meals within subscription overlap, not beyond subscription end)
              const mealsPerDay = Math.max(1, plan.mealsPerDay || 3);
              const daysToAdd = Math.ceil(totalProcessedMeals / mealsPerDay);
              const newSubEnd = new Date(originalSubscriptionEnd);
              newSubEnd.setDate(newSubEnd.getDate() + daysToAdd);
              
              // Update membership
              membership.subscriptionEndDate = newSubEnd;
              membership.leaveExtensionMeals = Math.max(0, (membership.leaveExtensionMeals || 0) + changedMeals);
              await membership.save();
              
              // Add NEW tracking entry for this update
              // Always use the original subscription end as the base
              leave.subscriptionExtensionTracking.push({
                mealPlanId: plan._id as any,
                originalSubscriptionEndDate: originalSubscriptionEnd,
                newSubscriptionEndDate: newSubEnd,
        extensionAppliedAt: new Date()
      });
    }
          }
        }
      }
    }
    
    if (allHaveAutoApproval) {
      // Auto-approve the leave
      leave.status = 'approved';
      leave.approvedBy = userId as any;
      leave.approvedAt = new Date();
      leave.approvalRemarks = 'Auto-approved after end date update';
      
      await leave.save();
      
      return res.json({ 
        success: true, 
        data: leave,
        message: 'End date updated and auto-approved!' 
      });
    } else {
      // Reset status to pending for manual approval
      leave.status = 'pending';
      leave.approvedBy = null as any;
      leave.approvalRemarks = '';

    await leave.save();
      
      return res.json({ 
        success: true, 
        data: leave,
        message: 'End date updated! Request is pending approval.' 
      });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to update leave request' });
  }
});

// DELETE /api/user/leave-requests/:id
router.delete('/:id', requireAuth, async (req: any, res: Response) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const leave = await UserLeave.findOne({ _id: id, userId });
    if (!leave) return res.status(404).json({ success: false, message: 'Leave request not found' });
    // If subscription was extended, revert extension (meals and dates)
    try {
      if (leave.extendSubscription && (leave.subscriptionExtensionTracking || []).length > 0) {
        for (const tr of (leave.subscriptionExtensionTracking as any[])) {
          const membership = await MessMembership.findOne({
            userId,
            messId: leave.messId,
            mealPlanId: tr.mealPlanId,
            status: { $in: ['active', 'pending'] }
          });
          if (membership) {
            const originalEnd: Date = tr.originalSubscriptionEndDate || membership.subscriptionEndDate || new Date();
            membership.leaveExtensionMeals = Math.max(0, (membership.leaveExtensionMeals || 0) - (leave.extensionMeals || 0));
            // Revert date to original recorded end
            membership.subscriptionEndDate = new Date(originalEnd);
            await membership.save();
          }
        }
      }
    } catch (e) {
      console.warn('Reverting subscription extension failed:', e);
    }

    // Mark leave as cancelled and zero out savings
    leave.status = 'cancelled';
    leave.estimatedSavings = 0;
    leave.approvedBy = userId as any;
    leave.approvedAt = new Date();
    await leave.save();
    return res.json({ success: true, data: leave });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to cancel leave request' });
  }
});

export default router;



