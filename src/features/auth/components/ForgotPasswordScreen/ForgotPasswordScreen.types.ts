export interface ForgotPasswordScreenProps {
  onSubmit?: (email: string) => void;
  onBack?: () => void;
}

export interface ForgotPasswordFormData {
  email: string;
}

export interface ForgotPasswordState {
  email: string;
  isLoading: boolean;
  error: string | null;
  success: boolean;
}


