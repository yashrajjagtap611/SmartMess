export interface ResetPasswordScreenProps {
  onResetPassword?: (data: ResetPasswordFormData) => void;
  onBack?: () => void;
  onLogin?: () => void;
}

export interface ResetPasswordFormData {
  email: string;
  otp: string;
  password: string;
  confirmPassword: string;
}

export interface ResetPasswordState {
  formData: Pick<ResetPasswordFormData, 'password' | 'confirmPassword'>;
  errors: Record<string, string>;
  isLoading: boolean;
  isReset: boolean;
  email: string;
  otp: string;
  showPassword: boolean;
  showConfirmPassword: boolean;
}

export interface ResetPasswordErrors {
  password?: string;
  confirmPassword?: string;
  general?: string;
}









