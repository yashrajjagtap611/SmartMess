
import mongoose, { Document, Schema } from 'mongoose';

export interface INotification extends Document {
  userId: mongoose.Types.ObjectId;
  messId?: mongoose.Types.ObjectId;
  type: 'join_request' | 'payment_request' | 'payment_received' | 'payment_reminder' | 'payment_overdue' | 'payment_success' | 'payment_failed' | 'leave_request' | 'leave_extension' | 'bill_due' | 'meal_plan_change' | 'general' | 'subscription_renewal' | 'payment_method_update' | 'mess_off_day';
  title: string;
  message: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed' | 'failed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  data?: {
    requestingUserId?: mongoose.Types.ObjectId;
    mealPlanId?: mongoose.Types.ObjectId;
    paymentType?: 'pay_now' | 'pay_later';
    amount?: number;
    plan?: string;
    approvedBy?: mongoose.Types.ObjectId;
    approvedAt?: string;
    rejectedBy?: mongoose.Types.ObjectId;
    rejectedAt?: string;
    paymentMethod?: string;
    dueDate?: string;
    reminderCount?: number;
    lastReminderSent?: string;
    paymentAttempts?: number;
    [key: string]: any;
  };
  isRead: boolean;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Interface for the model with static methods
export interface INotificationModel extends mongoose.Model<INotification> {
  findExistingNotification: (userId: mongoose.Types.ObjectId, type: string, messId?: mongoose.Types.ObjectId) => Promise<INotification | null>;
}

const notificationSchema = new Schema<INotification>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  messId: {
    type: Schema.Types.ObjectId,
    ref: 'MessProfile',
    required: false
  },
  type: {
    type: String,
    enum: ['join_request', 'payment_request', 'payment_received', 'payment_reminder', 'payment_overdue', 'payment_success', 'payment_failed', 'leave_request', 'leave_extension', 'bill_due', 'meal_plan_change', 'general', 'subscription_renewal', 'payment_method_update', 'mess_off_day'],
    required: [true, 'Notification type is required']
  },
  title: {
    type: String,
    required: [true, 'Notification title is required'],
    trim: true
  },
  message: {
    type: String,
    required: [true, 'Notification message is required'],
    trim: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'completed', 'failed', 'cancelled'],
    default: 'pending'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  data: {
    type: Schema.Types.Mixed,
    default: {}
  },
  isRead: {
    type: Boolean,
    default: false
  },
  expiresAt: {
    type: Date,
    required: false
  }
}, {
  timestamps: true
});

// Create indexes for better performance
notificationSchema.index({ userId: 1, isRead: 1 });
notificationSchema.index({ userId: 1, type: 1 });
notificationSchema.index({ userId: 1, status: 1 });
notificationSchema.index({ userId: 1, priority: 1 });
notificationSchema.index({ messId: 1, type: 1 });
notificationSchema.index({ createdAt: -1 });
notificationSchema.index({ expiresAt: 1 });
notificationSchema.index({ 'data.paymentType': 1 });
notificationSchema.index({ 'data.dueDate': 1 });

// Static method to find existing notifications
notificationSchema.statics['findExistingNotification'] = async function(
  userId: mongoose.Types.ObjectId, 
  type: string, 
  messId?: mongoose.Types.ObjectId
): Promise<INotification | null> {
  const query: any = { userId, type };
  if (messId) query.messId = messId;
  
  return this.findOne(query).sort({ createdAt: -1 });
};

// Pre-save middleware to set priority based on type and data
notificationSchema.pre('save', function(next) {
  // Auto-set priority based on notification type
  if (this.type === 'payment_overdue' || this.type === 'payment_reminder') {
    this.priority = 'high';
  } else if (this.type === 'payment_failed' || this.type === 'bill_due') {
    this.priority = 'urgent';
  } else if (this.type === 'join_request' || this.type === 'payment_request') {
    this.priority = 'medium';
  } else {
    this.priority = 'low';
  }

  // Auto-set expiration for certain notification types
  if (!this.expiresAt) {
    if (this.type === 'payment_reminder') {
      this.expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    } else if (this.type === 'payment_overdue') {
      this.expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
    }
  }

  next();
});

const Notification = mongoose.model<INotification, INotificationModel>('Notification', notificationSchema);

export default Notification; 