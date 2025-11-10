import { useState, useEffect, useCallback, useRef } from 'react';
import { leaveManagementAPI } from './apiService';
import { useAuth } from './useAuth';
import type { 
  LeaveRequest, 
  LeaveManagementState, 
  LeaveRequestAction, 
  ExtensionRequestAction,
  LeaveManagementFilters,
  MessOffDayRequest,
  MessOffDayFormData,
  MessOffDayStats,
  DefaultOffDaySettings
} from './LeaveManagement.types';

export const useLeaveManagement = () => {
  const { checkMessOwnerRole } = useAuth();
  
  // Refs for preventing excessive API calls and managing mounted state
  const mountedRef = useRef(true);
  const lastLoadTimeRef = useRef<number>(0);
  const loadingPromiseRef = useRef<Promise<void> | null>(null);
  const THROTTLE_DELAY = 2000; // 2 seconds minimum between API calls
  
  const [state, setState] = useState<LeaveManagementState>({
    leaveRequests: [],
    loading: true,
    error: null,
    selectedRequest: null,
    filters: {
      status: 'all',
      dateRange: { start: '', end: '' },
      search: ''
    },
    stats: {
      total: 0,
      pending: 0,
      approved: 0,
      rejected: 0,
      cancelled: 0,
      thisWeek: 0,
      thisMonth: 0
    },
    pagination: {
      current: 1,
      pages: 1,
      total: 0
    }
  });

  // Mess off day state
  const [messOffDayState, setMessOffDayState] = useState({
    messOffDayRequests: [] as MessOffDayRequest[],
    messOffDayStats: {
      total: 0,
      thisWeek: 0,
      thisMonth: 0,
      upcoming: 0
    } as MessOffDayStats,
    messOffDayPagination: {
      current: 1,
      pages: 1,
      total: 0
    },
    defaultOffDaySettings: null as DefaultOffDaySettings | null
  });

  const loadLeaveRequests = useCallback(async (page = 1, filters?: Partial<LeaveManagementFilters>) => {
    try {
      // Check if user is a mess owner first
      const authCheck = checkMessOwnerRole();
      if (!authCheck.isValid) {
        setState(prev => ({ ...prev, error: authCheck.error || 'Authentication failed', loading: false }));
        return;
      }

      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const data = await leaveManagementAPI.getLeaveRequests(page, filters);
      
      if (data.success) {
        setState(prev => ({ 
          ...prev, 
          leaveRequests: data.data.leaveRequests || [],
          pagination: data.data.pagination || { current: 1, pages: 1, total: 0 },
          loading: false 
        }));
      } else {
        throw new Error(data.message || 'Failed to load leave requests');
      }
    } catch (error) {
      console.error('Error loading leave requests:', error);
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Failed to load leave requests',
        loading: false 
      }));
    }
  }, [checkMessOwnerRole]);

  const loadStats = useCallback(async () => {
    try {
      // Check if user is a mess owner first
      const authCheck = checkMessOwnerRole();
      if (!authCheck.isValid) {
        return;
      }

      const data = await leaveManagementAPI.getLeaveStats();
      
      if (data.success) {
        // Transform backend stats to frontend format
        const backendStats = data.data?.stats || [];
        const totals = data.data?.total || {};
        
        const transformedStats = {
          total: totals.totalRequests || 0,
          pending: backendStats.find((s: any) => s._id === 'pending')?.count || 0,
          approved: backendStats.find((s: any) => s._id === 'approved')?.count || 0,
          rejected: backendStats.find((s: any) => s._id === 'rejected')?.count || 0,
          cancelled: backendStats.find((s: any) => s._id === 'cancelled')?.count || 0,
          thisWeek: totals.thisWeek || 0,
          thisMonth: totals.thisMonth || 0
        };

        setState(prev => ({ 
          ...prev, 
          stats: transformedStats
        }));
      }
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  }, [checkMessOwnerRole]);

  const processLeaveRequest = useCallback(async (requestId: string, action: LeaveRequestAction) => {
    try {
      const data = await leaveManagementAPI.processLeaveRequest(requestId, action);
      
      if (data.success) {
        // Reload data after successful action using current state values
        const currentPage = state.pagination?.current || 1;
        const currentFilters = state.filters || {};
        
        await Promise.allSettled([
          loadLeaveRequests(currentPage, currentFilters),
          loadStats()
        ]);
        
        return { success: true, message: data.message };
      } else {
        throw new Error(data.message || 'Failed to process leave request');
      }
    } catch (error) {
      console.error('Error processing leave request:', error);
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Failed to process leave request'
      };
    }
  }, []); // Removed problematic dependencies

  const processExtensionRequest = useCallback(async (requestId: string, extensionId: string, action: ExtensionRequestAction) => {
    try {
      const data = await leaveManagementAPI.processExtensionRequest(requestId, extensionId, action);
      
      if (data.success) {
        // Reload data after successful action using current state values
        const currentPage = state.pagination?.current || 1;
        const currentFilters = state.filters || {};
        
        await Promise.allSettled([
          loadLeaveRequests(currentPage, currentFilters),
          loadStats()
        ]);
        
        return { success: true, message: data.message };
      } else {
        throw new Error(data.message || 'Failed to process extension request');
      }
    } catch (error) {
      console.error('Error processing extension request:', error);
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Failed to process extension request'
      };
    }
  }, []); // Removed problematic dependencies

  const updateFilters = useCallback((newFilters: Partial<LeaveManagementFilters>) => {
    setState(prev => ({
      ...prev,
      filters: { ...prev.filters, ...newFilters }
    }));
  }, []);

  const setSelectedRequest = useCallback((request: LeaveRequest | null) => {
    setState(prev => ({ ...prev, selectedRequest: request }));
  }, []);

  // Mess off day functions
  const loadMessOffDayRequests = useCallback(async (page = 1, filters?: any) => {
    try {
      // Check if user is a mess owner first
      const authCheck = checkMessOwnerRole();
      if (!authCheck.isValid) {
        setState(prev => ({ ...prev, error: authCheck.error || 'Authentication failed', loading: false }));
        return;
      }

      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const data = await leaveManagementAPI.getMessOffDays(page, filters);
      
      if (data.success) {
        setMessOffDayState(prev => ({ 
          ...prev, 
          messOffDayRequests: data.data.offDays || [],
          messOffDayPagination: data.data.pagination || { current: 1, pages: 1, total: 0 }
        }));
        setState(prev => ({ ...prev, loading: false }));
      } else {
        throw new Error(data.message || 'Failed to load mess off day requests');
      }
    } catch (error) {
      console.error('Error loading mess off day requests:', error);
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Failed to load mess off day requests',
        loading: false 
      }));
    }
  }, [checkMessOwnerRole]);

  const loadMessOffDayStats = useCallback(async () => {
    try {
      // Check if user is a mess owner first
      const authCheck = checkMessOwnerRole();
      if (!authCheck.isValid) {
        return;
      }

      const data = await leaveManagementAPI.getMessOffDayStats();
      
      if (data.success) {
        setMessOffDayState(prev => ({ 
          ...prev, 
          messOffDayStats: data.data.stats || {
            total: 0,
            thisWeek: 0,
            thisMonth: 0,
            upcoming: 0
          }
        }));
      }
    } catch (error) {
      console.error('Failed to load mess off day stats:', error);
    }
  }, [checkMessOwnerRole]);

  const createMessOffDayRequest = useCallback(async (formData: MessOffDayFormData) => {
    try {
      const data = await leaveManagementAPI.createMessOffDay(formData);
      
      if (data.success) {
        return { success: true, message: data.message };
      } else {
        throw new Error(data.message || 'Failed to create mess off day request');
      }
    } catch (error) {
      console.error('Error creating mess off day request:', error);
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Failed to create mess off day request'
      };
    }
  }, []);

  const updateMessOffDay = useCallback(async (requestId: string, data: Partial<MessOffDayFormData>) => {
    try {
      const result = await leaveManagementAPI.updateMessOffDay(requestId, data);
      
      if (result.success) {
        // Reload data after successful update using current state values
        const currentPage = messOffDayState.messOffDayPagination?.current || 1;
        
        await Promise.allSettled([
          loadMessOffDayRequests(currentPage),
          loadMessOffDayStats()
        ]);
        
        return { success: true, message: result.message };
      } else {
        throw new Error(result.message || 'Failed to update mess off day');
      }
    } catch (error) {
      console.error('Error updating mess off day:', error);
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Failed to update mess off day'
      };
    }
  }, []); // Removed problematic dependencies

  const deleteMessOffDay = useCallback(async (requestId: string, announcementData?: { sendAnnouncement?: boolean; announcementMessage?: string }) => {
    try {
      const data = await leaveManagementAPI.deleteMessOffDay(requestId, announcementData);
      
      if (data.success) {
        // Reload data after successful deletion using current state values
        const currentPage = messOffDayState.messOffDayPagination?.current || 1;
        
        await Promise.allSettled([
          loadMessOffDayRequests(currentPage),
          loadMessOffDayStats()
        ]);
        
        return { success: true, message: data.message };
      } else {
        throw new Error(data.message || 'Failed to delete mess off day');
      }
    } catch (error) {
      console.error('Error deleting mess off day:', error);
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Failed to delete mess off day'
      };
    }
  }, []); // Removed problematic dependencies

  const loadDefaultOffDaySettings = useCallback(async () => {
    try {
      // Check if user is a mess owner first
      const authCheck = checkMessOwnerRole();
      if (!authCheck.isValid) {
        return;
      }

      const data = await leaveManagementAPI.getDefaultOffDaySettings();
      
      if (data.success) {
        setMessOffDayState(prev => ({ 
          ...prev, 
          defaultOffDaySettings: data.data.settings || null
        }));
      }
    } catch (error) {
      console.error('Failed to load default off day settings:', error);
    }
  }, [checkMessOwnerRole]);

  const saveDefaultOffDaySettings = useCallback(async (settings: Partial<DefaultOffDaySettings>) => {
    try {
      const data = await leaveManagementAPI.saveDefaultOffDaySettings(settings);
      
      if (data.success) {
        // Reload settings after successful save
        await loadDefaultOffDaySettings().catch(err => console.error('Failed to reload settings:', err));
        return { success: true, message: data.message };
      } else {
        throw new Error(data.message || 'Failed to save default off day settings');
      }
    } catch (error) {
      console.error('Error saving default off day settings:', error);
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Failed to save default off day settings'
      };
    }
  }, []); // Removed problematic dependencies

  // Throttled initialization function to prevent excessive API calls
  const initializeData = useCallback(async () => {
    const now = Date.now();
    
    // Throttle API calls - prevent calls within THROTTLE_DELAY
    if (now - lastLoadTimeRef.current < THROTTLE_DELAY) {
      return;
    }
    
    // Prevent concurrent initialization
    if (loadingPromiseRef.current) {
      return loadingPromiseRef.current;
    }
    
    // Check if component is still mounted
    if (!mountedRef.current) {
      return;
    }
    
    // Check role first, then load data if authorized
    const authCheck = checkMessOwnerRole();
    if (!authCheck.isValid) {
      setState(prev => ({ ...prev, error: authCheck.error || 'Authentication failed', loading: false }));
      return;
    }
    
    lastLoadTimeRef.current = now;
    
    // Create a promise for concurrent call prevention
    const loadPromise = (async () => {
      try {
        if (!mountedRef.current) return;
        
        setState(prev => ({ ...prev, loading: true, error: null }));
        
        // Load all data in parallel but with proper error handling
        const promises = [
          loadLeaveRequests(1).catch(err => console.error('Failed to load leave requests:', err)),
          loadStats().catch(err => console.error('Failed to load stats:', err)),
          loadMessOffDayRequests(1).catch(err => console.error('Failed to load mess off days:', err)),
          loadMessOffDayStats().catch(err => console.error('Failed to load mess off day stats:', err)),
          loadDefaultOffDaySettings().catch(err => console.error('Failed to load default settings:', err))
        ];
        
        await Promise.allSettled(promises);
        
        if (mountedRef.current) {
          setState(prev => ({ ...prev, loading: false }));
        }
      } catch (error) {
        console.error('Error during data initialization:', error);
        if (mountedRef.current) {
          setState(prev => ({ 
            ...prev, 
            error: 'Failed to initialize leave management data',
            loading: false 
          }));
        }
      } finally {
        loadingPromiseRef.current = null;
      }
    })();
    
    loadingPromiseRef.current = loadPromise;
    return loadPromise;
  }, [checkMessOwnerRole]); // Removed problematic dependencies

  useEffect(() => {
    mountedRef.current = true;
    
    // Initialize data with throttling
    initializeData();

    // Cleanup function to prevent memory leaks
    return () => {
      mountedRef.current = false;
      loadingPromiseRef.current = null;
    };
  }, []); // Empty dependency array to run only once on mount

  return {
    ...state,
    loadLeaveRequests,
    loadStats,
    processLeaveRequest,
    processExtensionRequest,
    updateFilters,
    setSelectedRequest,
    // Mess off day functionality
    ...messOffDayState,
    loadMessOffDayRequests,
    loadMessOffDayStats,
    createMessOffDayRequest,
    updateMessOffDay,
    deleteMessOffDay,
    loadDefaultOffDaySettings,
    saveDefaultOffDaySettings,
  };
};