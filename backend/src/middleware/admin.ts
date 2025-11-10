// Admin Middleware
// This file contains middleware functions for admin-related routes

import { Request, Response, NextFunction } from 'express';
import User from '../models/User';

import { handleAuthError } from './errorHandler';

// Middleware to check if user is admin
export const requireAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
        const userId = (req as any).user.id;
        const user = await User.findById(userId);
    
    if (!user || user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }
    
    return next();
  } catch (err) {
    return handleAuthError(res, err);
  }
};

// Middleware to check if user is super admin (same as admin for now)
export const requireSuperAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
        const userId = (req as any).user.id;
        const user = await User.findById(userId);
    
    if (!user || user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }
    
    return next();
  } catch (err) {
    return handleAuthError(res, err);
  }
};

// Middleware to check if user has specific admin permission
export const requireAdminPermission = (_permission: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
            const userId = (req as any).user.id;
            const user = await User.findById(userId);
      
      if (!user || user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Access denied. Admin privileges required.'
        });
      }

      // In a real implementation, you would check specific permissions
      // For now, we'll just allow all admins
      // if (!user.permissions.includes(permission)) {
      //   return res.status(403).json({
      //     success: false,
      //     message: `Access denied. Permission '${permission}' required.`
      //   });
      // }
      
      next();
    } catch (err) {
      return handleAuthError(res, err);
    }
  };
};

// Middleware to check if user is not trying to modify themselves
export const preventSelfModification = (req: Request, res: Response, next: NextFunction) => {
  try {
    const currentUserId = (req as any).user.id;
    const targetUserId = req.params['userId'] || req.body['userId'];

    if (currentUserId === targetUserId) {
      return res.status(400).json({
        success: false,
        message: 'Cannot modify your own account through this endpoint.'
      });
    }

    return next();
  } catch (err) {
    return handleAuthError(res, err);
  }
};

// Middleware to check if user is not trying to delete themselves
export const preventSelfDeletion = (req: Request, res: Response, next: NextFunction) => {
  try {
    const currentUserId = (req as any).user.id;
    const targetUserId = req.params['userId'] || req.body['userId'];

    if (currentUserId === targetUserId) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete your own account.'
      });
    }

    return next();
  } catch (err) {
    return handleAuthError(res, err);
  }
};

// Middleware to check if user is not trying to change their own role
export const preventSelfRoleChange = (req: Request, res: Response, next: NextFunction) => {
  try {
    const currentUserId = (req as any).user.id;
    const targetUserId = req.params['userId'] || req.body['userId'];

    if (currentUserId === targetUserId && req.body.role) {
      return res.status(400).json({
        success: false,
        message: 'Cannot change your own role.'
      });
    }

    return next();
  } catch (err) {
    return handleAuthError(res, err);
  }
};

// Middleware to log admin actions
export const logAdminAction = (action: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const adminId = (req as any).user.id;
      const targetType = req.params['userId'] ? 'user' : req.params['messId'] ? 'mess' : 'system';
      const targetId = req.params['userId'] || req.params['messId'] || 'system';

      // In a real implementation, you would log this to a database
      console.log(`Admin Action: ${adminId} performed ${action} on ${targetType} ${targetId}`);

      next();
    } catch (err) {
      // Don't block the request if logging fails
      console.error('Error logging admin action:', err);
      next();
    }
  };
};

// Middleware to check if system is in maintenance mode
export const checkMaintenanceMode = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // In a real implementation, you would check a global maintenance flag
    // For now, we'll allow all requests
    // const maintenanceMode = await getMaintenanceMode();
    // if (maintenanceMode.enabled) {
    //   return res.status(503).json({
    //     success: false,
    //     message: 'System is under maintenance. Please try again later.',
    //     estimatedDuration: maintenanceMode.estimatedDuration
    //   });
    // }

    next();
  } catch (err) {
    // Don't block the request if maintenance check fails
    console.error('Error checking maintenance mode:', err);
    next();
  }
};

// Middleware to rate limit admin actions
export const adminRateLimiter = (maxRequests: number = 100, windowMs: number = 15 * 60 * 1000) => {
  const requests = new Map<string, { count: number; resetTime: number }>();

  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const adminId = (req as any).user.id;
      const now = Date.now();

      // Clean up expired entries
      for (const [key, value] of requests.entries()) {
        if (now > value.resetTime) {
          requests.delete(key);
        }
      }

      // Check rate limit
      const userRequests = requests.get(adminId);
      if (!userRequests) {
        requests.set(adminId, { count: 1, resetTime: now + windowMs });
      } else if (now > userRequests.resetTime) {
        requests.set(adminId, { count: 1, resetTime: now + windowMs });
      } else if (userRequests.count >= maxRequests) {
        return res.status(429).json({
          success: false,
          message: 'Too many requests. Please try again later.'
        });
      } else {
        userRequests.count++;
      }

      return next();
    } catch (err) {
      // Don't block the request if rate limiting fails
      console.error('Error in admin rate limiter:', err);
      return next();
    }
  };
};

// Middleware to validate admin input
export const validateAdminInput = (req: Request, res: Response, next: NextFunction) => {
  try {
    // Basic input validation for admin routes
    if (req.body && typeof req.body === 'object') {
      // Remove any potentially dangerous fields
      delete req.body.__proto__;
      delete req.body.constructor;
      delete req.body.prototype;
    }

    next();
  } catch (err) {
    console.error('Error validating admin input:', err);
    next();
  }
};

// Middleware to add admin context to request
export const addAdminContext = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const adminId = (req as any).user.id;
    const admin = await User.findById(adminId).select('firstName lastName email role');
    
    if (admin) {
      (req as any).adminContext = {
        id: admin._id,
        name: `${admin.firstName} ${admin.lastName}`,
        email: admin.email,
        role: admin.role,
        timestamp: new Date().toISOString()
      };
    }

    next();
  } catch (err) {
    console.error('Error adding admin context:', err);
    next();
  }
};

export default {
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
}; 