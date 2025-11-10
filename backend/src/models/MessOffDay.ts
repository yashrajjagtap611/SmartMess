import mongoose, { Document, Schema } from 'mongoose';

export interface IMessOffDay extends Document {
  messId: mongoose.Types.ObjectId;
  offDate: Date;
  reason: string;
  mealTypes: ('breakfast' | 'lunch' | 'dinner')[];
  billingDeduction: boolean;
  subscriptionExtension: boolean;
  extensionDays?: number;
  status: 'active' | 'cancelled';
  // Range support
  isRange?: boolean;
  rangeStartDate?: Date;
  rangeEndDate?: Date;
  startDateMealTypes?: ('breakfast' | 'lunch' | 'dinner')[];
  endDateMealTypes?: ('breakfast' | 'lunch' | 'dinner')[];
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const MessOffDaySchema = new Schema<IMessOffDay>({
  messId: {
    type: Schema.Types.ObjectId,
    ref: 'MessProfile',
    required: true,
    index: true
  },
  offDate: {
    type: Date,
    required: true,
    index: true
  },
  reason: {
    type: String,
    required: false,
    default: '',
    maxlength: 500,
    trim: true
  },
  mealTypes: [{
    type: String,
    enum: ['breakfast', 'lunch', 'dinner'],
    required: true
  }],
  billingDeduction: {
    type: Boolean,
    default: false
  },
  subscriptionExtension: {
    type: Boolean,
    default: false
  },
  extensionDays: {
    type: Number,
    min: 1,
    max: 30,
    default: 1
  },
  status: {
    type: String,
    enum: ['active', 'cancelled'],
    default: 'active',
    index: true
  },
  isRange: { type: Boolean, default: false },
  rangeStartDate: { type: Date },
  rangeEndDate: { type: Date },
  startDateMealTypes: [{ type: String, enum: ['breakfast','lunch','dinner'] }],
  endDateMealTypes: [{ type: String, enum: ['breakfast','lunch','dinner'] }],
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Indexes for better query performance
MessOffDaySchema.index({ messId: 1, offDate: 1 });
MessOffDaySchema.index({ offDate: 1 });
MessOffDaySchema.index({ createdBy: 1 });

// Ensure only one ACTIVE off day per mess per date
// Allows creating a new off-day for the same date after cancellation
MessOffDaySchema.index(
  { messId: 1, offDate: 1 },
  { unique: true, partialFilterExpression: { status: 'active' } as any }
);

const MessOffDay = mongoose.model<IMessOffDay>('MessOffDay', MessOffDaySchema);

export default MessOffDay;
