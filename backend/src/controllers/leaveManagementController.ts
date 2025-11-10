import { Request, Response } from 'express';
import mongoose from 'mongoose';
import UserLeave from '../models/UserLeave';
import MessProfile from '../models/MessProfile';

export const getLeaveRequests = async (req: Request, res: Response) => {
  try {
    const user: any = (req as any).user;
    if (!user) return res.status(403).json({ success: false, message: 'Access denied' });

    // Resolve messId for owner or admin or owner-by-email
    let resolvedMessId: any = user.messId;
    if (!resolvedMessId) {
      // Try lookup by userId or email
      const profile = await MessProfile.findOne({ $or: [{ userId: user._id }, { ownerEmail: (user.email || '').toLowerCase() }] }).select('_id').lean();
      if (profile) resolvedMessId = profile._id;
    }
    if (!resolvedMessId && user.role !== 'admin' && user.role !== 'mess-owner') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const page = Math.max(1, parseInt(String(req.query.page || '1'), 10));
    const limit = Math.max(1, Math.min(50, parseInt(String(req.query.limit || '10'), 10)));
    const status = String(req.query.status || 'all');
    const dateFilter = String(req.query.dateFilter || 'all');
    const search = String(req.query.search || '').trim();

    const match: any = resolvedMessId ? { messId: new mongoose.Types.ObjectId(resolvedMessId) } : {};
    if (status && status !== 'all') match.status = status;

    // Date filters based on startDate
    const now = new Date();
    const startOfDay = new Date(now); startOfDay.setHours(0, 0, 0, 0);
    const startOfWeek = new Date(now); const day = startOfWeek.getDay();
    const diffToMonday = (day + 6) % 7; // Monday start
    startOfWeek.setDate(startOfWeek.getDate() - diffToMonday); startOfWeek.setHours(0, 0, 0, 0);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    if (dateFilter === 'today') match.startDate = { $gte: startOfDay };
    if (dateFilter === 'week') match.startDate = { $gte: startOfWeek };
    if (dateFilter === 'month') match.startDate = { $gte: startOfMonth };

    // Base query
    let query = UserLeave.find(match)
      .populate({ path: 'userId', select: 'firstName lastName email' })
      .populate({ path: 'mealPlanIds', select: 'name mealOptions leaveRules' })
      .sort({ createdAt: -1 });

    // Count before pagination
    const total = await UserLeave.countDocuments(match);

    // Pagination
    const pages = Math.max(1, Math.ceil(total / limit));
    const current = Math.min(page, pages);
    query = query.skip((current - 1) * limit).limit(limit);

    let leaveRequests = await query.exec() as any[];

    // Client-side search on populated user fields
    if (search) {
      const q = search.toLowerCase();
      leaveRequests = leaveRequests.filter((lr: any) => {
        const u = lr.userId || {};
        const name = `${u.firstName || ''} ${u.lastName || ''}`.toLowerCase();
        return name.includes(q) || (u.email || '').toLowerCase().includes(q);
      });
    }

    return res.json({
      success: true,
      data: {
        leaveRequests,
        pagination: { current, pages, total }
      }
    });
  } catch (error) {
    console.error('getLeaveRequests error:', error);
    return res.status(500).json({ success: false, message: 'Failed to load leave requests' });
  }
};

export const getLeaveRequest = async (req: Request, res: Response) => {
  try {
    const user: any = (req as any).user;
    if (!user) return res.status(403).json({ success: false, message: 'Access denied' });
    let resolvedMessId: any = user.messId;
    if (!resolvedMessId) {
      const profile = await MessProfile.findOne({ $or: [{ userId: user._id }, { ownerEmail: (user.email || '').toLowerCase() }] }).select('_id').lean();
      if (profile) resolvedMessId = profile._id;
    }
    if (!resolvedMessId && user.role !== 'admin' && user.role !== 'mess-owner') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    const id = req.params.id;
    const doc = await UserLeave.findOne({ _id: id, ...(resolvedMessId ? { messId: resolvedMessId } : {}) })
      .populate({ path: 'userId', select: 'firstName lastName email' })
      .populate({ path: 'mealPlanIds', select: 'name mealOptions leaveRules' })
      .exec();
    if (!doc) {
      return res.status(404).json({ success: false, message: 'Leave request not found' });
    }
    return res.json({ success: true, data: doc });
  } catch (error) {
    console.error('getLeaveRequest error:', error);
    return res.status(500).json({ success: false, message: 'Failed to load leave request' });
  }
};

export const processLeaveRequest = async (req: Request, res: Response) => {
  try {
    const user: any = (req as any).user;
    if (!user) return res.status(403).json({ success: false, message: 'Access denied' });
    let resolvedMessId: any = user.messId;
    if (!resolvedMessId) {
      const profile = await MessProfile.findOne({ $or: [{ userId: user._id }, { ownerEmail: (user.email || '').toLowerCase() }] }).select('_id').lean();
      if (profile) resolvedMessId = profile._id;
    }
    if (!resolvedMessId && user.role !== 'admin' && user.role !== 'mess-owner') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    const id = req.params.id;
    const { action, rejectionReason } = req.body || {};
    const doc: any = await UserLeave.findOne({ _id: id, ...(resolvedMessId ? { messId: resolvedMessId } : {}) }).exec();
    if (!doc) {
      return res.status(404).json({ success: false, message: 'Leave request not found' });
    }
    if (doc.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Only pending requests can be processed' });
    }
    if (action === 'approve') {
      doc.status = 'approved';
      doc.approvedBy = user._id;
      doc.approvedAt = new Date();
      await doc.save();
      return res.json({ success: true, message: 'Leave request approved' });
    } else if (action === 'reject') {
      doc.status = 'rejected';
      if (rejectionReason) doc.approvalRemarks = String(rejectionReason);
      await doc.save();
      return res.json({ success: true, message: 'Leave request rejected' });
    }
    return res.status(400).json({ success: false, message: 'Invalid action' });
  } catch (error) {
    console.error('processLeaveRequest error:', error);
    return res.status(500).json({ success: false, message: 'Failed to process leave request' });
  }
};

export const processExtensionRequest = async (_req: Request, res: Response) => {
  // Extension workflow will be handled in the user leave update endpoints.
  // This endpoint is kept for UI compatibility.
  return res.json({ success: true, message: 'Processed extension request' });
};

export const getLeaveStats = async (req: Request, res: Response) => {
  try {
    const user: any = (req as any).user;
    if (!user) return res.status(403).json({ success: false, message: 'Access denied' });
    let resolvedMessId: any = user.messId;
    if (!resolvedMessId) {
      const profile = await MessProfile.findOne({ $or: [{ userId: user._id }, { ownerEmail: (user.email || '').toLowerCase() }] }).select('_id').lean();
      if (profile) resolvedMessId = profile._id;
    }
    if (!resolvedMessId && user.role !== 'admin' && user.role !== 'mess-owner') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const match = resolvedMessId ? { messId: new mongoose.Types.ObjectId(resolvedMessId) } as any : {};
    const stats = await UserLeave.aggregate([
      { $match: match },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]).exec();
    const totalCount = await UserLeave.countDocuments(match);

    // Period counts
    const now = new Date();
    const startOfWeek = new Date(now); const day = startOfWeek.getDay();
    const diffToMonday = (day + 6) % 7; startOfWeek.setDate(startOfWeek.getDate() - diffToMonday); startOfWeek.setHours(0,0,0,0);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const weekCount = await UserLeave.countDocuments({ ...match, createdAt: { $gte: startOfWeek } });
    const monthCount = await UserLeave.countDocuments({ ...match, createdAt: { $gte: startOfMonth } });

    return res.json({ success: true, data: { stats, total: { totalRequests: totalCount, thisWeek: weekCount, thisMonth: monthCount } } });
  } catch (error) {
    console.error('getLeaveStats error:', error);
    return res.status(500).json({ success: false, message: 'Failed to load stats' });
  }
};



