import { useState, useEffect } from 'react';
import  messService  from '@/services/api/messService';   
import type { PaymentSettings } from '@/services/api/messService';

interface UsePaymentSettingsReturn {
  paymentSettings: PaymentSettings;
  loading: boolean;
  saving: boolean;
  error: string | null;
  success: string | null;
  handleSettingChange: (field: keyof PaymentSettings, value: string | boolean | number) => void;
  handleSave: () => Promise<void>;
}

export const usePaymentSettings = (): UsePaymentSettingsReturn => {
  // Payment State
  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings>({
    upiId: "",
    bankAccount: "",
    autoPayment: true,
    lateFee: true,
    lateFeeAmount: 50,
    isCashPayment: false
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    loadPaymentSettings();
  }, []);

  const loadPaymentSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await messService.getPaymentSettings();
      
      if (response.success && response.data) {
        setPaymentSettings(response.data);
      } else {
        // If no data in response, use the response itself (for backward compatibility)
        setPaymentSettings(response as any);
      }
    } catch (err: any) {
      console.error('Failed to load payment settings:', err);
      setError(err.message || 'Failed to load payment settings');
      // Keep default values if loading fails - the backend will now return defaults
    } finally {
      setLoading(false);
    }
  };

  const handleSettingChange = (field: keyof PaymentSettings, value: string | boolean | number) => {
    setPaymentSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      const response = await messService.updatePaymentSettings(paymentSettings);
      
      if (response.success) {
        setSuccess('Payment settings updated successfully!');
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          setSuccess(null);
        }, 3000);
      } else {
        setError(response.message || 'Failed to update payment settings');
        
        // Clear error message after 5 seconds
        setTimeout(() => {
          setError(null);
        }, 5000);
      }
    } catch (err: any) {
      console.error('Failed to save payment settings:', err);
      setError(err.message || 'Failed to save payment settings');
      
      // Clear error message after 5 seconds
      setTimeout(() => {
        setError(null);
      }, 5000);
    } finally {
      setSaving(false);
    }
  };

  return {
    paymentSettings,
    loading,
    saving,
    error,
    success,
    handleSettingChange,
    handleSave,
  };
};






