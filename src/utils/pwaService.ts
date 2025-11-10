// PWA Service Worker Management
export class PWAService {
  private static instance: PWAService;
  private registration: ServiceWorkerRegistration | null = null;
  private updateListeners: Array<() => void> = [];
  private isUpdateApplied = false;

  private constructor() {}

  static getInstance(): PWAService {
    if (!PWAService.instance) {
      PWAService.instance = new PWAService();
    }
    return PWAService.instance;
  }

  async registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
    if ('serviceWorker' in navigator) {
      try {
        // Skip service worker registration in development
        if (import.meta.env.DEV) {
          console.log('SW: Service worker registration skipped in development');
          return null;
        }
        
        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/',
        });
        
        console.log('SW: Service worker registered successfully');
        return registration;
      } catch (error) {
        console.error('SW: Service worker registration failed:', error);
        return null;
      }
    }
    return null;
  }

  private attachUpdateListener(reg: ServiceWorkerRegistration) {
    // If a waiting worker already exists (update installed), notify immediately
    if (reg.waiting) {
      this.notifyUpdateListeners();
    }

    reg.addEventListener('updatefound', () => {
      const newWorker = reg.installing;
      if (newWorker) {
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            this.notifyUpdateListeners();
          }
        });
      }
    });

    navigator.serviceWorker.addEventListener('controllerchange', () => {
      console.log('SW: New service worker controller');
      // Only reload in production to avoid disrupting development
      // Add a check to prevent unnecessary reloads
      if (import.meta.env.PROD && !this.isUpdateApplied) {
        this.isUpdateApplied = true;
        window.location.reload();
      }
    });
  }

  private notifyUpdateListeners() {
    this.updateListeners.forEach((cb) => {
      try { cb(); } catch (err) { console.error('Update listener error:', err); }
    });
  }

  async clearServiceWorkerCache(): Promise<void> {
    try {
      // Clear all caches
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      );
      console.log('Service Worker cache cleared');
    } catch (error) {
      console.error('Failed to clear cache:', error);
    }
  }

  async unregisterServiceWorker(): Promise<boolean> {
    if (!this.registration) {
      return false;
    }

    try {
      const unregistered = await this.registration.unregister();
      console.log('Service Worker unregistered:', unregistered);
      this.registration = null;
      return unregistered;
    } catch (error) {
      console.error('Failed to unregister Service Worker:', error);
      return false;
    }
  }

  async updateServiceWorker(): Promise<void> {
    if (!this.registration) {
      console.warn('No Service Worker registration found');
      return;
    }

    try {
      await this.registration.update();
      console.log('Service Worker update triggered');
    } catch (error) {
      console.error('Failed to update Service Worker:', error);
    }
  }

  getRegistration(): ServiceWorkerRegistration | null {
    return this.registration;
  }

  isServiceWorkerSupported(): boolean {
    return 'serviceWorker' in navigator;
  }

  async checkForUpdates(): Promise<void> {
    if (!this.registration) {
      return;
    }

    try {
      await this.registration.update();
    } catch (error) {
      console.error('Failed to check for updates:', error);
    }
  }

  onUpdateAvailable(callback: () => void): void {
    // Store listener for later notification
    this.updateListeners.push(callback);
    // If we already have a registration, ensure listeners are attached and check waiting state
    if (this.registration) {
      this.attachUpdateListener(this.registration);
    }
  }

  isInstallable(): boolean {
    // Check if the app can be installed
    return 'serviceWorker' in navigator && 
           'PushManager' in window && 
           this.registration !== null;
  }

  async applyUpdate(): Promise<void> {
    if (!this.registration) {
      return;
    }

    try {
      // Send a message to the service worker to skip waiting
      if (this.registration.waiting) {
        this.registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      }
      
      // Proactively clear caches to avoid stale assets on reload
      await this.clearServiceWorkerCache();
      
      // Reload the page to apply the update
      window.location.reload();
    } catch (error) {
      console.error('Failed to apply update:', error);
    }
  }
}

// Network status monitoring
export class NetworkMonitor {
  private static instance: NetworkMonitor;
  private listeners: Array<(isOnline: boolean) => void> = [];

  private constructor() {
    this.initialize();
  }

  static getInstance(): NetworkMonitor {
    if (!NetworkMonitor.instance) {
      NetworkMonitor.instance = new NetworkMonitor();
    }
    return NetworkMonitor.instance;
  }

  private initialize(): void {
    window.addEventListener('online', () => {
      console.log('🌐 Network: Back online');
      document.documentElement.classList.remove('offline');
      this.notifyListeners(true);
    });

    window.addEventListener('offline', () => {
      console.log('📶 Network: Gone offline');
      document.documentElement.classList.add('offline');
      this.notifyListeners(false);
    });

    // Initialize network status
    if (!navigator.onLine) {
      document.documentElement.classList.add('offline');
      this.notifyListeners(false);
    }
  }

  addListener(callback: (isOnline: boolean) => void): void {
    this.listeners.push(callback);
  }

  removeListener(callback: (isOnline: boolean) => void): void {
    const index = this.listeners.indexOf(callback);
    if (index > -1) {
      this.listeners.splice(index, 1);
    }
  }

  private notifyListeners(isOnline: boolean): void {
    this.listeners.forEach(listener => listener(isOnline));
  }

  isOnline(): boolean {
    return navigator.onLine;
  }
}

// Export singleton instances
export const pwaService = PWAService.getInstance();
export const networkMonitor = NetworkMonitor.getInstance(); 