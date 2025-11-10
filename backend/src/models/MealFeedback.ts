import mongoose, { Document, Schema } from 'mongoose';

export interface IMealFeedback extends Document {
  messId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  mealDate: Date;
  sentiment?: 'positive' | 'negative' | 'neutral';
  isResolved: boolean;
  responses?: Array<{
    userId: string;
    userName: string;
    comment: string;
    createdAt: Date;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const MealFeedbackSchema = new Schema<IMealFeedback>({
  messId: {
    type: String,
    required: true,
    ref: 'MessProfile'
  },
  userId: {
    type: String,
    required: true,
    ref: 'User'
  },
  userName: {
    type: String,
    required: true,
    trim: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    required: true,
    trim: true,
    minlength: 1,
    maxlength: 1000
  },
  mealDate: {
    type: Date,
    required: true
  },
  sentiment: {
    type: String,
    enum: ['positive', 'negative', 'neutral'],
    default: 'neutral'
  },
  isResolved: {
    type: Boolean,
    default: false
  },
  responses: [{
    userId: {
      type: String,
      required: true,
      ref: 'User'
    },
    userName: {
      type: String,
      required: true,
      trim: true
    },
    comment: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
      maxlength: 500
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Indexes for efficient queries
MealFeedbackSchema.index({ messId: 1, createdAt: -1 });
MealFeedbackSchema.index({ messId: 1, mealDate: -1 });
MealFeedbackSchema.index({ messId: 1, rating: 1 });
MealFeedbackSchema.index({ messId: 1, isResolved: 1 });

export default mongoose.model<IMealFeedback>('MealFeedback', MealFeedbackSchema);
