import type { PaymentSettings } from './Payment.types';

export const getDefaultPaymentSettings = (): PaymentSettings => {
  return {
    upiId: "",
    bankAccount: "",
    autoPayment: true,
    lateFee: true,
    lateFeeAmount: 50,
    isCashPayment: false
  };
};

export const validatePaymentSettings = (settings: PaymentSettings): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (settings.lateFee && settings.lateFeeAmount <= 0) {
    errors.push('Late fee amount must be greater than 0 when late fee is enabled');
  }

  if (settings.lateFeeAmount < 0) {
    errors.push('Late fee amount cannot be negative');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

export const getPaymentSettingsErrorMessage = (error: any): string => {
  if (error?.message) {
    return error.message;
  }
  if (error?.response?.data?.message) {
    return error.response.data.message;
  }
  return 'An error occurred while processing payment settings. Please try again.';
};

export const formatUPIId = (upiId: string): string => {
  return upiId.trim();
};

export const validateUPIId = (upiId: string): boolean => {
  const upiRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z]{2,}$/;
  return upiRegex.test(upiId);
};

export const validateBankAccount = (account: string): boolean => {
  const accountRegex = /^\d{9,18}$/;
  return accountRegex.test(account.replace(/\s/g, ''));
};






