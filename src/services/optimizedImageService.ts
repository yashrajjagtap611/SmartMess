import { cacheService } from './utils/cacheService';

// Image cache configuration
const IMAGE_CACHE_CONFIG = {
  TTL: 30 * 60 * 1000, // 30 minutes for images
  PRELOAD_DELAY: 100, // 100ms between preloads
  MAX_CONCURRENT_PRELOADS: 3,
  RETRY_COUNT: 2,
  RETRY_DELAY: 1000
};

// Image preloader with concurrency control
class ImagePreloader {
  private preloadQueue: Array<{ url: string; priority: number }> = [];
  private activePreloads = 0;
  private preloadedImages = new Set<string>();

  /**
   * Preload image with priority
   */
  async preloadImage(url: string, priority: number = 1): Promise<void> {
    if (this.preloadedImages.has(url)) {
      return; // Already preloaded
    }

    // Add to queue
    this.preloadQueue.push({ url, priority });
    this.preloadQueue.sort((a, b) => b.priority - a.priority); // Higher priority first

    // Process queue
    this.processPreloadQueue();
  }

  /**
   * Process preload queue with concurrency control
   */
  private async processPreloadQueue(): Promise<void> {
    if (this.activePreloads >= IMAGE_CACHE_CONFIG.MAX_CONCURRENT_PRELOADS) {
      return;
    }

    const item = this.preloadQueue.shift();
    if (!item) return;

    this.activePreloads++;

    try {
      await this.loadImage(item.url);
      this.preloadedImages.add(item.url);
    } catch (error) {
      console.warn(`[ImagePreloader] Failed to preload image: ${item.url}`, error);
    } finally {
      this.activePreloads--;
      await this.delay(IMAGE_CACHE_CONFIG.PRELOAD_DELAY);
      this.processPreloadQueue(); // Process next item
    }
  }

  /**
   * Load image with timeout
   */
  private loadImage(url: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const timeout = setTimeout(() => {
        reject(new Error(`Image load timeout: ${url}`));
      }, 10000); // 10 second timeout

      img.onload = () => {
        clearTimeout(timeout);
        resolve();
      };

      img.onerror = () => {
        clearTimeout(timeout);
        reject(new Error(`Failed to load image: ${url}`));
      };

      img.src = url;
    });
  }

  /**
   * Check if image is preloaded
   */
  isPreloaded(url: string): boolean {
    return this.preloadedImages.has(url);
  }

  /**
   * Clear preloaded images
   */
  clearPreloaded(): void {
    this.preloadedImages.clear();
    this.preloadQueue = [];
    this.activePreloads = 0;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Global image preloader instance
const imagePreloader = new ImagePreloader();

/**
 * Get cached image URL or fetch from backend
 */
export async function getCachedImageUrl(imageId: string): Promise<string | null> {
  const cacheKey = `image_${imageId}`;
  
  try {
    const imageUrl = await cacheService.getOrFetch(
      cacheKey,
      async () => {
        // Simulate backend call - replace with actual API
        const response = await fetch(`/api/images/${imageId}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch image: ${response.statusText}`);
        }
        const data = await response.json();
        return data.url;
      },
      {
        ttl: IMAGE_CACHE_CONFIG.TTL,
        background: true, // Update cache in background
        retryCount: IMAGE_CACHE_CONFIG.RETRY_COUNT,
        retryDelay: IMAGE_CACHE_CONFIG.RETRY_DELAY
      }
    );

    // Preload image for instant display
    if (imageUrl && !imagePreloader.isPreloaded(imageUrl)) {
      imagePreloader.preloadImage(imageUrl, 1);
    }

    return imageUrl;
  } catch (error) {
    console.error(`[OptimizedImageService] Failed to get image ${imageId}:`, error);
    return null;
  }
}

/**
 * Preload multiple images with priority
 */
export async function preloadImages(
  images: Array<{ id: string; priority?: number }>
): Promise<void> {
  const preloadPromises = images.map(async ({ id, priority = 1 }) => {
    try {
      const url = await getCachedImageUrl(id);
      if (url) {
        await imagePreloader.preloadImage(url, priority);
      }
    } catch (error) {
      console.warn(`[OptimizedImageService] Failed to preload image ${id}:`, error);
    }
  });

  await Promise.allSettled(preloadPromises);
}

/**
 * Get image with fallback
 */
export async function getImageWithFallback(
  imageId: string,
  fallbackUrl?: string
): Promise<string> {
  const imageUrl = await getCachedImageUrl(imageId);
  return imageUrl || fallbackUrl || '/default-image.png';
}

/**
 * Clear image cache
 */
export function clearImageCache(imageId?: string): void {
  if (imageId) {
    cacheService.clearCache(`image_${imageId}`);
  } else {
    cacheService.clearAllCaches();
    imagePreloader.clearPreloaded();
  }
}

/**
 * Get image cache statistics
 */
export function getImageCacheStats() {
  return {
    ...cacheService.getCacheStats(),
    preloadedImages: imagePreloader.isPreloaded.length
  };
}

/**
 * Batch image operations
 */
export class BatchImageProcessor {
  private batchQueue: Array<{ id: string; operation: 'preload' | 'fetch' }> = [];
  private processing = false;
  private batchSize = 5;
  private batchDelay = 200; // 200ms between batches

  /**
   * Add image to batch queue
   */
  addToBatch(id: string, operation: 'preload' | 'fetch' = 'preload'): void {
    this.batchQueue.push({ id, operation });
    this.processBatch();
  }

  /**
   * Process batch queue
   */
  private async processBatch(): Promise<void> {
    if (this.processing || this.batchQueue.length === 0) return;

    this.processing = true;

    while (this.batchQueue.length > 0) {
      const batch = this.batchQueue.splice(0, this.batchSize);
      
      const promises = batch.map(async ({ id, operation }) => {
        try {
          if (operation === 'preload') {
            await getCachedImageUrl(id);
          } else {
            await getImageWithFallback(id);
          }
        } catch (error) {
          console.warn(`[BatchImageProcessor] Failed to process image ${id}:`, error);
        }
      });

      await Promise.allSettled(promises);
      
      if (this.batchQueue.length > 0) {
        await this.delay(this.batchDelay);
      }
    }

    this.processing = false;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Global batch processor instance
export const batchImageProcessor = new BatchImageProcessor();

// Export preloader for direct access
export { imagePreloader }; 