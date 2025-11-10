export interface MealPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  mealsPerDay: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  mealOptions?: {
    breakfast: boolean;
    lunch: boolean;
    dinner: boolean;
  };
}

export type MealType = 'breakfast' | 'lunch' | 'dinner';
export type MealCategory = 'vegetarian' | 'non-vegetarian' | 'vegan' | 'jain' | 'eggetarian';

export interface MealTag {
  id: string;
  name: string;
  color: string;
}

export interface Meal {
  id: string;
  name: string;
  description: string;
  type: MealType;
  category: MealCategory; // Keep for backward compatibility
  categories: MealCategory[]; // New field for multiple categories
  date: Date;
  isAvailable: boolean;
  price: number;
  imageUrl?: string;
  tags: MealTag[];
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
  servingSize: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateMealData {
  name: string;
  description: string;
  type: MealType;
  category?: MealCategory; // Keep for backward compatibility
  categories: MealCategory[]; // New field for multiple categories
  date: Date;
  price: number;
  imageFile?: File | undefined;
  tags: MealTag[]; // Array of tag objects
  associatedMealPlans: string[]; // Array of meal plan IDs
  nutritionalInfo?: {
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
    fiber?: number;
  };
  allergens?: string[];
  preparationTime?: number;
  servingSize: string;
  isAvailable?: boolean;
}

export interface UpdateMealData extends Partial<CreateMealData> {
}

export interface MealManagementState {
  mealPlans: MealPlan[];
  meals: Meal[];
  tags: MealTag[];
  loading: boolean;
  error: string | null;
  selectedMealPlan: MealPlan | null;
  selectedMeal: Meal | null;
  showAddMealModal: boolean;
  showEditMealModal: boolean;
  showDeleteMealModal: boolean;
  mealToDelete: Meal | null;
}

export interface MealManagementActions {
  createMealPlan: (plan: Omit<MealPlan, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateMealPlan: (id: string, plan: Partial<MealPlan>) => Promise<void>;
  deleteMealPlan: (id: string) => Promise<void>;
  createMeal: (meal: CreateMealData) => Promise<void>;
  updateMeal: (id: string, meal: UpdateMealData) => Promise<void>;
  deleteMeal: (id: string) => Promise<void>;
  createTag: (tag: Omit<MealTag, 'id'>) => Promise<void>;
  updateTag: (id: string, tag: Partial<MealTag>) => Promise<void>;
  deleteTag: (id: string) => Promise<void>;
  setSelectedMealPlan: (plan: MealPlan | null) => void;
  setSelectedMeal: (meal: Meal | null) => void;
  setShowAddMealModal: (show: boolean) => void;
  setShowEditMealModal: (show: boolean) => void;
  setShowDeleteMealModal: (show: boolean) => void;
  setMealToDelete: (meal: Meal | null) => void;
}

export interface MealFormData {
  name: string;
  description: string;
  type: MealType;
  category: MealCategory;
  date: Date;
  price: number;
  imageFile?: File;
  tags: string[];
  associatedMealPlans: string[];
  nutritionalInfo: {
    calories: string;
    protein: string;
    carbs: string;
    fat: string;
    fiber: string;
  };
  allergens: string[];
  preparationTime: string;
  servingSize: string;
}
