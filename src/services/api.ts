import axios from 'axios';
import type { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

// Extend the AxiosRequestConfig to include metadata
interface ExtendedAxiosRequestConfig extends InternalAxiosRequestConfig {
  metadata?: { startTime: Date };
}

// API Configuration - Use relative URL since Vite proxy handles backend routing
// Normalize URL: handle all edge cases to prevent double slashes
const rawApiUrl = import.meta.env['VITE_API_BASE_URL'] || '/api';
const envValue = import.meta.env['VITE_API_BASE_URL'];

let API_BASE_URL: string;
if (rawApiUrl.startsWith('http')) {
  // Full URL: normalize by removing trailing slashes and ensuring /api is present
  let normalized = rawApiUrl.replace(/\/+$/, ''); // Remove all trailing slashes
  // Remove /api from end if present (we'll add it back)
  normalized = normalized.replace(/\/api\/?$/, '');
  // Add /api (without leading slash since normalized doesn't end with slash)
  API_BASE_URL = normalized + '/api';
} else {
  // Relative URL: just remove trailing slashes
  API_BASE_URL = rawApiUrl.replace(/\/+$/, '');
}

// Debug log in development and production (to help troubleshoot)
if (import.meta.env.DEV) {
  console.log('🔧 API Base URL configured (DEV):', {
    envValue: envValue || '(not set)',
    raw: rawApiUrl,
    normalized: API_BASE_URL
  });
} else {
  // Production log - ALWAYS show to help debug
  console.group('🌐 API Configuration (Production)');
  console.log('Environment Variable Value:', envValue || '(NOT SET - using default /api)');
  console.log('Raw API URL:', rawApiUrl);
  console.log('Normalized API URL:', API_BASE_URL);
  
  if (!rawApiUrl.startsWith('http')) {
    console.error('❌ PROBLEM DETECTED: VITE_API_BASE_URL is not set correctly!');
    console.error('Current value:', envValue || '(undefined)');
    console.error('Expected value: https://smartmessserver.onrender.com/api');
    console.error('');
    console.error('🔧 FIX STEPS:');
    console.error('1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables');
    console.error('2. Add/Edit: VITE_API_BASE_URL = https://smartmessserver.onrender.com/api');
    console.error('3. Select ALL environments (Production, Preview, Development)');
    console.error('4. Click Save');
    console.error('5. Go to Deployments → Click ⋯ → Redeploy');
    console.error('');
    console.error('⚠️ API calls will go to:', window.location.origin + API_BASE_URL);
    console.error('⚠️ They should go to: https://smartmessserver.onrender.com/api');
  } else {
    console.log('✅ API Base URL configured correctly:', API_BASE_URL);
    console.log('✅ API calls will go to:', API_BASE_URL);
  }
  console.groupEnd();
}

const API_TIMEOUT = 30000; // 30 seconds for better reliability

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
  // Add connection pooling settings
  maxRedirects: 3,
  maxContentLength: 50 * 1024 * 1024, // 50MB
  maxBodyLength: 50 * 1024 * 1024, // 50MB
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config: ExtendedAxiosRequestConfig) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      // Type assertion for headers - InternalAxiosRequestConfig has headers
      // Use bracket notation for index signature properties
      (config.headers as Record<string, any>)['Authorization'] = `Bearer ${token}`;
    }
    
    // Add request timestamp for debugging
    config.metadata = { startTime: new Date() };
    
    return config;
  },
  (error: any) => {
    console.error('Request interceptor error:', error);
    return Promise.reject({
      message: 'Failed to make request',
      originalError: error
    });
  }
);

// Response interceptor to handle common errors
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // Add response time logging only in development
    if (import.meta.env.DEV) {
      const endTime = new Date();
      const startTime = (response.config as ExtendedAxiosRequestConfig).metadata?.startTime;
      if (startTime) {
        const duration = endTime.getTime() - startTime.getTime();
        // Only log slow requests (> 1s) to reduce console noise
        if (duration > 1000) {
          console.warn(`Slow API Request (${duration}ms):`, response.config.url);
        }
      }
    }
    
    return response;
  },
  (error: any) => {
    // Don't log 404 errors for expected endpoints (like mess profile when user doesn't have one)
    const url = error.config?.url || '';
    const isExpected404 = url.includes('/mess/profile') && error.response?.status === 404;
    
    if (!isExpected404) {
      // Import error handler dynamically to avoid circular dependencies
      import('@/utils/errorHandler').then(({ ErrorHandler }) => {
        const appError = ErrorHandler.handleApiError(error);
        ErrorHandler.logError(appError, `API Request to ${url}`);
      });
    }
    
    // For offline scenarios, don't automatically logout
    return Promise.reject(error);
  }
);

// API Service Methods for User Preferences
export const userPreferencesAPI = {
  // Get user preferences
  getPreferences: () => apiClient.get('/user/preferences'),
  
  // Update general preferences
  updatePreferences: (preferences: any) => apiClient.put('/user/preferences', preferences),
  
  // Update dietary preferences
  updateDietary: (dietary: string[]) => apiClient.put('/user/preferences/dietary', { dietary }),
  
  // Update allergies
  updateAllergies: (allergies: string[]) => apiClient.put('/user/preferences/allergies', { allergies }),
  
  // Update meal times
  updateMealTimes: (mealTimes: { breakfast?: string; lunch?: string; dinner?: string }) => 
    apiClient.put('/user/preferences/meal-times', { mealTimes }),
  
  // Update notification preferences
  updateNotifications: (notifications: { email: boolean; push: boolean; sms: boolean }) =>
    apiClient.put('/user/preferences', { preferences: { notifications } }),
  
  // Update privacy preferences
  updatePrivacy: (privacy: { profileVisibility: string; showEmail: boolean; showPhone: boolean }) =>
    apiClient.put('/user/preferences', { preferences: { privacy } }),
  
  // Update theme preference
  updateTheme: (theme: 'light' | 'dark' | 'auto') =>
    apiClient.put('/user/preferences', { preferences: { theme } }),
  
  // Update language preference
  updateLanguage: (language: string) =>
    apiClient.put('/user/preferences', { preferences: { language } })
};

// API Service Methods for Mess Management
export const messAPI = {
  // Get mess profile
  getProfile: () => apiClient.get('/mess/profile'),
  
  // Update mess profile
  updateProfile: (profile: any) => apiClient.put('/mess/profile', profile),
  
  // Get mess members
  getMembers: () => apiClient.get('/mess/members'),
  
  // Search messes
  searchMesses: (query: string) => apiClient.get(`/mess/search?q=${encodeURIComponent(query)}`),
  
  // Get available messes
  getAvailable: () => apiClient.get('/mess/available'),
  
  // Get user details
  getUserDetails: (userId: string) => apiClient.get(`/mess/user-details/${userId}`)
};

// API Service Methods for Authentication
export const authAPI = {
  // Login
  login: (credentials: { email: string; password: string }) => 
    apiClient.post('/auth/login', credentials),
  
  // Register
  register: (userData: any) => apiClient.post('/auth/register', userData),
  
  // Logout
  logout: () => apiClient.post('/auth/logout'),
  
  // Verify token
  verifyToken: () => apiClient.get('/auth/verify'),
  
  // Refresh token
  refreshToken: () => apiClient.post('/auth/refresh'),
  
  // Forgot password
  forgotPassword: (email: string) => apiClient.post('/auth/forgot-password', { email }),
  
  // Reset password
  resetPassword: (token: string, password: string) => 
    apiClient.post('/auth/reset-password', { token, password })
};

// API Service Methods for User Profile
export const userProfileAPI = {
  // Get user profile
  getProfile: () => apiClient.get('/user/profile'),
  
  // Update user profile
  updateProfile: (profile: any) => apiClient.put('/user/profile', profile),
  
  // Update avatar
  updateAvatar: (avatar: string) => apiClient.put('/user/profile/avatar', { avatar }),
  
  // Delete account
  deleteAccount: (password: string) => apiClient.delete('/user/profile', { data: { password } })
};

// Health check
export const healthCheck = () => apiClient.get('/health');

export default apiClient; 