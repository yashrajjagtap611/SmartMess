import mongoose, { Document, Schema } from 'mongoose';

export interface IAdAnalytics extends Document {
  campaignId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId; // User who saw/clicked the ad
  eventType: 'impression' | 'click' | 'message_sent' | 'message_read';
  adType: 'ad_card' | 'messaging';
  timestamp: Date;
  metadata?: {
    deviceType?: string;
    userAgent?: string;
    referrer?: string;
    [key: string]: any;
  };
}

const AdAnalyticsSchema: Schema = new Schema<IAdAnalytics>({
  campaignId: {
    type: Schema.Types.ObjectId,
    ref: 'AdCampaign',
    required: true
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  eventType: {
    type: String,
    enum: ['impression', 'click', 'message_sent', 'message_read'],
    required: true
  },
  adType: {
    type: String,
    enum: ['ad_card', 'messaging'],
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  metadata: {
    type: Schema.Types.Mixed,
    default: {}
  }
}, { timestamps: true });

// Indexes for efficient queries
AdAnalyticsSchema.index({ campaignId: 1, timestamp: -1 });
AdAnalyticsSchema.index({ userId: 1, timestamp: -1 });
AdAnalyticsSchema.index({ eventType: 1, timestamp: -1 });
AdAnalyticsSchema.index({ campaignId: 1, userId: 1, eventType: 1 }); // Prevent duplicate impressions

export default mongoose.model<IAdAnalytics>('AdAnalytics', AdAnalyticsSchema);


