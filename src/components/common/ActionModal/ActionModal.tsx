import React, { useState } from 'react';
import { XMarkIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';

interface ActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (remarks: string) => void;
  action: 'approve' | 'reject';
  notificationTitle: string;
  notificationMessage: string;
  loading?: boolean;
}

const ActionModal: React.FC<ActionModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  action,
  notificationTitle,
  notificationMessage,
  loading = false
}) => {
  const [remarks, setRemarks] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm(remarks);
  };

  const handleClose = () => {
    setRemarks('');
    onClose();
  };

  if (!isOpen) return null;

  const isApprove = action === 'approve';
  const actionIcon = isApprove ? CheckCircleIcon : XCircleIcon;
  const ActionIcon = actionIcon;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 pb-20 lg:pb-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full max-h-[calc(100vh-5rem)] lg:max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-full ${isApprove ? 'bg-green-100 dark:bg-green-900/20' : 'bg-red-100 dark:bg-red-900/20'}`}>
                <ActionIcon className={`w-6 h-6 ${isApprove ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {isApprove ? 'Approve Request' : 'Reject Request'}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {isApprove ? 'Confirm approval with optional remarks' : 'Provide reason for rejection'}
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              disabled={loading}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors disabled:opacity-50"
            >
              <XMarkIcon className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Notification Details */}
          <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">{notificationTitle}</h4>
            <p className="text-sm text-gray-600 dark:text-gray-300">{notificationMessage}</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label htmlFor="remarks" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {isApprove ? 'Remarks (Optional)' : 'Reason for Rejection *'}
              </label>
              <textarea
                id="remarks"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder={
                  isApprove 
                    ? 'Add any additional notes or instructions...' 
                    : 'Please provide a reason for rejecting this request...'
                }
                required={!isApprove}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none"
              />
              {!isApprove && (
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  This reason will be shared with the user
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={handleClose}
                disabled={loading}
                className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || (!isApprove && !remarks.trim())}
                className={`flex-1 px-4 py-2 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 ${
                  isApprove 
                    ? 'bg-green-600 hover:bg-green-700' 
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <ActionIcon className="w-4 h-4" />
                    <span>{isApprove ? 'Approve' : 'Reject'}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ActionModal;
