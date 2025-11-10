import { Request, Response, NextFunction } from 'express';
import { AdService } from '../services/adService';
import { AdCreditService } from '../services/adCreditService';
import { MessProfile } from '../models';
import logger from '../utils/logger';

export class AdController {
  /**
   * Get ad settings (public)
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
   * Get active ad card for current user
   */
  static async getActiveAdCard(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user._id.toString();
      const adCard = await AdService.getActiveAdCard(userId);
      
      res.status(200).json({
        success: true,
        data: adCard
      });
    } catch (error: any) {
      logger.error('Error getting active ad card:', error);
      next(error);
    }
  }

  /**
   * Record ad card impression
   */
  static async recordAdCardImpression(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user._id.toString();
      const { campaignId } = req.body;
      
      if (!campaignId) {
        res.status(400).json({
          success: false,
          message: 'Campaign ID is required'
        });
        return;
      }

      await AdService.recordAdCardImpression(campaignId, userId, {
        userAgent: req.headers['user-agent'],
        ip: req.ip
      });

      res.status(200).json({
        success: true,
        message: 'Impression recorded'
      });
    } catch (error: any) {
      logger.error('Error recording impression:', error);
      next(error);
    }
  }

  /**
   * Record ad card click
   */
  static async recordAdCardClick(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user._id.toString();
      const { campaignId } = req.body;
      
      if (!campaignId) {
        res.status(400).json({
          success: false,
          message: 'Campaign ID is required'
        });
        return;
      }

      await AdService.recordAdCardClick(campaignId, userId, {
        userAgent: req.headers['user-agent'],
        ip: req.ip
      });

      res.status(200).json({
        success: true,
        message: 'Click recorded'
      });
    } catch (error: any) {
      logger.error('Error recording click:', error);
      next(error);
    }
  }

  /**
   * Get ad credits balance (for mess owner)
   */
  static async getCredits(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = (req as any).user;
      if (user.role !== 'mess-owner') {
        res.status(403).json({
          success: false,
          message: 'Only mess owners can access ad credits'
        });
        return;
      }

      // Get messId from MessProfile (mess owners don't have messId on User model)
      const messProfile = await MessProfile.findOne({ userId: user._id });
      if (!messProfile) {
        res.status(400).json({
          success: false,
          message: 'Mess profile not found. Please create a mess profile first.'
        });
        return;
      }
      const messId = messProfile._id.toString();

      const credits = await AdCreditService.getCredits(messId);
      
      res.status(200).json({
        success: true,
        data: credits
      });
    } catch (error: any) {
      logger.error('Error getting ad credits:', error);
      next(error);
    }
  }

  /**
   * Purchase ad credits
   */
  static async purchaseCredits(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = (req as any).user;
      if (user.role !== 'mess-owner') {
        res.status(403).json({
          success: false,
          message: 'Only mess owners can purchase ad credits'
        });
        return;
      }

      const { amount, paymentReference } = req.body;
      
      if (!amount || amount <= 0) {
        res.status(400).json({
          success: false,
          message: 'Valid credit amount is required'
        });
        return;
      }

      // Get messId from MessProfile
      const messProfile = await MessProfile.findOne({ userId: user._id });
      if (!messProfile) {
        res.status(400).json({
          success: false,
          message: 'Mess profile not found. Please create a mess profile first.'
        });
        return;
      }
      const messId = messProfile._id.toString();

      const credits = await AdCreditService.purchaseCredits(messId, amount, paymentReference);
      
      res.status(200).json({
        success: true,
        data: credits,
        message: `Successfully purchased ${amount} ad credits`
      });
    } catch (error: any) {
      logger.error('Error purchasing ad credits:', error);
      next(error);
    }
  }

  /**
   * Calculate target user count for filters
   */
  static async calculateTargetUserCount(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { audienceFilters } = req.body;
      
      if (!audienceFilters) {
        res.status(400).json({
          success: false,
          message: 'Audience filters are required'
        });
        return;
      }

      const count = await AdService.calculateTargetUserCount(audienceFilters);
      
      res.status(200).json({
        success: true,
        data: { targetUserCount: count }
      });
    } catch (error: any) {
      logger.error('Error calculating target user count:', error);
      next(error);
    }
  }

  /**
   * Get audience list (name + profile photo only)
   */
  static async getAudienceList(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = (req as any).user;
      if (user.role !== 'mess-owner') {
        res.status(403).json({
          success: false,
          message: 'Only mess owners can view audience lists'
        });
        return;
      }

      const { audienceFilters } = req.body;
      
      if (!audienceFilters) {
        res.status(400).json({
          success: false,
          message: 'Audience filters are required'
        });
        return;
      }

      const audience = await AdService.getAudienceList(audienceFilters);
      
      res.status(200).json({
        success: true,
        data: audience
      });
    } catch (error: any) {
      logger.error('Error getting audience list:', error);
      next(error);
    }
  }

  /**
   * Create ad campaign
   */
  static async createCampaign(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = (req as any).user;
      
      // Allow both mess owners and admins to create campaigns
      if (user.role !== 'mess-owner' && user.role !== 'admin') {
        res.status(403).json({
          success: false,
          message: 'Only mess owners and admins can create ad campaigns'
        });
        return;
      }

      let messId: string | undefined;

      // For mess owners, get messId from MessProfile
      if (user.role === 'mess-owner') {
        const messProfile = await MessProfile.findOne({ userId: user._id });
        if (!messProfile) {
          res.status(400).json({
            success: false,
            message: 'Mess profile not found. Please create a mess profile first.'
          });
          return;
        }
        messId = messProfile._id.toString();
      }
      // For admins, messId can be optional or from request body
      else if (user.role === 'admin') {
        messId = req.body.messId; // Admin can specify messId or leave it for platform-wide campaigns
      }

      const campaignData = {
        ...req.body,
        ...(messId && { messId })
      };

      const campaign = await AdService.createCampaign(campaignData);
      
      res.status(201).json({
        success: true,
        data: campaign,
        message: 'Campaign created successfully'
      });
    } catch (error: any) {
      logger.error('Error creating campaign:', error);
      next(error);
    }
  }

  /**
   * Get campaigns for mess owner or admin
   */
  static async getCampaigns(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = (req as any).user;
      if (user.role !== 'mess-owner' && user.role !== 'admin') {
        res.status(403).json({
          success: false,
          message: 'Only mess owners and admins can view campaigns'
        });
        return;
      }

      const { status } = req.query;
      let campaigns;

      // For mess owners, get campaigns by messId
      if (user.role === 'mess-owner') {
        const messProfile = await MessProfile.findOne({ userId: user._id });
        if (!messProfile) {
          res.status(400).json({
            success: false,
            message: 'Mess profile not found. Please create a mess profile first.'
          });
          return;
        }
        const messId = messProfile._id.toString();
        campaigns = await AdService.getMessCampaigns(messId, status as string);
      } 
      // For admins, get all campaigns
      else if (user.role === 'admin') {
        campaigns = await AdService.getAllCampaigns(status as string);
      }
      
      res.status(200).json({
        success: true,
        data: campaigns
      });
    } catch (error: any) {
      logger.error('Error getting campaigns:', error);
      next(error);
    }
  }

  /**
   * Get campaign analytics
   */
  static async getCampaignAnalytics(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = (req as any).user;
      if (user.role !== 'mess-owner') {
        res.status(403).json({
          success: false,
          message: 'Only mess owners can view campaign analytics'
        });
        return;
      }

      const { campaignId } = req.params;
      if (!campaignId) {
        res.status(400).json({
          success: false,
          message: 'Campaign ID is required'
        });
        return;
      }

      const analytics = await AdService.getCampaignAnalytics(campaignId);
      
      res.status(200).json({
        success: true,
        data: analytics
      });
    } catch (error: any) {
      logger.error('Error getting campaign analytics:', error);
      next(error);
    }
  }
}

