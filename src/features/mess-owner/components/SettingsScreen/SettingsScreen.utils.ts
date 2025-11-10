import type { SettingsNavigationItem, SettingsScreenConfig, MessInfoData } from './SettingsScreen.types';

export const getSettingsScreenConfig = (): SettingsScreenConfig => {
  return {
    navigationItems: [
      {
        id: 'mess-profile',
        title: 'Mess Profile',
        description: 'Manage mess details and information',
        icon: 'BuildingStorefrontIcon',
        path: '/mess-owner/settings/mess-profile',
        color: 'blue'
      },
      {
        id: 'mess-plans',
        title: 'Mess Plans',
        description: 'Configure meal plans and pricing',
        icon: 'UserGroupIcon',
        path: '/mess-owner/settings/mess-plans',
        color: 'green'
      },
      {
        id: 'operating-hours',
        title: 'Operating Hours',
        description: 'Set mess timings and schedules',
        icon: 'ClockIcon',
        path: '/mess-owner/settings/operating-hours',
        color: 'orange'
      },
      {
        id: 'security',
        title: 'Security',
        description: 'Manage account security settings',
        icon: 'ShieldCheckIcon',
        path: '/mess-owner/settings/security',
        color: 'purple'
      },
      {
        id: 'payment',
        title: 'Payment',
        description: 'Configure payment methods and billing',
        icon: 'CreditCardIcon',
        path: '/mess-owner/settings/payment',
        color: 'emerald'
      },
      {
        id: 'qr-verification',
        title: 'QR Verification',
        description: 'Generate QR code for member verification',
        icon: 'QrCodeIcon',
        path: '/mess-owner/settings/qr-verification',
        color: 'indigo'
      }
    ],
    maxPhotoSize: 5 * 1024 * 1024, // 5MB
    allowedPhotoTypes: ['image/jpeg', 'image/png', 'image/webp'],
    uploadTimeout: 30000 // 30 seconds
  };
};

export const validatePhotoFile = (file: File): { isValid: boolean; error?: string } => {
  const config = getSettingsScreenConfig();
  
  if (!config.allowedPhotoTypes.includes(file.type)) {
    return {
      isValid: false,
      error: 'Please select a valid image file (JPEG, PNG, or WebP)'
    };
  }
  
  if (file.size > config.maxPhotoSize) {
    return {
      isValid: false,
      error: 'File size must be less than 5MB'
    };
  }
  
  return { isValid: true };
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const getNavigationItemByPath = (path: string): SettingsNavigationItem | undefined => {
  const config = getSettingsScreenConfig();
  return config.navigationItems.find(item => item.path === path);
};

export const getNavigationItemById = (id: string): SettingsNavigationItem | undefined => {
  const config = getSettingsScreenConfig();
  return config.navigationItems.find(item => item.id === id);
};

export const formatMessInfo = (messProfile: any): MessInfoData => {
  return {
    name: messProfile?.name || 'Mess Name',
    location: {
      city: messProfile?.location?.city || 'City',
      state: messProfile?.location?.state || 'State'
    },
    colleges: messProfile?.colleges || [],
    rating: messProfile?.rating || 4.5,
    memberCount: messProfile?.memberCount || 0
  };
};

export const getSettingsScreenErrorMessage = (error: any): string => {
  if (error?.message) {
    return error.message;
  }
  if (error?.response?.data?.message) {
    return error.response.data.message;
  }
  return 'An error occurred while loading settings. Please try again.';
};

export const validateSettingsScreenConfig = (config: SettingsScreenConfig): boolean => {
  return (
    config.navigationItems.length > 0 &&
    config.maxPhotoSize > 0 &&
    config.allowedPhotoTypes.length > 0 &&
    config.uploadTimeout > 0
  );
};




