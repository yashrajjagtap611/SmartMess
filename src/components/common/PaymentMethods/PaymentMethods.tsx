import React from 'react';
import { 
  CreditCardIcon, 
  QrCodeIcon,
  BanknotesIcon
} from '@heroicons/react/24/outline';
import UPIQRCode from '@/features/user/components/UPIQRCode/UPIQRCode';

export type PaymentMethod = 'upi' | 'online' | 'cash';

interface PaymentMethodOption {
  id: PaymentMethod;
  name: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  description: string;
  color: string;
  available: boolean;
}

interface PaymentMethodsProps {
  selectedMethod: PaymentMethod;
  onMethodSelect: (method: PaymentMethod) => void;
  amount: number;
  merchantName: string;
  upiId?: string | undefined;
  loading?: boolean;
  showUPIQR?: boolean;
  className?: string;
  transactionId?: string;
  onTransactionIdChange?: (transactionId: string) => void;
}

const PaymentMethods: React.FC<PaymentMethodsProps> = ({
  selectedMethod,
  onMethodSelect,
  amount,
  merchantName,
  upiId,
  loading = false,
  showUPIQR = true,
  className = '',
  transactionId = '',
  onTransactionIdChange
}) => {
  const paymentMethods: PaymentMethodOption[] = [
    {
      id: 'upi',
      name: 'UPI Payment',
      icon: QrCodeIcon,
      description: upiId 
        ? 'Pay using UPI apps like Google Pay, PhonePe, Paytm'
        : 'Pay using UPI apps. QR code will be provided by mess owner.',
      color: 'bg-green-500 hover:bg-green-600',
      available: true // UPI is always available, QR code is optional
    },
    {
      id: 'online',
      name: 'Online Banking',
      icon: CreditCardIcon,
      description: 'Pay using credit/debit card or net banking',
      color: 'bg-blue-500 hover:bg-blue-600',
      available: true
    },
    {
      id: 'cash',
      name: 'Cash Payment',
      icon: BanknotesIcon,
      description: 'Pay in cash to the mess owner',
      color: 'bg-purple-500 hover:bg-purple-600',
      available: true
    }
  ];

  return (
    <div className={`space-y-4 ${className}`}>
      <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
        Choose your preferred payment method:
      </p>
      
      {paymentMethods.map((method) => (
        <button
          key={method.id}
          onClick={() => onMethodSelect(method.id)}
          disabled={!method.available || loading}
          className={`w-full p-4 rounded-lg border-2 transition-all duration-200 ${
            selectedMethod === method.id
              ? 'border-blue-500 shadow-md bg-blue-50 dark:bg-blue-900/20'
              : method.available
              ? 'border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-500 hover:shadow-md hover:bg-gray-50 dark:hover:bg-gray-700'
              : 'border-gray-100 dark:border-gray-700 opacity-50 cursor-not-allowed'
          }`}
        >
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${method.color} text-white`}>
              <method.icon className="w-5 h-5" />
            </div>
            <div className="flex-1 text-left">
              <h4 className="font-medium text-gray-900 dark:text-white">{method.name}</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">{method.description}</p>
              {method.id === 'upi' && !upiId && (
                <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                  Contact mess owner for UPI details
                </p>
              )}
            </div>
          </div>
        </button>
      ))}

      {/* UPI Transaction ID Input - Required for UPI payments */}
      {selectedMethod === 'upi' && (
        <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <label className="block text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
            Transaction ID <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={transactionId}
            onChange={(e) => onTransactionIdChange?.(e.target.value)}
            placeholder="Enter your UPI transaction ID (e.g., TXN123456789)"
            required
            className="w-full px-4 py-2 border border-blue-300 dark:border-blue-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <p className="mt-2 text-xs text-blue-700 dark:text-blue-300">
            After completing the UPI payment, enter the transaction ID from your payment app.
          </p>
        </div>
      )}

      {/* UPI QR Code Section */}
      {showUPIQR && selectedMethod === 'upi' && upiId && (
        <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
          <h4 className="font-medium text-green-800 dark:text-green-200 mb-3 flex items-center">
            <QrCodeIcon className="w-5 h-5 mr-2" />
            UPI QR Code
          </h4>
          <UPIQRCode
            upiId={upiId}
            amount={amount}
            merchantName={merchantName}
            size={150}
          />
        </div>
      )}
    </div>
  );
};

export default PaymentMethods;
