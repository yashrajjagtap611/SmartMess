import type { OperatingHour } from './OperatingHours.types';

export const getDefaultOperatingHours = (): OperatingHour[] => {
  return [
    { meal: "breakfast", enabled: true, start: "07:00", end: "10:00" },
    { meal: "lunch", enabled: true, start: "12:00", end: "15:00" },
    { meal: "dinner", enabled: true, start: "19:00", end: "22:00" },
  ];
};

export const validateTimeRange = (start: string, end: string): boolean => {
  if (!start || !end) return true; // Allow empty values during editing
  const startTime = new Date(`2000-01-01T${start}`);
  const endTime = new Date(`2000-01-01T${end}`);
  return startTime < endTime;
};

export const getMealDisplayName = (meal: string): string => {
  return meal.charAt(0).toUpperCase() + meal.slice(1);
};

export const formatTimeForDisplay = (time: string): string => {
  if (!time) return '';
  return time;
};

export const validateOperatingHours = (operatingHours: OperatingHour[]): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  operatingHours.forEach((hour) => {
    if (hour.enabled) {
      if (!hour.start || !hour.end) {
        errors.push(`${getMealDisplayName(hour.meal)}: Start and end times are required when enabled`);
      } else if (!validateTimeRange(hour.start, hour.end)) {
        errors.push(`${getMealDisplayName(hour.meal)}: Start time must be before end time`);
      }
    }
  });

  return {
    isValid: errors.length === 0,
    errors
  };
};

export const getOperatingHoursErrorMessage = (error: any): string => {
  if (error?.message) {
    return error.message;
  }
  if (error?.response?.data?.message) {
    return error.response.data.message;
  }
  return 'An error occurred while processing operating hours. Please try again.';
};






