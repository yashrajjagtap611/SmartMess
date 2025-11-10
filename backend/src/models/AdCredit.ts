import mongoose, { Document, Schema } from 'mongoose';

export interface IAdCredit extends Document {
  messId: mongoose.Types.ObjectId;
  totalCredits: number;
  usedCredits: number;
  availableCredits: number;
  createdAt: Date;
  updatedAt: Date;
  
  // Instance methods
  addCredits(amount: number): Promise<void>;
  deductCredits(amount: number): Promise<void>;
}

const AdCreditSchema: Schema = new Schema<IAdCredit>({
  messId: {
    type: Schema.Types.ObjectId,
    ref: 'MessProfile',
    required: true,
    unique: true
  },
  totalCredits: {
    type: Number,
    default: 0,
    min: 0
  },
  usedCredits: {
    type: Number,
    default: 0,
    min: 0
  },
  availableCredits: {
    type: Number,
    default: 0,
    min: 0
  }
}, { timestamps: true });

// Instance method to add credits
AdCreditSchema.methods.addCredits = async function(amount: number) {
  if (amount <= 0) {
    throw new Error('Credit amount must be positive');
  }
  this.totalCredits += amount;
  this.availableCredits += amount;
  await this.save();
};

// Instance method to deduct credits
AdCreditSchema.methods.deductCredits = async function(amount: number) {
  if (amount <= 0) {
    throw new Error('Deduction amount must be positive');
  }
  if (this.availableCredits < amount) {
    throw new Error('Insufficient credits');
  }
  this.usedCredits += amount;
  this.availableCredits -= amount;
  await this.save();
};

// Index
AdCreditSchema.index({ messId: 1 });

export default mongoose.model<IAdCredit>('AdCredit', AdCreditSchema);


