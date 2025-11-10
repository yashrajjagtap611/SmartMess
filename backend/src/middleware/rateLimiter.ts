import rateLimit from 'express-rate-limit';
import { CONFIG } from '../constants';

// Check if we're in development mode
const isDevelopment = process.env['NODE_ENV'] === 'development';

// General API rate limiter
export const apiLimiter = rateLimit({
  windowMs: CONFIG.RATE_LIMIT.WINDOW_MS,
  max: isDevelopment ? 10000 : CONFIG.RATE_LIMIT.MAX_REQUESTS, // Much higher for development
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Skip rate limiting for localhost in development
  skip: (req) => isDevelopment && (req.ip === '127.0.0.1' || req.ip === '::1' || req.ip === '::ffff:127.0.0.1'),
});

// Stricter limiter for auth routes
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isDevelopment ? 1000 : 50, // Much higher for development
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Skip rate limiting for localhost in development
  skip: (req) => isDevelopment && (req.ip === '127.0.0.1' || req.ip === '::1' || req.ip === '::ffff:127.0.0.1'),
});

// OTP rate limiter
export const otpLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: isDevelopment ? 100 : 3, // Much higher for development
  message: {
    success: false,
    message: 'Too many OTP requests, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Skip rate limiting for localhost in development
  skip: (req) => isDevelopment && (req.ip === '127.0.0.1' || req.ip === '::1' || req.ip === '::ffff:127.0.0.1'),
});

// File upload rate limiter
export const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isDevelopment ? 1000 : 10, // Much higher for development
  message: {
    success: false,
    message: 'Too many file uploads, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Skip rate limiting for localhost in development
  skip: (req) => isDevelopment && (req.ip === '127.0.0.1' || req.ip === '::1' || req.ip === '::ffff:127.0.0.1'),
}); 