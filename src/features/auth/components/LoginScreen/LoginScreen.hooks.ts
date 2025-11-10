import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { authService } from '@/services/authService';
import { ROUTES } from '@/constants/routes';
import type { LoginScreenProps } from './LoginScreen.types';
import { validateEmail, sanitizeEmail, getLoginErrorMessage } from './LoginScreen.utils';

export const useLoginScreen = ({ onSubmit }: Pick<LoginScreenProps, 'onSubmit'>) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = () => {
    const normalizedEmail = sanitizeEmail(email);

    if (!normalizedEmail) {
      toast({
        title: 'Email Required',
        description: 'Please enter your email address',
        variant: 'destructive',
      });
      setError('Email is required');
      return false;
    }

    if (!validateEmail(normalizedEmail)) {
      toast({
        title: 'Invalid Email',
        description: 'Please enter a valid email address',
        variant: 'destructive',
      });
      setError('Please enter a valid email');
      return false;
    }

    if (!password) {
      toast({
        title: 'Password Required',
        description: 'Please enter your password',
        variant: 'destructive',
      });
      setError('Password is required');
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    setError('');
    try {
      const response = await authService.login({ email: sanitizeEmail(email), password });
      
      toast({
        title: 'Success',
        description: 'Logged in successfully',
        variant: 'default',
      });

      onSubmit?.(email, password);

      // Navigate based on user role
      const userRole = response.data?.user?.role;
      if (userRole === 'mess-owner') {
        navigate(ROUTES.MESS_OWNER.DASHBOARD);
      } else if (userRole === 'user') {
        navigate(ROUTES.USER.DASHBOARD);
      } else if (userRole === 'admin') {
        navigate(ROUTES.ADMIN.DASHBOARD);
      } else {
        navigate(ROUTES.PUBLIC.ROLE_SELECTION);
      }
    } catch (error: unknown) {
      const errorMessage = getLoginErrorMessage(error);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  return {
    email,
    setEmail,
    password,
    setPassword,
    showPassword,
    error,
    isLoading,
    handleSubmit,
    togglePasswordVisibility,
  };
};
