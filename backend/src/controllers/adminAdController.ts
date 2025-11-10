import { Request, Response, NextFunction } from 'express';
import { AdSettings, AdCampaign } from '../models';
import { AdService } from '../services/adService';
import logger from '../utils/logger';

export class AdminAdController {
  /**
   * Get ad settings (admin)
   */
  static async getSettings(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const settings = await AdService.getSettings();
      res.status(200).json({
        success: true,
        data: settings
      });
    } catch (error: any) {
      logger.error('Error getting ad settings:', error);
      next(error);
    }
  }

  /**
   * Update ad settings
   */
  static async updateSettings(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user._id.toString();
      const updates = req.body;

      // Get current settings or create new
      let settings = await AdSettings.findOne().sort({ createdAt: -1 });
      
      if (!settings) {
        settings = await AdSettings.create({
          ...updates,
          updatedBy: userId
        });
      } else {
        Object.assign(settings, updates, { updatedBy: userId });
        await settings.save();
      }

      res.status(200).json({
        success: true,
        data: settings,
        message: 'Ad settings updated successfully'
      });
    } catch (error: any) {
      logger.error('Error updating ad settings:', error);
      next(error);
    }
  }

  /**
   * Get all campaigns (admin)
   */
  static async getAllCampaigns(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { status, messId } = req.query;
      const query: any = {};
      
      if (status) {
        query.status = status;
      }
      if (messId) {
        query.messId = messId;
      }

      const campaigns = await AdCampaign.find(query)
        .populate('messId', 'name')
        .populate('approvedBy', 'firstName lastName')
        .sort({ createdAt: -1 });

      res.status(200).json({
        success: true,
        data: campaigns
      });
    } catch (error: any) {
      logger.error('Error getting all campaigns:', error);
      next(error);
    }
  }

  /**
   * Approve campaign
   */
  static async approveCampaign(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user._id.toString();
      const { campaignId } = req.params;

      if (!campaignId) {
        res.status(400).json({
          success: false,
          message: 'Campaign ID is required'
        });
        return;
      }

      const campaign = await AdCampaign.findById(campaignId);
      if (!campaign) {
        res.status(404).json({
          success: false,
          message: 'Campaign not found'
        });
        return;
      }

      if (campaign.status !== 'pending_approval') {
        res.status(400).json({
          success: false,
          message: 'Campaign is not pending approval'
        });
        return;
      }

      // Activate the campaign
      await AdService.activateCampaign(campaignId);

      // Update approval info
      campaign.approvedBy = userId as any;
      campaign.approvedAt = new Date();
      campaign.status = 'active';
      await campaign.save();

      res.status(200).json({
        success: true,
        data: campaign,
        message: 'Campaign approved and activated'
      });
    } catch (error: any) {
      logger.error('Error approving campaign:', error);
      next(error);
    }
  }

  /**
   * Reject campaign
   */
  static async rejectCampaign(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user._id.toString();
      const { campaignId } = req.params;
      const { rejectionReason } = req.body;

      if (!campaignId) {
        res.status(400).json({
          success: false,
          message: 'Campaign ID is required'
        });
        return;
      }

      const campaign = await AdCampaign.findById(campaignId);
      if (!campaign) {
        res.status(404).json({
          success: false,
          message: 'Campaign not found'
        });
        return;
      }

      if (campaign.status !== 'pending_approval') {
        res.status(400).json({
          success: false,
          message: 'Campaign is not pending approval'
        });
        return;
      }

      campaign.status = 'rejected';
      campaign.rejectionReason = rejectionReason || 'Campaign rejected by admin';
      await campaign.save();

      res.status(200).json({
        success: true,
        data: campaign,
        message: 'Campaign rejected'
      });
    } catch (error: any) {
      logger.error('Error rejecting campaign:', error);
      next(error);
    }
  }

  /**
   * Get ad analytics (admin)
   */
  static async getAnalytics(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { startDate, endDate } = req.query;
      
      const query: any = {};
      if (startDate || endDate) {
        query.createdAt = {};
        if (startDate) {
          query.createdAt.$gte = new Date(startDate as string);
        }
        if (endDate) {
          query.createdAt.$lte = new Date(endDate as string);
        }
      }

      const campaigns = await AdCampaign.find(query)
        .populate('messId', 'name')
        .sort({ createdAt: -1 });

      const totalCampaigns = campaigns.length;
      const activeCampaigns = campaigns.filter(c => c.status === 'active').length;
      const totalImpressions = campaigns.reduce((sum, c) => sum + c.impressions, 0);
      const totalClicks = campaigns.reduce((sum, c) => sum + c.clicks, 0);
      const totalCreditsUsed = campaigns.reduce((sum, c) => sum + c.creditsUsed, 0);

      res.status(200).json({
        success: true,
        data: {
          summary: {
            totalCampaigns,
            activeCampaigns,
            totalImpressions,
            totalClicks,
            totalCreditsUsed,
            clickThroughRate: totalImpressions > 0 ? (totalClicks / totalImpressions * 100).toFixed(2) : '0.00'
          },
          campaigns
        }
      });
    } catch (error: any) {
      logger.error('Error getting ad analytics:', error);
      next(error);
    }
  }
}

