import { useState, useEffect } from 'react';
import { SideNavigation, BottomNavigation } from '@/components/common/Navbar/CommonNavbar';
import { useTheme } from '@/components/theme/theme-provider';
import { useToast } from '@/hooks/use-toast';
import {
  ServerStackIcon,
  CpuChipIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  ChartBarIcon,
  CloudIcon,
  ArrowPathIcon,
  ServerIcon,
  SignalIcon
} from '@heroicons/react/24/outline';

interface SystemHealth {
  database: {
    status: 'healthy' | 'warning' | 'critical';
    responseTime: number;
    connections: number;
    uptime: string;
  };
  apiServer: {
    status: 'healthy' | 'warning' | 'critical';
    responseTime: number;
    memoryUsage: number;
    cpuUsage: number;
    uptime: string;
  };
  fileStorage: {
    status: 'healthy' | 'warning' | 'critical';
    usedSpace: number;
    totalSpace: number;
    responseTime: number;
  };
  emailService: {
    status: 'healthy' | 'warning' | 'critical';
    queueSize: number;
    sentToday: number;
    failedToday: number;
  };
}

interface PerformanceMetrics {
  timestamp: string;
  cpu: number;
  memory: number;
  responseTime: number;
  activeConnections: number;
}

const SystemMonitoring: React.FC = () => {
  const { isDarkTheme: isDarkMode, toggleTheme: toggleDarkMode } = useTheme();
  const { toast } = useToast();
  const [systemHealth, setSystemHealth] = useState<SystemHealth>({
    database: { status: 'healthy', responseTime: 0, connections: 0, uptime: '' },
    apiServer: { status: 'healthy', responseTime: 0, memoryUsage: 0, cpuUsage: 0, uptime: '' },
    fileStorage: { status: 'healthy', usedSpace: 0, totalSpace: 0, responseTime: 0 },
    emailService: { status: 'healthy', queueSize: 0, sentToday: 0, failedToday: 0 }
  });
  const [performanceHistory, setPerformanceHistory] = useState<PerformanceMetrics[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const handleLogout = () => {
    alert("Logged out!");
  };

  const fetchSystemHealth = async () => {
    try {
      setError(null);
      const response = await fetch('/api/admin/system/health', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch system health data');
      }

      const data = await response.json();
      setSystemHealth(data.data);
      setLastUpdate(new Date());
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch system health';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const fetchPerformanceMetrics = async () => {
    try {
      const response = await fetch('/api/admin/system/performance', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch performance metrics');
      }

      const data = await response.json();
      setPerformanceHistory(data.data);
    } catch (err) {
      console.error('Failed to fetch performance metrics:', err);
      toast({
        title: "Error",
        description: "Failed to fetch performance metrics",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchSystemHealth(), fetchPerformanceMetrics()]);
      setLoading(false);
    };

    loadData();

    // Update every 30 seconds
    const interval = setInterval(() => {
      fetchSystemHealth();
      fetchPerformanceMetrics();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-500';
      case 'warning': return 'text-yellow-500';
      case 'critical': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircleIcon className="w-5 h-5" />;
      case 'warning': return <ExclamationTriangleIcon className="w-5 h-5" />;
      case 'critical': return <ExclamationTriangleIcon className="w-5 h-5" />;
      default: return <ClockIcon className="w-5 h-5" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const baseClasses = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";
    switch (status) {
      case 'healthy': return `${baseClasses} bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200`;
      case 'warning': return `${baseClasses} bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200`;
      case 'critical': return `${baseClasses} bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200`;
      default: return `${baseClasses} bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200`;
    }
  };

  return (
    <div className="min-h-screen bg-SmartMess-light-bg dark:SmartMess-dark-bg dark:bg-SmartMess-light-bg dark:SmartMess-dark-bg transition-all duration-300">
      <SideNavigation
        isDarkMode={isDarkMode}
        toggleDarkMode={toggleDarkMode}
        handleLogout={handleLogout}
      />
      <div className="lg:ml-90 transition-all duration-300">
        <header className="sticky top-0 left-0 right-0 z-10 w-full flex items-center px-4 py-3 backdrop-blur-md bg-SmartMess-light-bg dark:SmartMess-dark-bg/80 dark:bg-SmartMess-light-bg dark:SmartMess-dark-bg/70 border-b SmartMess-light-border dark:SmartMess-dark-SmartMess-light-border dark:SmartMess-dark-border dark:SmartMess-light-border dark:SmartMess-dark-SmartMess-light-border dark:SmartMess-dark-border">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center space-x-6 px-6">
              <div className="flex flex-col">
                <h1 className="text-2xl font-bold text-SmartMess-light-text dark:SmartMess-dark-text dark:text-SmartMess-light-text dark:SmartMess-dark-text">
                  System Monitoring
                </h1>
                <p className="text-sm text-SmartMess-light-text dark:SmartMess-dark-text-muted dark:text-SmartMess-light-text dark:SmartMess-dark-text-muted">
                  Real-time system health and performance monitoring
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3 pr-6">
              <div className="flex items-center space-x-2 text-sm text-SmartMess-light-text dark:SmartMess-dark-text-muted dark:text-SmartMess-light-text dark:SmartMess-dark-text-muted">
                <ClockIcon className="w-4 h-4" />
                <span>Last updated: {lastUpdate.toLocaleTimeString()}</span>
              </div>
              <button
                onClick={() => {
                  fetchSystemHealth();
                  fetchPerformanceMetrics();
                }}
                className="flex items-center px-3 py-2 text-sm font-medium text-SmartMess-light-text dark:SmartMess-dark-text dark:text-SmartMess-light-text dark:SmartMess-dark-text bg-SmartMess-light-surface dark:SmartMess-dark-surface dark:bg-SmartMess-light-surface dark:SmartMess-dark-surface border SmartMess-light-border dark:SmartMess-dark-SmartMess-light-border dark:SmartMess-dark-border dark:SmartMess-light-border dark:SmartMess-dark-SmartMess-light-border dark:SmartMess-dark-border rounded-lg hover:bg-SmartMess-light-hover dark:SmartMess-dark-hover dark:hover:bg-SmartMess-light-hover dark:SmartMess-dark-hover transition-colors"
              >
                <ArrowPathIcon className="w-4 h-4 mr-2" />
                Refresh
              </button>
            </div>
          </div>
        </header>

        <div className="p-6 pb-24">
          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <div className="flex items-center">
                <ExclamationTriangleIcon className="w-5 h-5 text-red-500 mr-2" />
                <span className="text-red-700 dark:text-red-300">{error}</span>
              </div>
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-SmartMess-primary"></div>
            </div>
          ) : (
            <>
              {/* System Health Overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {/* Database Health */}
                <div className="bg-SmartMess-light-surface dark:SmartMess-dark-surface dark:bg-SmartMess-light-surface dark:SmartMess-dark-surface p-6 rounded-lg border SmartMess-light-border dark:SmartMess-dark-SmartMess-light-border dark:SmartMess-dark-border dark:SmartMess-light-border dark:SmartMess-dark-SmartMess-light-border dark:SmartMess-dark-border">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                        <ServerStackIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-SmartMess-light-text dark:SmartMess-dark-text dark:text-SmartMess-light-text dark:SmartMess-dark-text">Database</h3>
                        <span className={getStatusBadge(systemHealth.database.status)}>
                          {systemHealth.database.status}
                        </span>
                      </div>
                    </div>
                    <div className={getStatusColor(systemHealth.database.status)}>
                      {getStatusIcon(systemHealth.database.status)}
                    </div>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-SmartMess-light-text dark:SmartMess-dark-text-muted dark:text-SmartMess-light-text dark:SmartMess-dark-text-muted">Response Time:</span>
                      <span className="text-SmartMess-light-text dark:SmartMess-dark-text dark:text-SmartMess-light-text dark:SmartMess-dark-text">{systemHealth.database.responseTime}ms</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-SmartMess-light-text dark:SmartMess-dark-text-muted dark:text-SmartMess-light-text dark:SmartMess-dark-text-muted">Connections:</span>
                      <span className="text-SmartMess-light-text dark:SmartMess-dark-text dark:text-SmartMess-light-text dark:SmartMess-dark-text">{systemHealth.database.connections}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-SmartMess-light-text dark:SmartMess-dark-text-muted dark:text-SmartMess-light-text dark:SmartMess-dark-text-muted">Uptime:</span>
                      <span className="text-SmartMess-light-text dark:SmartMess-dark-text dark:text-SmartMess-light-text dark:SmartMess-dark-text">{systemHealth.database.uptime}</span>
                    </div>
                  </div>
                </div>

                {/* API Server Health */}
                <div className="bg-SmartMess-light-surface dark:SmartMess-dark-surface dark:bg-SmartMess-light-surface dark:SmartMess-dark-surface p-6 rounded-lg border SmartMess-light-border dark:SmartMess-dark-SmartMess-light-border dark:SmartMess-dark-border dark:SmartMess-light-border dark:SmartMess-dark-SmartMess-light-border dark:SmartMess-dark-border">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                        <ServerIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-SmartMess-light-text dark:SmartMess-dark-text dark:text-SmartMess-light-text dark:SmartMess-dark-text">API Server</h3>
                        <span className={getStatusBadge(systemHealth.apiServer.status)}>
                          {systemHealth.apiServer.status}
                        </span>
                      </div>
                    </div>
                    <div className={getStatusColor(systemHealth.apiServer.status)}>
                      {getStatusIcon(systemHealth.apiServer.status)}
                    </div>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-SmartMess-light-text dark:SmartMess-dark-text-muted dark:text-SmartMess-light-text dark:SmartMess-dark-text-muted">CPU Usage:</span>
                      <span className="text-SmartMess-light-text dark:SmartMess-dark-text dark:text-SmartMess-light-text dark:SmartMess-dark-text">{systemHealth.apiServer.cpuUsage}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-SmartMess-light-text dark:SmartMess-dark-text-muted dark:text-SmartMess-light-text dark:SmartMess-dark-text-muted">Memory:</span>
                      <span className="text-SmartMess-light-text dark:SmartMess-dark-text dark:text-SmartMess-light-text dark:SmartMess-dark-text">{systemHealth.apiServer.memoryUsage}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-SmartMess-light-text dark:SmartMess-dark-text-muted dark:text-SmartMess-light-text dark:SmartMess-dark-text-muted">Uptime:</span>
                      <span className="text-SmartMess-light-text dark:SmartMess-dark-text dark:text-SmartMess-light-text dark:SmartMess-dark-text">{systemHealth.apiServer.uptime}</span>
                    </div>
                  </div>
                </div>

                {/* File Storage Health */}
                <div className="bg-SmartMess-light-surface dark:SmartMess-dark-surface dark:bg-SmartMess-light-surface dark:SmartMess-dark-surface p-6 rounded-lg border SmartMess-light-border dark:SmartMess-dark-SmartMess-light-border dark:SmartMess-dark-border dark:SmartMess-light-border dark:SmartMess-dark-SmartMess-light-border dark:SmartMess-dark-border">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                        <CloudIcon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-SmartMess-light-text dark:SmartMess-dark-text dark:text-SmartMess-light-text dark:SmartMess-dark-text">File Storage</h3>
                        <span className={getStatusBadge(systemHealth.fileStorage.status)}>
                          {systemHealth.fileStorage.status}
                        </span>
                      </div>
                    </div>
                    <div className={getStatusColor(systemHealth.fileStorage.status)}>
                      {getStatusIcon(systemHealth.fileStorage.status)}
                    </div>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-SmartMess-light-text dark:SmartMess-dark-text-muted dark:text-SmartMess-light-text dark:SmartMess-dark-text-muted">Used Space:</span>
                      <span className="text-SmartMess-light-text dark:SmartMess-dark-text dark:text-SmartMess-light-text dark:SmartMess-dark-text">
                        {((systemHealth.fileStorage.usedSpace / systemHealth.fileStorage.totalSpace) * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-SmartMess-light-text dark:SmartMess-dark-text-muted dark:text-SmartMess-light-text dark:SmartMess-dark-text-muted">Available:</span>
                      <span className="text-SmartMess-light-text dark:SmartMess-dark-text dark:text-SmartMess-light-text dark:SmartMess-dark-text">
                        {((systemHealth.fileStorage.totalSpace - systemHealth.fileStorage.usedSpace) / 1024 / 1024 / 1024).toFixed(1)}GB
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-SmartMess-light-text dark:SmartMess-dark-text-muted dark:text-SmartMess-light-text dark:SmartMess-dark-text-muted">Response:</span>
                      <span className="text-SmartMess-light-text dark:SmartMess-dark-text dark:text-SmartMess-light-text dark:SmartMess-dark-text">{systemHealth.fileStorage.responseTime}ms</span>
                    </div>
                  </div>
                </div>

                {/* Email Service Health */}
                <div className="bg-SmartMess-light-surface dark:SmartMess-dark-surface dark:bg-SmartMess-light-surface dark:SmartMess-dark-surface p-6 rounded-lg border SmartMess-light-border dark:SmartMess-dark-SmartMess-light-border dark:SmartMess-dark-border dark:SmartMess-light-border dark:SmartMess-dark-SmartMess-light-border dark:SmartMess-dark-border">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center">
                        <SignalIcon className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-SmartMess-light-text dark:SmartMess-dark-text dark:text-SmartMess-light-text dark:SmartMess-dark-text">Email Service</h3>
                        <span className={getStatusBadge(systemHealth.emailService.status)}>
                          {systemHealth.emailService.status}
                        </span>
                      </div>
                    </div>
                    <div className={getStatusColor(systemHealth.emailService.status)}>
                      {getStatusIcon(systemHealth.emailService.status)}
                    </div>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-SmartMess-light-text dark:SmartMess-dark-text-muted dark:text-SmartMess-light-text dark:SmartMess-dark-text-muted">Queue Size:</span>
                      <span className="text-SmartMess-light-text dark:SmartMess-dark-text dark:text-SmartMess-light-text dark:SmartMess-dark-text">{systemHealth.emailService.queueSize}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-SmartMess-light-text dark:SmartMess-dark-text-muted dark:text-SmartMess-light-text dark:SmartMess-dark-text-muted">Sent Today:</span>
                      <span className="text-SmartMess-light-text dark:SmartMess-dark-text dark:text-SmartMess-light-text dark:SmartMess-dark-text">{systemHealth.emailService.sentToday}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-SmartMess-light-text dark:SmartMess-dark-text-muted dark:text-SmartMess-light-text dark:SmartMess-dark-text-muted">Failed Today:</span>
                      <span className="text-SmartMess-light-text dark:SmartMess-dark-text dark:text-SmartMess-light-text dark:SmartMess-dark-text">{systemHealth.emailService.failedToday}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Performance Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* CPU Usage Chart */}
                <div className="bg-SmartMess-light-surface dark:SmartMess-dark-surface dark:bg-SmartMess-light-surface dark:SmartMess-dark-surface rounded-lg p-6 border SmartMess-light-border dark:SmartMess-dark-SmartMess-light-border dark:SmartMess-dark-border dark:SmartMess-light-border dark:SmartMess-dark-SmartMess-light-border dark:SmartMess-dark-border">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-SmartMess-light-text dark:SmartMess-dark-text dark:text-SmartMess-light-text dark:SmartMess-dark-text flex items-center">
                      <CpuChipIcon className="w-5 h-5 mr-2" />
                      CPU Usage
                    </h3>
                    <span className="text-sm text-SmartMess-light-text dark:SmartMess-dark-text-muted dark:text-SmartMess-light-text dark:SmartMess-dark-text-muted">
                      Current: {systemHealth.apiServer.cpuUsage}%
                    </span>
                  </div>
                  <div className="h-48 flex items-end justify-between space-x-1">
                    {performanceHistory.slice(-20).map((metric, index) => (
                      <div key={index} className="flex flex-col items-center">
                        <div 
                          className={`w-3 rounded-t transition-all duration-500 ${
                            metric.cpu > 80 ? 'bg-red-500' : metric.cpu > 60 ? 'bg-yellow-500' : 'bg-green-500'
                          }`}
                          style={{ height: `${(metric.cpu / 100) * 160}px` }}
                        ></div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Memory Usage Chart */}
                <div className="bg-SmartMess-light-surface dark:SmartMess-dark-surface dark:bg-SmartMess-light-surface dark:SmartMess-dark-surface rounded-lg p-6 border SmartMess-light-border dark:SmartMess-dark-SmartMess-light-border dark:SmartMess-dark-border dark:SmartMess-light-border dark:SmartMess-dark-SmartMess-light-border dark:SmartMess-dark-border">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-SmartMess-light-text dark:SmartMess-dark-text dark:text-SmartMess-light-text dark:SmartMess-dark-text flex items-center">
                      <ChartBarIcon className="w-5 h-5 mr-2" />
                      Memory Usage
                    </h3>
                    <span className="text-sm text-SmartMess-light-text dark:SmartMess-dark-text-muted dark:text-SmartMess-light-text dark:SmartMess-dark-text-muted">
                      Current: {systemHealth.apiServer.memoryUsage}%
                    </span>
                  </div>
                  <div className="h-48 flex items-end justify-between space-x-1">
                    {performanceHistory.slice(-20).map((metric, index) => (
                      <div key={index} className="flex flex-col items-center">
                        <div 
                          className={`w-3 rounded-t transition-all duration-500 ${
                            metric.memory > 80 ? 'bg-red-500' : metric.memory > 60 ? 'bg-yellow-500' : 'bg-blue-500'
                          }`}
                          style={{ height: `${(metric.memory / 100) * 160}px` }}
                        ></div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Detailed Metrics */}
              <div className="bg-SmartMess-light-surface dark:SmartMess-dark-surface dark:bg-SmartMess-light-surface dark:SmartMess-dark-surface rounded-lg border SmartMess-light-border dark:SmartMess-dark-SmartMess-light-border dark:SmartMess-dark-border dark:SmartMess-light-border dark:SmartMess-dark-SmartMess-light-border dark:SmartMess-dark-border overflow-hidden">
                <div className="px-6 py-4 border-b SmartMess-light-border dark:SmartMess-dark-SmartMess-light-border dark:SmartMess-dark-border dark:SmartMess-light-border dark:SmartMess-dark-SmartMess-light-border dark:SmartMess-dark-border">
                  <h3 className="text-lg font-semibold text-SmartMess-light-text dark:SmartMess-dark-text dark:text-SmartMess-light-text dark:SmartMess-dark-text">
                    Performance Metrics
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-SmartMess-light-hover dark:SmartMess-dark-hover dark:bg-SmartMess-light-hover dark:SmartMess-dark-hover">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium text-SmartMess-light-text dark:SmartMess-dark-text dark:text-SmartMess-light-text dark:SmartMess-dark-text">Timestamp</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-SmartMess-light-text dark:SmartMess-dark-text dark:text-SmartMess-light-text dark:SmartMess-dark-text">CPU %</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-SmartMess-light-text dark:SmartMess-dark-text dark:text-SmartMess-light-text dark:SmartMess-dark-text">Memory %</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-SmartMess-light-text dark:SmartMess-dark-text dark:text-SmartMess-light-text dark:SmartMess-dark-text">Response Time</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-SmartMess-light-text dark:SmartMess-dark-text dark:text-SmartMess-light-text dark:SmartMess-dark-text">Active Connections</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-SmartMess-light-border dark:SmartMess-dark-border dark:divide-SmartMess-light-border dark:SmartMess-dark-border">
                      {performanceHistory.slice(-10).reverse().map((metric, index) => (
                        <tr key={index} className="hover:bg-SmartMess-light-hover dark:SmartMess-dark-hover dark:hover:bg-SmartMess-light-hover dark:SmartMess-dark-hover transition-colors">
                          <td className="px-4 py-3 text-sm text-SmartMess-light-text dark:SmartMess-dark-text dark:text-SmartMess-light-text dark:SmartMess-dark-text">
                            {new Date(metric.timestamp).toLocaleTimeString()}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center space-x-2">
                              <div className={`w-2 h-2 rounded-full ${
                                metric.cpu > 80 ? 'bg-red-500' : metric.cpu > 60 ? 'bg-yellow-500' : 'bg-green-500'
                              }`}></div>
                              <span className="text-sm text-SmartMess-light-text dark:SmartMess-dark-text dark:text-SmartMess-light-text dark:SmartMess-dark-text">{metric.cpu}%</span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center space-x-2">
                              <div className={`w-2 h-2 rounded-full ${
                                metric.memory > 80 ? 'bg-red-500' : metric.memory > 60 ? 'bg-yellow-500' : 'bg-blue-500'
                              }`}></div>
                              <span className="text-sm text-SmartMess-light-text dark:SmartMess-dark-text dark:text-SmartMess-light-text dark:SmartMess-dark-text">{metric.memory}%</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-SmartMess-light-text dark:SmartMess-dark-text dark:text-SmartMess-light-text dark:SmartMess-dark-text">
                            {metric.responseTime}ms
                          </td>
                          <td className="px-4 py-3 text-sm text-SmartMess-light-text dark:SmartMess-dark-text dark:text-SmartMess-light-text dark:SmartMess-dark-text">
                            {metric.activeConnections}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
      <BottomNavigation
        isDarkMode={isDarkMode}
        toggleDarkMode={toggleDarkMode}
        handleLogout={handleLogout}
      />
    </div>
  );
};

export default SystemMonitoring;
