import { useState } from 'react';
import { useTheme } from '@/components/theme/theme-provider';
import type { MealPlan, MessDetails } from './MessDetailsModal.types';

export const useMessDetailsModal = (
  mess: MessDetails | null,
  onJoinMess: (messId: string, mealPlanId: string, paymentType: 'pay_now' | 'pay_later') => void
) => {
  const { isDarkTheme: isDarkMode } = useTheme();
  const [selectedMealPlan, setSelectedMealPlan] = useState<MealPlan | null>(null);
  const [paymentType, setPaymentType] = useState<'pay_now' | 'pay_later'>('pay_later');
  const [showQRCode, setShowQRCode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [paymentCompleted, setPaymentCompleted] = useState(false);
  const [showPaymentConfirmation, setShowPaymentConfirmation] = useState(false);

  const handleJoinMess = async () => {
    if (!selectedMealPlan || !mess) return;
    
    setLoading(true);
    try {
      await onJoinMess(mess.id, selectedMealPlan.id, paymentType);
    } catch (error) {
      console.error('Error joining mess:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentConfirmation = () => {
    setShowPaymentConfirmation(true);
  };

  const handleConfirmPayment = async () => {
    if (!selectedMealPlan || !mess) return;
    
    setLoading(true);
    try {
      await onJoinMess(mess.id, selectedMealPlan.id, paymentType);
    } catch (error) {
      console.error('Error joining mess:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateUPILink = (amount: number, upiId: string) => {
    if (!mess) return '';
    return `upi://pay?pa=${upiId}&pn=${mess.name}&am=${amount}&cu=INR`;
  };

  return {
    // State
    isDarkMode,
    selectedMealPlan,
    setSelectedMealPlan,
    paymentType,
    setPaymentType,
    showQRCode,
    setShowQRCode,
    loading,
    paymentCompleted,
    setPaymentCompleted,
    showPaymentConfirmation,
    setShowPaymentConfirmation,
    
    // Functions
    handleJoinMess,
    handlePaymentConfirmation,
    handleConfirmPayment,
    generateUPILink
  };
};

export default useMessDetailsModal;

