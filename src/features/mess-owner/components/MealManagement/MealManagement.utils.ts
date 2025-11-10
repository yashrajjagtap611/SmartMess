import { MealPlan, Meal, MealType, MealCategory } from './MealManagement.types';

export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
  }).format(price);
};

export const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
};

export const formatTime = (date: Date): string => {
  return new Intl.DateTimeFormat('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(date);
};

export const getMealTypeIcon = (type: MealType): string => {
  switch (type) {
    case 'breakfast':
      return '🌅';
    case 'lunch':
      return '☀️';
    case 'dinner':
      return '🌙';
    default:
      return '🍽️';
  }
};

export const getMealTypeColor = (type: MealType): string => {
  switch (type) {
    case 'breakfast':
      return 'text-orange-600 bg-orange-100 dark:text-orange-400 dark:bg-orange-900/20';
    case 'lunch':
      return 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/20';
    case 'dinner':
      return 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/20';
    default:
      return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900/20';
  }
};

export const getMealCategoryIcon = (category: MealCategory): string => {
  switch (category) {
    case 'vegetarian':
      return '🥬';
    case 'non-vegetarian':
      return '🍗';
    case 'vegan':
      return '🌱';
    case 'jain':
      return '🕉️';
    case 'eggetarian':
      return '🥚';
    default:
      return '🍽️';
  }
};

export const getMealCategoryColor = (category: MealCategory): string => {
  switch (category) {
    case 'vegetarian':
      return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/20';
    case 'non-vegetarian':
      return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/20';
    case 'vegan':
      return 'text-emerald-600 bg-emerald-100 dark:text-emerald-400 dark:bg-emerald-900/20';
    case 'jain':
      return 'text-purple-600 bg-purple-100 dark:text-purple-400 dark:bg-purple-900/20';
    case 'eggetarian':
      return 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/20';
    default:
      return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900/20';
  }
};

export const filterMealsByDate = (meals: Meal[], date: Date): Meal[] => {
  const targetDate = new Date(date);
  return meals.filter(meal => {
    const mealDate = new Date(meal.date);
    return (
      mealDate.getFullYear() === targetDate.getFullYear() &&
      mealDate.getMonth() === targetDate.getMonth() &&
      mealDate.getDate() === targetDate.getDate()
    );
  });
};

export const filterMealsByType = (meals: Meal[], type: MealType): Meal[] => {
  return meals.filter(meal => meal.type === type);
};

export const filterMealsByCategory = (meals: Meal[], category: MealCategory): Meal[] => {
  return meals.filter(meal => 
    meal.category === category || 
    (meal.categories && meal.categories.includes(category))
  );
};

export const filterMealsByMealPlan = (meals: Meal[], mealPlanId: string): Meal[] => {
  return meals.filter(meal => meal.associatedMealPlans.includes(mealPlanId));
};

export const sortMealsByDate = (meals: Meal[]): Meal[] => {
  return [...meals].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
};

export const getActiveMealPlans = (mealPlans: MealPlan[]): MealPlan[] => {
  return mealPlans.filter(plan => plan.isActive);
};

export const calculateTotalRevenue = (meals: Meal[]): number => {
  return meals.reduce((total, meal) => total + meal.price, 0);
};

export const getMealStats = (meals: Meal[]) => {
  const availableMeals = meals.filter(meal => meal.isAvailable).length;
  const breakfastCount = meals.filter(meal => meal.type === 'breakfast').length;
  const lunchCount = meals.filter(meal => meal.type === 'lunch').length;
  const dinnerCount = meals.filter(meal => meal.type === 'dinner').length;
  
  // Category counts - check both single category and categories array
  const vegetarianCount = meals.filter(meal => 
    meal.category === 'vegetarian' || 
    (meal.categories && meal.categories.includes('vegetarian'))
  ).length;
  const nonVegetarianCount = meals.filter(meal => 
    meal.category === 'non-vegetarian' || 
    (meal.categories && meal.categories.includes('non-vegetarian'))
  ).length;
  const veganCount = meals.filter(meal => 
    meal.category === 'vegan' || 
    (meal.categories && meal.categories.includes('vegan'))
  ).length;
  const jainCount = meals.filter(meal => 
    meal.category === 'jain' || 
    (meal.categories && meal.categories.includes('jain'))
  ).length;
  const eggetarianCount = meals.filter(meal => 
    meal.category === 'eggetarian' || 
    (meal.categories && meal.categories.includes('eggetarian'))
  ).length;

  const totalMeals = meals.length;
  return {
    totalMeals,
    availableMeals,
    unavailableMeals: totalMeals - availableMeals,
    breakfastCount,
    lunchCount,
    dinnerCount,
    vegetarianCount,
    nonVegetarianCount,
    veganCount,
    jainCount,
    eggetarianCount,
    availabilityRate: totalMeals > 0 ? (availableMeals / totalMeals) * 100 : 0,
  };
};

export const getMealPlanStats = (meals: Meal[], mealPlans: MealPlan[]) => {
  const mealPlanStats = mealPlans.map(plan => {
    const planMeals = filterMealsByMealPlan(meals, plan.id);
    const totalRevenue = calculateTotalRevenue(planMeals);
    const mealCount = planMeals.length;
    
    return {
      planId: plan.id,
      planName: plan.name,
      mealCount,
      totalRevenue,
      averagePrice: mealCount > 0 ? totalRevenue / mealCount : 0,
    };
  });

  return mealPlanStats;
};

export const validateMealData = (data: any): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (!data.name || data.name.trim().length === 0) {
    errors.push('Meal name is required');
  }
  
  if (!data.type) {
    errors.push('Meal type is required');
  }
  
  // Check for categories array (new multi-select) or fallback to single category
  if (!data.categories || data.categories.length === 0) {
    if (!data.category) {
      errors.push('At least one meal category is required');
    }
  } else if (data.categories.length === 0) {
    errors.push('At least one meal category is required');
  }
  
  if (!data.date) {
    errors.push('Meal date is required');
  }
  
  if (data.associatedMealPlans && data.associatedMealPlans.length === 0) {
    errors.push('At least one meal plan must be selected');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const generateMealTags = (): Array<{ name: string; color: string }> => {
  const tagColors = [
    'bg-red-100 text-red-800',
    'bg-blue-100 text-blue-800',
    'bg-green-100 text-green-800',
    'bg-yellow-100 text-yellow-800',
    'bg-purple-100 text-purple-800',
    'bg-pink-100 text-pink-800',
    'bg-indigo-100 text-indigo-800',
    'bg-gray-100 text-gray-800',
  ];
  
  const commonTags = [
    'Spicy', 'Mild', 'Sweet', 'Sour', 'Bitter', 'Umami',
    'Healthy', 'Comfort', 'Quick', 'Traditional', 'Modern',
    'Seasonal', 'Local', 'Organic', 'Gluten-Free', 'Dairy-Free',
    'High-Protein', 'Low-Carb', 'Keto-Friendly', 'Vegan-Friendly'
  ];
  
  return commonTags.map((tag, index) => ({
    name: tag,
    color: tagColors[index % tagColors.length] || 'bg-gray-100 text-gray-800',
  }));
};
