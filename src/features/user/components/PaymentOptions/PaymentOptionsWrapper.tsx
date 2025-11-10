import React from 'react';
// import { useNavigate } from 'react-router-dom'; // Unused
import PaymentOptions from './PaymentOptions';

interface PaymentOptionsWrapperProps {
  onJoinMess: (messId: string, mealPlanId: string, paymentType: 'pay_now' | 'pay_later') => void;
  onClose: () => void;
  paymentData: {
    billId: string;
    amount: number;
    messName: string;
    messId: string;
    upiId?: string;
  };
}

const PaymentOptionsWrapper: React.FC<PaymentOptionsWrapperProps> = ({ 
  onJoinMess: _onJoinMess, 
  onClose: _onClose, 
  paymentData 
}) => {
  // const navigate = useNavigate(); // Unused

  // handleJoinMess is not used in this component
  // PaymentOptions component handles its own join logic

  // Create mock data for PaymentOptions
  const mockMess = {
    id: paymentData.messId,
    name: paymentData.messName,
    description: 'Mess for payment',
    address: 'Address not available',
    capacity: 50,
    currentMembers: 25,
    monthlyRate: paymentData.amount,
    ownerName: 'Mess Owner',
    ownerPhone: '+91-0000000000',
    ownerEmail: 'owner@mess.com',
    types: ['Veg', 'Non-Veg'],
    colleges: ['Local College'],
    rating: 4.5,
    reviews: 100,
    upiId: paymentData.upiId || 'messowner@upi', // Fallback UPI ID for testing
    mealPlans: [{
      id: paymentData.billId,
      name: 'Payment Plan',
      description: 'Payment for bill',
      pricing: {
        amount: paymentData.amount,
        period: 'month' as const
      },
      mealType: 'All Meals',
      mealsPerDay: 3,
      isActive: true,
      leaveRules: {
        maxLeaveDays: 5,
        maxLeaveMeals: 15,
        requireTwoHourNotice: true,
        noticeHours: 2,
        minConsecutiveDays: 1,
        extendSubscription: true,
        autoApproval: false,
        leaveLimitsEnabled: true,
        consecutiveLeaveEnabled: true,
        maxLeaveDaysEnabled: true,
        maxLeaveMealsEnabled: true
      }
    }]
  };

  const selectedMealPlan = mockMess.mealPlans[0];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <PaymentOptions 
          mess={mockMess}
          {...(selectedMealPlan ? { selectedMealPlan } : {})}
        />
      </div>
    </div>
  );
};

export default PaymentOptionsWrapper;
