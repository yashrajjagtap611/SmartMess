// Comprehensive caching service for optimizing backend requests
interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
  etag: string; // For HTTP caching
  version?: string; // For cache invalidation
}

interface RequestOptions {
  ttl?: number; // Cache TTL in milliseconds
  forceRefresh?: boolean; // Skip cache and force fresh request
  background?: boolean; // Update cache in background
  retryCount?: number; // Number of retry attempts
  retryDelay?: number; // Delay between retries in milliseconds
}

interface RateLimitConfig {
  maxRequests: number;
  timeWindow: number; // in milliseconds
  retryAfter?: number; // Default retry delay
}

class CacheService {
  private memoryCache = new Map<string, CacheItem<any>>();
  private pendingRequests = new Map<string, Promise<any>>();
  private requestCounts = new Map<string, { count: number; resetTime: number }>();
  private backgroundQueue: Array<() => Promise<void>> = [];
  private isProcessingBackground = false;

  // Default configurations
  private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes
  private readonly DEFAULT_RETRY_COUNT = 3;
  private readonly DEFAULT_RETRY_DELAY = 1000; // 1 second
  private readonly BACKGROUND_QUEUE_DELAY = 100; // 100ms between background requests

  // Rate limiting configurations
  private readonly RATE_LIMITS: Record<string, RateLimitConfig> = {
    'mess-photo': { maxRequests: 10, timeWindow: 60000, retryAfter: 5000 }, // 10 requests per minute
    'mess-profile': { maxRequests: 20, timeWindow: 60000, retryAfter: 2000 }, // 20 requests per minute
    'general': { maxRequests: 50, timeWindow: 60000, retryAfter: 1000 } // 50 requests per minute
  };

  /**
   * Get cached data or fetch from source
   */
  async getOrFetch<T>(
    key: string,
    fetchFn: () => Promise<T>,
    options: RequestOptions = {}
  ): Promise<T> {
    const {
      ttl = this.DEFAULT_TTL,
      forceRefresh = false,
      background = false,
      retryCount = this.DEFAULT_RETRY_COUNT,
      retryDelay = this.DEFAULT_RETRY_DELAY
    } = options;

    // Check if request is already pending
    if (this.pendingRequests.has(key)) {
      console.log(`[Cache] Returning pending request for: ${key}`);
      return this.pendingRequests.get(key)!;
    }

    // Check rate limits
    if (!this.checkRateLimit(key)) {
      const retryAfter = this.getRateLimitRetryAfter(key);
      throw new Error(`Rate limit exceeded. Retry after ${retryAfter}ms`);
    }

    // Check memory cache first
    if (!forceRefresh) {
      const cached = this.getFromMemoryCache<T>(key);
      if (cached) {
        console.log(`[Cache] Memory cache hit for: ${key}`);
        
        // If background refresh is enabled, update cache in background
        if (background && this.shouldRefreshInBackground(cached)) {
          this.queueBackgroundRefresh(key, fetchFn, ttl);
        }
        
        return cached.data;
      }
    }

    // Check localStorage cache
    if (!forceRefresh) {
      const localStorageData = this.getFromLocalStorage<T>(key);
      if (localStorageData) {
        console.log(`[Cache] localStorage cache hit for: ${key}`);
        
        // Update memory cache
        this.setMemoryCache(key, localStorageData.data, ttl, localStorageData.etag);
        
        // Background refresh if needed
        if (background && this.shouldRefreshInBackground(localStorageData)) {
          this.queueBackgroundRefresh(key, fetchFn, ttl);
        }
        
        return localStorageData.data;
      }
    }

    // Fetch fresh data
    console.log(`[Cache] Fetching fresh data for: ${key}`);
    const requestPromise = this.fetchWithRetry(key, fetchFn, retryCount, retryDelay);
    this.pendingRequests.set(key, requestPromise);

    try {
      const data = await requestPromise;
      
      // Cache the result
      this.setMemoryCache(key, data, ttl);
      this.setLocalStorage(key, data, ttl);
      
      return data;
    } finally {
      this.pendingRequests.delete(key);
    }
  }

  /**
   * Set data in memory cache
   */
  setMemoryCache<T>(key: string, data: T, ttl: number, etag?: string): void {
    const item: CacheItem<T> = {
      data,
      timestamp: Date.now(),
      ttl,
      etag: etag || ''
    };
    
    this.memoryCache.set(key, item);
    console.log(`[Cache] Set memory cache for: ${key}`);
  }

  /**
   * Get data from memory cache
   */
  getFromMemoryCache<T>(key: string): CacheItem<T> | null {
    const item = this.memoryCache.get(key) as CacheItem<T>;
    
    if (!item) return null;
    
    if (Date.now() - item.timestamp > item.ttl) {
      this.memoryCache.delete(key);
      console.log(`[Cache] Memory cache expired for: ${key}`);
      return null;
    }
    
    return item;
  }

  /**
   * Set data in localStorage
   */
  setLocalStorage<T>(key: string, data: T, ttl: number, etag?: string): void {
    try {
      const item: CacheItem<T> = {
        data,
        timestamp: Date.now(),
        ttl,
        etag: etag || ''
      };
      
      localStorage.setItem(`cache_${key}`, JSON.stringify(item));
      console.log(`[Cache] Set localStorage cache for: ${key}`);
    } catch (error) {
      console.warn(`[Cache] Failed to set localStorage cache for ${key}:`, error);
    }
  }

  /**
   * Get data from localStorage
   */
  getFromLocalStorage<T>(key: string): CacheItem<T> | null {
    try {
      const stored = localStorage.getItem(`cache_${key}`);
      if (!stored) return null;
      
      const item: CacheItem<T> = JSON.parse(stored);
      
      if (Date.now() - item.timestamp > item.ttl) {
        localStorage.removeItem(`cache_${key}`);
        console.log(`[Cache] localStorage cache expired for: ${key}`);
        return null;
      }
      
      return item;
    } catch (error) {
      console.warn(`[Cache] Failed to get localStorage cache for ${key}:`, error);
      return null;
    }
  }

  /**
   * Fetch data with retry logic
   */
  private async fetchWithRetry<T>(
    key: string,
    fetchFn: () => Promise<T>,
    retryCount: number,
    retryDelay: number
  ): Promise<T> {
    let lastError: Error;
    
    for (let attempt = 0; attempt <= retryCount; attempt++) {
      try {
        const data = await fetchFn();
        this.incrementRequestCount(key);
        return data;
      } catch (error: any) {
        lastError = error;
        
        // Don't retry on rate limit errors
        if (error.message?.includes('Rate limit exceeded')) {
          throw error;
        }
        
        if (attempt < retryCount) {
          console.warn(`[Cache] Request failed for ${key}, attempt ${attempt + 1}/${retryCount + 1}:`, error);
          await this.delay(retryDelay * Math.pow(2, attempt)); // Exponential backoff
        }
      }
    }
    
    throw lastError!;
  }

  /**
   * Check if data should be refreshed in background
   */
  private shouldRefreshInBackground<T>(item: CacheItem<T>): boolean {
    const age = Date.now() - item.timestamp;
    const refreshThreshold = item.ttl * 0.8; // Refresh when 80% of TTL has passed
    return age > refreshThreshold;
  }

  /**
   * Queue background refresh
   */
  private queueBackgroundRefresh<T>(
    key: string,
    fetchFn: () => Promise<T>,
    ttl: number
  ): void {
    this.backgroundQueue.push(async () => {
      try {
        console.log(`[Cache] Background refresh for: ${key}`);
        const data = await fetchFn();
        this.setMemoryCache(key, data, ttl);
        this.setLocalStorage(key, data, ttl);
      } catch (error) {
        console.warn(`[Cache] Background refresh failed for ${key}:`, error);
      }
    });
    
    this.processBackgroundQueue();
  }

  /**
   * Process background queue
   */
  private async processBackgroundQueue(): Promise<void> {
    if (this.isProcessingBackground) return;
    
    this.isProcessingBackground = true;
    
    while (this.backgroundQueue.length > 0) {
      const task = this.backgroundQueue.shift();
      if (task) {
        await task();
        await this.delay(this.BACKGROUND_QUEUE_DELAY);
      }
    }
    
    this.isProcessingBackground = false;
  }

  /**
   * Check rate limits
   */
  private checkRateLimit(key: string): boolean {
    const config = this.getRateLimitConfig(key);
    const now = Date.now();
    const requestInfo = this.requestCounts.get(key) || { count: 0, resetTime: now + config.timeWindow };
    
    // Reset counter if time window has passed
    if (now > requestInfo.resetTime) {
      requestInfo.count = 0;
      requestInfo.resetTime = now + config.timeWindow;
    }
    
    if (requestInfo.count >= config.maxRequests) {
      return false;
    }
    
    requestInfo.count++;
    this.requestCounts.set(key, requestInfo);
    return true;
  }

  /**
   * Get rate limit configuration for key
   */
  private getRateLimitConfig(key: string): RateLimitConfig {
    if (key.includes('photo')) return this.RATE_LIMITS['mess-photo']!;
    if (key.includes('profile')) return this.RATE_LIMITS['mess-profile']!;
    return this.RATE_LIMITS['general']!;
  }

  /**
   * Get retry after time for rate limited key
   */
  private getRateLimitRetryAfter(key: string): number {
    const config = this.getRateLimitConfig(key);
    return config.retryAfter || 1000;
  }

  /**
   * Increment request count
   */
  private incrementRequestCount(key: string): void {
    const config = this.getRateLimitConfig(key);
    const now = Date.now();
    const requestInfo = this.requestCounts.get(key) || { count: 0, resetTime: now + config.timeWindow };
    
    if (now > requestInfo.resetTime) {
      requestInfo.count = 0;
      requestInfo.resetTime = now + config.timeWindow;
    }
    
    requestInfo.count++;
    this.requestCounts.set(key, requestInfo);
  }

  /**
   * Clear cache for specific key
   */
  clearCache(key: string): void {
    this.memoryCache.delete(key);
    localStorage.removeItem(`cache_${key}`);
    console.log(`[Cache] Cleared cache for: ${key}`);
  }

  /**
   * Clear all caches
   */
  clearAllCaches(): void {
    this.memoryCache.clear();
    this.pendingRequests.clear();
    this.requestCounts.clear();
    
    // Clear localStorage cache entries
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith('cache_')) {
        localStorage.removeItem(key);
      }
    });
    
    console.log('[Cache] Cleared all caches');
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): {
    memoryCacheSize: number;
    pendingRequests: number;
    backgroundQueueSize: number;
    rateLimitInfo: Record<string, { count: number; resetTime: number }>;
  } {
    return {
      memoryCacheSize: this.memoryCache.size,
      pendingRequests: this.pendingRequests.size,
      backgroundQueueSize: this.backgroundQueue.length,
      rateLimitInfo: Object.fromEntries(this.requestCounts.entries())
    };
  }

  /**
   * Utility delay function
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Export singleton instance
export const cacheService = new CacheService();

// Export types for external use
export type { CacheItem, RequestOptions, RateLimitConfig }; 