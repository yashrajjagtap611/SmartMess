import { Request, Response, NextFunction } from 'express';
import { subscriptionCheckService } from '../services/subscriptionCheckService';
import { MessProfile } from '../models';
import logger from '../utils/logger';

interface AuthRequest extends Request {
  user?: any;
}

/**
 * Middleware to check if mess has active subscription
 */
export const checkSubscription = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void | Response> => {
  try {
    const userId = req.user?.id || req.user?._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // Get mess profile
    const messProfile = await MessProfile.findOne({ userId });
    if (!messProfile) {
      return res.status(404).json({
        success: false,
        message: 'Mess profile not found'
      });
    }

    const messId = messProfile._id.toString();

    // Check subscription status
    const status = await subscriptionCheckService.checkSubscriptionStatus(messId);

    if (!status.isActive) {
      return res.status(403).json({
        success: false,
        subscriptionExpired: true,
        message: status.message || 'Your subscription has expired. Please renew to continue.',
        data: {
          isTrialActive: status.isTrialActive,
          hasCredits: status.hasCredits,
          availableCredits: status.availableCredits
        }
      });
    }

    // Subscription is active, proceed
    return next();
  } catch (error) {
    logger.error('Subscription check middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to verify subscription'
    });
  }
};

/**
 * Middleware to check if mess can accept new users
 */
export const checkCanAcceptUsers = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void | Response> => {
  try {
    const userId = req.user?.id || req.user?._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const messProfile = await MessProfile.findOne({ userId });
    if (!messProfile) {
      return res.status(404).json({
        success: false,
        message: 'Mess profile not found'
      });
    }

    const messId = messProfile._id.toString();
    const check = await subscriptionCheckService.canAcceptNewUsers(messId);

    if (!check.allowed) {
      return res.status(403).json({
        success: false,
        subscriptionExpired: true,
        message: check.reason || 'Cannot accept new users at this time'
      });
    }

    return next();
  } catch (error) {
    logger.error('Check can accept users middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to verify permissions'
    });
  }
};

/**
 * Middleware to check if mess can add meals
 */
export const checkCanAddMeals = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void | Response> => {
  try {
    const userId = req.user?.id || req.user?._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const messProfile = await MessProfile.findOne({ userId });
    if (!messProfile) {
      return res.status(404).json({
        success: false,
        message: 'Mess profile not found'
      });
    }

    const messId = messProfile._id.toString();
    const check = await subscriptionCheckService.canAddMeals(messId);

    if (!check.allowed) {
      return res.status(403).json({
        success: false,
        subscriptionExpired: true,
        message: check.reason || 'Cannot add meals at this time'
      });
    }

    return next();
  } catch (error) {
    logger.error('Check can add meals middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to verify permissions'
    });
  }
};


