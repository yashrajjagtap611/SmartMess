import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import compression from 'compression';
import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';

// Security headers middleware
export const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" },
});

// CORS configuration
export const corsOptions = cors({
  origin: function (origin, callback) {
    // Log the origin for debugging
    logger.info('CORS Origin Check', { origin, nodeEnv: process.env['NODE_ENV'] });
    
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) {
      logger.info('CORS: Allowing request with no origin');
      return callback(null, true);
    }
    
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:5175',
      'http://localhost:5176',
      'http://localhost:5177',
      'http://localhost:5178',
      'http://localhost:5179',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:5173',
      'http://127.0.0.1:5174',
      'http://127.0.0.1:5175',
      'http://127.0.0.1:5176',
      'http://127.0.0.1:5177',
      'http://127.0.0.1:5178',
      'http://127.0.0.1:5179',
      'http://[::1]:3000',
      'http://[::1]:5173',
      'http://[::1]:5174',
      'http://[::1]:5175',
      'http://[::1]:5176',
      'http://[::1]:5177',
      'http://[::1]:5178',
      'http://[::1]:5179'
    ];
    
    // In development, be more permissive
    if (process.env['NODE_ENV'] === 'development') {
      // Allow any localhost origin in development
      if (origin && (
        origin.includes('localhost') || 
        origin.includes('127.0.0.1') || 
        origin.includes('[::1]') ||
        origin.includes('::1')
      )) {
        logger.info('CORS: Allowing localhost origin in development', { origin });
        return callback(null, true);
      }
    }
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      logger.info('CORS: Allowing origin from allowed list', { origin });
      callback(null, true);
    } else {
      logger.warn('CORS: Rejecting origin', { origin, allowedOrigins });
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'Cache-Control',
  ],
  exposedHeaders: ['X-Total-Count', 'X-Page-Count'],
  optionsSuccessStatus: 200 // Some legacy browsers choke on 204
});

// Compression middleware
export const compressionMiddleware: any = compression({
  level: 6,
  threshold: 1024,
  filter: (req: Request, res: Response) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  },
});

// Rate limiting middleware
export const createRateLimiter = (options: {
  windowMs?: number;
  max?: number;
  message?: string;
  keyGenerator?: (req: Request) => string;
}) => {
  return rateLimit({
    windowMs: options.windowMs || 60000,
    max: options.max || 100,
    message: {
      success: false,
      message: options.message || 'Too many requests, please try again later.',
      code: 'RATE_LIMIT_EXCEEDED',
    },
    keyGenerator: options.keyGenerator || ((req: Request) => {
      // Use IP address as default key
      return req.ip || req.connection.remoteAddress || 'unknown';
    }),
    handler: (req: Request, res: Response) => {
      logger.warn('Rate limit exceeded', {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        url: req.url,
      });
      res.status(429).json({
        success: false,
        message: options.message || 'Too many requests, please try again later.',
        code: 'RATE_LIMIT_EXCEEDED',
        timestamp: new Date().toISOString(),
      });
    },
    skip: (req: Request) => {
      // Skip rate limiting for health checks
      if (req.path === '/health') return true;
      
      // Skip rate limiting for localhost in development
      const isDevelopment = process.env['NODE_ENV'] === 'development';
      if (isDevelopment && (req.ip === '127.0.0.1' || req.ip === '::1' || req.ip === '::ffff:127.0.0.1')) {
        return true;
      }
      
      return false;
    },
  });
};

// General rate limiter
export const generalRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env['NODE_ENV'] === 'development' ? 10000 : 1000, // Much higher for development
  message: 'Too many requests from this IP, please try again after 15 minutes',
});

// Auth rate limiter (more strict)
export const authRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env['NODE_ENV'] === 'development' ? 100 : 20, // Much higher for development
  message: 'Too many authentication attempts, please try again after 15 minutes',
  keyGenerator: (req: Request) => {
    // Use IP + email for auth endpoints
    const email = req.body?.email || 'unknown';
    return `${req.ip}-${email}`;
  },
});

// Request logging middleware
export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logData = {
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      userId: (req as any).user?.id,
    };

    if (res.statusCode >= 400) {
      logger.warn('HTTP Request', logData);
    } else {
      logger.info('HTTP Request', logData);
    }
  });

  next();
};

// Input sanitization middleware
export const sanitizeInput = (req: Request, res: Response, next: NextFunction) => {
  // Sanitize request body
  if (req.body) {
    Object.keys(req.body).forEach(key => {
      if (typeof req.body[key] === 'string') {
        req.body[key] = req.body[key].trim();
      }
    });
  }

  // Sanitize query parameters
  if (req.query) {
    Object.keys(req.query).forEach(key => {
      if (typeof req.query[key] === 'string') {
        req.query[key] = (req.query[key] as string).trim();
      }
    });
  }

  next();
};

// Security middleware stack
export const securityMiddleware: any[] = [
  securityHeaders,
  corsOptions,
  compressionMiddleware,
  requestLogger,
  sanitizeInput,
];

export default {
  securityHeaders,
  corsOptions,
  compressionMiddleware,
  createRateLimiter,
  generalRateLimiter,
  authRateLimiter,
  requestLogger,
  sanitizeInput,
  securityMiddleware,
} as any; 