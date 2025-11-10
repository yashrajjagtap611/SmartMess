import React from 'react';
import { AlertCircle, CreditCard } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';

interface SubscriptionExpiredBannerProps {
  message?: string;
  className?: string;
}

export const SubscriptionExpiredBanner: React.FC<SubscriptionExpiredBannerProps> = ({ 
  message, 
  className = '' 
}) => {
  const navigate = useNavigate();

  const defaultMessage = 'Your subscription has expired. Please go to the Subscription section and pay the bill to continue using the platform.';

  return (
    <Alert className={`bg-destructive/10 border-destructive/20 dark:bg-destructive/20 dark:border-destructive/30 ${className}`}>
      <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0" />
      <AlertDescription className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
        <div className="flex-1 text-sm sm:text-base text-destructive font-medium leading-relaxed">
          <strong className="block sm:inline mb-1 sm:mb-0 sm:mr-1">Subscription Expired!</strong>
          <span className="block sm:inline">{message || defaultMessage}</span>
        </div>
        <Button
          onClick={() => navigate(ROUTES.MESS_OWNER.PLATFORM_SUBSCRIPTION)}
          className="bg-destructive hover:bg-destructive/90 text-destructive-foreground w-full sm:w-auto flex-shrink-0 text-sm sm:text-base h-9 sm:h-10"
          size="default"
        >
          <CreditCard className="mr-2 h-4 w-4" />
          Go to Subscription
        </Button>
      </AlertDescription>
    </Alert>
  );
};

export default SubscriptionExpiredBanner;


