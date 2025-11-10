// API Constants and Endpoints

export const API_BASE_URL = import.meta.env['VITE_API_BASE_URL'] || '/api';

// API Endpoints
export const ENDPOINTS = {
  // Auth endpoints
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH_TOKEN: '/auth/refresh',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    VERIFY_OTP: '/auth/verify-otp',
    SEND_OTP: '/auth/send-otp',
    UPDATE_PROFILE: '/auth/profile',
  },

  // Mess endpoints
  MESS: {
    PROFILE: '/mess/profile',
    PHOTO: '/mess/photo',
    SETTINGS: '/mess/settings',
    MEMBERS: '/mess/members',
    SEARCH: '/mess/search',
    REVIEWS: '/mess/reviews',
    STATS: '/mess/stats',
  },

  // User endpoints
  USER: {
    PROFILE: '/user/profile',
    MEMBERSHIPS: '/user/memberships',
    BILLING: '/user/billing',
    LEAVE_REQUESTS: '/user/leave-requests',
    FEEDBACK: '/user/feedback',
    ACTIVITY: '/user/activity',
    STATS: '/user/stats',
  },

  // Admin endpoints
  ADMIN: {
    USERS: '/admin/users',
    MESSES: '/admin/messes',
    PAYMENTS: '/admin/payments',
    REPORTS: '/admin/reports',
    ANALYTICS: '/admin/analytics',
    SETTINGS: '/admin/settings',
  },

  // Meal plan endpoints
  MEAL_PLAN: {
    LIST: '/meal-plan',
    CREATE: '/meal-plan',
    UPDATE: '/meal-plan/:id',
    DELETE: '/meal-plan/:id',
    BY_DATE: '/meal-plans/date/:date',
  },

  // Feedback endpoints
  FEEDBACK: {
    LIST: '/feedback',
    STATS: '/feedback/stats',
    RESPOND: '/feedback/:feedbackId/respond',
    RESOLVE: '/feedback/:feedbackId/resolve',
    CREATE: '/feedback',
  },

  // Notification endpoints
  NOTIFICATIONS: {
    LIST: '/notifications',
    MARK_READ: '/notifications/:id/read',
    MARK_ALL_READ: '/notifications/read-all',
    DELETE: '/notifications/:id',
    PREFERENCES: '/notifications/preferences',
  },

  // Payment endpoints
  PAYMENTS: {
    LIST: '/payments',
    CREATE: '/payments',
    UPDATE: '/payments/:id',
    DELETE: '/payments/:id',
    VERIFY: '/payments/:id/verify',
  },

  // Credit Management endpoints
  CREDIT_MANAGEMENT: {
    // Credit Slabs
    SLABS: '/credit-management/slabs',
    SLAB_BY_ID: '/credit-management/slabs/:slabId',
    
    // Credit Purchase Plans
    PLANS: '/credit-management/plans',
    PLAN_BY_ID: '/credit-management/plans/:planId',
    
    // Mess Credits
    MESS_CREDITS: '/credit-management/mess/:messId',
    PURCHASE_CREDITS: '/credit-management/mess/:messId/purchase',
    ADJUST_CREDITS: '/credit-management/mess/:messId/adjust',
    
    // Free Trial
    TRIAL_SETTINGS: '/credit-management/trial/settings',
    ACTIVATE_TRIAL: '/credit-management/mess/:messId/trial/activate',
    
    // Monthly Billing Automation removed
    
    // Reports & Analytics
    TRANSACTIONS: '/credit-management/transactions',
    ANALYTICS: '/credit-management/analytics',
  },
} as const;

// HTTP Methods
export const HTTP_METHODS = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  PATCH: 'PATCH',
  DELETE: 'DELETE',
} as const;

// API Response Status Codes
export const API_STATUS_CODES = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const;

// API Error Messages
export const API_ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  FORBIDDEN: 'Access denied. You do not have permission to access this resource.',
  NOT_FOUND: 'The requested resource was not found.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  SERVER_ERROR: 'An internal server error occurred. Please try again later.',
  TIMEOUT: 'Request timed out. Please try again.',
  UNKNOWN_ERROR: 'An unknown error occurred. Please try again.',
} as const;

// Request Configuration
export const API_CONFIG = {
  TIMEOUT: 30000, // 30 seconds
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 second
  CACHE_DURATION: 5 * 60 * 1000, // 5 minutes
} as const;

// File Upload Configuration
export const UPLOAD_CONFIG = {
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
  ALLOWED_DOCUMENT_TYPES: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  MAX_FILES: 10,
} as const;

// Pagination Defaults
export const PAGINATION_DEFAULTS = {
  PAGE: 1,
  LIMIT: 10,
  MAX_LIMIT: 100,
} as const; 