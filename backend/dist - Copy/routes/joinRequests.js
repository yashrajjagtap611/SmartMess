"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const requireAuth_1 = __importDefault(require("../middleware/requireAuth"));
const errorHandler_1 = require("../middleware/errorHandler");
const Notification_1 = __importDefault(require("../models/Notification"));
const MessMembership_1 = __importDefault(require("../models/MessMembership"));
const MealPlan_1 = __importDefault(require("../models/MealPlan"));
const autoChatService_1 = require("../services/autoChatService");
const router = (0, express_1.Router)();
// Helper function to calculate subscription end date
const calculateSubscriptionEndDate = (startDate, period) => {
    const endDate = new Date(startDate);
    if (period === 'daily')
        endDate.setDate(endDate.getDate() + 1);
    else if (period === 'weekly')
        endDate.setDate(endDate.getDate() + 7);
    else if (period === '15days')
        endDate.setDate(endDate.getDate() + 15);
    else if (period === '3months')
        endDate.setMonth(endDate.getMonth() + 3);
    else if (period === '6months')
        endDate.setMonth(endDate.getMonth() + 6);
    else if (period === 'yearly')
        endDate.setFullYear(endDate.getFullYear() + 1);
    else
        endDate.setMonth(endDate.getMonth() + 1); // default to monthly
    return endDate;
};
// POST /api/join-requests/:notificationId/approve - Approve a join request
router.post('/:notificationId/approve', requireAuth_1.default, async (req, res, _next) => {
    try {
        const { notificationId } = req.params;
        const { remarks } = req.body || {};
        const userId = req.user.id;
        const userRole = req.user.role;
        if (userRole !== 'mess-owner' && userRole !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Only mess owners and admins can approve join requests.'
            });
        }
        console.log(`🔔 Processing join request approval: ${notificationId} by user ${userId}`);
        console.log(`📝 Remarks: ${remarks || 'No remarks provided'}`);
        const notification = await Notification_1.default.findOne({
            _id: notificationId,
            userId,
            type: 'join_request'
        });
        if (!notification) {
            console.error(`❌ Join request notification not found: ${notificationId} for user ${userId}`);
            return res.status(404).json({
                success: false,
                message: 'Join request not found'
            });
        }
        if (notification.status === 'approved') {
            return res.status(400).json({
                success: false,
                message: 'This join request has already been approved'
            });
        }
        if (notification.status === 'rejected') {
            return res.status(400).json({
                success: false,
                message: 'This join request has already been rejected'
            });
        }
        console.log(`📋 Found join request notification: ${notification.title}`);
        // Get request data
        const requestingUserId = notification.data?.requestingUserId;
        const mealPlanId = notification.data?.mealPlanId;
        const paymentType = notification.data?.paymentType || 'pay_later';
        if (!requestingUserId || !notification.messId) {
            return res.status(400).json({
                success: false,
                message: 'Missing required data for membership creation'
            });
        }
        if (!mealPlanId) {
            return res.status(400).json({
                success: false,
                message: 'Missing meal plan ID for membership creation'
            });
        }
        try {
            // Fetch meal plan to get price and other details
            const mealPlan = await MealPlan_1.default.findById(mealPlanId);
            if (!mealPlan) {
                return res.status(400).json({
                    success: false,
                    message: 'Meal plan not found'
                });
            }
            // Check and deduct credits BEFORE approving membership
            const { messBillingService } = require('../services/messBillingService');
            const creditCheck = await messBillingService.checkCreditsSufficientForNewUser(notification.messId.toString());
            if (!creditCheck.sufficient) {
                console.error('❌ Insufficient credits to approve user:', {
                    requiredCredits: creditCheck.requiredCredits,
                    availableCredits: creditCheck.availableCredits
                });
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
            // Deduct credits immediately before approving membership
            let creditDeductionResult;
            let creditDeductionInfo = null;
            try {
                creditDeductionResult = await messBillingService.deductCreditsForNewUser(notification.messId.toString(), requestingUserId.toString());
                console.log(`✅ Credits deducted successfully: ${creditDeductionResult?.creditsDeducted || 0} credits`);
                // Store credit info for response
                const { MessCredits } = require('../models');
                const updatedCredits = await MessCredits.findOne({ messId: notification.messId });
                creditDeductionInfo = {
                    creditsDeducted: creditDeductionResult?.creditsDeducted || 0,
                    remainingCredits: updatedCredits?.availableCredits || 0
                };
            }
            catch (creditError) {
                console.error('❌ Failed to deduct credits for new user:', creditError);
                return res.status(400).json({
                    success: false,
                    message: creditError.message || 'Failed to deduct credits for new user. Please try again.',
                    error: 'CREDIT_DEDUCTION_FAILED'
                });
            }
            // Check if membership already exists
            const existingMembership = await MessMembership_1.default.findOne({
                userId: requestingUserId,
                messId: notification.messId,
                mealPlanId: mealPlanId,
                status: { $in: ['pending', 'active', 'inactive'] }
            });
            // Determine payment status based on payment type
            const paymentStatus = paymentType === 'pay_now' ? 'paid' : 'pending';
            const lastPaymentDate = paymentType === 'pay_now' ? new Date() : undefined;
            const paymentDueDate = paymentType === 'pay_later' ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) : undefined;
            // Calculate subscription end date
            const subscriptionStartDate = new Date();
            const subscriptionEndDate = calculateSubscriptionEndDate(subscriptionStartDate, mealPlan.pricing.period);
            if (existingMembership) {
                existingMembership.status = 'active';
                existingMembership.mealPlanId = mealPlanId;
                existingMembership.paymentStatus = paymentStatus;
                existingMembership.paymentType = paymentType;
                existingMembership.paymentAmount = mealPlan.pricing.amount;
                existingMembership.paymentRequestStatus = 'approved';
                if (paymentDueDate) {
                    existingMembership.paymentDueDate = paymentDueDate;
                }
                existingMembership.subscriptionStartDate = subscriptionStartDate;
                existingMembership.subscriptionEndDate = subscriptionEndDate;
                if (lastPaymentDate) {
                    existingMembership.lastPaymentDate = lastPaymentDate;
                }
                await existingMembership.save();
                console.log('✅ Existing membership updated successfully');
            }
            else {
                const membership = new MessMembership_1.default({
                    userId: requestingUserId,
                    messId: notification.messId,
                    mealPlanId: mealPlanId,
                    status: 'active',
                    paymentStatus: paymentStatus,
                    paymentType: paymentType,
                    paymentAmount: mealPlan.pricing.amount,
                    paymentRequestStatus: 'approved',
                    paymentDueDate: paymentDueDate,
                    lastPaymentDate: lastPaymentDate,
                    subscriptionStartDate: subscriptionStartDate,
                    subscriptionEndDate: subscriptionEndDate,
                    reminderSentCount: 0,
                    autoRenewal: true,
                    paymentHistory: []
                });
                await membership.save();
                console.log('✅ New membership created successfully');
            }
            // Update notification status AFTER successful credit deduction and membership creation
            notification.status = 'approved';
            notification.isRead = true;
            await notification.save();
            console.log(`✅ Notification status updated to: approved`);
            // Auto-join user to mess chat groups
            try {
                await autoChatService_1.AutoChatService.autoJoinUserToMessGroups(requestingUserId.toString(), notification.messId.toString());
                console.log(`User ${requestingUserId} auto-joined chat groups for mess ${notification.messId}`);
            }
            catch (chatError) {
                console.error('Error auto-joining user to chat groups:', chatError);
            }
            // Send notification to the requesting user
            try {
                const userNotification = new Notification_1.default({
                    userId: requestingUserId,
                    messId: notification.messId,
                    type: 'join_request',
                    title: 'Join Request Approved',
                    message: paymentType === 'pay_later'
                        ? `Your 'Pay Later' plan request has been approved! Welcome to the community. Payment status: Pending - please complete your payment.${remarks ? ` Remarks: ${remarks}` : ''}`
                        : `Your request to join the mess has been approved! Welcome to the community.${remarks ? ` Remarks: ${remarks}` : ''}`,
                    status: 'completed',
                    data: {
                        messId: notification.messId,
                        approvedBy: userId,
                        approvedAt: new Date().toISOString(),
                        paymentType: paymentType,
                        remarks: remarks
                    },
                    isRead: false
                });
                await userNotification.save();
                console.log('✅ User notification created for approval');
            }
            catch (error) {
                console.error('❌ Error sending user notification for approval:', error);
            }
            return res.status(200).json({
                success: true,
                message: 'Join request approved successfully',
                data: {
                    ...notification.toObject(),
                    creditDeduction: creditDeductionInfo
                }
            });
        }
        catch (error) {
            console.error('❌ Error processing join request approval:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to process join request approval',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
    catch (err) {
        console.error('❌ Error approving join request:', err);
        return (0, errorHandler_1.handleAuthError)(res, err);
    }
});
// POST /api/join-requests/:notificationId/reject - Reject a join request
router.post('/:notificationId/reject', requireAuth_1.default, async (req, res, _next) => {
    try {
        const { notificationId } = req.params;
        const { remarks } = req.body || {};
        const userId = req.user.id;
        const userRole = req.user.role;
        if (userRole !== 'mess-owner' && userRole !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Only mess owners and admins can reject join requests.'
            });
        }
        console.log(`🔔 Processing join request rejection: ${notificationId} by user ${userId}`);
        console.log(`📝 Remarks: ${remarks || 'No remarks provided'}`);
        const notification = await Notification_1.default.findOne({
            _id: notificationId,
            userId,
            type: 'join_request'
        });
        if (!notification) {
            console.error(`❌ Join request notification not found: ${notificationId} for user ${userId}`);
            return res.status(404).json({
                success: false,
                message: 'Join request not found'
            });
        }
        if (notification.status === 'approved') {
            return res.status(400).json({
                success: false,
                message: 'This join request has already been approved'
            });
        }
        if (notification.status === 'rejected') {
            return res.status(400).json({
                success: false,
                message: 'This join request has already been rejected'
            });
        }
        // Update notification status
        notification.status = 'rejected';
        notification.isRead = true;
        await notification.save();
        console.log(`✅ Notification status updated to: rejected`);
        // Send notification to the requesting user
        const requestingUserId = notification.data?.requestingUserId;
        if (requestingUserId) {
            try {
                const userNotification = new Notification_1.default({
                    userId: requestingUserId,
                    messId: notification.messId,
                    type: 'join_request',
                    title: 'Join Request Rejected',
                    message: `Your request to join the mess has been rejected.${remarks ? ` Reason: ${remarks}` : ' Please contact the mess owner for more details.'}`,
                    status: 'rejected',
                    data: {
                        messId: notification.messId,
                        rejectedBy: userId,
                        rejectedAt: new Date().toISOString(),
                        remarks: remarks
                    },
                    isRead: false
                });
                await userNotification.save();
                console.log('✅ User notification created for rejection');
            }
            catch (error) {
                console.error('❌ Error sending user notification for rejection:', error);
            }
        }
        return res.status(200).json({
            success: true,
            message: 'Join request rejected successfully',
            data: notification.toObject()
        });
    }
    catch (err) {
        console.error('❌ Error rejecting join request:', err);
        return (0, errorHandler_1.handleAuthError)(res, err);
    }
});
exports.default = router;
//# sourceMappingURL=joinRequests.js.map