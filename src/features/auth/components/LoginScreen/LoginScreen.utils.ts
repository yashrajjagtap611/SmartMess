export const validateEmail = (email: string): boolean => {
  if (!email || typeof email !== 'string') return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
};

export const sanitizeEmail = (email: string): string => {
  if (!email || typeof email !== 'string') return '';
  return email.trim().toLowerCase();
};

export const getLoginErrorMessage = (error: unknown): string => {
  if (error && typeof error === 'object' && 'message' in error) {
    const message = (error as { message: string }).message;
    if (message.includes('not registered')) return 'No account found with this email address';
    if (message.includes('wrong password')) return 'Incorrect password. Please try again';
    if (message.toLowerCase().includes('network')) return 'Network error. Please check your connection';
    return message;
  }
  
  const message = String(error || '');
  if (!message) return 'An unexpected error occurred. Please try again';
  if (message.includes('not registered')) return 'No account found with this email address';
  if (message.includes('wrong password')) return 'Incorrect password. Please try again';
  if (message.toLowerCase().includes('network')) return 'Network error. Please check your connection';
  return message;
};

