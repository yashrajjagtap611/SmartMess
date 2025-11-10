import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { ROUTES } from '@/constants/routes';
import { authService } from '@/services/authService';
import type { ResetPasswordScreenProps, ResetPasswordFormData } from './ResetPasswordScreen.types';
import { validateResetPasswordForm, sanitizePasswordData, getResetPasswordErrorMessage } from './ResetPasswordScreen.utils';

export const useResetPasswordScreen = ({ onResetPassword, onLogin }: Pick<ResetPasswordScreenProps, 'onResetPassword' | 'onLogin'>) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isReset, setIsReset] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Get email and OTP from navigation state
  useEffect(() => {
    if (location.state?.email) {
      setEmail(location.state.email);
    }
    if (location.state?.otp) {
      setOtp(location.state.otp);
    }
  }, [location.state]);

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

  const handleResetPassword = async () => {
    const sanitizedData = sanitizePasswordData(formData);
    const validationErrors = validateResetPasswordForm(sanitizedData);
    
    if (Object.keys(validationErrors).length > 0) {
      // Convert ResetPasswordErrors to Record<string, string>
      const errorRecord: Record<string, string> = {};
      Object.entries(validationErrors).forEach(([key, value]) => {
        if (value) {
          errorRecord[key] = value;
        }
      });
      setErrors(errorRecord);
      return;
    }

    // Check if we have OTP, if not prompt for it
    let currentOtp = otp;
    if (!currentOtp) {
      currentOtp = prompt('Please enter the OTP sent to your email:') || '';
      if (!currentOtp) {
        toast({
          title: 'OTP Required',
          description: 'Please enter the OTP sent to your email',
          variant: 'destructive',
        });
        setErrors({ password: 'OTP is required' });
        return;
      }
      setOtp(currentOtp);
    }

    setIsLoading(true);
    try {
      const resetData: ResetPasswordFormData = {
        email,
        otp: currentOtp,
        password: sanitizedData.password,
        confirmPassword: sanitizedData.confirmPassword,
      };

      if (onResetPassword) {
        onResetPassword(resetData);
      } else {
        await authService.resetPassword({
          email,
          otp: currentOtp,
          newPassword: sanitizedData.password,
        });
        
        toast({
          title: 'Success!',
          description: 'Password reset successfully. You can now login with your new password.',
          variant: 'default',
        });
        
        console.log('Password reset successful');
        setIsReset(true);
      }
    } catch (error: any) {
      console.error('Password reset failed:', error);
      const errorMessage = getResetPasswordErrorMessage(error);
      setErrors({ general: errorMessage });
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    navigate(ROUTES.PUBLIC.OTP_VERIFICATION, { 
      state: { 
        email: email, 
        isPasswordReset: true 
      } 
    });
  };

  const handleLogin = () => {
    if (onLogin) {
      onLogin();
    } else {
      navigate(ROUTES.PUBLIC.LOGIN);
    }
  };

  return {
    // state
    isDarkMode,
    showPassword,
    showConfirmPassword,
    email,
    otp,
    formData,
    errors,
    isReset,
    isLoading,
    // actions
    toggleTheme,
    togglePasswordVisibility,
    toggleConfirmPasswordVisibility,
    handleInputChange,
    handleResetPassword,
    handleBack,
    handleLogin,
  };
};
