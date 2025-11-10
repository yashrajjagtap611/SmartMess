/**
 * Validates email format using regex pattern
 * @param email - Email string to validate
 * @returns boolean indicating if email is valid
 */
export const validateEmail = (email: string): boolean => {
  if (!email || typeof email !== 'string') {
    return false;
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
};

/**
 * Sanitizes email input by trimming whitespace and converting to lowercase
 * @param email - Raw email input
 * @returns sanitized email string
 */
export const sanitizeEmail = (email: string): string => {
  if (!email || typeof email !== 'string') {
    return '';
  }
  
  return email.trim().toLowerCase();
};

/**
 * Generates user-friendly error messages for forgot password scenarios
 * @param error - Error object or message
 * @returns user-friendly error message
 */
export const getForgotPasswordErrorMessage = (error: unknown): string => {
  if (typeof error === 'string') {
    return error;
  }
  
  if (error && typeof error === 'object' && 'message' in error) {
    const errorObj = error as { message: string };
    // Handle specific API error messages
    if (errorObj.message.includes('User not found')) {
      return 'No account found with this email address';
    }
    if (errorObj.message.includes('Rate limit')) {
      return 'Too many requests. Please wait before trying again';
    }
    if (errorObj.message.includes('Network')) {
      return 'Network error. Please check your connection';
    }
    
    return errorObj.message;
  }
  
  return 'An unexpected error occurred. Please try again';
};
