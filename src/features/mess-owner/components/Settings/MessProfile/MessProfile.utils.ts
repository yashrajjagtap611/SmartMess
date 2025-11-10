import type { MessProfileData } from './MessProfile.types';

export const getInitialMessProfileData = (): MessProfileData => {
  return {
    name: '',
    types: [],
    location: {
      street: '',
      city: '',
      district: '',
      state: '',
      pincode: '',
      country: 'India'
    },
    colleges: [],
    collegeInput: '',
    ownerPhone: '',
    ownerEmail: ''
  };
};

export const validateMessProfile = (data: MessProfileData): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!data.name.trim()) {
    errors.push('Mess name is required');
  }

  if (data.types.length === 0) {
    errors.push('Please select at least one mess type');
  }

  if (!data.location.city.trim()) {
    errors.push('City is required');
  }

  if (!data.location.state.trim()) {
    errors.push('State is required');
  }

  if (!data.location.pincode.trim()) {
    errors.push('Pincode is required');
  } else if (!/^\d{6}$/.test(data.location.pincode)) {
    errors.push('Pincode must be 6 digits');
  }

  if (!data.ownerEmail.trim()) {
    errors.push('Owner email is required');
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.ownerEmail)) {
    errors.push('Please enter a valid email address');
  }

  if (data.colleges.length === 0) {
    errors.push('Please add at least one nearby college');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

export const formatMessProfileForBackend = (data: MessProfileData) => {
  return {
    name: data.name.trim(),
    types: data.types,
    location: {
      street: data.location.street.trim(),
      city: data.location.city.trim(),
      district: data.location.district.trim(),
      state: data.location.state.trim(),
      pincode: data.location.pincode.trim(),
      country: data.location.country.trim(),
      ...(data.location.latitude !== undefined && { latitude: data.location.latitude }),
      ...(data.location.longitude !== undefined && { longitude: data.location.longitude })
    },
    colleges: data.colleges,
    ownerPhone: data.ownerPhone.trim(),
    ownerEmail: data.ownerEmail.trim()
  };
};

export const formatBackendMessProfile = (backendData: any): MessProfileData => {
  return {
    name: backendData.name || '',
    types: backendData.types || [],
    location: {
      street: backendData.location?.street || '',
      city: backendData.location?.city || '',
      district: backendData.location?.district || '',
      state: backendData.location?.state || '',
      pincode: backendData.location?.pincode || '',
      country: backendData.location?.country || 'India',
      latitude: backendData.location?.latitude,
      longitude: backendData.location?.longitude
    },
    colleges: backendData.colleges || [],
    collegeInput: '',
    ownerPhone: backendData.ownerPhone || '',
    ownerEmail: backendData.ownerEmail || ''
  };
};

export const getMessTypeOptions = (): string[] => {
  return ['Veg', 'Non-Veg', 'Mixed'];
};

export const getMessProfileErrorMessage = (error: any): string => {
  if (error?.message) {
    return error.message;
  }
  if (error?.response?.data?.message) {
    return error.response.data.message;
  }
  return 'An error occurred while processing mess profile. Please try again.';
};

export const validatePhoneNumber = (phone: string): boolean => {
  const phoneRegex = /^[+]?[\d\s\-\(\)]{10,15}$/;
  return phoneRegex.test(phone);
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};






