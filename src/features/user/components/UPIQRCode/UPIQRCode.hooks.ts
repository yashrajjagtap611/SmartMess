import { useState, useCallback } from 'react';
import type { UPIQRCodeProps } from './UPIQRCode.types';

export const useUPIQRCode = ({ upiId, amount, merchantName }: Pick<UPIQRCodeProps, 'upiId' | 'amount' | 'merchantName'>) => {
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Generate UPI payment URL
  const upiUrl = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(merchantName)}&am=${amount}&cu=INR`;

  const handleOpenUPIApp = useCallback(() => {
    try {
      // Try to open UPI app with the payment URL
      window.location.href = upiUrl;
      setError(null);
    } catch (err) {
      setError('Failed to open UPI app. Please try again.');
    }
  }, [upiUrl]);

  const handleCopyUPIUrl = useCallback(async () => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(upiUrl);
      } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = upiUrl;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      
      setCopied(true);
      setError(null);
      
      // Reset copied state after 2 seconds
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      setError('Failed to copy URL. Please try again.');
    }
  }, [upiUrl]);

  const handleCopyUPIId = useCallback(async () => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(upiId);
      } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = upiId;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      
      setCopied(true);
      setError(null);
      
      // Reset copied state after 2 seconds
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      setError('Failed to copy UPI ID. Please try again.');
    }
  }, [upiId]);

  const resetError = useCallback(() => {
    setError(null);
  }, []);

  return {
    // State
    copied,
    error,
    upiUrl,
    
    // Functions
    handleOpenUPIApp,
    handleCopyUPIUrl,
    handleCopyUPIId,
    resetError
  };
};

export default useUPIQRCode;

