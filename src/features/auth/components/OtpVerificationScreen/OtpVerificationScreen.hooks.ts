import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { ROUTES } from '@/constants/routes';
import { authService } from '@/services/authService';
import type { OtpVerificationScreenProps } from './OtpVerificationScreen.types';
import { sanitizeOtp, isOtpComplete } from './OtpVerificationScreen.utils';

export const useOtpVerificationScreen = ({ onVerified }: Pick<OtpVerificationScreenProps, 'onVerified'>) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const [isDarkMode, setIsDarkMode] = useState(false);
  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
  const [isVerified, setIsVerified] = useState(false);
  const [error, setError] = useState("");
  const [timeLeft, setTimeLeft] = useState(600);
  const [selectedRole, setSelectedRole] = useState<'user' | 'mess-owner' | 'admin' | null>(null);
  const [isPasswordReset, setIsPasswordReset] = useState(false);
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (location.state?.role) setSelectedRole(location.state.role);
    if (location.state?.isPasswordReset) setIsPasswordReset(true);
    if (location.state?.email) setEmail(location.state.email);
  }, [location.state]);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !isVerified) {
      toast({ title: 'OTP Expired', description: 'The OTP has expired. Please request a new one.', variant: 'destructive' });
    }
  }, [timeLeft, isVerified, toast]);

  const toggleTheme = () => setIsDarkMode((v) => !v);

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = sanitizeOtp(value);
    setOtp(newOtp);
    setError("");
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) inputRefs.current[index - 1]?.focus();
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = sanitizeOtp(e.clipboardData.getData('text/plain'));
    const newOtp = [...otp];
    for (let i = 0; i < 6; i++) newOtp[i] = pasted[i] || '';
    setOtp(newOtp);
    setError("");
  };

  const handleVerify = async () => {
    const otpString = otp.join('');
    if (!isOtpComplete(otp)) {
      setError('Please enter the complete 6-digit code');
      toast({ title: 'Invalid OTP', description: 'Please enter the complete 6-digit code', variant: 'destructive' });
      return;
    }
    setIsLoading(true);
    try {
      if (isPasswordReset) {
        await authService.verifyPasswordResetOtp(email, otpString);
      } else {
        await authService.verifyRegistrationOtp(email, otpString);
      }
      setIsVerified(true);
      setError('');
      onVerified?.({ email, otp: otpString, isPasswordReset });
      toast({ title: isPasswordReset ? 'OTP Verified Successfully!' : 'Email Verified Successfully!' });
    } catch (err: any) {
      setError(err.message);
      toast({ title: 'OTP Verification Failed', description: err.message, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setTimeLeft(600);
    setOtp(["", "", "", "", "", ""]);
    setError("");
    try {
      if (isPasswordReset) await authService.forgotPassword(email);
      else await authService.sendRegistrationOtp(email);
      toast({ title: 'OTP Sent Successfully!', description: 'A new OTP has been sent to your email address.' });
    } catch (err: any) {
      setError(err.message);
      toast({ title: 'Failed to Resend OTP', description: err.message, variant: 'destructive' });
    }
  };

  const handleBack = () => {
    if (isPasswordReset) navigate(ROUTES.PUBLIC.FORGOT_PASSWORD);
    else navigate(ROUTES.PUBLIC.REGISTER, { state: { role: selectedRole } });
  };

  const handleContinueToApp = () => {
    if (isPasswordReset) {
      navigate(ROUTES.PUBLIC.RESET_PASSWORD, { state: { email, otp: otp.join(''), isPasswordReset: true } });
    } else {
      const userRole = localStorage.getItem('userRole');
      if (userRole === 'admin') navigate(ROUTES.ADMIN.DASHBOARD);
      else if (userRole === 'mess-owner') navigate(ROUTES.MESS_OWNER.DASHBOARD);
      else navigate(ROUTES.USER.DASHBOARD);
    }
  };

  return {
    // state
    isDarkMode, otp, isVerified, error, timeLeft, isLoading, isPasswordReset,
    email, selectedRole,
    // refs
    inputRefs,
    // actions
    toggleTheme, handleOtpChange, handleKeyDown, handlePaste, handleVerify, handleResend, handleBack, handleContinueToApp,
  };
};

