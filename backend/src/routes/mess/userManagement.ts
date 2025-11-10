import { Router, Request, Response, NextFunction } from 'express';
import requireAuth from '../../middleware/requireAuth';
import MessMembership from '../../models/MessMembership';
import MessProfile from '../../models/MessProfile';
import Notification from '../../models/Notification';
import MealPlan from '../../models/MealPlan';
import User from '../../models/User';
import PaymentSettings from '../../models/PaymentSettings';
import { AutoChatService } from '../../services/autoChatService';
import { calculateSubscriptionEndDate } from '../../utils/billingPeriodHelper';
import { UserLeave } from '../../models/UserLeave';

const router: Router = Router();

// Simple error handler function
function handleAuthError(res: Response, error: any): Response {
  console.error('Auth error:', error);
  return res.status(500).json({ 
    success: false, 
    message: error.message || 'Internal server error' 
  });
}

// GET /api/mess/user-management/billing - Get user's billing records
router.get('/billing', requireAuth, async (req: Request, res: Response, _next: NextFunction) => {
  const userId = (req as any).user.id;
  try {
    // const _userId = (req as any).user.id;

    // For now, return mock billing data
    // In a real implementation, you would query a Billing collection
    const mockBillingData = [
      {
        id: 'bill-1',
        amount: 5000,
        description: 'Monthly rent - January 2024',
        status: 'paid',
        dueDate: '2024-01-31',
        paidDate: '2024-01-25'
      },
      {
        id: 'bill-2',
        amount: 5000,
        description: 'Monthly rent - February 2024',
        status: 'pending',
        dueDate: '2024-02-29'
      }
    ];

    return res.status(200).json({
      success: true,
      data: mockBillingData
    });
  } catch (err) {
    return handleAuthError(res, err);
  }
});

// POST /api/mess/user-management/join - Join a mess
router.post('/join', requireAuth, async (req: Request, res: Response, _next: NextFunction) => {
  const userId = (req as any).user.id;
  try {
    const { messId, mealPlanId, paymentType } = req.body;

    // Validate required fields
    if (!messId || !mealPlanId || !paymentType) {
      return res.status(400).json({ 
        message: 'Mess ID, meal plan ID, and payment type are required' 
      });
    }

    // Validate payment type
    if (!['pay_now', 'pay_later'].includes(paymentType)) {
      return res.status(400).json({ 
        message: 'Payment type must be either "pay_now" or "pay_later"' 
      });
    }

    // Validate that the mess exists
    const mess = await MessProfile.findById(messId);
    if (!mess) {
      return res.status(404).json({ message: 'Mess not found' });
    }

    // Get meal plan details to get pricing
    const mealPlan = await MealPlan.findById(mealPlanId);
    if (!mealPlan) {
      return res.status(404).json({ message: 'Meal plan not found' });
    }

    // Get user details
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if user is already subscribed to this specific meal plan in this mess
    const existingMealPlanSubscription = await MessMembership.findOne({
      userId: userId,
      messId: messId,
      mealPlanId: mealPlanId,
      status: { $in: ['active', 'pending'] }
    });

    if (existingMealPlanSubscription) {
      // If user has a pending subscription and wants to pay, allow it
      if (existingMealPlanSubscription.status === 'pending' && 
          existingMealPlanSubscription.paymentStatus === 'pending' && 
          paymentType === 'pay_now') {
        console.log(`User ${userId} has pending subscription, allowing payment for mess ${messId}, meal plan ${mealPlanId}`);
        // Continue with payment processing instead of blocking
      } else if (existingMealPlanSubscription.status === 'active' && 
                 existingMealPlanSubscription.paymentStatus === 'paid') {
        return res.status(400).json({ 
          message: 'You are already subscribed to this meal plan in this mess' 
        });
      } else if (existingMealPlanSubscription.status === 'pending' && 
                 existingMealPlanSubscription.paymentStatus === 'paid') {
        return res.status(400).json({ 
          message: 'You already have a pending subscription with paid status. Please wait for mess owner approval.' 
        });
      }
      // For other cases (pending with pending payment), continue with the flow
    }

    // Check if user has a previous inactive membership for this meal plan
    const previousInactiveMembership = await MessMembership.findOne({
      userId: userId,
      messId: messId,
      mealPlanId: mealPlanId,
      status: 'inactive'
    });

    if (previousInactiveMembership) {
      console.log(`User ${userId} has a previous inactive membership for mess ${messId}, meal plan ${mealPlanId}. Allowing rejoin.`);
    }

    // Skip max-limit check if this is ONLY a payment for an existing membership
    const isExistingPaymentOnly = !!(existingMealPlanSubscription && paymentType === 'pay_now');

    if (!isExistingPaymentOnly) {
      // Check if user has reached the maximum limit of 3 mess subscriptions
      const activeMemberships = await MessMembership.find({
        userId: userId,
        status: { $in: ['active', 'pending'] }
      });

      if (activeMemberships.length >= 3) {
        return res.status(400).json({ 
          message: 'You can only subscribe to a maximum of 3 meal plans at a time. Please leave one of your current subscriptions before joining a new one.' 
        });
      }
    }

    // For pay_now option, validate that mess owner has UPI ID configured
    if (paymentType === 'pay_now') {
      const ownerPaymentSettings = await PaymentSettings.findOne({ userId: mess.userId });
      if (!ownerPaymentSettings?.upiId) {
        return res.status(400).json({ 
          message: 'Mess owner has not configured UPI payment. Please choose "Pay Later" option or contact the mess owner.' 
        });
      }
    }

    // Always create a notification for mess owner on join/payment actions
    // For pay_now we treat it as a payment_request requiring owner approval
    {
      console.log(`🔔 Creating notification for mess owner ${mess.userId} (mess: ${messId})`);
      console.log(`📋 Notification details:`, {
        userId: mess.userId,
        messId: messId,
        type: paymentType === 'pay_now' ? 'payment_request' : 'join_request',
        requestingUserId: userId,
        requestingUserName: `${user.firstName} ${user.lastName}`,
        mealPlanId: mealPlanId,
        paymentType: paymentType
      });

      const ownerNotification = new Notification({
        userId: mess.userId, // Mess owner's ID
        messId: messId,
        type: paymentType === 'pay_now' ? 'payment_request' : 'join_request',
        title: paymentType === 'pay_now' ? 'Payment Request' : 'New Join Request',
        message: paymentType === 'pay_now' 
          ? `${user.firstName} ${user.lastName} has completed UPI payment for mess subscription`
          : `${user.firstName} ${user.lastName} wants to join your mess`,
        status: 'pending',
        data: {
          requestingUserId: userId,
          requestingUserName: `${user.firstName} ${user.lastName}`,
          mealPlanId: mealPlanId,
          paymentType: paymentType,
          amount: 5000, // Mock amount - in real app, get from meal plan
          plan: 'Premium Plan' // Mock plan name
        },
        isRead: false
      });

      // Create notification document; duplicate key is handled below
      try {
        await ownerNotification.save();
        console.log(`✅ Notification created successfully with ID: ${ownerNotification._id}`);
      } catch (error: any) {
        console.error(`❌ Error creating notification:`, error);
        
        // If it's a duplicate key error, check if there's already a pending notification
        if (error.code === 11000) {
          console.log(`🔄 Duplicate key error detected, checking for existing notification`);
          const existingNotification = await Notification.findOne({
            userId: mess.userId,
            messId: messId,
            type: paymentType === 'pay_now' ? 'payment_request' : 'join_request',
            status: 'pending',
            'data.requestingUserId': userId
          });
          
          if (existingNotification) {
            console.log(`⚠️ Existing pending notification found: ${existingNotification._id}`);
            return res.status(400).json({ 
              message: 'You already have a pending request for this mess. Please wait for the mess owner to respond.' 
            });
          }
        }
        throw error;
      }
    }

    // Create or reactivate membership record
    let membership;
    
    if (existingMealPlanSubscription && 
        existingMealPlanSubscription.paymentStatus === 'pending' && 
        paymentType === 'pay_now') {
      // Do NOT auto-approve. Keep payment pending until owner approves.
      console.log(`Recording payment request for existing subscription (no auto-approval) user ${userId} mess ${messId} meal plan ${mealPlanId}`);

      existingMealPlanSubscription.paymentType = paymentType;
      existingMealPlanSubscription.paymentAmount = mealPlan.pricing.amount;
      existingMealPlanSubscription.paymentRequestStatus = 'sent'; // Mark payment request as sent
      // Keep paymentStatus as 'pending' and don't set lastPaymentDate until approval

      membership = existingMealPlanSubscription;
    } else if (previousInactiveMembership) {
      // Reactivate existing inactive membership
      console.log(`Reactivating existing inactive membership for user ${userId} in mess ${messId}, meal plan ${mealPlanId}`);
      
      previousInactiveMembership.status = 'pending';
      // Keep payment pending for pay_now until owner approves
      previousInactiveMembership.paymentStatus = 'pending';
      previousInactiveMembership.paymentType = paymentType;
      previousInactiveMembership.paymentAmount = mealPlan.pricing.amount;
      previousInactiveMembership.paymentRequestStatus = paymentType === 'pay_now' ? 'sent' : 'none'; // Mark payment request as sent for pay_now
      previousInactiveMembership.paymentDueDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days from now
      // Do not set subscription dates until owner approval
      previousInactiveMembership.subscriptionStartDate = undefined as any;
      previousInactiveMembership.subscriptionEndDate = undefined as any;
      
      membership = previousInactiveMembership;
    } else {
      // Create new membership record
      console.log(`Creating new membership for user ${userId} in mess ${messId}, meal plan ${mealPlanId}`);
      
      membership = new MessMembership({
        userId: userId,
        messId: messId,
        mealPlanId: mealPlanId,
        status: 'pending',
        // For pay_now, still keep payment pending until owner approves
        paymentStatus: 'pending',
        paymentType: paymentType,
        paymentAmount: mealPlan.pricing.amount,
        paymentRequestStatus: paymentType === 'pay_now' ? 'sent' : 'none', // Mark payment request as sent for pay_now
        paymentDueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        // Do not set subscription dates until owner approval
        subscriptionStartDate: undefined as any,
        subscriptionEndDate: undefined as any,
        reminderSentCount: 0,
        autoRenewal: true,
        paymentHistory: []
      });
    }
    
    try {
      await membership.save();
      console.log('Membership saved successfully for user:', userId, 'meal plan:', mealPlanId);
      
      // Auto-join user to mess chat groups
      try {
        await AutoChatService.autoJoinUserToMessGroups(userId, messId);
        console.log(`User ${userId} auto-joined chat groups for mess ${messId}`);
      } catch (chatError) {
        console.error('Error auto-joining user to chat groups:', chatError);
        // Don't fail the subscription if chat join fails
      }
    } catch (error) {
      console.error('Error saving membership:', error);
      return res.status(500).json({ 
        message: 'Failed to create/update membership. Please try again.' 
      });
    }

    const responseData: any = {
      messId,
      mealPlanId,
      paymentType,
      joinDate: new Date().toISOString(),
      isRejoin: !!previousInactiveMembership,
      isPaymentUpdate: !!(existingMealPlanSubscription && 
                         existingMealPlanSubscription.paymentStatus === 'pending' && 
                         paymentType === 'pay_now')
    };

    if (paymentType === 'pay_now') {
      // Always require owner approval for pay_now
      responseData.message = 'Payment request sent to mess owner for approval.';
    } else {
      responseData.message = previousInactiveMembership 
        ? 'Rejoin request sent to mess owner for approval.' 
        : 'Join request sent to mess owner for approval.';
    }

    return res.status(200).json({
      success: true,
      message: responseData.message,
      data: responseData
    });
  } catch (err) {
    return handleAuthError(res, err);
  }
});

// POST /api/mess/user-management/leave - Leave a meal plan subscription
router.post('/leave', requireAuth, async (req: Request, res: Response, _next: NextFunction) => {
  const userId = (req as any).user.id;
  try {
    const { messId, mealPlanId } = req.body;

    if (!messId || !mealPlanId) {
      return res.status(400).json({ success: false, message: 'Mess ID and Meal Plan ID are required' });
    }

    if (typeof messId !== 'string' || messId.length !== 24) {
      return res.status(400).json({ success: false, message: 'Invalid Mess ID format' });
    }

    if (typeof mealPlanId !== 'string' || mealPlanId.length !== 24) {
      return res.status(400).json({ success: false, message: 'Invalid Meal Plan ID format' });
    }

    // Find the membership
    const membership = await MessMembership.findOne({
      userId: userId,
      messId: messId,
      mealPlanId: mealPlanId,
      status: { $in: ['active', 'pending'] }
    });

    if (!membership) {
      return res.status(400).json({ 
        success: false,
        message: 'You are not subscribed to this meal plan in this mess' 
      });
    }

    // Check if user has pending bills for this meal plan
    if (membership.paymentStatus === 'pending' || membership.paymentStatus === 'overdue') {
      return res.status(400).json({ 
        success: false,
        message: 'You cannot leave this meal plan until you have paid all pending bills. Current payment status: ' + membership.paymentStatus 
      });
    }

    // Update membership status to inactive
    console.log(`🔍 Before update - Membership status: ${membership.status}, paymentStatus: ${membership.paymentStatus}, paymentAmount: ${membership.paymentAmount}`);
    
    // Use findByIdAndUpdate to avoid validation issues
    const updatedMembership = await MessMembership.findByIdAndUpdate(
      membership._id,
      {
        status: 'inactive',
        subscriptionEndDate: new Date(),
        paymentStatus: 'paid'
      },
      { new: true, runValidators: false } // Don't run validators on update
    );
    
    if (!updatedMembership) {
      throw new Error('Failed to update membership status');
    }
    
    console.log(`✅ User ${userId} successfully left mess ${messId}, meal plan ${mealPlanId}. Membership status updated to inactive.`);
    console.log(`🔍 Verification - Updated membership status: ${updatedMembership.status}, paymentStatus: ${updatedMembership.paymentStatus}, paymentAmount: ${updatedMembership.paymentAmount}`);

    // Archive/cancel all leave requests for this meal plan that are still pending or approved
    try {
      const leaveCancelled = await UserLeave.updateMany(
        {
          userId: userId,
          messId: messId,
          mealPlanIds: mealPlanId, // Cancel leaves for this specific meal plan
          status: { $in: ['pending', 'approved'] } // Only cancel active leave requests
        },
        {
          status: 'cancelled',
          approvedAt: new Date(),
          approvedBy: userId // Self-cancelled due to plan exit
        }
      );
      console.log(`🏷️ Archived ${leaveCancelled.modifiedCount} leave request(s) for meal plan ${mealPlanId}`);
    } catch (leaveCancelErr) {
      console.warn('Warning: Could not archive leave requests:', leaveCancelErr);
      // Non-fatal; do not block response
    }

    // Cleanup: remove pending notifications and detach user from mess chat groups
    try {
      // Remove any pending owner-side requests created by this user for this mess/plan
      const ownerCleanup = await Notification.deleteMany({
        messId: messId,
        type: { $in: ['payment_request', 'join_request'] },
        status: 'pending',
        'data.requestingUserId': userId
      });
      console.log(`🧹 Owner notifications cleaned: ${ownerCleanup.deletedCount}`);

      // Remove any user-side pending payment reminders for this mess/plan
      const userCleanup = await Notification.deleteMany({
        userId: userId,
        messId: messId,
        type: { $in: ['payment_due', 'payment_reminder'] },
        status: 'pending'
      });
      console.log(`🧹 User notifications cleaned: ${userCleanup.deletedCount}`);

      // Check if user has any other active memberships in this mess
      // Only remove from chat groups if leaving ALL memberships
      const otherActiveMemberships = await MessMembership.countDocuments({
        userId: userId,
        messId: messId,
        status: { $in: ['active', 'pending'] },
        _id: { $ne: membership._id } // Exclude the current membership being left
      });

      // Remove user from ALL mess chat groups only if no other active memberships exist
      if (otherActiveMemberships === 0) {
        try {
          await AutoChatService.removeUserFromMessGroups(userId, messId);
          console.log(`👋 User ${userId} removed from all chat groups for mess ${messId} (no other active memberships)`);
        } catch (chatLeaveErr) {
          console.warn('Chat leave warning:', chatLeaveErr);
          // Non-fatal; do not block response
        }
      } else {
        console.log(`ℹ️ User ${userId} still has ${otherActiveMemberships} active membership(s) in mess ${messId}, keeping chat group access`);
      }
    } catch (cleanupErr) {
      console.warn('Cleanup warning after leaving plan:', cleanupErr);
      // Non-fatal; do not block response
    }

    // Send notification to mess owner about user leaving
    try {
      const mess = await MessProfile.findById(messId);
      if (mess) {
        const leaveNotification = new Notification({
          userId: mess.userId, // Mess owner's ID
          messId: messId,
          type: 'leave_notification',
          title: 'User Left Mess',
          message: `${membership.userId} has left your mess`,
          status: 'completed',
          data: {
            leavingUserId: userId,
            leftAt: new Date().toISOString()
          },
          isRead: false
        });
        await leaveNotification.save();
      }
    } catch (error) {
      console.error('Error creating leave notification:', error);
    }

    return res.status(200).json({
      success: true,
      message: 'Successfully left the mess. You can rejoin this mess later if spots are available.'
    });
  } catch (err) {
    console.error('Error in leave endpoint:', err);
    return handleAuthError(res, err);
  }
});

// POST /api/mess/user-management/pay-bill - Pay a bill
router.post('/pay-bill', requireAuth, async (req: Request, res: Response, _next: NextFunction) => {
  const userId = (req as any).user.id;
  try {
    const { billId, paymentMethod } = req.body;

    if (!billId) {
      return res.status(400).json({ 
        success: false,
        message: 'Bill ID is required' 
      });
    }

    if (!paymentMethod || !['upi', 'online', 'cash'].includes(paymentMethod)) {
      return res.status(400).json({ 
        success: false,
        message: 'Valid payment method is required (upi, online, or cash)' 
      });
    }

    // For now, we'll simulate bill payment since we don't have a dedicated billing collection
    const mockBill = {
      id: billId,
      userId: userId,
      amount: 5000,
      description: 'Monthly mess fee',
      status: 'pending',
      dueDate: new Date().toISOString()
    };

    // Simulate payment processing
    if (paymentMethod === 'upi') {
      console.log(`Processing UPI payment for bill ${billId}`);
    } else if (paymentMethod === 'online') {
      console.log(`Processing online payment for bill ${billId}`);
    } else if (paymentMethod === 'cash') {
      console.log(`Processing cash payment for bill ${billId}`);
    }

    // Update the mock bill status to paid
    mockBill.status = 'paid';

    // Extract membership ID from bill ID to update specific membership
    // Bill ID format: bill-{messId}-{mealPlanId} or bill-{membershipId}
    let membershipToUpdate = null;
    
    if (billId.startsWith('bill-')) {
      const billParts = billId.split('-');
      if (billParts.length === 3) {
        // Format: bill-{messId}-{mealPlanId}
        const [, messId, mealPlanId] = billParts;
        membershipToUpdate = await MessMembership.findOne({
          userId: userId,
          messId: messId,
          mealPlanId: mealPlanId,
          paymentStatus: { $in: ['pending', 'overdue'] }
        });
      } else if (billParts.length === 2) {
        // Format: bill-{membershipId}
        const [, membershipId] = billParts;
        membershipToUpdate = await MessMembership.findOne({
          _id: membershipId,
          userId: userId,
          paymentStatus: { $in: ['pending', 'overdue'] }
        });
      }
    }

    if (membershipToUpdate) {
      // Update only the specific membership that was paid
      membershipToUpdate.paymentStatus = 'paid';
      membershipToUpdate.lastPaymentDate = new Date();
      
      // Add payment to history
      membershipToUpdate.paymentHistory.push({
        date: new Date(),
        amount: mockBill.amount,
        method: paymentMethod,
        status: 'success',
        transactionId: `txn_${Date.now()}`,
        notes: `Payment via ${paymentMethod}`
      });
      
      await membershipToUpdate.save();
      console.log(`✅ Updated payment status for membership ${membershipToUpdate._id}`);
    } else {
      console.log(`⚠️ No matching membership found for bill ${billId}`);
    }

    // Create a payment notification for the user
    try {
      const paymentNotification = new Notification({
        userId: userId,
        type: 'payment_success',
        title: 'Payment Successful',
        message: `Your payment of ₹${mockBill.amount} has been processed successfully`,
        status: 'completed',
        data: {
          billId: billId,
          amount: mockBill.amount,
          paymentMethod: paymentMethod,
          paidAt: new Date().toISOString()
        },
        isRead: false
      });
      await paymentNotification.save();
    } catch (error) {
      console.error('Error creating payment notification:', error);
    }

    return res.status(200).json({
      success: true,
      message: 'Payment processed successfully',
      data: {
        billId: billId,
        status: 'paid',
        paymentMethod: paymentMethod,
        paidAt: new Date().toISOString()
      }
    });
  } catch (err) {
    console.error('Error processing payment:', err);
    return handleAuthError(res, err);
  }
});

// POST /api/mess/user-management/cancel-request - Cancel a pending join request
router.post('/cancel-request', requireAuth, async (req: Request, res: Response, _next: NextFunction) => {
  const userId = (req as any).user.id;
  try {
    const { messId, mealPlanId } = req.body;

    if (!messId || !mealPlanId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Mess ID and Meal Plan ID are required' 
      });
    }

    // Find the pending membership
    const membership = await MessMembership.findOne({
      userId: userId,
      messId: messId,
      mealPlanId: mealPlanId,
      status: 'pending'
    });

    if (!membership) {
      return res.status(404).json({ 
        success: false,
        message: 'No pending request found for this meal plan' 
      });
    }

    // Delete the pending membership
    await MessMembership.findByIdAndDelete(membership._id);

    // Cancel the related notification
    await Notification.updateMany(
      {
        messId: messId,
        type: { $in: ['join_request', 'payment_request'] },
        status: 'pending',
        'data.requestingUserId': userId,
        'data.mealPlanId': mealPlanId
      },
      {
        status: 'cancelled',
        message: 'Request cancelled by user'
      }
    );

    console.log(`✅ User ${userId} cancelled request for mess ${messId}, meal plan ${mealPlanId}`);

    return res.status(200).json({
      success: true,
      message: 'Request cancelled successfully. You can now join other meal plans.'
    });
  } catch (err) {
    console.error('Error cancelling request:', err);
    return handleAuthError(res, err);
  }
});

// POST /api/mess/user-management/resend-request - Resend a join request
router.post('/resend-request', requireAuth, async (req: Request, res: Response, _next: NextFunction) => {
  const userId = (req as any).user.id;
  try {
    const { messId, mealPlanId } = req.body;

    if (!messId || !mealPlanId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Mess ID and Meal Plan ID are required' 
      });
    }

    // Find the pending membership
    const membership = await MessMembership.findOne({
      userId: userId,
      messId: messId,
      mealPlanId: mealPlanId,
      status: 'pending'
    });

    if (!membership) {
      return res.status(404).json({ 
        success: false,
        message: 'No pending request found for this meal plan' 
      });
    }

    // Get mess and user details
    const mess = await MessProfile.findById(messId);
    const user = await User.findById(userId);
    
    if (!mess || !user) {
      return res.status(404).json({ 
        success: false,
        message: 'Mess or user not found' 
      });
    }

    // Check if there's already a recent notification (within last 1 minutes)
    const recentNotification = await Notification.findOne({
      userId: mess.userId,
      messId: messId,
      type: { $in: ['join_request', 'payment_request'] },
      'data.requestingUserId': userId,
      'data.mealPlanId': mealPlanId,
      createdAt: { $gte: new Date(Date.now() - 1 * 60 * 1000) }
    });

    if (recentNotification) {
      return res.status(400).json({ 
        success: false,
        message: 'You can only resend a request once every 1 minutes' 
      });
    }

    // Create new notification
    const newNotification = new Notification({
      userId: mess.userId,
      messId: messId,
      type: membership.paymentType === 'pay_now' ? 'payment_request' : 'join_request',
      title: membership.paymentType === 'pay_now' ? 'Payment Request (Reminder)' : 'Join Request (Reminder)',
      message: `${user.firstName} ${user.lastName} is reminding you about their mess subscription request`,
      status: 'pending',
      data: {
        requestingUserId: userId,
        requestingUserName: `${user.firstName} ${user.lastName}`,
        mealPlanId: mealPlanId,
        paymentType: membership.paymentType,
        amount: membership.paymentAmount,
        isResend: true
      },
      isRead: false
    });

    await newNotification.save();

    console.log(`🔄 User ${userId} resent request for mess ${messId}, meal plan ${mealPlanId}`);

    return res.status(200).json({
      success: true,
      message: 'Request resent successfully. The mess owner will be notified again.'
    });
  } catch (err) {
    console.error('Error resending request:', err);
    return handleAuthError(res, err);
  }
});

export default router; 