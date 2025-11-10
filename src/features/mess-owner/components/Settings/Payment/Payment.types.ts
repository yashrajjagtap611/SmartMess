export interface PaymentProps {
  // Add any props if needed
}

export interface PaymentState {
  paymentSettings: PaymentSettings;
  loading: boolean;
  saving: boolean;
  error: string | null;
  success: string | null;
}

export interface PaymentSettings {
  upiId: string;
  bankAccount: string;
  autoPayment: boolean;
  lateFee: boolean;
  lateFeeAmount: number;
  isCashPayment: boolean;
}

export interface PaymentFormProps {
  paymentSettings: PaymentSettings;
  loading: boolean;
  saving: boolean;
  error: string | null;
  success: string | null;
  onSettingChange: (field: keyof PaymentSettings, value: string | boolean | number) => void;
  onSave: () => Promise<void>;
}






