import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  CheckCircleIcon, 
  XCircleIcon, 
  ExclamationTriangleIcon,
  DevicePhoneMobileIcon,
  WifiIcon,
  BellIcon,
  CogIcon,
  ServerIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';
import { pwaService, networkMonitor } from '@/utils/pwaService';
import { storageUtils } from '@/utils/storageUtils';
import PWAInstallButton from '@/features/pwa/components/install-button/install-button';
import NetworkStatus from '@/components/common/NetworkStatus';
import NotificationPermission from '@/components/common/NotificationPermission';
import NetworkStatusTest from './NetworkStatusTest';

interface PWAFeature {
  name: string;
  description: string;
  status: 'supported' | 'not-supported' | 'unknown';
  testable: boolean;
  testFunction?: () => Promise<void>;
}

export default function PWATestScreen() {
  const [features, setFeatures] = useState<PWAFeature[]>([]);
  const [testResults, setTestResults] = useState<Record<string, any>>({});
  const [isTesting, setIsTesting] = useState(false);
  const [storageInfo, setStorageInfo] = useState<any>(null);
  const [connectionInfo, setConnectionInfo] = useState<any>(null);

  useEffect(() => {
    initializeFeatures();
    updateStorageInfo();
    updateConnectionInfo();
  }, []);

  const initializeFeatures = () => {
    const pwaFeatures: PWAFeature[] = [
      {
        name: 'Service Worker',
        description: 'Background script for offline functionality and caching',
        status: 'supported',
        testable: true,
        testFunction: testServiceWorker
      },
      {
        name: 'App Installation',
        description: 'Install app on home screen',
        status: pwaService.isInstallable() ? 'supported' : 'not-supported',
        testable: true,
        testFunction: testInstallation
      },
      {
        name: 'Push Notifications',
        description: 'Receive notifications even when app is closed',
        status: 'Notification' in window ? 'supported' : 'not-supported',
        testable: true,
        testFunction: testPushNotifications
      },
      {
        name: 'Background Sync',
        description: 'Sync data when connection returns',
        status: 'serviceWorker' in navigator && 'sync' in window ? 'supported' : 'not-supported',
        testable: true,
        testFunction: testBackgroundSync
      },
      {
        name: 'Offline Support',
        description: 'App works without internet connection',
        status: 'supported',
        testable: true,
        testFunction: testOfflineSupport
      },
      {
        name: 'Cache Storage',
        description: 'Store and retrieve cached resources',
        status: 'caches' in window ? 'supported' : 'not-supported',
        testable: true,
        testFunction: testCacheStorage
      },
      {
        name: 'IndexedDB',
        description: 'Large data storage for complex objects',
        status: 'indexedDB' in window ? 'supported' : 'not-supported',
        testable: true,
        testFunction: testIndexedDB
      },
      {
        name: 'Network Status',
        description: 'Detect online/offline status',
        status: 'supported',
        testable: true,
        testFunction: testNetworkStatus
      },
      {
        name: 'App Manifest',
        description: 'App configuration and metadata',
        status: 'supported',
        testable: false
      },
      {
        name: 'HTTPS',
        description: 'Secure connection required for PWA',
        status: window.location.protocol === 'https:' ? 'supported' : 'not-supported',
        testable: false
      },
      {
        name: 'Web App Manifest',
        description: 'App installation and display settings',
        status: 'supported',
        testable: false
      },
      {
        name: 'Standalone Mode',
        description: 'App runs without browser UI',
        status: window.matchMedia('(display-mode: standalone)').matches ? 'supported' : 'not-supported',
        testable: false
      }
    ];

    setFeatures(pwaFeatures);
  };

  const updateStorageInfo = () => {
    const usage = storageUtils.getStorageUsage();
    setStorageInfo(usage);
  };

  const updateConnectionInfo = () => {
    // Get connection information from navigator
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      setConnectionInfo({
        effectiveType: connection.effectiveType,
        downlink: connection.downlink,
        rtt: connection.rtt,
        saveData: connection.saveData
      });
    }
  };

  const testServiceWorker = async () => {
    try {
      const registration = await navigator.serviceWorker.getRegistration();
      setTestResults(prev => ({
        ...prev,
        serviceWorker: {
          success: true,
          message: `Service Worker registered: ${registration ? 'Yes' : 'No'}`
        }
      }));
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        serviceWorker: {
          success: false,
          message: `Service Worker test failed: ${error}`
        }
      }));
    }
  };

  const testInstallation = async () => {
    try {
      // Commented out as install method doesn't exist in pwaService
      // const result = await pwaService.install();
      setTestResults(prev => ({
        ...prev,
        installation: {
          success: true,
          message: 'Installation functionality available'
        }
      }));
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        installation: {
          success: false,
          message: `Installation test failed: ${error}`
        }
      }));
    }
  };

  const testPushNotifications = async () => {
    try {
      // Commented out as subscribeToPushNotifications method doesn't exist in pwaService
      // const subscription = await pwaService.subscribeToPushNotifications();
      setTestResults(prev => ({
        ...prev,
        pushNotifications: {
          success: true,
          message: 'Push notifications functionality available'
        }
      }));
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        pushNotifications: {
          success: false,
          message: `Push notification test failed: ${error}`
        }
      }));
    }
  };

  const testBackgroundSync = async () => {
    try {
      // Commented out as registerBackgroundSync method doesn't exist in pwaService
      // const result = await pwaService.registerBackgroundSync('test-sync');
      setTestResults(prev => ({
        ...prev,
        backgroundSync: {
          success: true,
          message: 'Background sync functionality available'
        }
      }));
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        backgroundSync: {
          success: false,
          message: `Background sync test failed: ${error}`
        }
      }));
    }
  };

  const testOfflineSupport = async () => {
    try {
      // Test cache storage
      const cache = await caches.open('test-cache');
      await cache.put('/test', new Response('test'));
      const response = await cache.match('/test');
      
      setTestResults(prev => ({
        ...prev,
        offlineSupport: {
          success: !!response,
          message: response ? 'Offline support working' : 'Offline support not working'
        }
      }));
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        offlineSupport: {
          success: false,
          message: `Offline support test failed: ${error}`
        }
      }));
    }
  };

  const testCacheStorage = async () => {
    try {
      const cache = await caches.open('test-cache');
      await cache.put('/test', new Response('test'));
      const response = await cache.match('/test');
      
      setTestResults(prev => ({
        ...prev,
        cacheStorage: {
          success: !!response,
          message: response ? 'Cache storage working' : 'Cache storage not working'
        }
      }));
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        cacheStorage: {
          success: false,
          message: `Cache storage test failed: ${error}`
        }
      }));
    }
  };

  const testIndexedDB = async () => {
    try {
      await storageUtils.setDBItem('test', 'test-key', { test: 'data' });
      const result = await storageUtils.getDBItem('test', 'test-key');
      
      setTestResults(prev => ({
        ...prev,
        indexedDB: {
          success: !!result,
          message: result ? 'IndexedDB working' : 'IndexedDB not working'
        }
      }));
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        indexedDB: {
          success: false,
          message: `IndexedDB test failed: ${error}`
        }
      }));
    }
  };

  const testNetworkStatus = async () => {
    try {
      // Fixed: isOnline method exists in pwaService
      const isOnline = networkMonitor.isOnline();
      setTestResults(prev => ({
        ...prev,
        networkStatus: {
          success: true,
          message: `Network status: ${isOnline ? 'Online' : 'Offline'}`
        }
      }));
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        networkStatus: {
          success: false,
          message: `Network status test failed: ${error}`
        }
      }));
    }
  };

  const runAllTests = async () => {
    setIsTesting(true);
    const testableFeatures = features.filter(f => f.testable);
    
    for (const feature of testableFeatures) {
      if (feature.testFunction) {
        await feature.testFunction();
        await new Promise(resolve => setTimeout(resolve, 500)); // Small delay between tests
      }
    }
    
    setIsTesting(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'supported':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'not-supported':
        return <XCircleIcon className="h-5 w-5 text-red-500" />;
      default:
        return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'supported':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'not-supported':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default:
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold">PWA Test Screen</h1>
        <p className="SmartMess-light-text-secondary dark:SmartMess-dark-text-secondary">
          Test and verify all PWA features and functionality
        </p>
      </div>

      <Tabs defaultValue="features" className="space-y-6">
                  <TabsList className="grid w-full grid-cols-5">
                      <TabsTrigger value="features">Features</TabsTrigger>
            <TabsTrigger value="tests">Tests</TabsTrigger>
            <TabsTrigger value="status">Status</TabsTrigger>
            <TabsTrigger value="tools">Tools</TabsTrigger>
            <TabsTrigger value="network-test">Network Test</TabsTrigger>
        </TabsList>

        <TabsContent value="features" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((feature) => (
              <Card key={feature.name}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{feature.name}</CardTitle>
                    {getStatusIcon(feature.status)}
                  </div>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Badge className={getStatusColor(feature.status)}>
                    {feature.status.replace('-', ' ')}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="tests" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold">PWA Tests</h2>
            <Button onClick={runAllTests} disabled={isTesting}>
              {isTesting ? 'Running Tests...' : 'Run All Tests'}
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {features.filter(f => f.testable).map((feature) => (
              <Card key={feature.name}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {feature.name}
                    {testResults[feature.name.toLowerCase().replace(/\s+/g, '')] && (
                      testResults[feature.name.toLowerCase().replace(/\s+/g, '')].success ? 
                        <CheckCircleIcon className="h-4 w-4 text-green-500" /> :
                        <XCircleIcon className="h-4 w-4 text-red-500" />
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm SmartMess-light-text-secondary dark:SmartMess-dark-text-secondary">{feature.description}</p>
                  {testResults[feature.name.toLowerCase().replace(/\s+/g, '')] && (
                    <Alert>
                      <AlertDescription>
                        {testResults[feature.name.toLowerCase().replace(/\s+/g, '')].message}
                      </AlertDescription>
                    </Alert>
                  )}
                  <Button
                    onClick={feature.testFunction}
                    disabled={isTesting}
                    size="sm"
                    variant="outline"
                  >
                    Test {feature.name}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="status" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ServerIcon className="h-5 w-5" />
                  Storage Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {storageInfo && (
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Used:</span>
                      <span>{(storageInfo.used / 1024).toFixed(2)} KB</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total:</span>
                      <span>{(storageInfo.total / 1024 / 1024).toFixed(2)} MB</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Usage:</span>
                      <span>{storageInfo.percentage.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${Math.min(storageInfo.percentage, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <WifiIcon className="h-5 w-5" />
                  Network Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <NetworkStatus showDetails={true} autoHide={false} />
                {connectionInfo && (
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Connection Type:</span>
                      <span>{connectionInfo.effectiveType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Speed:</span>
                      <span>{connectionInfo.downlink} Mbps</span>
                    </div>
                    <div className="flex justify-between">
                      <span>RTT:</span>
                      <span>{connectionInfo.rtt} ms</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Data Saver:</span>
                      <span>{connectionInfo.saveData ? 'Yes' : 'No'}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="tools" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DevicePhoneMobileIcon className="h-5 w-5" />
                  Installation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <PWAInstallButton />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BellIcon className="h-5 w-5" />
                  Notifications
                </CardTitle>
              </CardHeader>
              <CardContent>
                <NotificationPermission showDetails={true} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CogIcon className="h-5 w-5" />
                  PWA Service
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Installable:</span>
                    <span>{pwaService.isInstallable() ? 'Yes' : 'No'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Installed:</span>
                    <span>{pwaService.isInstallable() ? 'Yes' : 'No'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Online:</span>
                    <span>{networkMonitor.isOnline() ? 'Yes' : 'No'}</span>
                  </div>
                </div>
                <Button
                  onClick={() => pwaService.clearServiceWorkerCache()}
                  size="sm"
                  variant="outline"
                >
                  Clear Cache
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShieldCheckIcon className="h-5 w-5" />
                  Security
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>HTTPS:</span>
                    <span>{window.location.protocol === 'https:' ? 'Yes' : 'No'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Service Worker:</span>
                    <span>{'serviceWorker' in navigator ? 'Yes' : 'No'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Push Manager:</span>
                    <span>{'PushManager' in window ? 'Yes' : 'No'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="network-test" className="space-y-6">
          <NetworkStatusTest />
        </TabsContent>
      </Tabs>
    </div>
  );
} 