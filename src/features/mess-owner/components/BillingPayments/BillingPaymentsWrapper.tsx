import React from 'react';
import { useMessProfile } from '@/contexts/MessProfileContext';
import BillingPayments from './BillingPayments';

const BillingPaymentsWrapper: React.FC = () => {
  const { messProfile, loading: profileLoading } = useMessProfile();
  
  if (profileLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading mess information...</p>
        </div>
      </div>
    );
  }
  
  if (!messProfile?._id) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-destructive mb-4">No mess profile found</p>
          <p className="text-muted-foreground">Please ensure you have a valid mess profile set up.</p>
        </div>
      </div>
    );
  }

  return <BillingPayments messId={messProfile._id} />;
};

export default BillingPaymentsWrapper;
