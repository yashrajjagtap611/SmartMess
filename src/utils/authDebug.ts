// Authentication Debug Utility
// This file helps monitor and debug authentication-related issues

class AuthDebugger {
  private static instance: AuthDebugger;
  private authCheckCount: number = 0;
  private lastAuthCheck: number = Date.now();
  private checks: { time: number; gap: number }[] = [];
  private originalGetItem: typeof localStorage.getItem;
  private reloadCount: number = 0;
  private reloadHistory: number[] = [];
  private navigationHistory: string[] = [];

  private constructor() {
    // Track page reloads
    this.trackReloads();
    
    // Store original localStorage.getItem
    this.originalGetItem = localStorage.getItem;
    
    // Override localStorage.getItem to monitor auth token access
    localStorage.getItem = (key: string): string | null => {
      if (key === 'authToken') {
        this.authCheckCount++;
        const now = Date.now();
        const timeSinceLastCheck = now - this.lastAuthCheck;
        this.checks.push({ time: now, gap: timeSinceLastCheck });
        console.log(`🔐 [AUTH DEBUG] Token check #${this.authCheckCount} | Gap: ${timeSinceLastCheck}ms`);
        this.lastAuthCheck = now;
        
        if (timeSinceLastCheck < 100) {
          console.warn('⚠️ [AUTH DEBUG] WARNING: Rapid auth checks detected! Gap < 100ms');
        }
      }
      return this.originalGetItem.call(localStorage, key);
    };
    
    // Track navigation changes
    this.trackNavigation();
    
    // Start monitoring
    this.startMonitoring();
  }

  static getInstance(): AuthDebugger {
    if (!AuthDebugger.instance) {
      AuthDebugger.instance = new AuthDebugger();
    }
    return AuthDebugger.instance;
  }

  private trackReloads(): void {
    // Track reloads using sessionStorage
    const reloadCount = sessionStorage.getItem('reloadCount');
    this.reloadCount = reloadCount ? parseInt(reloadCount, 10) + 1 : 1;
    sessionStorage.setItem('reloadCount', this.reloadCount.toString());
    this.reloadHistory.push(Date.now());
    
    console.log(`🔄 [AUTH DEBUG] Page reload #${this.reloadCount}`);
    
    // Show reload history if there are multiple reloads
    if (this.reloadCount > 1) {
      console.log(`📊 [AUTH DEBUG] Reload history:`, this.reloadHistory.map((time, index) => 
        `#${index + 1}: ${new Date(time).toLocaleTimeString()}`
      ));
    }
  }
  
  private trackNavigation(): void {
    // Track navigation changes
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;
    
    history.pushState = function(...args) {
      console.log(`🧭 [AUTH DEBUG] Navigation - pushState:`, args[2]);
      authDebugger.navigationHistory.push(`push: ${args[2]}`);
      return originalPushState.apply(this, args);
    };
    
    history.replaceState = function(...args) {
      console.log(`🧭 [AUTH DEBUG] Navigation - replaceState:`, args[2]);
      authDebugger.navigationHistory.push(`replace: ${args[2]}`);
      return originalReplaceState.apply(this, args);
    };
    
    window.addEventListener('popstate', (event) => {
      console.log(`🧭 [AUTH DEBUG] Navigation - popstate:`, event);
      authDebugger.navigationHistory.push(`popstate: ${window.location.pathname}`);
    });
  }

  private startMonitoring(): void {
    console.log('✅ [AUTH DEBUG] Started monitoring auth checks');
    
    // Reset counter every 10 seconds and log results
    setInterval(() => {
      console.log(`📊 [AUTH DEBUG] Checks in last 10s: ${this.authCheckCount}`);
      if (this.authCheckCount > 5) {
        console.error('❌ [AUTH DEBUG] Too many auth checks! Expected: 0-2, Got: ' + this.authCheckCount);
        console.log('📋 [AUTH DEBUG] Detailed check times:', this.checks);
      }
      this.authCheckCount = 0;
      this.checks = [];
    }, 10000);
    
    // Log reload information
    console.log(`🔄 [AUTH DEBUG] Current reload count: ${this.reloadCount}`);
    
    // Log navigation history periodically
    setInterval(() => {
      if (this.navigationHistory.length > 0) {
        console.log(`🧭 [AUTH DEBUG] Navigation history:`, this.navigationHistory);
        this.navigationHistory = []; // Clear after logging
      }
    }, 5000);
  }

  // Method to manually log authentication events
  logAuthEvent(event: string, details?: any): void {
    console.log(`[AUTH DEBUG] ${event}`, details || '');
  }

  // Method to check current auth status
  checkAuthStatus(): { 
    hasToken: boolean; 
    hasUserInfo: boolean; 
    tokenExpiry: string | null; 
    isExpired: boolean 
  } {
    const token = localStorage.getItem('authToken');
    const userInfo = localStorage.getItem('userInfo');
    const expiresAt = localStorage.getItem('authExpires');
    
    let isExpired = false;
    if (expiresAt) {
      try {
        const expirationDate = new Date(expiresAt);
        const now = new Date();
        // Add 5 minute buffer
        const bufferTime = 5 * 60 * 1000;
        isExpired = expirationDate.getTime() - now.getTime() < bufferTime;
      } catch (error) {
        console.error('Error parsing expiration date:', error);
      }
    }
    
    return {
      hasToken: !!token,
      hasUserInfo: !!userInfo,
      tokenExpiry: expiresAt,
      isExpired
    };
  }
  
  // Method to reset reload count
  resetReloadCount(): void {
    this.reloadCount = 0;
    this.reloadHistory = [];
    sessionStorage.removeItem('reloadCount');
  }
  
  // Method to log navigation events
  logNavigation(event: string, path: string): void {
    console.log(`🧭 [AUTH DEBUG] Navigation event: ${event} to ${path}`);
    this.navigationHistory.push(`${event}: ${path}`);
  }
}

// Initialize the debugger
const authDebugger = AuthDebugger.getInstance();

// Export for use in other files
export default authDebugger;

// Also export as named exports for convenience
export const logAuthEvent = authDebugger.logAuthEvent.bind(authDebugger);
export const checkAuthStatus = authDebugger.checkAuthStatus.bind(authDebugger);
export const resetReloadCount = authDebugger.resetReloadCount.bind(authDebugger);
export const logNavigation = authDebugger.logNavigation.bind(authDebugger);