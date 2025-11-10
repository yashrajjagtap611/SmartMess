import { Request, Response } from 'express';
import { subscriptionCheckService } from '../services/subscriptionCheckService';
import { MessProfile } from '../models';
import logger from '../utils/logger';

interface AuthRequest extends Request {
  user?: any;
}

export class SubscriptionCheckController {
  /**
   * Get subscription status for current mess owner
   */
  async getSubscriptionStatus(req: AuthRequest, res: Response): Promise<Response> {
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

      // Get subscription status
      const status = await subscriptionCheckService.checkSubscriptionStatus(messId);

      return res.json({
        success: true,
        data: status
      });
    } catch (error: any) {
      logger.error('Failed to get subscription status:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to check subscription status'
      });
    }
  }

  /**
   * Check if can access a specific module
   */
  async checkModuleAccess(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const userId = req.user?.id || req.user?._id;
      const { module } = req.params;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      if (!module) {
        return res.status(400).json({
          success: false,
          message: 'Module name is required'
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
      const check = await subscriptionCheckService.canAccessModule(messId, module);

      return res.json({
        success: true,
        data: {
          module,
          allowed: check.allowed,
          reason: check.reason
        }
      });
    } catch (error: any) {
      logger.error('Failed to check module access:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to check module access'
      });
    }
  }
}

export const subscriptionCheckController = new SubscriptionCheckController();


