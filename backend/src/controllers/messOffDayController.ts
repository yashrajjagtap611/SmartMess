import { Request, Response, NextFunction } from 'express';
import MessOffDay from '../models/MessOffDay';
import DefaultOffDaySettings from '../models/DefaultOffDaySettings';
import MessProfile from '../models/MessProfile';
import ChatRoom from '../models/ChatRoom';
import { ChatService } from '../services/chatService';
import MealPlan from '../models/MealPlan';
import MessMembership from '../models/MessMembership';
import MessOffDayAudit from '../models/MessOffDayAudit';

interface AuthRequest extends Request {
  user?: any;
}

// Helper function to get mess profile for a mess owner
const getMessProfileForOwner = async (messOwnerId: string) => {
  return await MessProfile.findOne({ userId: messOwnerId });
};

// Get all mess off days
export const getMessOffDays = async (req: AuthRequest, res: Response, _next: NextFunction) => {
  try {
    console.log('Mess off days route called, user:', req.user);
    const messOwnerId = req.user.id;
    const { dateFilter, page = 1, limit = 10 } = req.query;
    console.log('Query params:', { dateFilter, page, limit });

    // Get mess ID from mess owner
    console.log('Looking for mess profile for owner:', messOwnerId);
    const messProfile = await getMessProfileForOwner(messOwnerId);
    console.log('Found mess profile:', messProfile);
    
    if (!messProfile) {
      console.log('No mess profile found for owner:', messOwnerId);
      return res.status(400).json({
        success: false,
        message: 'Mess owner not associated with any mess'
      });
    }

    const query: any = { messId: messProfile._id };
    
    // Add date filtering
    if (dateFilter && dateFilter !== 'all') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (dateFilter === 'upcoming') {
        query.offDate = { $gte: today };
      } else if (dateFilter === 'past') {
        query.offDate = { $lt: today };
      }
    }

    const skip = (Number(page) - 1) * Number(limit);

    const offDays = await MessOffDay.find(query)
      .populate('createdBy', 'firstName lastName')
      // Show most recently updated first; then by offDate desc for stability
      .sort({ updatedAt: -1, offDate: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await MessOffDay.countDocuments(query);

    return res.json({
      success: true,
      data: {
        offDays,
        pagination: {
          current: Number(page),
          pages: Math.ceil(total / Number(limit)),
          total
        }
      }
    });
  } catch (error) {
    console.error('Error fetching mess off days:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch mess off days',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Create a new mess off day
export const createMessOffDay = async (req: AuthRequest, res: Response, _next: NextFunction) => {
  try {
    const messOwnerId = req.user.id;
    const { offDate, reason, mealTypes, subscriptionExtension, extensionDays, startDate, endDate, startDateMealTypes, endDateMealTypes, sendAnnouncement, announcementMessage } = req.body;

    // Get mess ID from mess owner
    const messProfile = await getMessProfileForOwner(messOwnerId);
    if (!messProfile) {
      return res.status(400).json({
        success: false,
        message: 'Mess owner not associated with any mess'
      });
    }

    // Basic payload validation: require single date or range
    const hasSingle = Boolean(offDate);
    const hasRange = Boolean(startDate && endDate);
    if (!hasSingle && !hasRange) {
      return res.status(400).json({ success: false, message: 'Provide either offDate or startDate and endDate' });
    }

    // Build entries list (single-day or range)
    const entries: { date: Date; meals: string[] }[] = [];
    // Get today's date in local timezone, normalized to midnight
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    today.setMinutes(0);
    today.setSeconds(0);
    today.setMilliseconds(0);

    // Helper function to parse date string and normalize to local midnight
    // This ensures dates are parsed as local dates, not UTC, to avoid timezone issues
    const parseAndNormalizeDate = (dateInput: string | Date): Date => {
      let date: Date;
      
      if (typeof dateInput === 'string') {
        // Parse date string (format: YYYY-MM-DD) as local date, not UTC
        // Split the string to avoid timezone interpretation issues
        let dateOnly: string;
        if (dateInput.includes('T')) {
          const splitResult = dateInput.split('T');
          dateOnly = splitResult[0] || dateInput;
        } else {
          dateOnly = dateInput;
        }
        const parts = dateOnly.split('-');
        if (parts.length === 3) {
          const yearStr = parts[0];
          const monthStr = parts[1];
          const dayStr = parts[2];
          if (yearStr && monthStr && dayStr) {
            const year = parseInt(yearStr, 10);
            const month = parseInt(monthStr, 10) - 1; // Month is 0-indexed
            const day = parseInt(dayStr, 10);
            if (isNaN(year) || isNaN(month) || isNaN(day)) {
              throw new Error('Invalid date format: non-numeric values');
            }
            date = new Date(year, month, day);
          } else {
            // Fallback to standard parsing if format is different
            date = new Date(dateInput);
            if (isNaN(date.getTime())) {
              throw new Error('Invalid date format');
            }
          }
        } else {
          // Fallback to standard parsing if format is different
          date = new Date(dateInput);
          if (isNaN(date.getTime())) {
            throw new Error('Invalid date format');
          }
        }
      } else {
        date = new Date(dateInput);
        if (isNaN(date.getTime())) {
          throw new Error('Invalid date');
        }
      }
      
      // Normalize to local midnight
      date.setHours(0, 0, 0, 0);
      date.setMinutes(0);
      date.setSeconds(0);
      date.setMilliseconds(0);
      return date;
    };

    try {
      // Prefer single-day when offDate is provided. Only treat as range if offDate is absent
      if (!offDate && startDate && endDate) {
        const s = parseAndNormalizeDate(startDate);
        const e = parseAndNormalizeDate(endDate);
        if (e < s) {
          return res.status(400).json({ success: false, message: 'End date cannot be before start date' });
        }
        for (let d = new Date(s); d <= e; d.setDate(d.getDate() + 1)) {
          const isStart = d.toDateString() === s.toDateString();
          const isEnd = d.toDateString() === e.toDateString();
          const mealsForDay = isStart ? ((startDateMealTypes && startDateMealTypes.length ? startDateMealTypes : ['breakfast','lunch','dinner']))
                            : isEnd ? ((endDateMealTypes && endDateMealTypes.length ? endDateMealTypes : ['breakfast','lunch','dinner']))
                            : ['breakfast','lunch','dinner'];
          const copy = parseAndNormalizeDate(d);
          // Allow today - comparison allows today (>= today)
          if (copy < today) return res.status(400).json({ success: false, message: 'Off day cannot be in the past' });
          entries.push({ date: copy, meals: mealsForDay });
        }
      } else {
        const selectedDate = parseAndNormalizeDate(offDate);
        // Allow today - comparison allows today (>= today)
        if (selectedDate < today) return res.status(400).json({ success: false, message: 'Off date cannot be in the past' });
        entries.push({ date: selectedDate, meals: (Array.isArray(mealTypes) && mealTypes.length ? mealTypes : ['breakfast','lunch','dinner']) });
      }
    } catch (dateError) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date format. Please provide dates in YYYY-MM-DD format.',
        error: dateError instanceof Error ? dateError.message : 'Invalid date'
      });
    }

    // Ensure no duplicate ACTIVE entries exist (cancelled entries are allowed)
    for (const ent of entries) {
      const existsActive = await MessOffDay.findOne({ messId: messProfile._id, offDate: ent.date, status: 'active' as any });
      if (existsActive) {
        return res.status(400).json({ success: false, message: `An off day already exists for ${ent.date.toDateString()}` });
      }
    }

    // Create document(s)
    const createdDocs: any[] = [];
    const computedExtensionDays = subscriptionExtension ? Math.max(1, Number(extensionDays) || 1) : undefined;
    if (hasRange) {
      const s = entries[0]!.date;
      const e = entries[entries.length - 1]!.date;
      const doc = new MessOffDay({
        messId: messProfile._id,
        offDate: s,
        isRange: true,
        rangeStartDate: s,
        rangeEndDate: e,
        reason,
        mealTypes: ['breakfast','lunch','dinner'],
        startDateMealTypes: startDateMealTypes && startDateMealTypes.length ? startDateMealTypes : ['breakfast','lunch','dinner'],
        endDateMealTypes: endDateMealTypes && endDateMealTypes.length ? endDateMealTypes : ['breakfast','lunch','dinner'],
        billingDeduction: false,
        subscriptionExtension: Boolean(subscriptionExtension),
        extensionDays: computedExtensionDays,
        createdBy: messOwnerId
      });
      await doc.save();
      await MessOffDayAudit.create({ messId: messProfile._id, offDayId: doc._id, action: 'create', by: messOwnerId, snapshot: doc.toObject() });
      await doc.populate('createdBy', 'firstName lastName');
      createdDocs.push(doc);
    } else {
      const ent = entries[0]!;
      const doc = new MessOffDay({
        messId: messProfile._id,
        offDate: ent.date,
        reason,
        mealTypes: ent.meals,
        billingDeduction: false,
        subscriptionExtension: Boolean(subscriptionExtension),
        extensionDays: computedExtensionDays,
        createdBy: messOwnerId
      });
      await doc.save();
      await MessOffDayAudit.create({ messId: messProfile._id, offDayId: doc._id, action: 'create', by: messOwnerId, snapshot: doc.toObject() });
      await doc.populate('createdBy', 'firstName lastName');
      createdDocs.push(doc);
    }

    // If subscription extension enabled, extend all member subscriptions proportionally to missed meals per plan
    if (subscriptionExtension) {
      const memberships = await MessMembership.find({ messId: messProfile._id, status: { $in: ['active','pending'] } });
      const planIds = [...new Set(memberships.map((m: any) => String(m.mealPlanId)).filter(Boolean))];
      const plans = await MealPlan.find({ _id: { $in: planIds } });
      const planMap = new Map(plans.map((p: any) => [String(p._id), p]));
      // Determine overall period of the mess-off request for overlap checks
      const overallStart = entries && entries[0] ? new Date(entries[0]!.date) : new Date();
      const overallEnd = entries && entries.length > 0 ? new Date(entries[entries.length - 1]!.date) : new Date();

      for (const membership of memberships) {
        const plan = planMap.get(String(membership.mealPlanId));
        if (!plan) continue;
        const mealsPerDay = Math.max(1, plan.mealsPerDay || 3);
        const availableMealsCount = ['breakfast','lunch','dinner'].filter((m) => plan.mealOptions?.[m]).length || mealsPerDay;
        // Load approved leaves overlapping this mess-off period for this user
        let userLeaves: any[] = [];
        try {
          const UserLeaveModel = (await import('../models/UserLeave')).default as any;
          userLeaves = await UserLeaveModel.find({
            userId: membership.userId,
            status: { $in: ['approved'] },
            startDate: { $lte: overallEnd },
            endDate: { $gte: overallStart }
          }).lean();
        } catch {}

        const leaveMealsForDate = (date: Date): Set<string> => {
          const out = new Set<string>();
          const day = new Date(date); day.setHours(0,0,0,0);
          for (const lv of userLeaves) {
            const ls = new Date(lv.startDate); ls.setHours(0,0,0,0);
            const le = new Date(lv.endDate); le.setHours(0,0,0,0);
            if (day < ls || day > le) continue;
            const isFirst = day.getTime() === ls.getTime();
            const isLast = day.getTime() === le.getTime();
            const meals = isFirst ? (lv.startDateMealTypes?.length ? lv.startDateMealTypes : (lv.mealTypes?.length ? lv.mealTypes : ['breakfast','lunch','dinner']))
              : isLast ? (lv.endDateMealTypes?.length ? lv.endDateMealTypes : (lv.mealTypes?.length ? lv.mealTypes : ['breakfast','lunch','dinner']))
              : (lv.mealTypes?.length ? lv.mealTypes : ['breakfast','lunch','dinner']);
            for (const m of meals) out.add(m);
          }
          return out;
        };

        let missedMeals = 0;
        for (const ent of entries) {
          const eligible = ent.meals.filter((m: any) => plan.mealOptions?.[m]);
          if (eligible.length === 0) continue;
          const lvMeals = leaveMealsForDate(ent.date);
          for (const m of eligible) {
            if (!lvMeals.has(m)) {
              missedMeals += 1;
            }
          }
        }
        if (missedMeals <= 0) continue;
        const addDays = Math.ceil(missedMeals / (availableMealsCount || mealsPerDay));
        if (addDays <= 0) continue;
        const end = membership.subscriptionEndDate ? new Date(membership.subscriptionEndDate) : new Date();
        end.setDate(end.getDate() + addDays);
        membership.subscriptionEndDate = end;
        membership.leaveExtensionMeals = (membership.leaveExtensionMeals || 0) + missedMeals;
        await membership.save();
      }
    }

    // Send announcement to default chat group
    if (sendAnnouncement && entries.length > 0) {
      try {
        const room = await ChatRoom.findOne({ messId: messProfile._id, isDefault: true });
        if (room) {
          const formatDate = (dt: Date) => {
            const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            const dayName = days[dt.getDay()];
            return `${dayName}, ${dt.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}`;
          };
          
          const formatMeals = (meals: string[]) => {
            if (!meals || meals.length === 0) return 'All meals';
            const mealNames = meals.map(m => m.charAt(0).toUpperCase() + m.slice(1));
            if (mealNames.length === 1) return mealNames[0];
            if (mealNames.length === 2) return mealNames.join(' and ');
            return mealNames.slice(0, -1).join(', ') + ', and ' + mealNames[mealNames.length - 1];
          };

          let defaultMsg: string;
          const reasonText = (announcementMessage && String(announcementMessage).trim()) || (reason || 'Not specified');
          
          if (entries.length > 1) {
            // Multiple days
            const first = entries[0]!.date;
            const last = entries[entries.length-1]!.date;
            const allMeals = [...new Set(entries.flatMap(e => e.meals))];
            defaultMsg = [
              '🚫 **Mess Closure Notice**',
              '',
              `📅 **Dates:** ${formatDate(first)} to ${formatDate(last)}`,
              `🍽️ **Meals Affected:** ${formatMeals(allMeals)}`,
              `📝 **Reason:** ${reasonText}`,
              '',
              'Please make alternative arrangements for your meals during this period.'
            ].join('\n');
          } else {
            // Single day
            const date = entries[0]!.date;
            const meals = entries[0]!.meals;
            defaultMsg = [
              '🚫 **Mess Closure Notice**',
              '',
              `📅 **Date:** ${formatDate(date)}`,
              `🍽️ **Meals Affected:** ${formatMeals(meals)}`,
              `📝 **Reason:** ${reasonText}`,
              '',
              'Please make alternative arrangements for your meals on this day.'
            ].join('\n');
          }
          
          // Always send templated content; if custom text provided, it's used as Reason field above
          const content = defaultMsg;
          await ChatService.sendMessage(messOwnerId, { roomId: room._id.toString(), content, type: 'text' } as any);
        }
      } catch (e) {
        console.warn('Announcement send failed:', e);
      }
    }

    return res.status(201).json({ success: true, data: createdDocs, message: 'Mess off day(s) created successfully' });
  } catch (error) {
    console.error('Error creating mess off day:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create mess off day',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Update mess off day
export const updateMessOffDay = async (req: AuthRequest, res: Response, _next: NextFunction) => {
  try {
    const { id } = req.params;
    const { offDate, reason, mealTypes, billingDeduction, subscriptionExtension, extensionDays, sendAnnouncement, announcementMessage } = req.body;
    const messOwnerId = req.user.id;

    // Get mess ID from mess owner
    const messProfile = await getMessProfileForOwner(messOwnerId);
    if (!messProfile) {
      return res.status(400).json({
        success: false,
        message: 'Mess owner not associated with any mess'
      });
    }

    const offDay = await MessOffDay.findOne({ _id: id, messId: messProfile._id });
    if (!offDay) {
      return res.status(404).json({
        success: false,
        message: 'Off day not found'
      });
    }

    // Update off day fields - compute effective extension rules
    const effectiveSubscriptionExtension = (typeof subscriptionExtension === 'boolean')
      ? subscriptionExtension
      : Boolean((await MessOffDay.findById(id))?.subscriptionExtension);
    const providedExtensionDays = (extensionDays !== undefined) ? Number(extensionDays) : undefined;
    if (effectiveSubscriptionExtension && providedExtensionDays !== undefined && providedExtensionDays < 1) {
      return res.status(400).json({
        success: false,
        message: 'Extension days must be at least 1 when subscription extension is enabled'
      });
    }
    const beforeUpdateSnapshot: any = offDay.toObject();
    if (offDate) {
      // Parse date as local date to avoid timezone issues
      let selectedDate: Date;
      const offDateStr = String(offDate);
      let dateOnly: string;
      if (offDateStr.includes('T')) {
        const splitResult = offDateStr.split('T');
        dateOnly = splitResult[0] || offDateStr;
      } else {
        dateOnly = offDateStr;
      }
      const parts = dateOnly.split('-');
      if (parts.length === 3) {
        const yearStr = parts[0];
        const monthStr = parts[1];
        const dayStr = parts[2];
        if (yearStr && monthStr && dayStr) {
          const year = parseInt(yearStr, 10);
          const month = parseInt(monthStr, 10) - 1; // Month is 0-indexed
          const day = parseInt(dayStr, 10);
          if (isNaN(year) || isNaN(month) || isNaN(day)) {
            return res.status(400).json({
              success: false,
              message: 'Invalid date format: non-numeric values'
            });
          }
          selectedDate = new Date(year, month, day);
        } else {
          selectedDate = new Date(offDate);
          if (isNaN(selectedDate.getTime())) {
            return res.status(400).json({
              success: false,
              message: 'Invalid date format'
            });
          }
        }
      } else {
        selectedDate = new Date(offDate);
        if (isNaN(selectedDate.getTime())) {
          return res.status(400).json({
            success: false,
            message: 'Invalid date format'
          });
        }
      }
      selectedDate.setHours(0, 0, 0, 0);
      selectedDate.setMinutes(0);
      selectedDate.setSeconds(0);
      selectedDate.setMilliseconds(0);
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      today.setMinutes(0);
      today.setSeconds(0);
      today.setMilliseconds(0);
      
      if (selectedDate < today) {
        return res.status(400).json({
          success: false,
          message: 'Off date cannot be in the past'
        });
      }
      offDay.offDate = selectedDate;
    }
    
    if (reason) offDay.reason = reason;
    if (mealTypes) offDay.mealTypes = mealTypes;
    if (billingDeduction !== undefined) offDay.billingDeduction = billingDeduction;
    if (subscriptionExtension !== undefined) offDay.subscriptionExtension = subscriptionExtension;
    if (extensionDays !== undefined) {
      offDay.extensionDays = Math.max(1, Number(extensionDays) || 1);
    } else if (offDay.subscriptionExtension && (offDay.extensionDays === undefined || offDay.extensionDays < 1)) {
      // Ensure a sensible default when enabling extension without days
      offDay.extensionDays = 1;
    }

    await offDay.save();

    // Send announcement to default chat group if requested
    if (sendAnnouncement) {
      try {
        const room = await ChatRoom.findOne({ messId: messProfile._id, isDefault: true });
        if (room) {
          const formatDate = (dt: Date) => {
            const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            const dayName = days[dt.getDay()];
            return `${dayName}, ${dt.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}`;
          };
          
          const formatMeals = (meals: string[]) => {
            if (!meals || meals.length === 0) return 'All meals';
            const mealNames = meals.map(m => m.charAt(0).toUpperCase() + m.slice(1));
            if (mealNames.length === 1) return mealNames[0];
            if (mealNames.length === 2) return mealNames.join(' and ');
            return mealNames.slice(0, -1).join(', ') + ', and ' + mealNames[mealNames.length - 1];
          };

          const updatedDate = offDay.offDate;
          const mealsList = offDay.mealTypes || [];
          
          const reasonText = (announcementMessage && String(announcementMessage).trim()) || (reason || offDay.reason || 'Not specified');
          const defaultMsg = [
            '🔄 **Mess Closure Update**',
            '',
            `📅 **Updated Date:** ${formatDate(updatedDate)}`,
            `🍽️ **Meals Affected:** ${formatMeals(mealsList)}`,
            `📝 **Reason:** ${reasonText}`,
            '',
            'Please note the changes and make necessary arrangements.'
          ].join('\n');

          const content = defaultMsg;
          await ChatService.sendMessage(messOwnerId, { roomId: room._id.toString(), content, type: 'text' } as any);
        }
      } catch (e) {
        console.warn('Announcement send failed:', e);
      }
    }

    // Populate response
    await offDay.populate('createdBy', 'firstName lastName');

    // Audit: update (diff minimal)
    try {
      const after = offDay.toObject();
      const changes: Record<string, any> = {};
      ['offDate','reason','mealTypes','subscriptionExtension','extensionDays'].forEach((k) => {
        if (JSON.stringify((beforeUpdateSnapshot as any)[k]) !== JSON.stringify((after as any)[k])) {
          changes[k] = { before: (beforeUpdateSnapshot as any)[k], after: (after as any)[k] };
        }
      });
      if (Object.keys(changes).length > 0) {
        await MessOffDayAudit.create({ messId: messProfile._id, offDayId: offDay._id, action: 'update', by: messOwnerId, changes, snapshot: after });
      }
    } catch {}

    return res.json({
      success: true,
      message: 'Mess off day updated successfully',
      data: offDay
    });
  } catch (error) {
    console.error('Error updating mess off day:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update mess off day'
    });
  }
};

// Delete mess off day
export const deleteMessOffDay = async (req: AuthRequest, res: Response, _next: NextFunction) => {
  try {
    const { id } = req.params;
    const { sendAnnouncement, announcementMessage, isRange, startDate, endDate, dayCount } = req.body;
    const messOwnerId = req.user.id;

    // Get mess ID from mess owner
    const messProfile = await getMessProfileForOwner(messOwnerId);
    if (!messProfile) {
      return res.status(400).json({
        success: false,
        message: 'Mess owner not associated with any mess'
      });
    }

    const offDay = await MessOffDay.findOne({ _id: id, messId: messProfile._id });
    if (!offDay) {
      return res.status(404).json({
        success: false,
        message: 'Off day not found'
      });
    }

    // Store original values for reversal
    const originalBillingDeduction = offDay.billingDeduction;
    const originalSubscriptionExtension = offDay.subscriptionExtension;
    const originalExtensionDays = offDay.extensionDays;
    const originalOffDate = offDay.offDate;
    const originalReason = offDay.reason;
    const originalMealTypes = offDay.mealTypes;

    // Reverse effects that were applied at creation
    // Reverse subscription extension by subtracting the extension that this off day contributed
    if (originalSubscriptionExtension) {
      try {
        // Collect memberships and plans for this mess
        const memberships = await MessMembership.find({ messId: messProfile._id, status: { $in: ['active', 'pending'] } });
        const planIds = [...new Set(memberships.map((m: any) => String(m.mealPlanId)).filter(Boolean))];
        const plans = await MealPlan.find({ _id: { $in: planIds } });
        const planMap = new Map(plans.map((p: any) => [String(p._id), p]));

        for (const membership of memberships) {
          const plan: any = planMap.get(String(membership.mealPlanId));
          if (!plan) continue;

          // Build entries from this off day (single or range)
          const entriesFromOffDay: Array<{ date: Date; meals: string[] }> = [];
          if ((offDay as any).isRange && (offDay as any).rangeStartDate && (offDay as any).rangeEndDate) {
            const s = new Date((offDay as any).rangeStartDate); s.setHours(0,0,0,0);
            const e = new Date((offDay as any).rangeEndDate); e.setHours(0,0,0,0);
            for (let d = new Date(s); d <= e; d.setDate(d.getDate() + 1)) {
              const isFirst = d.getTime() === s.getTime();
              const isLast = d.getTime() === e.getTime();
              const meals = isFirst ? (((offDay as any).startDateMealTypes?.length ? (offDay as any).startDateMealTypes : ['breakfast','lunch','dinner']))
                : isLast ? (((offDay as any).endDateMealTypes?.length ? (offDay as any).endDateMealTypes : ['breakfast','lunch','dinner']))
                : ['breakfast','lunch','dinner'];
              const copy = new Date(d); copy.setHours(0,0,0,0);
              entriesFromOffDay.push({ date: copy, meals });
            }
          } else {
            const copy = new Date(originalOffDate); copy.setHours(0,0,0,0);
            entriesFromOffDay.push({ date: copy, meals: originalMealTypes || ['breakfast','lunch','dinner'] });
          }

          // Load user's approved leaves overlapping this off-day window
          let userLeaves: any[] = [];
          try {
            const UserLeaveModel = (await import('../models/UserLeave')).default as any;
            const s = entriesFromOffDay[0]?.date || new Date();
            const e = entriesFromOffDay[entriesFromOffDay.length - 1]?.date || s;
            userLeaves = await UserLeaveModel.find({
              userId: membership.userId,
              status: { $in: ['approved'] },
              startDate: { $lte: e },
              endDate: { $gte: s }
            }).lean();
          } catch {}

          const leaveMealsForDate = (date: Date): Set<string> => {
            const out = new Set<string>();
            const day = new Date(date); day.setHours(0,0,0,0);
            for (const lv of userLeaves) {
              const ls = new Date(lv.startDate); ls.setHours(0,0,0,0);
              const le = new Date(lv.endDate); le.setHours(0,0,0,0);
              if (day < ls || day > le) continue;
              const isFirst = day.getTime() === ls.getTime();
              const isLast = day.getTime() === le.getTime();
              const meals = isFirst ? (lv.startDateMealTypes?.length ? lv.startDateMealTypes : (lv.mealTypes?.length ? lv.mealTypes : ['breakfast','lunch','dinner']))
                : isLast ? (lv.endDateMealTypes?.length ? lv.endDateMealTypes : (lv.mealTypes?.length ? lv.mealTypes : ['breakfast','lunch','dinner']))
                : (lv.mealTypes?.length ? lv.mealTypes : ['breakfast','lunch','dinner']);
              meals.forEach((m: string) => out.add(m));
            }
            return out;
          };

          let missedMeals = 0;
          for (const ent of entriesFromOffDay) {
            const eligibleForPlan = ent.meals.filter((m: any) => plan.mealOptions?.[m]);
            if (eligibleForPlan.length === 0) continue;
            const lvMeals = leaveMealsForDate(ent.date);
            for (const m of eligibleForPlan) {
              if (!lvMeals.has(m)) {
                missedMeals += 1;
              }
            }
          }
          if (missedMeals <= 0) continue;

          const mealsPerDay = Math.max(1, plan.mealsPerDay || 3);
          const daysToSubtract = Math.ceil(missedMeals / mealsPerDay);

          // Update membership end date and counters
          if (membership.subscriptionEndDate) {
            const end = new Date(membership.subscriptionEndDate);
            end.setHours(0,0,0,0);
            end.setDate(end.getDate() - daysToSubtract);
            membership.subscriptionEndDate = end;
          }

          membership.leaveExtensionMeals = Math.max(0, (membership.leaveExtensionMeals || 0) - missedMeals);
          await membership.save();
        }
      } catch (revErr) {
        console.warn('Reversing subscription extension for off day failed:', revErr);
      }
    }

    // Audit: delete (snapshot before removal)
    try {
      await MessOffDayAudit.create({
        messId: messProfile._id,
        offDayId: offDay._id,
        action: 'delete',
        by: messOwnerId,
        snapshot: offDay.toObject(),
        note: 'Cancelled by mess owner'
      });
    } catch {}

    // Soft-cancel: mark status, keep record for history and UI visibility
    offDay.status = 'cancelled' as any;
    await offDay.save();

    // Send announcement to default chat group if requested
    if (sendAnnouncement) {
      try {
        const room = await ChatRoom.findOne({ messId: messProfile._id, isDefault: true });
        if (room) {
          const formatDate = (dt: Date | string) => {
            const dateObj = typeof dt === 'string' ? new Date(dt) : dt;
            const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            const dayName = days[dateObj.getDay()];
            return `${dayName}, ${dateObj.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}`;
          };
          
          const formatMeals = (meals: string[]) => {
            if (!meals || meals.length === 0) return 'All meals';
            const mealNames = meals.map(m => m.charAt(0).toUpperCase() + m.slice(1));
            if (mealNames.length === 1) return mealNames[0];
            if (mealNames.length === 2) return mealNames.join(' and ');
            return mealNames.slice(0, -1).join(', ') + ', and ' + mealNames[mealNames.length - 1];
          };

          const mealsList = originalMealTypes || [];
          const reasonText = (announcementMessage && String(announcementMessage).trim()) || originalReason || '';
          
          let defaultMsg: string;
          
          // Handle range cancellation
          if (isRange && startDate && endDate && dayCount) {
            defaultMsg = [
              '✅ **Mess Closure Cancelled**',
              '',
              `📅 **Cancelled Date Range:** ${formatDate(startDate)} to ${formatDate(endDate)}`,
              `📊 **Total Days:** ${dayCount} days`,
              `🍽️ **Meals That Were Off:** ${formatMeals(mealsList)}`,
              reasonText ? `📝 **Original Reason:** ${reasonText}` : '',
              '',
              'Good news! The mess will be operational as usual during this period. Normal meal service will be available.'
            ].filter(Boolean).join('\n');
          } else {
            // Single day cancellation
            defaultMsg = [
              '✅ **Mess Closure Cancelled**',
              '',
              `📅 **Cancelled Date:** ${formatDate(originalOffDate)}`,
              `🍽️ **Meals That Were Off:** ${formatMeals(mealsList)}`,
              reasonText ? `📝 **Original Reason:** ${reasonText}` : '',
              '',
              'Good news! The mess will be operational as usual. Normal meal service will be available.'
            ].filter(Boolean).join('\n');
          }

          const content = defaultMsg;
          await ChatService.sendMessage(messOwnerId, { roomId: room._id.toString(), content, type: 'text' } as any);
        }
      } catch (e) {
        console.warn('Announcement send failed:', e);
      }
    }

    return res.json({
      success: true,
      message: 'Mess off day cancelled successfully. Changes have been reversed.',
      reversalInfo: {
        billingDeductionReversed: originalBillingDeduction,
        subscriptionExtensionReversed: originalSubscriptionExtension,
        extensionDaysReversed: originalExtensionDays
      }
    });
  } catch (error) {
    console.error('Error deleting mess off day:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete mess off day'
    });
  }
};

// Get mess off day statistics
export const getMessOffDayStats = async (req: AuthRequest, res: Response, _next: NextFunction) => {
  try {
    const messOwnerId = req.user.id;

    // Get mess ID from mess owner
    const messProfile = await getMessProfileForOwner(messOwnerId);
    if (!messProfile) {
      return res.status(400).json({
        success: false,
        message: 'Mess owner not associated with any mess'
      });
    }

    const messId = messProfile._id;

    // Get current date for filtering
    const now = new Date();
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const totalOffDays = await MessOffDay.countDocuments({
      messId: messId
    });

    const thisWeekStats = await MessOffDay.countDocuments({
      messId: messId,
      createdAt: { $gte: startOfWeek }
    });

    const thisMonthStats = await MessOffDay.countDocuments({
      messId: messId,
      createdAt: { $gte: startOfMonth }
    });

    const upcomingOffDays = await MessOffDay.countDocuments({
      messId: messId,
      offDate: { $gte: new Date() }
    });

    // Create stats object
    const statsObj = {
      total: totalOffDays,
      thisWeek: thisWeekStats,
      thisMonth: thisMonthStats,
      upcoming: upcomingOffDays
    };

    return res.json({
      success: true,
      data: {
        stats: statsObj
      }
    });
  } catch (error) {
    console.error('Error fetching mess off day stats:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch mess off day statistics',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Get default off day settings
export const getDefaultOffDaySettings = async (req: AuthRequest, res: Response, _next: NextFunction) => {
  try {
    const messOwnerId = req.user.id;

    // Get mess ID from mess owner
    const messProfile = await getMessProfileForOwner(messOwnerId);
    if (!messProfile) {
      return res.status(400).json({
        success: false,
        message: 'Mess owner not associated with any mess'
      });
    }

    const settings = await DefaultOffDaySettings.findOne({ messId: messProfile._id });

    return res.json({
      success: true,
      data: {
        settings
      }
    });
  } catch (error) {
    console.error('Error fetching default off day settings:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch default off day settings',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Save default off day settings
export const saveDefaultOffDaySettings = async (req: AuthRequest, res: Response, _next: NextFunction) => {
  try {
    const messOwnerId = req.user.id;
    const { pattern, weeklySettings, monthlySettings, billingDeduction } = req.body;

    // Get mess ID from mess owner
    const messProfile = await getMessProfileForOwner(messOwnerId);
    if (!messProfile) {
      return res.status(400).json({
        success: false,
        message: 'Mess owner not associated with any mess'
      });
    }

    // Validate settings
    if (pattern === 'weekly' && (!weeklySettings || !weeklySettings.enabled)) {
      return res.status(400).json({
        success: false,
        message: 'Weekly settings must be enabled for weekly pattern'
      });
    }

    if (pattern === 'monthly' && (!monthlySettings || !monthlySettings.enabled)) {
      return res.status(400).json({
        success: false,
        message: 'Monthly settings must be enabled for monthly pattern'
      });
    }

    // Upsert settings
    const settings = await DefaultOffDaySettings.findOneAndUpdate(
      { messId: messProfile._id },
      {
        messId: messProfile._id,
        pattern,
        weeklySettings,
        monthlySettings,
        billingDeduction: billingDeduction || false
      },
      { upsert: true, new: true }
    );

    // Send concise announcement to community chat summarizing default off-day schedule
    try {
      const room = await ChatRoom.findOne({ messId: messProfile._id, isDefault: true });
      if (room) {
        const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
        const formatMeals = (meals?: string[]) => {
          const m = (meals && meals.length > 0 ? meals : ['breakfast','lunch','dinner']).map(cap);
          if (m.length === 1) return m[0];
          if (m.length === 2) return `${m[0]} and ${m[1]}`;
          return `${m.slice(0, -1).join(', ')} and ${m[m.length - 1]}`;
        };

        const lines: string[] = ['📢 **Default Mess Off Schedule Updated**', ''];
        if (weeklySettings?.enabled) {
          const dn = dayNames[Math.max(0, Math.min(6, weeklySettings.dayOfWeek || 0))];
          lines.push(`🗓️ **Weekly**: ${dn}`);
          lines.push(`🍽️ **Meals**: ${formatMeals(weeklySettings.mealTypes)}`);
          lines.push('');
        }
        if (monthlySettings?.enabled) {
          const days = (monthlySettings.daysOfMonth || []).sort((a: number, b: number)=>a-b).join(', ');
          lines.push(`📅 **Monthly**: Days ${days || '-'}`);
          lines.push(`🍽️ **Meals**: ${formatMeals(monthlySettings.mealTypes)}`);
          lines.push('');
        }
        if (!weeklySettings?.enabled && !monthlySettings?.enabled) {
          lines.push('No default mess off pattern is currently enabled.');
        }

        const content = lines.join('\n');
        await ChatService.sendMessage(messOwnerId, { roomId: room._id.toString(), content, type: 'text' } as any);
      }
    } catch (e) {
      console.warn('Default off-day announcement failed:', e);
    }

    return res.json({
      success: true,
      data: {
        settings
      },
      message: 'Default off day settings saved successfully'
    });
  } catch (error) {
    console.error('Error saving default off day settings:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to save default off day settings',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};
