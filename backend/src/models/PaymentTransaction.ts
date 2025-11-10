import mongoose, { Document, Schema } from 'mongoose';

export interface IPaymentTransaction extends Document {
  messId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  planId: mongoose.Types.ObjectId;
  orderId: string; // Razorpay order ID
  paymentId?: string; // Razorpay payment ID
  signature?: string; // Razorpay signature for verification
  amount: number;
  currency: string;
  credits: number;
  bonusCredits: number;
  totalCredits: number;
  status: 'created' | 'pending' | 'success' | 'failed' | 'refunded';
  paymentMethod?: string;
  errorCode?: string;
  errorDescription?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentTransactionSchema: Schema = new Schema({
  messId: {
    type: Schema.Types.ObjectId,
    ref: 'MessProfile',
    required: true,
    index: true
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  planId: {
    type: Schema.Types.ObjectId,
    ref: 'CreditPurchasePlan',
    required: true
  },
  orderId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  paymentId: {
    type: String,
    index: true
  },
  signature: {
    type: String
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: 'INR',
    uppercase: true
  },
  credits: {
    type: Number,
    required: true,
    min: 0
  },
  bonusCredits: {
    type: Number,
    default: 0,
    min: 0
  },
  totalCredits: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ['created', 'pending', 'success', 'failed', 'refunded'],
    default: 'created',
    index: true
  },
  paymentMethod: {
    type: String
  },
  errorCode: {
    type: String
  },
  errorDescription: {
    type: String
  },
  metadata: {
    type: Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

// Indexes for better query performance
PaymentTransactionSchema.index({ messId: 1, createdAt: -1 });
PaymentTransactionSchema.index({ userId: 1, createdAt: -1 });
PaymentTransactionSchema.index({ status: 1, createdAt: -1 });

export default mongoose.model<IPaymentTransaction>('PaymentTransaction', PaymentTransactionSchema);


