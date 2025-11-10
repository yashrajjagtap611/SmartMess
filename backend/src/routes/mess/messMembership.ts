import { Router, Request, Response, NextFunction } from 'express';
import requireAuth from '../../middleware/requireAuth';
import MessProfile from '../../models/MessProfile';
import MessMembership from '../../models/MessMembership';
import mongoose from 'mongoose';

const router: Router = Router();

// GET /api/mess/members - Get all members for a mess owner
router.get('/', requireAuth, async (req: Request, res: Response, _next: NextFunction) => {
    const userId = (req as any).user.id;
  try {
        console.log('Fetching members for mess owner:', userId);

    // First, find the mess profile owned by this user
    const messProfile = await MessProfile.findOne({ userId });
    if (!messProfile) {
      // Return empty list instead of 404 to avoid breaking owner UI when profile is not set up yet
      return res.status(200).json({
        success: true,
        data: [],
        message: 'No mess profile found for this user'
      });
    }

    console.log('Found mess profile:', messProfile.name);

    // Get all memberships for this mess
    const memberships = await MessMembership.find({ 
      messId: messProfile._id 
    }).populate('userId', 'firstName lastName email phone messPhotoUrl').populate('mealPlanId', 'name description pricing');

    console.log('Found memberships:', memberships.length);

    // Group memberships by user to prevent duplicates
    const userGroups = new Map();
    
    memberships.forEach(membership => {
      const user = membership.userId as any;
      const mealPlan = membership.mealPlanId as any;
      const userId = user._id.toString();
      
      if (!userGroups.has(userId)) {
        // Initialize user group with safe defaults
        userGroups.set(userId, {
          id: userId,
          name: `${user.firstName || 'Unknown'} ${user.lastName || 'User'}`,
          email: user.email || 'No email',
          avatar: user.messPhotoUrl || null,
          plans: [],
          meals: 45,
          paymentStatus: 'Paid',
          paymentAmount: 0,
          isActive: true,
          joinDate: membership.joinDate || new Date(),
          subscriptionStartDate: membership.subscriptionStartDate || null,
          subscriptionEndDate: membership.subscriptionEndDate || null,
          lastPaymentDate: membership.lastPaymentDate || null,
          nextPaymentDate: membership.nextPaymentDate || null,
          totalPlans: 0,
          totalMonthlyAmount: 0,
          paidPlans: 0,
          pendingPlans: 0,
          overduePlans: 0,
          activePlans: 0
        });
      }
      
      // Add meal plan to user's plans array
      const userGroup = userGroups.get(userId);
      userGroup.plans.push({
        id: mealPlan ? mealPlan._id.toString() : 'no-plan',
        name: mealPlan ? mealPlan.name : 'No Plan',
        description: mealPlan ? mealPlan.description : 'No plan assigned',
        pricing: mealPlan ? mealPlan.pricing : null,
        status: membership.status || 'active',
        paymentStatus: membership.paymentStatus || 'paid',
        subscriptionStartDate: membership.subscriptionStartDate || null,
        subscriptionEndDate: membership.subscriptionEndDate || null
      });
      
      // Update payment status counts
      if (membership.paymentStatus === 'overdue') {
        userGroup.overduePlans++;
      } else if (membership.paymentStatus === 'pending') {
        userGroup.pendingPlans++;
      } else if (membership.paymentStatus === 'paid') {
        userGroup.paidPlans++;
      }
      
      // Update active status counts
      if (membership.status === 'active') {
        userGroup.activePlans++;
      }
      
      // Calculate total monthly amount
      if (mealPlan && mealPlan.pricing && mealPlan.pricing.amount) {
        userGroup.totalMonthlyAmount += mealPlan.pricing.amount;
      }
    });

    // Process each user group to determine final statuses
    const processedUsers = Array.from(userGroups.values()).map(userGroup => {
      // Determine overall payment status
      let overallPaymentStatus = 'Paid';
      if (userGroup.overduePlans > 0) {
        overallPaymentStatus = 'Overdue';
      } else if (userGroup.pendingPlans > 0) {
        overallPaymentStatus = 'Pending';
      }

      // Determine if user is active
      const isActive = userGroup.activePlans > 0;

      // Calculate total plans
      userGroup.totalPlans = userGroup.plans.length;

      return {
        ...userGroup,
        paymentStatus: overallPaymentStatus,
        isActive: isActive
      };
    });

    return res.status(200).json({
      success: true,
      data: processedUsers
    });
  } catch (err) {
    console.error('Error fetching mess members:', err);
    // Use proper error handling
    if (err instanceof Error) {
      return res.status(500).json({
        success: false,
        message: err.message || 'Internal server error'
      });
    } else {
      return res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
});

export default router; 

// GET /api/mess/members/:userId - Get rich member details for a mess owner
router.get('/:userId', requireAuth, async (req: Request, res: Response, _next: NextFunction) => {
  try {
    const authUserId = (req as any).user.id;
    let { userId } = req.params as { userId: string };

    // Find the mess profile owned by this user
    const messProfile = await MessProfile.findOne({ userId: authUserId });
    if (!messProfile) {
      return res.status(404).json({ success: false, message: 'Mess profile not found for owner', data: null });
    }

    // Find memberships for this mess and target user
    let memberships = await MessMembership.find({ messId: messProfile._id, userId })
      .populate('userId', 'firstName lastName email phone')
      .populate('mealPlanId', 'name pricing')
      .sort({ createdAt: -1 })
      .lean();

    // If not found, treat the param as a membershipId and resolve userId
    if (!memberships || memberships.length === 0) {
      const membershipAsId = await MessMembership.findOne({ _id: userId, messId: messProfile._id })
        .populate('userId', 'firstName lastName email phone')
        .populate('mealPlanId', 'name pricing')
        .lean();
      if (membershipAsId) {
        userId = (membershipAsId.userId as any)?._id?.toString?.() || (membershipAsId.userId as any);
        memberships = await MessMembership.find({ messId: messProfile._id, userId })
          .populate('userId', 'firstName lastName email phone')
          .populate('mealPlanId', 'name pricing')
          .sort({ createdAt: -1 })
          .lean();
      }
    }

    if (!memberships || memberships.length === 0) {
      return res.status(200).json({ success: true, data: { userId, plans: [], leaveHistory: [] } });
    }

    // Build plan info
    const plans = memberships.map((m: any) => ({
      planId: m.mealPlanId?._id?.toString?.() || null,
      planName: m.mealPlanId?.name || 'No Plan',
      subscriptionStartDate: m.subscriptionStartDate,
      subscriptionEndDate: m.subscriptionEndDate || null,
      status: m.status,
      paymentStatus: m.paymentStatus,
      lastPaymentDate: m.lastPaymentDate || null,
      nextPaymentDate: m.nextPaymentDate || null
    }));

    const primary: any = memberships[0] || {};
    const user = (primary as any).userId as any;

    // Fetch mess-level approved/scheduled leaves (applies to all users)
    let leaveHistory: any[] = [];
    try {
      const MessLeave = mongoose.model('MessLeave');
      const since = new Date();
      since.setFullYear(since.getFullYear() - 1);
      const leaves = await (MessLeave as any).find({
        messId: messProfile._id,
        startDate: { $gte: since },
        status: { $in: ['approved', 'active', 'scheduled'] }
      }).sort({ startDate: -1 }).lean();
      leaveHistory = (leaves || []).map((l: any) => ({
        id: l._id?.toString?.() || l.id,
        startDate: l.startDate,
        endDate: l.endDate,
        status: l.status,
        days: Math.max(1, Math.ceil((new Date(l.endDate).getTime() - new Date(l.startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1)
      }));
    } catch (e) {
      // Leave model may not exist in some setups; ignore silently
      leaveHistory = [];
    }

    const data = {
      userId: userId,
      userEmail: user?.email || null,
      userPhone: user?.phone || null,
      planStartDate: primary?.subscriptionStartDate || null,
      planEndDate: primary?.subscriptionEndDate || null,
      plans,
      leaveHistory
    };

    return res.status(200).json({ success: true, data });
  } catch (err) {
    console.error('Error fetching member detail for mess owner:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch member detail' });
  }
});