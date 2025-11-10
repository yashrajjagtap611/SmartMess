import { cacheService } from './utils/cacheService';

// Use relative URL since Vite proxy handles the backend routing
const API_URL = '/api/mess/photo';

// Helper function to get auth headers
const getAuthHeaders = (): Record<string, string> => {
  const token = localStorage.getItem('authToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Cache configuration for photo operations
const PHOTO_CACHE_CONFIG = {
  GET_TTL: 10 * 60 * 1000, // 10 minutes for GET requests
  UPLOAD_RETRY_COUNT: 2,
  UPLOAD_RETRY_DELAY: 2000,
  GET_RETRY_COUNT: 1,
  GET_RETRY_DELAY: 1000
};

export async function uploadMessPhoto(file: File): Promise<string> {
  const cacheKey = `mess_photo_upload_${file.name}_${file.size}_${file.lastModified}`;
  
  return cacheService.getOrFetch(
    cacheKey,
    async () => {
      const formData = new FormData();
      formData.append('photo', file);

      const res = await fetch(API_URL, {
        method: 'POST',
        credentials: 'include',
        headers: {
          ...getAuthHeaders()
        },
        body: formData
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ message: 'Upload failed' }));
        throw new Error(`Failed to upload photo: ${errorData.message || res.statusText}`);
      }

      const data = await res.json();
      console.log('Photo uploaded successfully:', data);
      
      // Clear the current photo cache since it's been updated
      cacheService.clearCache('mess_photo_current');
      
      return data.url;
    },
    {
      ttl: 0, // No cache for uploads
      forceRefresh: true,
      retryCount: PHOTO_CACHE_CONFIG.UPLOAD_RETRY_COUNT,
      retryDelay: PHOTO_CACHE_CONFIG.UPLOAD_RETRY_DELAY
    }
  );
}

export async function getMessPhoto(): Promise<string | null> {
  const cacheKey = 'mess_photo_current';
  
  return cacheService.getOrFetch(
    cacheKey,
    async () => {
      const res = await fetch(API_URL, {
        method: 'GET',
        credentials: 'include',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json'
        }
      });

      if (!res.ok) {
        if (res.status === 404) {
          console.log('No mess photo found (404)');
          return null;
        }
        const errorData = await res.json().catch(() => ({ message: 'Fetch failed' }));
        throw new Error(`Failed to fetch mess photo: ${errorData.message || res.statusText}`);
      }

      const data = await res.json();
      console.log('Mess photo fetched successfully:', data);
      return data.url || null;
    },
    {
      ttl: PHOTO_CACHE_CONFIG.GET_TTL,
      background: true, // Update cache in background
      retryCount: PHOTO_CACHE_CONFIG.GET_RETRY_COUNT,
      retryDelay: PHOTO_CACHE_CONFIG.GET_RETRY_DELAY
    }
  );
}

export async function updateMessPhoto(file: File): Promise<string> {
  const cacheKey = `mess_photo_update_${file.name}_${file.size}_${file.lastModified}`;
  
  return cacheService.getOrFetch(
    cacheKey,
    async () => {
      const formData = new FormData();
      formData.append('photo', file);

      const res = await fetch(API_URL, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          ...getAuthHeaders()
        },
        body: formData
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ message: 'Update failed' }));
        throw new Error(`Failed to update photo: ${errorData.message || res.statusText}`);
      }

      const data = await res.json();
      console.log('Photo updated successfully:', data);
      
      // Clear the current photo cache since it's been updated
      cacheService.clearCache('mess_photo_current');
      
      return data.url;
    },
    {
      ttl: 0, // No cache for updates
      forceRefresh: true,
      retryCount: PHOTO_CACHE_CONFIG.UPLOAD_RETRY_COUNT,
      retryDelay: PHOTO_CACHE_CONFIG.UPLOAD_RETRY_DELAY
    }
  );
}

export async function deleteMessPhoto(): Promise<void> {
  const cacheKey = 'mess_photo_delete';
  
  await cacheService.getOrFetch(
    cacheKey,
    async () => {
      const res = await fetch(API_URL, {
        method: 'DELETE',
        credentials: 'include',
        headers: getAuthHeaders()
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ message: 'Delete failed' }));
        throw new Error(`Failed to delete photo: ${errorData.message || res.statusText}`);
      }

      console.log('Photo deleted successfully');
      
      // Clear all photo-related caches
      cacheService.clearCache('mess_photo_current');
      cacheService.clearCache('mess_profile_current');
      
      return null;
    },
    {
      ttl: 0, // No cache for deletes
      forceRefresh: true,
      retryCount: 1,
      retryDelay: 1000
    }
  );
}

// Preload mess photo for instant display
export async function preloadMessPhoto(): Promise<void> {
  try {
    const photoUrl = await getMessPhoto();
    if (photoUrl) {
      // Preload the image
      const img = new Image();
      img.src = photoUrl;
      console.log('Mess photo preloaded:', photoUrl);
    }
  } catch (error) {
    console.warn('Failed to preload mess photo:', error);
  }
}

// Get photo with fallback
export async function getMessPhotoWithFallback(fallbackUrl?: string): Promise<string> {
  try {
    const photoUrl = await getMessPhoto();
    return photoUrl || fallbackUrl || '/default-mess-photo.png';
  } catch (error) {
    console.warn('Failed to get mess photo, using fallback:', error);
    return fallbackUrl || '/default-mess-photo.png';
  }
} 