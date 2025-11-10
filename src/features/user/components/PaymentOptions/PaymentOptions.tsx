import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  ArrowLeftIcon,
  PhotoIcon,
  TrashIcon,
  XMarkIcon,
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  BanknotesIcon,
  CreditCardIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import { PaymentTypeSelector, PaymentType } from '@/components/common/PaymentTypeSelector';
import { PaymentMethods, PaymentMethod } from '@/components/common/PaymentMethods';
import { paymentVerificationService } from '@/services/api/paymentVerificationService';
import messService from '@/services/api/messService';
import { billingService } from '@/services/api/billingService';
import { useToast } from '@/hooks/use-toast';

interface MealPlan {
  id: string;
  name: string;
  description: string;
  pricing: {
    amount: number;
    period: 'day' | 'week' | '15days' | 'month' | '3months' | '6months' | 'year';
  };
  mealType: string;
  mealsPerDay: number;
  isActive: boolean;
  leaveRules: {
    maxLeaveDays: number;
    maxLeaveMeals: number;
    requireTwoHourNotice: boolean;
    noticeHours: number;
    minConsecutiveDays: number;
    extendSubscription: boolean;
    autoApproval: boolean;
    leaveLimitsEnabled: boolean;
    consecutiveLeaveEnabled: boolean;
    maxLeaveDaysEnabled: boolean;
    maxLeaveMealsEnabled: boolean;
  };
}

interface MessDetails {
  id: string;
  name: string;
  description: string;
  address: string;
  capacity: number;
  currentMembers: number;
  monthlyRate: number;
  ownerName: string;
  ownerPhone: string;
  ownerEmail: string;
  types: string[];
  colleges: string[];
  rating?: number;
  reviews?: number;
  image?: string;
  upiId?: string;
  mealPlans?: MealPlan[];
}

interface PaymentOptionsProps {
  mess?: MessDetails;
  selectedMealPlan?: MealPlan;
}

const PaymentOptions: React.FC<PaymentOptionsProps> = ({ mess, selectedMealPlan }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  // Get data from props or location state
  const locationState = location.state as any;
  
  console.log('🔍 PaymentOptions - Location state:', locationState);
  console.log('🔍 PaymentOptions - Props:', { mess, selectedMealPlan });
  
  // Use actual data from props or location state
  const mockMessData = mess || locationState?.mess;
  const mockMealPlanData = selectedMealPlan || locationState?.selectedMealPlan;
  const paymentTypeFromState = locationState?.paymentType;
  
  // Check if this is a bill payment (existing subscription) vs new join request
  const isBillPayment = paymentTypeFromState === 'pay_now' && locationState?.isBillPayment;
  
  console.log('🔍 PaymentOptions - Mess data:', mockMessData);
  console.log('🔍 PaymentOptions - Meal plan data:', mockMealPlanData);
  console.log('🔍 PaymentOptions - Payment type from state:', paymentTypeFromState);
  console.log('🔍 PaymentOptions - Is bill payment:', isBillPayment);
  
  // If no data is available, redirect back
  useEffect(() => {
    if (!mockMessData && !mockMealPlanData) {
      navigate(-1); // Go back to previous page
    }
  }, [mockMessData, mockMealPlanData, navigate]);

  const [paymentType, setPaymentType] = useState<PaymentType>(
    isBillPayment ? 'pay_now' : (paymentTypeFromState || 'pay_later')
  );
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod>('upi');
  const [loading, setLoading] = useState(false);
  const [showPaymentConfirmation, setShowPaymentConfirmation] = useState(false);
  const [paymentScreenshot, setPaymentScreenshot] = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  const [transactionId, setTransactionId] = useState<string>('');
  const [showMessInfo, setShowMessInfo] = useState(false);
  const [showPlanRules, setShowPlanRules] = useState(false);
  const [previousDataLoaded, setPreviousDataLoaded] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Redirect if no data
  useEffect(() => {
    if (!mockMessData || !mockMealPlanData) {
      navigate('/user');
    }
  }, [mockMessData, mockMealPlanData, navigate]);

  // Fetch previous payment data if this is a retry (rejected or pending payment request)
  useEffect(() => {
    const fetchPreviousPaymentData = async () => {
      // Only fetch if this is a bill payment (retry scenario)
      if (!isBillPayment || (!locationState?.membershipId && !locationState?.billId)) {
        return;
      }

      const membershipId = locationState?.membershipId || locationState?.billId;
      
      try {
        // Fetch user's payment verification requests
        const response = await paymentVerificationService.getUserVerificationRequests();
        
        if (response.success && response.data) {
          // Find pending or rejected payment verification for this membership
          // Priority: pending first (most recent), then rejected
          const allRequests = Array.isArray(response.data) ? response.data : [];
          const previousRequest = allRequests.find((req: any) => 
            req.membershipId === membershipId && req.status === 'pending'
          ) || allRequests.find((req: any) => 
            req.membershipId === membershipId && req.status === 'rejected'
          );

          if (previousRequest) {
            const requestType = previousRequest.status === 'pending' ? 'pending' : 'rejected';
            console.log(`🔍 Found previous ${requestType} payment request:`, previousRequest);
            
            let hasData = false;
            
            // Pre-fill transaction ID if available
            if (previousRequest.transactionId) {
              setTransactionId(previousRequest.transactionId);
              hasData = true;
              console.log('✅ Pre-filled transaction ID:', previousRequest.transactionId);
            }

            // Pre-fill screenshot preview if available
            if (previousRequest.paymentScreenshot || previousRequest.receiptUrl) {
              const screenshotUrl = previousRequest.paymentScreenshot || previousRequest.receiptUrl;
              // Convert URL to preview (we can't convert URL back to File, but we can show preview)
              if (screenshotUrl) {
                // If it's a full URL, use it directly; otherwise construct it
                const fullUrl = screenshotUrl.startsWith('http') 
                  ? screenshotUrl 
                  : `${window.location.origin}/api${screenshotUrl.startsWith('/') ? '' : '/'}${screenshotUrl}`;
                setScreenshotPreview(fullUrl);
                hasData = true;
                console.log('✅ Pre-filled screenshot preview:', fullUrl);
              }
            }

            // Pre-fill payment method if available
            if (previousRequest.paymentMethod) {
              setSelectedPaymentMethod(previousRequest.paymentMethod as PaymentMethod);
              hasData = true;
              console.log('✅ Pre-filled payment method:', previousRequest.paymentMethod);
            }

            if (hasData) {
              setPreviousDataLoaded(true);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching previous payment data:', error);
        // Don't show error to user, just continue without pre-filling
      }
    };

    fetchPreviousPaymentData();
  }, [isBillPayment, locationState]);

  if (!mockMessData || !mockMealPlanData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-foreground mb-2">No Data Found</h2>
          <p className="text-muted-foreground mb-4">Please select a meal plan first.</p>
          <button
            onClick={() => navigate('/user')}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const handleJoinMess = async () => {
    if (!mockMealPlanData) return;
    
    setLoading(true);
    try {
      // Handle bill payment differently from new join requests
      if (isBillPayment) {
        // Validate transaction ID for UPI payments
        if (selectedPaymentMethod === 'upi' && !transactionId.trim()) {
          toast({
            title: 'Transaction ID Required',
            description: 'Please enter your UPI transaction ID to proceed.',
            variant: 'destructive',
          });
          setLoading(false);
          return;
        }

        // Use membershipId as billId for payment request
        const billId = locationState?.billId || locationState?.membershipId;
        
        if (!billId) {
          toast({
            title: 'Payment Error',
            description: 'Unable to identify membership. Please try again.',
            variant: 'destructive',
          });
          setLoading(false);
          return;
        }

        console.log('🚀 Submitting payment request for bill:', {
          billId: billId,
          amount: mockMealPlanData.pricing.amount,
          paymentMethod: selectedPaymentMethod,
          transactionId: selectedPaymentMethod === 'upi' ? transactionId : undefined
        });

        const response = await billingService.submitPaymentRequest(
          billId,
          selectedPaymentMethod,
          paymentScreenshot || undefined,
          selectedPaymentMethod === 'upi' ? transactionId : undefined
        );
        
        if (response.success) {
          toast({
            title: 'Payment Request Submitted',
            description: 'Your payment request has been submitted to the mess owner for approval.',
            variant: 'default',
          });
          navigate('/user/billing');
        } else {
          toast({
            title: 'Payment Request Failed',
            description: response.message || 'Failed to submit payment request. Please try again.',
            variant: 'destructive',
          });
        }
        return;
      }

      // Original logic for new join requests
      console.log('🚀 Processing join mess request:', {
        messId: mockMessData.id,
        mealPlanId: mockMealPlanData.id,
        paymentType: paymentType
      });

      if (paymentType === 'pay_now' && mockMessData.upiId) {
        // Create payment verification request
        const response = await paymentVerificationService.createPaymentVerification({
          messId: mockMessData.id,
          mealPlanId: mockMealPlanData.id,
          amount: mockMealPlanData.pricing.amount,
          paymentMethod: 'upi',
          ...(paymentScreenshot && { paymentScreenshot })
        });
        
        if (response.success) {
          toast({
            title: 'Payment Verification Submitted',
            description: 'Your payment verification request has been submitted successfully! The mess owner will review your payment screenshot and approve your membership.',
            variant: 'default',
          });
          navigate('/user/dashboard', { state: { fromPayment: true } });
        } else {
          toast({
            title: 'Payment Verification Failed',
            description: response.message || 'Failed to submit payment verification. Please try again.',
            variant: 'destructive',
          });
        }
      } else {
        // Pay later - call the backend API directly
        console.log('📝 Calling backend API for pay later request...');
        const response = await messService.joinMess(mockMessData.id, mockMealPlanData.id, paymentType);
        
        if (response.success) {
          // Mark a transient UI flag so dashboard can disable Pay button
          if (paymentType === 'pay_now') {
            try {
              const key = `payment_request_${mockMessData.id}_${mockMealPlanData.id}`;
              localStorage.setItem(key, String(Date.now()));
            } catch {}
          }
          toast({
            title: 'Request Submitted Successfully',
            description: response.message || 'Your request has been submitted to the mess owner for approval.',
            variant: 'default',
          });
          navigate('/user/dashboard', { state: { fromPayment: true } });
        } else {
          toast({
            title: 'Request Failed',
            description: response.message || 'Failed to submit your request. Please try again.',
            variant: 'destructive',
          });
        }
      }
    } catch (error: any) {
      console.error('❌ Error joining mess:', error);
      toast({
        title: 'Request Failed',
        description: error.message || 'An unexpected error occurred. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleScreenshotUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }
      
      setPaymentScreenshot(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setScreenshotPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveScreenshot = () => {
    setPaymentScreenshot(null);
    setScreenshotPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handlePaymentConfirmation = () => {
    setShowPaymentConfirmation(true);
  };

  const handleConfirmPayment = async () => {
    if (!mockMealPlanData) return;
    
    setLoading(true);
    try {
      // Handle bill payment differently from new join requests
      if (isBillPayment) {
        // Validate transaction ID for UPI payments
        if (selectedPaymentMethod === 'upi' && !transactionId.trim()) {
          toast({
            title: 'Transaction ID Required',
            description: 'Please enter your UPI transaction ID to proceed.',
            variant: 'destructive',
          });
          setLoading(false);
          return;
        }

        // Use membershipId as billId for payment request
        const billId = locationState?.billId || locationState?.membershipId;
        
        if (!billId) {
          toast({
            title: 'Payment Error',
            description: 'Unable to identify membership. Please try again.',
            variant: 'destructive',
          });
          setLoading(false);
          return;
        }

        console.log('🚀 Submitting payment request for bill:', {
          billId: billId,
          amount: mockMealPlanData.pricing.amount,
          paymentMethod: selectedPaymentMethod,
          transactionId: selectedPaymentMethod === 'upi' ? transactionId : undefined
        });

        const response = await billingService.submitPaymentRequest(
          billId,
          selectedPaymentMethod,
          paymentScreenshot || undefined,
          selectedPaymentMethod === 'upi' ? transactionId : undefined
        );
        
        if (response.success) {
          toast({
            title: 'Payment Request Submitted',
            description: 'Your payment request has been submitted to the mess owner for approval.',
            variant: 'default',
          });
          navigate('/user/billing');
        } else {
          toast({
            title: 'Payment Request Failed',
            description: response.message || 'Failed to submit payment request. Please try again.',
            variant: 'destructive',
          });
        }
        return;
      }

      // Original logic for new join requests
      console.log('🚀 Confirming payment and joining mess:', {
        messId: mockMessData.id,
        mealPlanId: mockMealPlanData.id,
        paymentType: paymentType
      });

      const response = await messService.joinMess(mockMessData.id, mockMealPlanData.id, paymentType);
      
      if (response.success) {
        // Mark a transient UI flag so dashboard can disable Pay button
        if (paymentType === 'pay_now') {
          try {
            const key = `payment_request_${mockMessData.id}_${mockMealPlanData.id}`;
            localStorage.setItem(key, String(Date.now()));
          } catch {}
        }
        toast({
          title: 'Payment Confirmed',
          description: response.message || 'Your payment has been confirmed and you have successfully joined the mess!',
          variant: 'default',
        });
        navigate('/user/dashboard');
      } else {
        toast({
          title: 'Confirmation Failed',
          description: response.message || 'Failed to confirm your payment. Please try again.',
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      console.error('❌ Error confirming payment:', error);
      toast({
        title: 'Confirmation Failed',
        description: error.message || 'An unexpected error occurred. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getPeriodDisplay = (period: string) => {
    switch (period) {
      case 'day': return 'per day';
      case 'week': return 'per week';
      case 'month': return 'per month';
      case 'year': return 'per year';
      default: return period;
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20 lg:pb-0">
      {/* Mobile Header */}
      <div className="sticky top-0 z-50 bg-card/95 backdrop-blur-sm border-b border-border lg:hidden">
        <div className="flex items-center justify-between p-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-lg hover:bg-accent transition-colors"
          >
            <ArrowLeftIcon className="w-6 h-6 text-foreground" />
          </button>
          <div className="flex-1 text-center px-4">
            <h1 className="text-lg font-bold text-foreground truncate">
              Payment Options
            </h1>
            <p className="text-sm text-muted-foreground truncate">
              {mockMessData.name} - {mockMealPlanData.name}
            </p>
          </div>
          <div className="w-10" /> {/* Spacer for centering */}
        </div>
      </div>

      {/* Desktop Header */}
      <div className="hidden lg:block border-b border-border bg-card">
        <div className="flex items-center justify-between p-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Payment Options</h1>
            <p className="text-muted-foreground">
              {mockMessData.name} - {mockMealPlanData.name}
            </p>
          </div>
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-lg hover:bg-accent transition-colors"
          >
            <XMarkIcon className="w-6 h-6 text-foreground" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 lg:p-6 max-w-4xl mx-auto space-y-6">
        {/* Selected Plan Summary */}
        <div className="bg-card rounded-xl p-6 mb-6 border border-border">
          <h2 className="text-xl font-semibold text-foreground mb-4">Selected Meal Plan</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-foreground mb-2">{mockMealPlanData.name}</h3>
              <p className="text-muted-foreground mb-3">{mockMealPlanData.description}</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Meals per day:</span>
                  <span className="text-foreground">{mockMealPlanData.mealsPerDay}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Type:</span>
                  <span className="text-foreground">{mockMealPlanData.mealType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status:</span>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    mockMealPlanData.isActive 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' 
                      : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                  }`}>
                    {mockMealPlanData.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-primary mb-2">
                ₹{mockMealPlanData.pricing.amount}
              </div>
              <div className="text-muted-foreground">
                {getPeriodDisplay(mockMealPlanData.pricing.period)}
              </div>
            </div>
          </div>
        </div>

        {/* Mess Details Section */}
        <div className="bg-card rounded-xl p-6 mb-6 border border-border">
          <button
            onClick={() => setShowMessInfo(!showMessInfo)}
            className="w-full flex items-center justify-between text-left"
          >
            <h2 className="text-xl font-semibold text-foreground">Mess Information</h2>
            {showMessInfo ? (
              <ChevronUpIcon className="w-6 h-6 text-muted-foreground" />
            ) : (
              <ChevronDownIcon className="w-6 h-6 text-muted-foreground" />
            )}
          </button>
          
          {showMessInfo && (
            <div className="mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-foreground mb-2">{mockMessData.name}</h3>
                <p className="text-muted-foreground mb-3">{mockMessData.description}</p>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center space-x-2">
                  <MapPinIcon className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{mockMessData.address}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <PhoneIcon className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{mockMessData.ownerPhone}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <EnvelopeIcon className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{mockMessData.ownerEmail}</span>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Capacity:</span>
                  <span className="text-foreground">{mockMessData.capacity} members</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Current Members:</span>
                  <span className="text-foreground">{mockMessData.currentMembers}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Owner:</span>
                  <span className="text-foreground">{mockMessData.ownerName}</span>
                </div>
                {mockMessData.rating && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Rating:</span>
                    <span className="text-foreground">{mockMessData.rating}/5</span>
                  </div>
                )}
              </div>
              {mockMessData.types && mockMessData.types.length > 0 && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Mess Types:</p>
                  <div className="flex flex-wrap gap-2">
                    {mockMessData.types.map((type: string, index: number) => (
                      <span
                        key={index}
                        className="px-2 py-1 text-xs bg-primary/10 text-primary rounded-full"
                      >
                        {type}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
              </div>
            </div>
          )}
        </div>

        {/* Plan Rules Section */}
        <div className="bg-card rounded-xl p-6 mb-6 border border-border">
          <button
            onClick={() => setShowPlanRules(!showPlanRules)}
            className="w-full flex items-center justify-between text-left"
          >
            <h2 className="text-xl font-semibold text-foreground">Plan Rules & Policies</h2>
            {showPlanRules ? (
              <ChevronUpIcon className="w-6 h-6 text-muted-foreground" />
            ) : (
              <ChevronDownIcon className="w-6 h-6 text-muted-foreground" />
            )}
          </button>
          
          {showPlanRules && (
            <div className="mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Leave Rules */}
            <div className="space-y-4">
              <h3 className="font-semibold text-foreground mb-3">Leave Management</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Max Leave Days:</span>
                  <span className="text-sm font-medium text-foreground">
                    {mockMealPlanData.leaveRules.maxLeaveDays} days
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Max Leave Meals:</span>
                  <span className="text-sm font-medium text-foreground">
                    {mockMealPlanData.leaveRules.maxLeaveMeals} meals
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Notice Required:</span>
                  <span className="text-sm font-medium text-foreground">
                    {mockMealPlanData.leaveRules.requireTwoHourNotice 
                      ? `${mockMealPlanData.leaveRules.noticeHours} hours` 
                      : 'No notice required'
                    }
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Min Consecutive Days:</span>
                  <span className="text-sm font-medium text-foreground">
                    {mockMealPlanData.leaveRules.minConsecutiveDays} days
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Auto Approval:</span>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    mockMealPlanData.leaveRules.autoApproval 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' 
                      : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                  }`}>
                    {mockMealPlanData.leaveRules.autoApproval ? 'Yes' : 'No'}
                  </span>
                </div>
              </div>
            </div>

            {/* Additional Rules */}
            <div className="space-y-4">
              <h3 className="font-semibold text-foreground mb-3">Additional Policies</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Extend Subscription:</span>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    mockMealPlanData.leaveRules.extendSubscription 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' 
                      : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                  }`}>
                    {mockMealPlanData.leaveRules.extendSubscription ? 'Allowed' : 'Not Allowed'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Leave Limits Enabled:</span>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    mockMealPlanData.leaveRules.leaveLimitsEnabled 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' 
                      : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                  }`}>
                    {mockMealPlanData.leaveRules.leaveLimitsEnabled ? 'Yes' : 'No'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Consecutive Leave:</span>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    mockMealPlanData.leaveRules.consecutiveLeaveEnabled 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' 
                      : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                  }`}>
                    {mockMealPlanData.leaveRules.consecutiveLeaveEnabled ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Max Leave Days Rule:</span>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    mockMealPlanData.leaveRules.maxLeaveDaysEnabled 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' 
                      : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                  }`}>
                    {mockMealPlanData.leaveRules.maxLeaveDaysEnabled ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Max Leave Meals Rule:</span>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    mockMealPlanData.leaveRules.maxLeaveMealsEnabled 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' 
                      : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                  }`}>
                    {mockMealPlanData.leaveRules.maxLeaveMealsEnabled ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </div>
              </div>
            </div>
          )}
        </div>

        {/* Payment Options */}
        <div className="space-y-6">
          {/* Only show PaymentTypeSelector for new join requests, not for bill payments */}
          {!isBillPayment && (
            <PaymentTypeSelector
              selectedType={paymentType}
              onTypeSelect={setPaymentType}
              {...(mockMessData.upiId && { upiId: mockMessData.upiId })}
            />
          )}
          
          {/* Show bill payment info if this is a bill payment */}
          {isBillPayment && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex items-center">
                <CreditCardIcon className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2" />
                <div>
                  <h3 className="font-semibold text-blue-900 dark:text-blue-100">Bill Payment</h3>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    You are paying for your existing subscription. Payment will be sent to mess owner for approval.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Show info message if previous data was loaded */}
          {previousDataLoaded && isBillPayment && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <div className="flex items-start">
                <InformationCircleIcon className="w-5 h-5 text-green-600 dark:text-green-400 mr-2 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-green-900 dark:text-green-100 text-sm mb-1">Previous Data Restored</h3>
                  <p className="text-sm text-green-700 dark:text-green-300">
                    Your previous payment details have been restored. You can update them if needed before resubmitting.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Payment Methods for Pay Now - Show for both bill payments and new join requests */}
          {paymentType === 'pay_now' && (
            <PaymentMethods
              selectedMethod={selectedPaymentMethod}
              onMethodSelect={setSelectedPaymentMethod}
              amount={mockMealPlanData.pricing.amount}
              merchantName={mockMessData.name}
              upiId={mockMessData.upiId}
              loading={loading}
              showUPIQR={!!mockMessData.upiId}
              transactionId={transactionId}
              onTransactionIdChange={setTransactionId}
            />
          )}

          {/* Payment Screenshot Upload - Only show for UPI and Online payments, not for Cash */}
          {paymentType === 'pay_now' && selectedPaymentMethod !== 'cash' && (
            <div className="bg-card rounded-xl p-6 border border-border">
              <h3 className="font-semibold text-foreground mb-4 flex items-center">
                <PhotoIcon className="w-5 h-5 mr-2 text-primary" />
                Upload Payment Screenshot
              </h3>
              
              <div className="space-y-4">
                {/* Simple File Upload */}
                <div
                  onClick={handleFileSelect}
                  className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-primary transition-colors"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleScreenshotUpload}
                    className="hidden"
                  />
                  
                  {screenshotPreview ? (
                    <div className="space-y-3">
                      <img
                        src={screenshotPreview}
                        alt="Payment Screenshot Preview"
                        className="mx-auto max-w-full max-h-48 rounded-lg border border-border"
                      />
                      <div className="flex justify-center space-x-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleFileSelect();
                          }}
                          className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                        >
                          Change Image
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveScreenshot();
                          }}
                          className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center"
                        >
                          <TrashIcon className="w-4 h-4 mr-1" />
                          Remove
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <PhotoIcon className="w-12 h-12 text-muted-foreground mx-auto" />
                      <p className="text-sm text-foreground">
                        Click to upload payment screenshot
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Cash Payment Instructions */}
          {paymentType === 'pay_now' && selectedPaymentMethod === 'cash' && (
            <div className="bg-card rounded-xl p-6 border border-border">
              <h3 className="font-semibold text-foreground mb-4 flex items-center">
                <BanknotesIcon className="w-5 h-5 mr-2 text-purple-500" />
                Cash Payment Instructions
              </h3>
              
              <div className="space-y-4">
                <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
                  <p className="text-sm text-purple-800 dark:text-purple-200 mb-3">
                    <strong>How to pay in cash:</strong>
                  </p>
                  <ul className="text-sm text-purple-700 dark:text-purple-300 space-y-2 list-disc list-inside">
                    <li>Contact the mess owner directly using the details provided above</li>
                    <li>Pay the amount of <strong>₹{mockMealPlanData.pricing.amount}</strong> in cash</li>
                    <li>Get a receipt or confirmation from the mess owner</li>
                    <li>Click "I've Completed Payment" below to confirm your membership</li>
                  </ul>
                </div>
                
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    <strong>Note:</strong> Your membership will be activated once the mess owner confirms your cash payment.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 pt-6">
            <button
              onClick={() => navigate(-1)}
              className="flex-1 px-6 py-3 border border-border rounded-lg text-foreground hover:bg-accent transition-colors"
            >
              Cancel
            </button>
            {/* Button logic for bill payments vs new join requests */}
            {isBillPayment ? (
              // Bill payment buttons
              showPaymentConfirmation ? (
                <button
                  onClick={handleConfirmPayment}
                  disabled={loading}
                  className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Processing...' : 'Confirm Payment'}
                </button>
              ) : (
                <button
                  onClick={handlePaymentConfirmation}
                  disabled={
                    loading || 
                    (selectedPaymentMethod === 'upi' && !transactionId.trim()) ||
                    (selectedPaymentMethod !== 'cash' && selectedPaymentMethod !== 'upi' && !paymentScreenshot)
                  }
                  className="flex-1 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {selectedPaymentMethod === 'cash' 
                    ? "I've Completed Payment" 
                    : selectedPaymentMethod === 'upi'
                      ? (transactionId.trim() ? "I've Completed Payment" : 'Enter Transaction ID First')
                      : paymentScreenshot 
                        ? "I've Completed Payment"
                        : 'Upload Screenshot First'}
                </button>
              )
            ) : (
              // New join request buttons
              paymentType === 'pay_now' && mockMessData.upiId ? (
                showPaymentConfirmation ? (
                  <button
                    onClick={handleConfirmPayment}
                    disabled={loading}
                    className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Processing...' : 'Confirm Payment & Join'}
                  </button>
                ) : (
                  <button
                    onClick={handlePaymentConfirmation}
                    className="flex-1 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors"
                >
                  I've Completed Payment
                </button>
              )
            ) : (
              <button
                onClick={handleJoinMess}
                disabled={
                  loading || 
                  !mockMealPlanData || 
                  (paymentType === 'pay_now' && selectedPaymentMethod !== 'cash' && !paymentScreenshot)
                }
                className="flex-1 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading 
                  ? 'Processing...' 
                  : paymentType === 'pay_now' 
                    ? (selectedPaymentMethod === 'cash' 
                        ? 'Submit Cash Payment & Join' 
                        : (paymentScreenshot ? 'Submit Payment & Join' : 'Upload Screenshot First'))
                    : 'Request Approval'
                }
              </button>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentOptions;
