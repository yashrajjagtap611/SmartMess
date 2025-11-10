import mongoose, { Document, Schema } from 'mongoose';

export interface ITransaction extends Document {
  transactionId: string;
  userId: mongoose.Types.ObjectId;
  messId: mongoose.Types.ObjectId;
  membershipId?: mongoose.Types.ObjectId;
  billingId?: mongoose.Types.ObjectId;
  subscriptionId?: mongoose.Types.ObjectId;
  type: 'payment' | 'refund' | 'adjustment' | 'subscription' | 'leave_credit';
  amount: number;
  currency: string;
  status: 'pending' | 'success' | 'failed' | 'cancelled' | 'refunded';
  paymentMethod: 'upi' | 'online' | 'cash' | 'bank_transfer' | 'cheque';
  gateway: {
    name: string;
    transactionId?: string;
    gatewayResponse?: any;
    webhookData?: any;
  };
  description: string;
  metadata: {
    ipAddress?: string;
    userAgent?: string;
    deviceInfo?: any;
    location?: {
      latitude?: number;
      longitude?: number;
      city?: string;
      state?: string;
      country?: string;
    };
    notes?: string;
    tags?: string[];
  };
  refund?: {
    refundId?: string;
    refundAmount: number;
    refundReason: string;
    refundedAt?: Date;
    refundedBy: mongoose.Types.ObjectId;
    gatewayRefundId?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const transactionSchema = new Schema<ITransaction>({
  transactionId: {
    type: String,
    required: [true, 'Transaction ID is required'],
    unique: true
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  messId: {
    type: Schema.Types.ObjectId,
    ref: 'MessProfile',
    required: [true, 'Mess ID is required']
  },
  membershipId: {
    type: Schema.Types.ObjectId,
    ref: 'MessMembership'
  },
  billingId: {
    type: Schema.Types.ObjectId,
    ref: 'Billing'
  },
  subscriptionId: {
    type: Schema.Types.ObjectId,
    ref: 'Subscription'
  },
  type: {
    type: String,
    enum: ['payment', 'refund', 'adjustment', 'subscription', 'leave_credit'],
    required: [true, 'Transaction type is required']
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0, 'Amount cannot be negative']
  },
  currency: {
    type: String,
    default: 'INR',
    required: [true, 'Currency is required']
  },
  status: {
    type: String,
    enum: ['pending', 'success', 'failed', 'cancelled', 'refunded'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['upi', 'online', 'cash', 'bank_transfer', 'cheque'],
    required: [true, 'Payment method is required']
  },
  gateway: {
    name: {
      type: String,
      required: [true, 'Gateway name is required']
    },
    transactionId: {
      type: String
    },
    gatewayResponse: {
      type: Schema.Types.Mixed
    },
    webhookData: {
      type: Schema.Types.Mixed
    }
  },
  description: {
    type: String,
    required: [true, 'Description is required']
  },
  metadata: {
    ipAddress: {
      type: String
    },
    userAgent: {
      type: String
    },
    deviceInfo: {
      type: Schema.Types.Mixed
    },
    location: {
      latitude: {
        type: Number
      },
      longitude: {
        type: Number
      },
      city: {
        type: String
      },
      state: {
        type: String
      },
      country: {
        type: String
      }
    },
    notes: {
      type: String
    },
    tags: [{
      type: String
    }]
  },
  refund: {
    refundId: {
      type: String
    },
    refundAmount: {
      type: Number,
      min: [0, 'Refund amount cannot be negative']
    },
    refundReason: {
      type: String
    },
    refundedAt: {
      type: Date
    },
    refundedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    gatewayRefundId: {
      type: String
    }
  }
}, {
  timestamps: true
});

// Indexes for better performance
transactionSchema.index({ transactionId: 1 });
transactionSchema.index({ userId: 1, messId: 1 });
transactionSchema.index({ membershipId: 1 });
transactionSchema.index({ billingId: 1 });
transactionSchema.index({ subscriptionId: 1 });
transactionSchema.index({ status: 1 });
transactionSchema.index({ type: 1 });
transactionSchema.index({ 'gateway.name': 1 });
transactionSchema.index({ createdAt: -1 });

// Pre-save middleware to generate transaction ID
transactionSchema.pre('save', function(next) {
  if (this.isNew && !this.transactionId) {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    this.transactionId = `TXN_${timestamp}_${random}`;
  }
  next();
});

// Instance method to process refund
transactionSchema.methods.processRefund = function(
  refundAmount: number,
  refundReason: string,
  refundedBy: mongoose.Types.ObjectId,
  gatewayRefundId?: string
) {
  this.status = 'refunded';
  this.refund = {
    refundId: `REF_${Date.now()}_${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
    refundAmount,
    refundReason,
    refundedAt: new Date(),
    refundedBy,
    gatewayRefundId
  };
  return this.save();
};

// Static method to find transactions by user
transactionSchema.statics.findByUser = function(userId: string, messId?: string) {
  const query: any = { userId };
  if (messId) {
    query.messId = messId;
  }
  return this.find(query).sort({ createdAt: -1 });
};

// Static method to find transactions by status
transactionSchema.statics.findByStatus = function(status: string) {
  return this.find({ status }).sort({ createdAt: -1 });
};

// Static method to find transactions by date range
transactionSchema.statics.findByDateRange = function(startDate: Date, endDate: Date) {
  return this.find({
    createdAt: {
      $gte: startDate,
      $lte: endDate
    }
  }).sort({ createdAt: -1 });
};

// Static method to get transaction summary
transactionSchema.statics.getSummary = function(userId?: string, messId?: string, startDate?: Date, endDate?: Date) {
  const match: any = {};
  
  if (userId) match.userId = userId;
  if (messId) match.messId = messId;
  if (startDate && endDate) {
    match.createdAt = { $gte: startDate, $lte: endDate };
  }
  
  return this.aggregate([
    { $match: match },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalAmount: { $sum: '$amount' }
      }
    }
  ]);
};

const Transaction = mongoose.model<ITransaction>('Transaction', transactionSchema);

export default Transaction;


