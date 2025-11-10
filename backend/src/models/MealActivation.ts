import { Schema, model, Document, Types } from 'mongoose';

export interface IMealActivation extends Document {
  _id: Types.ObjectId;
  userId: string;
  messId: string;
  mealId: string;
  mealPlanId: string;
  mealType: 'breakfast' | 'lunch' | 'dinner';
  activationDate: Date;
  activationTime: Date;
  qrCode: string;
  scannedBy?: string; // mess owner who scanned
  scannedAt?: Date;
  status: 'generated' | 'activated' | 'expired';
  expiresAt: Date;
  metadata?: {
    deviceInfo?: string;
    location?: string;
    scannerType?: 'user' | 'mess_owner';
  };
  createdAt: Date;
  updatedAt: Date;
}

const mealActivationSchema = new Schema<IMealActivation>({
  userId: {
    type: String,
    required: true,
    index: true
  },
  messId: {
    type: String,
    required: true,
    index: true
  },
  mealId: {
    type: String,
    required: true,
    index: true
  },
  mealPlanId: {
    type: String,
    required: true,
    index: true
  },
  mealType: {
    type: String,
    required: true,
    enum: ['breakfast', 'lunch', 'dinner'],
    index: true
  },
  activationDate: {
    type: Date,
    required: true,
    index: true
  },
  activationTime: {
    type: Date,
    required: true
  },
  qrCode: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  scannedBy: {
    type: String,
    index: true
  },
  scannedAt: {
    type: Date,
    index: true
  },
  status: {
    type: String,
    required: true,
    enum: ['generated', 'activated', 'expired'],
    default: 'generated',
    index: true
  },
  expiresAt: {
    type: Date,
    required: true,
    index: true
  },
  metadata: {
    deviceInfo: String,
    location: String,
    scannerType: {
      type: String,
      enum: ['user', 'mess_owner']
    }
  }
}, {
  timestamps: true
});

// Compound indexes for efficient queries
mealActivationSchema.index({ userId: 1, activationDate: -1 });
mealActivationSchema.index({ messId: 1, activationDate: -1 });
mealActivationSchema.index({ userId: 1, mealType: 1, activationDate: -1 });
mealActivationSchema.index({ qrCode: 1, status: 1 });
mealActivationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // Auto-delete expired records

// Pre-save middleware to handle expiration
mealActivationSchema.pre('save', function(next) {
  if (this.isNew && !this.expiresAt) {
    // Set expiration to end of day for the activation date
    const endOfDay = new Date(this.activationDate);
    endOfDay.setHours(23, 59, 59, 999);
    this.expiresAt = endOfDay;
  }
  next();
});

export default model<IMealActivation>('MealActivation', mealActivationSchema);
