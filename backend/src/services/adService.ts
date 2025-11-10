import mongoose from 'mongoose';
import { AdCampaign, AdSettings, AdAnalytics, AdCredit, User, MessMembership, MessProfile } from '../models';
import { AdCreditService } from './adCreditService';
import { ChatService } from './chatService';
import logger from '../utils/logger';

export interface CreateCampaignData {
  messId: string;
  campaignType: 'ad_card' | 'messaging' | 'both';
  title: string;
  description?: string;
  imageUrl?: string;
  videoUrl?: string;
  linkUrl?: string;
  callToAction?: string;
  audienceFilters: {
    messIds?: string[];
    roles?: string[];
    genders?: string[];
    ageRange?: { min?: number; max?: number };
    membershipStatus?: string[];
  };
  startDate: Date;
  endDate: Date;
}

export class AdService {
  /**
   * Get current ad settings
   */
  static async getSettings(): Promise<any> {
    try {
      const settings = await AdSettings.getCurrentSettings();
      return settings;
    } catch (error: any) {
      logger.error(`Error getting ad settings: ${error.message}`);
      throw error;
    }
  }

  /**
   * Calculate target user count based on filters
   */
  static async calculateTargetUserCount(filters: CreateCampaignData['audienceFilters']): Promise<number> {
    try {
      const query: any = {};

      // Filter by mess IDs
      if (filters.messIds && filters.messIds.length > 0) {
        const messMemberships = await MessMembership.find({
          messId: { $in: filters.messIds.map(id => new mongoose.Types.ObjectId(id)) },
          status: 'active'
        }).select('userId');
        const userIds = messMemberships.map(m => m.userId);
        if (userIds.length > 0) {
          query._id = { $in: userIds };
        } else {
          return 0; // No users in selected messes
        }
      }

      // Filter by roles
      if (filters.roles && filters.roles.length > 0) {
        query.role = { $in: filters.roles };
      }

      // Filter by gender
      if (filters.genders && filters.genders.length > 0) {
        query.gender = { $in: filters.genders };
      }

      // Filter by age range
      if (filters.ageRange) {
        const now = new Date();
        if (filters.ageRange.max) {
          const minBirthDate = new Date(now.getFullYear() - filters.ageRange.max - 1, now.getMonth(), now.getDate());
          query.dob = { ...query.dob, $gte: minBirthDate };
        }
        if (filters.ageRange.min) {
          const maxBirthDate = new Date(now.getFullYear() - filters.ageRange.min, now.getMonth(), now.getDate());
          query.dob = { ...query.dob, $lte: maxBirthDate };
        }
      }

      // Filter by membership status
      if (filters.membershipStatus && filters.membershipStatus.length > 0) {
        const memberships = await MessMembership.find({
          status: { $in: filters.membershipStatus }
        }).select('userId');
        const membershipUserIds = memberships.map(m => m.userId);
        if (membershipUserIds.length > 0) {
          if (query._id) {
            query._id = { $in: [...(Array.isArray(query._id.$in) ? query._id.$in : []), ...membershipUserIds] };
          } else {
            query._id = { $in: membershipUserIds };
          }
        } else {
          return 0;
        }
      }

      const count = await User.countDocuments(query);
      return count;
    } catch (error: any) {
      logger.error(`Error calculating target user count: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get audience list (name + profile photo only)
   */
  static async getAudienceList(filters: CreateCampaignData['audienceFilters']): Promise<any[]> {
    try {
      const query: any = {};

      // Apply same filters as calculateTargetUserCount
      if (filters.messIds && filters.messIds.length > 0) {
        const messMemberships = await MessMembership.find({
          messId: { $in: filters.messIds.map(id => new mongoose.Types.ObjectId(id)) },
          status: 'active'
        }).select('userId');
        const userIds = messMemberships.map(m => m.userId);
        if (userIds.length > 0) {
          query._id = { $in: userIds };
        } else {
          return [];
        }
      }

      if (filters.roles && filters.roles.length > 0) {
        query.role = { $in: filters.roles };
      }

      if (filters.genders && filters.genders.length > 0) {
        query.gender = { $in: filters.genders };
      }

      if (filters.ageRange) {
        const now = new Date();
        if (filters.ageRange.max) {
          const minBirthDate = new Date(now.getFullYear() - filters.ageRange.max - 1, now.getMonth(), now.getDate());
          query.dob = { ...query.dob, $gte: minBirthDate };
        }
        if (filters.ageRange.min) {
          const maxBirthDate = new Date(now.getFullYear() - filters.ageRange.min, now.getMonth(), now.getDate());
          query.dob = { ...query.dob, $lte: maxBirthDate };
        }
      }

      if (filters.membershipStatus && filters.membershipStatus.length > 0) {
        const memberships = await MessMembership.find({
          status: { $in: filters.membershipStatus }
        }).select('userId');
        const membershipUserIds = memberships.map(m => m.userId);
        if (membershipUserIds.length > 0) {
          if (query._id) {
            query._id = { $in: [...(Array.isArray(query._id.$in) ? query._id.$in : []), ...membershipUserIds] };
          } else {
            query._id = { $in: membershipUserIds };
          }
        } else {
          return [];
        }
      }

      // Only return name and profile picture
      const users = await User.find(query).select('firstName lastName profilePicture').limit(1000);
      
      return users.map(user => ({
        _id: user._id,
        name: `${user.firstName} ${user.lastName}`,
        profilePicture: user.profilePicture || null
      }));
    } catch (error: any) {
      logger.error(`Error getting audience list: ${error.message}`);
      throw error;
    }
  }

  /**
   * Create a new ad campaign
   */
  static async createCampaign(data: CreateCampaignData): Promise<any> {
    try {
      const settings = await this.getSettings();
      
      // Calculate target user count
      const targetUserCount = await this.calculateTargetUserCount(data.audienceFilters);
      
      if (targetUserCount === 0) {
        throw new Error('No users match the selected filters');
      }

      // Calculate credits required
      let creditsRequired = 0;
      if (data.campaignType === 'ad_card' || data.campaignType === 'both') {
        creditsRequired += targetUserCount * settings.creditPricePerUserAdCard;
      }
      if (data.campaignType === 'messaging' || data.campaignType === 'both') {
        creditsRequired += targetUserCount * settings.creditPricePerUserMessaging;
      }

      // Check if mess has sufficient credits
      const hasCredits = await AdCreditService.hasSufficientCredits(data.messId, creditsRequired);
      if (!hasCredits) {
        throw new Error(`Insufficient credits. Required: ${creditsRequired}`);
      }

      // Create campaign
      const campaign = await AdCampaign.create({
        ...data,
        audienceFilters: {
          ...data.audienceFilters,
          messIds: data.audienceFilters.messIds?.map(id => new mongoose.Types.ObjectId(id))
        },
        targetUserCount,
        creditsRequired,
        creditCostPerUser: data.campaignType === 'both' 
          ? settings.creditPricePerUserAdCard + settings.creditPricePerUserMessaging
          : data.campaignType === 'ad_card' 
            ? settings.creditPricePerUserAdCard 
            : settings.creditPricePerUserMessaging,
        status: settings.policies.requireApproval ? 'pending_approval' : 'draft'
      });

      // If approval not required, activate immediately
      if (!settings.policies.requireApproval) {
        await this.activateCampaign(campaign._id.toString());
      }

      return campaign;
    } catch (error: any) {
      logger.error(`Error creating campaign: ${error.message}`);
      throw error;
    }
  }

  /**
   * Activate a campaign
   */
  static async activateCampaign(campaignId: string): Promise<any> {
    try {
      const campaign = await AdCampaign.findById(campaignId);
      if (!campaign) {
        throw new Error('Campaign not found');
      }

      if (campaign.status !== 'draft' && campaign.status !== 'pending_approval') {
        throw new Error('Campaign cannot be activated');
      }

      // Deduct credits
      await AdCreditService.deductCredits(
        campaign.messId.toString(),
        campaign.creditsRequired,
        `Campaign: ${campaign.title}`
      );

      // Set messaging window if applicable
      if (campaign.campaignType === 'messaging' || campaign.campaignType === 'both') {
        const settings = await this.getSettings();
        const now = new Date();
        campaign.messagingWindowStart = now;
        campaign.messagingWindowEnd = new Date(now.getTime() + settings.defaultMessagingWindowHours * 60 * 60 * 1000);
        
        // Get mess owner user ID
        const messProfile = await MessProfile.findById(campaign.messId);
        if (!messProfile) {
          throw new Error('Mess profile not found');
        }
        
        // Find mess owner user
        const messOwner = await User.findOne({ messId: campaign.messId, role: 'mess-owner' });
        if (!messOwner) {
          throw new Error('Mess owner not found');
        }
        
        // Create chat room for messaging
        // Convert ObjectId[] to string[] for audience filters
        const audienceFiltersForList: CreateCampaignData['audienceFilters'] = {};
        
        // Only include properties that have values (not undefined)
        if (campaign.audienceFilters.messIds && campaign.audienceFilters.messIds.length > 0) {
          audienceFiltersForList.messIds = campaign.audienceFilters.messIds.map(id => id.toString());
        }
        if (campaign.audienceFilters.roles && campaign.audienceFilters.roles.length > 0) {
          audienceFiltersForList.roles = campaign.audienceFilters.roles;
        }
        if (campaign.audienceFilters.genders && campaign.audienceFilters.genders.length > 0) {
          audienceFiltersForList.genders = campaign.audienceFilters.genders;
        }
        if (campaign.audienceFilters.ageRange) {
          audienceFiltersForList.ageRange = campaign.audienceFilters.ageRange;
        }
        if (campaign.audienceFilters.membershipStatus && campaign.audienceFilters.membershipStatus.length > 0) {
          audienceFiltersForList.membershipStatus = campaign.audienceFilters.membershipStatus;
        }
        
        const audienceList = await this.getAudienceList(audienceFiltersForList);
        const participantIds = audienceList.map(u => u._id.toString());
        
        if (participantIds.length > 0) {
          const room = await ChatService.createRoom(messOwner._id.toString(), {
            name: `Ad: ${campaign.title}`,
            description: campaign.description || '',
            type: 'mess', // Use 'mess' type for advertising messaging
            participantIds: participantIds.slice(0, 100), // Limit to 100 participants
            messId: campaign.messId.toString()
          });
          
          campaign.messagingRoomId = room._id;
        }
      }

      campaign.status = 'active';
      campaign.creditsUsed = campaign.creditsRequired;
      await campaign.save();

      return campaign;
    } catch (error: any) {
      logger.error(`Error activating campaign: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get active ad card for user
   */
  static async getActiveAdCard(userId: string): Promise<any | null> {
    try {
      const user = await User.findById(userId);
      if (!user) {
        return null;
      }

      const now = new Date();
      
      // Find active campaigns that match user
      const campaigns = await AdCampaign.find({
        status: 'active',
        campaignType: { $in: ['ad_card', 'both'] },
        startDate: { $lte: now },
        endDate: { $gte: now }
      }).sort({ createdAt: -1 });

      // Check which campaign matches user's filters
      for (const campaign of campaigns) {
        const matches = await this.userMatchesFilters(userId, campaign.audienceFilters);
        if (matches) {
          // Check if user already saw this ad today (optional - can be removed for multiple impressions)
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const existingImpression = await AdAnalytics.findOne({
            campaignId: campaign._id,
            userId: userId,
            eventType: 'impression',
            timestamp: { $gte: today }
          });

          if (!existingImpression) {
            return {
              campaignId: campaign._id,
              headline: campaign.title,
              description: campaign.description,
              imageUrl: campaign.imageUrl,
              videoUrl: campaign.videoUrl,
              linkUrl: campaign.linkUrl,
              callToAction: campaign.callToAction || 'Learn More'
            };
          }
        }
      }

      return null;
    } catch (error: any) {
      logger.error(`Error getting active ad card: ${error.message}`);
      return null;
    }
  }

  /**
   * Check if user matches campaign filters
   */
  static async userMatchesFilters(userId: string, filters: any): Promise<boolean> {
    try {
      const user = await User.findById(userId);
      if (!user) return false;

      // Check role filter
      if (filters.roles && filters.roles.length > 0) {
        if (!filters.roles.includes(user.role)) {
          return false;
        }
      }

      // Check gender filter
      if (filters.genders && filters.genders.length > 0) {
        if (!filters.genders.includes(user.gender)) {
          return false;
        }
      }

      // Check age range
      if (filters.ageRange && user.dob) {
        const age = new Date().getFullYear() - new Date(user.dob).getFullYear();
        if (filters.ageRange.min && age < filters.ageRange.min) {
          return false;
        }
        if (filters.ageRange.max && age > filters.ageRange.max) {
          return false;
        }
      }

      // Check mess membership
      if (filters.messIds && filters.messIds.length > 0) {
        const membership = await MessMembership.findOne({
          userId: userId,
          messId: { $in: filters.messIds },
          status: 'active'
        });
        if (!membership) {
          return false;
        }
      }

      // Check membership status
      if (filters.membershipStatus && filters.membershipStatus.length > 0) {
        const membership = await MessMembership.findOne({
          userId: userId,
          status: { $in: filters.membershipStatus }
        });
        if (!membership) {
          return false;
        }
      }

      return true;
    } catch (error: any) {
      logger.error(`Error checking user matches filters: ${error.message}`);
      return false;
    }
  }

  /**
   * Record ad card impression
   */
  static async recordAdCardImpression(campaignId: string, userId: string, metadata?: any): Promise<void> {
    try {
      // Check if already recorded today
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const existing = await AdAnalytics.findOne({
        campaignId,
        userId,
        eventType: 'impression',
        adType: 'ad_card',
        timestamp: { $gte: today }
      });

      if (!existing) {
        await AdAnalytics.create({
          campaignId,
          userId,
          eventType: 'impression',
          adType: 'ad_card',
          metadata
        });

        // Update campaign impression count
        await AdCampaign.findByIdAndUpdate(campaignId, {
          $inc: { impressions: 1 }
        });
      }
    } catch (error: any) {
      logger.error(`Error recording impression: ${error.message}`);
    }
  }

  /**
   * Record ad card click
   */
  static async recordAdCardClick(campaignId: string, userId: string, metadata?: any): Promise<void> {
    try {
      await AdAnalytics.create({
        campaignId,
        userId,
        eventType: 'click',
        adType: 'ad_card',
        metadata
      });

      // Update campaign click count
      await AdCampaign.findByIdAndUpdate(campaignId, {
        $inc: { clicks: 1 }
      });
    } catch (error: any) {
      logger.error(`Error recording click: ${error.message}`);
    }
  }

  /**
   * Get campaigns for mess owner
   */
  /**
   * Get all campaigns (for admin)
   */
  static async getAllCampaigns(status?: string): Promise<any[]> {
    try {
      const query: any = {};
      
      if (status) {
        query.status = status;
      }

      const campaigns = await AdCampaign.find(query)
        .sort({ createdAt: -1 })
        .populate('messId', 'name logo')
        .lean();

      return campaigns.map((campaign: any) => {
        let messIdValue: string | undefined;
        
        if (campaign.messId) {
          if (typeof campaign.messId === 'object' && campaign.messId._id) {
            messIdValue = campaign.messId._id.toString();
          } else if (typeof campaign.messId === 'string') {
            messIdValue = campaign.messId;
          } else {
            messIdValue = campaign.messId.toString();
          }
        }

        return {
          ...campaign,
          _id: campaign._id.toString(),
          messId: messIdValue
        };
      });
    } catch (error: any) {
      logger.error(`Error getting all campaigns: ${error.message}`);
      throw error;
    }
  }

  static async getMessCampaigns(messId: string, status?: string): Promise<any[]> {
    try {
      const query: any = { messId };
      if (status) {
        query.status = status;
      }
      
      return await AdCampaign.find(query).sort({ createdAt: -1 });
    } catch (error: any) {
      logger.error(`Error getting mess campaigns: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get campaign analytics
   */
  static async getCampaignAnalytics(campaignId: string): Promise<any> {
    try {
      const campaign = await AdCampaign.findById(campaignId);
      if (!campaign) {
        throw new Error('Campaign not found');
      }

      const analytics = await AdAnalytics.aggregate([
        { $match: { campaignId: new mongoose.Types.ObjectId(campaignId) } },
        {
          $group: {
            _id: '$eventType',
            count: { $sum: 1 },
            uniqueUsers: { $addToSet: '$userId' }
          }
        }
      ]);

      return {
        campaign,
        analytics: {
          impressions: analytics.find(a => a._id === 'impression')?.count || 0,
          clicks: analytics.find(a => a._id === 'click')?.count || 0,
          messagesSent: analytics.find(a => a._id === 'message_sent')?.count || 0,
          uniqueImpressions: analytics.find(a => a._id === 'impression')?.uniqueUsers?.length || 0,
          uniqueClicks: analytics.find(a => a._id === 'click')?.uniqueUsers?.length || 0
        }
      };
    } catch (error: any) {
      logger.error(`Error getting campaign analytics: ${error.message}`);
      throw error;
    }
  }
}

