/**
 * Utility functions for consistent date handling across meal management components
 */

/**
 * Normalizes a date to start of day in local timezone
 * This ensures consistent date comparisons across components
 */
export const normalizeDate = (date: Date): Date => {
  const normalized = new Date(date);
  normalized.setHours(0, 0, 0, 0);
  return normalized;
};

/**
 * Formats date to YYYY-MM-DD string for consistent comparison
 * This is the standard format used across all components
 */
export const formatDateForComparison = (date: Date): string => {
  const normalized = normalizeDate(date);
  const year = normalized.getFullYear();
  const month = String(normalized.getMonth() + 1).padStart(2, '0');
  const day = String(normalized.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Checks if two dates are the same day
 */
export const isSameDay = (date1: Date, date2: Date): boolean => {
  return formatDateForComparison(date1) === formatDateForComparison(date2);
};

/**
 * Gets the start of the week (Monday) for a given date
 */
export const getStartOfWeek = (date: Date): Date => {
  const startOfWeek = normalizeDate(date);
  const dayOfWeek = startOfWeek.getDay();
  const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Monday = 0
  startOfWeek.setDate(startOfWeek.getDate() - daysToSubtract);
  return startOfWeek;
};

/**
 * Gets an array of 7 dates starting from Monday of the week containing the given date
 */
export const getWeekDates = (date: Date): Date[] => {
  const startOfWeek = getStartOfWeek(date);
  const dates = [];
  
  for (let i = 0; i < 7; i++) {
    const weekDate = new Date(startOfWeek);
    weekDate.setDate(startOfWeek.getDate() + i);
    dates.push(weekDate);
  }
  
  return dates;
};

/**
 * Checks if a date is today
 */
export const isToday = (date: Date): boolean => {
  const today = new Date();
  return isSameDay(date, today);
};

/**
 * Formats date for display in UI
 */
export const formatDisplayDate = (date: Date): string => {
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = String(d.getFullYear());
  return `${day}/${month}/${year}`;
};

/**
 * Formats date for backend API calls
 */
export const formatDateForAPI = (date: Date): string => {
  return formatDateForComparison(date);
};
