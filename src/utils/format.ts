/**
 * Format utility functions
 */

/**
 * Format a number as currency
 * @param amount - The amount to format
 * @param currency - The currency code (default: 'INR')
 * @param locale - The locale (default: 'en-IN')
 * @returns Formatted currency string
 */
export function formatCurrency(
  amount: number,
  currency: string = 'INR',
  locale: string = 'en-IN'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
  }).format(amount);
}

/**
 * Format a number with thousand separators
 * @param num - The number to format
 * @param locale - The locale (default: 'en-IN')
 * @returns Formatted number string
 */
export function formatNumber(num: number, locale: string = 'en-IN'): string {
  return new Intl.NumberFormat(locale).format(num);
}

/**
 * Format a date to a readable string
 * @param date - The date to format
 * @param locale - The locale (default: 'en-IN')
 * @returns Formatted date string
 */
export function formatDate(date: Date | string, locale: string = 'en-IN'): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(dateObj);
}

