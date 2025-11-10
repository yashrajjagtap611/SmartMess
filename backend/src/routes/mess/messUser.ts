import { Router, Request, Response, NextFunction } from 'express';
import requireAuth from '../../middleware/requireAuth';
import { handleAuthError } from '../../middleware/errorHandler';
import MessProfile from '../../models/MessProfile';
import MessMembership from '../../models/MessMembership';
import User from '../../models/User';
import PaymentSettings from '../../models/PaymentSettings';

const router: Router = Router();

// GET /api/mess/user/:userId - Get detailed user information
router.get('/:userId', requireAuth, async (req: Request, res: Response, _next: NextFunction) => {    const userId = (req as any).user.id;
    try {
    const messOwnerId = (req as any).user.id;
    const userId = req.params['userId'];

    // First, verify that the current user is a mess owner
    const messProfile = await MessProfile.findOne({ userId: messOwnerId });
    if (!messProfile) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only mess owners can view user details.'
      });
    }

    // Get user's basic information
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get all memberships for this user in this mess
    const memberships = await MessMembership.find({
      userId: userId,
      messId: messProfile._id
    }).populate('mealPlanId', 'name description pricing');

    if (memberships.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User is not a member of this mess'
      });
    }

    // Get user's payment history from this mess
    const paymentHistory = await PaymentSettings.find({
      userId: userId,
      messId: messProfile._id
    }).sort({ createdAt: -1 }).limit(10);

    // Group memberships by meal plan and calculate aggregate information
    const mealPlanDetails = memberships.map(membership => {
      const mealPlan = membership.mealPlanId as any;
      return {
        id: membership._id,
        mealPlanId: mealPlan ? mealPlan._id : null,
        mealPlanName: mealPlan ? mealPlan.name : 'No Plan',
        mealPlanDescription: mealPlan ? mealPlan.description : 'No plan assigned',
        status: membership.status,
        paymentStatus: membership.paymentStatus,
        joinDate: membership.joinDate,
        subscriptionStartDate: membership.subscriptionStartDate,
        subscriptionEndDate: membership.subscriptionEndDate,
        lastPaymentDate: membership.lastPaymentDate,
        nextPaymentDate: membership.nextPaymentDate
      };
    });

    // Calculate aggregate information
    const totalPlans = memberships.length;
    const activePlans = memberships.filter(m => m.status === 'active').length;
    const paidPlans = memberships.filter(m => m.paymentStatus === 'paid').length;
    const pendingPlans = memberships.filter(m => m.paymentStatus === 'pending').length;
    const overduePlans = memberships.filter(m => m.paymentStatus === 'overdue').length;

    // Determine overall status
    const isActive = activePlans > 0;
    let overallPaymentStatus = 'Paid';
    if (overduePlans > 0) {
      overallPaymentStatus = 'Overdue';
    } else if (pendingPlans > 0) {
      overallPaymentStatus = 'Pending';
    }

    return res.status(200).json({
      success: true,
      data: {
        id: user._id,
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
        phone: user.phone,
        avatar: user.messPhotoUrl || null,
        isActive: isActive,
        overallPaymentStatus: overallPaymentStatus,
        totalPlans: totalPlans,
        activePlans: activePlans,
        paidPlans: paidPlans,
        pendingPlans: pendingPlans,
        overduePlans: overduePlans,
        mealPlanDetails: mealPlanDetails,
        paymentHistory: paymentHistory,
        joinDate: memberships[0]?.joinDate,
        lastActive: memberships[0]?.joinDate
      }
    });
  } catch (err) {
    console.error('Error fetching user details:', err);
    return handleAuthError(res, err);
  }
});

// PUT /api/mess/user/:userId/status - Update user status
router.put('/:userId/status', requireAuth, async (req: Request, res: Response, _next: NextFunction) => {    const userId = (req as any).user.id;
    try {
    const messOwnerId = (req as any).user.id;
    const userId = req.params['userId'];
    const { isActive } = req.body;

    // Verify that the current user is a mess owner
    const messProfile = await MessProfile.findOne({ userId: messOwnerId });
    if (!messProfile) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only mess owners can update user status.'
      });
    }

    // Update all memberships for this user in this mess
    const result = await MessMembership.updateMany(
      { userId: userId, messId: messProfile._id },
      { status: isActive ? 'active' : 'inactive' }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'User is not a member of this mess'
      });
    }

    return res.status(200).json({
      success: true,
      message: `User status updated to ${isActive ? 'active' : 'inactive'}`
    });
  } catch (err) {
    console.error('Error updating user status:', err);
    return handleAuthError(res, err);
  }
});

// PUT /api/mess/user/:userId/payment-status - Update user payment status
router.put('/:userId/payment-status', requireAuth, async (req: Request, res: Response, _next: NextFunction) => {    const userId = (req as any).user.id;
    try {
    const messOwnerId = (req as any).user.id;
    const userId = req.params['userId'];
    const { paymentStatus } = req.body;

    // Verify that the current user is a mess owner
    const messProfile = await MessProfile.findOne({ userId: messOwnerId });
    if (!messProfile) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only mess owners can update payment status.'
      });
    }

    // Update all memberships for this user in this mess
    const result = await MessMembership.updateMany(
      { userId: userId, messId: messProfile._id },
      { paymentStatus: paymentStatus.toLowerCase() }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'User is not a member of this mess'
      });
    }

    return res.status(200).json({
      success: true,
      message: `User payment status updated to ${paymentStatus}`
    });
  } catch (err) {
    console.error('Error updating user payment status:', err);
    return handleAuthError(res, err);
  }
});

// DELETE /api/mess/user/:userId - Remove user from mess
router.delete('/:userId', requireAuth, async (req: Request, res: Response, _next: NextFunction) => {    const userId = (req as any).user.id;
    try {
    const messOwnerId = (req as any).user.id;
    const userId = req.params['userId'];

    // Verify that the current user is a mess owner
    const messProfile = await MessProfile.findOne({ userId: messOwnerId });
    if (!messProfile) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only mess owners can remove users.'
      });
    }

    // Remove all memberships for this user in this mess
    const result = await MessMembership.deleteMany({
      userId: userId,
      messId: messProfile._id
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'User is not a member of this mess'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'User removed from mess successfully'
    });
  } catch (err) {
    console.error('Error removing user from mess:', err);
    return handleAuthError(res, err);
  }
});

export default router; 