export interface LoginScreenProps {
  onSubmit?: (email: string, password: string) => void;
  onForgotPassword?: () => void;
  onRegister?: () => void;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginState {
  email: string;
  password: string;
  showPassword: boolean;
  error: string;
  isLoading: boolean;
}


