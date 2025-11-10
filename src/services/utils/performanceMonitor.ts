// Performance monitoring service for tracking request performance and cache effectiveness
interface PerformanceMetric {
  requestId: string;
  startTime: number;
  endTime: number;
  duration: number;
  success: boolean;
  cacheHit: boolean;
  error: string;
  size: number; // Response size in bytes
}

interface CacheMetrics {
  hits: number;
  misses: number;
  hitRate: number;
  averageLoadTime: number;
  totalRequests: number;
}

interface RequestMetrics {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  slowestRequest: PerformanceMetric | null;
  fastestRequest: PerformanceMetric | null;
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private cacheMetrics = new Map<string, CacheMetrics>();
  private requestMetrics = new Map<string, RequestMetrics>();
  private maxMetrics = 1000; // Keep last 1000 metrics
  private monitoringEnabled = true;

  /**
   * Start monitoring a request
   */
  startRequest(requestId: string): string {
    if (!this.monitoringEnabled) return '';
    
    const traceId = `${requestId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const startTime = performance.now();
    
    // Store start time in sessionStorage for cross-component access
    sessionStorage.setItem(`perf_${traceId}`, startTime.toString());
    
    return traceId;
  }

  /**
   * End monitoring a request
   */
  endRequest(
    traceId: string,
    requestId: string,
    success: boolean,
    cacheHit: boolean = false,
    error?: string,
    size?: number
  ): void {
    if (!this.monitoringEnabled || !traceId) return;

    const startTimeStr = sessionStorage.getItem(`perf_${traceId}`);
    if (!startTimeStr) return;

    const startTime = parseFloat(startTimeStr);
    const endTime = performance.now();
    const duration = endTime - startTime;

    const metric: PerformanceMetric = {
      requestId,
      startTime,
      endTime,
      duration,
      success,
      cacheHit,
      error: error || '',
      size: size || 0
    };

    this.addMetric(metric);
    this.updateCacheMetrics(requestId, cacheHit, duration);
    this.updateRequestMetrics(requestId, metric);

    // Clean up
    sessionStorage.removeItem(`perf_${traceId}`);
  }

  /**
   * Add performance metric
   */
  private addMetric(metric: PerformanceMetric): void {
    this.metrics.push(metric);
    
    // Keep only the last maxMetrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics);
    }
  }

  /**
   * Update cache metrics
   */
  private updateCacheMetrics(requestId: string, cacheHit: boolean, duration: number): void {
    const current = this.cacheMetrics.get(requestId) || {
      hits: 0,
      misses: 0,
      hitRate: 0,
      averageLoadTime: 0,
      totalRequests: 0
    };

    current.totalRequests++;
    
    if (cacheHit) {
      current.hits++;
    } else {
      current.misses++;
    }

    current.hitRate = current.hits / current.totalRequests;
    current.averageLoadTime = (current.averageLoadTime * (current.totalRequests - 1) + duration) / current.totalRequests;

    this.cacheMetrics.set(requestId, current);
  }

  /**
   * Update request metrics
   */
  private updateRequestMetrics(requestId: string, metric: PerformanceMetric): void {
    const current = this.requestMetrics.get(requestId) || {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      averageResponseTime: 0,
      slowestRequest: null,
      fastestRequest: null
    };

    current.totalRequests++;
    
    if (metric.success) {
      current.successfulRequests++;
    } else {
      current.failedRequests++;
    }

    current.averageResponseTime = (current.averageResponseTime * (current.totalRequests - 1) + metric.duration) / current.totalRequests;

    if (!current.slowestRequest || metric.duration > current.slowestRequest.duration) {
      current.slowestRequest = metric;
    }

    if (!current.fastestRequest || metric.duration < current.fastestRequest.duration) {
      current.fastestRequest = metric;
    }

    this.requestMetrics.set(requestId, current);
  }

  /**
   * Get performance report
   */
  getPerformanceReport(): {
    overall: {
      totalRequests: number;
      averageResponseTime: number;
      successRate: number;
      cacheHitRate: number;
    };
    byRequest: Record<string, RequestMetrics>;
    byCache: Record<string, CacheMetrics>;
    recentMetrics: PerformanceMetric[];
  } {
    const totalRequests = this.metrics.length;
    const successfulRequests = this.metrics.filter(m => m.success).length;
    const totalDuration = this.metrics.reduce((sum, m) => sum + m.duration, 0);
    const totalCacheHits = this.metrics.filter(m => m.cacheHit).length;

    return {
      overall: {
        totalRequests,
        averageResponseTime: totalRequests > 0 ? totalDuration / totalRequests : 0,
        successRate: totalRequests > 0 ? successfulRequests / totalRequests : 0,
        cacheHitRate: totalRequests > 0 ? totalCacheHits / totalRequests : 0
      },
      byRequest: Object.fromEntries(this.requestMetrics.entries()),
      byCache: Object.fromEntries(this.cacheMetrics.entries()),
      recentMetrics: this.metrics.slice(-50) // Last 50 metrics
    };
  }

  /**
   * Get cache effectiveness report
   */
  getCacheEffectivenessReport(): {
    totalCacheHits: number;
    totalCacheMisses: number;
    overallHitRate: number;
    averageLoadTimeWithCache: number;
    averageLoadTimeWithoutCache: number;
    timeSaved: number;
  } {
    const cacheHits = this.metrics.filter(m => m.cacheHit);
    const cacheMisses = this.metrics.filter(m => !m.cacheHit);
    
    const totalCacheHits = cacheHits.length;
    const totalCacheMisses = cacheMisses.length;
    const totalRequests = totalCacheHits + totalCacheMisses;
    
    const averageLoadTimeWithCache = cacheHits.length > 0 
      ? cacheHits.reduce((sum, m) => sum + m.duration, 0) / cacheHits.length 
      : 0;
    
    const averageLoadTimeWithoutCache = cacheMisses.length > 0 
      ? cacheMisses.reduce((sum, m) => sum + m.duration, 0) / cacheMisses.length 
      : 0;
    
    const timeSaved = totalCacheHits * (averageLoadTimeWithoutCache - averageLoadTimeWithCache);

    return {
      totalCacheHits,
      totalCacheMisses,
      overallHitRate: totalRequests > 0 ? totalCacheHits / totalRequests : 0,
      averageLoadTimeWithCache,
      averageLoadTimeWithoutCache,
      timeSaved
    };
  }

  /**
   * Get slow requests report
   */
  getSlowRequestsReport(threshold: number = 1000): PerformanceMetric[] {
    return this.metrics
      .filter(m => m.duration > threshold)
      .sort((a, b) => b.duration - a.duration)
      .slice(0, 10); // Top 10 slowest requests
  }

  /**
   * Get error report
   */
  getErrorReport(): Array<{ error: string; count: number; lastOccurrence: number }> {
    const errorCounts = new Map<string, { count: number; lastOccurrence: number }>();
    
    this.metrics
      .filter(m => !m.success && m.error)
      .forEach(m => {
        const current = errorCounts.get(m.error!) || { count: 0, lastOccurrence: 0 };
        current.count++;
        current.lastOccurrence = Math.max(current.lastOccurrence, m.endTime);
        errorCounts.set(m.error!, current);
      });

    return Array.from(errorCounts.entries())
      .map(([error, data]) => ({ error, ...data }))
      .sort((a, b) => b.count - a.count);
  }

  /**
   * Clear all metrics
   */
  clearMetrics(): void {
    this.metrics = [];
    this.cacheMetrics.clear();
    this.requestMetrics.clear();
    console.log('[PerformanceMonitor] All metrics cleared');
  }

  /**
   * Enable/disable monitoring
   */
  setMonitoringEnabled(enabled: boolean): void {
    this.monitoringEnabled = enabled;
    console.log(`[PerformanceMonitor] Monitoring ${enabled ? 'enabled' : 'disabled'}`);
  }

  /**
   * Export metrics for analysis
   */
  exportMetrics(): string {
    return JSON.stringify({
      timestamp: new Date().toISOString(),
      metrics: this.metrics,
      cacheMetrics: Object.fromEntries(this.cacheMetrics.entries()),
      requestMetrics: Object.fromEntries(this.requestMetrics.entries())
    }, null, 2);
  }

  /**
   * Get real-time performance summary
   */
  getRealTimeSummary(): {
    requestsPerMinute: number;
    averageResponseTime: number;
    cacheHitRate: number;
    errorRate: number;
  } {
    const now = Date.now();
    const oneMinuteAgo = now - 60000;
    
    const recentMetrics = this.metrics.filter(m => m.endTime > oneMinuteAgo);
    const totalRequests = recentMetrics.length;
    const successfulRequests = recentMetrics.filter(m => m.success).length;
    const cacheHits = recentMetrics.filter(m => m.cacheHit).length;
    const totalDuration = recentMetrics.reduce((sum, m) => sum + m.duration, 0);

    return {
      requestsPerMinute: totalRequests,
      averageResponseTime: totalRequests > 0 ? totalDuration / totalRequests : 0,
      cacheHitRate: totalRequests > 0 ? cacheHits / totalRequests : 0,
      errorRate: totalRequests > 0 ? (totalRequests - successfulRequests) / totalRequests : 0
    };
  }
}

// Export singleton instance
export const performanceMonitor = new PerformanceMonitor();

// Export types for external use
export type { PerformanceMetric, CacheMetrics, RequestMetrics }; 