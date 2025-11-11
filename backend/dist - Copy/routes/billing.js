"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const requireAuth_1 = __importDefault(require("../middleware/requireAuth"));
const errorHandler_1 = require("../middleware/errorHandler");
const billingService_1 = __importDefault(require("../services/billingService"));
const paymentGatewayService_1 = __importDefault(require("../services/paymentGatewayService"));
const billing_1 = require("../validators/billing");
const chatService_1 = require("../services/chatService");
const notificationService_1 = require("../services/notificationService");
const Billing_1 = __importDefault(require("../models/Billing"));
const Transaction_1 = __importDefault(require("../models/Transaction"));
const MessMembership_1 = __importDefault(require("../models/MessMembership"));
const MealPlan_1 = __importDefault(require("../models/MealPlan"));
const PaymentVerification_1 = __importDefault(require("../models/PaymentVerification"));
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const router = (0, express_1.Router)();
// ==================== BILLING ENDPOINTS ====================
// POST /api/billing/create - Create a new billing record
router.post('/create', requireAuth_1.default, async (req, res, _next) => {
    const userId = req.user.id;
    const userRole = req.user.role;
    try {
        const billingData = req.body;
        // Validate billing data
        const validation = (0, billing_1.validateBillingData)(billingData);
        if (!validation.isValid) {
            return res.status(400).json({
                success: false,
                message: 'Invalid billing data',
                errors: validation.errors
            });
        }
        // Only mess owners and admins can create billing records
        if (userRole !== 'mess-owner' && userRole !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Only mess owners and admins can create billing records.'
            });
        }
        const result = await billingService_1.default.createBilling(billingData);
        return res.status(201).json({
            success: true,
            message: result.message,
            data: result.data
        });
    }
    catch (error) {
        console.error('Billing creation error:', error);
        return (0, errorHandler_1.handleAuthError)(res, error);
    }
});
// GET /api/billing/dashboard - Get billing dashboard data (admin only)
router.get('/dashboard', requireAuth_1.default, async (req, res, _next) => {
    const userRole = req.user.role;
    try {
        if (userRole !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Only admins can access billing dashboard.'
            });
        }
        const dashboardData = await billingService_1.default.getBillingDashboard();
        return res.status(200).json({
            success: true,
            data: dashboardData
        });
    }
    catch (error) {
        console.error('Billing dashboard error:', error);
        return (0, errorHandler_1.handleAuthError)(res, error);
    }
});
// GET /api/billing/mess-owner/:messId - Get mess owner billing data
router.get('/mess-owner/:messId', requireAuth_1.default, async (req, res, _next) => {
    const userId = req.user.id;
    const userRole = req.user.role;
    const { messId } = req.params;
    try {
        // Check if user has access to this mess
        if (userRole !== 'admin') {
            // For mess owners, verify they own this mess
            const MessProfile = require('../models/MessProfile').default;
            const mess = await MessProfile.findOne({ userId, _id: messId });
            if (!mess) {
                return res.status(403).json({
                    success: false,
                    message: 'Access denied. You can only access your own mess billing data.'
                });
            }
        }
        const billingData = await billingService_1.default.getMessOwnerBillingData(messId);
        return res.status(200).json({
            success: true,
            data: billingData
        });
    }
    catch (error) {
        console.error('Mess owner billing data error:', error);
        return (0, errorHandler_1.handleAuthError)(res, error);
    }
});
// Payment request endpoints moved to /api/payment-requests/:membershipId/approve and /api/payment-requests/:membershipId/reject
// See backend/src/routes/paymentRequests.ts
// GET /api/billing/user - Get user billing data
router.get('/user', requireAuth_1.default, async (req, res, _next) => {
    const userId = req.user.id;
    try {
        const billingData = await billingService_1.default.getUserBillingData(userId);
        return res.status(200).json({
            success: true,
            data: billingData
        });
    }
    catch (error) {
        console.error('User billing data error:', error);
        return (0, errorHandler_1.handleAuthError)(res, error);
    }
});
// POST /api/billing/reports/generate - Generate billing report
router.post('/reports/generate', requireAuth_1.default, async (req, res, _next) => {
    const userId = req.user.id;
    const userRole = req.user.role;
    const { messId, startDate, endDate } = req.body;
    try {
        // Check if user has access to this mess
        if (userRole !== 'admin') {
            const MessProfile = require('../models/MessProfile').default;
            const mess = await MessProfile.findOne({ userId, _id: messId });
            if (!mess) {
                return res.status(403).json({
                    success: false,
                    message: 'Access denied. You can only generate reports for your own mess.'
                });
            }
        }
        if (!messId || !startDate || !endDate) {
            return res.status(400).json({
                success: false,
                message: 'Mess ID, start date, and end date are required'
            });
        }
        const report = await billingService_1.default.generateBillingReport(messId, startDate, endDate);
        return res.status(200).json({
            success: true,
            data: report
        });
    }
    catch (error) {
        console.error('Billing report generation error:', error);
        return (0, errorHandler_1.handleAuthError)(res, error);
    }
});
// GET /api/billing/:billingId - Get specific billing record
router.get('/:billingId', requireAuth_1.default, async (req, res, _next) => {
    const userId = req.user.id;
    const userRole = req.user.role;
    const { billingId } = req.params;
    try {
        const Billing = require('../models/Billing').default;
        const billing = await Billing.findById(billingId)
            .populate('userId', 'name email phone')
            .populate('messId', 'name')
            .populate('subscription.planId', 'name pricing');
        if (!billing) {
            return res.status(404).json({
                success: false,
                message: 'Billing record not found'
            });
        }
        // Check access permissions
        if (userRole !== 'admin' && billing.userId._id.toString() !== userId) {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }
        return res.status(200).json({
            success: true,
            data: billing
        });
    }
    catch (error) {
        console.error('Get billing record error:', error);
        return (0, errorHandler_1.handleAuthError)(res, error);
    }
});
// PUT /api/billing/:billingId/status - Update billing status
router.put('/:billingId/status', requireAuth_1.default, async (req, res, _next) => {
    const userRole = req.user.role;
    const { billingId } = req.params;
    const { status, notes } = req.body;
    try {
        // Only mess owners and admins can update billing status
        if (userRole !== 'mess-owner' && userRole !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Only mess owners and admins can update billing status.'
            });
        }
        const Billing = require('../models/Billing').default;
        const billing = await Billing.findById(billingId);
        if (!billing) {
            return res.status(404).json({
                success: false,
                message: 'Billing record not found'
            });
        }
        billing.payment.status = status;
        if (notes) {
            billing.metadata.notes = notes;
        }
        await billing.save();
        return res.status(200).json({
            success: true,
            message: 'Billing status updated successfully',
            data: billing
        });
    }
    catch (error) {
        console.error('Update billing status error:', error);
        return (0, errorHandler_1.handleAuthError)(res, error);
    }
});
// Subscription endpoints removed
// ==================== PAYMENT ENDPOINTS ====================
// POST /api/billing/payments/create-order - Create payment order
router.post('/payments/create-order', requireAuth_1.default, async (req, res, _next) => {
    const userId = req.user.id;
    try {
        const paymentData = req.body;
        // Validate payment data
        const validation = (0, billing_1.validatePaymentData)(paymentData);
        if (!validation.isValid) {
            return res.status(400).json({
                success: false,
                message: 'Invalid payment data',
                errors: validation.errors
            });
        }
        // Get user details
        const User = require('../models/User').default;
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        const paymentRequest = {
            amount: paymentData.amount,
            currency: paymentData.currency || 'INR',
            userId,
            messId: paymentData.messId,
            billingId: paymentData.billingId,
            subscriptionId: paymentData.subscriptionId,
            description: paymentData.description,
            customerInfo: {
                name: user.name,
                email: user.email,
                phone: user.phone || ''
            },
            metadata: paymentData.metadata
        };
        const result = await paymentGatewayService_1.default.createPaymentOrder(paymentRequest, paymentData.gatewayType || 'razorpay');
        if (result.success) {
            return res.status(201).json({
                success: true,
                message: 'Payment order created successfully',
                data: result
            });
        }
        else {
            return res.status(400).json({
                success: false,
                message: result.error,
                data: result
            });
        }
    }
    catch (error) {
        console.error('Create payment order error:', error);
        return (0, errorHandler_1.handleAuthError)(res, error);
    }
});
// POST /api/billing/payments/verify - Verify payment
router.post('/payments/verify', requireAuth_1.default, async (req, res, _next) => {
    const userId = req.user.id;
    try {
        const { transactionId, paymentData, gatewayType } = req.body;
        if (!transactionId || !paymentData) {
            return res.status(400).json({
                success: false,
                message: 'Transaction ID and payment data are required'
            });
        }
        const result = await paymentGatewayService_1.default.verifyPayment(transactionId, paymentData, gatewayType || 'razorpay');
        if (result.success) {
            return res.status(200).json({
                success: true,
                message: 'Payment verified successfully',
                data: result
            });
        }
        else {
            return res.status(400).json({
                success: false,
                message: result.error,
                data: result
            });
        }
    }
    catch (error) {
        console.error('Verify payment error:', error);
        return (0, errorHandler_1.handleAuthError)(res, error);
    }
});
// POST /api/billing/payments/refund - Process refund
router.post('/payments/refund', requireAuth_1.default, async (req, res, _next) => {
    const userId = req.user.id;
    const userRole = req.user.role;
    try {
        const { transactionId, amount, reason } = req.body;
        // Only mess owners and admins can process refunds
        if (userRole !== 'mess-owner' && userRole !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Only mess owners and admins can process refunds.'
            });
        }
        if (!transactionId || !amount || !reason) {
            return res.status(400).json({
                success: false,
                message: 'Transaction ID, amount, and reason are required'
            });
        }
        const refundRequest = {
            transactionId,
            amount,
            reason,
            refundedBy: userId
        };
        const result = await paymentGatewayService_1.default.processRefund(refundRequest);
        if (result.success) {
            return res.status(200).json({
                success: true,
                message: 'Refund processed successfully',
                data: result
            });
        }
        else {
            return res.status(400).json({
                success: false,
                message: result.error,
                data: result
            });
        }
    }
    catch (error) {
        console.error('Process refund error:', error);
        return (0, errorHandler_1.handleAuthError)(res, error);
    }
});
// GET /api/billing/payments/gateways - Get available payment gateways
router.get('/payments/gateways', requireAuth_1.default, async (req, res, _next) => {
    try {
        const gateways = paymentGatewayService_1.default.getAvailableGateways();
        return res.status(200).json({
            success: true,
            data: gateways
        });
    }
    catch (error) {
        console.error('Get payment gateways error:', error);
        return (0, errorHandler_1.handleAuthError)(res, error);
    }
});
// GET /api/billing/payments/gateway-config/:gatewayType - Get gateway configuration
router.get('/payments/gateway-config/:gatewayType', requireAuth_1.default, async (req, res, _next) => {
    try {
        const { gatewayType } = req.params;
        const config = paymentGatewayService_1.default.getGatewayConfig(gatewayType);
        if (!config) {
            return res.status(404).json({
                success: false,
                message: 'Gateway not found'
            });
        }
        return res.status(200).json({
            success: true,
            data: config
        });
    }
    catch (error) {
        console.error('Get gateway config error:', error);
        return (0, errorHandler_1.handleAuthError)(res, error);
    }
});
// ==================== ENHANCED MESS OWNER ENDPOINTS ====================
// PUT /api/billing/payment-status/:membershipId - Update payment status manually
router.put('/payment-status/:membershipId', requireAuth_1.default, async (req, res, _next) => {
    const userId = req.user.id;
    const userRole = req.user.role;
    const { membershipId } = req.params;
    const { status, notes, paymentMethod } = req.body;
    try {
        if (userRole !== 'mess-owner' && userRole !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Only mess owners and admins can update payment status.'
            });
        }
        const MessMembership = require('../models/MessMembership').default;
        const membership = await MessMembership.findById(membershipId);
        if (!membership) {
            return res.status(404).json({
                success: false,
                message: 'Membership not found'
            });
        }
        // Verify mess ownership
        if (userRole !== 'admin') {
            const MessProfile = require('../models/MessProfile').default;
            const mess = await MessProfile.findOne({ userId, _id: membership.messId });
            if (!mess) {
                return res.status(403).json({
                    success: false,
                    message: 'Access denied. You can only update payment status for your own mess members.'
                });
            }
        }
        membership.paymentStatus = status;
        if (paymentMethod)
            membership.paymentMethod = paymentMethod;
        if (status === 'paid') {
            membership.lastPaymentDate = new Date();
            membership.nextPaymentDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        }
        if (notes)
            membership.notes = notes;
        await membership.save();
        return res.status(200).json({
            success: true,
            message: 'Payment status updated successfully',
            data: membership
        });
    }
    catch (error) {
        console.error('Update payment status error:', error);
        return (0, errorHandler_1.handleAuthError)(res, error);
    }
});
// PUT /api/billing/bulk-payment-status - Bulk update payment status
router.put('/bulk-payment-status', requireAuth_1.default, async (req, res, _next) => {
    const userId = req.user.id;
    const userRole = req.user.role;
    const { membershipIds, status, notes } = req.body;
    try {
        if (userRole !== 'mess-owner' && userRole !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Only mess owners and admins can bulk update payment status.'
            });
        }
        const MessMembership = require('../models/MessMembership').default;
        let processed = 0;
        const errors = [];
        for (const membershipId of membershipIds) {
            try {
                const membership = await MessMembership.findById(membershipId);
                if (!membership) {
                    errors.push(`Membership ${membershipId} not found`);
                    continue;
                }
                // Verify mess ownership
                if (userRole !== 'admin') {
                    const MessProfile = require('../models/MessProfile').default;
                    const mess = await MessProfile.findOne({ userId, _id: membership.messId });
                    if (!mess) {
                        errors.push(`Access denied for membership ${membershipId}`);
                        continue;
                    }
                }
                membership.paymentStatus = status;
                if (status === 'paid') {
                    membership.lastPaymentDate = new Date();
                    membership.nextPaymentDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
                }
                if (notes)
                    membership.notes = notes;
                await membership.save();
                processed++;
            }
            catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                errors.push(`Error updating membership ${membershipId}: ${errorMessage}`);
            }
        }
        return res.status(200).json({
            success: true,
            message: `Updated ${processed} payment statuses successfully`,
            processed,
            errors
        });
    }
    catch (error) {
        console.error('Bulk update payment status error:', error);
        return (0, errorHandler_1.handleAuthError)(res, error);
    }
});
// Removed: upload receipt endpoint
// PUT /api/billing/verify-payment-request/:requestId - Verify payment request
router.put('/verify-payment-request/:requestId', requireAuth_1.default, async (req, res, _next) => {
    const userId = req.user.id;
    const userRole = req.user.role;
    const { requestId } = req.params;
    const { verified, notes } = req.body;
    try {
        if (userRole !== 'mess-owner' && userRole !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Only mess owners and admins can verify payment requests.'
            });
        }
        // In a real implementation, you'd have a PaymentRequest model
        // For now, we'll simulate this functionality
        return res.status(200).json({
            success: true,
            message: `Payment request ${verified ? 'verified' : 'rejected'} successfully`
        });
    }
    catch (error) {
        console.error('Verify payment request error:', error);
        return (0, errorHandler_1.handleAuthError)(res, error);
    }
});
// Removed: generate individual bill endpoint
// POST /api/billing/send-bulk-reminders - Send bulk payment reminders
router.post('/send-bulk-reminders', requireAuth_1.default, async (req, res, _next) => {
    const userId = req.user.id;
    const userRole = req.user.role;
    const { membershipIds, message } = req.body;
    try {
        if (userRole !== 'mess-owner' && userRole !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Only mess owners and admins can send bulk reminders.'
            });
        }
        const MessMembership = require('../models/MessMembership').default;
        let sent = 0;
        let failed = 0;
        for (const membershipId of membershipIds) {
            try {
                const membership = await MessMembership.findById(membershipId)
                    .populate('userId', 'firstName lastName email phone');
                if (!membership) {
                    failed++;
                    continue;
                }
                // Verify mess ownership
                if (userRole !== 'admin') {
                    const MessProfile = require('../models/MessProfile').default;
                    const mess = await MessProfile.findOne({ userId, _id: membership.messId });
                    if (!mess) {
                        failed++;
                        continue;
                    }
                }
                // 1) Ensure individual chat exists between mess owner and user
                let room;
                try {
                    room = await chatService_1.ChatService.createIndividualChat(userId, membership.userId._id.toString());
                }
                catch (e) {
                    // If already exists or creation fails, attempt to continue without throwing
                    room = room || null;
                }
                // 2) Send chat message (fallback if room unavailable)
                const chatMessage = message && message.trim().length > 0
                    ? message.trim()
                    : `Friendly reminder to clear your pending mess bill. Please pay at the earliest.`;
                if (room && room._id) {
                    try {
                        await chatService_1.ChatService.sendMessage(userId, {
                            roomId: room._id.toString(),
                            content: chatMessage,
                            messageType: 'text'
                        });
                    }
                    catch (e) {
                        console.warn('Failed to send chat message for reminder', e);
                    }
                }
                // 3) Send notification to the user
                try {
                    await (0, notificationService_1.sendNotification)({
                        userId: membership.userId._id.toString(),
                        title: 'Payment Reminder',
                        message: chatMessage,
                        type: 'payment_reminder',
                        channels: ['push', 'email']
                    });
                }
                catch (e) {
                    console.warn('Failed to send notification for reminder', e);
                }
                sent++;
            }
            catch (error) {
                failed++;
            }
        }
        return res.status(200).json({
            success: true,
            message: `Sent ${sent} reminders successfully`,
            sent,
            failed
        });
    }
    catch (error) {
        console.error('Send bulk reminders error:', error);
        return (0, errorHandler_1.handleAuthError)(res, error);
    }
});
// Removed: calculate with leaves endpoint
// POST /api/billing/calculate-user-billing - Calculate billing for user (frontend preview)
router.post('/calculate-user-billing', requireAuth_1.default, async (req, res, _next) => {
    const userId = req.user.id;
    const userRole = req.user.role;
    try {
        const { planId, subscriptionStartDate, subscriptionEndDate, approvedLeaves = [], extensionId, discountAmount = 0 } = req.body;
        // Input validation
        if (!planId) {
            return res.status(400).json({
                success: false,
                message: 'Plan ID is required'
            });
        }
        if (discountAmount < 0) {
            return res.status(400).json({
                success: false,
                message: 'Discount amount cannot be negative'
            });
        }
        if (approvedLeaves && !Array.isArray(approvedLeaves)) {
            return res.status(400).json({
                success: false,
                message: 'Approved leaves must be an array'
            });
        }
        // Get meal plan details - planId is actually a membership ID
        const MessMembership = require('../models/MessMembership').default;
        const membership = await MessMembership.findById(planId).populate('mealPlanId');
        if (!membership) {
            return res.status(404).json({
                success: false,
                message: 'Membership not found'
            });
        }
        const mealPlan = membership.mealPlanId;
        if (!mealPlan) {
            return res.status(404).json({
                success: false,
                message: 'Meal plan not found for this membership'
            });
        }
        // Calculate base pricing
        const basePrice = mealPlan.pricing.amount;
        const platformFee = mealPlan.platformFee || 0;
        // Get extension price if selected
        let extensionPrice = 0;
        if (extensionId && mealPlan.extensions) {
            const extension = mealPlan.extensions.find((ext) => ext.id === extensionId);
            if (extension) {
                extensionPrice = extension.price || 0;
            }
        }
        // Get subscription period dates
        const subStartDate = subscriptionStartDate ? new Date(subscriptionStartDate) : new Date();
        const subEndDate = subscriptionEndDate ? new Date(subscriptionEndDate) : new Date(subStartDate.getTime() + 30 * 24 * 60 * 60 * 1000);
        // Calculate subscription period for reference
        const subscriptionDays = Math.floor((subEndDate.getTime() - subStartDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
        let totalLeaveDeduction = 0;
        const processedLeaves = [];
        // Process each approved leave for overlap calculation
        if (approvedLeaves && Array.isArray(approvedLeaves)) {
            for (const leave of approvedLeaves) {
                const leaveStartDate = new Date(leave.startDate);
                const leaveEndDate = new Date(leave.endDate);
                // Check if leave overlaps with subscription period
                const hasOverlap = leaveStartDate < subEndDate && leaveEndDate > subStartDate;
                if (hasOverlap) {
                    // Calculate overlapping period
                    const overlapStartDate = new Date(Math.max(leaveStartDate.getTime(), subStartDate.getTime()));
                    const overlapEndDate = new Date(Math.min(leaveEndDate.getTime(), subEndDate.getTime()));
                    // Calculate overlapping days (inclusive)
                    const timeDiff = overlapEndDate.getTime() - overlapStartDate.getTime();
                    const overlapDays = Math.max(0, Math.floor(timeDiff / (1000 * 60 * 60 * 24)) + 1);
                    // Calculate total leave days and daily rate from the original leave
                    const totalLeaveDays = Math.floor((leaveEndDate.getTime() - leaveStartDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
                    const dailyRate = totalLeaveDays > 0 ? (leave.estimatedSavings / totalLeaveDays) : 0;
                    // Calculate deduction for overlap period only
                    const overlapDeduction = Math.round(dailyRate * overlapDays * 100) / 100;
                    totalLeaveDeduction += overlapDeduction;
                    // Calculate ignored days and amount
                    const ignoredDays = totalLeaveDays - overlapDays;
                    const ignoredAmount = Math.round(dailyRate * ignoredDays * 100) / 100;
                    processedLeaves.push({
                        leaveId: leave.id,
                        originalLeave: {
                            startDate: leave.startDate,
                            endDate: leave.endDate,
                            totalDays: totalLeaveDays,
                            estimatedSavings: leave.estimatedSavings || (dailyRate * totalLeaveDays)
                        },
                        overlap: {
                            startDate: overlapStartDate.toISOString(),
                            endDate: overlapEndDate.toISOString(),
                            days: overlapDays,
                            deduction: overlapDeduction
                        },
                        ignored: {
                            days: ignoredDays,
                            amount: ignoredAmount
                        },
                        dailyRate: dailyRate
                    });
                }
            }
        }
        // Calculate final amounts
        const subtotal = basePrice + extensionPrice;
        const totalAfterDiscount = subtotal - discountAmount;
        const totalAfterLeaveDeduction = totalAfterDiscount - totalLeaveDeduction;
        const finalTotal = totalAfterLeaveDeduction + platformFee;
        // Log calculation details for debugging
        console.log('User billing calculation completed:', {
            userId,
            planId,
            basePrice,
            extensionPrice,
            totalLeaveDeduction,
            finalTotal,
            processedLeavesCount: processedLeaves.length
        });
        return res.status(200).json({
            success: true,
            data: {
                basePrice,
                extensionPrice,
                platformFee,
                discountAmount,
                approvedLeavesDeduction: totalLeaveDeduction,
                processedLeaves,
                subscriptionPeriod: {
                    startDate: subStartDate.toISOString(),
                    endDate: subEndDate.toISOString(),
                    days: subscriptionDays
                },
                pricing: {
                    subtotal,
                    totalAfterDiscount,
                    totalAfterLeaveDeduction,
                    finalTotal
                }
            }
        });
    }
    catch (error) {
        console.error('Calculate user billing error:', {
            error: error?.message || 'Unknown error',
            stack: error?.stack,
            userId,
            planId: req.body.planId,
            subscriptionStartDate: req.body.subscriptionStartDate,
            subscriptionEndDate: req.body.subscriptionEndDate
        });
        return (0, errorHandler_1.handleAuthError)(res, error);
    }
});
// POST /api/billing/send-payment-reminder/:membershipId - Send individual payment reminder
router.post('/send-payment-reminder/:membershipId', requireAuth_1.default, async (req, res, _next) => {
    const userId = req.user.id;
    const userRole = req.user.role;
    const { membershipId } = req.params;
    try {
        if (userRole !== 'mess-owner' && userRole !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Only mess owners and admins can send payment reminders.'
            });
        }
        const MessMembership = require('../models/MessMembership').default;
        const membership = await MessMembership.findById(membershipId)
            .populate('userId', 'firstName lastName email phone');
        if (!membership) {
            return res.status(404).json({
                success: false,
                message: 'Membership not found'
            });
        }
        // Verify mess ownership
        if (userRole !== 'admin') {
            const MessProfile = require('../models/MessProfile').default;
            const mess = await MessProfile.findOne({ userId, _id: membership.messId });
            if (!mess) {
                return res.status(403).json({
                    success: false,
                    message: 'Access denied. You can only send reminders for your own mess members.'
                });
            }
        }
        // Send reminder (in real implementation, send email/SMS/notification)
        console.log(`Sending payment reminder to ${membership.userId.email}`);
        return res.status(200).json({
            success: true,
            message: 'Payment reminder sent successfully'
        });
    }
    catch (error) {
        console.error('Send payment reminder error:', error);
        return (0, errorHandler_1.handleAuthError)(res, error);
    }
});
// Configure multer for file uploads
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path_1.default.join(__dirname, '../../uploads/receipts');
        // Create directory if it doesn't exist
        if (!fs_1.default.existsSync(uploadDir)) {
            fs_1.default.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, `receipt-${uniqueSuffix}${path_1.default.extname(file.originalname)}`);
    }
});
const upload = (0, multer_1.default)({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|pdf/;
        const extname = allowedTypes.test(path_1.default.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        if (extname && mimetype) {
            return cb(null, true);
        }
        cb(new Error('Only image files (jpeg, jpg, png) and PDF files are allowed'));
    }
});
// POST /api/billing/submit-payment-request - Submit payment request (user side)
router.post('/submit-payment-request', requireAuth_1.default, upload.single('receipt'), async (req, res, _next) => {
    const userId = req.user.id;
    const { billId, paymentMethod, transactionId } = req.body;
    const file = req.file;
    try {
        // Find the billing record to get membership details
        let membershipId = null;
        let messId = null;
        let mealPlanId = null;
        let amount = 0;
        // Try to find billing record first
        const billing = await Billing_1.default.findById(billId);
        if (billing) {
            membershipId = billing.membershipId?.toString() || null;
            messId = billing.messId?.toString() || null;
            amount = billing.subscription?.totalAmount || 0;
            // Get membership to find mealPlanId
            if (membershipId) {
                const membership = await MessMembership_1.default.findById(membershipId);
                if (membership) {
                    mealPlanId = membership.mealPlanId?.toString() || null;
                }
            }
        }
        else {
            // If billId is actually a membershipId (for cases where no bill exists yet)
            const membership = await MessMembership_1.default.findById(billId);
            if (membership) {
                membershipId = membership._id.toString();
                messId = membership.messId?.toString() || null;
                mealPlanId = membership.mealPlanId?.toString() || null;
                // Get amount from meal plan
                if (mealPlanId) {
                    const mealPlan = await MealPlan_1.default.findById(mealPlanId);
                    if (mealPlan) {
                        amount = mealPlan.pricing?.amount || 0;
                    }
                }
            }
            else {
                return res.status(404).json({
                    success: false,
                    message: 'Billing record or membership not found'
                });
            }
        }
        if (!membershipId || !messId || !mealPlanId) {
            return res.status(400).json({
                success: false,
                message: 'Missing required information. Please ensure billing record or membership exists.'
            });
        }
        // Save receipt file if provided
        let receiptUrl = null;
        if (file) {
            receiptUrl = `/uploads/receipts/${file.filename}`;
        }
        // Check for existing payment verification requests for this membership
        // Priority: 1. Pending requests (update those), 2. Rejected requests (update those), 3. Create new
        const existingPendingRequest = await PaymentVerification_1.default.findOne({
            membershipId: membershipId,
            userId: userId, // Ensure it's the same user
            status: 'pending'
        }).sort({ updatedAt: -1 }); // Get the most recent pending request
        const existingRejectedRequest = await PaymentVerification_1.default.findOne({
            membershipId: membershipId,
            userId: userId, // Ensure it's the same user
            status: 'rejected'
        }).sort({ updatedAt: -1 }); // Get the most recent rejected request
        // Prefer updating pending request over rejected, but update rejected if no pending exists
        const existingRequest = existingPendingRequest || existingRejectedRequest;
        let paymentVerification;
        let isUpdate = false;
        if (existingRequest) {
            // Update existing request instead of creating a new one
            isUpdate = true;
            // Delete old receipt file if it exists and a new one is being uploaded
            if (existingRequest.paymentScreenshot && file) {
                try {
                    const oldFilePath = path_1.default.join(__dirname, '../../uploads', existingRequest.paymentScreenshot.replace('/uploads/', ''));
                    if (fs_1.default.existsSync(oldFilePath)) {
                        fs_1.default.unlinkSync(oldFilePath);
                        console.log(`🗑️ Deleted old receipt file: ${oldFilePath}`);
                    }
                }
                catch (unlinkError) {
                    console.warn('Error deleting old receipt file:', unlinkError);
                    // Continue even if deletion fails
                }
            }
            // Update the existing request
            existingRequest.amount = amount;
            existingRequest.paymentMethod = paymentMethod;
            // Update payment screenshot only if new one is provided, otherwise keep existing
            if (receiptUrl) {
                existingRequest.paymentScreenshot = receiptUrl;
            }
            // Update transaction ID only if new one is provided, otherwise keep existing
            if (transactionId) {
                existingRequest.transactionId = transactionId;
            }
            existingRequest.status = 'pending'; // Ensure status is pending
            // Clear rejection-related fields only if this was a rejected request
            if (existingRejectedRequest && !existingPendingRequest) {
                // Clear rejection-related fields - Mongoose schema allows null, so we use null with type assertion
                existingRequest.rejectionReason = null;
                existingRequest.verifiedBy = null;
                existingRequest.verifiedAt = null;
            }
            // Explicitly update the timestamp to ensure it reflects the resubmission time
            existingRequest.updatedAt = new Date();
            await existingRequest.save();
            paymentVerification = existingRequest;
        }
        else {
            // Create new payment verification record
            paymentVerification = new PaymentVerification_1.default({
                userId: userId,
                messId: messId,
                membershipId: membershipId,
                mealPlanId: mealPlanId,
                amount: amount,
                paymentMethod: paymentMethod,
                paymentScreenshot: receiptUrl,
                transactionId: transactionId || null, // Store transaction ID (required for UPI)
                status: 'pending'
            });
            await paymentVerification.save();
        }
        // Update membership payment request status
        const membership = await MessMembership_1.default.findById(membershipId);
        if (membership) {
            membership.paymentRequestStatus = 'sent';
            await membership.save();
        }
        const actionMessage = isUpdate
            ? `🔄 Updated existing rejected payment request: ${paymentVerification._id}, Transaction ID: ${transactionId || 'N/A'}`
            : `✅ Created new payment request: ${paymentVerification._id}, Transaction ID: ${transactionId || 'N/A'}`;
        console.log(actionMessage);
        return res.status(isUpdate ? 200 : 201).json({
            success: true,
            message: isUpdate
                ? 'Payment request updated successfully (previous rejected request was updated)'
                : 'Payment request submitted successfully',
            data: {
                id: paymentVerification._id,
                userId: paymentVerification.userId,
                billId: billId,
                membershipId: membershipId,
                paymentMethod: paymentMethod,
                transactionId: transactionId || paymentVerification.transactionId || null,
                receiptUrl: receiptUrl || paymentVerification.paymentScreenshot || null,
                status: paymentVerification.status,
                submittedAt: paymentVerification.createdAt,
                updatedAt: paymentVerification.updatedAt,
                isUpdate: isUpdate
            }
        });
    }
    catch (error) {
        console.error('Submit payment request error:', error);
        // Delete uploaded file if there was an error
        if (req.file) {
            try {
                fs_1.default.unlinkSync(req.file.path);
            }
            catch (unlinkError) {
                console.error('Error deleting uploaded file:', unlinkError);
            }
        }
        return (0, errorHandler_1.handleAuthError)(res, error);
    }
});
// POST /api/billing/pay-bill - Pay bill (user side)
router.post('/pay-bill', requireAuth_1.default, async (req, res, _next) => {
    const userId = req.user.id;
    const { billId, paymentMethod } = req.body;
    try {
        // Find the bill
        const bill = await Billing_1.default.findById(billId).populate('messId', 'name');
        if (!bill) {
            return res.status(404).json({
                success: false,
                message: 'Bill not found'
            });
        }
        // Check if bill belongs to user
        if (bill.userId.toString() !== userId) {
            return res.status(403).json({
                success: false,
                message: 'Access denied. This bill does not belong to you.'
            });
        }
        // Check if bill is already paid
        if (bill.payment.status === 'paid') {
            return res.status(400).json({
                success: false,
                message: 'This bill has already been paid'
            });
        }
        // In a real implementation, process the payment through gateway
        const paymentResult = {
            success: Math.random() > 0.1, // 90% success rate simulation
            transactionId: `TXN_${Date.now()}`,
            amount: bill.subscription.totalAmount,
            method: paymentMethod
        };
        if (paymentResult.success) {
            // Update bill status
            bill.payment.status = 'paid';
            bill.payment.paidDate = new Date();
            bill.payment.method = paymentMethod;
            await bill.save();
            // Create transaction record
            const transaction = new Transaction_1.default({
                userId: userId,
                messId: bill.messId,
                membershipId: bill.membershipId,
                billingId: bill._id,
                type: 'payment',
                amount: bill.subscription.totalAmount,
                currency: 'INR',
                status: 'success', // Use 'success' to match Transaction model enum ('pending', 'success', 'failed', 'cancelled', 'refunded')
                paymentMethod: paymentMethod,
                transactionId: paymentResult.transactionId,
                description: `Payment for ${bill.subscription.planName}`,
                gateway: {
                    name: paymentMethod === 'upi' ? 'UPI' : paymentMethod === 'online' ? 'Online' : 'Cash',
                    transactionId: paymentResult.transactionId
                }
            });
            await transaction.save();
            return res.status(200).json({
                success: true,
                message: 'Payment processed successfully',
                data: paymentResult
            });
        }
        else {
            return res.status(400).json({
                success: false,
                message: 'Payment processing failed. Please try again.'
            });
        }
    }
    catch (error) {
        console.error('Pay bill error:', error);
        return (0, errorHandler_1.handleAuthError)(res, error);
    }
});
exports.default = router;
//# sourceMappingURL=billing.js.map