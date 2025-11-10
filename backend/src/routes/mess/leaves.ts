import { Router, Request, Response, NextFunction } from 'express';
import User from '../../models/User';
import mongoose from 'mongoose';
import requireAuth from '../../middleware/requireAuth';
import { sendNotification } from '../../services/notificationService';

interface AuthRequest extends Request {
  user?: {
    id: string;
    messId: string;
    role: string;
  };
}

const getMessLeaveModel = () => mongoose.model('MessLeave');
const getBillingAdjustmentModel = () => mongoose.model('BillingAdjustment');
const getUserModel = () => mongoose.model('User');

const router: Router = Router();

// Auth + role check
router.use(requireAuth);
router.use((req: Request, res: Response, next: NextFunction) => {
  const authReq = req as AuthRequest;
  if (authReq.user?.role !== 'mess-owner' && authReq.user?.role !== 'mess_owner') {
    return res.status(403).json({ success: false, message: 'Insufficient permissions' });
  }
  return next();
});

// GET /api/mess/leaves
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status, leaveType, startDate, endDate } = req.query;
    const authReq = req as AuthRequest;
    const messOwnerId = authReq.user?.id;

    const filter: any = { createdBy: messOwnerId };
    if (status) filter.status = { $in: (status as string).split(',') };
    if (leaveType) filter.leaveType = { $in: (leaveType as string).split(',') };
    if (startDate || endDate) {
      filter.startDate = {};
      if (startDate) filter.startDate.$gte = new Date(startDate as string);
      if (endDate) filter.startDate.$lte = new Date(endDate as string);
    }

    const MessLeave = getMessLeaveModel();
    const leaves = await MessLeave.find(filter).sort({ startDate: -1 }).populate('messId', 'name').lean();

    const data = (leaves || []).map((l: any) => ({
      id: l._id?.toString?.() || l.id,
      messId: l.messId?._id?.toString?.() || l.messId,
      startDate: l.startDate,
      endDate: l.endDate,
      leaveType: l.leaveType,
      reason: l.reason,
      mealTypes: l.mealTypes,
      isRecurring: l.isRecurring,
      recurringPattern: l.recurringPattern,
      status: l.status,
      notificationsSent: l.notificationsSent,
      createdBy: l.createdBy?.toString?.() || l.createdBy,
      createdAt: l.createdAt,
      updatedAt: l.updatedAt,
      affectedUsers: l.affectedUsers || 0,
      estimatedSavings: l.estimatedSavings || 0
    }));

    return res.json({ success: true, data });
  } catch (error) {
    console.error('Error fetching leaves:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch leaves' });
  }
});

// POST /api/mess/leaves
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { startDate, endDate, leaveType, reason, mealTypes, isRecurring, recurringPattern, notifyUsers, sendReminder } = req.body;

    const User = getUserModel();
    const MessLeave = getMessLeaveModel();
    const authReq = req as AuthRequest;
    const messOwnerId = authReq.user?.id;
    const messOwner = await User.findById(messOwnerId).populate('messId');

    if (!messOwner?.messId) {
      return res.status(400).json({ success: false, message: 'Mess owner not associated with any mess' });
    }

    const overlapping = await MessLeave.find({
      messId: messOwner.messId,
      status: { $in: ['scheduled', 'active'] },
      $or: [{ startDate: { $lte: new Date(endDate) }, endDate: { $gte: new Date(startDate) } }]
    });
    if (overlapping.length) {
      return res.status(400).json({ success: false, message: 'Leave dates overlap with existing scheduled leave' });
    }

    const affectedUsers = await User.countDocuments({ messId: messOwner.messId, role: 'user', isActive: true });

    const estimatedSavings = await (async () => {
      const days = Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1;
      const avgMealCost = 50;
      const userCount = affectedUsers;
      return days * (mealTypes?.length || 0) * avgMealCost * userCount;
    })();

    const newLeave = await new MessLeave({
      messId: messOwner.messId,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      leaveType,
      reason,
      mealTypes,
      isRecurring,
      recurringPattern,
      status: 'scheduled',
      notificationsSent: false,
      createdBy: messOwnerId,
      affectedUsers,
      estimatedSavings
    }).save();

    if (notifyUsers) {
      await sendLeaveNotifications(newLeave._id.toString(), 'immediate');
      newLeave.notificationsSent = true;
      await newLeave.save();
    }

    if (sendReminder) {
      console.log(`Reminder scheduled for leave: ${newLeave._id.toString()}`);
    }

    await createBillingAdjustments(newLeave);

    return res.status(201).json({ success: true, data: newLeave, message: 'Leave scheduled successfully' });
  } catch (error) {
    console.error('Error scheduling leave:', error);
    return res.status(500).json({ success: false, message: 'Failed to schedule leave' });
  }
});

// PATCH /api/mess/leaves/:id/cancel
router.patch('/:id/cancel', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const authReq = req as AuthRequest;
    const messOwnerId = authReq.user?.id;
    const MessLeave = getMessLeaveModel();

    const leave = await MessLeave.findOne({ _id: id, createdBy: messOwnerId, status: 'scheduled' });
    if (!leave) return res.status(404).json({ success: false, message: 'Leave not found or cannot be cancelled' });

    leave.status = 'cancelled';
    leave.updatedAt = new Date();
    await leave.save();

    await reverseBillingAdjustments(leave._id.toString());
    await sendLeaveNotifications(leave._id.toString(), 'cancellation');

    return res.json({ success: true, data: leave, message: 'Leave cancelled successfully' });
  } catch (error) {
    console.error('Error cancelling leave:', error);
    return res.status(500).json({ success: false, message: 'Failed to cancel leave' });
  }
});

// POST /api/mess/leaves/:id/notify
router.post('/:id/notify', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const authReq = req as AuthRequest;
    const messOwnerId = authReq.user?.id;
    const MessLeave = getMessLeaveModel();

    const leave = await MessLeave.findOne({ _id: id, createdBy: messOwnerId });
    if (!leave) return res.status(404).json({ success: false, message: 'Leave not found' });

    await sendLeaveNotifications(leave._id.toString(), 'manual');
    leave.notificationsSent = true;
    leave.updatedAt = new Date();
    await leave.save();

    return res.json({ success: true, message: 'Notifications sent successfully' });
  } catch (error) {
    console.error('Error sending notifications:', error);
    return res.status(500).json({ success: false, message: 'Failed to send notifications' });
  }
});

// GET /api/mess/leaves/analytics
router.get('/analytics', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const User = getUserModel();
    const MessLeave = getMessLeaveModel();
    const authReq = req as AuthRequest;
    const messOwnerId = authReq.user?.id;

    if (!messOwnerId) {
      console.error('Missing user ID in request');
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const messOwner = await User.findById(messOwnerId).populate('messId');
    if (!messOwner) {
      console.error(`User not found: ${messOwnerId}`);
      return res.status(404).json({ success: false, message: 'Mess owner account not found' });
    }
    
    if (!messOwner.messId) {
      console.error(`Mess owner has no associated mess: ${messOwnerId}`);
      return res.status(400).json({ success: false, message: 'Mess owner not associated with any mess' });
    }

    const currentYear = new Date().getFullYear();
    const startOfYear = new Date(currentYear, 0, 1);
    const endOfYear = new Date(currentYear, 11, 31);

    // Fetch active and scheduled leaves for current year
    const leaves = await MessLeave.find({ 
      messId: messOwner.messId, 
      startDate: { $gte: startOfYear, $lte: endOfYear },
      status: { $in: ['active', 'scheduled'] }
    }).lean();

    if (!Array.isArray(leaves)) {
      console.error('Invalid response from MessLeave.find()');
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to fetch leaves data',
        error: 'Invalid database response'
      });
    }

    // Calculate total leave days with validation
    const totalLeaveDays = leaves.reduce((total: number, leave: any) => {
      if (!leave.startDate || !leave.endDate) {
        console.warn('Leave missing date information:', leave._id);
        return total;
      }
      try {
        const startTime = new Date(leave.startDate).getTime();
        const endTime = new Date(leave.endDate).getTime();
        if (isNaN(startTime) || isNaN(endTime)) {
          console.warn('Invalid date format for leave:', leave._id);
          return total;
        }
        const days = Math.ceil((endTime - startTime) / (1000 * 60 * 60 * 24)) + 1;
        return total + (days > 0 ? days : 0);
      } catch (err) {
        console.warn('Error calculating leave days for:', leave._id, err);
        return total;
      }
    }, 0);

    // Calculate leaves by type with validation
    const leavesByType = leaves.reduce((acc: Record<string, number>, leave: any) => {
      const validTypes = ['holiday', 'maintenance', 'personal', 'emergency', 'seasonal', 'other'];
      const leaveType = leave.leaveType && validTypes.includes(leave.leaveType) ? leave.leaveType : 'other';
      acc[leaveType] = (acc[leaveType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Calculate monthly breakdown with validation
    const monthlyBreakdown = [] as any[];
    for (let month = 0; month < 12; month++) {
      try {
        const monthStart = new Date(currentYear, month, 1);
        const monthEnd = new Date(currentYear, month + 1, 0);
        
        if (isNaN(monthStart.getTime()) || isNaN(monthEnd.getTime())) {
          console.error(`Invalid month dates: month ${month}, year ${currentYear}`);
          continue;
        }

        const monthLeaves = leaves.filter((l: any) => {
          try {
            const startDate = new Date(l.startDate);
            return startDate >= monthStart && startDate <= monthEnd;
          } catch (err) {
            console.warn('Error filtering leave for month:', l._id, err);
            return false;
          }
        });

        const monthLeaveDays = monthLeaves.reduce((total: number, l: any) => {
          try {
            const startTime = new Date(l.startDate).getTime();
            const endTime = new Date(l.endDate).getTime();
            if (isNaN(startTime) || isNaN(endTime)) return total;
            const days = Math.ceil((endTime - startTime) / (1000 * 60 * 60 * 24)) + 1;
            return total + (days > 0 ? days : 0);
          } catch (err) {
            console.warn('Error calculating monthly leave days:', l._id, err);
            return total;
          }
        }, 0);

        monthlyBreakdown.push({
          month: monthStart.toLocaleDateString('en-US', { month: 'long' }),
          leaveDays: monthLeaveDays,
          servingDays: Math.max(0, monthEnd.getDate() - monthLeaveDays),
          revenue: 0,
          savings: monthLeaves.reduce((t: number, l: any) => {
            const savings = Number(l.estimatedSavings);
            return t + (isNaN(savings) ? 0 : savings);
          }, 0)
        });
      } catch (err) {
        console.error(`Error processing month ${month}:`, err);
        monthlyBreakdown.push({
          month: new Date(currentYear, month, 1).toLocaleDateString('en-US', { month: 'long' }),
          leaveDays: 0,
          servingDays: new Date(currentYear, month + 1, 0).getDate(),
          revenue: 0,
          savings: 0
        });
      }
    }

    // Get upcoming leaves with validation
    const now = new Date();
    if (isNaN(now.getTime())) {
      console.error('Invalid current date');
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: 'Invalid date calculation'
      });
    }

    const upcomingLeaves = await MessLeave.find({
      messId: messOwner.messId,
      startDate: { $gte: now },
      status: { $in: ['scheduled', 'active'] }
    }).sort({ startDate: 1 }).limit(5).lean();

    if (!Array.isArray(upcomingLeaves)) {
      console.error('Invalid response from upcomingLeaves query');
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch upcoming leaves',
        error: 'Invalid database response'
      });
    }

    // Calculate serving days with validation
    const isLeapYear = new Date(currentYear, 1, 29).getMonth() === 1;
    const daysInYear = isLeapYear ? 366 : 365;
    const totalServingDays = Math.max(0, daysInYear - totalLeaveDays);

    return res.json({
      success: true,
      data: {
        totalLeaveDays,
        totalServingDays,
        leavesByType: {
          holiday: leavesByType['holiday'] || 0,
          maintenance: leavesByType['maintenance'] || 0,
          personal: leavesByType['personal'] || 0,
          emergency: leavesByType['emergency'] || 0,
          seasonal: leavesByType['seasonal'] || 0,
          other: leavesByType['other'] || 0
        },
        monthlyBreakdown,
        upcomingLeaves,
        frequentLeavePatterns: []
      }
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('Error fetching analytics:', errorMessage);
    console.error(error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch analytics',
      error: errorMessage
    });
  }
});

async function sendLeaveNotifications(leaveId: string, type: string) {
  const MessLeave = getMessLeaveModel();
  const User = getUserModel();
  const leave = await MessLeave.findById(leaveId).populate('messId');
  if (!leave) return;

  const users = await User.find({ messId: leave.messId, role: 'user', isActive: true });
  const dateRange = leave.startDate.toDateString() === leave.endDate.toDateString()
    ? leave.startDate.toLocaleDateString()
    : `${leave.startDate.toLocaleDateString()} - ${leave.endDate.toLocaleDateString()}`;
  const message = type === 'cancellation'
    ? `Mess leave scheduled for ${dateRange} has been cancelled. Normal service will resume.`
    : `Mess will be closed on ${dateRange} for ${leave.leaveType}. Affected meals: ${leave.mealTypes.join(', ')}. ${leave.reason || ''}`;

  for (const user of users) {
    await sendNotification({ userId: user._id.toString(), title: 'Mess Leave Notification', message, type: 'leave_notification', channels: ['push', 'email'] });
  }
}

async function createBillingAdjustments(leave: any) {
  const BillingAdjustment = getBillingAdjustmentModel();
  const User = getUserModel();
  const users = await User.find({ messId: leave.messId, role: 'user', isActive: true });

  for (const user of users) {
    const days = Math.ceil((leave.endDate.getTime() - leave.startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    const avgMealCost = 50;
    const originalAmount = days * (leave.mealTypes?.length || 0) * avgMealCost;
    const creditAmount = originalAmount;

    if (creditAmount > 0) {
      await new (BillingAdjustment as any)({
        userId: user._id,
        leaveId: leave._id,
        originalAmount,
        adjustedAmount: 0,
        creditAmount,
        adjustmentDate: new Date(),
        adjustmentReason: `Mess leave: ${leave.leaveType}`
      }).save();
    }
  }
}

async function reverseBillingAdjustments(leaveId: string) {
  const BillingAdjustment = getBillingAdjustmentModel();
  await BillingAdjustment.deleteMany({ leaveId });
}

export default router; 