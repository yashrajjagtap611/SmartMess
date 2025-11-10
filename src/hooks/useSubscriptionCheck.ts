import { useState, useEffect } from 'react';
import { subscriptionCheckService, SubscriptionStatus } from '@/services/subscriptionCheckService';
import { useAuth } from '@/contexts/AuthContext';

export const useSubscriptionCheck = () => {
  const { user, isAuthenticated } = useAuth();
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSubscriptionStatus = async () => {
      // Only check for mess owners
      if (!isAuthenticated || !user || user.role !== 'mess-owner') {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await subscriptionCheckService.getSubscriptionStatus();
        
        if (response.success && response.data) {
          setSubscriptionStatus(response.data);
        } else if (response.data) {
          // Even if success is false, use the data (for fail-open scenarios)
          setSubscriptionStatus(response.data);
        }
      } catch (err: any) {
        // Only log non-network errors to avoid console spam
        if (!err.message?.includes('Network Error') && !err.code?.includes('ERR_NETWORK')) {
          console.error('Failed to fetch subscription status:', err);
        }
        // Set a default status that allows access (fail open)
        setSubscriptionStatus({
          isActive: true,
          isTrialActive: false,
          isExpired: false,
          hasCredits: true,
          availableCredits: 0,
          message: 'Subscription check unavailable'
        });
        setError(null); // Don't set error for network issues
      } finally {
        setLoading(false);
      }
    };

    fetchSubscriptionStatus();
  }, [isAuthenticated, user]);

  const checkModuleAccess = async (module: string): Promise<boolean> => {
    try {
      const response = await subscriptionCheckService.checkModuleAccess(module);
      return response.data?.allowed || false;
    } catch (err) {
      console.error('Failed to check module access:', err);
      return false;
    }
  };

  return {
    subscriptionStatus,
    loading,
    error,
    isSubscriptionActive: subscriptionStatus?.isActive || false,
    isSubscriptionExpired: subscriptionStatus?.isExpired || false,
    isTrialActive: subscriptionStatus?.isTrialActive || false,
    hasCredits: subscriptionStatus?.hasCredits || false,
    expirationMessage: subscriptionStatus?.message,
    checkModuleAccess
  };
};


