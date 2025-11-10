import { Router, Request, Response, NextFunction } from 'express';
import User from '../models/User';
import requireAuth from '../middleware/requireAuth';
import { handleAuthError } from '../middleware/errorHandler';
import Notification from '../models/Notification';

import MessProfile from '../models/MessProfile';
import MessMembership from '../models/MessMembership';
import BroadcastNotification from '../models/BroadcastNotification';
import mongoose from 'mongoose';
import MealPlan from '../models/MealPlan';
import { AutoChatService } from '../services/autoChatService';
import { calculateSubscriptionEndDate } from '../utils/billingPeriodHelper';

const router: Router = Router();

// GET /api/notifications - Get all notifications for user
router.get('/', requireAuth, async (req: Request, res: Response, _next: NextFunction) => {
  try {
    const { type, status, limit = 50 } = req.query;
    const userId = (req as any).user.id;
    const userRole = (req as any).user.role;

    console.log(`🔔 Fetching notifications for user ${userId} (${userRole})`);

    // Build query
    const query: any = { userId };
    if (type) query.type = type;
    if (status) query.status = status;

    const personal = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit as string))
      .populate('messId', 'name');

    console.log(`📋 Found ${personal.length} personal notifications`);

    // Broadcast candidates: active window, audience matches user
    const now = new Date();

    // For mess-member audience we need user's active memberships
    const memberships = await MessMembership.find({ userId, status: 'active' }).select('messId');
    const userMessIds = memberships.map(m => m.messId);

    const audienceOr: any[] = [
      { audience: 'all' },
      { audience: 'role', roles: userRole }
    ];
    if (userMessIds.length) {
      audienceOr.push({ audience: 'mess_members', messId: { $in: userMessIds } });
    }

    const broadcasts = await BroadcastNotification.find({
      $and: [
        { startAt: { $lte: now } },
        { $or: [ { expiresAt: { $exists: false } }, { expiresAt: { $gte: now } } ] },
        { $or: audienceOr }
      ]
    }).sort({ startAt: -1 }).limit(parseInt(limit as string));

    console.log(`📢 Found ${broadcasts.length} broadcast notifications`);

    // Map broadcasts to unified shape and compute isRead per user
    const broadcastMapped = broadcasts.map((b: any) => ({
      _id: b._id,
      userId, // virtual for UI
      messId: b.messId,
      type: b.type || 'general',
      title: b.title,
      message: b.message,
      status: 'completed',
      data: { ...b.data, broadcast: true, priority: b.priority, audience: b.audience, roles: b.roles },
      isRead: b.reads?.some((r: any) => String(r.userId) === String(userId)) || false,
      createdAt: b.createdAt,
      updatedAt: b.updatedAt
    }));

    // Merge and sort by createdAt/startAt descending
    const mergedRaw: any[] = [...personal, ...broadcastMapped];
    const seen = new Set<string>();
    const deduped: any[] = [];
    for (const n of mergedRaw) {
      const id = String((n as any)._id || (n as any).id || '');
      const alt = `${(n as any).title || ''}|${(n as any).message || ''}|${new Date((n as any).createdAt || (n as any).updatedAt || 0).getTime()}`;
      const key = id || alt;
      if (key && !seen.has(key)) {
        seen.add(key);
        deduped.push(n);
      }
    }
    const merged = deduped
      .sort((a: any, b: any) => new Date(b.createdAt || b.updatedAt).getTime() - new Date(a.createdAt || a.updatedAt).getTime())
      .slice(0, parseInt(limit as string));

    console.log(`✅ Returning ${merged.length} total notifications`);

    return res.status(200).json({
      success: true,
      data: merged
    });
  } catch (err) {
    console.error('❌ Error fetching notifications:', err);
    return handleAuthError(res, err);
  }
});

// GET /api/notifications/unread-count - Get unread notification count
router.get('/unread-count', requireAuth, async (req: Request, res: Response, _next: NextFunction) => {
  try {
    const userId = (req as any).user.id;
    const personalUnread = await Notification.countDocuments({ userId, isRead: false });

    const now = new Date();
    const role = (req as any).user.role as 'user' | 'mess-owner' | 'admin';
    const memberships = await MessMembership.find({ userId, status: 'active' }).select('messId');
    const userMessIds = memberships.map(m => m.messId);

    const audienceOr: any[] = [
      { audience: 'all' },
      { audience: 'role', roles: role }
    ];
    if (userMessIds.length) {
      audienceOr.push({ audience: 'mess_members', messId: { $in: userMessIds } });
    }

    const userObjectId = (mongoose.Types.ObjectId.isValid(String(userId))
      ? new mongoose.Types.ObjectId(String(userId))
      : null);

    let broadcastUnread = 0;
    if (userObjectId) {
      broadcastUnread = await BroadcastNotification.countDocuments({
        $and: [
          { startAt: { $lte: now } },
          { $or: [ { expiresAt: { $exists: false } }, { expiresAt: { $gte: now } } ] },
          { $or: audienceOr },
          { reads: { $not: { $elemMatch: { userId: userObjectId } } } }
        ]
      });
    }

    return res.status(200).json({
      success: true,
      data: { unreadCount: personalUnread + broadcastUnread }
    });
  } catch (err) {
    return handleAuthError(res, err);
  }
});

// PUT /api/notifications/:id/read - Mark notification as read
router.put('/:id/read', requireAuth, async (req: Request, res: Response, _next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;

    // Try personal first
    const personal = await Notification.findOneAndUpdate(
      { _id: id, userId },
      { isRead: true },
      { new: true }
    );

    if (personal) {
      return res.status(200).json({ success: true, data: personal });
    }

    // Then broadcast: push read entry if not exists
    const broadcast = await BroadcastNotification.findById(id);
    if (!broadcast) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    const alreadyRead = broadcast.reads?.some((r: any) => String(r.userId) === String(userId));
    if (!alreadyRead) {
      broadcast.reads.push({ userId, readAt: new Date() } as any);
      await broadcast.save();
    }

    return res.status(200).json({ success: true, data: { _id: broadcast._id, isRead: true } });
  } catch (err) {
    return handleAuthError(res, err);
  }
});

// PUT /api/notifications/read-all - Mark all notifications as read
router.put('/read-all', requireAuth, async (req: Request, res: Response, _next: NextFunction) => {
  try {
    const userId = (req as any).user.id;
    await Notification.updateMany(
      { userId, isRead: false },
      { isRead: true }
    );

    // Mark broadcasts as read for this user (within active window)
    const now = new Date();
    const broadcasts = await BroadcastNotification.find({
      $and: [
        { startAt: { $lte: now } },
        { $or: [ { expiresAt: { $exists: false } }, { expiresAt: { $gte: now } } ] }
      ]
    });

    await Promise.all(broadcasts.map(async (b: any) => {
      if (!b.reads?.some((r: any) => String(r.userId) === String(userId))) {
        b.reads.push({ userId, readAt: new Date() });
        await b.save();
      }
    }));

    return res.status(200).json({
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (err) {
    return handleAuthError(res, err);
  }
});

// PUT /api/notifications/:id/action - Handle notification actions (approve/reject)
router.put('/:id/action', requireAuth, async (req: Request, res: Response, _next: NextFunction) => {
  try {
    const { id } = req.params;
    const { action, remarks } = req.body;
    const userId = (req as any).user.id;

    console.log(`🔔 Processing notification action: ${action} for notification ${id} by user ${userId}`);
    console.log(`📝 Remarks: ${remarks || 'No remarks provided'}`);

    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({ message: 'Invalid action. Must be "approve" or "reject"' });
    }

    const notification = await Notification.findOne({ _id: id, userId });
    if (!notification) {
      console.error(`❌ Notification not found: ${id} for user ${userId}`);
      return res.status(404).json({ message: 'Notification not found' });
    }

    console.log(`📋 Found notification: ${notification.type} - ${notification.title}`);

    // Store credit deduction info for response
    let creditDeductionInfo: any = null;
    
    // For reject action, update status immediately
    if (action === 'reject') {
      notification.status = 'rejected';
      notification.isRead = true;
      await notification.save();
      console.log(`✅ Notification status updated to: rejected`);
    }

    // Handle specific actions based on notification type
    // Note: join_request and payment_request are now handled by dedicated endpoints
    // See: /api/join-requests/:notificationId/approve and /api/payment-requests/:membershipId/approve
    
    // Redirect join_request actions to dedicated endpoint
    if (notification.type === 'join_request') {
          return res.status(400).json({ 
            success: false, 
        message: 'Join request actions should use dedicated endpoints: /api/join-requests/:notificationId/approve or /api/join-requests/:notificationId/reject'
      });
    }

    // Redirect payment_request actions to dedicated endpoint
    if (notification.type === 'payment_request') {
            return res.status(400).json({ 
              success: false, 
        message: 'Payment request actions should use dedicated endpoints: /api/payment-requests/:membershipId/approve or /api/payment-requests/:membershipId/reject'
      });
    }

    // Join request and payment request handling code removed - now in dedicated route files:
    // - backend/src/routes/joinRequests.ts
    // - backend/src/routes/paymentRequests.ts

    if (notification.type === 'leave_request' && action === 'approve') {
      if (notification.data?.requestingUserId) {
        try {
          // Import the leave billing service
          const { LeaveBillingService } = require('../services/leaveBillingService');
          
          // Process the approved leave for billing
          if (notification.data?.leaveId) {
            await LeaveBillingService.processApprovedLeave(notification.data.leaveId, userId);
            console.log(`✅ Leave billing processed for leave ${notification.data.leaveId}`);
          }

          const userNotification = new Notification({
            userId: notification.data.requestingUserId,
            messId: notification.messId,
            type: 'leave_request',
            title: 'Leave Request Approved',
            message: `Your leave request has been approved. The bill has been adjusted accordingly. Enjoy your time off!`,
            status: 'completed',
            data: {
              messId: notification.messId,
              leaveDays: notification.data['leaveDays'],
              approvedBy: userId,
              approvedAt: new Date().toISOString(),
              billingAdjusted: true
            },
            isRead: false
          });
          await userNotification.save();
        } catch (error) {
          console.error('Error processing leave approval and billing:', error);
        }
      }
    }

    if (notification.type === 'leave_request' && action === 'reject') {
      if (notification.data?.requestingUserId) {
        try {
          // Import the leave billing service
          const { LeaveBillingService } = require('../services/leaveBillingService');
          
          // Process the rejected leave (no billing changes needed)
          if (notification.data?.leaveId) {
            await LeaveBillingService.processRejectedLeave(notification.data.leaveId, userId, remarks);
            console.log(`❌ Leave rejection processed for leave ${notification.data.leaveId}`);
          }

          const userNotification = new Notification({
            userId: notification.data.requestingUserId,
            messId: notification.messId,
            type: 'leave_request',
            title: 'Leave Request Rejected',
            message: `Your leave request has been rejected. Please contact the mess owner for more details.`,
            status: 'rejected',
            data: {
              messId: notification.messId,
              leaveDays: notification.data['leaveDays'],
              rejectedBy: userId,
              rejectedAt: new Date().toISOString(),
              rejectionReason: remarks
            },
            isRead: false
          });
          await userNotification.save();
        } catch (error) {
          console.error('Error processing leave rejection:', error);
        }
      }
    }

    // For approve action, if notification status wasn't updated yet (shouldn't happen, but safety check)
    // This handles cases where approve action doesn't match join_request or payment_request
    if (action === 'approve' && notification.status === 'pending') {
      notification.status = 'approved';
      notification.isRead = true;
      await notification.save();
      console.log(`✅ Notification status updated to: approved (fallback for other notification types)`);
    }
    
    return res.status(200).json({
      success: true,
      data: {
        ...notification.toObject(),
        creditDeduction: creditDeductionInfo
      }
    });
  } catch (err) {
    console.error('❌ Error handling notification action:', err);
    return handleAuthError(res, err);
  }
});

// GET /api/notifications/:id - Get notification details
router.get('/:id', requireAuth, async (req: Request, res: Response, _next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;

    // Try personal first
    const personal = await Notification.findOne({ _id: id, userId });
    if (personal) {
      return res.status(200).json({ success: true, data: personal });
    }

    // Then broadcast if visible to user
    const b = await BroadcastNotification.findById(id);
    if (!b) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    return res.status(200).json({ success: true, data: b });
  } catch (err) {
    return handleAuthError(res, err);
  }
});

// POST /api/notifications/create - Create a new notification (for testing)
router.post('/create', requireAuth, async (req: Request, res: Response, _next: NextFunction) => {
  try {
    const { type, title, message, messId, data } = req.body;
    const userId = (req as any).user.id;

    const notification = new Notification({
      userId,
      type,
      title,
      message,
      messId,
      data: data || {}
    });

    await notification.save();

    return res.status(201).json({
      success: true,
      data: notification
    });
  } catch (err) {
    return handleAuthError(res, err);
  }
});

// POST /api/notifications/broadcast - Create a broadcast/shared notification (admin or mess-owner)
router.post('/broadcast', requireAuth, async (req: Request, res: Response, _next: NextFunction) => {
  try {
    const currentUser = (req as any).user;
    const { audience, roles, messId, type = 'general', title, message, priority = 'normal', startAt, expiresAt, data } = req.body;

    // Basic role guard: admin can broadcast to all/roles; mess-owner can broadcast to own mess members only
    let targetMessId = messId as string | undefined;
    if (currentUser.role === 'mess-owner') {
      if (audience !== 'mess_members') {
        return res.status(403).json({ success: false, message: 'Mess owners can broadcast only to their mess members' });
      }
      // Resolve owner's mess profile
      const profile = await MessProfile.findOne({ userId: currentUser.id });
      if (!profile) {
        return res.status(403).json({ success: false, message: 'Mess profile not found for owner' });
      }
      if (!targetMessId) {
        targetMessId = String(profile._id);
      }
      if (String(profile._id) !== String(targetMessId)) {
        return res.status(403).json({ success: false, message: 'Invalid mess context for broadcast' });
      }
    } else if (currentUser.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Only admin or mess-owner can create broadcasts' });
    }

    const bn = new BroadcastNotification({
      audience,
      roles,
      messId: targetMessId,
      type,
      title,
      message,
      priority,
      startAt: startAt ? new Date(startAt) : new Date(),
      expiresAt: expiresAt ? new Date(expiresAt) : undefined,
      data: data || {},
      createdBy: currentUser.id
    });

    await bn.save();

    return res.status(201).json({ success: true, data: bn });
  } catch (err) {
    return handleAuthError(res, err);
  }
});

// DELETE /api/notifications/:id - Delete a notification
router.delete('/:id', requireAuth, async (req: Request, res: Response, _next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;

    // Personal notifications can be deleted by owner
    const notification = await Notification.findOneAndDelete({ _id: id, userId });
    if (notification) {
      return res.status(200).json({ success: true, message: 'Notification deleted successfully' });
    }

    // Allow admin (or owner who created) to delete broadcast
    const currentUser = (req as any).user;
    const broadcast = await BroadcastNotification.findById(id);
    if (!broadcast) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    if (currentUser.role !== 'admin' && String(broadcast.createdBy) !== String(currentUser.id)) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this broadcast' });
    }

    await broadcast.deleteOne();

    return res.status(200).json({ success: true, message: 'Notification deleted successfully' });
  } catch (err) {
    return handleAuthError(res, err);
  }
});

// GET /api/notifications/subscription-updates - Get real-time subscription updates
router.get('/subscription-updates', requireAuth, async (req: Request, res: Response, _next: NextFunction) => {
  try {
    const userId = (req as any).user.id;
    // Get user's active memberships
    const memberships = await MessMembership.find({ 
      userId, 
      status: 'active' 
    }).populate([
      { path: 'messId', select: 'name location' },
      { path: 'mealPlanId', select: 'name description pricing mealType mealsPerDay' }
    ]);
    
    // Get recent notifications related to subscriptions
    const recentNotifications = await Notification.find({
      userId,
      type: { $in: ['join_request', 'payment_request', 'payment_received'] },
      status: { $in: ['completed', 'approved'] },
      createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Last 24 hours
    }).sort({ createdAt: -1 }).limit(10);
    
    res.status(200).json({
      success: true,
      data: {
        memberships: memberships.map(membership => {
          // Type guard to ensure populated fields exist
          const messId = membership.messId as any;
          const mealPlanId = membership.mealPlanId as any;
          
          return {
            id: membership._id,
            messId: messId?._id || membership.messId,
            messName: messId?.name || 'Unknown Mess',
            messLocation: messId?.location || { street: '', city: '', state: '', pincode: '' },
            mealPlanId: mealPlanId?._id || membership.mealPlanId,
            mealPlanName: mealPlanId?.name || 'Unknown Plan',
            mealPlanDescription: mealPlanId?.description || '',
            mealPlanPricing: mealPlanId?.pricing || { amount: 0, period: 'month' },
            mealType: mealPlanId?.mealType || 'Regular',
            mealsPerDay: mealPlanId?.mealsPerDay || 3,
            status: membership.status,
            paymentStatus: membership.paymentStatus,
            subscriptionStartDate: membership.subscriptionStartDate,
            lastPaymentDate: membership.lastPaymentDate,
            nextPaymentDate: membership.nextPaymentDate
          };
        }),
        recentNotifications: recentNotifications.map(notification => ({
          id: notification._id,
          type: notification.type,
          title: notification.title,
          message: notification.message,
          status: notification.status,
          createdAt: notification.createdAt,
          data: notification.data
        })),
        totalSubscriptions: memberships.length,
        maxSubscriptions: 3
      }
    });
  } catch (err) {
    return handleAuthError(res, err);
  }
});

export default router;