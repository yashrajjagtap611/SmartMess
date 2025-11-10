// Admin Validators
// This file contains validation schemas for admin-related routes

const { body, query, param, validationResult } = require('express-validator');
import { Request, Response, NextFunction } from 'express';

// Validation middleware
export const validate = (req: Request, res: Response, next: NextFunction): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
    return;
  }
  next();
};

// User Management Validators
export const validateUserUpdate = [
  body('firstName')
    .optional()
    .isString()
    .withMessage('First name must be a string')
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  
  body('lastName')
    .optional()
    .isString()
    .withMessage('Last name must be a string')
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
  
  body('email')
    .optional()
    .isEmail()
    .withMessage('Invalid email format'),
  
  body('phone')
    .optional()
    .isMobilePhone('any')
    .withMessage('Invalid phone number format'),
  
  body('role')
    .optional()
    .isIn(['user', 'admin', 'super-admin'])
    .withMessage('Invalid role. Must be user, admin, or super-admin'),
  
  body('isVerified')
    .optional()
    .isBoolean()
    .withMessage('isVerified must be a boolean'),
  
  body('isSuspended')
    .optional()
    .isBoolean()
    .withMessage('isSuspended must be a boolean'),
  
  validate
];

export const validateUserBulkAction = [
  body('userIds')
    .isArray({ min: 1 })
    .withMessage('userIds must be a non-empty array'),
  
  body('userIds.*')
    .isMongoId()
    .withMessage('Each userId must be a valid MongoDB ID'),
  
  body('action')
    .isIn(['verify', 'suspend', 'activate', 'delete', 'changeRole'])
    .withMessage('Invalid action. Must be verify, suspend, activate, delete, or changeRole'),
  
  body('role')
    .optional()
    .isIn(['user', 'admin', 'super-admin'])
    .withMessage('Invalid role. Must be user, admin, or super-admin'),
  
  validate
];

export const validateUserSearch = [
  query('search')
    .optional()
    .isString()
    .withMessage('Search query must be a string'),
  
  query('role')
    .optional()
    .isIn(['user', 'admin', 'super-admin'])
    .withMessage('Invalid role filter'),
  
  query('status')
    .optional()
    .isIn(['active', 'suspended', 'pending'])
    .withMessage('Invalid status filter'),
  
  query('verified')
    .optional()
    .isIn(['true', 'false'])
    .withMessage('Verified filter must be true or false'),
  
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  
  validate
];

// Analytics Validators
export const validateAnalyticsQuery = [
  query('period')
    .optional()
    .isIn(['7d', '30d', '90d', '1y'])
    .withMessage('Period must be 7d, 30d, 90d, or 1y'),
  
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid ISO 8601 date'),
  
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid ISO 8601 date'),
  
  validate
];

export const validateTrendsQuery = [
  query('metric')
    .optional()
    .isIn(['users', 'messes', 'memberships', 'payments'])
    .withMessage('Metric must be users, messes, memberships, or payments'),
  
  query('period')
    .optional()
    .isIn(['7d', '30d', '90d', '1y'])
    .withMessage('Period must be 7d, 30d, 90d, or 1y'),
  
  validate
];

// Reports Validators
export const validateReportQuery = [
  query('status')
    .optional()
    .isString()
    .withMessage('Status must be a string'),
  
  query('role')
    .optional()
    .isString()
    .withMessage('Role must be a string'),
  
  query('verified')
    .optional()
    .isIn(['true', 'false'])
    .withMessage('Verified must be true or false'),
  
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid ISO 8601 date'),
  
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid ISO 8601 date'),
  
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  
  validate
];

export const validateExportQuery = [
  param('type')
    .isIn(['users', 'messes', 'memberships', 'financial'])
    .withMessage('Invalid export type. Must be users, messes, memberships, or financial'),
  
  query('format')
    .optional()
    .isIn(['json', 'csv'])
    .withMessage('Format must be json or csv'),
  
  validate
];

// Settings Validators
export const validateSystemSettings = [
  body('features')
    .optional()
    .isObject()
    .withMessage('Features must be an object'),
  
  body('limits')
    .optional()
    .isObject()
    .withMessage('Limits must be an object'),
  
  body('maintenanceMode')
    .optional()
    .isBoolean()
    .withMessage('Maintenance mode must be a boolean'),
  
  body('maintenanceMessage')
    .optional()
    .isString()
    .withMessage('Maintenance message must be a string'),
  
  validate
];

export const validateSecuritySettings = [
  body('authentication')
    .optional()
    .isObject()
    .withMessage('Authentication settings must be an object'),
  
  body('password')
    .optional()
    .isObject()
    .withMessage('Password settings must be an object'),
  
  body('rateLimiting')
    .optional()
    .isObject()
    .withMessage('Rate limiting settings must be an object'),
  
  body('cors')
    .optional()
    .isObject()
    .withMessage('CORS settings must be an object'),
  
  body('headers')
    .optional()
    .isObject()
    .withMessage('Header settings must be an object'),
  
  validate
];

export const validateEmailSettings = [
  body('provider')
    .optional()
    .isIn(['nodemailer', 'sendgrid', 'mailgun'])
    .withMessage('Provider must be nodemailer, sendgrid, or mailgun'),
  
  body('smtp')
    .optional()
    .isObject()
    .withMessage('SMTP settings must be an object'),
  
  body('templates')
    .optional()
    .isObject()
    .withMessage('Template settings must be an object'),
  
  body('defaults')
    .optional()
    .isObject()
    .withMessage('Default settings must be an object'),
  
  body('rateLimiting')
    .optional()
    .isObject()
    .withMessage('Rate limiting settings must be an object'),
  
  validate
];

export const validateNotificationSettings = [
  body('push')
    .optional()
    .isObject()
    .withMessage('Push notification settings must be an object'),
  
  body('email')
    .optional()
    .isObject()
    .withMessage('Email notification settings must be an object'),
  
  body('sms')
    .optional()
    .isObject()
    .withMessage('SMS notification settings must be an object'),
  
  body('inApp')
    .optional()
    .isObject()
    .withMessage('In-app notification settings must be an object'),
  
  body('preferences')
    .optional()
    .isObject()
    .withMessage('Notification preferences must be an object'),
  
  validate
];

export const validateTestEmail = [
  body('email')
    .isEmail()
    .withMessage('Valid email address is required'),
  
  validate
];

export const validateBackupRequest = [
  body('type')
    .isIn(['full', 'users', 'messes', 'memberships'])
    .withMessage('Backup type must be full, users, messes, or memberships'),
  
  validate
];

// Mess Management Validators
export const validateMessUpdate = [
  body('name')
    .optional()
    .isString()
    .withMessage('Mess name must be a string')
    .isLength({ min: 2, max: 100 })
    .withMessage('Mess name must be between 2 and 100 characters'),
  
  body('description')
    .optional()
    .isString()
    .withMessage('Description must be a string')
    .isLength({ max: 500 })
    .withMessage('Description must not exceed 500 characters'),
  
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean'),
  
  body('location')
    .optional()
    .isObject()
    .withMessage('Location must be an object'),
  
  body('location.address')
    .optional()
    .isString()
    .withMessage('Address must be a string'),
  
  body('location.city')
    .optional()
    .isString()
    .withMessage('City must be a string'),
  
  body('location.state')
    .optional()
    .isString()
    .withMessage('State must be a string'),
  
  body('location.zipCode')
    .optional()
    .isString()
    .withMessage('Zip code must be a string'),
  
  validate
];

export const validateMessSearch = [
  query('search')
    .optional()
    .isString()
    .withMessage('Search query must be a string'),
  
  query('status')
    .optional()
    .isIn(['active', 'inactive'])
    .withMessage('Status must be active or inactive'),
  
  query('location')
    .optional()
    .isString()
    .withMessage('Location must be a string'),
  
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  
  validate
];

// Membership Management Validators
export const validateMembershipUpdate = [
  body('status')
    .optional()
    .isIn(['active', 'pending', 'inactive', 'suspended'])
    .withMessage('Status must be active, pending, inactive, or suspended'),
  
  body('paymentStatus')
    .optional()
    .isIn(['paid', 'pending', 'overdue', 'failed'])
    .withMessage('Payment status must be paid, pending, overdue, or failed'),
  
  body('subscriptionStartDate')
    .optional()
    .isISO8601()
    .withMessage('Subscription start date must be a valid ISO 8601 date'),
  
  body('subscriptionEndDate')
    .optional()
    .isISO8601()
    .withMessage('Subscription end date must be a valid ISO 8601 date'),
  
  validate
];

export const validateMembershipSearch = [
  query('status')
    .optional()
    .isIn(['active', 'pending', 'inactive', 'suspended'])
    .withMessage('Status must be active, pending, inactive, or suspended'),
  
  query('paymentStatus')
    .optional()
    .isIn(['paid', 'pending', 'overdue', 'failed'])
    .withMessage('Payment status must be paid, pending, overdue, or failed'),
  
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid ISO 8601 date'),
  
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid ISO 8601 date'),
  
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  
  validate
];

// Financial Report Validators
export const validateFinancialQuery = [
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid ISO 8601 date'),
  
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid ISO 8601 date'),
  
  query('messId')
    .optional()
    .isMongoId()
    .withMessage('Mess ID must be a valid MongoDB ID'),
  
  query('userId')
    .optional()
    .isMongoId()
    .withMessage('User ID must be a valid MongoDB ID'),
  
  validate
];

// General Admin Validators
export const validateAdminAction = [
  body('action')
    .isString()
    .withMessage('Action is required and must be a string'),
  
  body('targetType')
    .isString()
    .withMessage('Target type is required and must be a string'),
  
  body('targetId')
    .isMongoId()
    .withMessage('Target ID must be a valid MongoDB ID'),
  
  body('details')
    .optional()
    .isObject()
    .withMessage('Details must be an object'),
  
  validate
];

export const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  
  validate
];

export const validateDateRange = [
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid ISO 8601 date'),
  
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid ISO 8601 date'),
  
  validate
]; 