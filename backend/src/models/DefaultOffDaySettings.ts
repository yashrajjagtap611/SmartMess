import mongoose, { Document, Schema } from 'mongoose';

export interface IDefaultOffDaySettings extends Document {
  messId: mongoose.Types.ObjectId;
  pattern: 'weekly' | 'monthly';
  weeklySettings?: {
    dayOfWeek: number; // 0-6 (Sunday-Saturday)
    enabled: boolean;
    mealTypes: ('breakfast' | 'lunch' | 'dinner')[];
  };
  monthlySettings?: {
    daysOfMonth: number[]; // Array of days 1-31
    enabled: boolean;
    mealTypes: ('breakfast' | 'lunch' | 'dinner')[];
  };
  billingDeduction: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const DefaultOffDaySettingsSchema = new Schema<IDefaultOffDaySettings>({
  messId: {
    type: Schema.Types.ObjectId,
    ref: 'MessProfile',
    required: true,
    unique: true,
    index: true
  },
  pattern: {
    type: String,
    enum: ['weekly', 'monthly'],
    required: true
  },
  weeklySettings: {
    dayOfWeek: {
      type: Number,
      min: 0,
      max: 6,
      default: 0
    },
    enabled: {
      type: Boolean,
      default: false
    },
    mealTypes: [{
      type: String,
      enum: ['breakfast', 'lunch', 'dinner'],
      default: ['breakfast', 'lunch', 'dinner']
    }]
  },
  monthlySettings: {
    daysOfMonth: [{
      type: Number,
      min: 1,
      max: 31
    }],
    enabled: {
      type: Boolean,
      default: false
    },
    mealTypes: [{
      type: String,
      enum: ['breakfast', 'lunch', 'dinner'],
      default: ['breakfast', 'lunch', 'dinner']
    }]
  },
  billingDeduction: {
    type: Boolean,
    default: false
  },
}, {
  timestamps: true
});

// Index for better query performance
DefaultOffDaySettingsSchema.index({ messId: 1 });

const DefaultOffDaySettings = mongoose.model<IDefaultOffDaySettings>('DefaultOffDaySettings', DefaultOffDaySettingsSchema);

export default DefaultOffDaySettings;
