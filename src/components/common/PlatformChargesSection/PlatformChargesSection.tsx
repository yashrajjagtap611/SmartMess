import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  CreditCardIcon, 
  CalendarIcon, 
  CurrencyRupeeIcon,
  CheckCircleIcon,
  ClockIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';

export interface PlatformCharge {
  id: string;
  type: 'subscription' | 'transaction_fee' | 'feature_access' | 'premium_support';
  name: string;
  description: string;
  amount: number;
  currency: string;
  billingCycle: 'monthly' | 'quarterly' | 'yearly' | 'one_time';
  status: 'active' | 'inactive' | 'pending' | 'cancelled' | 'expired';
  startDate: string;
  endDate?: string;
  nextBillingDate?: string;
  features: string[];
  isAutoRenew: boolean;
  lastPaymentDate?: string;
  nextPaymentAmount?: number;
}

interface PlatformChargesSectionProps {
  charges: PlatformCharge[];
  isLoading: boolean;
  title?: string;
  description?: string;
  showActions?: boolean;
  onViewDetails?: (charge: PlatformCharge) => void;
  onManageSubscription?: (charge: PlatformCharge) => void;
  onUpgrade?: (charge: PlatformCharge) => void;
}

const getChargeTypeIcon = (type: PlatformCharge['type']) => {
  switch (type) {
    case 'subscription':
      return <CreditCardIcon className="h-5 w-5" />;
    case 'transaction_fee':
      return <CurrencyRupeeIcon className="h-5 w-5" />;
    case 'feature_access':
      return <CheckCircleIcon className="h-5 w-5" />;
    case 'premium_support':
      return <ClockIcon className="h-5 w-5" />;
    default:
      return <CreditCardIcon className="h-5 w-5" />;
  }
};

const getStatusColor = (status: PlatformCharge['status']) => {
  switch (status) {
    case 'active':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
    case 'inactive':
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    case 'pending':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
    case 'cancelled':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
    case 'expired':
      return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
  }
};

const getBillingCycleText = (cycle: PlatformCharge['billingCycle']) => {
  switch (cycle) {
    case 'monthly':
      return 'Monthly';
    case 'quarterly':
      return 'Quarterly';
    case 'yearly':
      return 'Yearly';
    case 'one_time':
      return 'One-time';
    default:
      return cycle;
  }
};

const formatCurrency = (amount: number, currency: string = 'INR') => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export const PlatformChargesSection: React.FC<PlatformChargesSectionProps> = ({
  charges,
  isLoading,
  title = "Platform Charges & Subscriptions",
  description = "Manage your platform subscriptions and charges",
  showActions = true,
  onViewDetails,
  onManageSubscription,
  onUpgrade
}) => {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center space-x-4 p-4 border rounded-lg">
                <Skeleton className="h-12 w-12 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-3 w-32" />
                </div>
                <Skeleton className="h-8 w-20" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (charges.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <CreditCardIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              No Platform Charges
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              You don't have any active platform charges or subscriptions.
            </p>
            {showActions && charges.length > 0 && (
              <Button onClick={() => charges[0] && onUpgrade?.(charges[0])}>
                View Available Plans
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <CreditCardIcon className="h-5 w-5" />
          <span>{title}</span>
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {charges.map((charge) => (
            <div key={charge.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  {getChargeTypeIcon(charge.type)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <h4 className="font-medium text-gray-900 dark:text-gray-100">
                      {charge.name}
                    </h4>
                    <Badge className={getStatusColor(charge.status)}>
                      {charge.status.charAt(0).toUpperCase() + charge.status.slice(1)}
                    </Badge>
                    {charge.isAutoRenew && (
                      <Badge variant="outline" className="text-xs">
                        Auto-renew
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                    {charge.description}
                  </p>
                  <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                    <span className="flex items-center space-x-1">
                      <CalendarIcon className="h-3 w-3" />
                      <span>{getBillingCycleText(charge.billingCycle)}</span>
                    </span>
                    {charge.nextBillingDate && (
                      <span className="flex items-center space-x-1">
                        <ClockIcon className="h-3 w-3" />
                        <span>Next: {formatDate(charge.nextBillingDate)}</span>
                      </span>
                    )}
                    {charge.lastPaymentDate && (
                      <span className="flex items-center space-x-1">
                        <CheckCircleIcon className="h-3 w-3" />
                        <span>Last: {formatDate(charge.lastPaymentDate)}</span>
                      </span>
                    )}
                  </div>
                  {charge.features.length > 0 && (
                    <div className="mt-2">
                      <div className="flex flex-wrap gap-1">
                        {charge.features.slice(0, 3).map((feature, index) => (
                          <span key={index} className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                            {feature}
                          </span>
                        ))}
                        {charge.features.length > 3 && (
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            +{charge.features.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <div className="font-semibold text-gray-900 dark:text-gray-100">
                    {formatCurrency(charge.amount, charge.currency)}
                  </div>
                  {charge.nextPaymentAmount && charge.nextPaymentAmount !== charge.amount && (
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Next: {formatCurrency(charge.nextPaymentAmount, charge.currency)}
                    </div>
                  )}
                </div>
                
                {showActions && (
                  <div className="flex space-x-2">
                    {onViewDetails && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onViewDetails(charge)}
                      >
                        Details
                      </Button>
                    )}
                    {onManageSubscription && charge.status === 'active' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onManageSubscription(charge)}
                      >
                        Manage
                      </Button>
                    )}
                    {onUpgrade && charge.status === 'inactive' && (
                      <Button
                        size="sm"
                        onClick={() => onUpgrade(charge)}
                      >
                        Upgrade
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onViewDetails?.(charge)}
                    >
                      <ArrowRightIcon className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        
        {showActions && (
          <div className="mt-6 pt-4 border-t">
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Total Active Charges: {charges.filter(c => c.status === 'active').length}
              </div>
              <Button variant="outline" onClick={() => charges[0] && onViewDetails?.(charges[0])}>
                View All Charges
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
