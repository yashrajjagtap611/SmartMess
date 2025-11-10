import mongoose, { Document, Schema } from 'mongoose';

export interface ICreditPurchasePlan extends Document {
  name: string;
  description: string;
  baseCredits: number;
  bonusCredits: number;
  totalCredits: number;
  price: number;
  currency: string;
  isActive: boolean;
  isPopular: boolean;
  features: string[];
  validityDays?: number;
  createdAt: Date;
  updatedAt: Date;
  createdBy: mongoose.Types.ObjectId;
  updatedBy: mongoose.Types.ObjectId;
}

const CreditPurchasePlanSchema: Schema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
  baseCredits: {
    type: Number,
    required: true,
    min: 1
  },
  bonusCredits: {
    type: Number,
    default: 0,
    min: 0
  },
  totalCredits: {
    type: Number,
    required: true,
    min: 1
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: 'INR',
    enum: ['INR', 'USD', 'EUR']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isPopular: {
    type: Boolean,
    default: false
  },
  features: [{
    type: String,
    trim: true
  }],
  validityDays: {
    type: Number,
    min: 1,
    default: null
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Ensure totalCredits is set before validation so required validation passes
CreditPurchasePlanSchema.pre('validate', function(next) {
  // @ts-ignore accessing document fields
  const base = this.baseCredits || 0;
  // @ts-ignore accessing document fields
  const bonus = this.bonusCredits || 0;
  // @ts-ignore assigning computed field before validation
  this.totalCredits = base + bonus;
  next();
});

// Index for efficient queries
CreditPurchasePlanSchema.index({ isActive: 1, price: 1 });
CreditPurchasePlanSchema.index({ isPopular: 1 });

// Static method to get active plans
CreditPurchasePlanSchema.statics.getActivePlans = function() {
  return this.find({ isActive: true }).sort({ price: 1 });
};

// Static method to get popular plans
CreditPurchasePlanSchema.statics.getPopularPlans = function() {
  return this.find({ isActive: true, isPopular: true }).sort({ price: 1 });
};

export default mongoose.model<ICreditPurchasePlan>('CreditPurchasePlan', CreditPurchasePlanSchema);
