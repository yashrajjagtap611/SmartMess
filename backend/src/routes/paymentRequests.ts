import { Router, Request, Response, NextFunction } from 'express';
import requireAuth from '../middleware/requireAuth';
import { handleAuthError } from '../middleware/errorHandler';
import MessMembership from '../models/MessMembership';
import MealPlan from '../models/MealPlan';
import Transaction from '../models/Transaction';
import PaymentVerification from '../models/PaymentVerification';
import { AutoChatService } from '../services/autoChatService';
import { checkCanAcceptUsers } from '../middleware/checkSubscription';

const router: Router = Router();

// Helper function to calculate subscription end date
const calculateSubscriptionEndDate = (startDate: Date, period: string): Date => {
  const endDate = new Date(startDate);
  if (period === 'daily') endDate.setDate(endDate.getDate() + 1);
  else if (period === 'weekly') endDate.setDate(endDate.getDate() + 7);
  else if (period === '15days') endDate.setDate(endDate.getDate() + 15);
  else if (period === '3months') endDate.setMonth(endDate.getMonth() + 3);
  else if (period === '6months') endDate.setMonth(endDate.getMonth() + 6);
  else if (period === 'yearly') endDate.setFullYear(endDate.getFullYear() + 1);
  else endDate.setMonth(endDate.getMonth() + 1); // default to monthly
  return endDate;
};

// POST /api/payment-requests/:membershipId/approve - Approve a payment request
router.post('/:membershipId/approve', requireAuth, checkCanAcceptUsers, async (req: Request, res: Response, _next: NextFunction) => {
  try {
    const userRole = (req as any).user.role;
    const { membershipId } = req.params;
    const { paymentMethod } = req.body || {};

    if (userRole !== 'mess-owner' && userRole !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied. Only mess owners and admins can approve payment requests.' 
      });
    }

    console.log(`🔔 Processing payment request approval: ${membershipId} by user ${(req as any).user.id}`);
    console.log(`💳 Payment method: ${paymentMethod || 'Not specified'}`);

    const membership: any = await MessMembership.findById(membershipId);
    if (!membership) {
      return res.status(404).json({ 
        success: false, 
        message: 'Membership not found' 
      });
    }

    if (membership.paymentRequestStatus === 'approved') {
      return res.status(400).json({ 
        success: false, 
        message: 'This payment request has already been approved' 
      });
    }

    if (membership.paymentRequestStatus === 'rejected') {
      return res.status(400).json({ 
        success: false, 
        message: 'This payment request has already been rejected' 
      });
    }

    // Check if credits are sufficient for this new user (if not in trial)
    const { messBillingService } = require('../services/messBillingService');
    const creditCheck = await messBillingService.checkCreditsSufficientForNewUser(membership.messId.toString());
    
    if (!creditCheck.sufficient) {
      return res.status(400).json({ 
        success: false, 
        message: `Insufficient credits to approve this user. You need ${creditCheck.requiredCredits} credits but only have ${creditCheck.availableCredits} available. Please purchase more credits to continue.`,
        data: {
          requiredCredits: creditCheck.requiredCredits,
          availableCredits: creditCheck.availableCredits,
          redirectTo: '/mess-owner/platform-subscription'
        }
      });
    }

    // Calculate subscription end date based on meal plan period
    const mealPlan: any = await MealPlan.findById(membership.mealPlanId);
    const subscriptionStartDate = new Date();
    const period = mealPlan?.pricing?.period || 'monthly';
    const subscriptionEndDate = calculateSubscriptionEndDate(subscriptionStartDate, period);

    // IMPORTANT: Deduct credits BEFORE approving membership
    // This ensures credits are deducted immediately when user joins during billing cycle
    let creditDeductionResult;
    try {
      creditDeductionResult = await messBillingService.deductCreditsForNewUser(
        membership.messId.toString(), 
        membership.userId.toString()
      );
      console.log(`✅ Credits deducted successfully: ${creditDeductionResult?.creditsDeducted || 0} credits`);
    } catch (creditError: any) {
      console.error('❌ Failed to deduct credits for new user:', creditError);
      return res.status(400).json({ 
        success: false, 
        message: creditError.message || 'Failed to deduct credits for new user. Please try again.',
        error: 'CREDIT_DEDUCTION_FAILED'
      });
    }

    // Only approve membership if credit deduction was successful
    membership.status = 'active';
    membership.paymentStatus = 'paid';
    membership.paymentRequestStatus = 'approved';
    membership.lastPaymentDate = new Date();
    membership.subscriptionStartDate = subscriptionStartDate;
    membership.subscriptionEndDate = subscriptionEndDate;
    
    // Ensure amount and due dates are set so the member appears with values in UI
    if (!membership.paymentAmount && mealPlan?.pricing?.amount) {
      membership.paymentAmount = mealPlan.pricing.amount;
    }
    membership.paymentDueDate = subscriptionEndDate;
    membership.nextPaymentDate = subscriptionEndDate;
    await membership.save();

    // Get payment verification record to get transaction ID and payment method
    const paymentVerification = await PaymentVerification.findOne({
      membershipId: membership._id,
      status: 'pending'
    }).sort({ createdAt: -1 });

    // Create transaction record for payment history
    const transactionAmount = membership.paymentAmount || mealPlan?.pricing?.amount || 0;
    const transactionId = paymentVerification?.transactionId || `TXN_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const transactionPaymentMethod = paymentVerification?.paymentMethod || paymentMethod || 'cash';

    const transaction = new Transaction({
      userId: membership.userId,
      messId: membership.messId,
      membershipId: membership._id,
      type: 'payment',
      amount: transactionAmount,
      currency: 'INR',
      status: 'success', // Use 'success' to match Transaction model enum
      paymentMethod: transactionPaymentMethod,
      transactionId: transactionId,
      description: `Payment for ${mealPlan?.name || 'Meal Plan'} - Approved payment request`,
      gateway: {
        name: transactionPaymentMethod === 'upi' ? 'UPI' : transactionPaymentMethod === 'online' ? 'Online' : 'Cash',
        transactionId: transactionId
      },
      metadata: {
        paymentRequestId: paymentVerification?._id?.toString(),
        approvedBy: (req as any).user.id
      }
    });
    await transaction.save();

    // Update payment verification status to approved
    if (paymentVerification) {
      paymentVerification.status = 'approved';
      paymentVerification.verifiedBy = (req as any).user.id;
      paymentVerification.verifiedAt = new Date();
      await paymentVerification.save();
    }

    // Get updated available credits after deduction
    const { MessCredits } = require('../models');
    const updatedCredits = await MessCredits.findOne({ messId: membership.messId });
    const remainingCredits = updatedCredits?.availableCredits || 0;

    // Log successful credit deduction
    console.log(`✅ Payment request approved. Credits deducted: ${creditDeductionResult?.creditsDeducted || 0}. Remaining: ${remainingCredits}`);
    console.log(`✅ Transaction created: ${transaction._id}, Amount: ${transactionAmount}, Transaction ID: ${transactionId}`);

    // Auto-join user to mess chat groups
    try {
      await AutoChatService.autoJoinUserToMessGroups(membership.userId.toString(), membership.messId.toString());
      console.log(`User ${membership.userId} auto-joined chat groups for mess ${membership.messId}`);
    } catch (chatError) {
      console.error('Error auto-joining user to chat groups:', chatError);
    }

    return res.status(200).json({ 
      success: true, 
      message: 'Payment request approved and credits deducted successfully',
      data: {
        creditsDeducted: creditDeductionResult?.creditsDeducted || 0,
        remainingCredits: remainingCredits
      }
    });
  } catch (error) {
    console.error('❌ Error approving payment request:', error);
    return handleAuthError(res, error);
  }
});

// POST /api/payment-requests/:membershipId/reject - Reject a payment request
router.post('/:membershipId/reject', requireAuth, async (req: Request, res: Response, _next: NextFunction) => {
  try {
    const userRole = (req as any).user.role;
    const { membershipId } = req.params;
    const { remarks } = req.body || {};

    if (userRole !== 'mess-owner' && userRole !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied. Only mess owners and admins can reject payment requests.' 
      });
    }

    console.log(`🔔 Processing payment request rejection: ${membershipId} by user ${(req as any).user.id}`);
    console.log(`📝 Remarks: ${remarks || 'No remarks provided'}`);

    const membership: any = await MessMembership.findById(membershipId);
    if (!membership) {
      return res.status(404).json({ 
        success: false, 
        message: 'Membership not found' 
      });
    }

    if (membership.paymentRequestStatus === 'approved') {
      return res.status(400).json({ 
        success: false, 
        message: 'This payment request has already been approved' 
      });
    }

    if (membership.paymentRequestStatus === 'rejected') {
      return res.status(400).json({ 
        success: false, 
        message: 'This payment request has already been rejected' 
      });
    }

    // Update membership payment request status
    membership.paymentRequestStatus = 'rejected';
    await membership.save();

    // Also update the PaymentVerification status if it exists
    const verifiedBy = (req as any).user.id;
    const paymentVerification = await PaymentVerification.findOne({
      membershipId: membershipId,
      status: 'pending'
    }).sort({ updatedAt: -1 }); // Get the most recent pending request

    if (paymentVerification) {
      paymentVerification.status = 'rejected';
      if (remarks) {
        (paymentVerification as any).rejectionReason = remarks;
      }
      (paymentVerification as any).verifiedBy = verifiedBy;
      (paymentVerification as any).verifiedAt = new Date();
      await paymentVerification.save();
      console.log(`✅ Payment verification ${paymentVerification._id} rejected for membership: ${membershipId}`);
    }

    console.log(`✅ Payment request rejected for membership: ${membershipId}`);

    return res.status(200).json({ 
      success: true, 
      message: 'Payment request rejected successfully' 
    });
  } catch (error) {
    console.error('❌ Error rejecting payment request:', error);
    return handleAuthError(res, error);
  }
});

export default router;

