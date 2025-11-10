import { cacheService } from './utils/cacheService';  
import { performanceMonitor } from './utils/performanceMonitor';
import apiClient from './api';

// Use apiClient for consistent API calls
const API_ENDPOINT = '/mess/profile';


// Cache configuration for profile operations
const PROFILE_CACHE_CONFIG = {
  GET_TTL: 15 * 60 * 1000, // 15 minutes for GET requests
  SAVE_TTL: 0, // No cache for saves
  RETRY_COUNT: 2,
  RETRY_DELAY: 1000
};

export interface MessLocation {
  street: string;
  city: string;
  district: string;
  state: string;
  pincode: string;
  country: string;
  latitude?: number;
  longitude?: number;
}

export interface MessProfile {
  _id?: string;
  name: string;
  location: MessLocation;
  colleges: string[];
  ownerPhone: string;
  ownerEmail: string;
  types: string[];
  logo: string | null;
}

// Enhanced validation functions
const validateMessProfile = (profile: MessProfile): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  // Validate Mess Name
  if (!profile.name || profile.name.trim().length === 0) {
    errors.push('Mess name is required');
  } else if (profile.name.trim().length < 2) {
    errors.push('Mess name must be at least 2 characters long');
  } else if (profile.name.trim().length > 100) {
    errors.push('Mess name must be less than 100 characters');
  }

  // Validate Location
  if (!profile.location.city || profile.location.city.trim().length === 0) {
    errors.push('City is required');
  }
  if (!profile.location.state || profile.location.state.trim().length === 0) {
    errors.push('State is required');
  }
  if (!profile.location.pincode || profile.location.pincode.trim().length === 0) {
    errors.push('Pincode is required');
  } else if (!/^\d{6}$/.test(profile.location.pincode.trim())) {
    errors.push('Pincode must be 6 digits');
  }

  // Validate Owner Email
  if (!profile.ownerEmail || profile.ownerEmail.trim().length === 0) {
    errors.push('Owner email is required');
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(profile.ownerEmail.trim())) {
      errors.push('Please enter a valid email address');
    }
  }

  // Validate Owner Phone (optional but if provided, must be valid)
  if (profile.ownerPhone && profile.ownerPhone.trim().length > 0) {
    const phoneRegex = /^[+]?[\d\s\-\(\)]{10,15}$/;
    if (!phoneRegex.test(profile.ownerPhone.trim())) {
      errors.push('Please enter a valid phone number');
    }
  }

  // Validate Colleges
  if (profile.colleges.length === 0) {
    errors.push('At least one nearby college is required');
  }

  // Validate Mess Types
  if (profile.types.length === 0) {
    errors.push('At least one mess type must be selected');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

export async function getMessProfile(): Promise<MessProfile> {
  const cacheKey = 'mess_profile_current';
  const traceId = performanceMonitor.startRequest(cacheKey);
  
  try {
    const result = await cacheService.getOrFetch(
      cacheKey,
      async () => {
        try {
          console.log(`Fetching mess profile from ${API_ENDPOINT}`);
          const response = await apiClient.get(API_ENDPOINT);
          
          console.log('Mess profile fetched successfully:', response.data);
          
          // Extract the actual data from the response
          const data = response.data?.data || response.data;
          console.log('Extracted profile data:', data);
          
          // Ensure all required fields are present
          const validatedProfile: MessProfile = {
            _id: data._id,
            name: data.name || "Your Mess",
            location: {
              street: data.location?.street || "",
              city: data.location?.city || "",
              district: data.location?.district || "",
              state: data.location?.state || "",
              pincode: data.location?.pincode || "",
              country: data.location?.country || "India",
              latitude: data.location?.latitude,
              longitude: data.location?.longitude
            },
            colleges: Array.isArray(data.colleges) ? data.colleges : [],
            ownerPhone: data.ownerPhone || "",
            ownerEmail: data.ownerEmail || "",
            types: Array.isArray(data.types) ? data.types : [],
            logo: data.logo || null
          };
          
          return validatedProfile;
        } catch (error: any) {
          // Handle 404 - return default profile if not found
          if (error.response?.status === 404) {
            console.log('No mess profile found (404)');
            return {
              name: "Your Mess",
              location: {
                street: "",
                city: "",
                district: "",
                state: "",
                pincode: "",
                country: "India",
              },
              colleges: [],
              ownerPhone: "",
              ownerEmail: "",
              types: [],
              logo: null
            };
          }
          
          // Handle authentication errors
          if (error.response?.status === 401) {
            console.warn('Authentication failed, token may be expired');
            // Use central authService logout to clear auth storage
            try {
              const { authService } = await import('@/services/authService');
              authService.logout();
            } catch (e) {
              // Fallback - clear and redirect
              localStorage.removeItem('authToken');
              localStorage.removeItem('userInfo');
              localStorage.removeItem('userRole');
              localStorage.removeItem('authExpires');
            }
            window.location.href = '/login';
            throw new Error('Authentication failed. Please log in again.');
          }
          
          console.error('Fetch failed:', error.response?.status, error.response?.data);
          throw new Error(`Failed to fetch mess profile: ${error.response?.data?.message || error.message || 'Unknown error'}`);
        }
      },
      {
        ttl: PROFILE_CACHE_CONFIG.GET_TTL,
        background: true, // Update cache in background
        retryCount: PROFILE_CACHE_CONFIG.RETRY_COUNT,
        retryDelay: PROFILE_CACHE_CONFIG.RETRY_DELAY
      }
    );

    performanceMonitor.endRequest(traceId, cacheKey, true, false);
    return result;
  } catch (error) {
    performanceMonitor.endRequest(traceId, cacheKey, false, false, error instanceof Error ? error.message : 'Unknown error');
    throw error;
  }
}

export async function saveMessProfile(profile: MessProfile): Promise<MessProfile> {
  const cacheKey = `mess_profile_save_${Date.now()}`;
  const traceId = performanceMonitor.startRequest(cacheKey);
  
  try {
    // Validate profile before saving
    const validation = validateMessProfile(profile);
    if (!validation.isValid) {
      throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
    }

    const result = await cacheService.getOrFetch(
      cacheKey,
      async () => {
        console.log(`Saving mess profile to ${API_ENDPOINT}`, profile);
        try {
          const response = await apiClient.post(API_ENDPOINT, {
            name: profile.name.trim(),
            location: {
              street: profile.location.street.trim(),
              city: profile.location.city.trim(),
              district: profile.location.district.trim(),
              state: profile.location.state.trim(),
              pincode: profile.location.pincode.trim(),
              country: profile.location.country.trim(),
              ...(profile.location.latitude !== undefined && { latitude: profile.location.latitude }),
              ...(profile.location.longitude !== undefined && { longitude: profile.location.longitude })
            },
            colleges: profile.colleges.map(college => college.trim()).filter(college => college.length > 0),
            ownerPhone: profile.ownerPhone.trim(),
            ownerEmail: profile.ownerEmail.trim().toLowerCase(),
            types: profile.types,
            logo: profile.logo
        });
        
          console.log('Mess profile saved successfully:', response.data);
        
        // Clear the current profile cache since it's been updated
        cacheService.clearCache('mess_profile_current');
        
        // Extract the actual data from the response
          const data = response.data?.data || response.data;
        console.log('Extracted saved profile data:', data);
        
        // Return the profile data from the response
        return data.profile || data;
        } catch (error: any) {
          console.error('Save failed:', error.response?.status, error.response?.data);
          throw new Error(`Failed to save mess profile: ${error.response?.data?.message || error.message || 'Unknown error'}`);
        }
      },
      {
        ttl: PROFILE_CACHE_CONFIG.SAVE_TTL,
        forceRefresh: true,
        retryCount: PROFILE_CACHE_CONFIG.RETRY_COUNT,
        retryDelay: PROFILE_CACHE_CONFIG.RETRY_DELAY
      }
    );

    performanceMonitor.endRequest(traceId, cacheKey, true, false);
    return result;
  } catch (error) {
    performanceMonitor.endRequest(traceId, cacheKey, false, false, error instanceof Error ? error.message : 'Unknown error');
    throw error;
  }
}

export async function updateMessProfile(profile: Partial<MessProfile>): Promise<MessProfile> {
  const cacheKey = `mess_profile_update_${Date.now()}`;
  const traceId = performanceMonitor.startRequest(cacheKey);
  
  try {
    const result = await cacheService.getOrFetch(
      cacheKey,
      async () => {
        console.log(`Updating mess profile at ${API_ENDPOINT}`, profile);
        try {
          const response = await apiClient.put(API_ENDPOINT, profile);
          
          console.log('Mess profile updated successfully:', response.data);
        
        // Clear the current profile cache since it's been updated
        cacheService.clearCache('mess_profile_current');
        
        // Extract the actual data from the response
          const data = response.data?.data || response.data;
        console.log('Extracted updated profile data:', data);
        
        return data;
        } catch (error: any) {
          console.error('Update failed:', error.response?.status, error.response?.data);
          throw new Error(`Failed to update mess profile: ${error.response?.data?.message || error.message || 'Unknown error'}`);
        }
      },
      {
        ttl: PROFILE_CACHE_CONFIG.SAVE_TTL,
        forceRefresh: true,
        retryCount: PROFILE_CACHE_CONFIG.RETRY_COUNT,
        retryDelay: PROFILE_CACHE_CONFIG.RETRY_DELAY
      }
    );

    performanceMonitor.endRequest(traceId, cacheKey, true, false);
    return result;
  } catch (error) {
    performanceMonitor.endRequest(traceId, cacheKey, false, false, error instanceof Error ? error.message : 'Unknown error');
    throw error;
  }
}

export async function deleteMessProfile(): Promise<void> {
  const cacheKey = 'mess_profile_delete';
  const traceId = performanceMonitor.startRequest(cacheKey);
  
  try {
    await cacheService.getOrFetch(
      cacheKey,
      async () => {
        console.log(`Deleting mess profile at ${API_ENDPOINT}`);
        try {
          await apiClient.delete(API_ENDPOINT);
        
        console.log('Mess profile deleted successfully');
        
        // Clear all profile-related caches
        cacheService.clearCache('mess_profile_current');
        
        return null;
        } catch (error: any) {
          console.error('Delete failed:', error.response?.status, error.response?.data);
          throw new Error(`Failed to delete mess profile: ${error.response?.data?.message || error.message || 'Unknown error'}`);
        }
      },
      {
        ttl: 0, // No cache for deletes
        forceRefresh: true,
        retryCount: 1,
        retryDelay: 1000
      }
    );

    performanceMonitor.endRequest(traceId, cacheKey, true, false);
  } catch (error) {
    performanceMonitor.endRequest(traceId, cacheKey, false, false, error instanceof Error ? error.message : 'Unknown error');
    throw error;
  }
}

// Preload mess profile for instant access
export async function preloadMessProfile(): Promise<void> {
  try {
    await getMessProfile();
    console.log('Mess profile preloaded');
  } catch (error) {
    console.warn('Failed to preload mess profile:', error);
  }
}

// Get profile with fallback
export async function getMessProfileWithFallback(): Promise<MessProfile> {
  try {
    return await getMessProfile();
  } catch (error) {
    console.warn('Failed to get mess profile, using fallback:', error);
    return {
      name: "Your Mess",
      location: {
        street: "",
        city: "",
        district: "",
        state: "",
        pincode: "",
        country: "India"
      },
      colleges: [],
      ownerPhone: "",
      ownerEmail: "",
      types: [],
      logo: null
    };
  }
}

// Export validation function for use in components
export { validateMessProfile }; 