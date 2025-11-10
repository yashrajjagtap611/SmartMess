import mongoose, { Document, Schema } from 'mongoose';

export interface ICreditSlab extends Document {
  minUsers: number;
  maxUsers: number;
  creditsPerUser: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: mongoose.Types.ObjectId;
  updatedBy: mongoose.Types.ObjectId;
}

export interface ICreditSlabModel extends mongoose.Model<ICreditSlab> {
  findApplicableSlab(userCount: number): Promise<ICreditSlab | null>;
  calculateCredits(userCount: number): Promise<number>;
}

const CreditSlabSchema: Schema = new Schema({
  minUsers: {
    type: Number,
    required: true,
    min: 1
  },
  maxUsers: {
    type: Number,
    required: true,
    validate: {
      validator: function(this: ICreditSlab, value: number) {
        return value >= this.minUsers;
      },
      message: 'maxUsers must be greater than or equal to minUsers'
    }
  },
  creditsPerUser: {
    type: Number,
    required: true,
    min: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Index for efficient range queries
CreditSlabSchema.index({ minUsers: 1, maxUsers: 1 });
CreditSlabSchema.index({ isActive: 1 });

// Static method to find applicable slab for user count
CreditSlabSchema.statics.findApplicableSlab = function(userCount: number) {
  return this.findOne({
    minUsers: { $lte: userCount },
    maxUsers: { $gte: userCount },
    isActive: true
  }).sort({ minUsers: 1 });
};

// Static method to calculate total credits for user count
CreditSlabSchema.statics.calculateCredits = async function(userCount: number) {
  // @ts-ignore - Custom static method
  const slab = await this.findApplicableSlab(userCount);
  if (!slab) {
    throw new Error(`No credit slab found for ${userCount} users`);
  }
  return userCount * slab.creditsPerUser;
};

export default mongoose.model<ICreditSlab, ICreditSlabModel>('CreditSlab', CreditSlabSchema);
