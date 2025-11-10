import React from 'react';
import { ExclamationTriangleIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';

export interface InsufficientCreditsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  requiredCredits: number;
  availableCredits: number;
  message?: string;
  subscriptionRoute?: string;
  onPurchaseClick?: () => void;
}

const InsufficientCreditsDialog: React.FC<InsufficientCreditsDialogProps> = ({
  isOpen,
  onClose,
  requiredCredits,
  availableCredits,
  message,
  subscriptionRoute = ROUTES.MESS_OWNER.PLATFORM_SUBSCRIPTION,
  onPurchaseClick,
}) => {
  const navigate = useNavigate();
  const creditsNeeded = requiredCredits - availableCredits;

  const handlePurchaseClick = () => {
    onClose();
    if (onPurchaseClick) {
      onPurchaseClick();
    } else {
      navigate(subscriptionRoute);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 pb-20 lg:pb-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full max-h-[calc(100vh-5rem)] lg:max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-full bg-yellow-100 dark:bg-yellow-900/20">
                <ExclamationTriangleIcon className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Insufficient Credits
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {message || `You need more credits to complete this action.`}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
            >
              <XMarkIcon className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Credits Details */}
          <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <h4 className="font-medium text-gray-900 dark:text-white mb-3">Credit Information</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-300">Required Credits:</span>
                <span className="font-bold text-gray-900 dark:text-white">{requiredCredits}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-300">Available Credits:</span>
                <span className="font-bold text-red-600 dark:text-red-400">
                  {availableCredits}
                </span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-gray-200 dark:border-gray-600 mt-2">
                <span className="font-medium text-gray-900 dark:text-white">Need to Purchase:</span>
                <span className="font-bold text-blue-600 dark:text-blue-400">
                  {creditsNeeded} {creditsNeeded === 1 ? 'credit' : 'credits'}
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg font-medium transition-colors"
            >
              Close
            </button>
            <button
              type="button"
              onClick={handlePurchaseClick}
              className="flex-1 px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
            >
              <span>Go to Subscription</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InsufficientCreditsDialog;

