import { Router, Request, Response, NextFunction } from 'express';
import requireAuth from '../../middleware/requireAuth';
import { handleAuthError } from '../../middleware/errorHandler';
import User from '../../models/User';
import MessMembership from '../../models/MessMembership';
import Notification from '../../models/Notification';
import { AuthenticatedRequest } from '../../types/requests';
import { ParamsDictionary } from 'express-serve-static-core';
import { ParsedQs } from 'qs';

const router: Router = Router();

// GET /api/user/activity - Get user's activity summary
router.get('/', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
    const userId = (req as any).user.id;
  try {
        // Get user's mess memberships
    const memberships = await MessMembership.find({ userId })
      .populate('messId', 'name')
      .populate('mealPlanId', 'name')
      .sort({ createdAt: -1 })
      .limit(10);

    // Get user's recent notifications
    const notifications = await Notification.find({ userId })
      .sort({ createdAt: -1 })
      .limit(10);

    // Get user's basic info
    const user = await User.findById(userId).select('firstName lastName joinDate lastLogin');

    const activitySummary = {
      user: {
        name: `${user?.firstName} ${user?.lastName}`,
        joinDate: user?.joinDate,
        lastLogin: user?.lastLogin
      },
      memberships: memberships.map(membership => ({
        id: membership._id,
        messName: (membership.messId as any)?.name || 'Unknown Mess',
        mealPlanName: (membership.mealPlanId as any)?.name || 'No Plan',
        status: membership.status,
        joinDate: membership.joinDate,
        lastActivity: membership.updatedAt
      })),
      notifications: notifications.map(notification => ({
        id: notification._id,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        status: notification.status,
        isRead: notification.isRead,
        createdAt: notification.createdAt
      })),
      stats: {
        totalMesses: memberships.length,
        activeMesses: memberships.filter(m => m.status === 'active').length,
        totalNotifications: notifications.length,
        unreadNotifications: notifications.filter(n => !n.isRead).length
      }
    };

    return res.status(200).json({
      success: true,
      data: activitySummary
    });
  } catch (err) {
    console.error('Error fetching user activity:', err);
    return handleAuthError(res, err);
  }
});

// GET /api/user/activity/memberships - Get user's mess memberships
router.get('/memberships', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
    const userId = (req as any).user.id;
  try {
        const { status, limit = 20, page = 1 } = req.query;
    
    const query: any = { userId };
    if (status) query.status = status;

    const skip = (Number(page) - 1) * Number(limit);
    
    const memberships = await MessMembership.find(query)
      .populate('messId', 'name location')
      .populate('mealPlanId', 'name description pricing')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await MessMembership.countDocuments(query);

    const formattedMemberships = memberships.map(membership => ({
      id: membership._id,
      mess: {
        id: (membership.messId as any)?._id,
        name: (membership.messId as any)?.name,
        location: (membership.messId as any)?.location
      },
      mealPlan: {
        id: (membership.mealPlanId as any)?._id,
        name: (membership.mealPlanId as any)?.name,
        description: (membership.mealPlanId as any)?.description,
        pricing: (membership.mealPlanId as any)?.pricing
      },
      status: membership.status,
      paymentStatus: membership.paymentStatus,
      joinDate: membership.joinDate,
      subscriptionStartDate: membership.subscriptionStartDate,
      subscriptionEndDate: membership.subscriptionEndDate,
      lastPaymentDate: membership.lastPaymentDate,
      nextPaymentDate: membership.nextPaymentDate
    }));

    res.status(200).json({
      success: true,
      data: {
        memberships: formattedMemberships,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      }
    });
  } catch (err) {
    console.error('Error fetching user memberships:', err);
    return handleAuthError(res, err);
  }
});

// GET /api/user/activity/notifications - Get user's notifications
router.get('/notifications', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
    const userId = (req as any).user.id;
  try {
        const { status, isRead, limit = 20, page = 1 } = req.query;
    
    const query: any = { userId };
    if (status) query.status = status;
    if (typeof isRead === 'boolean') query.isRead = isRead;

    const skip = (Number(page) - 1) * Number(limit);
    
    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Notification.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        notifications,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      }
    });
  } catch (err) {
    console.error('Error fetching user notifications:', err);
    return handleAuthError(res, err);
  }
});

// PUT /api/user/activity/notifications/read - Mark notifications as read
router.put('/notifications/read', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
    const userId = (req as any).user.id;
  try {
        const { notificationIds } = req.body;

    if (!Array.isArray(notificationIds) || notificationIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Notification IDs array is required'
      });
    }

    const result = await Notification.updateMany(
      { _id: { $in: notificationIds }, userId },
      { isRead: true }
    );

    return res.status(200).json({
      success: true,
      message: `${result.modifiedCount} notifications marked as read`,
      data: { modifiedCount: result.modifiedCount }
    });
  } catch (err) {
    console.error('Error marking notifications as read:', err);
    return handleAuthError(res, err);
  }
});

// PUT /api/user/activity/notifications/read-all - Mark all notifications as read
router.put('/notifications/read-all', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
    const userId = (req as any).user.id;
  try {
        const result = await Notification.updateMany(
      { userId, isRead: false },
      { isRead: true }
    );

    return res.status(200).json({
      success: true,
      message: `${result.modifiedCount} notifications marked as read`,
      data: { modifiedCount: result.modifiedCount }
    });
  } catch (err) {
    console.error('Error marking all notifications as read:', err);
    return handleAuthError(res, err);
  }
});

export default router; 