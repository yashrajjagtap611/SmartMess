import React, { useState, useEffect } from 'react';
import { cacheService } from '../../services/utils/cacheService';
import { requestThrottler } from '../../services/utils/requestThrottler';
import { performanceMonitor } from '../../services/utils/performanceMonitor';
import { getImageCacheStats } from '../../services/optimizedImageService';

const PerformanceDashboard: React.FC = () => {
  const [cacheStats, setCacheStats] = useState(cacheService.getCacheStats());
  const [throttlerStats, setThrottlerStats] = useState(requestThrottler.getRequestStats());
  const [performanceReport, setPerformanceReport] = useState(performanceMonitor.getPerformanceReport());
  const [cacheEffectiveness, setCacheEffectiveness] = useState(performanceMonitor.getCacheEffectivenessReport());
  const [realTimeSummary, setRealTimeSummary] = useState(performanceMonitor.getRealTimeSummary());
  const [imageStats, setImageStats] = useState(getImageCacheStats());
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      setCacheStats(cacheService.getCacheStats());
      setThrottlerStats(requestThrottler.getRequestStats());
      setPerformanceReport(performanceMonitor.getPerformanceReport());
      setCacheEffectiveness(performanceMonitor.getCacheEffectivenessReport());
      setRealTimeSummary(performanceMonitor.getRealTimeSummary());
      setImageStats(getImageCacheStats());
    }, 2000); // Update every 2 seconds

    return () => clearInterval(interval);
  }, [autoRefresh]);

  const handleClearAllCaches = () => {
    cacheService.clearAllCaches();
    setCacheStats(cacheService.getCacheStats());
  };

  const handleClearQueue = () => {
    requestThrottler.clearQueue();
    setThrottlerStats(requestThrottler.getRequestStats());
  };

  const handleClearMetrics = () => {
    performanceMonitor.clearMetrics();
    setPerformanceReport(performanceMonitor.getPerformanceReport());
    setCacheEffectiveness(performanceMonitor.getCacheEffectivenessReport());
    setRealTimeSummary(performanceMonitor.getRealTimeSummary());
  };

  const handleExportMetrics = () => {
    const metrics = performanceMonitor.exportMetrics();
    const blob = new Blob([metrics], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `performance-metrics-${new Date().toISOString()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Performance Dashboard</h2>
        <div className="flex gap-2">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="rounded"
            />
            Auto Refresh
          </label>
        </div>
      </div>

      {/* Real-time Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-blue-600 dark:text-blue-400">Requests/min</h3>
          <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
            {realTimeSummary.requestsPerMinute}
          </p>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-green-600 dark:text-green-400">Avg Response</h3>
          <p className="text-2xl font-bold text-green-900 dark:text-green-100">
            {realTimeSummary.averageResponseTime.toFixed(0)}ms
          </p>
        </div>
        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-yellow-600 dark:text-yellow-400">Cache Hit Rate</h3>
          <p className="text-2xl font-bold text-yellow-900 dark:text-yellow-100">
            {(realTimeSummary.cacheHitRate * 100).toFixed(1)}%
          </p>
        </div>
        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-red-600 dark:text-red-400">Error Rate</h3>
          <p className="text-2xl font-bold text-red-900 dark:text-red-100">
            {(realTimeSummary.errorRate * 100).toFixed(1)}%
          </p>
        </div>
      </div>

      {/* Cache Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Cache Statistics</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Memory Cache Size:</span>
              <span className="font-mono">{cacheStats.memoryCacheSize}</span>
            </div>
            <div className="flex justify-between">
              <span>Pending Requests:</span>
              <span className="font-mono">{cacheStats.pendingRequests}</span>
            </div>
            <div className="flex justify-between">
              <span>Background Queue:</span>
              <span className="font-mono">{cacheStats.backgroundQueueSize}</span>
            </div>
            <div className="flex justify-between">
              <span>Preloaded Images:</span>
              <span className="font-mono">{imageStats.preloadedImages || 0}</span>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Request Throttling</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Queue Length:</span>
              <span className="font-mono">{throttlerStats.queueLength}</span>
            </div>
            <div className="flex justify-between">
              <span>Processing:</span>
              <span className="font-mono">{throttlerStats.processing ? 'Yes' : 'No'}</span>
            </div>
            <div className="flex justify-between">
              <span>Active Rate Limits:</span>
              <span className="font-mono">{Object.keys(throttlerStats.requestCounts).length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Cache Effectiveness */}
      <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg mb-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Cache Effectiveness</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="block text-gray-600 dark:text-gray-400">Total Hits</span>
            <span className="text-lg font-bold text-green-600">{cacheEffectiveness.totalCacheHits}</span>
          </div>
          <div>
            <span className="block text-gray-600 dark:text-gray-400">Total Misses</span>
            <span className="text-lg font-bold text-red-600">{cacheEffectiveness.totalCacheMisses}</span>
          </div>
          <div>
            <span className="block text-gray-600 dark:text-gray-400">Hit Rate</span>
            <span className="text-lg font-bold text-blue-600">
              {(cacheEffectiveness.overallHitRate * 100).toFixed(1)}%
            </span>
          </div>
          <div>
            <span className="block text-gray-600 dark:text-gray-400">Time Saved</span>
            <span className="text-lg font-bold text-purple-600">
              {cacheEffectiveness.timeSaved.toFixed(0)}ms
            </span>
          </div>
        </div>
      </div>

      {/* Performance Overview */}
      <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg mb-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Performance Overview</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="block text-gray-600 dark:text-gray-400">Total Requests</span>
            <span className="text-lg font-bold">{performanceReport.overall.totalRequests}</span>
          </div>
          <div>
            <span className="block text-gray-600 dark:text-gray-400">Avg Response Time</span>
            <span className="text-lg font-bold">{performanceReport.overall.averageResponseTime.toFixed(0)}ms</span>
          </div>
          <div>
            <span className="block text-gray-600 dark:text-gray-400">Success Rate</span>
            <span className="text-lg font-bold">{(performanceReport.overall.successRate * 100).toFixed(1)}%</span>
          </div>
          <div>
            <span className="block text-gray-600 dark:text-gray-400">Cache Hit Rate</span>
            <span className="text-lg font-bold">{(performanceReport.overall.cacheHitRate * 100).toFixed(1)}%</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={handleClearAllCaches}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
        >
          Clear All Caches
        </button>
        <button
          onClick={handleClearQueue}
          className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 transition-colors"
        >
          Clear Request Queue
        </button>
        <button
          onClick={handleClearMetrics}
          className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-colors"
        >
          Clear Metrics
        </button>
        <button
          onClick={handleExportMetrics}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
        >
          Export Metrics
        </button>
      </div>

      {/* Rate Limit Details */}
      {Object.keys(throttlerStats.requestCounts).length > 0 && (
        <div className="mt-6 bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Rate Limit Details</h3>
          <div className="space-y-2 text-sm">
            {Object.entries(throttlerStats.requestCounts).map(([key, value]) => (
              <div key={key} className="flex justify-between items-center">
                <span className="font-mono">{key}</span>
                <span className="font-mono">
                  {value.count} requests (resets in {Math.max(0, Math.ceil((value.resetTime - Date.now()) / 1000))}s)
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PerformanceDashboard; 