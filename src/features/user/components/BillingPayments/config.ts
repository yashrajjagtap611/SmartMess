// BillingPayments Configuration
export const BILLING_CONFIG = {
  // Feature flags
  ENABLE_SUBSCRIPTION_PLANS: (() => {
    // Check if we're in browser environment
    if (typeof window !== 'undefined') {
      // Check localStorage for feature flag
      const stored = localStorage.getItem('REACT_APP_ENABLE_SUBSCRIPTION_PLANS');
      if (stored !== null) {
        return stored === 'true';
      }
      // Check if environment variable is available (for build-time)
      return true; // Enable by default now that backend endpoint exists
    }
    // Server-side or build-time check
    return typeof process !== 'undefined' && process.env?.['REACT_APP_ENABLE_SUBSCRIPTION_PLANS'] === 'true';
  })(),
  
  // API endpoints
  SUBSCRIPTION_PLANS_ENDPOINT: '/api/mess',
  
  // Default values
  DEFAULT_CURRENCY: 'INR',
  DEFAULT_GATEWAY: 'razorpay',
} as const;

// Helper function to check if subscription plans are enabled
export const isSubscriptionPlansEnabled = () => BILLING_CONFIG.ENABLE_SUBSCRIPTION_PLANS;

// Helper function to enable/disable subscription plans at runtime
export const setSubscriptionPlansEnabled = (enabled: boolean) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('REACT_APP_ENABLE_SUBSCRIPTION_PLANS', enabled.toString());
    // Reload the page to apply changes
    window.location.reload();
  }
};
