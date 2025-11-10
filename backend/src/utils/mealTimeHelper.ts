import { Document } from 'mongoose';

export interface MealTimeWindow {
  mealType: 'breakfast' | 'lunch' | 'dinner';
  startTime: string; // HH:MM format
  endTime: string;   // HH:MM format
  enabled: boolean;
}

export interface NoticeCheckResult {
  meetsNotice: boolean;
  hoursUntilMealEnd: number;
  requiredHours: number;
  mealEndTime: Date;
  reason: string;
}

export interface MealNoticeValidation {
  mealType: 'breakfast' | 'lunch' | 'dinner';
  date: Date;
  meetsNotice: boolean;
  hoursRemaining: number;
  mealEndTime: Date;
  reason: string;
}

export class MealTimeHelper {
  /**
   * Parse time string in HH:MM format to minutes from midnight
   */
  static parseTimeToMinutes(timeStr: string): number {
    const [hoursStr, minutesStr] = timeStr.split(':');
    const hours = Number(hoursStr) || 0;
    const minutes = Number(minutesStr) || 0;
    return hours * 60 + minutes;
  }

  /**
   * Get current time in minutes from midnight
   */
  static getCurrentTimeInMinutes(): number {
    const now = new Date();
    return now.getHours() * 60 + now.getMinutes();
  }

  /**
   * Check if current time is within notice period before meal ends
   * @param mealEndTime - Meal end time in HH:MM format
   * @param noticeHours - Required notice hours before meal
   * @param currentTime - Optional current time for testing
   * @returns Result object with notice validation details
   */
  static checkNoticeRequirement(
    mealEndTime: string,
    noticeHours: number,
    currentTime?: Date
  ): NoticeCheckResult {
    const now = currentTime || new Date();
    const mealEndMinutes = this.parseTimeToMinutes(mealEndTime);
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    
    const noticeMinutes = noticeHours * 60;
    const noticeDeadlineMinutes = mealEndMinutes - noticeMinutes;
    
    const hoursUntilMealEnd = (mealEndMinutes - currentMinutes) / 60;
    const meetsNotice = currentMinutes <= noticeDeadlineMinutes;
    
    return {
      meetsNotice,
      hoursUntilMealEnd: Math.max(0, hoursUntilMealEnd),
      requiredHours: noticeHours,
      mealEndTime: new Date(),
      reason: meetsNotice 
        ? `✅ Meets ${noticeHours}-hour notice period`
        : `❌ Too late for ${noticeHours}-hour notice (deadline was at ${this.minutesToTimeString(noticeDeadlineMinutes)})`
    };
  }

  /**
   * Convert minutes from midnight to HH:MM format
   */
  static minutesToTimeString(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
  }

  /**
   * Validate meals for a specific date considering notice period
   * @param date - The date for which meals are being requested
   * @param mealWindows - Array of meal time windows from operating hours
   * @param noticeHours - Required notice hours
   * @param requestedMealTypes - Meal types being requested
   * @returns Array of validation results for each requested meal
   */
  static validateMealsForDate(
    date: Date,
    mealWindows: MealTimeWindow[],
    noticeHours: number,
    requestedMealTypes: Array<'breakfast' | 'lunch' | 'dinner'>
  ): MealNoticeValidation[] {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const requestDate = new Date(date);
    requestDate.setHours(0, 0, 0, 0);
    
    const isToday = today.getTime() === requestDate.getTime();
    const results: MealNoticeValidation[] = [];

    for (const mealType of requestedMealTypes) {
      const mealWindow = mealWindows.find(w => w.mealType === mealType && w.enabled);
      
      if (!mealWindow) {
        results.push({
          mealType,
          date,
          meetsNotice: false,
          hoursRemaining: 0,
          mealEndTime: new Date(),
          reason: `${mealType} is not available today`
        });
        continue;
      }

      if (!isToday) {
        results.push({
          mealType,
          date,
          meetsNotice: true,
          hoursRemaining: 24,
          mealEndTime: new Date(),
          reason: `Future date - notice period will be checked at request time`
        });
      } else {
        // For today, check notice period
        const now = new Date();
        const mealEndTime = new Date();
        const [endHoursStr, endMinutesStr] = mealWindow.endTime.split(':');
        const endHours = Number(endHoursStr) || 0;
        const endMinutes = Number(endMinutesStr) || 0;
        mealEndTime.setHours(endHours, endMinutes, 0, 0);

        // Check if meal has already ended
        if (now > mealEndTime) {
          results.push({
            mealType,
            date,
            meetsNotice: false,
            hoursRemaining: 0,
            mealEndTime,
            reason: `${mealType} has already ended at ${mealWindow.endTime}`
          });
          continue;
        }

        // Calculate notice deadline
        const noticeDeadline = new Date(mealEndTime.getTime() - (noticeHours * 60 * 60 * 1000));
        const meetsNotice = now <= noticeDeadline;
        const hoursRemaining = (mealEndTime.getTime() - now.getTime()) / (1000 * 60 * 60);

        results.push({
          mealType,
          date,
          meetsNotice,
          hoursRemaining,
          mealEndTime,
          reason: meetsNotice 
            ? `✅ Meets ${noticeHours}-hour notice period (ends at ${mealWindow.endTime})`
            : `❌ Within 2-hour notice window - leave will NOT get billing deduction/extension`
        });
      }
    }

    return results;
  }

  /**
   * Calculate deduction-eligible meals and non-deduction meals
   * @param startDate - Leave start date
   * @param endDate - Leave end date
   * @param startDateMealTypes - Meals on start date
   * @param endDateMealTypes - Meals on end date
   * @param middleDaysMealTypes - Meals on middle days
   * @param noticeValidations - Array of meal notice validations
   * @returns Object with deduction-eligible and non-deduction meal counts
   */
  static calculateDeductionEligibleMeals(
    startDate: Date,
    endDate: Date,
    startDateMealTypes: Array<'breakfast' | 'lunch' | 'dinner'>,
    endDateMealTypes: Array<'breakfast' | 'lunch' | 'dinner'>,
    middleDaysMealTypes: Array<'breakfast' | 'lunch' | 'dinner'>,
    noticeValidations: MealNoticeValidation[]
  ): {
    deductionEligibleMeals: number;
    nonDeductionMeals: number;
    noticePeriodsNotMet: Array<{ mealType: string; date: Date; reason: string }>;
  } {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startDateObj = new Date(startDate);
    startDateObj.setHours(0, 0, 0, 0);
    const endDateObj = new Date(endDate);
    endDateObj.setHours(0, 0, 0, 0);
    
    const isStartToday = today.getTime() === startDateObj.getTime();
    const isEndToday = today.getTime() === endDateObj.getTime();
    
    let deductionEligibleMeals = 0;
    let nonDeductionMeals = 0;
    const noticePeriodsNotMet: Array<{ mealType: string; date: Date; reason: string }> = [];

    // Count start date meals
    for (const mealType of startDateMealTypes) {
      if (isStartToday) {
        const validation = noticeValidations.find(v => v.mealType === mealType && v.date.getTime() === startDateObj.getTime());
        if (validation && !validation.meetsNotice) {
          nonDeductionMeals++;
          noticePeriodsNotMet.push({ mealType, date: startDate, reason: validation.reason });
        } else {
          deductionEligibleMeals++;
        }
      } else {
        deductionEligibleMeals++;
      }
    }

    // Count end date meals (if different from start date)
    if (endDateObj.getTime() !== startDateObj.getTime()) {
      for (const mealType of endDateMealTypes) {
        if (isEndToday) {
          const validation = noticeValidations.find(v => v.mealType === mealType && v.date.getTime() === endDateObj.getTime());
          if (validation && !validation.meetsNotice) {
            nonDeductionMeals++;
            noticePeriodsNotMet.push({ mealType, date: endDate, reason: validation.reason });
          } else {
            deductionEligibleMeals++;
          }
        } else {
          deductionEligibleMeals++;
        }
      }
    }

    // Count middle days meals
    if (endDateObj.getTime() - startDateObj.getTime() > 24 * 60 * 60 * 1000) {
      const totalDays = Math.ceil((endDateObj.getTime() - startDateObj.getTime()) / (1000 * 60 * 60 * 24));
      const middleDayCount = Math.max(0, totalDays - 2);
      deductionEligibleMeals += middleDayCount * middleDaysMealTypes.length;
    }

    return {
      deductionEligibleMeals,
      nonDeductionMeals,
      noticePeriodsNotMet
    };
  }
}
