import React from 'react';
import { 
  CreditCardIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

export type PaymentType = 'pay_now' | 'pay_later';

interface PaymentTypeOption {
  id: PaymentType;
  name: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  description: string;
  available: boolean;
}

interface PaymentTypeSelectorProps {
  selectedType: PaymentType;
  onTypeSelect: (type: PaymentType) => void;
  upiId?: string | undefined;
  className?: string;
}

const PaymentTypeSelector: React.FC<PaymentTypeSelectorProps> = ({
  selectedType,
  onTypeSelect,
  upiId,
  className = ''
}) => {
  const paymentTypes: PaymentTypeOption[] = [
    {
      id: 'pay_later',
      name: 'Pay Later',
      icon: ExclamationTriangleIcon,
      description: 'Request approval from mess owner',
      available: true
    },
    {
      id: 'pay_now',
      name: 'Pay Now',
      icon: CreditCardIcon,
      description: upiId ? 'Instant payment via UPI' : 'UPI not configured by owner',
      available: !!upiId
    }
  ];

  return (
    <div className={`space-y-4 ${className}`}>
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4">Payment Options</h3>
        <p className="text-sm text-muted-foreground mb-6">
          Choose how you'd like to handle payment for this meal plan:
        </p>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {paymentTypes.map((type) => (
          <div
            key={type.id}
            onClick={() => type.available && onTypeSelect(type.id)}
            className={`p-6 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
              selectedType === type.id
                ? 'border-primary bg-primary/5'
                : type.available
                ? 'border-border hover:border-primary/50'
                : 'border-muted opacity-50 cursor-not-allowed'
            }`}
          >
            <div className="flex items-center space-x-3">
              <type.icon className={`w-8 h-8 ${
                type.id === 'pay_now' ? 'text-green-500' : 'text-yellow-500'
              }`} />
              <div>
                <h3 className="font-semibold text-foreground">{type.name}</h3>
                <p className="text-sm text-muted-foreground">{type.description}</p>
                {!type.available && (
                  <p className="text-xs text-destructive mt-1">Not available</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PaymentTypeSelector;
