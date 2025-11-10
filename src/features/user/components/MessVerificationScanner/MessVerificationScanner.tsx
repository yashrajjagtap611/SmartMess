import React, { useState } from 'react';
import {
  QrCodeIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  UserIcon,
  CameraIcon
} from '@heroicons/react/24/outline';
import messQRService, { MemberInfo } from '@/services/api/messQRService';
import QRScannerModal from './QRScannerModal';

interface MessVerificationScannerProps {
  onScanComplete?: (result: { success: boolean; message: string }) => void;
  className?: string;
}

const MessVerificationScanner: React.FC<MessVerificationScannerProps> = ({
  onScanComplete,
  className = ''
}) => {
  const [showScanner, setShowScanner] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    member?: MemberInfo;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleScanQR = async (qrData: string) => {
    try {
      setVerifying(true);
      setError(null);
      setResult(null);

      const scanResult = await messQRService.scanMessQR(qrData);
      setResult(scanResult);
      
      if (onScanComplete) {
        onScanComplete({
          success: scanResult.success,
          message: scanResult.message
        });
      }
    } catch (err: any) {
      setError(err.message || 'Failed to scan QR code');
    } finally {
      setVerifying(false);
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <>
      <div className={`rounded-xl border border-border bg-card transition-all p-4 sm:p-6 ${className}`}>
        <div className="text-center space-y-4 sm:space-y-6">
          {/* Header */}
          <div>
            <QrCodeIcon className="w-12 h-12 sm:w-16 sm:h-16 mx-auto text-primary mb-3 sm:mb-4" />
            <h2 className="text-xl sm:text-2xl font-bold SmartMess-light-text dark:SmartMess-dark-text mb-2">
              Mess Verification
            </h2>
            <p className="text-sm sm:text-base SmartMess-light-text-secondary dark:SmartMess-dark-text-secondary">
              Scan the mess QR code to verify your active membership
            </p>
          </div>

          {/* Scan Button */}
          {!result && !verifying && (
            <button
              onClick={() => setShowScanner(true)}
              className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium flex items-center justify-center gap-2 sm:gap-3 mx-auto shadow-lg hover:shadow-xl"
            >
              <CameraIcon className="w-5 h-5 sm:w-6 sm:h-6" />
              <span className="text-sm sm:text-base">Open Camera to Scan</span>
            </button>
          )}

          {/* Verifying State */}
          {verifying && (
            <div className="py-6 sm:py-8">
              <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-4 border-primary border-t-transparent mx-auto mb-3 sm:mb-4"></div>
              <p className="text-sm sm:text-base SmartMess-light-text-secondary dark:SmartMess-dark-text-secondary">Verifying membership...</p>
            </div>
          )}

          {/* Error Display */}
          {error && (
          <div className="p-3 sm:p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <div className="flex items-center gap-2 justify-center">
              <XCircleIcon className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
              <p className="text-sm sm:text-base text-red-700 dark:text-red-300 text-center">{error}</p>
            </div>
          </div>
        )}

        {/* Verification Result */}
        {result && (
          <div className={`p-4 sm:p-6 rounded-lg border ${
            result.success
              ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
              : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
          }`}>
            <div className="flex items-center justify-center gap-2 sm:gap-3 mb-3 sm:mb-4">
              {result.success ? (
                <CheckCircleIcon className="w-6 h-6 sm:w-8 sm:h-8 text-green-600 dark:text-green-400 flex-shrink-0" />
              ) : (
                <XCircleIcon className="w-6 h-6 sm:w-8 sm:h-8 text-red-600 dark:text-red-400 flex-shrink-0" />
              )}
              <h3 className={`text-lg sm:text-xl font-bold ${
                result.success
                  ? 'text-green-700 dark:text-green-300'
                  : 'text-red-700 dark:text-red-300'
              }`}>
                {result.success ? 'Verified!' : 'Verification Failed'}
              </h3>
            </div>
            
            <p className={`text-sm mb-3 sm:mb-4 text-center ${
              result.success
                ? 'text-green-600 dark:text-green-400'
                : 'text-red-600 dark:text-red-400'
            }`}>
              {result.message}
            </p>

            {/* Member Details */}
            {result.success && result.member && (
              <div className="mt-4 sm:mt-6 space-y-3 sm:space-y-4 text-left bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg">
                <div className="flex items-center gap-2 sm:gap-3 pb-3 border-b border-border">
                  <UserIcon className="w-5 h-5 sm:w-6 sm:h-6 text-primary flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm SmartMess-light-text-secondary dark:SmartMess-dark-text-secondary">Member Name</p>
                    <p className="font-semibold text-sm sm:text-base SmartMess-light-text dark:SmartMess-dark-text truncate">{result.member.name}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 sm:gap-3 pb-3 border-b border-border">
                  <ClockIcon className="w-5 h-5 sm:w-6 sm:h-6 text-primary flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm SmartMess-light-text-secondary dark:SmartMess-dark-text-secondary">Member Since</p>
                    <p className="font-semibold text-sm sm:text-base SmartMess-light-text dark:SmartMess-dark-text">
                      {formatDate(result.member.memberSince)}
                    </p>
                  </div>
                </div>

                {/* Active Plans */}
                <div className="pt-2">
                  <p className="text-xs sm:text-sm SmartMess-light-text-secondary dark:SmartMess-dark-text-secondary mb-2">Active Plans</p>
                  <div className="space-y-2">
                    {result.member.activePlans.map((plan, index) => (
                      <div
                        key={index}
                        className="p-2 sm:p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800"
                      >
                        <p className="font-semibold text-sm sm:text-base SmartMess-light-text dark:SmartMess-dark-text mb-1">{plan.planName}</p>
                        <p className="text-xs SmartMess-light-text-secondary dark:SmartMess-dark-text-secondary">
                          Valid: {formatDate(plan.startDate)} - {formatDate(plan.endDate)}
                        </p>
                        <span className={`inline-block px-2 py-1 text-xs rounded mt-1 ${
                          plan.status === 'active'
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                            : 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300'
                        }`}>
                          {plan.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

          {/* Scan Again Button */}
          {result && (
            <button
              onClick={() => {
                setResult(null);
                setError(null);
              }}
              className="w-full sm:w-auto px-6 py-3 bg-secondary text-secondary-foreground border border-border rounded-lg hover:bg-accent transition-colors font-medium flex items-center justify-center gap-2 mx-auto"
            >
              <CameraIcon className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="text-sm sm:text-base">Scan Again</span>
            </button>
          )}

          {/* Instructions */}
          {!result && !verifying && (
            <div className="mt-6 sm:mt-8 p-3 sm:p-4 bg-muted/50 rounded-lg text-left">
              <h4 className="font-semibold text-sm sm:text-base SmartMess-light-text dark:SmartMess-dark-text mb-2">How to Scan</h4>
              <ul className="space-y-2 text-xs sm:text-sm SmartMess-light-text-secondary dark:SmartMess-dark-text-secondary">
                <li className="flex items-start gap-2">
                  <span className="font-bold text-primary">1.</span>
                  <span>Click "Open Camera to Scan" button above</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-primary">2.</span>
                  <span>Allow camera access when prompted</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-primary">3.</span>
                  <span>Point your camera at the mess QR code</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-primary">4.</span>
                  <span>The system will automatically verify your membership</span>
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* QR Scanner Modal */}
      <QRScannerModal
        isOpen={showScanner}
        onClose={() => setShowScanner(false)}
        onScan={handleScanQR}
      />
    </>
  );
};

export default MessVerificationScanner;
