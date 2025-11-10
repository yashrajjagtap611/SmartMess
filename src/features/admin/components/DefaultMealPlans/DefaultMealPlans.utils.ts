import type { DefaultMealPlanFormData, DefaultMealPlanErrors, DefaultMealPlanConfig } from './DefaultMealPlans.types';

export const getInitialDefaultMealPlanFormData = (): DefaultMealPlanFormData => ({
  name: '',
  pricing: {
    amount: 0,
    period: 'month' as const,
  },
  mealType: 'Mixed',
  mealsPerDay: 3,
  mealOptions: {
    breakfast: true,
    lunch: true,
    dinner: true,
  },
  description: '',
  isActive: true,
  leaveRules: {
    maxLeaveMeals: 30,
    requireTwoHourNotice: true,
    noticeHours: 2,
    minConsecutiveDays: 2,
    extendSubscription: true,
    autoApproval: true,
    leaveLimitsEnabled: true,
    consecutiveLeaveEnabled: true,
    maxLeaveMealsEnabled: true,
  },
});

export const validateDefaultMealPlanForm = (formData: DefaultMealPlanFormData): DefaultMealPlanErrors => {
  const errors: DefaultMealPlanErrors = {
    name: '',
    pricing: '',
    mealType: '',
    mealsPerDay: '',
    mealOptions: '',
    description: '',
    minConsecutiveDays: '',
  };

  console.log('🔍 [ADMIN] Validating form data:', {
    name: formData.name,
    pricing: formData.pricing.amount,
    mealType: formData.mealType,
    description: formData.description?.length,
    minConsecutiveDays: formData.leaveRules.minConsecutiveDays,
  });

  // Validate name
  if (!formData.name.trim()) {
    errors.name = 'Meal plan name is required';
    console.log('❌ [ADMIN] Name validation failed');
  } else if (formData.name.trim().length < 2) {
    errors.name = 'Meal plan name must be at least 2 characters long';
  } else if (formData.name.trim().length > 100) {
    errors.name = 'Meal plan name must be less than 100 characters';
  }

  // Validate pricing
  if (!formData.pricing.amount || formData.pricing.amount <= 0) {
    errors.pricing = 'Pricing amount must be greater than 0';
  }

  // Validate meal type
  if (!formData.mealType) {
    errors.mealType = 'Meal type is required';
  }

  // Validate meals per day
  if (!formData.mealsPerDay || formData.mealsPerDay < 1 || formData.mealsPerDay > 5) {
    errors.mealsPerDay = 'Meals per day must be between 1 and 5';
  }

  // Validate meal options
  const hasMealOptions = formData.mealOptions.breakfast || formData.mealOptions.lunch || formData.mealOptions.dinner;
  if (!hasMealOptions) {
    errors.mealOptions = 'At least one meal option must be selected';
  }

  // Validate description
  if (!formData.description.trim()) {
    errors.description = 'Description is required';
  } else if (formData.description.trim().length < 10) {
    errors.description = 'Description must be at least 10 characters long';
  } else if (formData.description.trim().length > 500) {
    errors.description = 'Description must be less than 500 characters';
  }

  // Validate leave rules - only if features are enabled
  if (formData.leaveRules.consecutiveLeaveEnabled) {
    if (formData.leaveRules.minConsecutiveDays < 1 || formData.leaveRules.minConsecutiveDays > 31) {
      errors.minConsecutiveDays = 'Min consecutive days must be between 1 and 31';
      console.log('❌ [ADMIN] MinConsecutiveDays validation failed:', formData.leaveRules.minConsecutiveDays);
    }
  } else {
    console.log('⏭️ [ADMIN] Skipping minConsecutiveDays validation (feature disabled)');
  }

  // Validate maxLeaveMeals only if enabled
  if (formData.leaveRules.leaveLimitsEnabled && formData.leaveRules.maxLeaveMealsEnabled) {
    if (formData.leaveRules.maxLeaveMeals < 1) {
      errors['maxLeaveMeals'] = 'Maximum leave meals must be at least 1';
      console.log('❌ [ADMIN] MaxLeaveMeals validation failed:', formData.leaveRules.maxLeaveMeals);
    } else if (formData.leaveRules.maxLeaveMeals > 93) {
      errors['maxLeaveMeals'] = 'Maximum leave meals cannot exceed 93';
      console.log('❌ [ADMIN] MaxLeaveMeals exceeds 93:', formData.leaveRules.maxLeaveMeals);
    }
  } else {
    console.log('⏭️ [ADMIN] Skipping maxLeaveMeals validation (feature disabled)');
  }

  // Validate noticeHours only if enabled
  if (formData.leaveRules.requireTwoHourNotice) {
    if (formData.leaveRules.noticeHours < 1) {
      errors['noticeHours'] = 'Notice hours must be at least 1';
      console.log('❌ [ADMIN] NoticeHours validation failed:', formData.leaveRules.noticeHours);
    } else if (formData.leaveRules.noticeHours > 24) {
      errors['noticeHours'] = 'Notice hours cannot exceed 24';
      console.log('❌ [ADMIN] NoticeHours exceeds 24:', formData.leaveRules.noticeHours);
    }
  } else {
    console.log('⏭️ [ADMIN] Skipping noticeHours validation (feature disabled)');
  }

  const errorCount = Object.values(errors).filter(e => e.trim().length > 0).length;
  console.log(`📊 [ADMIN] Total validation errors: ${errorCount}`, errors);

  return errors;
};

export const formatDefaultMealPlanForBackend = (formData: DefaultMealPlanFormData) => {
  return {
    name: formData.name.trim(),
    pricing: {
      amount: Number(formData.pricing.amount),
      period: formData.pricing.period,
    },
    mealType: formData.mealType,
    mealsPerDay: Number(formData.mealsPerDay),
    mealOptions: {
      breakfast: Boolean(formData.mealOptions.breakfast),
      lunch: Boolean(formData.mealOptions.lunch),
      dinner: Boolean(formData.mealOptions.dinner),
    },
    description: formData.description.trim(),
    isActive: Boolean(formData.isActive),
    leaveRules: {
      maxLeaveMeals: Number(formData.leaveRules.maxLeaveMeals),
      requireTwoHourNotice: Boolean(formData.leaveRules.requireTwoHourNotice),
      noticeHours: Number(formData.leaveRules.noticeHours),
      minConsecutiveDays: Number(formData.leaveRules.minConsecutiveDays),
      extendSubscription: Boolean(formData.leaveRules.extendSubscription),
      autoApproval: Boolean(formData.leaveRules.autoApproval),
      leaveLimitsEnabled: Boolean(formData.leaveRules.leaveLimitsEnabled),
      consecutiveLeaveEnabled: Boolean(formData.leaveRules.consecutiveLeaveEnabled),
      maxLeaveMealsEnabled: Boolean(formData.leaveRules.maxLeaveMealsEnabled),
    },
  };
};

export const formatBackendDefaultMealPlan = (backendPlan: any) => {
  return {
    _id: backendPlan._id,
    name: backendPlan.name,
    pricing: {
      amount: Number(backendPlan.pricing.amount),
      period: backendPlan.pricing.period,
    },
    mealType: backendPlan.mealType,
    mealsPerDay: Number(backendPlan.mealsPerDay),
    mealOptions: {
      breakfast: Boolean(backendPlan.mealOptions?.breakfast ?? true),
      lunch: Boolean(backendPlan.mealOptions?.lunch ?? true),
      dinner: Boolean(backendPlan.mealOptions?.dinner ?? true),
    },
    description: backendPlan.description,
    isActive: Boolean(backendPlan.isActive),
    isDefault: Boolean(backendPlan.isDefault),
    leaveRules: {
      maxLeaveMeals: Number(backendPlan.leaveRules.maxLeaveMeals || 30),
      requireTwoHourNotice: Boolean(backendPlan.leaveRules.requireTwoHourNotice),
      noticeHours: Number(backendPlan.leaveRules.noticeHours),
      minConsecutiveDays: Number(backendPlan.leaveRules.minConsecutiveDays),
      extendSubscription: Boolean(backendPlan.leaveRules.extendSubscription),
      autoApproval: Boolean(backendPlan.leaveRules.autoApproval),
      leaveLimitsEnabled: Boolean(backendPlan.leaveRules.leaveLimitsEnabled),
      consecutiveLeaveEnabled: Boolean(backendPlan.leaveRules.consecutiveLeaveEnabled),
      maxLeaveMealsEnabled: Boolean(backendPlan.leaveRules.maxLeaveMealsEnabled ?? true),
    },
    createdBy: backendPlan.createdBy,
    createdAt: backendPlan.createdAt,
    updatedAt: backendPlan.updatedAt,
  };
};


export const getDefaultMealPlanErrorMessage = (error: any): string => {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  if (error.message) {
    return error.message;
  }
  return 'An unexpected error occurred';
};

export const getDefaultMealPlanConfig = (): DefaultMealPlanConfig => ({
  mealTypes: ['Vegetarian', 'Non-Vegetarian', 'Mixed', 'Custom', 'Vegan'],
  pricingPeriods: [
    { value: 'day', label: 'Per Day' },
    { value: 'week', label: 'Per Week' },
    { value: '15days', label: 'Per 15 Days' },
    { value: 'month', label: 'Per Month' },
    { value: '3months', label: 'Per 3 Months' },
    { value: '6months', label: 'Per 6 Months' },
    { value: 'year', label: 'Per Year' },
  ],
  mealsPerDayOptions: [1, 2, 3, 4, 5],
  mealOptions: [
    { value: 'breakfast', label: 'Breakfast' },
    { value: 'lunch', label: 'Lunch' },
    { value: 'dinner', label: 'Dinner' },
  ],
  maxLeaveMealsLimit: 93,
  minNoticeHours: 1,
  maxNoticeHours: 24,
});

// Calculates an upper-bound for max leave meals based on meals/day and allowed days
export const calculateMaxLeaveMeals = (mealsPerDay: number, maxLeaveDays: number): number => {
  const config = getDefaultMealPlanConfig();
  const perDay = Number.isFinite(mealsPerDay) ? Math.max(0, Math.floor(mealsPerDay)) : 0;
  const days = Number.isFinite(maxLeaveDays) ? Math.max(0, Math.floor(maxLeaveDays)) : 0;
  const raw = perDay * days;
  return Math.min(config.maxLeaveMealsLimit, raw);
};