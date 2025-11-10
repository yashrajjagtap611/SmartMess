import mongoose, { Document, Schema } from 'mongoose';

export interface IAdCampaign extends Document {
  messId: mongoose.Types.ObjectId; // Advertiser (mess owner)
  campaignType: 'ad_card' | 'messaging' | 'both';
  
  // Ad content
  title: string;
  description?: string;
  imageUrl?: string;
  videoUrl?: string;
  linkUrl?: string; // Optional link for ad card
  callToAction?: string; // CTA button text
  
  // Audience filters (multi-select)
  audienceFilters: {
    messIds?: mongoose.Types.ObjectId[]; // Target specific messes
    roles?: string[]; // Target specific roles
    genders?: string[]; // Target specific genders
    ageRange?: {
      min?: number;
      max?: number;
    };
    membershipStatus?: string[]; // e.g., ['active', 'pending']
    // Add more filters as needed
  };
  
  // Targeting
  targetUserCount: number; // Estimated number of users matching filters
  actualReach: number; // Actual number of users reached
  
  // Status and scheduling
  status: 'draft' | 'pending_approval' | 'active' | 'paused' | 'completed' | 'rejected';
  startDate: Date;
  endDate: Date;
  
  // Credit costs
  creditsRequired: number; // Total credits needed
  creditsUsed: number; // Credits actually used
  creditCostPerUser: number; // Cost per user at time of creation
  
  // Messaging window (for messaging campaigns)
  messagingWindowStart?: Date;
  messagingWindowEnd?: Date;
  messagingRoomId?: mongoose.Types.ObjectId; // Reference to chat room for messaging
  
  // Approval
  approvedBy?: mongoose.Types.ObjectId;
  approvedAt?: Date;
  rejectionReason?: string;
  
  // Analytics
  impressions: number;
  clicks: number;
  messagesSent: number;
  
  createdAt: Date;
  updatedAt: Date;
}

const AdCampaignSchema: Schema = new Schema<IAdCampaign>({
  messId: {
    type: Schema.Types.ObjectId,
    ref: 'MessProfile',
    required: true
  },
  campaignType: {
    type: String,
    enum: ['ad_card', 'messaging', 'both'],
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500
  },
  imageUrl: {
    type: String
  },
  videoUrl: {
    type: String
  },
  linkUrl: {
    type: String
  },
  callToAction: {
    type: String,
    maxlength: 50
  },
  audienceFilters: {
    messIds: [{
      type: Schema.Types.ObjectId,
      ref: 'MessProfile'
    }],
    roles: [{
      type: String,
      enum: ['user', 'mess-owner', 'admin']
    }],
    genders: [{
      type: String,
      enum: ['male', 'female', 'other']
    }],
    ageRange: {
      min: { type: Number, min: 0, max: 150 },
      max: { type: Number, min: 0, max: 150 }
    },
    membershipStatus: [{
      type: String,
      enum: ['active', 'pending', 'inactive', 'cancelled']
    }]
  },
  targetUserCount: {
    type: Number,
    default: 0,
    min: 0
  },
  actualReach: {
    type: Number,
    default: 0,
    min: 0
  },
  status: {
    type: String,
    enum: ['draft', 'pending_approval', 'active', 'paused', 'completed', 'rejected'],
    default: 'draft'
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  creditsRequired: {
    type: Number,
    required: true,
    min: 0
  },
  creditsUsed: {
    type: Number,
    default: 0,
    min: 0
  },
  creditCostPerUser: {
    type: Number,
    required: true,
    min: 0
  },
  messagingWindowStart: {
    type: Date
  },
  messagingWindowEnd: {
    type: Date
  },
  messagingRoomId: {
    type: Schema.Types.ObjectId,
    ref: 'ChatRoom'
  },
  approvedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: {
    type: Date
  },
  rejectionReason: {
    type: String
  },
  impressions: {
    type: Number,
    default: 0,
    min: 0
  },
  clicks: {
    type: Number,
    default: 0,
    min: 0
  },
  messagesSent: {
    type: Number,
    default: 0,
    min: 0
  }
}, { timestamps: true });

// Indexes
AdCampaignSchema.index({ messId: 1, status: 1 });
AdCampaignSchema.index({ status: 1, startDate: 1, endDate: 1 });
AdCampaignSchema.index({ campaignType: 1, status: 1 });

export default mongoose.model<IAdCampaign>('AdCampaign', AdCampaignSchema);


