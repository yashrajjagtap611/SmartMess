import apiClient from '../api';

export interface AdSettings {
  creditPricePerUserAdCard: number;
  creditPricePerUserMessaging: number;
  adCardDelaySeconds: number;
  googleAdsEnabled: boolean;
  policies: {
    maxAdDurationDays: number;
    maxImageSizeMB: number;
    maxVideoSizeMB: number;
    allowedImageFormats: string[];
    allowedVideoFormats: string[];
    maxTitleLength: number;
    maxDescriptionLength: number;
    requireApproval: boolean;
  };
  defaultAdCardDisplayDuration: number;
  defaultMessagingWindowHours: number;
}

export interface AudienceFilters {
  messIds?: string[];
  roles?: string[];
  genders?: string[];
  ageRange?: {
    min?: number;
    max?: number;
  };
  membershipStatus?: string[];
}

export interface AdCampaign {
  _id: string;
  messId: string;
  campaignType: 'ad_card' | 'messaging' | 'both';
  title: string;
  description?: string;
  imageUrl?: string;
  videoUrl?: string;
  linkUrl?: string;
  callToAction?: string;
  audienceFilters: AudienceFilters;
  targetUserCount: number;
  actualReach: number;
  status: 'draft' | 'pending_approval' | 'active' | 'paused' | 'completed' | 'rejected';
  startDate: string;
  endDate: string;
  creditsRequired: number;
  creditsUsed: number;
  creditCostPerUser: number;
  messagingWindowStart?: string;
  messagingWindowEnd?: string;
  messagingRoomId?: string;
  approvedBy?: string;
  approvedAt?: string;
  rejectionReason?: string;
  impressions: number;
  clicks: number;
  messagesSent: number;
  createdAt: string;
  updatedAt: string;
}

export interface AdCard {
  campaignId: string;
  headline: string;
  description?: string;
  imageUrl?: string;
  videoUrl?: string;
  linkUrl?: string;
  callToAction?: string;
}

export interface AdCredit {
  _id: string;
  messId: string;
  totalCredits: number;
  usedCredits: number;
  availableCredits: number;
}

export interface AudienceMember {
  _id: string;
  name: string;
  profilePicture: string | null;
}

export interface CreateCampaignData {
  campaignType: 'ad_card' | 'messaging' | 'both';
  title: string;
  description?: string;
  imageUrl?: string;
  videoUrl?: string;
  linkUrl?: string;
  callToAction?: string;
  audienceFilters: AudienceFilters;
  startDate: string;
  endDate: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data: T;
}

class AdService {
  // ===== Settings =====
  
  async getSettings(): Promise<ApiResponse<AdSettings>> {
    try {
      const response = await apiClient.get('/ads/settings');
      return response.data;
    } catch (error: any) {
      console.error('Error fetching ad settings:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch ad settings');
    }
  }

  // ===== Ad Card =====
  
  async getActiveAdCard(): Promise<ApiResponse<AdCard | null>> {
    try {
      const response = await apiClient.get('/ads/ad-card/active');
      return response.data;
    } catch (error: any) {
      console.error('Error fetching active ad card:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch active ad card');
    }
  }

  async recordAdCardImpression(campaignId: string): Promise<void> {
    try {
      await apiClient.post('/ads/ad-card/impression', { campaignId });
    } catch (error: any) {
      console.error('Error recording impression:', error);
      // Don't throw - this is not critical
    }
  }

  async recordAdCardClick(campaignId: string): Promise<void> {
    try {
      await apiClient.post('/ads/ad-card/click', { campaignId });
    } catch (error: any) {
      console.error('Error recording click:', error);
      // Don't throw - this is not critical
    }
  }

  // ===== Credits =====
  
  async getCredits(): Promise<ApiResponse<AdCredit>> {
    try {
      const response = await apiClient.get('/ads/credits');
      return response.data;
    } catch (error: any) {
      console.error('Error fetching ad credits:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch ad credits');
    }
  }

  async purchaseCredits(amount: number, paymentReference?: string): Promise<ApiResponse<AdCredit>> {
    try {
      const response = await apiClient.post('/ads/credits/purchase', {
        amount,
        paymentReference
      });
      return response.data;
    } catch (error: any) {
      console.error('Error purchasing ad credits:', error);
      throw new Error(error.response?.data?.message || 'Failed to purchase ad credits');
    }
  }

  // ===== Campaigns =====
  
  async calculateTargetUserCount(filters: AudienceFilters): Promise<ApiResponse<{ targetUserCount: number }>> {
    try {
      const response = await apiClient.post('/ads/campaigns/calculate-target', {
        audienceFilters: filters
      });
      return response.data;
    } catch (error: any) {
      console.error('Error calculating target user count:', error);
      throw new Error(error.response?.data?.message || 'Failed to calculate target user count');
    }
  }

  async getAudienceList(filters: AudienceFilters): Promise<ApiResponse<AudienceMember[]>> {
    try {
      const response = await apiClient.post('/ads/campaigns/audience', {
        audienceFilters: filters
      });
      return response.data;
    } catch (error: any) {
      console.error('Error fetching audience list:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch audience list');
    }
  }

  async createCampaign(data: CreateCampaignData): Promise<ApiResponse<AdCampaign>> {
    try {
      const response = await apiClient.post('/ads/campaigns', data);
      return response.data;
    } catch (error: any) {
      console.error('Error creating campaign:', error);
      throw new Error(error.response?.data?.message || 'Failed to create campaign');
    }
  }

  async getCampaigns(status?: string): Promise<ApiResponse<AdCampaign[]>> {
    try {
      const params = status ? { status } : {};
      const response = await apiClient.get('/ads/campaigns', { params });
      return response.data;
    } catch (error: any) {
      console.error('Error fetching campaigns:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch campaigns');
    }
  }

  async getCampaignAnalytics(campaignId: string): Promise<ApiResponse<any>> {
    try {
      const response = await apiClient.get(`/ads/campaigns/${campaignId}/analytics`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching campaign analytics:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch campaign analytics');
    }
  }
}

export const adService = new AdService();


