import type { UserProfile, ProfileFormData } from './Profile.types';

/**
 * Formats user's full name
 */
export const getFullName = (profile: UserProfile): string => {
  return `${profile.firstName} ${profile.lastName}`.trim();
};

/**
 * Generates avatar URL if user doesn't have one
 */
export const getAvatarUrl = (profile: UserProfile): string => {
  if (profile.avatar) return profile.avatar;
  
  const initials = `${profile.firstName[0] || ''}${profile.lastName[0] || ''}`.toUpperCase();
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=random&color=fff&size=128&format=svg&bold=true`;
};

/**
 * Calculates user's age from date of birth
 */
export const calculateAge = (dateOfBirth: string): number | null => {
  if (!dateOfBirth) return null;
  
  try {
    const birth = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  } catch (error) {
    return null;
  }
};

/**
 * Formats the join date
 */
export const formatJoinDate = (dateString: string): string => {
  try {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch (error) {
    return 'Unknown';
  }
};

/**
 * Calculates days as member
 */
export const calculateDaysAsMember = (joinDate: string): number => {
  try {
    const join = new Date(joinDate);
    const today = new Date();
    const diffInMs = today.getTime() - join.getTime();
    return Math.floor(diffInMs / (1000 * 60 * 60 * 24));
  } catch (error) {
    return 0;
  }
};

/**
 * Gets verification status display
 */
export const getVerificationStatus = (profile: UserProfile): { email: string; phone: string } => {
  return {
    email: profile.isEmailVerified ? 'Verified' : 'Not Verified',
    phone: profile.isPhoneVerified ? 'Verified' : 'Not Verified'
  };
};

/**
 * Gets verification status color
 */
export const getVerificationStatusColor = (isVerified: boolean): string => {
  return isVerified 
    ? 'text-green-600 dark:text-green-400' 
    : 'text-yellow-600 dark:text-yellow-400';
};

/**
 * Validates profile form data
 */
export const validateProfileForm = (formData: ProfileFormData): Record<string, string> => {
  const errors: Record<string, string> = {};
  
  if (!formData.firstName.trim()) {
    errors['firstName'] = 'First name is required';
  }
  
  if (!formData.lastName.trim()) {
    errors['lastName'] = 'Last name is required';
  }
  
  if (!formData.email.trim()) {
    errors['email'] = 'Email is required';
  } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
    errors['email'] = 'Email is invalid';
  }
  
  if (formData.phone && !/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) {
    errors['phone'] = 'Phone number must be 10 digits';
  }
  
  if (formData.dateOfBirth) {
    const age = calculateAge(formData.dateOfBirth);
    if (age !== null && age < 13) {
      errors['dateOfBirth'] = 'Must be at least 13 years old';
    }
  }
  
  return errors;
};

/**
 * Checks if profile form has changes
 */
export const hasFormChanges = (originalData: ProfileFormData, currentData: ProfileFormData): boolean => {
  return Object.keys(originalData).some(key => {
    const k = key as keyof ProfileFormData;
    return originalData[k] !== currentData[k];
  });
};

/**
 * Gets profile completion percentage
 */
export const getProfileCompletionPercentage = (profile: UserProfile): number => {
  const fields = [
    profile.firstName,
    profile.lastName,
    profile.email,
    profile.phone,
    profile.dateOfBirth,
    profile.address,
    profile.college,
    profile.course
  ];
  
  const completedFields = fields.filter(field => field && field.trim()).length;
  return Math.round((completedFields / fields.length) * 100);
};

/**
 * Gets role display name
 */
export const getRoleDisplayName = (role: UserProfile['role']): string => {
  switch (role) {
    case 'admin':
      return 'Administrator';
    case 'mess-owner':
      return 'Mess Owner';
    case 'user':
    default:
      return 'User';
  }
};

/**
 * Gets role badge color
 */
export const getRoleBadgeColor = (role: UserProfile['role']): string => {
  switch (role) {
    case 'admin':
      return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
    case 'mess-owner':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
    case 'user':
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
  }
};

/**
 * Formats phone number for display
 */
export const formatPhoneNumber = (phone: string): string => {
  if (!phone) return '';
  
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  return phone;
};

/**
 * Generates profile summary
 */
export const generateProfileSummary = (profile: UserProfile): string => {
  const parts = [];
  
  if (profile.course) parts.push(profile.course);
  if (profile.college) parts.push(profile.college);
  if (profile.messDetails) parts.push(`Member of ${profile.messDetails.messName}`);
  
  return parts.join(' • ') || 'Complete your profile to see summary';
};

/**
 * Gets next profile improvement suggestion
 */
export const getProfileImprovementSuggestion = (profile: UserProfile): string | null => {
  if (!profile.phone) return 'Add your phone number for better communication';
  if (!profile.dateOfBirth) return 'Add your date of birth to complete your profile';
  if (!profile.address) return 'Add your address for location-based services';
  if (!profile.college) return 'Add your college information';
  if (!profile.course) return 'Add your course details';
  if (!profile.isEmailVerified) return 'Verify your email address';
  if (!profile.isPhoneVerified) return 'Verify your phone number';
  
  return null;
};

