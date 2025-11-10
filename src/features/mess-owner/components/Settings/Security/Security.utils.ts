export const validatePassword = (password: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validatePasswordChange = (currentPassword: string, newPassword: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!currentPassword.trim()) {
    errors.push('Current password is required');
  }

  if (!newPassword.trim()) {
    errors.push('New password is required');
  }

  if (currentPassword === newPassword) {
    errors.push('New password must be different from current password');
  }

  const passwordValidation = validatePassword(newPassword);
  errors.push(...passwordValidation.errors);

  return {
    isValid: errors.length === 0,
    errors
  };
};

export const getSecuritySettingsErrorMessage = (error: any): string => {
  if (error?.message) {
    return error.message;
  }
  if (error?.response?.data?.message) {
    return error.response.data.message;
  }
  return 'An error occurred while processing security settings. Please try again.';
};

export const hashPassword = (password: string): string => {
  // TODO: Implement proper password hashing
  return btoa(password);
};

export const comparePasswords = (password1: string, password2: string): boolean => {
  return password1 === password2;
};






