"use strict";
// Admin Module Barrel File
// This file exports all admin-related modules in an organized manner
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateNotificationSettings = exports.validateEmailConfig = exports.formatAdminNotification = exports.canAdminPerformAction = exports.getAdminRoleLevel = exports.isSuperAdmin = exports.isAdmin = exports.generateBackupId = exports.convertToCSV = exports.validateExportFormat = exports.validateBackupType = exports.generateBackupFilename = exports.formatFileSize = exports.calculatePercentage = exports.buildAnalyticsPipeline = exports.formatDateRangeParams = exports.formatPaginationParams = exports.sanitizeAdminInput = exports.validateAdminPermissions = exports.getClientUserAgent = exports.getClientIP = exports.formatAdminActionLog = exports.getAdminContext = exports.addAdminContext = exports.validateAdminInput = exports.adminRateLimiter = exports.checkMaintenanceMode = exports.logAdminAction = exports.preventSelfRoleChange = exports.preventSelfDeletion = exports.preventSelfModification = exports.requireAdminPermission = exports.requireSuperAdmin = exports.requireAdmin = exports.AdminService = exports.AdminController = exports.adminRoutes = void 0;
// Routes
var admin_1 = require("../routes/admin");
Object.defineProperty(exports, "adminRoutes", { enumerable: true, get: function () { return __importDefault(admin_1).default; } });
// Controllers
var admin_2 = require("../controllers/admin");
Object.defineProperty(exports, "AdminController", { enumerable: true, get: function () { return __importDefault(admin_2).default; } });
// Services
var admin_3 = require("../services/admin");
Object.defineProperty(exports, "AdminService", { enumerable: true, get: function () { return __importDefault(admin_3).default; } });
// Middleware
var admin_4 = require("../middleware/admin");
Object.defineProperty(exports, "requireAdmin", { enumerable: true, get: function () { return admin_4.requireAdmin; } });
Object.defineProperty(exports, "requireSuperAdmin", { enumerable: true, get: function () { return admin_4.requireSuperAdmin; } });
Object.defineProperty(exports, "requireAdminPermission", { enumerable: true, get: function () { return admin_4.requireAdminPermission; } });
Object.defineProperty(exports, "preventSelfModification", { enumerable: true, get: function () { return admin_4.preventSelfModification; } });
Object.defineProperty(exports, "preventSelfDeletion", { enumerable: true, get: function () { return admin_4.preventSelfDeletion; } });
Object.defineProperty(exports, "preventSelfRoleChange", { enumerable: true, get: function () { return admin_4.preventSelfRoleChange; } });
Object.defineProperty(exports, "logAdminAction", { enumerable: true, get: function () { return admin_4.logAdminAction; } });
Object.defineProperty(exports, "checkMaintenanceMode", { enumerable: true, get: function () { return admin_4.checkMaintenanceMode; } });
Object.defineProperty(exports, "adminRateLimiter", { enumerable: true, get: function () { return admin_4.adminRateLimiter; } });
Object.defineProperty(exports, "validateAdminInput", { enumerable: true, get: function () { return admin_4.validateAdminInput; } });
Object.defineProperty(exports, "addAdminContext", { enumerable: true, get: function () { return admin_4.addAdminContext; } });
// Utils
var admin_5 = require("../utils/admin");
Object.defineProperty(exports, "getAdminContext", { enumerable: true, get: function () { return admin_5.getAdminContext; } });
Object.defineProperty(exports, "formatAdminActionLog", { enumerable: true, get: function () { return admin_5.formatAdminActionLog; } });
Object.defineProperty(exports, "getClientIP", { enumerable: true, get: function () { return admin_5.getClientIP; } });
Object.defineProperty(exports, "getClientUserAgent", { enumerable: true, get: function () { return admin_5.getClientUserAgent; } });
Object.defineProperty(exports, "validateAdminPermissions", { enumerable: true, get: function () { return admin_5.validateAdminPermissions; } });
Object.defineProperty(exports, "sanitizeAdminInput", { enumerable: true, get: function () { return admin_5.sanitizeAdminInput; } });
Object.defineProperty(exports, "formatPaginationParams", { enumerable: true, get: function () { return admin_5.formatPaginationParams; } });
Object.defineProperty(exports, "formatDateRangeParams", { enumerable: true, get: function () { return admin_5.formatDateRangeParams; } });
Object.defineProperty(exports, "buildAnalyticsPipeline", { enumerable: true, get: function () { return admin_5.buildAnalyticsPipeline; } });
Object.defineProperty(exports, "calculatePercentage", { enumerable: true, get: function () { return admin_5.calculatePercentage; } });
Object.defineProperty(exports, "formatFileSize", { enumerable: true, get: function () { return admin_5.formatFileSize; } });
Object.defineProperty(exports, "generateBackupFilename", { enumerable: true, get: function () { return admin_5.generateBackupFilename; } });
Object.defineProperty(exports, "validateBackupType", { enumerable: true, get: function () { return admin_5.validateBackupType; } });
Object.defineProperty(exports, "validateExportFormat", { enumerable: true, get: function () { return admin_5.validateExportFormat; } });
Object.defineProperty(exports, "convertToCSV", { enumerable: true, get: function () { return admin_5.convertToCSV; } });
Object.defineProperty(exports, "generateBackupId", { enumerable: true, get: function () { return admin_5.generateBackupId; } });
Object.defineProperty(exports, "isAdmin", { enumerable: true, get: function () { return admin_5.isAdmin; } });
Object.defineProperty(exports, "isSuperAdmin", { enumerable: true, get: function () { return admin_5.isSuperAdmin; } });
Object.defineProperty(exports, "getAdminRoleLevel", { enumerable: true, get: function () { return admin_5.getAdminRoleLevel; } });
Object.defineProperty(exports, "canAdminPerformAction", { enumerable: true, get: function () { return admin_5.canAdminPerformAction; } });
Object.defineProperty(exports, "formatAdminNotification", { enumerable: true, get: function () { return admin_5.formatAdminNotification; } });
Object.defineProperty(exports, "validateEmailConfig", { enumerable: true, get: function () { return admin_5.validateEmailConfig; } });
Object.defineProperty(exports, "validateNotificationSettings", { enumerable: true, get: function () { return admin_5.validateNotificationSettings; } });
// Types
__exportStar(require("../types/admin"), exports);
// Validators
__exportStar(require("../validators/admin"), exports);
// Tests
// export { default as adminTests } from '../tests/admin.test'; 
//# sourceMappingURL=index.js.map