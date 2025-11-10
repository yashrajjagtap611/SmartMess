import mongoose, { Document, Schema } from 'mongoose';

export interface IPaymentVerification extends Document {
  userId: mongoose.Types.ObjectId;
  messId: mongoose.Types.ObjectId;
  membershipId: mongoose.Types.ObjectId;
  mealPlanId: mongoose.Types.ObjectId;
  amount: number;
  paymentMethod: 'upi' | 'online' | 'cash';
  paymentScreenshot?: string; // URL to uploaded screenshot
  transactionId?: string; // UPI transaction ID or other payment transaction ID
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  verifiedBy?: mongoose.Types.ObjectId; // Mess owner who verified
  verifiedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentVerificationSchema: Schema = new Schema<IPaymentVerification>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  messId: {
    type: Schema.Types.ObjectId,
    ref: 'MessProfile',
    required: true
  },
  membershipId: {
    type: Schema.Types.ObjectId,
    ref: 'MessMembership',
    required: true
  },
  mealPlanId: {
    type: Schema.Types.ObjectId,
    ref: 'MealPlan',
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  paymentMethod: {
    type: String,
    enum: ['upi', 'online', 'cash'],
    required: true
  },
  paymentScreenshot: {
    type: String,
    default: null
  },
  transactionId: {
    type: String,
    default: null,
    index: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  rejectionReason: {
    type: String,
    default: null
  },
  verifiedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  verifiedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Add indexes for better query performance
PaymentVerificationSchema.index({ userId: 1, messId: 1 });
PaymentVerificationSchema.index({ messId: 1, status: 1 });
PaymentVerificationSchema.index({ status: 1, createdAt: -1 });

const PaymentVerification = mongoose.model<IPaymentVerification>('PaymentVerification', PaymentVerificationSchema);
export default PaymentVerification;
