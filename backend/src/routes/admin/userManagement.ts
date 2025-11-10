import { Router, Request, Response, NextFunction } from 'express';
import requireAuth from '../../middleware/requireAuth';
import { handleAuthError } from '../../middleware/errorHandler';
import User from '../../models/User';
import MessMembership from '../../models/MessMembership';

const router: Router = Router();

// Middleware to check if user is admin
const requireAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
        const userId = (req as any).user.id;
        const user = await User.findById(userId);
    
    if (!user || user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }
    
    return next();
  } catch (err) {
    return handleAuthError(res, err);
  }
};

// GET /api/admin/users - Get all users (with pagination and filters)
router.get('/', requireAuth, requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      search, 
      role, 
      status, 
      sortBy = 'createdAt', 
      sortOrder = 'desc' 
    } = req.query;

    const skip = (Number(page) - 1) * Number(limit);
    
    // Build query
    const query: any = {};
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    if (role) query.role = role;
    if (status) query.isVerified = status === 'verified';

    // Build sort object
    const sort: any = {};
    sort[sortBy as string] = sortOrder === 'desc' ? -1 : 1;

    const users = await User.find(query)
      .select('-password')
      .sort(sort)
      .skip(skip)
      .limit(Number(limit));

    const total = await User.countDocuments(query);

    // Get additional stats for each user
    const usersWithStats = await Promise.all(users.map(async (user) => {
      const memberships = await MessMembership.countDocuments({ userId: user._id });
      
      return {
        ...user.toObject(),
        totalMesses: memberships,
        lastActivity: user.lastLogin || user.createdAt
      };
    }));

    return res.status(200).json({
      success: true,
      data: {
        users: usersWithStats,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      }
    });
  } catch (err) {
    console.error('Error fetching users:', err);
    return handleAuthError(res, err);
  }
});

// GET /api/admin/users/:userId - Get specific user details
router.get('/:userId', requireAuth, requireAdmin, async (req: Request, res: Response, next: NextFunction) => {    const userId = (req as any).user.id;
    try {
    const userId = req.params['userId'];
    
    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get user's mess memberships
    const memberships = await MessMembership.find({ userId: (req as any).user.id })
      .populate('messId', 'name location')
      .populate('mealPlanId', 'name description pricing');

    const userDetails = {
      ...user.toObject(),
      memberships: memberships.map(membership => ({
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
        joinDate: membership.joinDate
      }))
    };

    return res.status(200).json({
      success: true,
      data: userDetails
    });
  } catch (err) {
    console.error('Error fetching user details:', err);
    return handleAuthError(res, err);
  }
});

// PUT /api/admin/users/:userId - Update user (admin can update any field)
router.put('/:userId', requireAuth, requireAdmin, async (req: Request, res: Response, next: NextFunction) => {    const userId = (req as any).user.id;
    try {
    const userId = req.params['userId'];
    const updateData = req.body;

    // Remove sensitive fields that shouldn't be updated
    delete updateData.password;

    const user = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: user,
      message: 'User updated successfully'
    });
  } catch (err) {
    console.error('Error updating user:', err);
    return handleAuthError(res, err);
  }
});

// DELETE /api/admin/users/:userId - Delete user
router.delete('/:userId', requireAuth, requireAdmin, async (req: Request, res: Response, next: NextFunction) => {    const userId = (req as any).user.id;
    try {
    const userId = req.params['userId'];
    
    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prevent admin from deleting themselves
    if (userId === (req as any).user.id) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete your own account'
      });
    }

    // Delete user's mess memberships first
    await MessMembership.deleteMany({ userId: (req as any).user.id });
    
    // Delete user
    await User.findByIdAndDelete(userId);

    return res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (err) {
    console.error('Error deleting user:', err);
    return handleAuthError(res, err);
  }
});

// PUT /api/admin/users/:userId/verify - Verify user account
router.put('/:userId/verify', requireAuth, requireAdmin, async (req: Request, res: Response, next: NextFunction) => {    const userId = (req as any).user.id;
    try {
    const userId = req.params['userId'];
    
    const user = await User.findByIdAndUpdate(
      userId,
      { isVerified: true },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: user,
      message: 'User account verified successfully'
    });
  } catch (err) {
    console.error('Error verifying user:', err);
    return handleAuthError(res, err);
  }
});

// PUT /api/admin/users/:userId/role - Change user role
router.put('/:userId/role', requireAuth, requireAdmin, async (req: Request, res: Response, next: NextFunction) => {    const userId = (req as any).user.id;
    try {
    const userId = req.params['userId'];
    const { role } = req.body;

    if (!role || !['user', 'admin', 'moderator'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Valid role is required (user, admin, or moderator)'
      });
    }

    // Prevent admin from changing their own role
    if (userId === (req as any).user.id) {
      return res.status(400).json({
        success: false,
        message: 'Cannot change your own role'
      });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { role },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: user,
      message: `User role changed to ${role} successfully`
    });
  } catch (err) {
    console.error('Error changing user role:', err);
    return handleAuthError(res, err);
  }
});

// POST /api/admin/users/:userId/suspend - Suspend user account
router.post('/:userId/suspend', requireAuth, requireAdmin, async (req: Request, res: Response, next: NextFunction) => {    const userId = (req as any).user.id;
    try {
    const userId = req.params['userId'];
    const { reason, duration } = req.body;
    
    if (!reason) {
      return res.status(400).json({
        success: false,
        message: 'Suspension reason is required'
      });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { 
        isSuspended: true,
        suspensionReason: reason,
        suspensionEndDate: duration ? new Date(Date.now() + duration * 24 * 60 * 60 * 1000) : null
      },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: user,
      message: 'User account suspended successfully'
    });
  } catch (err) {
    console.error('Error suspending user:', err);
    return handleAuthError(res, err);
  }
});

// POST /api/admin/users/:userId/unsuspend - Unsuspend user account
router.post('/:userId/unsuspend', requireAuth, requireAdmin, async (req: Request, res: Response, next: NextFunction) => {    const userId = (req as any).user.id;
    try {
    const userId = req.params['userId'];
    
    const user = await User.findByIdAndUpdate(
      userId,
      { 
        isSuspended: false,
        suspensionReason: null,
        suspensionEndDate: null
      },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: user,
      message: 'User account unsuspended successfully'
    });
  } catch (err) {
    console.error('Error unsuspending user:', err);
    return handleAuthError(res, err);
  }
});

export default router; 