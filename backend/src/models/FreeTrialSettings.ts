import mongoose, { Document, Schema } from 'mongoose';

export interface IFreeTrialSettings extends Document {
  isGloballyEnabled: boolean;
  defaultTrialDurationDays: number;
  trialCredits: number;
  allowedFeatures: string[];
  restrictedFeatures: string[];
  maxTrialsPerMess: number;
  cooldownPeriodDays: number;
  autoActivateOnRegistration: boolean;
  requiresApproval: boolean;
  notificationSettings: {
    sendWelcomeEmail: boolean;
    sendReminderEmails: boolean;
    reminderDays: number[];
    sendExpiryNotification: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
  updatedBy: mongoose.Types.ObjectId;
}

const FreeTrialSettingsSchema: Schema = new Schema({
  isGloballyEnabled: {
    type: Boolean,
    default: true
  },
  defaultTrialDurationDays: {
    type: Number,
    default: 7,
    min: 1,
    max: 90
  },
  trialCredits: {
    type: Number,
    default: 100,
    min: 0
  },
  allowedFeatures: [{
    type: String,
    trim: true
  }],
  restrictedFeatures: [{
    type: String,
    trim: true
  }],
  maxTrialsPerMess: {
    type: Number,
    default: 1,
    min: 1,
    max: 5
  },
  cooldownPeriodDays: {
    type: Number,
    default: 30,
    min: 0
  },
  autoActivateOnRegistration: {
    type: Boolean,
    default: true
  },
  requiresApproval: {
    type: Boolean,
    default: false
  },
  notificationSettings: {
    sendWelcomeEmail: {
      type: Boolean,
      default: true
    },
    sendReminderEmails: {
      type: Boolean,
      default: true
    },
    reminderDays: [{
      type: Number,
      min: 1
    }],
    sendExpiryNotification: {
      type: Boolean,
      default: true
    }
  },
  updatedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Ensure only one settings document exists
FreeTrialSettingsSchema.index({}, { unique: true });

// Default reminder days
FreeTrialSettingsSchema.pre('save', function(next) {
  if (!this.notificationSettings.reminderDays || this.notificationSettings.reminderDays.length === 0) {
    this.notificationSettings.reminderDays = [3, 1]; // 3 days and 1 day before expiry
  }
  next();
});

// Static method to get current settings
FreeTrialSettingsSchema.statics.getCurrentSettings = async function() {
  let settings = await this.findOne();
  if (!settings) {
    // Create default settings if none exist
    settings = await this.create({
      isGloballyEnabled: true,
      defaultTrialDurationDays: 7,
      trialCredits: 100,
      allowedFeatures: ['basic_features', 'limited_users'],
      restrictedFeatures: ['premium_analytics', 'bulk_operations'],
      maxTrialsPerMess: 1,
      cooldownPeriodDays: 30,
      autoActivateOnRegistration: true,
      requiresApproval: false,
      notificationSettings: {
        sendWelcomeEmail: true,
        sendReminderEmails: true,
        reminderDays: [3, 1],
        sendExpiryNotification: true
      },
      updatedBy: new mongoose.Types.ObjectId() // Will be set by admin
    });
  }
  return settings;
};

// Static method to update settings
FreeTrialSettingsSchema.statics.updateSettings = function(updates: Partial<IFreeTrialSettings>, updatedBy: string) {
  return this.findOneAndUpdate(
    {},
    { ...updates, updatedBy },
    { new: true, upsert: true }
  );
};

export default mongoose.model<IFreeTrialSettings>('FreeTrialSettings', FreeTrialSettingsSchema);
