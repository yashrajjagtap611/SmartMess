import { useState, useEffect, useCallback } from 'react';

interface UseImagePreloaderReturn {
  isLoaded: boolean;
  hasError: boolean;
  preloadImage: (url: string) => Promise<void>;
}

// Global image cache with size limit to prevent memory leaks
const imageCache = new Map<string, HTMLImageElement>();
const loadingPromises = new Map<string, Promise<void>>();
const MAX_CACHE_SIZE = 50; // Limit cache size

export const useImagePreloader = (): UseImagePreloaderReturn => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const preloadImage = useCallback(async (url: string): Promise<void> => {
    // If image is already cached, return immediately
    if (imageCache.has(url)) {
      setIsLoaded(true);
      setHasError(false);
      return;
    }

    // If image is already loading, wait for that promise
    if (loadingPromises.has(url)) {
      await loadingPromises.get(url);
      setIsLoaded(true);
      setHasError(false);
      return;
    }

    // Clean cache if it gets too large
    if (imageCache.size >= MAX_CACHE_SIZE) {
      const firstKey = imageCache.keys().next().value;
      if (firstKey) {
        imageCache.delete(firstKey);
      }
    }

    // Create new loading promise
    const loadingPromise = new Promise<void>((resolve, reject) => {
      const img = new Image();
      
      img.onload = () => {
        imageCache.set(url, img);
        setIsLoaded(true);
        setHasError(false);
        resolve();
      };
      
      img.onerror = () => {
        setHasError(true);
        setIsLoaded(false);
        reject(new Error(`Failed to load image: ${url}`));
      };
      
      img.src = url;
    });

    loadingPromises.set(url, loadingPromise);

    try {
      await loadingPromise;
    } finally {
      loadingPromises.delete(url);
    }
  }, []);

  // Clear state when component unmounts
  useEffect(() => {
    return () => {
      setIsLoaded(false);
      setHasError(false);
    };
  }, []);

  return {
    isLoaded,
    hasError,
    preloadImage
  };
};

// Utility function to preload multiple images
export const preloadImages = async (urls: string[]): Promise<void> => {
  const promises = urls.map(url => {
    if (imageCache.has(url)) {
      return Promise.resolve();
    }
    
    return new Promise<void>((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        imageCache.set(url, img);
        resolve();
      };
      img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
      img.src = url;
    });
  });

  await Promise.all(promises);
};

// Utility function to clear image cache
export const clearImageCache = (): void => {
  imageCache.clear();
  loadingPromises.clear();
};

// Utility function to get cached image
export const getCachedImage = (url: string): HTMLImageElement | undefined => {
  return imageCache.get(url);
}; 