import type { MealPlan, MealPlanFormData, MealPlanErrors, LeaveRules, MealPlanConfig } from './MealPlan.types';

export const getMealPlanConfig = (): MealPlanConfig => {
  return {
    mealTypes: ["Vegetarian", "Non-Vegetarian", "Mixed", "Custom", "Vegan"],
    pricingPeriods: [
      { value: "day", label: "Per Day" },
      { value: "week", label: "Per Week" },
      { value: "15days", label: "Per 15 Days" },
      { value: "month", label: "Per Month" },
      { value: "3months", label: "Per 3 Months" },
      { value: "6months", label: "Per 6 Months" },
      { value: "year", label: "Per Year" },
    ],
    mealsPerDayOptions: [1, 2, 3, 4, 5],
    mealOptions: [
      { value: "breakfast", label: "Breakfast" },
      { value: "lunch", label: "Lunch" },
      { value: "dinner", label: "Dinner" },
    ],
    maxLeaveMealsLimit: 93,
    minNoticeHours: 1,
    maxNoticeHours: 24,
  };
};

export const getInitialLeaveRules = (): LeaveRules => {
  return {
    maxLeaveMeals: 30,
    requireTwoHourNotice: true,
    noticeHours: 2,
    minConsecutiveDays: 2,
    extendSubscription: true,
    autoApproval: true,
    leaveLimitsEnabled: true,
    consecutiveLeaveEnabled: true,
    maxLeaveMealsEnabled: true,
  };
};

export const getInitialMealPlanFormData = (): MealPlanFormData => {
  return {
    name: "",
    pricing: {
      amount: 0,
      period: "month",
    },
    mealType: "",
    mealsPerDay: 3,
    mealOptions: {
      breakfast: true,
      lunch: true,
      dinner: true,
    },
    description: "",
    isActive: true,
    leaveRules: getInitialLeaveRules(),
  };
};

export const validateMealPlanForm = (formData: MealPlanFormData): MealPlanErrors => {
  const errors: MealPlanErrors = {
    name: "",
    pricing: "",
    mealType: "",
    mealsPerDay: "",
    mealOptions: "",
    description: "",
    maxLeaveMeals: "",
    noticeHours: "",
    minConsecutiveDays: ""
  };

  console.log('🔍 Validating form data:', {
    name: formData.name,
    pricing: formData.pricing.amount,
    mealType: formData.mealType,
    description: formData.description?.length,
    maxLeaveMeals: formData.leaveRules.maxLeaveMeals,
    noticeHours: formData.leaveRules.noticeHours,
    minConsecutiveDays: formData.leaveRules.minConsecutiveDays,
  });

  if (!formData.name.trim()) {
    errors.name = "Meal plan name is required";
    console.log('❌ Name validation failed');
  }

  if (formData.pricing.amount <= 0) {
    errors.pricing = "Pricing amount must be greater than 0";
    console.log('❌ Pricing validation failed:', formData.pricing.amount);
  }

  if (!formData.mealType) {
    errors.mealType = "Meal type is required";
    console.log('❌ MealType validation failed');
  }

  if (formData.mealsPerDay < 1) {
    errors.mealsPerDay = "At least 1 meal per day is required";
  }

  // Validate that at least one meal option is selected
  if (!formData.mealOptions.breakfast && !formData.mealOptions.lunch && !formData.mealOptions.dinner) {
    errors.mealOptions = "At least one meal option must be selected";
  }

  // Validate that mealsPerDay matches the number of selected meal options
  const selectedMeals = [
    formData.mealOptions.breakfast,
    formData.mealOptions.lunch,
    formData.mealOptions.dinner
  ].filter(Boolean).length;
  
  if (formData.mealsPerDay !== selectedMeals) {
    errors.mealsPerDay = `Meals per day (${formData.mealsPerDay}) must match the number of selected meal options (${selectedMeals})`;
  }

  if (!formData.description.trim()) {
    errors.description = "Description is required";
  } else if (formData.description.trim().length < 10) {
    errors.description = "Description must be at least 10 characters long";
  }

  // Only validate maxLeaveMeals if the feature is enabled
  if (formData.leaveRules.leaveLimitsEnabled && formData.leaveRules.maxLeaveMealsEnabled) {
    if (formData.leaveRules.maxLeaveMeals < 1) {
      errors.maxLeaveMeals = "Maximum leave meals must be at least 1";
      console.log('❌ MaxLeaveMeals validation failed:', formData.leaveRules.maxLeaveMeals);
    } else if (formData.leaveRules.maxLeaveMeals > 93) {
      errors.maxLeaveMeals = "Maximum leave meals cannot exceed 93";
      console.log('❌ MaxLeaveMeals exceeds 93:', formData.leaveRules.maxLeaveMeals);
    }
  } else {
    console.log('⏭️ Skipping maxLeaveMeals validation (feature disabled)');
  }

  // Only validate noticeHours if the feature is enabled
  if (formData.leaveRules.requireTwoHourNotice) {
    if (formData.leaveRules.noticeHours < 1) {
      errors.noticeHours = "Notice hours must be at least 1";
      console.log('❌ NoticeHours validation failed:', formData.leaveRules.noticeHours);
    } else if (formData.leaveRules.noticeHours > 24) {
      errors.noticeHours = "Notice hours cannot exceed 24";
      console.log('❌ NoticeHours exceeds 24:', formData.leaveRules.noticeHours);
    }
  } else {
    console.log('⏭️ Skipping noticeHours validation (feature disabled)');
  }

  // Only validate minConsecutiveDays if the feature is enabled
  if (formData.leaveRules.consecutiveLeaveEnabled) {
    if (formData.leaveRules.minConsecutiveDays < 1) {
      errors.minConsecutiveDays = "Minimum consecutive days must be at least 1";
      console.log('❌ MinConsecutiveDays validation failed:', formData.leaveRules.minConsecutiveDays);
    } else if (formData.leaveRules.minConsecutiveDays > 31) {
      errors.minConsecutiveDays = "Minimum consecutive days cannot exceed 31";
      console.log('❌ MinConsecutiveDays exceeds 31:', formData.leaveRules.minConsecutiveDays);
    }
  } else {
    console.log('⏭️ Skipping minConsecutiveDays validation (feature disabled)');
  }

  const errorCount = Object.values(errors).filter(e => e.trim().length > 0).length;
  console.log(`📊 Total validation errors: ${errorCount}`, errors);

  return errors;
};


export const calculateMealsPerDay = (mealOptions: { breakfast: boolean; lunch: boolean; dinner: boolean }): number => {
  return [mealOptions.breakfast, mealOptions.lunch, mealOptions.dinner].filter(Boolean).length;
};

// Utility function to get selected meals count for display
export const getSelectedMealsCount = (mealOptions: { breakfast: boolean; lunch: boolean; dinner: boolean }): number => {
  return calculateMealsPerDay(mealOptions);
};

// Utility function to get selected meals text for display
export const getSelectedMealsText = (mealOptions: { breakfast: boolean; lunch: boolean; dinner: boolean }): string => {
  const count = getSelectedMealsCount(mealOptions);
  return `${count} meal${count > 1 ? "s" : ""} per day`;
};

// Calculates an upper-bound for max leave meals based on meals/day and allowed days
export const calculateMaxLeaveMeals = (mealsPerDay: number, maxLeaveDays: number): number => {
  const config = getMealPlanConfig();
  const perDay = Number.isFinite(mealsPerDay) ? Math.max(0, Math.floor(mealsPerDay)) : 0;
  const days = Number.isFinite(maxLeaveDays) ? Math.max(0, Math.floor(maxLeaveDays)) : 0;
  const raw = perDay * days;
  return Math.min(config.maxLeaveMealsLimit, raw);
};

export const formatMealPlanForBackend = (formData: MealPlanFormData) => {
  const { name, pricing, mealType, mealOptions, description, isActive, leaveRules } = formData;
  
  return {
    name,
    pricing: {
      amount: pricing.amount,
      period: pricing.period
    },
    mealType,
    mealsPerDay: calculateMealsPerDay(mealOptions),
    mealOptions: {
      breakfast: mealOptions.breakfast,
      lunch: mealOptions.lunch,
      dinner: mealOptions.dinner,
    },
    description,
    isActive,
    leaveRules: {
      maxLeaveMeals: leaveRules.maxLeaveMeals,
      requireTwoHourNotice: leaveRules.requireTwoHourNotice,
      noticeHours: leaveRules.noticeHours,
      minConsecutiveDays: leaveRules.minConsecutiveDays,
      extendSubscription: leaveRules.extendSubscription,
      autoApproval: leaveRules.autoApproval,
      leaveLimitsEnabled: leaveRules.leaveLimitsEnabled,
      consecutiveLeaveEnabled: leaveRules.consecutiveLeaveEnabled,
      maxLeaveMealsEnabled: leaveRules.maxLeaveMealsEnabled,
    }
  };
};

export const formatBackendMealPlan = (backendPlan: any): MealPlan => {
  // Ensure mealOptions exists for backward compatibility
  let mealOptions = backendPlan.mealOptions;
  
  if (!mealOptions) {
    // If mealOptions is missing, create default based on mealsPerDay
    const mealsPerDay = backendPlan.mealsPerDay || 3;
    if (mealsPerDay === 1) {
      mealOptions = { breakfast: true, lunch: false, dinner: false };
    } else if (mealsPerDay === 2) {
      mealOptions = { breakfast: true, lunch: true, dinner: false };
    } else {
      mealOptions = { breakfast: true, lunch: true, dinner: true };
    }
  }

  // Ensure all required fields exist
  const leaveRules = backendPlan.leaveRules || {};
  
  return {
    _id: backendPlan._id,
    name: backendPlan.name || '',
    pricing: {
      amount: backendPlan.pricing?.amount || 0,
      period: backendPlan.pricing?.period || 'month',
    },
    mealType: backendPlan.mealType || 'Mixed',
    mealsPerDay: backendPlan.mealsPerDay || calculateMealsPerDay(mealOptions),
    mealOptions,
    description: backendPlan.description || '',
    isActive: backendPlan.isActive !== undefined ? backendPlan.isActive : true,
    leaveRules: {
      maxLeaveMeals: leaveRules.maxLeaveMeals || 30,
      requireTwoHourNotice: leaveRules.requireTwoHourNotice !== undefined ? leaveRules.requireTwoHourNotice : true,
      noticeHours: leaveRules.noticeHours || 2,
      minConsecutiveDays: leaveRules.minConsecutiveDays || 2,
      extendSubscription: leaveRules.extendSubscription !== undefined ? leaveRules.extendSubscription : true,
      autoApproval: leaveRules.autoApproval !== undefined ? leaveRules.autoApproval : true,
      leaveLimitsEnabled: leaveRules.leaveLimitsEnabled !== undefined ? leaveRules.leaveLimitsEnabled : true,
      consecutiveLeaveEnabled: leaveRules.consecutiveLeaveEnabled !== undefined ? leaveRules.consecutiveLeaveEnabled : true,
      maxLeaveMealsEnabled: leaveRules.maxLeaveMealsEnabled !== undefined ? leaveRules.maxLeaveMealsEnabled : true,
    },
    createdAt: backendPlan.createdAt ? new Date(backendPlan.createdAt) : new Date(),
    updatedAt: backendPlan.updatedAt ? new Date(backendPlan.updatedAt) : new Date(),
  };
};

export const getMealPlanStatistics = (mealPlans: MealPlan[]) => {
  const totalPlans = mealPlans.length;
  const activePlans = mealPlans.filter(plan => plan.isActive).length;
  const avgPrice = mealPlans.length > 0 
    ? Math.round(mealPlans.reduce((sum, plan) => sum + plan.pricing.amount, 0) / mealPlans.length)
    : 0;
  const totalRevenue = mealPlans.reduce((sum, plan) => sum + plan.pricing.amount, 0);

  return {
    totalPlans,
    activePlans,
    avgPrice,
    totalRevenue,
  };
};

export const getStatusColor = (isActive: boolean) => {
  return isActive 
    ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300 border-green-200 dark:border-green-800'
    : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300 border-gray-200 dark:border-gray-800';
};

export const getMealTypeColor = (mealType: string) => {
  switch (mealType.toLowerCase()) {
    case 'vegetarian':
      return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
    case 'non-vegetarian':
      return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
    case 'mixed':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
  }
};

export const getMealPlanErrorMessage = (error: any): string => {
  if (error?.message) {
    return error.message;
  }
  if (error?.response?.data?.message) {
    return error.response.data.message;
  }
  return 'An error occurred while processing meal plan. Please try again.';
};
