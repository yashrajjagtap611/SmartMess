"use strict";
// Admin Routes Barrel File
// This file exports all admin-related routes in an organized manner
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const userManagement_1 = __importDefault(require("./userManagement"));
const analytics_1 = __importDefault(require("./analytics"));
const reports_1 = __importDefault(require("./reports"));
const settings_1 = __importDefault(require("./settings"));
const system_1 = __importDefault(require("./system"));
const defaultMealPlans_1 = __importDefault(require("./defaultMealPlans"));
const tutorialVideos_1 = __importDefault(require("./tutorialVideos"));
const ads_1 = __importDefault(require("./ads"));
const requireAuth_1 = __importDefault(require("../../middleware/requireAuth"));
const errorHandler_1 = require("../../middleware/errorHandler");
const User_1 = __importDefault(require("../../models/User"));
const MessProfile_1 = __importDefault(require("../../models/MessProfile"));
const MessMembership_1 = __importDefault(require("../../models/MessMembership"));
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
        next();
    }
    catch (err) {
        return (0, errorHandler_1.handleAuthError)(res, err);
    }
};
// GET /api/admin/dashboard/stats - Get dashboard stats (direct route)
router.get('/dashboard/stats', requireAuth_1.default, requireAdmin, async (_req, res, next) => {
    try {
        // Get user statistics
        const totalUsers = await User_1.default.countDocuments();
        const verifiedUsers = await User_1.default.countDocuments({ isVerified: true });
        const unverifiedUsers = await User_1.default.countDocuments({ isVerified: false });
        const adminUsers = await User_1.default.countDocuments({ role: 'admin' });
        const suspendedUsers = await User_1.default.countDocuments({ isSuspended: true });
        // Get mess statistics
        const totalMesses = await MessProfile_1.default.countDocuments();
        const activeMesses = await MessProfile_1.default.countDocuments({ isActive: true });
        const inactiveMesses = await MessProfile_1.default.countDocuments({ isActive: false });
        // Get membership statistics
        const totalMemberships = await MessMembership_1.default.countDocuments();
        const activeMemberships = await MessMembership_1.default.countDocuments({ status: 'active' });
        const pendingMemberships = await MessMembership_1.default.countDocuments({ status: 'pending' });
        const inactiveMemberships = await MessMembership_1.default.countDocuments({ status: 'inactive' });
        // Get recent activity (last 7 days)
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const newUsersLastWeek = await User_1.default.countDocuments({ createdAt: { $gte: sevenDaysAgo } });
        const newMessesLastWeek = await MessProfile_1.default.countDocuments({ createdAt: { $gte: sevenDaysAgo } });
        const dashboardData = {
            overview: {
                totalUsers,
                totalMesses,
                totalMemberships,
                activeMemberships
            },
            userStats: {
                verified: verifiedUsers,
                unverified: unverifiedUsers,
                admins: adminUsers,
                suspended: suspendedUsers,
                verificationRate: totalUsers > 0 ? Math.round((verifiedUsers / totalUsers) * 100) : 0
            },
            messStats: {
                active: activeMesses,
                inactive: inactiveMesses,
                activeRate: totalMesses > 0 ? Math.round((activeMesses / totalMesses) * 100) : 0
            },
            membershipStats: {
                active: activeMemberships,
                pending: pendingMemberships,
                inactive: inactiveMemberships,
                activeRate: totalMemberships > 0 ? Math.round((activeMemberships / totalMemberships) * 100) : 0
            },
            recentActivity: {
                newUsersLastWeek,
                newMessesLastWeek
            },
            timestamp: new Date().toISOString()
        };
        return res.status(200).json({
            success: true,
            data: dashboardData
        });
    }
    catch (err) {
        console.error('Error fetching dashboard stats:', err);
        return (0, errorHandler_1.handleAuthError)(res, err);
    }
});
// GET /api/admin/recent-activity - Get recent activity
router.get('/recent-activity', requireAuth_1.default, requireAdmin, async (_req, res, next) => {
    try {
        // Get recent user registrations
        const recentUsers = await User_1.default.find()
            .sort({ createdAt: -1 })
            .limit(10)
            .select('firstName lastName email role createdAt');
        // Get recent mess creations
        const recentMesses = await MessProfile_1.default.find()
            .sort({ createdAt: -1 })
            .limit(10)
            .select('name location createdAt');
        // Get recent memberships
        const recentMemberships = await MessMembership_1.default.find()
            .sort({ createdAt: -1 })
            .limit(10)
            .populate('userId', 'firstName lastName email')
            .populate('messId', 'name location');
        const recentActivity = {
            users: recentUsers.map(user => ({
                id: user._id,
                type: 'user_registration',
                title: `New ${user.role} registered`,
                description: `${user.firstName} ${user.lastName} (${user.email})`,
                timestamp: user.createdAt,
                status: 'success'
            })),
            messes: recentMesses.map(mess => ({
                id: mess._id,
                type: 'mess_creation',
                title: `New mess created`,
                description: `${mess.name} in ${mess.location}`,
                timestamp: mess.createdAt,
                status: 'success'
            })),
            memberships: recentMemberships.map(membership => {
                const user = membership.userId;
                const mess = membership.messId;
                return {
                    id: membership._id,
                    type: 'subscription',
                    title: `New membership`,
                    description: `${user?.firstName || 'Unknown'} ${user?.lastName || 'User'} joined ${mess?.name || 'Unknown Mess'}`,
                    timestamp: membership.createdAt,
                    status: membership.status === 'active' ? 'success' : 'warning'
                };
            })
        };
        // Combine and sort all activities by timestamp
        const allActivities = [
            ...recentActivity.users,
            ...recentActivity.messes,
            ...recentActivity.memberships
        ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
            .slice(0, 20); // Get top 20 most recent activities
        return res.status(200).json({
            success: true,
            data: allActivities
        });
    }
    catch (err) {
        console.error('Error fetching recent activity:', err);
        return (0, errorHandler_1.handleAuthError)(res, err);
    }
});
// Mount sub-routes
router.use('/users', userManagement_1.default);
router.use('/analytics', analytics_1.default);
router.use('/reports', reports_1.default);
router.use('/settings', settings_1.default);
router.use('/system', system_1.default);
router.use('/default-meal-plans', defaultMealPlans_1.default);
router.use('/tutorial-videos', tutorialVideos_1.default);
router.use('/ads', ads_1.default);
exports.default = router;
//# sourceMappingURL=index.js.map