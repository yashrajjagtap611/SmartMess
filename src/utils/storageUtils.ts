// Storage Utilities for PWA - Comprehensive data persistence and offline functionality

// Storage keys for consistent naming
export const STORAGE_KEYS = {
  MESS_PROFILE: 'mess_profile',
  MESS_COLLEGES: 'mess_colleges',
  MESS_LOCATION: 'mess_location',
  MESS_OWNER_PHONE: 'mess_owner_phone',
  MESS_OWNER_EMAIL: 'mess_owner_email',
  MESS_TYPES: 'mess_types',
  MESS_PHOTO: 'mess_photo',
  USER_DATA: 'user_data',
  SYNC_QUEUE: 'sync_queue'
} as const;

export class StorageUtils {
  private static instance: StorageUtils;
  private storagePrefix = 'SmartMess_';

  private constructor() {}

  static getInstance(): StorageUtils {
    if (!StorageUtils.instance) {
      StorageUtils.instance = new StorageUtils();
    }
    return StorageUtils.instance;
  }

  // Local Storage Operations
  setItem(key: string, value: any): void {
    try {
      const prefixedKey = this.storagePrefix + key;
      const serializedValue = JSON.stringify(value);
      localStorage.setItem(prefixedKey, serializedValue);
    } catch (error) {
      console.error('Storage: Error setting item:', error);
    }
  }

  getItem<T>(key: string, defaultValue?: T): T | null {
    try {
      const prefixedKey = this.storagePrefix + key;
      const item = localStorage.getItem(prefixedKey);
      if (item === null) return defaultValue || null;
      return JSON.parse(item);
    } catch (error) {
      console.error('Storage: Error getting item:', error);
      return defaultValue || null;
    }
  }

  removeItem(key: string): void {
    try {
      const prefixedKey = this.storagePrefix + key;
      localStorage.removeItem(prefixedKey);
    } catch (error) {
      console.error('Storage: Error removing item:', error);
    }
  }

  clear(): void {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith(this.storagePrefix)) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.error('Storage: Error clearing items:', error);
    }
  }

  // Session Storage Operations
  setSessionItem(key: string, value: any): void {
    try {
      const prefixedKey = this.storagePrefix + key;
      const serializedValue = JSON.stringify(value);
      sessionStorage.setItem(prefixedKey, serializedValue);
    } catch (error) {
      console.error('Storage: Error setting session item:', error);
    }
  }

  getSessionItem<T>(key: string, defaultValue?: T): T | null {
    try {
      const prefixedKey = this.storagePrefix + key;
      const item = sessionStorage.getItem(prefixedKey);
      if (item === null) return defaultValue || null;
      return JSON.parse(item);
    } catch (error) {
      console.error('Storage: Error getting session item:', error);
      return defaultValue || null;
    }
  }

  removeSessionItem(key: string): void {
    try {
      const prefixedKey = this.storagePrefix + key;
      sessionStorage.removeItem(prefixedKey);
    } catch (error) {
      console.error('Storage: Error removing session item:', error);
    }
  }

  // IndexedDB Operations for larger data
  async openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('SmartMessDB', 1);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Create object stores
        if (!db.objectStoreNames.contains('userData')) {
          db.createObjectStore('userData', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('messData')) {
          db.createObjectStore('messData', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('mealPlans')) {
          db.createObjectStore('mealPlans', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('notifications')) {
          db.createObjectStore('notifications', { keyPath: 'id', autoIncrement: true });
        }
      };
    });
  }

  async setDBItem(storeName: string, key: string, value: any): Promise<void> {
    try {
      const db = await this.openDB();
      const transaction = db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      
      await new Promise((resolve, reject) => {
        const request = store.put({ id: key, data: value, timestamp: Date.now() });
        request.onsuccess = () => resolve(undefined);
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('Storage: Error setting DB item:', error);
    }
  }

  async getDBItem<T>(storeName: string, key: string): Promise<T | null> {
    try {
      const db = await this.openDB();
      const transaction = db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      
      return new Promise((resolve, reject) => {
        const request = store.get(key);
        request.onsuccess = () => {
          const result = request.result;
          resolve(result ? result.data : null);
        };
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('Storage: Error getting DB item:', error);
      return null;
    }
  }

  async removeDBItem(storeName: string, key: string): Promise<void> {
    try {
      const db = await this.openDB();
      const transaction = db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      
      await new Promise((resolve, reject) => {
        const request = store.delete(key);
        request.onsuccess = () => resolve(undefined);
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('Storage: Error removing DB item:', error);
    }
  }

  async clearDBStore(storeName: string): Promise<void> {
    try {
      const db = await this.openDB();
      const transaction = db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      
      await new Promise((resolve, reject) => {
        const request = store.clear();
        request.onsuccess = () => resolve(undefined);
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('Storage: Error clearing DB store:', error);
    }
  }

  // Cache Storage Operations
  async cacheData(key: string, data: any): Promise<void> {
    try {
      if ('caches' in window) {
        const cache = await caches.open('SmartMess-data-cache');
        const response = new Response(JSON.stringify(data), {
          headers: { 'Content-Type': 'application/json' }
        });
        await cache.put(`/data/${key}`, response);
      }
    } catch (error) {
      console.error('Storage: Error caching data:', error);
    }
  }

  async getCachedData<T>(key: string): Promise<T | null> {
    try {
      if ('caches' in window) {
        const cache = await caches.open('SmartMess-data-cache');
        const response = await cache.match(`/data/${key}`);
        if (response) {
          const data = await response.json();
          return data;
        }
      }
      return null;
    } catch (error) {
      console.error('Storage: Error getting cached data:', error);
      return null;
    }
  }

  async clearCache(): Promise<void> {
    try {
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames.map(cacheName => caches.delete(cacheName))
        );
      }
    } catch (error) {
      console.error('Storage: Error clearing cache:', error);
    }
  }

  // User-specific storage operations
  setUserData(userId: string, key: string, value: any): void {
    this.setItem(`user_${userId}_${key}`, value);
  }

  getUserData<T>(userId: string, key: string, defaultValue?: T): T | null {
    return this.getItem(`user_${userId}_${key}`, defaultValue);
  }

  removeUserData(userId: string, key: string): void {
    this.removeItem(`user_${userId}_${key}`);
  }

  // Offline data queue for sync when online
  async addToSyncQueue(action: string, data: any): Promise<void> {
    try {
      const queue = this.getItem<any[]>('sync_queue', []) || [];
      queue.push({
        id: Date.now().toString(),
        action,
        data,
        timestamp: Date.now()
      });
      this.setItem('sync_queue', queue);
    } catch (error) {
      console.error('Storage: Error adding to sync queue:', error);
    }
  }

  async getSyncQueue(): Promise<any[]> {
    return this.getItem<any[]>('sync_queue', []) || [];
  }

  async clearSyncQueue(): Promise<void> {
    this.removeItem('sync_queue');
  }

  // Storage size utilities
  getStorageSize(): number {
    let size = 0;
    try {
      for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          size += localStorage[key].length;
        }
      }
    } catch (error) {
      console.error('Storage: Error calculating size:', error);
    }
    return size;
  }

  getStorageUsage(): { used: number; total: number; percentage: number } {
    const used = this.getStorageSize();
    const total = 5 * 1024 * 1024; // 5MB typical localStorage limit
    const percentage = (used / total) * 100;
    
    return { used, total, percentage };
  }

  // Migration utilities
  async migrateData(fromKey: string, toKey: string): Promise<void> {
    try {
      const data = this.getItem(fromKey);
      if (data !== null) {
        this.setItem(toKey, data);
        this.removeItem(fromKey);
      }
    } catch (error) {
      console.error('Storage: Error migrating data:', error);
    }
  }

  // Mess Profile specific utilities
  saveMessProfileData(key: string, data: any): void {
    this.setItem(key, data);
  }

  getMessProfileData<T>(key: string, defaultValue?: T): T | null {
    return this.getItem(key, defaultValue);
  }

  clearMessProfileData(): void {
    this.removeItem(STORAGE_KEYS.MESS_PROFILE);
    this.removeItem(STORAGE_KEYS.MESS_COLLEGES);
    this.removeItem(STORAGE_KEYS.MESS_LOCATION);
    this.removeItem(STORAGE_KEYS.MESS_OWNER_PHONE);
    this.removeItem(STORAGE_KEYS.MESS_OWNER_EMAIL);
    this.removeItem(STORAGE_KEYS.MESS_TYPES);
    this.removeItem(STORAGE_KEYS.MESS_PHOTO);
  }

  hasMessProfileData(): boolean {
    return this.getItem(STORAGE_KEYS.MESS_PROFILE) !== null;
  }
}

// Export singleton instance
export const storageUtils = StorageUtils.getInstance(); 