import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';
import { STATUS_CODES, MESSAGES } from '../constants';

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

export class CustomError extends Error implements AppError {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let error = { ...err };
  error.message = err.message;

  // Log error
  logger.error('Error:', {
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
    error = new CustomError(message, STATUS_CODES.NOT_FOUND);
  }

  // Mongoose duplicate key
  if (err.name === 'MongoError' && (err as any).code === 11000) {
    const message = 'Duplicate field value entered';
    error = new CustomError(message, STATUS_CODES.CONFLICT);
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values((err as any).errors)
      .map((val: any) => val.message)
      .join(', ');
    error = new CustomError(message, STATUS_CODES.BAD_REQUEST);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    const message = 'Invalid token';
    error = new CustomError(message, STATUS_CODES.UNAUTHORIZED);
  }

  if (err.name === 'TokenExpiredError') {
    const message = 'Token expired';
    error = new CustomError(message, STATUS_CODES.UNAUTHORIZED);
  }

  // Rate limiting error
  if (err.message && err.message.includes('Too many requests')) {
    error = new CustomError('Too many requests', STATUS_CODES.TOO_MANY_REQUESTS);
  }

  res.status(error.statusCode || STATUS_CODES.INTERNAL_SERVER_ERROR).json({
    success: false,
    message: error.message || MESSAGES.GENERAL.SERVER_ERROR,
    ...(process.env['NODE_ENV'] === 'development' && {
      stack: err.stack,
      url: req.url,
      method: req.method,
    }),
  });
};

export const notFound = (req: Request, res: Response, next: NextFunction): void => {
  const error = new CustomError(
    `Route ${req.originalUrl} not found`,
    STATUS_CODES.NOT_FOUND
  );
  next(error);
};

export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Legacy function for backward compatibility
export const handleAuthError = (res: Response, error: any): void => {
  console.error('Auth Error:', error);
  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || 'Authentication error',
    ...(process.env['NODE_ENV'] === 'development' && {
      stack: error.stack,
    }),
  });
}; 