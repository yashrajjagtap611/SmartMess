import { AdminFormState } from './Profile.types';

export const validateAdminProfile = (formData: AdminFormState): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!formData.firstName?.trim()) {
    errors.push('First name is required');
  } else if (formData.firstName.length < 2) {
    errors.push('First name must be at least 2 characters');
  }

  if (!formData.lastName?.trim()) {
    errors.push('Last name is required');
  } else if (formData.lastName.length < 2) {
    errors.push('Last name must be at least 2 characters');
  }

  if (formData.phone && !/^[\+]?[1-9][\d]{0,15}$/.test(formData.phone.replace(/\s/g, ''))) {
    errors.push('Please enter a valid phone number');
  }

  if (formData.dateOfBirth) {
    const birthDate = new Date(formData.dateOfBirth);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    
    if (age < 18 || age > 100) {
      errors.push('Age must be between 18 and 100 years');
    }
  }

  if (!formData.department?.trim()) {
    errors.push('Department is required');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

export const formatDateTime = (dateString: string): string => {
  return new Date(dateString).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

