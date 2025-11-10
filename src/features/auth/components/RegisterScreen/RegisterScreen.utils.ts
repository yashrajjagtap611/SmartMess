import type { RegisterFormData, RegisterErrors } from './RegisterScreen.types';

export const validateEmail = (email: string): boolean => {
  return /\S+@\S+\.\S+/.test(email);
};

export const validatePhone = (phone: string): boolean => {
  // Match backend validation: 10-15 digits only
  return /^[0-9]{10,15}$/.test(phone);
};

export const validatePassword = (password: string): { isValid: boolean; message?: string } => {
  if (!password) {
    return { isValid: false, message: 'Password is required' };
  }
  if (password.length < 8) {
    return { isValid: false, message: 'Password must be at least 8 characters' };
  }
  // Match backend validation: uppercase, lowercase, digit, and special character
  if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/.test(password)) {
    return { isValid: false, message: 'Password must contain uppercase, lowercase, number, and special character' };
  }
  return { isValid: true };
};

export const validateRegisterForm = (formData: Omit<RegisterFormData, 'role'>): RegisterErrors => {
  const errors: RegisterErrors = {};

  if (!formData.firstName.trim()) {
    errors.firstName = 'First name is required';
  } else if (formData.firstName.trim().length < 2) {
    errors.firstName = 'First name must be at least 2 characters long';
  } else if (!/^[a-zA-Z\s]+$/.test(formData.firstName.trim())) {
    errors.firstName = 'First name can only contain letters and spaces';
  }

  if (!formData.lastName.trim()) {
    errors.lastName = 'Last name is required';
  } else if (formData.lastName.trim().length < 2) {
    errors.lastName = 'Last name must be at least 2 characters long';
  } else if (!/^[a-zA-Z\s]+$/.test(formData.lastName.trim())) {
    errors.lastName = 'Last name can only contain letters and spaces';
  }

  if (!formData.email) {
    errors.email = 'Email is required';
  } else if (!validateEmail(formData.email)) {
    errors.email = 'Please enter a valid email';
  }

  if (!formData.phone) {
    errors.phone = 'Phone number is required';
  } else if (!validatePhone(formData.phone)) {
    errors.phone = 'Please enter a valid phone number';
  }

  const passwordValidation = validatePassword(formData.password);
  if (!passwordValidation.isValid) {
    errors.password = passwordValidation.message || 'Password is invalid';
  }

  if (!formData.confirmPassword) {
    errors.confirmPassword = 'Please confirm your password';
  } else if (formData.password !== formData.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match';
  }

  return errors;
};

export const sanitizeFormData = (formData: Omit<RegisterFormData, 'role'>): Omit<RegisterFormData, 'role'> => {
  return {
    firstName: formData.firstName.trim(),
    lastName: formData.lastName.trim(),
    email: formData.email.trim().toLowerCase(),
    phone: formData.phone.trim(),
    password: formData.password,
    confirmPassword: formData.confirmPassword,
  };
};

export const getRegisterErrorMessage = (error: any): string => {
  if (error?.message) {
    return error.message;
  }
  if (error?.response?.data?.message) {
    return error.response.data.message;
  }
  return 'Registration failed. Please try again.';
};




