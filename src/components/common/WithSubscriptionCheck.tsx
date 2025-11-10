import React from 'react';
import { useSubscriptionCheck } from '@/hooks/useSubscriptionCheck';
import SubscriptionExpiredBanner from './SubscriptionExpiredBanner';
import { Loader2 } from 'lucide-react';

interface WithSubscriptionCheckProps {
  children: React.ReactNode;
  module?: string;
  showBanner?: boolean;
  blockAccess?: boolean;
}

export const WithSubscriptionCheck: React.FC<WithSubscriptionCheckProps> = ({
  children,
  module: _module,
  showBanner = true,
  blockAccess = true
}) => {
  const { 
    isSubscriptionExpired, 
    expirationMessage, 
    loading 
  } = useSubscriptionCheck();

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-3 text-gray-600">Checking subscription...</span>
      </div>
    );
  }

  if (isSubscriptionExpired) {
    if (blockAccess) {
      // Block access completely and only show the banner
      return (
        <div className="p-6">
          <SubscriptionExpiredBanner {...(expirationMessage ? { message: expirationMessage } : {})} />
        </div>
      );
    }

    if (showBanner) {
      // Show banner but allow access
      return (
        <div>
          <SubscriptionExpiredBanner {...(expirationMessage ? { message: expirationMessage } : {})} className="mb-6" />
          {children}
        </div>
      );
    }
  }

  return <>{children}</>;
};

export default WithSubscriptionCheck;


