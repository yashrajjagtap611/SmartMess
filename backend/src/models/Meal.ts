import { Schema, model, Document, Types } from 'mongoose';

export interface IMeal extends Document {
  _id: Types.ObjectId;
  messId: string;
  name: string;
  description?: string;
  type: 'breakfast' | 'lunch' | 'dinner';
  category: 'vegetarian' | 'non-vegetarian' | 'vegan' | 'jain' | 'eggetarian'; // Keep for backward compatibility
  categories: ('vegetarian' | 'non-vegetarian' | 'vegan' | 'jain' | 'eggetarian')[]; // New field for multiple categories
  date: Date;
  isAvailable: boolean;
  price: number;
  imageUrl?: string;
  tags: Array<{
    id: string;
    name: string;
    color: string;
  }>;
  associatedMealPlans: string[]; // Array of meal plan IDs
  nutritionalInfo?: {
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
    fiber?: number;
  };
  allergens?: string[];
  preparationTime?: number; // in minutes
  servingSize?: string;
  createdAt: Date;
  updatedAt: Date;
}

const mealSchema = new Schema<IMeal>({
  messId: {
    type: String,
    required: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  type: {
    type: String,
    required: true,
    enum: ['breakfast', 'lunch', 'dinner']
  },
  category: {
    type: String,
    required: true,
    enum: ['vegetarian', 'non-vegetarian', 'vegan', 'jain', 'eggetarian']
  },
  categories: [{
    type: String,
    enum: ['vegetarian', 'non-vegetarian', 'vegan', 'jain', 'eggetarian']
  }],
  date: {
    type: Date,
    required: true,
    index: true
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  imageUrl: {
    type: String
  },
  tags: [{
    id: {
      type: String,
      required: true
    },
    name: {
      type: String,
      required: true
    },
    color: {
      type: String,
      required: true
    }
  }],
  associatedMealPlans: [{
    type: String,
    required: true
  }],
  nutritionalInfo: {
    calories: Number,
    protein: Number,
    carbs: Number,
    fat: Number,
    fiber: Number
  },
  allergens: [String],
  preparationTime: Number,
  servingSize: String
}, {
  timestamps: true
});

// Compound index for efficient queries
// Note: Removed the problematic index that was causing duplicate key errors
// mealSchema.index({ messId: 1, date: 1, type: 1 });
mealSchema.index({ messId: 1, associatedMealPlans: 1 });
mealSchema.index({ messId: 1, date: 1 });
mealSchema.index({ messId: 1, type: 1 });

export default model<IMeal>('Meal', mealSchema);
