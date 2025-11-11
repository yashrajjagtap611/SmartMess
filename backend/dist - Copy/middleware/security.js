"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.securityMiddleware = exports.sanitizeInput = exports.requestLogger = exports.authRateLimiter = exports.generalRateLimiter = exports.createRateLimiter = exports.compressionMiddleware = exports.corsOptions = exports.securityHeaders = void 0;
const helmet_1 = __importDefault(require("helmet"));
const cors_1 = __importDefault(require("cors"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const compression_1 = __importDefault(require("compression"));
const logger_1 = __importDefault(require("../utils/logger"));
// Security headers middleware
exports.securityHeaders = (0, helmet_1.default)({
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
exports.corsOptions = (0, cors_1.default)({
    origin: function (origin, callback) {
        // Log the origin for debugging
        logger_1.default.info('CORS Origin Check', { origin, nodeEnv: process.env['NODE_ENV'] });
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) {
            logger_1.default.info('CORS: Allowing request with no origin');
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
            if (origin && (origin.includes('localhost') ||
                origin.includes('127.0.0.1') ||
                origin.includes('[::1]') ||
                origin.includes('::1'))) {
                logger_1.default.info('CORS: Allowing localhost origin in development', { origin });
                return callback(null, true);
            }
        }
        if (allowedOrigins.indexOf(origin) !== -1) {
            logger_1.default.info('CORS: Allowing origin from allowed list', { origin });
            callback(null, true);
        }
        else {
            logger_1.default.warn('CORS: Rejecting origin', { origin, allowedOrigins });
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
exports.compressionMiddleware = (0, compression_1.default)({
    level: 6,
    threshold: 1024,
    filter: (req, res) => {
        if (req.headers['x-no-compression']) {
            return false;
        }
        return compression_1.default.filter(req, res);
    },
});
// Rate limiting middleware
const createRateLimiter = (options) => {
    return (0, express_rate_limit_1.default)({
        windowMs: options.windowMs || 60000,
        max: options.max || 100,
        message: {
            success: false,
            message: options.message || 'Too many requests, please try again later.',
            code: 'RATE_LIMIT_EXCEEDED',
        },
        keyGenerator: options.keyGenerator || ((req) => {
            // Use IP address as default key
            return req.ip || req.connection.remoteAddress || 'unknown';
        }),
        handler: (req, res) => {
            logger_1.default.warn('Rate limit exceeded', {
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
        skip: (req) => {
            // Skip rate limiting for health checks
            if (req.path === '/health')
                return true;
            // Skip rate limiting for localhost in development
            const isDevelopment = process.env['NODE_ENV'] === 'development';
            if (isDevelopment && (req.ip === '127.0.0.1' || req.ip === '::1' || req.ip === '::ffff:127.0.0.1')) {
                return true;
            }
            return false;
        },
    });
};
exports.createRateLimiter = createRateLimiter;
// General rate limiter
exports.generalRateLimiter = (0, exports.createRateLimiter)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: process.env['NODE_ENV'] === 'development' ? 10000 : 1000, // Much higher for development
    message: 'Too many requests from this IP, please try again after 15 minutes',
});
// Auth rate limiter (more strict)
exports.authRateLimiter = (0, exports.createRateLimiter)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: process.env['NODE_ENV'] === 'development' ? 100 : 20, // Much higher for development
    message: 'Too many authentication attempts, please try again after 15 minutes',
    keyGenerator: (req) => {
        // Use IP + email for auth endpoints
        const email = req.body?.email || 'unknown';
        return `${req.ip}-${email}`;
    },
});
// Request logging middleware
const requestLogger = (req, res, next) => {
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
            userId: req.user?.id,
        };
        if (res.statusCode >= 400) {
            logger_1.default.warn('HTTP Request', logData);
        }
        else {
            logger_1.default.info('HTTP Request', logData);
        }
    });
    next();
};
exports.requestLogger = requestLogger;
// Input sanitization middleware
const sanitizeInput = (req, res, next) => {
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
                req.query[key] = req.query[key].trim();
            }
        });
    }
    next();
};
exports.sanitizeInput = sanitizeInput;
// Security middleware stack
exports.securityMiddleware = [
    exports.securityHeaders,
    exports.corsOptions,
    exports.compressionMiddleware,
    exports.requestLogger,
    exports.sanitizeInput,
];
exports.default = {
    securityHeaders: exports.securityHeaders,
    corsOptions: exports.corsOptions,
    compressionMiddleware: exports.compressionMiddleware,
    createRateLimiter: exports.createRateLimiter,
    generalRateLimiter: exports.generalRateLimiter,
    authRateLimiter: exports.authRateLimiter,
    requestLogger: exports.requestLogger,
    sanitizeInput: exports.sanitizeInput,
    securityMiddleware: exports.securityMiddleware,
};
//# sourceMappingURL=security.js.map