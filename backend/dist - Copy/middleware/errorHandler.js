"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleAuthError = exports.asyncHandler = exports.notFound = exports.errorHandler = exports.CustomError = void 0;
const logger_1 = __importDefault(require("../utils/logger"));
const constants_1 = require("../constants");
class CustomError extends Error {
    statusCode;
    isOperational;
    constructor(message, statusCode = 500) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.CustomError = CustomError;
const errorHandler = (err, req, res, next) => {
    let error = { ...err };
    error.message = err.message;
    // Log error
    logger_1.default.error('Error:', {
        message: err.message,
        stack: err.stack,
        url: req.url,
        method: req.method,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
    });
    // Mongoose bad ObjectId
    if (err.name === 'CastError') {
        const message = 'Resource not found';
        error = new CustomError(message, constants_1.STATUS_CODES.NOT_FOUND);
    }
    // Mongoose duplicate key
    if (err.name === 'MongoError' && err.code === 11000) {
        const message = 'Duplicate field value entered';
        error = new CustomError(message, constants_1.STATUS_CODES.CONFLICT);
    }
    // Mongoose validation error
    if (err.name === 'ValidationError') {
        const message = Object.values(err.errors)
            .map((val) => val.message)
            .join(', ');
        error = new CustomError(message, constants_1.STATUS_CODES.BAD_REQUEST);
    }
    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        const message = 'Invalid token';
        error = new CustomError(message, constants_1.STATUS_CODES.UNAUTHORIZED);
    }
    if (err.name === 'TokenExpiredError') {
        const message = 'Token expired';
        error = new CustomError(message, constants_1.STATUS_CODES.UNAUTHORIZED);
    }
    // Rate limiting error
    if (err.message && err.message.includes('Too many requests')) {
        error = new CustomError('Too many requests', constants_1.STATUS_CODES.TOO_MANY_REQUESTS);
    }
    res.status(error.statusCode || constants_1.STATUS_CODES.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: error.message || constants_1.MESSAGES.GENERAL.SERVER_ERROR,
        ...(process.env['NODE_ENV'] === 'development' && {
            stack: err.stack,
            url: req.url,
            method: req.method,
        }),
    });
};
exports.errorHandler = errorHandler;
const notFound = (req, res, next) => {
    const error = new CustomError(`Route ${req.originalUrl} not found`, constants_1.STATUS_CODES.NOT_FOUND);
    next(error);
};
exports.notFound = notFound;
const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};
exports.asyncHandler = asyncHandler;
// Legacy function for backward compatibility
const handleAuthError = (res, error) => {
    console.error('Auth Error:', error);
    res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Authentication error',
        ...(process.env['NODE_ENV'] === 'development' && {
            stack: error.stack,
        }),
    });
};
exports.handleAuthError = handleAuthError;
//# sourceMappingURL=errorHandler.js.map