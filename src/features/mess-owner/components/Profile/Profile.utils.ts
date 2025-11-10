import { PersonalInfoForm, MessFormState } from './Profile.types';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PINCODE_REGEX = /^\d{6}$/;

export const validatePersonalInfo = (formData: PersonalInfoForm): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!formData.firstName?.trim()) {
    errors.push('First name is required');
  } else if (formData.firstName.trim().length < 2) {
    errors.push('First name must be at least 2 characters');
  }

  if (!formData.lastName?.trim()) {
    errors.push('Last name is required');
  } else if (formData.lastName.trim().length < 2) {
    errors.push('Last name must be at least 2 characters');
  }

  if (formData.phone && !/^[\+]?[1-9][\d]{0,15}$/.test(formData.phone.replace(/\s/g, ''))) {
    errors.push('Please enter a valid phone number');
  }

  if (formData.dob) {
    const birthDate = new Date(formData.dob);
    if (!Number.isNaN(birthDate.getTime())) {
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      if (age < 18 || age > 100) {
        errors.push('Age must be between 18 and 100 years');
      }
    } else {
      errors.push('Please provide a valid date of birth');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

const normaliseCollegesInput = (value: string): string[] =>
  value
    .split(/[\n,]/)
    .map((entry) => entry.trim())
    .filter(Boolean);

export const validateMessProfileForm = (formData: MessFormState): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!formData.name.trim()) {
    errors.push('Mess name is required');
  }

  if (!formData.city.trim()) {
    errors.push('City is required');
  }

  if (!formData.state.trim()) {
    errors.push('State is required');
  }

  if (!PINCODE_REGEX.test(formData.pincode.trim())) {
    errors.push('Pincode must be 6 digits');
  }

  const colleges = normaliseCollegesInput(formData.colleges);
  if (colleges.length === 0) {
    errors.push('At least one nearby college is required');
  }

  if (!formData.ownerEmail.trim() || !EMAIL_REGEX.test(formData.ownerEmail.trim())) {
    errors.push('A valid owner email is required');
  }

  if (!formData.types || formData.types.length === 0) {
    errors.push('At least one mess type must be selected');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

export const parseCollegesInput = (value: string): string[] => normaliseCollegesInput(value);

export const formatDate = (dateString?: string): string => {
  if (!dateString) return 'Not provided';
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return 'Not provided';
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

export const formatDateTime = (dateString?: string): string => {
  if (!dateString) return 'Not provided';
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return 'Not provided';
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const formatCurrency = (amount: number = 0): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

export const getStatusColor = (status: string) => {
  switch (status) {
    case 'active':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 border-green-200 dark:border-green-800';
    case 'suspended':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 border-red-200 dark:border-red-800';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200 border-gray-200 dark:border-gray-800';
  }
};






