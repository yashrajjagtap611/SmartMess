import mongoose, { Document, Schema } from 'mongoose';

export type BroadcastAudience = 'all' | 'role' | 'mess_members';
export type BroadcastPriority = 'low' | 'normal' | 'high';

export interface IReadEntry {
  userId: mongoose.Types.ObjectId;
  readAt: Date;
}

export interface IBroadcastNotification extends Document {
  audience: BroadcastAudience;
  roles?: Array<'user' | 'mess-owner' | 'admin'>;
  messId?: mongoose.Types.ObjectId;
  type: 'join_request' | 'payment_request' | 'payment_received' | 'leave_request' | 'bill_due' | 'meal_plan_change' | 'general';
  title: string;
  message: string;
  priority: BroadcastPriority;
  startAt: Date;
  expiresAt?: Date;
  reads: IReadEntry[];
  data?: Record<string, any>;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const readEntrySchema = new Schema<IReadEntry>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  readAt: {
    type: Date,
    default: Date.now
  }
}, { _id: false });

const broadcastNotificationSchema = new Schema<IBroadcastNotification>({
  audience: {
    type: String,
    enum: ['all', 'role', 'mess_members'],
    required: [true, 'Audience is required']
  },
  roles: [{
    type: String,
    enum: ['user', 'mess-owner', 'admin'],
    required: false
  }],
  messId: {
    type: Schema.Types.ObjectId,
    ref: 'MessProfile',
    required: false
  },
  type: {
    type: String,
    enum: ['join_request', 'payment_request', 'payment_received', 'leave_request', 'bill_due', 'meal_plan_change', 'general'],
    default: 'general'
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
  priority: {
    type: String,
    enum: ['low', 'normal', 'high'],
    default: 'normal'
  },
  startAt: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date,
    required: false
  },
  reads: {
    type: [readEntrySchema],
    default: []
  },
  data: {
    type: Schema.Types.Mixed,
    default: {}
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'CreatedBy is required']
  }
}, {
  timestamps: true
});

broadcastNotificationSchema.index({ audience: 1, startAt: -1 });
broadcastNotificationSchema.index({ roles: 1, startAt: -1 });
broadcastNotificationSchema.index({ messId: 1, startAt: -1 });
broadcastNotificationSchema.index({ startAt: -1 });

const BroadcastNotification = mongoose.model<IBroadcastNotification>('BroadcastNotification', broadcastNotificationSchema);

export default BroadcastNotification; 