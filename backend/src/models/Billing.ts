import mongoose, { Document, Schema } from 'mongoose';

export interface IBilling extends Document {
  userId: mongoose.Types.ObjectId;
  messId: mongoose.Types.ObjectId;
  membershipId: mongoose.Types.ObjectId;
  billingPeriod: {
    startDate: Date;
    endDate: Date;
    period: 'daily' | 'weekly' | '15days' | 'monthly' | '3months' | '6months' | 'yearly';
  };
  subscription: {
    planId: mongoose.Types.ObjectId;
    planName: string;
    baseAmount: number;
    discountAmount: number;
    taxAmount: number;
    totalAmount: number;
  };
  payment: {
    status: 'pending' | 'paid' | 'failed' | 'overdue' | 'refunded' | 'cancelled';
    method?: 'upi' | 'online' | 'cash' | 'bank_transfer' | 'cheque';
    dueDate: Date;
    paidDate?: Date;
    transactionId?: string;
    gatewayResponse?: any;
  };
  adjustments: Array<{
    type: 'discount' | 'penalty' | 'leave_credit' | 'late_fee' | 'refund' | 'bonus';
    amount: number;
    reason: string;
    appliedBy: string;
    appliedDate: Date;
  }>;
  leaveCredits: Array<{
    leaveId: mongoose.Types.ObjectId;
    creditAmount: number;
    appliedDate: Date;
  }>;
  subscriptionExtension?: {
    extensionMeals: number;
    extensionDays: number;
    originalEndDate: Date;
    newEndDate: Date;
  };
  metadata: {
    generatedBy: 'system' | 'admin' | 'mess_owner';
    notes?: string;
    tags?: string[];
  };
  createdAt: Date;
  updatedAt: Date;
}

const BillingSchema = new Schema<IBilling>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  messId: {
    type: Schema.Types.ObjectId,
    ref: 'MessProfile',
    required: true,
    index: true
  },
  membershipId: {
    type: Schema.Types.ObjectId,
    ref: 'MessMembership',
    required: true,
    index: true
  },
  billingPeriod: {
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date,
      required: true
    },
    period: {
      type: String,
      enum: ['daily', 'weekly', '15days', 'monthly', '3months', '6months', 'yearly'],
      required: true
    }
  },
  subscription: {
    planId: {
      type: Schema.Types.ObjectId,
      ref: 'MealPlan',
      required: true
    },
    planName: {
      type: String,
      required: true
    },
    baseAmount: {
      type: Number,
      required: true,
      min: 0
    },
    discountAmount: {
      type: Number,
      default: 0,
      min: 0
    },
    taxAmount: {
      type: Number,
      required: true,
      min: 0
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0
    }
  },
  payment: {
    status: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'overdue', 'refunded', 'cancelled'],
      default: 'pending',
      required: true,
      index: true
    },
    method: {
      type: String,
      enum: ['upi', 'online', 'cash', 'bank_transfer', 'cheque']
    },
    dueDate: {
      type: Date,
      required: true,
      index: true
    },
    paidDate: {
      type: Date
    },
    transactionId: {
      type: String,
      index: true
    },
    gatewayResponse: {
      type: Schema.Types.Mixed
    }
  },
  adjustments: [{
    type: {
      type: String,
      enum: ['discount', 'penalty', 'leave_credit', 'late_fee', 'refund', 'bonus', 'subscription_extension'],
      required: true
    },
    amount: {
      type: Number,
      required: true
    },
    reason: {
      type: String,
      required: true
    },
    appliedBy: {
      type: String,
      required: true
    },
    appliedDate: {
      type: Date,
      default: Date.now
    }
  }],
  leaveCredits: [{
    leaveId: {
      type: Schema.Types.ObjectId,
      ref: 'UserLeave',
      required: true
    },
    creditAmount: {
      type: Number,
      required: true,
      min: 0
    },
    appliedDate: {
      type: Date,
      default: Date.now
    }
  }],
  subscriptionExtension: {
    extensionMeals: {
      type: Number,
      default: 0
    },
    extensionDays: {
      type: Number,
      default: 0
    },
    originalEndDate: {
      type: Date
    },
    newEndDate: {
      type: Date
    }
  },
  metadata: {
    generatedBy: {
      type: String,
      enum: ['system', 'admin', 'mess_owner'],
      required: true
    },
    notes: {
      type: String,
      maxlength: 1000
    },
    tags: [{
      type: String,
      maxlength: 50
    }]
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
BillingSchema.index({ userId: 1, messId: 1 });
BillingSchema.index({ 'payment.status': 1, 'payment.dueDate': 1 });
BillingSchema.index({ 'billingPeriod.startDate': 1, 'billingPeriod.endDate': 1 });
BillingSchema.index({ createdAt: -1 });

// Virtual for calculating days overdue
BillingSchema.virtual('daysOverdue').get(function(this: IBilling) {
  if (this.payment.status === 'overdue' && this.payment.dueDate) {
    const now = new Date();
    const dueDate = new Date(this.payment.dueDate);
    return Math.floor((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
  }
  return 0;
});

// Virtual for calculating final amount after adjustments
BillingSchema.virtual('finalAmount').get(function(this: IBilling) {
  const adjustmentTotal = this.adjustments.reduce((sum, adj) => {
    return adj.type === 'discount' || adj.type === 'leave_credit' || adj.type === 'refund'
      ? sum - adj.amount
      : sum + adj.amount;
  }, 0);
  
  return Math.max(0, this.subscription.totalAmount + adjustmentTotal);
});

// Pre-save middleware to update payment status based on due date
BillingSchema.pre('save', function(this: IBilling, next) {
  if (this.payment.status === 'pending' && this.payment.dueDate < new Date()) {
    this.payment.status = 'overdue';
  }
  next();
});

// Static method to find overdue bills
BillingSchema.statics.findOverdue = function() {
  return this.find({
    'payment.status': { $in: ['pending', 'overdue'] },
    'payment.dueDate': { $lt: new Date() }
  });
};

// Instance method to apply adjustment
BillingSchema.methods.applyAdjustment = function(
  type: string,
  amount: number,
  reason: string,
  appliedBy: string
) {
  this.adjustments.push({
    type,
    amount,
    reason,
    appliedBy,
    appliedDate: new Date()
  });
  
  // Recalculate total if needed
  return this.save();
};

// Instance method to mark as paid
BillingSchema.methods.markAsPaid = function(
  transactionId: string,
  paymentMethod: string,
  gatewayResponse?: any
) {
  this.payment.status = 'paid';
  this.payment.paidDate = new Date();
  this.payment.transactionId = transactionId;
  this.payment.method = paymentMethod;
  if (gatewayResponse) {
    this.payment.gatewayResponse = gatewayResponse;
  }
  
  return this.save();
};

const Billing = mongoose.model<IBilling>('Billing', BillingSchema);

export default Billing;
