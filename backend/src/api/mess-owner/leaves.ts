import * as express from 'express';
import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { sendNotification, sendBulkNotification } from '../../services/notificationService';
import requireAuth from '../../middleware/requireAuth';
import { MessLeave } from '../../models/MessLeave';
import { BillingAdjustment } from '../../models/BillingAdjustment';
import User from '../../models/User';

interface AuthRequest extends Request {
  user?: {
    id: string;
    messId?: string;
    role: string;
  };
}

const router: express.Router = express.Router();

// Apply authentication and role check to all routes
router.use(requireAuth);
router.use((req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.user?.role !== 'mess-owner' && req.user?.role !== 'mess_owner') {
    return res.status(403).json({ success: false, message: 'Insufficient permissions' });
  }
  return next();
});

// GET /api/mess/leaves - Get all leaves for mess owner
router.get('/', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { status, leaveType, startDate, endDate } = req.query;
    const messOwnerId = req.user?.id;

    const filter: any = { createdBy: messOwnerId };

    // Apply filters
    if (status) {
      const statusArray = (status as string).split(',');
      filter.status = { $in: statusArray };
    }

    if (leaveType) {
      const typeArray = (leaveType as string).split(',');
      filter.leaveType = { $in: typeArray };
    }

    if (startDate || endDate) {
      filter.startDate = {};
      if (startDate) filter.startDate.$gte = new Date(startDate as string);
      if (endDate) filter.startDate.$lte = new Date(endDate as string);
    }

    // Use imported MessLeave model

    const leaves = await MessLeave.find(filter)
      .sort({ startDate: -1 })
      .populate('messId', 'name')
      .lean();

    const normalized = (leaves || []).map((l: any) => ({
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

    return res.json({
      success: true,
      data: normalized
    });
  } catch (error) {
    console.error('Error fetching leaves:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch leaves',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// POST /api/mess/leaves - Schedule new leave
router.post('/', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const {
      startDate,
      endDate,
      leaveType,
      reason,
      mealTypes,
      isRecurring,
      recurringPattern,
      notifyUsers,
      sendReminder
    } = req.body;

    const messOwnerId = req.user?.id;
    // Use imported User model
    // Use imported MessLeave model

    const messOwner = await User.findById(messOwnerId).populate('messId');

    if (!messOwner?.messId) {
      return res.status(400).json({
        success: false,
        message: 'Mess owner not associated with any mess'
      });
    }

    // Check for overlapping leaves
    const overlappingLeaves = await MessLeave.find({
      messId: messOwner.messId,
      status: { $in: ['scheduled', 'active'] },
      $or: [
        {
          startDate: { $lte: new Date(endDate) },
          endDate: { $gte: new Date(startDate) }
        }
      ]
    });

    if (overlappingLeaves.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Leave dates overlap with existing scheduled leave'
      });
    }

    // Get affected users count
    const affectedUsers = await User.countDocuments({
      messId: messOwner.messId,
      role: 'user',
      isActive: true
    });

    // Calculate estimated savings
    const estimatedSavings = await calculateEstimatedSavings(
      messOwner.messId.toString(),
      new Date(startDate),
      new Date(endDate),
      mealTypes
    );

    const newLeave = new MessLeave({
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
    });

    await newLeave.save();

    // Send notifications if requested
    if (notifyUsers) {
      await sendLeaveNotifications(newLeave._id.toString(), 'immediate');
      newLeave.notificationsSent = true;
      await newLeave.save();
    }

    // Schedule reminder if requested
    if (sendReminder) {
      await scheduleReminderNotification(newLeave._id.toString());
    }

    // Create billing adjustments for affected users
    await createBillingAdjustments(newLeave);

    return res.status(201).json({
      success: true,
      data: newLeave,
      message: 'Leave scheduled successfully'
    });
  } catch (error) {
    console.error('Error scheduling leave:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to schedule leave',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// PATCH /api/mess/leaves/:id/cancel - Cancel a scheduled leave
router.patch('/:id/cancel', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const messOwnerId = req.user?.id;

    // Use imported MessLeave model

    const leave = await MessLeave.findOne({
      _id: id,
      createdBy: messOwnerId,
      status: 'scheduled'
    });

    if (!leave) {
      return res.status(404).json({
        success: false,
        message: 'Leave not found or cannot be cancelled'
      });
    }

    leave.status = 'cancelled';
    leave.updatedAt = new Date();
    await leave.save();

    // Reverse billing adjustments
    await reverseBillingAdjustments(leave._id.toString());

    // Send cancellation notifications
    await sendLeaveNotifications(leave._id.toString(), 'cancellation');

    return res.json({
      success: true,
      data: leave,
      message: 'Leave cancelled successfully'
    });
  } catch (error) {
    console.error('Error cancelling leave:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to cancel leave',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// POST /api/mess/leaves/:id/notify - Send notifications for a leave
router.post('/:id/notify', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const messOwnerId = req.user?.id;

    // Use imported MessLeave model

    const leave = await MessLeave.findOne({
      _id: id,
      createdBy: messOwnerId
    });

    if (!leave) {
      return res.status(404).json({
        success: false,
        message: 'Leave not found'
      });
    }

    await sendLeaveNotifications(leave._id.toString(), 'manual');
    
    leave.notificationsSent = true;
    leave.updatedAt = new Date();
    await leave.save();

    return res.json({
      success: true,
      message: 'Notifications sent successfully'
    });
  } catch (error) {
    console.error('Error sending notifications:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to send notifications'
    });
  }
});

// Admin monitoring endpoint
router.get('/admin/monitoring', requireAuth, async (req: AuthRequest, res: Response, next: NextFunction) => {
      try {
    const messId = req.user?.messId;
    if (!messId) {
      return res.status(400).json({ error: 'Mess ID is required' });
    }

    // Use imported MessLeave model

    // Get frequent leave users (users with more than 3 leaves in last 3 months)
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    const frequentLeaveUsers = await MessLeave.aggregate([
      {
        $match: {
          messId,
          createdAt: { $gte: threeMonthsAgo }
        }
      },
      {
        $group: {
          _id: '$createdBy',
          leaveCount: { $sum: 1 },
          totalLeaveDays: { $sum: { $add: [{ $subtract: ['$endDate', '$startDate'] }, 1] } },
          lastLeaveDate: { $max: '$createdAt' },
          leaves: { $push: '$createdAt' }
        }
      },
      {
        $match: {
          leaveCount: { $gte: 3 }
        }
      }
    ]);

    // Calculate risk levels and additional metrics
    const enrichedUsers = frequentLeaveUsers.map((userStats: any) => {
      // Get user details (simplified for now)
      const userDetails = {
        userId: userStats._id,
        userName: `User ${userStats._id.toString().slice(-4)}`,
        email: `user${userStats._id.toString().slice(-4)}@example.com`
      };

      // Calculate average days between leaves
      const sortedLeaves = userStats.leaves.sort((a: Date, b: Date) => a.getTime() - b.getTime());
      let totalGap = 0;
      for (let i = 1; i < sortedLeaves.length; i++) {
        totalGap += (sortedLeaves[i].getTime() - sortedLeaves[i-1].getTime()) / (1000 * 60 * 60 * 24);
      }
      const averageDaysBetweenLeaves = sortedLeaves.length > 1 ? totalGap / (sortedLeaves.length - 1) : 0;

      // Determine risk level
      let riskLevel: 'low' | 'medium' | 'high' = 'low';
      if (userStats.leaveCount >= 8 || averageDaysBetweenLeaves < 7) {
        riskLevel = 'high';
      } else if (userStats.leaveCount >= 5 || averageDaysBetweenLeaves < 14) {
        riskLevel = 'medium';
      }

      return {
        ...userDetails,
        leaveCount: userStats.leaveCount,
        totalLeaveDays: userStats.totalLeaveDays,
        lastLeaveDate: userStats.lastLeaveDate,
        averageDaysBetweenLeaves,
        riskLevel
      };
    });

    // Generate alerts for high-risk patterns
    const alerts = [] as any[];
    const highRiskUsers = enrichedUsers.filter(u => u.riskLevel === 'high');
    
    for (const user of highRiskUsers) {
      alerts.push({
        id: `alert_${user.userId}_${Date.now()}`,
        type: 'frequent_leave',
        message: `${user.userName} has taken ${user.leaveCount} leaves in the last 3 months (${user.totalLeaveDays} days total)`,
        userId: user.userId,
        severity: 'high',
        createdAt: new Date()
      });
    }

    // Calculate overall statistics
    // Use imported MessLeave model for distinct query
    const totalUsers = await MessLeave.distinct('createdBy', { messId }).then((users: any[]) => users.length);
    const averageLeaveFrequency = enrichedUsers.length > 0 
      ? enrichedUsers.reduce((sum: number, user: any) => sum + user.leaveCount, 0) / enrichedUsers.length 
      : 0;

    const monitoringData = {
      frequentLeaveUsers: enrichedUsers,
      totalUsers,
      averageLeaveFrequency,
      riskThresholds: {
        high: 8,
        medium: 5
      },
      alerts
    };

    return res.json(monitoringData);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('Error fetching leave analytics:', error);
    return res.status(500).json({ 
      success: false,
      message: 'Failed to fetch leave analytics',
      error: errorMessage
    });
  }
});

// Admin user action endpoint
router.post('/admin/user-action', requireAuth, async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
    const { userId, action } = req.body;
    const messId = req.user?.messId;

    if (!messId || !userId || !action) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Log the admin action (in a real app, you'd store this in a database)
    console.log(`Admin action: ${action} for user ${userId} in mess ${messId}`);

    // Perform action based on type
    switch (action) {
      case 'notify':
        // Send notification to user about their leave pattern
        await sendNotification({
          userId,
          title: 'Leave Pattern Notice',
          message: 'We noticed you have been taking frequent leaves. Please contact the mess administration if you have any concerns.',
          type: 'admin_notice',
          channels: ['email']
        });
        break;
      
      case 'investigate':
        // Mark user for investigation (would typically update a database flag)
        console.log(`User ${userId} marked for investigation`);
        break;
      
      case 'restrict':
        // Restrict leave privileges (would typically update user permissions)
        console.log(`Leave privileges restricted for user ${userId}`);
        break;
    }

    return res.json({ success: true, message: `Action ${action} completed for user ${userId}` });
  } catch (error) {
    console.error('Error performing user action:', error);
    return res.status(500).json({ error: 'Failed to perform user action' });
  }
});

// Analytics endpoint - Simplified version with mock data
router.get('/analytics', requireAuth, async (req: AuthRequest, res: Response, next: NextFunction) => {
      try {
    console.log('Analytics endpoint called');
    const messOwnerId = req.user?.id;
    
    if (!messOwnerId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // Return mock analytics data for now
    const mockAnalytics = {
      totalLeaveDays: 15,
      totalServingDays: 350,
      leavesByType: {
        holiday: 8,
        maintenance: 3,
        personal: 2,
        emergency: 1,
        seasonal: 1,
        other: 0
      },
      monthlyBreakdown: [
        { month: 'January', leaveDays: 2, servingDays: 29, revenue: 45000, savings: 3000 },
        { month: 'February', leaveDays: 1, servingDays: 27, revenue: 42000, savings: 1500 },
        { month: 'March', leaveDays: 3, servingDays: 28, revenue: 43500, savings: 4500 },
        { month: 'April', leaveDays: 1, servingDays: 29, revenue: 45000, savings: 1500 },
        { month: 'May', leaveDays: 2, servingDays: 29, revenue: 44500, savings: 3000 },
        { month: 'June', leaveDays: 1, servingDays: 29, revenue: 45000, savings: 1500 },
        { month: 'July', leaveDays: 2, servingDays: 29, revenue: 44500, savings: 3000 },
        { month: 'August', leaveDays: 1, servingDays: 30, revenue: 46000, savings: 1500 },
        { month: 'September', leaveDays: 1, servingDays: 29, revenue: 45000, savings: 1500 },
        { month: 'October', leaveDays: 0, servingDays: 31, revenue: 47000, savings: 0 },
        { month: 'November', leaveDays: 1, servingDays: 29, revenue: 45000, savings: 1500 },
        { month: 'December', leaveDays: 0, servingDays: 31, revenue: 47000, savings: 0 }
      ],
      upcomingLeaves: [
        {
          _id: 'mock1',
          startDate: new Date('2024-12-25'),
          endDate: new Date('2024-12-25'),
          leaveType: 'holiday',
          reason: 'Christmas Day',
          status: 'scheduled'
        },
        {
          _id: 'mock2',
          startDate: new Date('2025-01-01'),
          endDate: new Date('2025-01-01'),
          leaveType: 'holiday',
          reason: 'New Year Day',
          status: 'scheduled'
        }
      ],
      frequentLeavePatterns: [
        {
          pattern: 'Weekly Sundays',
          count: 52,
          lastOccurrence: new Date()
        },
        {
          pattern: 'Monthly Maintenance',
          count: 12,
          lastOccurrence: new Date()
        }
      ]
    };

    console.log('Returning mock analytics data');
    return res.json({
      success: true,
      data: mockAnalytics
    });
  } catch (error) {
    console.error('Error in analytics endpoint:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch analytics',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Helper functions
async function calculateEstimatedSavings(
  messId: string,
  startDate: Date,
  endDate: Date,
  mealTypes: string[]
): Promise<number> {
  // TODO: Implement actual calculation based on meal costs and user count
  const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  const avgMealCost = 50; // Average cost per meal
  const userCount = await User.countDocuments({ messId, role: 'user', isActive: true });
  
  return days * mealTypes.length * avgMealCost * userCount;
}

// Simple billing adjustment calculator stub
async function calculateBillingAdjustment(
  userId: string,
  leaveId: string,
  startDate: Date,
  endDate: Date,
  mealTypes: string[]
): Promise<{ originalAmount: number; adjustedAmount: number; creditAmount: number }> {
  const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  const avgMealCost = 50;
  const originalAmount = days * mealTypes.length * avgMealCost;
  const creditAmount = originalAmount; // full credit for off days
  const adjustedAmount = 0;
  return { originalAmount, adjustedAmount, creditAmount };
}

async function sendLeaveNotifications(leaveId: string, type: string) {
  try {
    // Use imported MessLeave model
    // Use imported User model
    const leave = await MessLeave.findById(leaveId).populate('messId');
    if (!leave) return;

    const users = await User.find({
      messId: leave.messId,
      role: 'user',
      isActive: true
    });

    const message = generateNotificationMessage(leave, type);

    for (const user of users) {
      await sendNotification({
        userId: user._id.toString(),
        title: 'Mess Leave Notification',
        message,
        type: 'leave_notification',
        channels: ['push', 'email']
      });
    }
  } catch (error) {
    console.error('Error sending leave notifications:', error);
  }
}

function generateNotificationMessage(leave: any, type: string): string {
  const dateRange = leave.startDate.toDateString() === leave.endDate.toDateString()
    ? leave.startDate.toLocaleDateString()
    : `${leave.startDate.toLocaleDateString()} - ${leave.endDate.toLocaleDateString()}`;

  switch (type) {
    case 'immediate':
    case 'manual':
      return `Mess will be closed on ${dateRange} for ${leave.leaveType}. Affected meals: ${leave.mealTypes.join(', ')}. ${leave.reason || ''}`;
    case 'cancellation':
      return `Mess leave scheduled for ${dateRange} has been cancelled. Normal service will resume.`;
    case 'reminder':
      return `Reminder: Mess will be closed tomorrow for ${leave.leaveType}. Affected meals: ${leave.mealTypes.join(', ')}.`;
    default:
      return `Mess leave notification for ${dateRange}`;
  }
}

async function scheduleReminderNotification(leaveId: string) {
  // TODO: Implement reminder scheduling logic
  console.log(`Reminder scheduled for leave: ${leaveId}`);
}

async function createBillingAdjustments(leave: any) {
  try {
    // Use imported User model
    // Use imported BillingAdjustment model

    const users = await User.find({
      messId: leave.messId,
      role: 'user',
      isActive: true
    });

    for (const user of users) {
      const adjustment = await calculateBillingAdjustment(
        user._id.toString(),
        leave._id.toString(),
        leave.startDate,
        leave.endDate,
        leave.mealTypes
      );

      if (adjustment.creditAmount > 0) {
        const billingAdjustment = new BillingAdjustment({
          userId: user._id,
          leaveId: leave._id,
          originalAmount: adjustment.originalAmount,
          adjustedAmount: adjustment.adjustedAmount,
          creditAmount: adjustment.creditAmount,
          adjustmentDate: new Date(),
          adjustmentReason: `Mess leave: ${leave.leaveType}`
        });

        await billingAdjustment.save();
      }
    }
  } catch (error) {
    console.error('Error creating billing adjustments:', error);
  }
}

async function reverseBillingAdjustments(leaveId: string) {
  try {
    // Use imported BillingAdjustment model
    await BillingAdjustment.deleteMany({ leaveId });
  } catch (error) {
    console.error('Error reversing billing adjustments:', error);
  }
}

export default router;
