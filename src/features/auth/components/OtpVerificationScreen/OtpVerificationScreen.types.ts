export interface OtpVerificationScreenProps {
  onBack?: () => void;
  onVerified?: (params: { email: string; otp: string; isPasswordReset: boolean }) => void;
  onResent?: (email: string, isPasswordReset: boolean) => void;
}

export interface OtpState {
  otp: string[]; // length 6
  isVerified: boolean;
  error: string;
  timeLeft: number; // seconds
  isLoading: boolean;
  isPasswordReset: boolean;
  email: string;
  selectedRole: 'user' | 'mess-owner' | 'admin' | null;
}


