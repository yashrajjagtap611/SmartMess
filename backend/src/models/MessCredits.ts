import mongoose, { Document, Schema } from 'mongoose';

export interface IMessCredits extends Document {
  messId: mongoose.Types.ObjectId;
  totalCredits: number;
  usedCredits: number;
  availableCredits: number;
  lastBillingDate?: Date;
  nextBillingDate?: Date;
  isTrialActive: boolean;
  trialStartDate?: Date;
  trialEndDate?: Date;
  trialCreditsUsed: number;
  monthlyUserCount: number;
  lastUserCountUpdate: Date;
  status: 'active' | 'suspended' | 'trial' | 'expired';
  autoRenewal: boolean;
  lastBillingAmount?: number;
  pendingBillAmount?: number;
  lowCreditThreshold: number;
  createdAt: Date;
  updatedAt: Date;
  
  // Instance methods
  addCredits(amount: number): Promise<void>;
  deductCredits(amount: number): Promise<void>;
  isTrialExpired(): boolean;
  hasActiveService(): boolean;
}

const MessCreditsSchema: Schema = new Schema({
  messId: {
    type: Schema.Types.ObjectId,
    ref: 'MessProfile',
    required: true,
    unique: true
  },
  totalCredits: {
    type: Number,
    default: 0,
    min: 0
  },
  usedCredits: {
    type: Number,
    default: 0,
    min: 0
  },
  availableCredits: {
    type: Number,
    default: 0,
    min: 0
  },
  lastBillingDate: {
    type: Date,
    default: null
  },
  nextBillingDate: {
    type: Date,
    default: null
  },
  isTrialActive: {
    type: Boolean,
    default: false
  },
  trialStartDate: {
    type: Date,
    default: null
  },
  trialEndDate: {
    type: Date,
    default: null
  },
  trialCreditsUsed: {
    type: Number,
    default: 0,
    min: 0
  },
  monthlyUserCount: {
    type: Number,
    default: 0,
    min: 0
  },
  lastUserCountUpdate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['active', 'suspended', 'trial', 'expired'],
    default: 'trial'
  },
  autoRenewal: {
    type: Boolean,
    default: false
  },
  lastBillingAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  pendingBillAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  lowCreditThreshold: {
    type: Number,
    default: 100,
    min: 0
  }
}, {
  timestamps: true
});

// Pre-save middleware to calculate available credits
MessCreditsSchema.pre('save', function(next) {
  this.availableCredits = Math.max(0, this.totalCredits - this.usedCredits);
  next();
});

// Index for efficient queries
MessCreditsSchema.index({ messId: 1 });
MessCreditsSchema.index({ status: 1 });
MessCreditsSchema.index({ nextBillingDate: 1 });
MessCreditsSchema.index({ trialEndDate: 1 });

// Instance methods
MessCreditsSchema.methods.deductCredits = function(amount: number) {
  if (this.availableCredits < amount) {
    throw new Error('Insufficient credits');
  }
  this.usedCredits += amount;
  this.availableCredits = Math.max(0, this.totalCredits - this.usedCredits);
  return this.save();
};

MessCreditsSchema.methods.addCredits = function(amount: number) {
  this.totalCredits += amount;
  this.availableCredits = Math.max(0, this.totalCredits - this.usedCredits);
  return this.save();
};

MessCreditsSchema.methods.isTrialExpired = function() {
  return this.isTrialActive && this.trialEndDate && new Date() > this.trialEndDate;
};

MessCreditsSchema.methods.canAccessPaidFeatures = function() {
  return this.availableCredits > 0 || (this.isTrialActive && !this.isTrialExpired());
};

// Static methods
MessCreditsSchema.statics.findByMessId = function(messId: string) {
  return this.findOne({ messId });
};

MessCreditsSchema.statics.findExpiredTrials = function() {
  return this.find({
    isTrialActive: true,
    trialEndDate: { $lt: new Date() }
  });
};

MessCreditsSchema.statics.findDueBilling = function() {
  return this.find({
    nextBillingDate: { $lte: new Date() },
    status: { $in: ['active', 'trial'] }
  });
};

export default mongoose.model<IMessCredits>('MessCredits', MessCreditsSchema);
