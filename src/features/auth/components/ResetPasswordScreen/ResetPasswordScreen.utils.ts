import type { ResetPasswordFormData, ResetPasswordErrors } from './ResetPasswordScreen.types';

export const validatePassword = (password: string): { isValid: boolean; message?: string } => {
  if (!password) {
    return { isValid: false, message: 'Password is required' };
  }
  if (password.length < 8) {
    return { isValid: false, message: 'Password must be at least 8 characters' };
  }
  if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
    return { isValid: false, message: 'Password must contain uppercase, lowercase, and number' };
  }
  return { isValid: true };
};

export const validateResetPasswordForm = (
  formData: Pick<ResetPasswordFormData, 'password' | 'confirmPassword'>
): ResetPasswordErrors => {
  const errors: ResetPasswordErrors = {};

  const passwordValidation = validatePassword(formData.password);
  if (!passwordValidation.isValid && passwordValidation.message) {
    errors.password = passwordValidation.message;
  }

  if (!formData.confirmPassword) {
    errors.confirmPassword = 'Please confirm your password';
  } else if (formData.password !== formData.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match';
  }

  return errors;
};

export const sanitizePasswordData = (
  formData: Pick<ResetPasswordFormData, 'password' | 'confirmPassword'>
): Pick<ResetPasswordFormData, 'password' | 'confirmPassword'> => {
  return {
    password: formData.password.trim(),
    confirmPassword: formData.confirmPassword.trim(),
  };
};

export const getResetPasswordErrorMessage = (error: any): string => {
  if (error?.message) {
    return error.message;
  }
  if (error?.response?.data?.message) {
    return error.response.data.message;
  }
  return 'Password reset failed. Please try again.';
};









