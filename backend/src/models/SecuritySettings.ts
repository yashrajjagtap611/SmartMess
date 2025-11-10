import mongoose, { Document, Schema } from 'mongoose';

export interface ISecuritySettings extends Document {
  userId: mongoose.Types.ObjectId;
  privacy: {
    profileVisible: boolean;
    contactVisible: boolean;
    ratingsVisible: boolean;
  };
  security: {
    twoFactorEnabled: boolean;
    loginNotifications: boolean;
    suspiciousActivityAlerts: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

const securitySettingsSchema = new Schema<ISecuritySettings>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    unique: true
  },
  privacy: {
    profileVisible: {
      type: Boolean,
      default: true
    },
    contactVisible: {
      type: Boolean,
      default: true
    },
    ratingsVisible: {
      type: Boolean,
      default: true
    }
  },
  security: {
    twoFactorEnabled: {
      type: Boolean,
      default: false
    },
    loginNotifications: {
      type: Boolean,
      default: true
    },
    suspiciousActivityAlerts: {
      type: Boolean,
      default: true
    }
  }
}, {
  timestamps: true
});

// Create indexes for better performance
securitySettingsSchema.index({ userId: 1 });

const SecuritySettings = mongoose.model<ISecuritySettings>('SecuritySettings', securitySettingsSchema);

export default SecuritySettings;

