"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const requireAuth_1 = __importDefault(require("../middleware/requireAuth"));
const errorHandler_1 = require("../middleware/errorHandler");
const paymentService_1 = __importDefault(require("../services/paymentService"));
const MessMembership_1 = __importDefault(require("../models/MessMembership"));
const Notification_1 = __importDefault(require("../models/Notification"));
const payment_1 = require("../validators/payment");
const MessProfile_1 = __importDefault(require("../models/MessProfile"));
const router = (0, express_1.Router)();
// POST /api/payments/process - Process a payment
router.post('/process', requireAuth_1.default, async (req, res, _next) => {
    const userId = req.user.id;
    try {
        const { messId, amount, method, plan, notes } = req.body;
        // Validate payment data
        const validation = (0, payment_1.validatePaymentData)({ messId, amount, method, plan, notes });
        if (!validation.isValid) {
            return res.status(400).json({
                success: false,
                message: 'Invalid payment data',
                errors: validation.errors
            });
        }
        // Process payment
        const result = await paymentService_1.default.processPayment({
            userId,
            messId,
            amount,
            method,
            plan,
            notes
        });
        if (result.success) {
            return res.status(200).json({
                success: true,
                message: result.message,
                data: result.data
            });
        }
        else {
            return res.status(400).json({
                success: false,
                message: result.message,
                error: result.error
            });
        }
    }
    catch (err) {
        console.error('Payment processing error:', err);
        return (0, errorHandler_1.handleAuthError)(res, err);
    }
});
// PUT /api/payments/:membershipId/status - Update payment status
router.put('/:membershipId/status', requireAuth_1.default, async (req, res, _next) => {
    const userId = req.user.id;
    try {
        const { membershipId } = req.params;
        const { status, notes } = req.body;
        // Validate status
        if (!['paid', 'pending', 'overdue', 'failed', 'refunded'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid payment status'
            });
        }
        // Check if user has permission to update this membership
        const membership = await MessMembership_1.default.findById(membershipId);
        if (!membership) {
            return res.status(404).json({
                success: false,
                message: 'Membership not found'
            });
        }
        // Only mess owners or admins can update payment status
        const userRole = req.user.role;
        if (userRole !== 'mess-owner' && userRole !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Only mess owners and admins can update payment status.'
            });
        }
        // Update payment status
        if (!membershipId) {
            return res.status(400).json({
                success: false,
                message: 'Membership ID is required'
            });
        }
        const success = await paymentService_1.default.updatePaymentStatus(membershipId, status, notes);
        if (success) {
            return res.status(200).json({
                success: true,
                message: `Payment status updated to ${status}`
            });
        }
        else {
            return res.status(500).json({
                success: false,
                message: 'Failed to update payment status'
            });
        }
    }
    catch (err) {
        console.error('Payment status update error:', err);
        return (0, errorHandler_1.handleAuthError)(res, err);
    }
});
// GET /api/payments/history - Get payment history for user
router.get('/history', requireAuth_1.default, async (req, res, _next) => {
    const userId = req.user.id;
    try {
        const { messId } = req.query;
        const history = await paymentService_1.default.getPaymentHistory(userId, messId);
        return res.status(200).json({
            success: true,
            data: history
        });
    }
    catch (err) {
        console.error('Payment history error:', err);
        return (0, errorHandler_1.handleAuthError)(res, err);
    }
});
// GET /api/payments/membership/:membershipId - Get payment details for a membership
router.get('/membership/:membershipId', requireAuth_1.default, async (req, res, _next) => {
    const userId = req.user.id;
    try {
        const { membershipId } = req.params;
        const membership = await MessMembership_1.default.findById(membershipId)
            .populate('messId', 'name')
            .populate('mealPlanId', 'name price description');
        if (!membership) {
            return res.status(404).json({
                success: false,
                message: 'Membership not found'
            });
        }
        // Check if user has access to this membership
        if (membership.userId.toString() !== userId && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }
        // Type assertion for populated fields
        const populatedMembership = membership;
        return res.status(200).json({
            success: true,
            data: {
                membershipId: membership._id,
                messName: populatedMembership.messId?.name || 'Unknown Mess',
                planName: populatedMembership.mealPlanId?.name || 'Unknown Plan',
                planPrice: populatedMembership.mealPlanId?.price || 0,
                planDescription: populatedMembership.mealPlanId?.description || '',
                status: membership.status,
                paymentStatus: membership.paymentStatus,
                paymentType: membership.paymentType,
                paymentAmount: membership.paymentAmount,
                lastPaymentDate: membership.lastPaymentDate,
                nextPaymentDate: membership.nextPaymentDate,
                paymentDueDate: membership.paymentDueDate,
                lateFees: membership.lateFees,
                reminderSentCount: membership.reminderSentCount,
                lastReminderSent: membership.lastReminderSent,
                autoRenewal: membership.autoRenewal,
                paymentHistory: membership.paymentHistory,
                subscriptionStartDate: membership.subscriptionStartDate,
                subscriptionEndDate: membership.subscriptionEndDate
            }
        });
    }
    catch (err) {
        console.error('Membership payment details error:', err);
        return (0, errorHandler_1.handleAuthError)(res, err);
    }
});
// POST /api/payments/remind - Send payment reminder (mess owners only)
router.post('/remind', requireAuth_1.default, async (req, res, _next) => {
    const userId = req.user.id;
    try {
        const { membershipId } = req.body;
        // Check if user is a mess owner
        const userRole = req.user.role;
        if (userRole !== 'mess-owner' && userRole !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Only mess owners and admins can send reminders.'
            });
        }
        if (!membershipId) {
            return res.status(400).json({
                success: false,
                message: 'Membership ID is required'
            });
        }
        const membership = await MessMembership_1.default.findById(membershipId);
        if (!membership) {
            return res.status(404).json({
                success: false,
                message: 'Membership not found'
            });
        }
        // Update reminder count manually since the method doesn't exist
        membership.reminderSentCount = (membership.reminderSentCount || 0) + 1;
        membership.lastReminderSent = new Date();
        await membership.save();
        // Create reminder notification
        const notification = new Notification_1.default({
            userId: membership.userId,
            messId: membership.messId,
            type: 'payment_reminder',
            title: 'Payment Reminder',
            message: `Your payment of ₹${membership.paymentAmount} is due. Please complete the payment to avoid late fees.`,
            status: 'completed',
            data: {
                amount: membership.paymentAmount,
                dueDate: membership.paymentDueDate,
                overdue: membership.paymentStatus === 'overdue',
                lateFees: membership.lateFees || 0
            },
            isRead: false
        });
        await notification.save();
        return res.status(200).json({
            success: true,
            message: 'Payment reminder sent successfully'
        });
    }
    catch (err) {
        console.error('Payment reminder error:', err);
        return (0, errorHandler_1.handleAuthError)(res, err);
    }
});
// GET /api/payments/overdue - Get overdue payments (mess owners only)
router.get('/overdue', requireAuth_1.default, async (req, res, _next) => {
    const userId = req.user.id;
    try {
        const userRole = req.user.role;
        // Check if user is a mess owner
        if (userRole !== 'mess-owner' && userRole !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Only mess owners and admins can view overdue payments.'
            });
        }
        let query = { paymentStatus: 'overdue', status: 'active' };
        // If mess owner, only show overdue payments for their mess
        if (userRole === 'mess-owner') {
            const messProfile = await MessProfile_1.default.findOne({ userId });
            if (messProfile) {
                query.messId = messProfile._id;
            }
        }
        const overdueMemberships = await MessMembership_1.default.find(query)
            .populate('userId', 'name email phone')
            .populate('messId', 'name')
            .populate('mealPlanId', 'name price');
        const overduePayments = overdueMemberships.map(membership => {
            // Type assertion for populated fields
            const populatedMembership = membership;
            return {
                membershipId: membership._id,
                userId: membership.userId._id,
                userName: populatedMembership.userId?.name || 'Unknown User',
                userEmail: populatedMembership.userId?.email || '',
                userPhone: populatedMembership.userId?.phone || '',
                messName: populatedMembership.messId?.name || 'Unknown Mess',
                planName: populatedMembership.mealPlanId?.name || 'Unknown Plan',
                planPrice: populatedMembership.mealPlanId?.price || 0,
                paymentAmount: membership.paymentAmount,
                paymentDueDate: membership.paymentDueDate,
                lateFees: membership.lateFees,
                daysOverdue: membership.paymentDueDate ?
                    Math.floor((new Date().getTime() - membership.paymentDueDate.getTime()) / (24 * 60 * 60 * 1000)) : 0,
                reminderSentCount: membership.reminderSentCount,
                lastReminderSent: membership.lastReminderSent
            };
        });
        return res.status(200).json({
            success: true,
            data: overduePayments
        });
    }
    catch (err) {
        console.error('Overdue payments error:', err);
        return (0, errorHandler_1.handleAuthError)(res, err);
    }
});
// POST /api/payments/bulk-remind - Send reminders to multiple overdue users (mess owners only)
router.post('/bulk-remind', requireAuth_1.default, async (req, res, _next) => {
    const userId = req.user.id;
    try {
        const userRole = req.user.role;
        // Check if user is a mess owner
        if (userRole !== 'mess-owner' && userRole !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Only mess owners and admins can send bulk reminders.'
            });
        }
        let query = { paymentStatus: 'overdue', status: 'active' };
        // If mess owner, only process overdue payments for their mess
        if (userRole === 'mess-owner') {
            const messProfile = await MessProfile_1.default.findOne({ userId });
            if (messProfile) {
                query.messId = messProfile._id;
            }
        }
        const overdueMemberships = await MessMembership_1.default.find(query);
        let reminderCount = 0;
        for (const membership of overdueMemberships) {
            try {
                // Update reminder count manually
                membership.reminderSentCount = (membership.reminderSentCount || 0) + 1;
                membership.lastReminderSent = new Date();
                await membership.save();
                // Create reminder notification
                const notification = new Notification_1.default({
                    userId: membership.userId,
                    messId: membership.messId,
                    type: 'payment_reminder',
                    title: 'Payment Overdue - Urgent Reminder',
                    message: `Your payment of ₹${membership.paymentAmount} is overdue. Late fees: ₹${membership.lateFees || 0}. Please make the payment immediately to avoid service suspension.`,
                    status: 'completed',
                    data: {
                        amount: membership.paymentAmount,
                        dueDate: membership.paymentDueDate,
                        overdue: true,
                        lateFees: membership.lateFees || 0
                    },
                    isRead: false
                });
                await notification.save();
                reminderCount++;
            }
            catch (error) {
                console.error(`Error sending reminder for membership ${membership._id}:`, error);
            }
        }
        return res.status(200).json({
            success: true,
            message: `Payment reminders sent to ${reminderCount} users`,
            data: { reminderCount }
        });
    }
    catch (err) {
        console.error('Bulk reminder error:', err);
        return (0, errorHandler_1.handleAuthError)(res, err);
    }
});
exports.default = router;
//# sourceMappingURL=payments.js.map