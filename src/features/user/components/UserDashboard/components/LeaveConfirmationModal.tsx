import React from 'react';
import { 
  ExclamationTriangleIcon,
  XMarkIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

interface LeaveConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  messId: string;
  mealPlanId: string;
  messName: string;
  mealPlanName: string;
  onConfirm: () => void;
  loading?: boolean;
}

const LeaveConfirmationModal: React.FC<LeaveConfirmationModalProps> = ({
  isOpen,
  onClose,
  // messId,
  // mealPlanId,
  messName,
  mealPlanName,
  onConfirm,
  loading = false
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full">
        {/* Header */}
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
            <ExclamationTriangleIcon className="w-6 h-6 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              Confirm Leave Plan
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              This action cannot be undone
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="ml-auto p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
          >
            <XMarkIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-4">
          <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
              Are you sure you want to leave the following meal plan?
            </p>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-300">Mess:</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">{messName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-300">Meal Plan:</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">{mealPlanName}</span>
              </div>
            </div>
          </div>

          {/* Warning */}
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <div className="flex items-start space-x-3">
              <ExclamationTriangleIcon className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5" />
              <div>
                <h4 className="font-medium text-red-800 dark:text-red-200 mb-1">
                  Important Notice
                </h4>
                <ul className="text-sm text-red-700 dark:text-red-300 space-y-1">
                  <li>• You will lose access to this meal plan immediately</li>
                  <li>• Any pending payments must be cleared before leaving</li>
                  <li>• You can rejoin this mess later if spots are available</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 rounded-lg transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center space-x-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Processing...</span>
              </>
            ) : (
              <>
                <CheckCircleIcon className="w-4 h-4" />
                <span>Confirm Leave</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LeaveConfirmationModal;
