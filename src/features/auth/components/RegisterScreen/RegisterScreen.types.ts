export interface RegisterScreenProps {
  onRegister?: (data: RegisterFormData) => void;
  onBack?: () => void;
  onGoogleRegister?: (role: 'user' | 'mess-owner') => void;
}

export interface RegisterFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  role: 'user' | 'mess-owner';
}

export interface RegisterState {
  formData: Omit<RegisterFormData, 'role'>;
  errors: Record<string, string>;
  isLoading: boolean;
  selectedRole: 'user' | 'mess-owner' | null;
  showPassword: boolean;
  showConfirmPassword: boolean;
}

export interface RegisterErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  password?: string;
  confirmPassword?: string;
  general?: string;
}




