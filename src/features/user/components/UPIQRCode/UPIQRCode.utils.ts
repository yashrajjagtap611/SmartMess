import type { UPITransactionData, UPIAppInfo } from './UPIQRCode.types';

/**
 * Generates UPI payment URL according to NPCI specification
 */
export const generateUPIUrl = (data: UPITransactionData): string => {
  const params = new URLSearchParams();
  
  // Required parameters
  params.append('pa', data.upiId); // Payee Address (UPI ID)
  params.append('pn', data.merchantName); // Payee Name
  params.append('am', data.amount.toString()); // Amount
  params.append('cu', data.currency); // Currency
  
  // Optional parameters
  if (data.note) {
    params.append('tn', data.note); // Transaction Note
  }
  
  if (data.transactionId) {
    params.append('tr', data.transactionId); // Transaction Reference ID
  }
  
  return `upi://pay?${params.toString()}`;
};

/**
 * Validates UPI ID format
 */
export const validateUPIId = (upiId: string): boolean => {
  const upiRegex = /^[\w.-]+@[\w.-]+$/;
  return upiRegex.test(upiId);
};

/**
 * Validates amount for UPI transaction
 */
export const validateAmount = (amount: number): { isValid: boolean; error?: string } => {
  if (amount <= 0) {
    return { isValid: false, error: 'Amount must be greater than 0' };
  }
  
  if (amount > 100000) {
    return { isValid: false, error: 'Amount cannot exceed ₹1,00,000 per transaction' };
  }
  
  if (amount < 1) {
    return { isValid: false, error: 'Minimum amount is ₹1' };
  }
  
  return { isValid: true };
};

/**
 * Formats amount for display
 */
export const formatAmount = (amount: number): string => {
  return `₹${amount.toLocaleString('en-IN')}`;
};

/**
 * Gets list of popular UPI apps
 */
export const getPopularUPIApps = (): UPIAppInfo[] => {
  return [
    {
      name: 'Google Pay',
      scheme: 'gpay://',
      downloadUrl: 'https://play.google.com/store/apps/details?id=com.google.android.apps.nbu.paisa.user',
    },
    {
      name: 'PhonePe',
      scheme: 'phonepe://',
      downloadUrl: 'https://play.google.com/store/apps/details?id=com.phonepe.app',
    },
    {
      name: 'Paytm',
      scheme: 'paytmmp://',
      downloadUrl: 'https://play.google.com/store/apps/details?id=net.one97.paytm',
    },
    {
      name: 'Amazon Pay',
      scheme: 'amazonpay://',
      downloadUrl: 'https://play.google.com/store/apps/details?id=in.amazon.mShop.android.shopping',
    },
    {
      name: 'BHIM',
      scheme: 'bhim://',
      downloadUrl: 'https://play.google.com/store/apps/details?id=in.org.npci.upiapp',
    }
  ];
};

/**
 * Attempts to open specific UPI app
 */
export const openUPIApp = (appScheme: string, upiUrl: string): void => {
  const specificUrl = upiUrl.replace('upi://', appScheme);
  window.location.href = specificUrl;
};

/**
 * Detects if device is mobile
 */
export const isMobileDevice = (): boolean => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

/**
 * Gets QR code size based on screen size
 */
export const getResponsiveQRSize = (preferredSize: number): number => {
  if (typeof window === 'undefined') return preferredSize;
  
  const screenWidth = window.innerWidth;
  
  if (screenWidth < 640) { // Mobile
    return Math.min(preferredSize, screenWidth * 0.6);
  } else if (screenWidth < 1024) { // Tablet
    return Math.min(preferredSize, 250);
  }
  
  return preferredSize;
};

/**
 * Generates transaction reference ID
 */
export const generateTransactionId = (prefix = 'TXN'): string => {
  const timestamp = Date.now().toString();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${prefix}${timestamp}${random}`;
};

/**
 * Copies text to clipboard with fallback
 */
export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // Fallback for older browsers or non-secure contexts
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      const success = document.execCommand('copy');
      document.body.removeChild(textArea);
      return success;
    }
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
};

/**
 * Gets default payment instructions
 */
export const getDefaultPaymentInstructions = (amount: number, upiId: string): string[] => {
  return [
    'Open any UPI app (GPay, PhonePe, Paytm, etc.)',
    'Scan the QR code above or click "Open UPI App"',
    `Verify the amount: ${formatAmount(amount)}`,
    `Verify the UPI ID: ${upiId}`,
    'Enter your UPI PIN to complete the payment',
    'Take a screenshot of the success message'
  ];
};

/**
 * Validates merchant name
 */
export const validateMerchantName = (name: string): { isValid: boolean; error?: string } => {
  if (!name.trim()) {
    return { isValid: false, error: 'Merchant name is required' };
  }
  
  if (name.length > 50) {
    return { isValid: false, error: 'Merchant name cannot exceed 50 characters' };
  }
  
  return { isValid: true };
};

/**
 * Gets UPI transaction limits
 */
export const getUPILimits = () => {
  return {
    minAmount: 1,
    maxAmount: 100000,
    maxDailyAmount: 100000,
    maxMonthlyAmount: 1000000,
    currency: 'INR'
  };
};

/**
 * Checks if UPI is supported on current device/browser
 */
export const isUPISupported = (): boolean => {
  // UPI is primarily supported on mobile devices in India
  // This is a basic check - in production, you might want more sophisticated detection
  return isMobileDevice() && navigator.userAgent.indexOf('Mobile') !== -1;
};

