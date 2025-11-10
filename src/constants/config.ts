// Application Configuration Constants

// Environment Configuration
export const ENV = {
  NODE_ENV: import.meta.env['NODE_ENV'] || 'development',
  VITE_API_BASE_URL: import.meta.env['VITE_API_BASE_URL'] || '/api',
  VITE_APP_NAME: import.meta.env['VITE_APP_NAME'] || 'SmartMess',
  VITE_APP_VERSION: import.meta.env['VITE_APP_VERSION'] || '1.0.0',
  VITE_APP_DESCRIPTION: import.meta.env['VITE_APP_DESCRIPTION'] || 'Mess Management System',
} as const;

// App Configuration
export const APP_CONFIG = {
  NAME: 'SmartMess',
  VERSION: '1.0.0',
  DESCRIPTION: 'Mess Management System',
  AUTHOR: 'SmartMess Team',
  SUPPORT_EMAIL: 'support@SmartMess.com',
  WEBSITE: 'https://SmartMess.com',
} as const;

// Feature Flags
export const FEATURE_FLAGS = {
  PWA_ENABLED: true,
  OFFLINE_SUPPORT: true,
  PUSH_NOTIFICATIONS: true,
  REAL_TIME_CHAT: true,
  PAYMENT_GATEWAY: true,
  ANALYTICS: true,
  DEBUG_MODE: ENV.NODE_ENV === 'development',
} as const;

// UI Configuration
export const UI_CONFIG = {
  // Theme
  DEFAULT_THEME: 'light' as const,
  THEME_STORAGE_KEY: 'SmartMess-theme',
  
  // Layout
  SIDEBAR_WIDTH: 280,
  HEADER_HEIGHT: 64,
  FOOTER_HEIGHT: 60,
  
  // Responsive Breakpoints
  BREAKPOINTS: {
    xs: 0,
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
    '2xl': 1536,
  },
  
  // Animation
  TRANSITION_DURATION: 200,
  ANIMATION_DURATION: 300,
  
  // Z-Index Layers
  Z_INDEX: {
    DROPDOWN: 1000,
    STICKY: 1020,
    FIXED: 1030,
    MODAL_BACKDROP: 1040,
    MODAL: 1050,
    POPOVER: 1060,
    TOOLTIP: 1070,
    TOAST: 1080,
  },
} as const;

// Form Configuration
export const FORM_CONFIG = {
  // Validation
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_MAX_LENGTH: 128,
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 50,
  PHONE_MIN_LENGTH: 10,
  PHONE_MAX_LENGTH: 15,
  EMAIL_MAX_LENGTH: 254,
  
  // File Upload
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
  ALLOWED_DOCUMENT_TYPES: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  MAX_FILES: 10,
  
  // Auto-save
  AUTO_SAVE_DELAY: 3000, // 3 seconds
  AUTO_SAVE_ENABLED: true,
} as const;

// Cache Configuration
export const CACHE_CONFIG = {
  // Local Storage Keys
  STORAGE_KEYS: {
    AUTH_TOKEN: 'authToken',
    REFRESH_TOKEN: 'refreshToken',
    USER_PROFILE: 'userProfile',
    MESS_PROFILE: 'messProfile',
    MESS_PHOTO: 'messPhoto',
    THEME: 'theme',
    LANGUAGE: 'language',
    NOTIFICATIONS: 'notifications',
    CART: 'cart',
    SEARCH_HISTORY: 'searchHistory',
  },
  
  // Cache Duration (in milliseconds)
  DURATION: {
    SHORT: 5 * 60 * 1000, // 5 minutes
    MEDIUM: 30 * 60 * 1000, // 30 minutes
    LONG: 24 * 60 * 60 * 1000, // 24 hours
    PERMANENT: -1, // Never expire
  },
  
  // Cache Keys
  KEYS: {
    USER_PROFILE: 'user_profile',
    MESS_PROFILE: 'mess_profile',
    MEAL_PLANS: 'meal_plans',
    NOTIFICATIONS: 'notifications',
    SEARCH_RESULTS: 'search_results',
  },
} as const;

// API Configuration
export const API_CONFIG = {
  // Request Configuration
  TIMEOUT: 30000, // 30 seconds
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 second
  
  // Rate Limiting
  RATE_LIMIT: {
    REQUESTS_PER_MINUTE: 60,
    REQUESTS_PER_HOUR: 1000,
  },
  
  // Headers
  HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
} as const;

// Notification Configuration
export const NOTIFICATION_CONFIG = {
  // Display Duration
  DISPLAY_DURATION: 5000, // 5 seconds
  
  // Position
  POSITION: 'top-right' as const,
  
  // Types
  TYPES: {
    SUCCESS: 'success',
    ERROR: 'error',
    WARNING: 'warning',
    INFO: 'info',
  },
  
  // Sound
  SOUND_ENABLED: true,
  SOUND_URL: '/sounds/notification.mp3',
} as const;

// Payment Configuration
export const PAYMENT_CONFIG = {
  // Currency
  DEFAULT_CURRENCY: 'INR',
  SUPPORTED_CURRENCIES: ['INR', 'USD', 'EUR'],
  
  // Payment Methods
  PAYMENT_METHODS: {
    CASH: 'cash',
    UPI: 'upi',
    CARD: 'card',
    NET_BANKING: 'net_banking',
    WALLET: 'wallet',
  },
  
  // Transaction Limits
  MIN_AMOUNT: 1,
  MAX_AMOUNT: 100000,
  
  // Commission
  COMMISSION_PERCENTAGE: 2.5, // 2.5%
} as const;

// Mess Configuration
export const MESS_CONFIG = {
  // Mess Types
  TYPES: [
    'Veg',
    'Non-Veg',
    'Jain',
    'Muslim',
    'Christian',
    'Sikh',
    'Other',
  ],
  
  // Meal Types
  MEAL_TYPES: [
    'Breakfast',
    'Lunch',
    'Dinner',
    'Snacks',
  ],
  
  // Operating Hours
  DEFAULT_OPERATING_HOURS: {
    monday: { isOpen: true, openTime: '06:00', closeTime: '22:00' },
    tuesday: { isOpen: true, openTime: '06:00', closeTime: '22:00' },
    wednesday: { isOpen: true, openTime: '06:00', closeTime: '22:00' },
    thursday: { isOpen: true, openTime: '06:00', closeTime: '22:00' },
    friday: { isOpen: true, openTime: '06:00', closeTime: '22:00' },
    saturday: { isOpen: true, openTime: '06:00', closeTime: '22:00' },
    sunday: { isOpen: true, openTime: '06:00', closeTime: '22:00' },
  },
  
  // Meal Timings
  DEFAULT_MEAL_TIMINGS: {
    breakfast: '08:00',
    lunch: '13:00',
    dinner: '20:00',
  },
} as const;

// User Configuration
export const USER_CONFIG = {
  // Roles
  ROLES: {
    USER: 'user',
    MESS_OWNER: 'mess_owner',
    ADMIN: 'admin',
  },
  
  // Status
  STATUS: {
    ACTIVE: 'active',
    INACTIVE: 'inactive',
    SUSPENDED: 'suspended',
    PENDING: 'pending',
  },
  
  // Membership Status
  MEMBERSHIP_STATUS: {
    PENDING: 'pending',
    ACTIVE: 'active',
    INACTIVE: 'inactive',
    CANCELLED: 'cancelled',
  },
} as const;

// Security Configuration
export const SECURITY_CONFIG = {
  // Password Policy
  PASSWORD_POLICY: {
    MIN_LENGTH: 8,
    REQUIRE_UPPERCASE: true,
    REQUIRE_LOWERCASE: true,
    REQUIRE_NUMBERS: true,
    REQUIRE_SPECIAL_CHARS: true,
  },
  
  // Session
  SESSION_TIMEOUT: 24 * 60 * 60 * 1000, // 24 hours
  REFRESH_TOKEN_EXPIRY: 7 * 24 * 60 * 60 * 1000, // 7 days
  
  // Rate Limiting
  LOGIN_ATTEMPTS: 5,
  LOCKOUT_DURATION: 15 * 60 * 1000, // 15 minutes
} as const;

// Analytics Configuration
export const ANALYTICS_CONFIG = {
  // Google Analytics
  GA_TRACKING_ID: import.meta.env['VITE_GA_TRACKING_ID'],
  
  // Events
  EVENTS: {
    PAGE_VIEW: 'page_view',
    BUTTON_CLICK: 'button_click',
    FORM_SUBMIT: 'form_submit',
    FILE_UPLOAD: 'file_upload',
    PAYMENT: 'payment',
    LOGIN: 'login',
    LOGOUT: 'logout',
    SEARCH: 'search',
  },
} as const; 