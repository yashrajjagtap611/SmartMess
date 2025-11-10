import mongoose, { Schema, Document } from 'mongoose';

export interface IMealPlan extends Document {
  messId: string;
  name: string;
  pricing: {
    amount: number;
    period: 'day' | 'week' | '15days' | 'month' | '3months' | '6months' | 'year';
  };
  mealType: string;
  mealsPerDay: number;
  mealOptions: {
    breakfast: boolean;
    lunch: boolean;
    dinner: boolean;
  };
  description: string;
  isActive: boolean;
  leaveRules: {
    maxLeaveMeals: number;
    requireTwoHourNotice: boolean;
    noticeHours: number;
    minConsecutiveDays: number;
    extendSubscription: boolean;
    autoApproval: boolean;
    leaveLimitsEnabled: boolean;
    consecutiveLeaveEnabled: boolean;
    maxLeaveMealsEnabled: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

const MealPlanSchema = new Schema<IMealPlan>({
  messId: {
    type: String,
    required: true,
    ref: 'MessProfile'
  },
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 100
  },
  pricing: {
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    period: {
      type: String,
      required: true,
      enum: ['day', 'week', '15days', 'month', '3months', '6months', 'year'],
      default: 'month'
    }
  },
  mealType: {
    type: String,
    required: true,
    enum: ['Vegetarian', 'Non-Vegetarian', 'Mixed', 'Custom', 'Vegan']
  },
  mealsPerDay: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
    default: 3
  },
  mealOptions: {
    breakfast: {
      type: Boolean,
      default: true
    },
    lunch: {
      type: Boolean,
      default: true
    },
    dinner: {
      type: Boolean,
      default: true
    }
  },
  description: {
    type: String,
    required: true,
    trim: true,
    minlength: 10,
    maxlength: 500
  },
  isActive: {
    type: Boolean,
    default: true
  },
  leaveRules: {
    maxLeaveMeals: {
      type: Number,
      required: true,
      min: 1,
      max: 93,
      default: 30
    },
    requireTwoHourNotice: {
      type: Boolean,
      default: true
    },
    noticeHours: {
      type: Number,
      required: true,
      min: 1,
      max: 24,
      default: 2
    },
    minConsecutiveDays: {
      type: Number,
      required: true,
      min: 1,
      max: 31,
      default: 2
    },
    extendSubscription: {
      type: Boolean,
      default: true
    },
    autoApproval: {
      type: Boolean,
      default: true
    },
    leaveLimitsEnabled: {
      type: Boolean,
      default: true
    },
    consecutiveLeaveEnabled: {
      type: Boolean,
      default: true
    },
    maxLeaveMealsEnabled: {
      type: Boolean,
      default: true
    }
  }
}, {
  timestamps: true
});

// Index for efficient queries
MealPlanSchema.index({ messId: 1, isActive: 1 });
MealPlanSchema.index({ messId: 1, createdAt: -1 });

export default mongoose.model<IMealPlan>('MealPlan', MealPlanSchema); 