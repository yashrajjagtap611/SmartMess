// Request throttling service for managing API request rates
interface ThrottleConfig {
  maxRequests: number;
  timeWindow: number; // in milliseconds
  retryAfter?: number; // Default retry delay
  priority?: 'low' | 'normal' | 'high';
}

interface QueuedRequest {
  id: string;
  execute: () => Promise<any>;
  resolve: (value: any) => void;
  reject: (error: any) => void;
  priority: 'low' | 'normal' | 'high';
  timestamp: number;
}

class RequestThrottler {
  private requestCounts = new Map<string, { count: number; resetTime: number }>();
  private requestQueue: QueuedRequest[] = [];
  private processing = false;
  private defaultConfigs: Record<string, ThrottleConfig> = {
    'mess-photo': { maxRequests: 10, timeWindow: 60000, retryAfter: 5000, priority: 'high' },
    'mess-profile': { maxRequests: 20, timeWindow: 60000, retryAfter: 2000, priority: 'normal' },
    'user-data': { maxRequests: 30, timeWindow: 60000, retryAfter: 1000, priority: 'normal' },
    'general': { maxRequests: 50, timeWindow: 60000, retryAfter: 1000, priority: 'low' }
  };

  /**
   * Execute request with throttling
   */
  async executeRequest<T>(
    requestId: string,
    requestFn: () => Promise<T>,
    config?: Partial<ThrottleConfig>
  ): Promise<T> {
    const throttleConfig = this.getThrottleConfig(requestId, config);
    
    // Check if we can execute immediately
    if (this.canExecuteRequest(requestId, throttleConfig)) {
      return this.executeImmediate(requestId, requestFn);
    }

    // Queue the request
    return this.queueRequest(requestId, requestFn, throttleConfig);
  }

  /**
   * Check if request can be executed immediately
   */
  private canExecuteRequest(requestId: string, config: ThrottleConfig): boolean {
    const now = Date.now();
    const requestInfo = this.requestCounts.get(requestId) || { count: 0, resetTime: now + config.timeWindow };
    
    // Reset counter if time window has passed
    if (now > requestInfo.resetTime) {
      requestInfo.count = 0;
      requestInfo.resetTime = now + config.timeWindow;
    }
    
    return requestInfo.count < config.maxRequests;
  }

  /**
   * Execute request immediately
   */
  private async executeImmediate<T>(requestId: string, requestFn: () => Promise<T>): Promise<T> {
    this.incrementRequestCount(requestId);
    
    try {
      const result = await requestFn();
      console.log(`[Throttler] Request executed immediately: ${requestId}`);
      return result;
    } catch (error) {
      console.error(`[Throttler] Request failed: ${requestId}`, error);
      throw error;
    }
  }

  /**
   * Queue request for later execution
   */
  private async queueRequest<T>(
    requestId: string,
    requestFn: () => Promise<T>,
    config: ThrottleConfig
  ): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const queuedRequest: QueuedRequest = {
        id: requestId,
        execute: requestFn,
        resolve,
        reject,
        priority: config.priority || 'normal',
        timestamp: Date.now()
      };

      // Add to queue and sort by priority
      this.requestQueue.push(queuedRequest);
      this.sortQueue();
      
      console.log(`[Throttler] Request queued: ${requestId} (priority: ${queuedRequest.priority})`);
      
      // Start processing if not already processing
      this.processQueue();
    });
  }

  /**
   * Sort queue by priority and timestamp
   */
  private sortQueue(): void {
    const priorityOrder = { high: 3, normal: 2, low: 1 };
    
    this.requestQueue.sort((a, b) => {
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
      if (priorityDiff !== 0) return priorityDiff;
      return a.timestamp - b.timestamp; // FIFO for same priority
    });
  }

  /**
   * Process queued requests
   */
  private async processQueue(): Promise<void> {
    if (this.processing || this.requestQueue.length === 0) return;

    this.processing = true;

    while (this.requestQueue.length > 0) {
      const request = this.requestQueue[0];
      if (!request) break;
      const config = this.getThrottleConfig(request.id);
      
      // Check if we can execute this request
      if (this.canExecuteRequest(request.id, config)) {
        // Remove from queue and execute
        this.requestQueue.shift();
        
        try {
          const result = await this.executeImmediate(request.id, request.execute);
          request.resolve(result);
        } catch (error) {
          request.reject(error);
        }
      } else {
        // Wait before trying again
        const retryAfter = config.retryAfter || 1000;
        await this.delay(retryAfter);
      }
    }

    this.processing = false;
  }

  /**
   * Get throttle configuration for request
   */
  private getThrottleConfig(requestId: string, customConfig?: Partial<ThrottleConfig>): ThrottleConfig {
    let baseConfig: ThrottleConfig;
    
    if (requestId.includes('photo')) {
      baseConfig = this.defaultConfigs['mess-photo']!;
    } else if (requestId.includes('profile')) {
      baseConfig = this.defaultConfigs['mess-profile']!;
    } else if (requestId.includes('user')) {
      baseConfig = this.defaultConfigs['user-data']!;
    } else {
      baseConfig = this.defaultConfigs['general']!;
    }

    return { ...baseConfig, ...customConfig };
  }

  /**
   * Increment request count
   */
  private incrementRequestCount(requestId: string): void {
    const config = this.getThrottleConfig(requestId);
    const now = Date.now();
    const requestInfo = this.requestCounts.get(requestId) || { count: 0, resetTime: now + config.timeWindow };
    
    if (now > requestInfo.resetTime) {
      requestInfo.count = 0;
      requestInfo.resetTime = now + config.timeWindow;
    }
    
    requestInfo.count++;
    this.requestCounts.set(requestId, requestInfo);
  }

  /**
   * Get request statistics
   */
  getRequestStats(): {
    queueLength: number;
    requestCounts: Record<string, { count: number; resetTime: number }>;
    processing: boolean;
  } {
    return {
      queueLength: this.requestQueue.length,
      requestCounts: Object.fromEntries(this.requestCounts.entries()),
      processing: this.processing
    };
  }

  /**
   * Clear request queue
   */
  clearQueue(): void {
    this.requestQueue.forEach(request => {
      request.reject(new Error('Request queue cleared'));
    });
    this.requestQueue = [];
    console.log('[Throttler] Request queue cleared');
  }

  /**
   * Reset request counts
   */
  resetRequestCounts(): void {
    this.requestCounts.clear();
    console.log('[Throttler] Request counts reset');
  }

  /**
   * Utility delay function
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Export singleton instance
export const requestThrottler = new RequestThrottler();

// Export types for external use
export type { ThrottleConfig, QueuedRequest }; 