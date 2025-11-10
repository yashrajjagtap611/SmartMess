import mongoose, { Document, Schema } from 'mongoose';

export interface ICreditTransaction extends Document {
  messId: mongoose.Types.ObjectId;
  type: 'purchase' | 'deduction' | 'bonus' | 'refund' | 'adjustment' | 'trial';
  amount: number;
  description: string;
  referenceId?: string;
  planId?: mongoose.Types.ObjectId;
  billingPeriod?: {
    startDate: Date;
    endDate: Date;
  };
  userCount?: number;
  creditsPerUser?: number;
  metadata?: Record<string, any>;
  processedBy?: mongoose.Types.ObjectId;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}

const CreditTransactionSchema: Schema = new Schema({
  messId: {
    type: Schema.Types.ObjectId,
    ref: 'MessProfile',
    required: true
  },
  type: {
    type: String,
    enum: ['purchase', 'deduction', 'bonus', 'refund', 'adjustment', 'trial'],
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
  referenceId: {
    type: String,
    trim: true,
    sparse: true
  },
  planId: {
    type: Schema.Types.ObjectId,
    ref: 'CreditPurchasePlan',
    default: null
  },
  billingPeriod: {
    startDate: {
      type: Date,
      default: null
    },
    endDate: {
      type: Date,
      default: null
    }
  },
  userCount: {
    type: Number,
    min: 0,
    default: null
  },
  creditsPerUser: {
    type: Number,
    min: 0,
    default: null
  },
  metadata: {
    type: Schema.Types.Mixed,
    default: {}
  },
  processedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'cancelled'],
    default: 'pending'
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
CreditTransactionSchema.index({ messId: 1, createdAt: -1 });
CreditTransactionSchema.index({ type: 1, status: 1 });
CreditTransactionSchema.index({ referenceId: 1 });
CreditTransactionSchema.index({ createdAt: -1 });

// Static methods
CreditTransactionSchema.statics.findByMessId = function(messId: string, limit = 50) {
  return this.find({ messId })
    .populate('planId', 'name baseCredits bonusCredits price')
    .populate('processedBy', 'name email')
    .sort({ createdAt: -1 })
    .limit(limit);
};

CreditTransactionSchema.statics.getMonthlyStats = function(messId: string, year: number, month: number) {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59);
  
  return this.aggregate([
    {
      $match: {
        messId: new mongoose.Types.ObjectId(messId),
        createdAt: { $gte: startDate, $lte: endDate },
        status: 'completed'
      }
    },
    {
      $group: {
        _id: '$type',
        totalAmount: { $sum: '$amount' },
        count: { $sum: 1 }
      }
    }
  ]);
};

CreditTransactionSchema.statics.createPurchaseTransaction = function(data: {
  messId: string;
  planId: string;
  amount: number;
  referenceId?: string;
  processedBy?: string;
}) {
  return this.create({
    messId: data.messId,
    planId: data.planId,
    type: 'purchase',
    amount: data.amount,
    description: `Credit purchase - Plan ID: ${data.planId}`,
    referenceId: data.referenceId,
    processedBy: data.processedBy,
    status: 'completed'
  });
};

CreditTransactionSchema.statics.createBillingTransaction = function(data: {
  messId: string;
  amount: number;
  userCount: number;
  creditsPerUser: number;
  billingPeriod: { startDate: Date; endDate: Date };
}) {
  return this.create({
    messId: data.messId,
    type: 'deduction',
    amount: -Math.abs(data.amount),
    description: `Monthly billing for ${data.userCount} users at ${data.creditsPerUser} credits/user`,
    userCount: data.userCount,
    creditsPerUser: data.creditsPerUser,
    billingPeriod: data.billingPeriod,
    status: 'completed'
  });
};

export default mongoose.model<ICreditTransaction>('CreditTransaction', CreditTransactionSchema);
