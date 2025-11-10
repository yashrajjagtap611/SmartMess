import { Router, Request, Response, NextFunction } from 'express';
import requireAuth from '../../middleware/requireAuth';
import { handleAuthError } from '../../middleware/errorHandler';
import MessProfile from '../../models/MessProfile';
import MealPlan from '../../models/MealPlan';
import PaymentSettings from '../../models/PaymentSettings';
import MessMembership from '../../models/MessMembership';

const router: Router = Router();

// GET /api/mess/search/available - Get all available messes
router.get('/available', requireAuth, async (req: Request, res: Response, _next: NextFunction) => {    const userId = (req as any).user.id;
    try {
        console.log('Fetching available messes for user:', userId);

    // Get all mess profiles (excluding user's own mess)
    const availableMesses = await MessProfile.find({}).limit(20);
    console.log('Found mess profiles:', availableMesses.length);

    // Transform the data to match the frontend interface
    const transformedMesses = await Promise.all(availableMesses.map(async mess => {
      console.log('Processing mess:', mess.name, 'owned by user:', mess.userId);
      
      // Fetch real meal plans for this mess
      const realMealPlans = await MealPlan.find({ 
        messId: mess._id,
        isActive: true 
      });

      console.log(`Found ${realMealPlans.length} real meal plans for mess: ${mess.name}`);

      // Transform real meal plans to match frontend interface
      const transformedMealPlans = realMealPlans.map(plan => ({
        id: plan._id.toString(),
        name: plan.name,
        description: plan.description,
        pricing: {
          amount: plan.pricing.amount,
          period: plan.pricing.period
        },
        mealType: plan.mealType,
        mealsPerDay: plan.mealsPerDay,
        mealOptions: plan.mealOptions, // Include meal options for validation
        isActive: plan.isActive,
        leaveRules: {
          // No maxLeaveDays in schema; expose meals-based limit only
          maxLeaveMeals: plan.leaveRules.maxLeaveMeals,
          requireTwoHourNotice: plan.leaveRules.requireTwoHourNotice,
          noticeHours: plan.leaveRules.noticeHours,
          minConsecutiveDays: plan.leaveRules.minConsecutiveDays,
          extendSubscription: plan.leaveRules.extendSubscription,
          autoApproval: plan.leaveRules.autoApproval,
          leaveLimitsEnabled: plan.leaveRules.leaveLimitsEnabled,
          consecutiveLeaveEnabled: plan.leaveRules.consecutiveLeaveEnabled,
          maxLeaveMealsEnabled: plan.leaveRules.maxLeaveMealsEnabled
        }
      }));

      // If no real meal plans exist, show a message or empty array
      if (transformedMealPlans.length === 0) {
        console.log(`No meal plans found for mess: ${mess.name}`);
      }

      // Fetch the actual UPI ID from the mess owner's payment settings
      const ownerPaymentSettings = await PaymentSettings.findOne({ userId: mess.userId });
      const upiId = ownerPaymentSettings?.upiId || 'messowner@upi'; // Fallback to mock

      return {
        id: mess._id.toString(),
        name: mess.name,
        description: `Located in ${mess.location.city}, ${mess.location.state}`,
        address: `${mess.location.street}, ${mess.location.city}, ${mess.location.state} - ${mess.location.pincode}`,
        capacity: 50, // Mock capacity
        currentMembers: 35, // Mock current members
        monthlyRate: 5000, // Mock monthly rate
        ownerName: 'Mess Owner', // Mock owner name
        ownerPhone: mess.ownerPhone || '+91-9876543210',
        ownerEmail: mess.ownerEmail,
        types: mess.types,
        colleges: mess.colleges,
        rating: 4.5, // Mock rating
        reviews: 12, // Mock reviews
        upiId: upiId, // Use the actual UPI ID
        mealPlans: transformedMealPlans
      };
    }));

    console.log('Transformed messes:', transformedMesses.length);

    return res.status(200).json({
      success: true,
      data: transformedMesses
    });
  } catch (err) {
    console.error('Error fetching available messes:', err);
    return handleAuthError(res, err);
  }
});

// GET /api/mess/search/user-details - Get user's mess details
router.get('/user-details', requireAuth, async (req: Request, res: Response, _next: NextFunction) => {    const userId = (req as any).user.id;
    try {
        // Find all user's mess memberships
    const memberships = await MessMembership.find({ 
      userId: userId,
      status: { $in: ['active', 'pending'] }
    }).populate('messId').populate('mealPlanId');

    console.log(`🔍 Found ${memberships.length} memberships for user ${userId}`);
    memberships.forEach((membership, index) => {
      console.log(`🔍 Membership ${index + 1}: status=${membership.status}, paymentStatus=${membership.paymentStatus}, messId=${membership.messId}, mealPlanId=${membership.mealPlanId}`);
    });

    if (memberships.length === 0) {
      return res.status(200).json({ 
        success: true,
        data: {
          messes: [],
          totalMesses: 0,
          totalMealPlanSubscriptions: 0,
          maxMesses: 3,
          maxMealPlanSubscriptions: 3,
          canJoinMore: true
        },
        message: 'No mess memberships found for this user. Join a mess to see your details here.'
      });
    }

    // Group memberships by mess to support multiple plans per mess
    const messGroups = new Map();
    
    memberships.forEach(membership => {
      const messId = typeof membership.messId === 'object' && membership.messId._id 
        ? membership.messId._id.toString() 
        : membership.messId.toString();
      
      const mess = membership.messId as any;
      const mealPlan = membership.mealPlanId as any;
      
      if (!messGroups.has(messId)) {
        // Calculate overall mess status based on all memberships for this mess
        const messSpecificMemberships = memberships.filter(m => {
          const mId = typeof m.messId === 'object' && m.messId._id 
            ? m.messId._id.toString() 
            : m.messId.toString();
          return mId === messId;
        });
        
        // Determine overall status: if any plan is active, mess is active; if all pending, mess is pending
        const hasActivePlan = messSpecificMemberships.some(m => m.status === 'active');
        const allPending = messSpecificMemberships.every(m => m.status === 'pending');
        const overallStatus = hasActivePlan ? 'active' : (allPending ? 'pending' : 'inactive');
        
        // Determine overall payment status: if any plan has pending/overdue payments, show that
        const hasPendingPayment = messSpecificMemberships.some(m => m.paymentStatus === 'pending');
        const hasOverduePayment = messSpecificMemberships.some(m => m.paymentStatus === 'overdue');
        const allPaid = messSpecificMemberships.every(m => m.paymentStatus === 'paid');
        
        let overallPaymentStatus = 'paid';
        if (hasOverduePayment) {
          overallPaymentStatus = 'overdue';
        } else if (hasPendingPayment) {
          overallPaymentStatus = 'pending';
        }
        
        messGroups.set(messId, {
          messId: messId,
          messName: mess.name,
          messLocation: mess.location,
          joinDate: membership.joinDate.toISOString(),
          status: overallStatus,
          mealPlans: [],
          paymentStatus: overallPaymentStatus,
          subscriptionStartDate: membership.subscriptionStartDate?.toISOString(),
          subscriptionEndDate: membership.subscriptionEndDate?.toISOString(),
          lastPaymentDate: membership.lastPaymentDate?.toISOString(),
          nextPaymentDate: membership.nextPaymentDate?.toISOString(),
          canLeave: allPaid && overallStatus === 'active' // Can only leave if all payments are made and status is active
        });
      }
      
      // Add meal plan to the mess group with individual payment tracking
      if (mealPlan) {
        const mealPlanData = {
          id: mealPlan._id.toString(),
          name: mealPlan.name,
          description: mealPlan.description,
          pricing: {
            amount: mealPlan.pricing.amount,
            period: mealPlan.pricing.period
          },
          mealType: mealPlan.mealType,
          mealsPerDay: mealPlan.mealsPerDay,
          mealOptions: mealPlan.mealOptions, // Include meal options for validation
          leaveRules: {
            maxLeaveMeals: mealPlan.leaveRules.maxLeaveMeals,
            requireTwoHourNotice: mealPlan.leaveRules.requireTwoHourNotice,
            noticeHours: mealPlan.leaveRules.noticeHours,
            minConsecutiveDays: mealPlan.leaveRules.minConsecutiveDays,
            extendSubscription: mealPlan.leaveRules.extendSubscription,
            autoApproval: mealPlan.leaveRules.autoApproval,
            leaveLimitsEnabled: mealPlan.leaveRules.leaveLimitsEnabled,
            consecutiveLeaveEnabled: mealPlan.leaveRules.consecutiveLeaveEnabled,
            maxLeaveMealsEnabled: mealPlan.leaveRules.maxLeaveMealsEnabled
          },
          status: membership.status, // Individual meal plan status
          paymentStatus: membership.paymentStatus, // Individual meal plan payment status
          paymentRequestStatus: membership.paymentRequestStatus, // Payment request status (none, sent, approved, rejected)
          subscriptionStartDate: membership.subscriptionStartDate?.toISOString(),
          subscriptionEndDate: membership.subscriptionEndDate?.toISOString(),
          membershipId: membership._id.toString() // Add membership ID for payment tracking
        };
        
        messGroups.get(messId).mealPlans.push(mealPlanData);
      }
    });

    // Derive aggregate totals per mess
    const messes = Array.from(messGroups.values()).map((m: any) => {
      const totalPlans = (m.mealPlans || []).length;
      const totalMonthlyAmount = (m.mealPlans || []).reduce((sum: number, p: any) => sum + (p.pricing?.amount || 0), 0);
      return { ...m, totalPlans, totalMonthlyAmount };
    });

    const totalMealPlanSubscriptions = messes.reduce((sum: number, m: any) => sum + (m.totalPlans || 0), 0);

    const responseData = {
      messes: messes,
      totalMesses: messes.length,
      totalMealPlanSubscriptions: totalMealPlanSubscriptions,
      maxMesses: 3,
      maxMealPlanSubscriptions: 3,
      canJoinMore: totalMealPlanSubscriptions < 3
    };

    return res.status(200).json({
      success: true,
      data: responseData
    });
  } catch (err) {
    console.error('Error fetching user mess details:', err);
    return handleAuthError(res, err);
  }
});

export default router; 