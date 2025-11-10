// Admin Module Barrel File
// This file exports all admin-related modules in an organized manner

// Routes
export { default as adminRoutes } from '../routes/admin';

// Controllers
export { default as AdminController } from '../controllers/admin';

// Services
export { default as AdminService } from '../services/admin';

// Middleware
export { 
  requireAdmin, 
  requireSuperAdmin, 
  requireAdminPermission,
  preventSelfModification,
  preventSelfDeletion,
  preventSelfRoleChange,
  logAdminAction,
  checkMaintenanceMode,
  adminRateLimiter,
  validateAdminInput,
  addAdminContext
} from '../middleware/admin';

// Utils
export {
  getAdminContext,
  formatAdminActionLog,
  getClientIP,
  getClientUserAgent,
  validateAdminPermissions,
  sanitizeAdminInput,
  formatPaginationParams,
  formatDateRangeParams,
  buildAnalyticsPipeline,
  calculatePercentage,
  formatFileSize,
  generateBackupFilename,
  validateBackupType,
  validateExportFormat,
  convertToCSV,
  generateBackupId,
  isAdmin,
  isSuperAdmin,
  getAdminRoleLevel,
  canAdminPerformAction,
  formatAdminNotification,
  validateEmailConfig,
  validateNotificationSettings
} from '../utils/admin';

// Types
export * from '../types/admin';

// Validators
export * from '../validators/admin';

// Tests
// export { default as adminTests } from '../tests/admin.test'; 