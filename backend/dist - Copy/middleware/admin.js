"use strict";
// Admin Middleware
// This file contains middleware functions for admin-related routes
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addAdminContext = exports.validateAdminInput = exports.adminRateLimiter = exports.checkMaintenanceMode = exports.logAdminAction = exports.preventSelfRoleChange = exports.preventSelfDeletion = exports.preventSelfModification = exports.requireAdminPermission = exports.requireSuperAdmin = exports.requireAdmin = void 0;
const User_1 = __importDefault(require("../models/User"));
const errorHandler_1 = require("./errorHandler");
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
exports.requireAdmin = requireAdmin;
// Middleware to check if user is super admin (same as admin for now)
const requireSuperAdmin = async (req, res, next) => {
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
exports.requireSuperAdmin = requireSuperAdmin;
// Middleware to check if user has specific admin permission
const requireAdminPermission = (_permission) => {
    return async (req, res, next) => {
        try {
            const userId = req.user.id;
            const user = await User_1.default.findById(userId);
            if (!user || user.role !== 'admin') {
                return res.status(403).json({
                    success: false,
                    message: 'Access denied. Admin privileges required.'
                });
            }
            // In a real implementation, you would check specific permissions
            // For now, we'll just allow all admins
            // if (!user.permissions.includes(permission)) {
            //   return res.status(403).json({
            //     success: false,
            //     message: `Access denied. Permission '${permission}' required.`
            //   });
            // }
            next();
        }
        catch (err) {
            return (0, errorHandler_1.handleAuthError)(res, err);
        }
    };
};
exports.requireAdminPermission = requireAdminPermission;
// Middleware to check if user is not trying to modify themselves
const preventSelfModification = (req, res, next) => {
    try {
        const currentUserId = req.user.id;
        const targetUserId = req.params['userId'] || req.body['userId'];
        if (currentUserId === targetUserId) {
            return res.status(400).json({
                success: false,
                message: 'Cannot modify your own account through this endpoint.'
            });
        }
        return next();
    }
    catch (err) {
        return (0, errorHandler_1.handleAuthError)(res, err);
    }
};
exports.preventSelfModification = preventSelfModification;
// Middleware to check if user is not trying to delete themselves
const preventSelfDeletion = (req, res, next) => {
    try {
        const currentUserId = req.user.id;
        const targetUserId = req.params['userId'] || req.body['userId'];
        if (currentUserId === targetUserId) {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete your own account.'
            });
        }
        return next();
    }
    catch (err) {
        return (0, errorHandler_1.handleAuthError)(res, err);
    }
};
exports.preventSelfDeletion = preventSelfDeletion;
// Middleware to check if user is not trying to change their own role
const preventSelfRoleChange = (req, res, next) => {
    try {
        const currentUserId = req.user.id;
        const targetUserId = req.params['userId'] || req.body['userId'];
        if (currentUserId === targetUserId && req.body.role) {
            return res.status(400).json({
                success: false,
                message: 'Cannot change your own role.'
            });
        }
        return next();
    }
    catch (err) {
        return (0, errorHandler_1.handleAuthError)(res, err);
    }
};
exports.preventSelfRoleChange = preventSelfRoleChange;
// Middleware to log admin actions
const logAdminAction = (action) => {
    return async (req, res, next) => {
        try {
            const adminId = req.user.id;
            const targetType = req.params['userId'] ? 'user' : req.params['messId'] ? 'mess' : 'system';
            const targetId = req.params['userId'] || req.params['messId'] || 'system';
            // In a real implementation, you would log this to a database
            console.log(`Admin Action: ${adminId} performed ${action} on ${targetType} ${targetId}`);
            next();
        }
        catch (err) {
            // Don't block the request if logging fails
            console.error('Error logging admin action:', err);
            next();
        }
    };
};
exports.logAdminAction = logAdminAction;
// Middleware to check if system is in maintenance mode
const checkMaintenanceMode = async (req, res, next) => {
    try {
        // In a real implementation, you would check a global maintenance flag
        // For now, we'll allow all requests
        // const maintenanceMode = await getMaintenanceMode();
        // if (maintenanceMode.enabled) {
        //   return res.status(503).json({
        //     success: false,
        //     message: 'System is under maintenance. Please try again later.',
        //     estimatedDuration: maintenanceMode.estimatedDuration
        //   });
        // }
        next();
    }
    catch (err) {
        // Don't block the request if maintenance check fails
        console.error('Error checking maintenance mode:', err);
        next();
    }
};
exports.checkMaintenanceMode = checkMaintenanceMode;
// Middleware to rate limit admin actions
const adminRateLimiter = (maxRequests = 100, windowMs = 15 * 60 * 1000) => {
    const requests = new Map();
    return (req, res, next) => {
        try {
            const adminId = req.user.id;
            const now = Date.now();
            // Clean up expired entries
            for (const [key, value] of requests.entries()) {
                if (now > value.resetTime) {
                    requests.delete(key);
                }
            }
            // Check rate limit
            const userRequests = requests.get(adminId);
            if (!userRequests) {
                requests.set(adminId, { count: 1, resetTime: now + windowMs });
            }
            else if (now > userRequests.resetTime) {
                requests.set(adminId, { count: 1, resetTime: now + windowMs });
            }
            else if (userRequests.count >= maxRequests) {
                return res.status(429).json({
                    success: false,
                    message: 'Too many requests. Please try again later.'
                });
            }
            else {
                userRequests.count++;
            }
            return next();
        }
        catch (err) {
            // Don't block the request if rate limiting fails
            console.error('Error in admin rate limiter:', err);
            return next();
        }
    };
};
exports.adminRateLimiter = adminRateLimiter;
// Middleware to validate admin input
const validateAdminInput = (req, res, next) => {
    try {
        // Basic input validation for admin routes
        if (req.body && typeof req.body === 'object') {
            // Remove any potentially dangerous fields
            delete req.body.__proto__;
            delete req.body.constructor;
            delete req.body.prototype;
        }
        next();
    }
    catch (err) {
        console.error('Error validating admin input:', err);
        next();
    }
};
exports.validateAdminInput = validateAdminInput;
// Middleware to add admin context to request
const addAdminContext = async (req, res, next) => {
    try {
        const adminId = req.user.id;
        const admin = await User_1.default.findById(adminId).select('firstName lastName email role');
        if (admin) {
            req.adminContext = {
                id: admin._id,
                name: `${admin.firstName} ${admin.lastName}`,
                email: admin.email,
                role: admin.role,
                timestamp: new Date().toISOString()
            };
        }
        next();
    }
    catch (err) {
        console.error('Error adding admin context:', err);
        next();
    }
};
exports.addAdminContext = addAdminContext;
exports.default = {
    requireAdmin: exports.requireAdmin,
    requireSuperAdmin: exports.requireSuperAdmin,
    requireAdminPermission: exports.requireAdminPermission,
    preventSelfModification: exports.preventSelfModification,
    preventSelfDeletion: exports.preventSelfDeletion,
    preventSelfRoleChange: exports.preventSelfRoleChange,
    logAdminAction: exports.logAdminAction,
    checkMaintenanceMode: exports.checkMaintenanceMode,
    adminRateLimiter: exports.adminRateLimiter,
    validateAdminInput: exports.validateAdminInput,
    addAdminContext: exports.addAdminContext
};
//# sourceMappingURL=admin.js.map