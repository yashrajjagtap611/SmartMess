import mongoose, { Document, Schema } from 'mongoose';

export interface IOtp extends Document {
  email: string;
  code: string;
  type: 'verification' | 'password_reset';
  expiresAt: Date;
  verified: boolean;
  invalidated: boolean;
  createdAt: Date;
}

const OtpSchema: Schema = new Schema<IOtp>({
  email: { type: String, required: true },
  code: { type: String, required: true },
  type: { type: String, enum: ['verification', 'password_reset'], default: 'verification' },
  expiresAt: { type: Date, required: true },
  verified: { type: Boolean, default: false },
  invalidated: { type: Boolean, default: false }
}, { timestamps: true });

// Add TTL index to automatically delete expired OTPs
OtpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const Otp = mongoose.model<IOtp>('Otp', OtpSchema);
export default Otp; 