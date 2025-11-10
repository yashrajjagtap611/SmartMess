// Middleware Barrel File
// This file exports all middleware in an organized manner

// Core Middleware
export { default as requireAuth } from './requireAuth';
export { errorHandler, notFound, asyncHandler, CustomError } from './errorHandler';
export { validate, schemas } from './validation';
export { apiLimiter, authLimiter, otpLimiter, uploadLimiter } from './rateLimiter';

// Security Middleware
export * from './security';

// Admin Middleware
export * from './admin';

// Subscription Middleware
export { checkSubscription, checkCanAcceptUsers, checkCanAddMeals } from './checkSubscription';

// Re-export commonly used middleware
export { default as auth } from './requireAuth';
export { errorHandler as handleError } from './errorHandler';
export { validate as validateMiddleware } from './validation'; 