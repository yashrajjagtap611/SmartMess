import mongoose, { Document, Schema } from 'mongoose';

export interface IMessMembership extends Document {
  userId: mongoose.Types.ObjectId;
  messId: mongoose.Types.ObjectId;
  mealPlanId: mongoose.Types.ObjectId; // Make this required since we're tracking meal plan subscriptions
  joinDate: Date;
  status: 'active' | 'inactive' | 'suspended' | 'pending';
  subscriptionStartDate?: Date;
  subscriptionEndDate?: Date;
  leaveExtensionMeals?: number; // Total meals added via leave extensions
  requestExpiryDate?: Date; // Auto-expire pending requests after 7 days
  paymentStatus: 'paid' | 'pending' | 'overdue' | 'failed' | 'refunded';
  paymentRequestStatus: 'none' | 'sent' | 'approved' | 'rejected'; // Track payment request status
  paymentType: 'pay_now' | 'pay_later' | 'subscription';
  lastPaymentDate?: Date;
  nextPaymentDate?: Date;
  paymentDueDate?: Date;
  paymentAmount: number;
  lateFees?: number;
  paymentHistory: Array<{
    date: Date;
    amount: number;
    method: string;
    status: 'success' | 'failed' | 'pending' | 'refunded';
    transactionId?: string;
    notes?: string;
  }>;
  reminderSentCount: number;
  lastReminderSent?: Date;
  autoRenewal: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const messMembershipSchema = new Schema<IMessMembership>({
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
  mealPlanId: {
    type: Schema.Types.ObjectId,
    ref: 'MealPlan',
    required: [true, 'Meal Plan ID is required'] // Make this required
  },
  joinDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended', 'pending'],
    default: 'pending'
  },
  subscriptionStartDate: {
    type: Date,
    required: false
  },
  subscriptionEndDate: {
    type: Date,
    required: false
  },
  leaveExtensionMeals: {
    type: Number,
    default: 0,
    min: 0
  },
  requestExpiryDate: {
    type: Date,
    required: false
  },
  paymentStatus: {
    type: String,
    enum: ['paid', 'pending', 'overdue', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentRequestStatus: {
    type: String,
    enum: ['none', 'sent', 'approved', 'rejected'],
    default: 'none'
  },
  paymentType: {
    type: String,
    enum: ['pay_now', 'pay_later', 'subscription'],
    default: 'pay_later'
  },
  lastPaymentDate: {
    type: Date,
    required: false
  },
  nextPaymentDate: {
    type: Date,
    required: false
  },
  paymentDueDate: {
    type: Date,
    required: false
  },
  paymentAmount: {
    type: Number,
    required: [true, 'Payment amount is required'],
    min: [0, 'Payment amount cannot be negative']
  },
  lateFees: {
    type: Number,
    default: 0,
    min: [0, 'Late fees cannot be negative']
  },
  paymentHistory: [{
    date: {
      type: Date,
      required: true,
      default: Date.now
    },
    amount: {
      type: Number,
      required: true,
      min: [0, 'Payment amount cannot be negative']
    },
    method: {
      type: String,
      required: true,
      enum: ['upi', 'online', 'cash', 'bank_transfer', 'cheque']
    },
    status: {
      type: String,
      required: true,
      enum: ['success', 'failed', 'pending', 'refunded']
    },
    transactionId: {
      type: String,
      required: false
    },
    notes: {
      type: String,
      required: false
    }
  }],
  reminderSentCount: {
    type: Number,
    default: 0,
    min: [0, 'Reminder count cannot be negative']
  },
  lastReminderSent: {
    type: Date,
    required: false
  },
  autoRenewal: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Create indexes for better performance
// Allow multiple meal plan subscriptions per user per mess
// Note: We removed the unique constraint to allow users to rejoin after leaving
// The combination of (userId, messId, mealPlanId, status) should be unique instead
messMembershipSchema.index({ userId: 1, messId: 1, mealPlanId: 1, status: 1 });
messMembershipSchema.index({ messId: 1, status: 1 });
messMembershipSchema.index({ userId: 1, status: 1 });
messMembershipSchema.index({ paymentStatus: 1 });
messMembershipSchema.index({ paymentDueDate: 1 });
messMembershipSchema.index({ 'paymentHistory.date': -1 });
messMembershipSchema.index({ nextPaymentDate: 1 });
messMembershipSchema.index({ requestExpiryDate: 1 });

// Pre-save middleware to update payment status and dates
messMembershipSchema.pre('save', function(next) {
  // Set request expiry date for new pending memberships (7 days from creation)
  if (this.isNew && this.status === 'pending' && !this.requestExpiryDate) {
    this.requestExpiryDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days from now
  }

  // Auto-update payment status based on payment history
  if (this.paymentHistory && this.paymentHistory.length > 0) {
    const latestPayment = this.paymentHistory[this.paymentHistory.length - 1];
    if (latestPayment && latestPayment.status === 'success') {
      this.paymentStatus = 'paid';
      this.lastPaymentDate = latestPayment.date;
      
      // Calculate next payment date (30 days from last payment)
      this.nextPaymentDate = new Date(latestPayment.date.getTime() + 30 * 24 * 60 * 60 * 1000);
      this.paymentDueDate = new Date(this.nextPaymentDate.getTime() - 3 * 24 * 60 * 60 * 1000); // 3 days before
    }
  }

  // Auto-update payment status to overdue if due date has passed
  if (this.paymentDueDate && this.paymentStatus === 'pending' && new Date() > this.paymentDueDate) {
    this.paymentStatus = 'overdue';
    
    // Calculate late fees (5% of payment amount per week)
    const daysOverdue = Math.floor((new Date().getTime() - this.paymentDueDate.getTime()) / (24 * 60 * 60 * 1000));
    const weeksOverdue = Math.ceil(daysOverdue / 7);
    this.lateFees = Math.round(this.paymentAmount * 0.05 * weeksOverdue);
  }

  next();
});

// Instance method to add payment to history
messMembershipSchema.methods['addPayment'] = function(paymentData: {
  amount: number;
  method: string;
  status: 'success' | 'failed' | 'pending' | 'refunded';
  transactionId?: string;
  notes?: string;
}) {
  this['paymentHistory'].push({
    date: new Date(),
    ...paymentData
  });
  
  // Update payment status
  if (paymentData.status === 'success') {
    this['paymentStatus'] = 'paid';
    this['lastPaymentDate'] = new Date();
    this['lateFees'] = 0; // Reset late fees on successful payment
  } else if (paymentData.status === 'failed') {
    this['paymentStatus'] = 'failed';
  }
  
  return this['save']();
};

// Instance method to send payment reminder
messMembershipSchema.methods['sendPaymentReminder'] = function() {
  this['reminderSentCount'] += 1;
  this['lastReminderSent'] = new Date();
  return this['save']();
};

// Static method to find overdue memberships
messMembershipSchema.statics['findOverdueMemberships'] = function() {
  return this.find({
    paymentStatus: 'pending',
    paymentDueDate: { $lt: new Date() }
  });
};

// Static method to find memberships due for renewal
messMembershipSchema.statics['findDueForRenewal'] = function(daysAhead = 7) {
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + daysAhead);
  
  return this.find({
    paymentStatus: 'paid',
    nextPaymentDate: { $lte: futureDate },
    status: 'active'
  });
};

// Static method to find expired pending requests
messMembershipSchema.statics['findExpiredRequests'] = function() {
  return this.find({
    status: 'pending',
    requestExpiryDate: { $lt: new Date() }
  });
};

// Static method to cleanup expired requests
messMembershipSchema.statics['cleanupExpiredRequests'] = async function() {
  const expiredRequests = await this.find({
    status: 'pending',
    requestExpiryDate: { $lt: new Date() }
  });
  
  for (const request of expiredRequests) {
    console.log(`🗑️ Auto-expiring request: User ${request.userId}, Mess ${request.messId}, Plan ${request.mealPlanId}`);
    
    // Cancel related notifications
    await mongoose.model('Notification').updateMany(
      {
        messId: request.messId,
        type: { $in: ['join_request', 'payment_request'] },
        status: 'pending',
        'data.requestingUserId': request.userId,
        'data.mealPlanId': request.mealPlanId
      },
      {
        status: 'expired',
        message: 'Request expired after 7 days'
      }
    );
    
    // Delete the expired membership
    await this.findByIdAndDelete(request._id);
  }
  
  return expiredRequests.length;
};

const MessMembership = mongoose.model<IMessMembership>('MessMembership', messMembershipSchema);

export default MessMembership; 