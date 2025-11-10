import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IAdSettings extends Document {
  // Credit pricing
  creditPricePerUserAdCard: number; // Credits per user for displaying ad card
  creditPricePerUserMessaging: number; // Credits per user for mass messaging
  
  // Ad Card settings
  adCardDelaySeconds: number; // Delay before showing ad card on app open (default: 3)
  googleAdsEnabled: boolean; // Enable/disable Google Ads for Ad Card
  
  // Ad policies
  policies: {
    maxAdDurationDays: number; // Maximum duration for ad campaigns
    maxImageSizeMB: number; // Maximum image size
    maxVideoSizeMB: number; // Maximum video size
    allowedImageFormats: string[]; // e.g., ['jpg', 'png', 'webp']
    allowedVideoFormats: string[]; // e.g., ['mp4', 'webm']
    maxTitleLength: number;
    maxDescriptionLength: number;
    requireApproval: boolean; // Whether ads need admin approval
  };
  
  // Default timings
  defaultAdCardDisplayDuration: number; // Seconds to display ad card
  defaultMessagingWindowHours: number; // Hours for messaging window (default: 24)
  
  // Updated by
  updatedBy: mongoose.Types.ObjectId;
  updatedAt: Date;
  createdAt: Date;
}

export interface IAdSettingsModel extends Model<IAdSettings> {
  getCurrentSettings(): Promise<IAdSettings>;
}

const AdSettingsSchema: Schema = new Schema<IAdSettings>({
  creditPricePerUserAdCard: {
    type: Number,
    required: true,
    default: 1,
    min: 0
  },
  creditPricePerUserMessaging: {
    type: Number,
    required: true,
    default: 2,
    min: 0
  },
  adCardDelaySeconds: {
    type: Number,
    required: true,
    default: 3,
    min: 0,
    max: 60
  },
  googleAdsEnabled: {
    type: Boolean,
    default: false
  },
  policies: {
    maxAdDurationDays: {
      type: Number,
      default: 30,
      min: 1,
      max: 365
    },
    maxImageSizeMB: {
      type: Number,
      default: 5,
      min: 1,
      max: 50
    },
    maxVideoSizeMB: {
      type: Number,
      default: 50,
      min: 1,
      max: 500
    },
    allowedImageFormats: {
      type: [String],
      default: ['jpg', 'jpeg', 'png', 'webp']
    },
    allowedVideoFormats: {
      type: [String],
      default: ['mp4', 'webm']
    },
    maxTitleLength: {
      type: Number,
      default: 100
    },
    maxDescriptionLength: {
      type: Number,
      default: 500
    },
    requireApproval: {
      type: Boolean,
      default: false
    }
  },
  defaultAdCardDisplayDuration: {
    type: Number,
    default: 5,
    min: 1,
    max: 30
  },
  defaultMessagingWindowHours: {
    type: Number,
    default: 24,
    min: 1,
    max: 168 // 7 days max
  },
  updatedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { timestamps: true });

// Static method to get current settings
AdSettingsSchema.statics.getCurrentSettings = async function() {
  let settings = await this.findOne().sort({ createdAt: -1 });
  if (!settings) {
    // Create default settings
    const defaultUser = await mongoose.model('User').findOne({ role: 'admin' });
    settings = await this.create({
      creditPricePerUserAdCard: 1,
      creditPricePerUserMessaging: 2,
      adCardDelaySeconds: 3,
      googleAdsEnabled: false,
      policies: {
        maxAdDurationDays: 30,
        maxImageSizeMB: 5,
        maxVideoSizeMB: 50,
        allowedImageFormats: ['jpg', 'jpeg', 'png', 'webp'],
        allowedVideoFormats: ['mp4', 'webm'],
        maxTitleLength: 100,
        maxDescriptionLength: 500,
        requireApproval: false
      },
      defaultAdCardDisplayDuration: 5,
      defaultMessagingWindowHours: 24,
      updatedBy: defaultUser?._id || new mongoose.Types.ObjectId()
    });
  }
  return settings;
};

export default mongoose.model<IAdSettings, IAdSettingsModel>('AdSettings', AdSettingsSchema);

