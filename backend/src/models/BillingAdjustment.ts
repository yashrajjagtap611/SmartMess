import mongoose, { Schema, Document } from 'mongoose';

export interface IBillingAdjustment extends Document {
  userId: mongoose.Types.ObjectId;
  leaveId: mongoose.Types.ObjectId;
  originalAmount: number;
  adjustedAmount: number;
  creditAmount: number;
  adjustmentDate: Date;
  adjustmentReason: string;
  status: 'pending' | 'applied' | 'reversed';
  appliedAt?: Date;
  reversedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const BillingAdjustmentSchema: Schema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  leaveId: {
    type: Schema.Types.ObjectId,
    ref: 'MessLeave',
    required: true
  },
  originalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  adjustedAmount: {
    type: Number,
    required: true,
    min: 0
  },
  creditAmount: {
    type: Number,
    required: true,
    min: 0
  },
  adjustmentDate: {
    type: Date,
    required: true
  },
  adjustmentReason: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['pending', 'applied', 'reversed'],
    default: 'pending'
  },
  appliedAt: Date,
  reversedAt: Date
}, {
  timestamps: true
});

// Indexes
BillingAdjustmentSchema.index({ userId: 1 });
BillingAdjustmentSchema.index({ leaveId: 1 });
BillingAdjustmentSchema.index({ status: 1 });
BillingAdjustmentSchema.index({ adjustmentDate: 1 });

export const BillingAdjustment = mongoose.model<IBillingAdjustment>('BillingAdjustment', BillingAdjustmentSchema);
