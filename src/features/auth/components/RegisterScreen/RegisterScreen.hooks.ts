import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { ROUTES } from '@/constants/routes';
import { authService } from '@/services/authService';
import type { RegisterScreenProps, RegisterFormData } from './RegisterScreen.types';
import { validateRegisterForm, sanitizeFormData, getRegisterErrorMessage } from './RegisterScreen.utils';

export const useRegisterScreen = ({ onRegister, onGoogleRegister }: Pick<RegisterScreenProps, 'onRegister' | 'onGoogleRegister'>) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'user' | 'mess-owner' | null>(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  // Get role from navigation state
  useEffect(() => {
    if (location.state?.role) {
      setSelectedRole(location.state.role);
    } else {
      // If no role selected, redirect back to role selection
      navigate(ROUTES.PUBLIC.ROLE_SELECTION);
    }
  }, [location.state]); // Removed navigate to prevent infinite loops

  const toggleTheme = () => setIsDarkMode(!isDarkMode);
  const togglePasswordVisibility = () => setShowPassword(!showPassword);
  const toggleConfirmPasswordVisibility = () => setShowConfirmPassword(!showConfirmPassword);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleRegister = async () => {
    const sanitizedData = sanitizeFormData(formData);
    const validationErrors = validateRegisterForm(sanitizedData);
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors as Record<string, string>);
      return;
    }

    if (!selectedRole) {
      setErrors({ general: 'Please select a role' });
      return;
    }

    setIsLoading(true);
    try {
      // Exclude confirmPassword from API request - backend doesn't expect it
      const { confirmPassword, ...apiData } = sanitizedData;
      const registrationData: RegisterFormData = {
        ...sanitizedData,
        role: selectedRole
      };

      if (onRegister) {
        onRegister(registrationData);
      } else {
        // Send data without confirmPassword to match backend RegisterRequest interface
        const response = await authService.register({
          ...apiData,
          role: selectedRole
        });
        console.log('Registration successful:', response);
        
        // Navigate to OTP verification after successful registration
        navigate(ROUTES.PUBLIC.OTP_VERIFICATION, { 
          state: { 
            role: selectedRole,
            email: sanitizedData.email 
          } 
        });
      }
    } catch (error: any) {
      console.error('Registration failed:', error);
      const errorMessage = getRegisterErrorMessage(error);
      setErrors({ general: errorMessage });
      toast({
        title: 'Registration Failed',
        description: errorMessage,
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleRegister = async () => {
    if (!selectedRole) {
      setErrors({ general: 'Please select a role' });
      return;
    }

    setIsLoading(true);
    try {
      if (onGoogleRegister) {
        onGoogleRegister(selectedRole);
      } else {
        // Handle Google registration logic here
        console.log('Google registration attempted with role:', selectedRole);
        // Navigate to main app after successful Google registration
        navigate(ROUTES.USER.DASHBOARD, { state: { role: selectedRole } });
      }
    } catch (error: any) {
      console.error('Google registration failed:', error);
      const errorMessage = getRegisterErrorMessage(error);
      setErrors({ general: errorMessage });
      toast({
        title: 'Google Registration Failed',
        description: errorMessage,
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    navigate(ROUTES.PUBLIC.ROLE_SELECTION);
  };

  const handleSignIn = () => {
    navigate(ROUTES.PUBLIC.LOGIN);
  };

  return {
    // state
    isDarkMode,
    showPassword,
    showConfirmPassword,
    selectedRole,
    formData,
    errors,
    isLoading,
    // actions
    toggleTheme,
    togglePasswordVisibility,
    toggleConfirmPasswordVisibility,
    handleInputChange,
    handleRegister,
    handleGoogleRegister,
    handleBack,
    handleSignIn,
  };
};









