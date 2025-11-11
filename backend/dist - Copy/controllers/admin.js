"use strict";
// Admin Controllers
// This file contains controller functions for admin-related routes
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminController = void 0;
const admin_1 = __importDefault(require("../services/admin"));
const errorHandler_1 = require("../middleware/errorHandler");
class AdminController {
    // Dashboard Controllers
    static async getDashboard(req, res, next) {
        try {
            const dashboardData = await admin_1.default.getDashboardData();
            return res.status(200).json({
                success: true,
                data: dashboardData
            });
        }
        catch (err) {
            console.error('Error fetching dashboard data:', err);
            return (0, errorHandler_1.handleAuthError)(res, err);
        }
    }
    // Analytics Controllers
    static async getUserAnalytics(req, res, next) {
        try {
            const { period = '30d' } = req.query;
            const userAnalytics = await admin_1.default.getUserAnalytics(period);
            return res.status(200).json({
                success: true,
                data: userAnalytics
            });
        }
        catch (err) {
            console.error('Error fetching user analytics:', err);
            return (0, errorHandler_1.handleAuthError)(res, err);
        }
    }
    static async getMessAnalytics(req, res, next) {
        try {
            const { period = '30d' } = req.query;
            const messAnalytics = await admin_1.default.getMessAnalytics(period);
            return res.status(200).json({
                success: true,
                data: messAnalytics
            });
        }
        catch (err) {
            console.error('Error fetching mess analytics:', err);
            return (0, errorHandler_1.handleAuthError)(res, err);
        }
    }
    static async getMembershipAnalytics(req, res, next) {
        try {
            const { period = '30d' } = req.query;
            const membershipAnalytics = await admin_1.default.getMembershipAnalytics(period);
            return res.status(200).json({
                success: true,
                data: membershipAnalytics
            });
        }
        catch (err) {
            console.error('Error fetching membership analytics:', err);
            return (0, errorHandler_1.handleAuthError)(res, err);
        }
    }
    static async getTrendAnalytics(req, res, next) {
        try {
            const { metric = 'users', period = '30d' } = req.query;
            let trendData;
            switch (metric) {
                case 'users':
                    trendData = await admin_1.default.getUserAnalytics(period);
                    break;
                case 'messes':
                    trendData = await admin_1.default.getMessAnalytics(period);
                    break;
                case 'memberships':
                    trendData = await admin_1.default.getMembershipAnalytics(period);
                    break;
                default:
                    trendData = await admin_1.default.getUserAnalytics(period);
            }
            const trends = {
                metric,
                period,
                startDate: trendData.startDate,
                endDate: trendData.endDate,
                data: trendData.registrations || trendData.creations || [],
                total: trendData.newUsersInPeriod || trendData.newMessesInPeriod || trendData.newMembershipsInPeriod || 0
            };
            return res.status(200).json({
                success: true,
                data: trends
            });
        }
        catch (err) {
            console.error('Error fetching trend analytics:', err);
            return (0, errorHandler_1.handleAuthError)(res, err);
        }
    }
    // User Management Controllers
    static async getUsers(req, res, next) {
        try {
            const { page = 1, limit = 20, search, role, status, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
            const filters = { search, role, status, sortBy, sortOrder };
            const result = await admin_1.default.getUsersWithFilters(filters, Number(page), Number(limit));
            return res.status(200).json({
                success: true,
                data: result
            });
        }
        catch (err) {
            console.error('Error fetching users:', err);
            return (0, errorHandler_1.handleAuthError)(res, err);
        }
    }
    static async getUserDetails(req, res, next) {
        try {
            const userId = req.params['userId'];
            // This would typically use a service method
            // For now, we'll handle it directly in the route
            return res.status(200).json({
                success: true,
                message: 'User details endpoint - implement with service method'
            });
        }
        catch (err) {
            console.error('Error fetching user details:', err);
            return (0, errorHandler_1.handleAuthError)(res, err);
        }
    }
    static async updateUser(req, res, next) {
        try {
            const userId = req.params['userId'];
            const updateData = req.body;
            // This would typically use a service method
            // For now, we'll handle it directly in the route
            return res.status(200).json({
                success: true,
                message: 'User update endpoint - implement with service method'
            });
        }
        catch (err) {
            console.error('Error updating user:', err);
            return (0, errorHandler_1.handleAuthError)(res, err);
        }
    }
    static async deleteUser(req, res, next) {
        try {
            const userId = req.params['userId'];
            // This would typically use a service method
            // For now, we'll handle it directly in the route
            return res.status(200).json({
                success: true,
                message: 'User deletion endpoint - implement with service method'
            });
        }
        catch (err) {
            console.error('Error deleting user:', err);
            return (0, errorHandler_1.handleAuthError)(res, err);
        }
    }
    // Mess Management Controllers
    static async getMesses(req, res, next) {
        try {
            const { page = 1, limit = 20, search, status, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
            const filters = { search, status, sortBy, sortOrder };
            const result = await admin_1.default.getMessesWithFilters(filters, Number(page), Number(limit));
            return res.status(200).json({
                success: true,
                data: result
            });
        }
        catch (err) {
            console.error('Error fetching messes:', err);
            return (0, errorHandler_1.handleAuthError)(res, err);
        }
    }
    static async getMessDetails(req, res, next) {
        try {
            const { messId } = req.params;
            // This would typically use a service method
            // For now, we'll handle it directly in the route
            return res.status(200).json({
                success: true,
                message: 'Mess details endpoint - implement with service method'
            });
        }
        catch (err) {
            console.error('Error fetching mess details:', err);
            return (0, errorHandler_1.handleAuthError)(res, err);
        }
    }
    static async updateMess(req, res, next) {
        try {
            const { messId } = req.params;
            const updateData = req.body;
            // This would typically use a service method
            // For now, we'll handle it directly in the route
            return res.status(200).json({
                success: true,
                message: 'Mess update endpoint - implement with service method'
            });
        }
        catch (err) {
            console.error('Error updating mess:', err);
            return (0, errorHandler_1.handleAuthError)(res, err);
        }
    }
    static async deleteMess(req, res, next) {
        try {
            const { messId } = req.params;
            // This would typically use a service method
            // For now, we'll handle it directly in the route
            return res.status(200).json({
                success: true,
                message: 'Mess deletion endpoint - implement with service method'
            });
        }
        catch (err) {
            console.error('Error deleting mess:', err);
            return (0, errorHandler_1.handleAuthError)(res, err);
        }
    }
    // System Controllers
    static async getSystemHealth(req, res, next) {
        try {
            const healthStatus = await admin_1.default.getSystemHealth();
            return res.status(200).json({
                success: true,
                data: healthStatus
            });
        }
        catch (err) {
            console.error('Error fetching system health:', err);
            return (0, errorHandler_1.handleAuthError)(res, err);
        }
    }
    static async getSystemStats(req, res, next) {
        try {
            // This would typically use a service method
            // For now, we'll handle it directly in the route
            return res.status(200).json({
                success: true,
                message: 'System stats endpoint - implement with service method'
            });
        }
        catch (err) {
            console.error('Error fetching system stats:', err);
            return (0, errorHandler_1.handleAuthError)(res, err);
        }
    }
    static async getSystemLogs(req, res, next) {
        try {
            // This would typically use a service method
            // For now, we'll handle it directly in the route
            return res.status(200).json({
                success: true,
                message: 'System logs endpoint - implement with service method'
            });
        }
        catch (err) {
            console.error('Error fetching system logs:', err);
            return (0, errorHandler_1.handleAuthError)(res, err);
        }
    }
    // Backup Controllers
    static async createBackup(req, res, next) {
        try {
            const { type = 'full' } = req.body;
            const adminId = req.user.id;
            const backupInfo = await admin_1.default.createBackup(type, adminId);
            return res.status(200).json({
                success: true,
                message: 'Backup created successfully',
                data: backupInfo
            });
        }
        catch (err) {
            console.error('Error creating backup:', err);
            return (0, errorHandler_1.handleAuthError)(res, err);
        }
    }
    static async getBackupStatus(req, res, next) {
        try {
            // This would typically use a service method
            // For now, we'll handle it directly in the route
            return res.status(200).json({
                success: true,
                message: 'Backup status endpoint - implement with service method'
            });
        }
        catch (err) {
            console.error('Error fetching backup status:', err);
            return (0, errorHandler_1.handleAuthError)(res, err);
        }
    }
    // Email Testing Controllers
    static async testEmail(req, res, next) {
        try {
            const { email } = req.body;
            const testResult = await admin_1.default.testEmailConfiguration(email);
            return res.status(200).json({
                success: true,
                message: 'Test email sent successfully',
                data: testResult
            });
        }
        catch (err) {
            console.error('Error sending test email:', err);
            return (0, errorHandler_1.handleAuthError)(res, err);
        }
    }
    // Maintenance Controllers
    static async toggleMaintenance(req, res, next) {
        try {
            const { enabled, reason, estimatedDuration } = req.body;
            // This would typically use a service method
            // For now, we'll handle it directly in the route
            res.status(200).json({
                success: true,
                message: `Maintenance mode ${enabled ? 'enabled' : 'disabled'} successfully`,
                data: {
                    enabled,
                    reason: reason || 'No reason provided',
                    estimatedDuration: estimatedDuration || 'Unknown',
                    startTime: enabled ? new Date().toISOString() : null,
                    endTime: null
                }
            });
        }
        catch (err) {
            console.error('Error updating maintenance mode:', err);
            return (0, errorHandler_1.handleAuthError)(res, err);
        }
    }
    static async getMaintenanceStatus(req, res, next) {
        try {
            // This would typically use a service method
            // For now, we'll handle it directly in the route
            return res.status(200).json({
                success: true,
                data: {
                    enabled: false,
                    reason: null,
                    estimatedDuration: null,
                    startTime: null,
                    endTime: null
                }
            });
        }
        catch (err) {
            console.error('Error fetching maintenance status:', err);
            return (0, errorHandler_1.handleAuthError)(res, err);
        }
    }
}
exports.AdminController = AdminController;
exports.default = AdminController;
//# sourceMappingURL=admin.js.map