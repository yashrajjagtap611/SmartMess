/**
 * Utility functions for calculating billing periods
 */

export type BillingPeriod = 'day' | 'week' | '15days' | 'month' | '3months' | '6months' | 'year';

export interface BillingPeriodRange {
  start: Date;
  end: Date;
  period: BillingPeriod;
}

/**
 * Calculate the billing period range for a given date and period type
 */
export function calculateBillingPeriodRange(date: Date, period: BillingPeriod): BillingPeriodRange {
  const periodStart = new Date(date);
  const periodEnd = new Date(date);
  
  switch (period) {
    case 'day':
      periodStart.setHours(0, 0, 0, 0);
      periodEnd.setHours(23, 59, 59, 999);
      break;
      
    case 'week':
      // Start from Sunday (0) to Saturday (6)
      const dayOfWeek = periodStart.getDay();
      periodStart.setDate(periodStart.getDate() - dayOfWeek);
      periodStart.setHours(0, 0, 0, 0);
      periodEnd.setDate(periodStart.getDate() + 6);
      periodEnd.setHours(23, 59, 59, 999);
      break;
      
    case '15days':
      const dayOfMonth = periodStart.getDate();
      if (dayOfMonth <= 15) {
        // First half of month (1-15)
        periodStart.setDate(1);
        periodStart.setHours(0, 0, 0, 0);
        periodEnd.setDate(15);
        periodEnd.setHours(23, 59, 59, 999);
      } else {
        // Second half of month (16-end)
        periodStart.setDate(16);
        periodStart.setHours(0, 0, 0, 0);
        periodEnd.setMonth(periodEnd.getMonth() + 1, 0); // Last day of current month
        periodEnd.setHours(23, 59, 59, 999);
      }
      break;
      
    case 'month':
      periodStart.setDate(1);
      periodStart.setHours(0, 0, 0, 0);
      periodEnd.setMonth(periodEnd.getMonth() + 1, 0); // Last day of current month
      periodEnd.setHours(23, 59, 59, 999);
      break;
      
    case '3months':
      // Quarterly periods: Jan-Mar, Apr-Jun, Jul-Sep, Oct-Dec
      const currentMonth = periodStart.getMonth();
      const quarterStart = Math.floor(currentMonth / 3) * 3;
      periodStart.setMonth(quarterStart, 1);
      periodStart.setHours(0, 0, 0, 0);
      periodEnd.setMonth(quarterStart + 3, 0); // Last day of quarter
      periodEnd.setHours(23, 59, 59, 999);
      break;
      
    case '6months':
      // Half-yearly periods: Jan-Jun, Jul-Dec
      const halfYearStart = periodStart.getMonth() < 6 ? 0 : 6;
      periodStart.setMonth(halfYearStart, 1);
      periodStart.setHours(0, 0, 0, 0);
      periodEnd.setMonth(halfYearStart + 6, 0); // Last day of half-year
      periodEnd.setHours(23, 59, 59, 999);
      break;
      
    case 'year':
      periodStart.setMonth(0, 1); // January 1st
      periodStart.setHours(0, 0, 0, 0);
      periodEnd.setMonth(11, 31); // December 31st
      periodEnd.setHours(23, 59, 59, 999);
      break;
      
    default:
      // Default to monthly if unknown period
      periodStart.setDate(1);
      periodStart.setHours(0, 0, 0, 0);
      periodEnd.setMonth(periodEnd.getMonth() + 1, 0);
      periodEnd.setHours(23, 59, 59, 999);
  }
  
  return {
    start: periodStart,
    end: periodEnd,
    period
  };
}

/**
 * Get a human-readable description of the billing period
 */
export function getBillingPeriodDescription(period: BillingPeriod): string {
  switch (period) {
    case 'day': return 'Daily';
    case 'week': return 'Weekly';
    case '15days': return 'Bi-monthly (15 days)';
    case 'month': return 'Monthly';
    case '3months': return 'Quarterly (3 months)';
    case '6months': return 'Half-yearly (6 months)';
    case 'year': return 'Yearly';
    default: return 'Monthly';
  }
}

/**
 * Calculate the number of days in a billing period
 */
export function getBillingPeriodDays(period: BillingPeriod, referenceDate: Date = new Date()): number {
  const range = calculateBillingPeriodRange(referenceDate, period);
  return Math.ceil((range.end.getTime() - range.start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
}

/**
 * Check if a date falls within a billing period range
 */
export function isDateInBillingPeriod(date: Date, period: BillingPeriod, referenceDate: Date = new Date()): boolean {
  const range = calculateBillingPeriodRange(referenceDate, period);
  return date >= range.start && date <= range.end;
}

/**
 * Calculate subscription end date based on billing period
 * This gives the END of the subscription period (not the start of next period)
 * @param startDate - When the subscription starts
 * @param period - The billing period type
 * @returns Date representing the end of the billing period
 */
export function calculateSubscriptionEndDate(startDate: Date, period: BillingPeriod): Date {
  const endDate = new Date(startDate);
  
  switch (period) {
    case 'day':
      // Same day, end of day
      endDate.setHours(23, 59, 59, 999);
      break;
      
    case 'week':
      // End of week (6 days from start)
      endDate.setDate(endDate.getDate() + 6);
      endDate.setHours(23, 59, 59, 999);
      break;
      
    case '15days':
      // 15 days from start (Day 1 to Day 15 = 14 more days)
      endDate.setDate(endDate.getDate() + 14);
      endDate.setHours(23, 59, 59, 999);
      break;
      
    case 'month':
      // Add 1 month from start date, then subtract 1 day (subscription period)
      endDate.setMonth(endDate.getMonth() + 1);
      endDate.setDate(endDate.getDate() - 1);
      endDate.setHours(23, 59, 59, 999);
      break;
      
    case '3months':
      // Add 3 months from start date, then subtract 1 day (subscription period)
      endDate.setMonth(endDate.getMonth() + 3);
      endDate.setDate(endDate.getDate() - 1);
      endDate.setHours(23, 59, 59, 999);
      break;
      
    case '6months':
      // Add 6 months from start date, then subtract 1 day (subscription period)
      endDate.setMonth(endDate.getMonth() + 6);
      endDate.setDate(endDate.getDate() - 1);
      endDate.setHours(23, 59, 59, 999);
      break;
      
    case 'year':
      // Add 1 year from start date, then subtract 1 day (subscription period)
      endDate.setFullYear(endDate.getFullYear() + 1);
      endDate.setDate(endDate.getDate() - 1);
      endDate.setHours(23, 59, 59, 999);
      break;
      
    default:
      // Default to 30 days from start
      endDate.setDate(endDate.getDate() + 29);
      endDate.setHours(23, 59, 59, 999);
  }
  
  return endDate;
}
