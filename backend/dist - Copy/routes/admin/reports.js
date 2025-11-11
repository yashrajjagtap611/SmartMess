"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const requireAuth_1 = __importDefault(require("../../middleware/requireAuth"));
const errorHandler_1 = require("../../middleware/errorHandler");
const User_1 = __importDefault(require("../../models/User"));
const MessProfile_1 = __importDefault(require("../../models/MessProfile"));
const MessMembership_1 = __importDefault(require("../../models/MessMembership"));
const PaymentSettings_1 = __importDefault(require("../../models/PaymentSettings"));
const router = (0, express_1.Router)();
// Middleware to check if user is admin
const requireAdmin = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const user = await User_1.default.findById(userId);
        if (!user || user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Admin privileges required.'
            });
        }
        return next();
    }
    catch (err) {
        return (0, errorHandler_1.handleAuthError)(res, err);
    }
};
// GET /api/admin/reports/users - Generate user report
router.get('/users', requireAuth_1.default, requireAdmin, async (req, res, next) => {
    try {
        const { status, role, verified, startDate, endDate, page = 1, limit = 50 } = req.query;
        // Build filter object
        const filter = {};
        if (status)
            filter.status = status;
        if (role)
            filter.role = role;
        if (verified !== undefined)
            filter.isVerified = verified === 'true';
        if (startDate || endDate) {
            filter.createdAt = {};
            if (startDate)
                filter.createdAt.$gte = new Date(startDate);
            if (endDate)
                filter.createdAt.$lte = new Date(endDate);
        }
        // Calculate pagination
        const skip = (Number(page) - 1) * Number(limit);
        // Get users with pagination
        const users = await User_1.default.find(filter)
            .select('-password -otp -otpExpiry')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(Number(limit));
        // Get total count for pagination
        const totalUsers = await User_1.default.countDocuments(filter);
        const totalPages = Math.ceil(totalUsers / Number(limit));
        // Get summary statistics
        const summary = {
            total: totalUsers,
            verified: await User_1.default.countDocuments({ ...filter, isVerified: true }),
            unverified: await User_1.default.countDocuments({ ...filter, isVerified: false }),
            admins: await User_1.default.countDocuments({ ...filter, role: 'admin' }),
            regular: await User_1.default.countDocuments({ ...filter, role: 'user' }),
            suspended: await User_1.default.countDocuments({ ...filter, isSuspended: true })
        };
        const report = {
            summary,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total: totalUsers,
                totalPages,
                hasNext: Number(page) < totalPages,
                hasPrev: Number(page) > 1
            },
            data: users,
            generatedAt: new Date().toISOString()
        };
        return res.status(200).json({
            success: true,
            data: report
        });
    }
    catch (err) {
        console.error('Error generating user report:', err);
        return (0, errorHandler_1.handleAuthError)(res, err);
    }
});
// GET /api/admin/reports/messes - Generate mess report
router.get('/messes', requireAuth_1.default, requireAdmin, async (req, res, next) => {
    try {
        const { status, location, startDate, endDate, page = 1, limit = 50 } = req.query;
        // Build filter object
        const filter = {};
        if (status !== undefined)
            filter.isActive = status === 'true';
        if (location)
            filter['location.state'] = location;
        if (startDate || endDate) {
            filter.createdAt = {};
            if (startDate)
                filter.createdAt.$gte = new Date(startDate);
            if (endDate)
                filter.createdAt.$lte = new Date(endDate);
        }
        // Calculate pagination
        const skip = (Number(page) - 1) * Number(limit);
        // Get messes with pagination
        const messes = await MessProfile_1.default.find(filter)
            .populate('userId', 'firstName lastName email')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(Number(limit));
        // Get total count for pagination
        const totalMesses = await MessProfile_1.default.countDocuments(filter);
        const totalPages = Math.ceil(totalMesses / Number(limit));
        // Get summary statistics
        const summary = {
            total: totalMesses,
            active: await MessProfile_1.default.countDocuments({ ...filter, isActive: true }),
            inactive: await MessProfile_1.default.countDocuments({ ...filter, isActive: false }),
            withLogo: await MessProfile_1.default.countDocuments({ ...filter, logo: { $exists: true, $ne: null } }),
            withoutLogo: await MessProfile_1.default.countDocuments({ ...filter, $or: [{ logo: null }, { logo: { $exists: false } }] })
        };
        // Get location distribution
        const locationDistribution = await MessProfile_1.default.aggregate([
            { $match: filter },
            {
                $group: {
                    _id: '$location.state',
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } }
        ]);
        const report = {
            summary,
            locationDistribution,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total: totalMesses,
                totalPages,
                hasNext: Number(page) < totalPages,
                hasPrev: Number(page) > 1
            },
            data: messes,
            generatedAt: new Date().toISOString()
        };
        return res.status(200).json({
            success: true,
            data: report
        });
    }
    catch (err) {
        console.error('Error generating mess report:', err);
        return (0, errorHandler_1.handleAuthError)(res, err);
    }
});
// GET /api/admin/reports/memberships - Generate membership report
router.get('/memberships', requireAuth_1.default, requireAdmin, async (req, res, next) => {
    try {
        const { status, paymentStatus, startDate, endDate, page = 1, limit = 50 } = req.query;
        // Build filter object
        const filter = {};
        if (status)
            filter.status = status;
        if (paymentStatus)
            filter.paymentStatus = paymentStatus;
        if (startDate || endDate) {
            filter.createdAt = {};
            if (startDate)
                filter.createdAt.$gte = new Date(startDate);
            if (endDate)
                filter.createdAt.$lte = new Date(endDate);
        }
        // Calculate pagination
        const skip = (Number(page) - 1) * Number(limit);
        // Get memberships with pagination
        const memberships = await MessMembership_1.default.find(filter)
            .populate('userId', 'firstName lastName email')
            .populate('messId', 'name location')
            .populate('mealPlanId', 'name pricing')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(Number(limit));
        // Get total count for pagination
        const totalMemberships = await MessMembership_1.default.countDocuments(filter);
        const totalPages = Math.ceil(totalMemberships / Number(limit));
        // Get summary statistics
        const summary = {
            total: totalMemberships,
            active: await MessMembership_1.default.countDocuments({ ...filter, status: 'active' }),
            pendingMemberships: await MessMembership_1.default.countDocuments({ ...filter, status: 'pending' }),
            inactive: await MessMembership_1.default.countDocuments({ ...filter, status: 'inactive' }),
            paid: await MessMembership_1.default.countDocuments({ ...filter, paymentStatus: 'paid' }),
            pendingPayments: await MessMembership_1.default.countDocuments({ ...filter, paymentStatus: 'pending' }),
            overdue: await MessMembership_1.default.countDocuments({ ...filter, paymentStatus: 'overdue' })
        };
        // Get status distribution
        const statusDistribution = await MessMembership_1.default.aggregate([
            { $match: filter },
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]);
        // Get payment status distribution
        const paymentStatusDistribution = await MessMembership_1.default.aggregate([
            { $match: filter },
            {
                $group: {
                    _id: '$paymentStatus',
                    count: { $sum: 1 }
                }
            }
        ]);
        const report = {
            summary,
            statusDistribution,
            paymentStatusDistribution,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total: totalMemberships,
                totalPages,
                hasNext: Number(page) < totalPages,
                hasPrev: Number(page) > 1
            },
            data: memberships,
            generatedAt: new Date().toISOString()
        };
        return res.status(200).json({
            success: true,
            data: report
        });
    }
    catch (err) {
        console.error('Error generating membership report:', err);
        return (0, errorHandler_1.handleAuthError)(res, err);
    }
});
// GET /api/admin/reports/financial - Generate financial report
router.get('/financial', requireAuth_1.default, requireAdmin, async (req, res, next) => {
    const userId = req.user.id;
    try {
        const { startDate, endDate, messId, userId } = req.query;
        // Build filter object
        const filter = {};
        if (messId)
            filter.messId = messId;
        if (userId)
            filter.userId = userId;
        if (startDate || endDate) {
            filter.createdAt = {};
            if (startDate)
                filter.createdAt.$gte = new Date(startDate);
            if (endDate)
                filter.createdAt.$lte = new Date(endDate);
        }
        // Get payment data
        const payments = await PaymentSettings_1.default.find(filter)
            .populate('userId', 'firstName lastName email')
            .populate('messId', 'name')
            .sort({ createdAt: -1 });
        // Calculate financial summary
        const totalPayments = payments.length;
        const totalAmount = payments.reduce((sum, payment) => sum + (payment.amount || 0), 0);
        const successfulPayments = payments.filter(p => p.status === 'completed').length;
        const failedPayments = payments.filter(p => p.status === 'failed').length;
        const pendingPayments = payments.filter(p => p.status === 'pending').length;
        // Get payment status distribution
        const paymentStatusDistribution = await PaymentSettings_1.default.aggregate([
            { $match: filter },
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 },
                    totalAmount: { $sum: '$amount' }
                }
            }
        ]);
        // Get monthly payment trends
        const monthlyTrends = await PaymentSettings_1.default.aggregate([
            { $match: filter },
            {
                $group: {
                    _id: {
                        $dateToString: {
                            format: '%Y-%m',
                            date: '$createdAt'
                        }
                    },
                    count: { $sum: 1 },
                    totalAmount: { $sum: '$amount' }
                }
            },
            { $sort: { _id: 1 } }
        ]);
        const report = {
            summary: {
                totalPayments,
                totalAmount,
                successfulPayments,
                failedPayments,
                pendingPayments,
                successRate: totalPayments > 0 ? Math.round((successfulPayments / totalPayments) * 100) : 0
            },
            paymentStatusDistribution,
            monthlyTrends,
            data: payments,
            generatedAt: new Date().toISOString()
        };
        return res.status(200).json({
            success: true,
            data: report
        });
    }
    catch (err) {
        console.error('Error generating financial report:', err);
        return (0, errorHandler_1.handleAuthError)(res, err);
    }
});
// GET /api/admin/reports/export/:type - Export report data
router.get('/export/:type', requireAuth_1.default, requireAdmin, async (req, res, next) => {
    try {
        const { type } = req.params;
        const { format = 'json' } = req.query;
        let data;
        let filename;
        switch (type) {
            case 'users':
                data = await User_1.default.find().select('-password -otp -otpExpiry').sort({ createdAt: -1 });
                filename = `users-report-${new Date().toISOString().split('T')[0]}`;
                break;
            case 'messes':
                data = await MessProfile_1.default.find()
                    .populate('userId', 'firstName lastName email')
                    .sort({ createdAt: -1 });
                filename = `messes-report-${new Date().toISOString().split('T')[0]}`;
                break;
            case 'memberships':
                data = await MessMembership_1.default.find()
                    .populate('userId', 'firstName lastName email')
                    .populate('messId', 'name location')
                    .populate('mealPlanId', 'name pricing')
                    .sort({ createdAt: -1 });
                filename = `memberships-report-${new Date().toISOString().split('T')[0]}`;
                break;
            case 'financial':
                data = await PaymentSettings_1.default.find()
                    .populate('userId', 'firstName lastName email')
                    .populate('messId', 'name')
                    .sort({ createdAt: -1 });
                filename = `financial-report-${new Date().toISOString().split('T')[0]}`;
                break;
            default:
                return res.status(400).json({
                    success: false,
                    message: 'Invalid report type. Supported types: users, messes, memberships, financial'
                });
        }
        if (format === 'csv') {
            // Convert to CSV format
            const csvData = convertToCSV(data);
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', `attachment; filename="${filename}.csv"`);
            return res.send(csvData);
        }
        else {
            // Return JSON format
            return res.status(200).json({
                success: true,
                data: {
                    type,
                    filename: `${filename}.json`,
                    recordCount: data.length,
                    generatedAt: new Date().toISOString(),
                    data
                }
            });
        }
    }
    catch (err) {
        console.error('Error exporting report:', err);
        return (0, errorHandler_1.handleAuthError)(res, err);
    }
});
// Helper function to convert data to CSV format
function convertToCSV(data) {
    if (data.length === 0)
        return '';
    // Get headers from first object
    const headers = Object.keys(data[0]);
    // Convert nested objects to string representation
    const csvRows = data.map(row => {
        return headers.map(header => {
            const value = row[header];
            if (value === null || value === undefined)
                return '';
            if (typeof value === 'object')
                return JSON.stringify(value);
            return String(value);
        }).join(',');
    });
    return [headers.join(','), ...csvRows].join('\n');
}
exports.default = router;
//# sourceMappingURL=reports.js.map