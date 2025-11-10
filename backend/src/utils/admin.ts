// Admin Utils
// This file contains utility functions for admin-related operations

import { Request, Response } from 'express';

// Helper function to get admin context from request
export const getAdminContext = (req: Request) => {
  return (req as any).adminContext || null;
};

// Helper function to format admin action log
export const formatAdminActionLog = (
  req: Request,
  adminId: string,
  action: string,
  targetType: string,
  targetId: string,
  details?: any
) => {
  return {
    adminId,
    action,
    targetType,
    targetId,
    details,
    timestamp: new Date().toISOString(),
    ipAddress: getClientIP(req),
    userAgent: getClientUserAgent(req)
  };
};

// Helper function to get client IP address
export const getClientIP = (req: Request): string => {
  return (
    req.headers['x-forwarded-for'] ||
    req.headers['x-real-ip'] ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    'unknown'
  ) as string;
};

// Helper function to get client user agent
export const getClientUserAgent = (req: Request): string => {
  return req.headers['user-agent'] || 'unknown';
};

// Helper function to validate admin permissions
export const validateAdminPermissions = (userRole: string, requiredRole: string): boolean => {
  const roleHierarchy = {
    'user': 0,
    'moderator': 1,
    'admin': 2,
    'super-admin': 3
  };

  const userLevel = roleHierarchy[userRole as keyof typeof roleHierarchy] || 0;
  const requiredLevel = roleHierarchy[requiredRole as keyof typeof roleHierarchy] || 0;

  return userLevel >= requiredLevel;
};

// Helper function to sanitize admin input
export const sanitizeAdminInput = (input: any): any => {
  if (typeof input !== 'object' || input === null) {
    return input;
  }

  const sanitized: any = Array.isArray(input) ? [] : {};

  for (const [key, value] of Object.entries(input)) {
    // Skip potentially dangerous keys
    if (['__proto__', 'constructor', 'prototype'].includes(key)) {
      continue;
    }

    if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeAdminInput(value);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
};

// Helper function to format pagination parameters
export const formatPaginationParams = (query: any) => {
  const page = Math.max(1, parseInt(query.page as string) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit as string) || 20));
  const skip = (page - 1) * limit;

  return { page, limit, skip };
};

// Helper function to format date range parameters
export const formatDateRangeParams = (query: any) => {
  const startDate = query.startDate ? new Date(query.startDate as string) : null;
  const endDate = query.endDate ? new Date(query.endDate as string) : null;

  // Validate dates
  if (startDate && isNaN(startDate.getTime())) {
    throw new Error('Invalid start date format');
  }
  if (endDate && isNaN(endDate.getTime())) {
    throw new Error('Invalid end date format');
  }

  return { startDate, endDate };
};

// Helper function to build MongoDB aggregation pipeline for analytics
export const buildAnalyticsPipeline = (
  startDate: Date | null,
  endDate: Date | null,
  groupBy: string = 'day',
  additionalStages: any[] = []
) => {
  const pipeline: any[] = [];

  // Add date filter if provided
  if (startDate || endDate) {
    const dateFilter: any = {};
    if (startDate) dateFilter.$gte = startDate;
    if (endDate) dateFilter.$lte = endDate;

    pipeline.push({
      $match: {
        createdAt: dateFilter
      }
    });
  }

  // Add additional stages
  pipeline.push(...additionalStages);

  // Add grouping stage
  let dateFormat: string;
  switch (groupBy) {
    case 'hour':
      dateFormat = '%Y-%m-%d-%H';
      break;
    case 'day':
      dateFormat = '%Y-%m-%d';
      break;
    case 'week':
      dateFormat = '%Y-%U';
      break;
    case 'month':
      dateFormat = '%Y-%m';
      break;
    case 'year':
      dateFormat = '%Y';
      break;
    default:
      dateFormat = '%Y-%m-%d';
  }

  pipeline.push({
    $group: {
      _id: {
        $dateToString: {
          format: dateFormat,
          date: '$createdAt'
        }
      },
      count: { $sum: 1 }
    }
  });

  // Add sorting stage
  pipeline.push({
    $sort: { _id: 1 }
  });

  return pipeline;
};

// Helper function to calculate percentage
export const calculatePercentage = (value: number, total: number): number => {
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
};

// Helper function to format file size
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Helper function to generate backup filename
export const generateBackupFilename = (type: string, format: string = 'json'): string => {
  const timestamp = new Date().toISOString().split('T')[0];
  const time = new Date().toTimeString().split(' ')[0]?.replace(/:/g, '-') || '00-00-00';
  return `backup-${type}-${timestamp}-${time}.${format}`;
};

// Helper function to validate backup type
export const validateBackupType = (type: string): boolean => {
  const validTypes = ['full', 'users', 'messes', 'memberships', 'financial'];
  return validTypes.includes(type);
};

// Helper function to validate export format
export const validateExportFormat = (format: string): boolean => {
  const validFormats = ['json', 'csv'];
  return validFormats.includes(format);
};

// Helper function to convert data to CSV
export const convertToCSV = (data: any[]): string => {
  if (data.length === 0) return '';

  // Get headers from first object
  const headers = Object.keys(data[0]);

  // Convert nested objects to string representation
  const csvRows = data.map(row => {
    return headers.map(header => {
      const value = row[header];
      if (value === null || value === undefined) return '';
      if (typeof value === 'object') return JSON.stringify(value);
      return String(value);
    }).join(',');
  });

  return [headers.join(','), ...csvRows].join('\n');
};

// Helper function to generate random backup ID
export const generateBackupId = (): string => {
  return `backup_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Helper function to check if user is admin
export const isAdmin = (userRole: string): boolean => {
  return ['admin', 'super-admin'].includes(userRole);
};

// Helper function to check if user is super admin
export const isSuperAdmin = (userRole: string): boolean => {
  return userRole === 'super-admin';
};

// Helper function to get admin role level
export const getAdminRoleLevel = (userRole: string): number => {
  const roleLevels: { [key: string]: number } = {
    'user': 0,
    'moderator': 1,
    'admin': 2,
    'super-admin': 3
  };

  return roleLevels[userRole] || 0;
};

// Helper function to check if admin can perform action on target
export const canAdminPerformAction = (
  adminRole: string,
  targetRole: string,
  _action: string
): boolean => {
    const targetLevel = getAdminRoleLevel(targetRole);

  // Super admin can perform any action on anyone
  if (adminRole === 'super-admin') return true;

  // Admin can perform actions on users and moderators
  if (adminRole === 'admin' && targetLevel < 2) return true;

  // Admin cannot perform actions on other admins or super admins
  if (adminRole === 'admin' && targetLevel >= 2) return false;

  // Users and moderators cannot perform admin actions
  return false;
};

// Helper function to format admin notification
export const formatAdminNotification = (
  type: string,
  title: string,
  message: string,
  priority: 'low' | 'medium' | 'high' | 'critical' = 'medium',
  metadata?: any
) => {
  return {
    type,
    title,
    message,
    priority,
    metadata,
    createdAt: new Date().toISOString(),
    isRead: false
  };
};

// Helper function to validate email configuration
export const validateEmailConfig = (config: any): boolean => {
  if (!config || typeof config !== 'object') return false;

  const requiredFields = ['host', 'port', 'auth'];
  for (const field of requiredFields) {
    if (!config[field]) return false;
  }

  if (config.auth && (!config.auth.user || !config.auth.pass)) {
    return false;
  }

  return true;
};

// Helper function to validate notification settings
export const validateNotificationSettings = (settings: any): boolean => {
  if (!settings || typeof settings !== 'object') return false;

  const requiredSections = ['email', 'push', 'sms', 'inApp'];
  for (const section of requiredSections) {
    if (!settings[section] || typeof settings[section] !== 'object') {
      return false;
    }
  }

  return true;
};

export default {
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
}; 