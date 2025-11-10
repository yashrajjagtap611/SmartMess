// Enhanced Authentication Service
// This service provides a more robust authentication flow to prevent continuous redirects

class EnhancedAuthService {
  private static instance: EnhancedAuthService;
  private tokenRefreshPromise: Promise<any> | null = null;

  private constructor() {}

  static getInstance(): EnhancedAuthService {
    if (!EnhancedAuthService.instance) {
      EnhancedAuthService.instance = new EnhancedAuthService();
    }
    return EnhancedAuthService.instance;
  }

  // Login
  async login(email: string, password: string): Promise<any> {
    try {
      // Import apiClient dynamically to avoid circular dependencies
      const { default: apiClient } = await import('@/services/api');
      const { ENDPOINTS } = await import('@/constants/api');
      
      const response = await apiClient.post(ENDPOINTS.AUTH.LOGIN, { email, password });
      const { token, user } = response.data.data;
      
      if (token) {
        this.setAuthData(token, user);
      }
      
      return response.data;
    } catch (error: any) {
      this.handleAuthError(error);
    }
  }

  // Register
  async register(userData: any): Promise<any> {
    try {
      const { default: apiClient } = await import('@/services/api');
      const { ENDPOINTS } = await import('@/constants/api');
      
      const response = await apiClient.post(ENDPOINTS.AUTH.REGISTER, userData);
      return response.data;
    } catch (error: any) {
      this.handleAuthError(error);
    }
  }

  // Logout
  logout(): void {
    this.clearAuthData();
  }

  // Refresh token
  async refreshToken(): Promise<any> {
    // Prevent multiple concurrent refresh requests
    if (this.tokenRefreshPromise) {
      return this.tokenRefreshPromise;
    }

    try {
      const { default: apiClient } = await import('@/services/api');
      const { ENDPOINTS } = await import('@/constants/api');
      
      this.tokenRefreshPromise = apiClient.post(ENDPOINTS.AUTH.REFRESH_TOKEN);
      const response = await this.tokenRefreshPromise;
      const { token, user } = response.data.data;
      
      if (token) {
        this.setAuthData(token, user);
      }
      
      return response.data;
    } catch (error: any) {
      this.handleAuthError(error);
    } finally {
      this.tokenRefreshPromise = null;
    }
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    const token = localStorage.getItem('authToken');
    if (!token) return false;

    // If offline, allow access with stored token (offline mode)
    if (!navigator.onLine) {
      return true;
    }

    return true;
  }

  // Check if token has expired
  isTokenExpired(): boolean {
    // If offline, don't consider token expired
    if (!navigator.onLine) {
      return false;
    }
    
    const token = localStorage.getItem('authToken');
    const expiresAt = localStorage.getItem('authExpires');
    
    // If no token, consider expired
    if (!token) return true;
    
    // If no expiration date, consider valid (for backward compatibility)
    if (!expiresAt) return false;
    
    try {
      const expirationDate = new Date(expiresAt);
      const now = new Date();
      // Add 5 minute buffer to prevent premature expiration
      const bufferTime = 5 * 60 * 1000; // 5 minutes in milliseconds
      return expirationDate.getTime() - now.getTime() < bufferTime;
    } catch (error) {
      // If there's any error parsing the date, consider valid (for backward compatibility)
      return false;
    }
  }

  // Get current user role
  getCurrentUserRole(): string | null {
    // First check if authenticated
    if (!this.isAuthenticated()) {
      return null;
    }
    return localStorage.getItem('userRole');
  }

  // Get current user info
  getCurrentUser(): any {
    // First check if authenticated
    if (!this.isAuthenticated()) {
      return null;
    }
    const userInfo = localStorage.getItem('userInfo');
    return userInfo ? JSON.parse(userInfo) : null;
  }

  // Set authentication data
  private setAuthData(token: string, user: any): void {
    localStorage.setItem('authToken', token);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);
    localStorage.setItem('authExpires', expiresAt.toISOString());
    
    if (user?.role) {
      localStorage.setItem('userRole', user.role);
    }
    if (user) {
      localStorage.setItem('userInfo', JSON.stringify(user));
    }
  }

  // Clear authentication data
  private clearAuthData(): void {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userInfo');
    localStorage.removeItem('authExpires');
  }

  // Handle authentication errors
  private handleAuthError(error: any): never {
    if (error.response?.data) {
      throw error.response.data;
    }
    throw {
      success: false,
      message: error.message || 'An unexpected error occurred',
      error: error
    };
  }
}

export const enhancedAuthService = EnhancedAuthService.getInstance();