import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { authService } from '@/services/authService';
import type { ForgotPasswordScreenProps } from './ForgotPasswordScreen.types'; 
import { validateEmail, sanitizeEmail, getForgotPasswordErrorMessage } from './ForgotPasswordScreen.utils';

export const useForgotPasswordScreen = ({ onSubmit }: Pick<ForgotPasswordScreenProps, 'onSubmit'>) => {
  const { toast } = useToast();
  const [email, setEmail] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSubmit = async () => {
    const sanitizedEmail = sanitizeEmail(email);
    
    if (!sanitizedEmail) {
      const errorMsg = "Email is required";
      toast({
        title: "Email Required",
        description: "Please enter your email address",
        variant: "destructive",
      });
      setError(errorMsg);
      return false;
    }

    if (!validateEmail(sanitizedEmail)) {
      const errorMsg = "Please enter a valid email address";
      toast({
        title: "Invalid Email",
        description: errorMsg,
        variant: "destructive",
      });
      setError(errorMsg);
      return false;
    }

    setIsLoading(true);
    setError("");
    
    try {
      await authService.forgotPassword(sanitizedEmail);
      
      toast({
        title: "Success",
        description: "Password reset instructions have been sent to your email",
        variant: "default",
      });

      if (onSubmit) {
        onSubmit(sanitizedEmail);
      }
      
      return true;
    } catch (error: unknown) {
      const errorMessage = getForgotPasswordErrorMessage(error);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailChange = (newEmail: string) => {
    setEmail(newEmail);
    if (error) {
      setError("");
    }
  };

  return {
    email,
    setEmail: handleEmailChange,
    error,
    isLoading,
    handleSubmit
  };
};
