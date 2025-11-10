export interface UPIQRCodeProps {
  upiId: string;
  amount: number;
  merchantName: string;
  size?: number;
  note?: string;
  transactionId?: string;
  className?: string;
  showInstructions?: boolean;
  onPaymentSuccess?: () => void;
  onPaymentError?: (error: string) => void;
}

export interface UPITransactionData {
  upiId: string;
  amount: number;
  merchantName: string;
  note?: string;
  transactionId?: string;
  currency: 'INR';
}

export interface QRCodeDisplayProps {
  qrValue: string;
  size: number;
  title?: string;
  subtitle?: string;
}

export interface PaymentInstructionsProps {
  amount: number;
  upiId: string;
  merchantName: string;
  steps?: string[];
}

export interface UPIAppInfo {
  name: string;
  scheme: string;
  downloadUrl: string;
  icon?: string;
}

