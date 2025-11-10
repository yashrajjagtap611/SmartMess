import React, { useState, useEffect } from 'react';
import { 
  CheckCircleIcon, 
  XCircleIcon, 
  InformationCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

interface PWADebugInfo {
  // Browser info
  userAgent: string;
  platform: string;
  language: string;
  
  // PWA criteria
  hasServiceWorker: boolean;
  hasManifest: boolean;
  isHttps: boolean;
  isStandalone: boolean;
  isFullscreen: boolean;
  isMinimalUI: boolean;
  
  // Manifest info
  manifestUrl?: string;
  
  // Service worker info
  serviceWorkerSupported: boolean;
  serviceWorkerRegistrations?: number;
  serviceWorkerController?: boolean;
  serviceWorkerError?: any;
  
  // Installation info
  beforeInstallPromptSupported: boolean;
  
  // Network info
  online: boolean;
  connectionType: string;
  
  // Screen info
  screenWidth: number;
  screenHeight: number;
  viewportWidth: number;
  viewportHeight: number;
  
  // URL info
  currentUrl: string;
  origin: string;
  protocol: string;
  hostname: string;
  
  // Storage info
  localStorageSupported: boolean;
  sessionStorageSupported: boolean;
  
  // Notification info
  notificationSupported: boolean;
  notificationPermission: string;
  
  // Cache info
  cacheSupported: boolean;
  
  // Manifest validation
  manifestValid?: boolean;
  manifestName?: string;
  manifestShortName?: string;
  manifestDisplay?: string;
  manifestIcons?: number;
  manifestError?: any;
}

const PWADebugScreen: React.FC = () => {
  const [debugInfo, setDebugInfo] = useState<PWADebugInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const gatherDebugInfo = async () => {
      const info: PWADebugInfo = {
        // Browser info
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        language: navigator.language,
        
        // PWA criteria
        hasServiceWorker: 'serviceWorker' in navigator,
        hasManifest: !!document.querySelector('link[rel="manifest"]'),
        isHttps: window.location.protocol === 'https:' || window.location.hostname === 'localhost',
        isStandalone: window.matchMedia('(display-mode: standalone)').matches,
        isFullscreen: window.matchMedia('(display-mode: fullscreen)').matches,
        isMinimalUI: window.matchMedia('(display-mode: minimal-ui)').matches,
        
        // Manifest info
        manifestUrl: document.querySelector('link[rel="manifest"]')?.getAttribute('href') || '',
        
        // Service worker info
        serviceWorkerSupported: 'serviceWorker' in navigator,
        
        // Installation info
        beforeInstallPromptSupported: 'BeforeInstallPromptEvent' in window,
        
        // Network info
        online: navigator.onLine,
        connectionType: (navigator as any).connection?.effectiveType || 'unknown',
        
        // Screen info
        screenWidth: window.screen.width,
        screenHeight: window.screen.height,
        viewportWidth: window.innerWidth,
        viewportHeight: window.innerHeight,
        
        // URL info
        currentUrl: window.location.href,
        origin: window.location.origin,
        protocol: window.location.protocol,
        hostname: window.location.hostname,
        
        // Storage info
        localStorageSupported: typeof Storage !== 'undefined',
        sessionStorageSupported: typeof sessionStorage !== 'undefined',
        
        // Notification info
        notificationSupported: 'Notification' in window,
        notificationPermission: 'Notification' in window ? Notification.permission : 'not-supported',
        
        // Cache info
        cacheSupported: 'caches' in window,
      };

      // Check service worker registration
      if ('serviceWorker' in navigator) {
        try {
          const registrations = await navigator.serviceWorker.getRegistrations();
          info.serviceWorkerRegistrations = registrations.length;
          info.serviceWorkerController = !!navigator.serviceWorker.controller;
        } catch (error) {
          info.serviceWorkerError = error;
        }
      }

      // Check manifest
      try {
        const manifestResponse = await fetch('/manifest.json');
        if (manifestResponse.ok) {
          const manifest = await manifestResponse.json();
          info.manifestValid = true;
          info.manifestName = manifest.name;
          info.manifestShortName = manifest.short_name;
          info.manifestDisplay = manifest.display;
          info.manifestIcons = manifest.icons?.length || 0;
        } else {
          info.manifestValid = false;
          info.manifestError = `HTTP ${manifestResponse.status}`;
        }
      } catch (error) {
        info.manifestValid = false;
        info.manifestError = error;
      }

      setDebugInfo(info);
      setIsLoading(false);
    };

    gatherDebugInfo();
  }, []);

  const getStatusIcon = (condition: boolean) => {
    return condition ? (
      <CheckCircleIcon className="w-5 h-5 text-green-500" />
    ) : (
      <XCircleIcon className="w-5 h-5 text-red-500" />
    );
  };

  const getStatusText = (condition: boolean) => {
    return condition ? '✅ Pass' : '❌ Fail';
  };

  if (isLoading || !debugInfo) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center space-x-3 mb-6">
            <InformationCircleIcon className="w-8 h-8 text-blue-500" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              PWA Installation Debug
            </h1>
          </div>

          {/* PWA Installation Criteria */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              PWA Installation Criteria
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                {getStatusIcon(debugInfo.hasServiceWorker)}
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Service Worker</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {getStatusText(debugInfo.hasServiceWorker)}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                {getStatusIcon(debugInfo.hasManifest)}
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Web App Manifest</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {getStatusText(debugInfo.hasManifest)}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                {getStatusIcon(debugInfo.isHttps)}
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">HTTPS/Localhost</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {getStatusText(debugInfo.isHttps)}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                {getStatusIcon(!debugInfo.isStandalone && !debugInfo.isFullscreen && !debugInfo.isMinimalUI)}
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Not Already Installed</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {getStatusText(!debugInfo.isStandalone && !debugInfo.isFullscreen && !debugInfo.isMinimalUI)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Information */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Detailed Information
            </h2>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Browser</p>
                  <p className="text-gray-600 dark:text-gray-300">{debugInfo.userAgent}</p>
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Platform</p>
                  <p className="text-gray-600 dark:text-gray-300">{debugInfo.platform}</p>
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Protocol</p>
                  <p className="text-gray-600 dark:text-gray-300">{debugInfo.protocol}</p>
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Hostname</p>
                  <p className="text-gray-600 dark:text-gray-300">{debugInfo.hostname}</p>
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Service Worker Controller</p>
                  <p className="text-gray-600 dark:text-gray-300">
                    {debugInfo.serviceWorkerController ? 'Active' : 'Inactive'}
                  </p>
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Manifest Valid</p>
                  <p className="text-gray-600 dark:text-gray-300">
                    {debugInfo.manifestValid ? 'Yes' : 'No'}
                  </p>
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Display Mode</p>
                  <p className="text-gray-600 dark:text-gray-300">
                    {debugInfo.isStandalone ? 'Standalone' : 
                     debugInfo.isFullscreen ? 'Fullscreen' : 
                     debugInfo.isMinimalUI ? 'Minimal UI' : 'Browser'}
                  </p>
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Network</p>
                  <p className="text-gray-600 dark:text-gray-300">
                    {debugInfo.online ? 'Online' : 'Offline'} ({debugInfo.connectionType})
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Installation Instructions */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Manual Installation Instructions
            </h2>
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
              <div className="space-y-3 text-sm">
                <div>
                  <p className="font-medium text-blue-900 dark:text-blue-100">Chrome/Edge:</p>
                  <p className="text-blue-800 dark:text-blue-200">
                    • Look for the install icon (📱) in the address bar<br/>
                    • Or click the three dots menu → "Install SmartMess"
                  </p>
                </div>
                <div>
                  <p className="font-medium text-blue-900 dark:text-blue-100">Firefox:</p>
                  <p className="text-blue-800 dark:text-blue-200">
                    • Look for the install icon in the address bar<br/>
                    • Or click the menu → "Install App"
                  </p>
                </div>
                <div>
                  <p className="font-medium text-blue-900 dark:text-blue-100">Safari:</p>
                  <p className="text-blue-800 dark:text-blue-200">
                    • Click the share button → "Add to Home Screen"
                  </p>
                </div>
                <div>
                  <p className="font-medium text-blue-900 dark:text-blue-100">Mobile:</p>
                  <p className="text-blue-800 dark:text-blue-200">
                    • Use "Add to Home Screen" from browser menu
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Troubleshooting */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Troubleshooting
            </h2>
            <div className="space-y-3 text-sm">
              {!debugInfo.hasServiceWorker && (
                <div className="flex items-start space-x-2 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <ExclamationTriangleIcon className="w-5 h-5 text-red-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-red-900 dark:text-red-100">Service Worker Missing</p>
                    <p className="text-red-800 dark:text-red-200">
                      Your browser doesn't support service workers. Try using a modern browser like Chrome, Firefox, or Edge.
                    </p>
                  </div>
                </div>
              )}
              
              {!debugInfo.hasManifest && (
                <div className="flex items-start space-x-2 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <ExclamationTriangleIcon className="w-5 h-5 text-red-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-red-900 dark:text-red-100">Manifest Missing</p>
                    <p className="text-red-800 dark:text-red-200">
                      The web app manifest is not found. Check if manifest.json exists and is properly linked.
                    </p>
                  </div>
                </div>
              )}
              
              {!debugInfo.isHttps && (
                <div className="flex items-start space-x-2 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <ExclamationTriangleIcon className="w-5 h-5 text-red-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-red-900 dark:text-red-100">HTTPS Required</p>
                    <p className="text-red-800 dark:text-red-200">
                      PWA installation requires HTTPS (except for localhost). Deploy to a secure server.
                    </p>
                  </div>
                </div>
              )}
              
              {(debugInfo.isStandalone || debugInfo.isFullscreen || debugInfo.isMinimalUI) && (
                <div className="flex items-start space-x-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                  <ExclamationTriangleIcon className="w-5 h-5 text-yellow-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-yellow-900 dark:text-yellow-100">Already Installed</p>
                    <p className="text-yellow-800 dark:text-yellow-200">
                      The app appears to be already installed. You can't install it again.
                    </p>
                  </div>
                </div>
              )}
              
              {debugInfo.hasServiceWorker && debugInfo.hasManifest && debugInfo.isHttps && 
               !debugInfo.isStandalone && !debugInfo.isFullscreen && !debugInfo.isMinimalUI && (
                <div className="flex items-start space-x-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <CheckCircleIcon className="w-5 h-5 text-green-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-green-900 dark:text-green-100">All Criteria Met</p>
                    <p className="text-green-800 dark:text-green-200">
                      Your app meets all PWA installation criteria. The install prompt should appear automatically or you can use manual installation methods.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PWADebugScreen;