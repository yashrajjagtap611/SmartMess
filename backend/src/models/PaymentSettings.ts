import mongoose, { Document, Schema } from 'mongoose';

export interface IPaymentSettings extends Document {
  userId: mongoose.Types.ObjectId;
  upiId: string;
  bankAccount: string;
  autoPayment: boolean;
  lateFee: boolean;
  lateFeeAmount: number;
  isCashPayment: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const paymentSettingsSchema = new Schema<IPaymentSettings>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    unique: true
  },
  upiId: {
    type: String,
    trim: true,
    default: ''
  },
  bankAccount: {
    type: String,
    trim: true,
    default: ''
  },
  autoPayment: {
    type: Boolean,
    default: true
  },
  lateFee: {
    type: Boolean,
    default: true
  },
  lateFeeAmount: {
    type: Number,
    default: 50,
    min: [0, 'Late fee amount cannot be negative']
  },
  isCashPayment: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Create indexes for better performance
paymentSettingsSchema.index({ userId: 1 });

const PaymentSettings = mongoose.model<IPaymentSettings>('PaymentSettings', paymentSettingsSchema);

export default PaymentSettings; 