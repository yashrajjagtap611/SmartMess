import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import type { AuthState, User } from '@/types/auth.types';
import { authService } from '@/services/authService';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
  setUser: (user: User | null) => void;
  refreshUser: () => void;
}

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  error: null
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>(initialState);
  const isInitializing = useRef(false);
  const lastInitTime = useRef<number>(0);
  const initialized = useRef(false);
  const isMounted = useRef(true);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  const initializeAuth = async () => {
    // Prevent concurrent initializations
    if (isInitializing.current || initialized.current) return;
    
    // Throttle initialization to prevent excessive calls (max once per second)
    const now = Date.now();
    if (now - lastInitTime.current < 1000) {
      console.log('Auth initialization throttled');
      return;
    }
    lastInitTime.current = now;
    
    isInitializing.current = true;
    try {
      const token = localStorage.getItem('authToken');
      const userInfo = localStorage.getItem('userInfo');

      if (token && userInfo) {
        const user = JSON.parse(userInfo) as User;
        if (isMounted.current) {
          setState({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
            error: null
          });
        }
      } else {
        if (isMounted.current) {
          setState({ ...initialState, isLoading: false });
        }
      }
      initialized.current = true;
    } catch (error) {
      console.error('Failed to initialize auth:', error);
      if (isMounted.current) {
        setState({ ...initialState, isLoading: false });
      }
    } finally {
      isInitializing.current = false;
    }
  };

  // Initialize auth only once
  useEffect(() => {
    if (!initialized.current) {
      initializeAuth();
    }
  }, []);

  // Handle storage events for cross-tab synchronization with debouncing
  useEffect(() => {
    let debounceTimeout: NodeJS.Timeout | null = null;
    
    const handleStorage = (e: StorageEvent) => {
      // Only handle auth-related keys
      if (e.key === 'userInfo' || e.key === 'authToken') {
        // Only reinitialize if the value actually changed
        if (e.newValue !== e.oldValue) {
          // Debounce the initialization to prevent rapid-fire updates
          if (debounceTimeout) {
            clearTimeout(debounceTimeout);
          }
          debounceTimeout = setTimeout(() => {
            // Only initialize if we're not already initializing
            if (!isInitializing.current) {
              initializeAuth();
            }
          }, 500); // 500ms debounce
        }
      }
    };
    
    window.addEventListener('storage', handleStorage);
    return () => {
      window.removeEventListener('storage', handleStorage);
      if (debounceTimeout) {
        clearTimeout(debounceTimeout);
      }
    };
  }, []);

  const login = async (email: string, password: string) => {
    try {
      if (isMounted.current) {
        setState(prev => ({ ...prev, isLoading: true, error: null }));
      }
      const response = await authService.login({ email, password });
      
      if (response.data?.token && response.data?.user) {
        if (isMounted.current) {
          setState({
            user: response.data.user,
            token: response.data.token,
            isAuthenticated: true,
            isLoading: false,
            error: null
          });
        }
        initialized.current = true;
      }
    } catch (error: any) {
      if (isMounted.current) {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: error.message || 'Failed to login'
        }));
      }
      throw error;
    }
  };

  const register = async (userData: any) => {
    try {
      if (isMounted.current) {
        setState(prev => ({ ...prev, isLoading: true, error: null }));
      }
      await authService.register(userData);
      if (isMounted.current) {
        setState(prev => ({ ...prev, isLoading: false }));
      }
    } catch (error: any) {
      if (isMounted.current) {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: error.message || 'Failed to register'
        }));
      }
      throw error;
    }
  };

  const logout = () => {
    try {
      if (isMounted.current) {
        setState(prev => ({ ...prev, isLoading: true }));
      }
      authService.logout();
    } finally {
      if (isMounted.current) {
        setState({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
          error: null
        });
      }
      initialized.current = false;
    }
  };

  const refreshToken = async () => {
    try {
      if (isMounted.current) {
        setState(prev => ({ ...prev, isLoading: true }));
      }
      const response = await authService.refreshToken();
      
      if (response.data?.token && response.data?.user) {
        if (isMounted.current) {
          setState({
            user: response.data.user,
            token: response.data.token,
            isAuthenticated: true,
            isLoading: false,
            error: null
          });
        }
      }
    } catch (error: any) {
      if (isMounted.current) {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: error.message || 'Failed to refresh token'
        }));
      }
      throw error;
    }
  };

  const setUser = (user: User | null) => {
    if (isMounted.current) {
      setState(prev => ({ ...prev, user }));
    }
  };

  const refreshUser = () => {
    const user = authService.getCurrentUser();
    if (isMounted.current) {
      setState(prev => ({ ...prev, user }));
    }
  };

  const value = {
    ...state,
    login,
    register,
    logout,
    refreshToken,
    setUser,
    refreshUser
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Backward compatibility hook for UserContext
export const useUser = () => {
  const { user, setUser, refreshUser } = useAuth();
  return { user, setUser, refreshUser };
};