import type { MealPlan, MessDetails } from './MessDetailsModal.types';

/**
 * Gets the display text for a meal plan period
 */
export const getPeriodDisplay = (period: string): string => {
  switch (period) {
    case 'day': return 'per day';
    case 'week': return 'per week';
    case 'month': return 'per month';
    case 'year': return 'per year';
    default: return period;
  }
};

/**
 * Generates UPI payment link
 */
export const generateUPILink = (amount: number, upiId: string, messName: string): string => {
  return `upi://pay?pa=${upiId}&pn=${encodeURIComponent(messName)}&am=${amount}&cu=INR`;
};

/**
 * Formats currency amount
 */
export const formatCurrency = (amount: number): string => {
  return `₹${amount.toLocaleString('en-IN')}`;
};

/**
 * Calculates available spots in a mess
 */
export const getAvailableSpots = (mess: MessDetails): number => {
  return mess.capacity - mess.currentMembers;
};

/**
 * Checks if a mess has available spots
 */
export const hasAvailableSpots = (mess: MessDetails): boolean => {
  return getAvailableSpots(mess) > 0;
};

/**
 * Gets the rating display with stars
 */
export const getRatingDisplay = (rating?: number, reviews?: number): string => {
  if (!rating) return 'No ratings yet';
  const stars = '★'.repeat(Math.floor(rating)) + '☆'.repeat(5 - Math.floor(rating));
  return `${stars} ${rating} (${reviews || 0} reviews)`;
};

/**
 * Formats the capacity display
 */
export const formatCapacityDisplay = (currentMembers: number, capacity: number): string => {
  const available = capacity - currentMembers;
  if (available <= 0) return 'Full';
  return `${available} spots available`;
};

/**
 * Validates if a meal plan can be selected
 */
export const canSelectMealPlan = (mealPlan: MealPlan): boolean => {
  return mealPlan.isActive;
};

/**
 * Gets meal plan validation errors
 */
export const getMealPlanValidationErrors = (mealPlan: MealPlan): string[] => {
  const errors: string[] = [];
  
  if (!mealPlan.isActive) {
    errors.push('This meal plan is not currently active');
  }
  
  if (mealPlan.pricing.amount <= 0) {
    errors.push('Invalid pricing for this meal plan');
  }
  
  return errors;
};

/**
 * Formats leave rules for display
 */
export const formatLeaveRules = (leaveRules: MealPlan['leaveRules']): string[] => {
  const rules: string[] = [];
  
  if (leaveRules.maxLeaveDaysEnabled && leaveRules.maxLeaveDays > 0) {
    rules.push(`Maximum ${leaveRules.maxLeaveDays} leave days`);
  }
  
  if (leaveRules.requireTwoHourNotice) {
    rules.push(`${leaveRules.noticeHours} hours notice required`);
  }
  
  if (leaveRules.autoApproval) {
    rules.push('Auto-approval enabled');
  } else {
    rules.push('Manual approval required');
  }
  
  if (leaveRules.extendSubscription) {
    rules.push('Subscription extends with leave');
  }
  
  return rules;
};

/**
 * Sorts meal plans by price (ascending)
 */
export const sortMealPlansByPrice = (mealPlans: MealPlan[]): MealPlan[] => {
  return [...mealPlans].sort((a, b) => a.pricing.amount - b.pricing.amount);
};

/**
 * Filters active meal plans
 */
export const getActiveMealPlans = (mealPlans: MealPlan[]): MealPlan[] => {
  return mealPlans.filter(plan => plan.isActive);
};

/**
 * Gets the cheapest meal plan
 */
export const getCheapestMealPlan = (mealPlans: MealPlan[]): MealPlan | null => {
  const activePlans = getActiveMealPlans(mealPlans);
  if (activePlans.length === 0) return null;
  
  return activePlans.reduce((cheapest, current) => 
    current.pricing.amount < cheapest.pricing.amount ? current : cheapest
  );
};

/**
 * Validates UPI ID format
 */
export const isValidUPIId = (upiId: string): boolean => {
  const upiRegex = /^[\w.-]+@[\w.-]+$/;
  return upiRegex.test(upiId);
};

