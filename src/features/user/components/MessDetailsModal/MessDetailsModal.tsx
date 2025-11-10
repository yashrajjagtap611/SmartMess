import React, { useEffect } from 'react';
import { 
  XMarkIcon, 
  MapPinIcon, 
  PhoneIcon, 
  EnvelopeIcon,
  UserGroupIcon,
  StarIcon,
  ExclamationTriangleIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';
import { useTheme } from '@/components/theme/theme-provider';
import { useNavigate } from 'react-router-dom';

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

interface MessDetailsModalProps {
  mess: MessDetails | null;
  isOpen: boolean;
  onClose: () => void;
}

const MessDetailsModal: React.FC<MessDetailsModalProps> = ({ 
  mess, 
  isOpen, 
  onClose
}) => {
  const { isDarkTheme: isDarkMode } = useTheme();
  const navigate = useNavigate();

  // Handle body scroll locking when modal is open
  useEffect(() => {
    if (isOpen) {
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
      // Add padding to prevent layout shift
      document.body.style.paddingRight = '0px';
    } else {
      // Restore body scroll when modal is closed
      document.body.style.overflow = 'unset';
      document.body.style.paddingRight = '0px';
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = 'unset';
      document.body.style.paddingRight = '0px';
    };
  }, [isOpen]);

  // Handle keyboard events
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !mess) return null;

  const handleMealPlanSelect = (plan: MealPlan) => {
    // Automatically navigate to Payment Options page with mess and selected plan data
    navigate('/user/payment-options', {
      state: {
        mess: mess,
        selectedMealPlan: plan
      }
    });
    onClose();
  };


  // const generateUPILink = (amount: number, upiId: string) => {
  //   return `upi://pay?pa=${upiId}&pn=${mess.name}&am=${amount}&cu=INR`;
  // };

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
    <div 
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 pb-20 lg:pb-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      aria-describedby="modal-description"
    >
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm z-[60]"
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Modal */}
      <div className={`relative w-full max-w-4xl max-h-[85vh] lg:max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl z-[61] ${
        isDarkMode 
          ? 'bg-SmartMess-light-surface dark:SmartMess-dark-surface border SmartMess-light-border dark:SmartMess-dark-SmartMess-light-border dark:SmartMess-dark-border' 
          : 'bg-SmartMess-light-surface dark:SmartMess-dark-surface border SmartMess-light-border dark:SmartMess-dark-SmartMess-light-border dark:SmartMess-dark-border'
      }`}>
        {/* Mobile Header - Common Layout */}
        <div className="sticky top-0 z-10 bg-SmartMess-light-surface dark:SmartMess-dark-surface dark:bg-SmartMess-light-surface dark:SmartMess-dark-surface border-b SmartMess-light-border dark:SmartMess-dark-SmartMess-light-border dark:SmartMess-dark-border dark:SmartMess-light-border dark:SmartMess-dark-SmartMess-light-border dark:SmartMess-dark-border rounded-t-2xl">
          {/* Mobile Header */}
          <div className="flex items-center justify-between p-4 lg:hidden">
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-SmartMess-light-hover dark:SmartMess-dark-hover dark:hover:bg-SmartMess-light-hover dark:SmartMess-dark-hover transition-colors"
            >
              <ArrowLeftIcon className="w-6 h-6 text-SmartMess-light-text dark:SmartMess-dark-text dark:text-SmartMess-light-text dark:SmartMess-dark-text" />
            </button>
            <div className="flex-1 text-center px-4">
              <h2 
                id="modal-title"
                className="text-lg font-bold text-SmartMess-light-text dark:SmartMess-dark-text dark:text-SmartMess-light-text dark:SmartMess-dark-text truncate"
              >
                {mess.name}
              </h2>
              <p 
                id="modal-description"
                className="text-sm text-SmartMess-light-text dark:SmartMess-dark-text-muted dark:text-SmartMess-light-text dark:SmartMess-dark-text-muted truncate"
              >
                {mess.description}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-SmartMess-light-hover dark:SmartMess-dark-hover dark:hover:bg-SmartMess-light-hover dark:SmartMess-dark-hover transition-colors"
            >
              <XMarkIcon className="w-6 h-6 text-SmartMess-light-text dark:SmartMess-dark-text dark:text-SmartMess-light-text dark:SmartMess-dark-text" />
            </button>
          </div>
          
          {/* Desktop Header */}
          <div className="hidden lg:flex items-center justify-between p-6">
            <div>
              <h2 
                id="modal-title-desktop"
                className="text-2xl font-bold text-SmartMess-light-text dark:SmartMess-dark-text dark:text-SmartMess-light-text dark:SmartMess-dark-text"
              >
                {mess.name}
              </h2>
              <p 
                id="modal-description-desktop"
                className="text-SmartMess-light-text dark:SmartMess-dark-text-muted dark:text-SmartMess-light-text dark:SmartMess-dark-text-muted"
              >
                {mess.description}
              </p>
            </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-SmartMess-light-hover dark:SmartMess-dark-hover dark:hover:bg-SmartMess-light-hover dark:SmartMess-dark-hover transition-colors"
          >
            <XMarkIcon className="w-6 h-6 text-SmartMess-light-text dark:SmartMess-dark-text dark:text-SmartMess-light-text dark:SmartMess-dark-text" />
          </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 lg:p-6 space-y-4 lg:space-y-6">
          {/* Mess Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Info */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <MapPinIcon className="w-5 h-5 text-SmartMess-light-primary dark:SmartMess-dark-primary dark:text-SmartMess-light-primary dark:SmartMess-dark-primary" />
                <div>
                  <p className="text-sm text-SmartMess-light-text dark:SmartMess-dark-text-muted dark:text-SmartMess-light-text dark:SmartMess-dark-text-muted">Address</p>
                  <p className="font-medium text-SmartMess-light-text dark:SmartMess-dark-text dark:text-SmartMess-light-text dark:SmartMess-dark-text">{mess.address}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <UserGroupIcon className="w-5 h-5 text-SmartMess-light-primary dark:SmartMess-dark-primary dark:text-SmartMess-light-primary dark:SmartMess-dark-primary" />
                <div>
                  <p className="text-sm text-SmartMess-light-text dark:SmartMess-dark-text-muted dark:text-SmartMess-light-text dark:SmartMess-dark-text-muted">Capacity</p>
                  <p className="font-medium text-SmartMess-light-text dark:SmartMess-dark-text dark:text-SmartMess-light-text dark:SmartMess-dark-text">
                    {mess.currentMembers}/{mess.capacity} members
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <PhoneIcon className="w-5 h-5 text-SmartMess-light-primary dark:SmartMess-dark-primary dark:text-SmartMess-light-primary dark:SmartMess-dark-primary" />
                <div>
                  <p className="text-sm text-SmartMess-light-text dark:SmartMess-dark-text-muted dark:text-SmartMess-light-text dark:SmartMess-dark-text-muted">Contact</p>
                  <p className="font-medium text-SmartMess-light-text dark:SmartMess-dark-text dark:text-SmartMess-light-text dark:SmartMess-dark-text">{mess.ownerPhone}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <EnvelopeIcon className="w-5 h-5 text-SmartMess-light-primary dark:SmartMess-dark-primary dark:text-SmartMess-light-primary dark:SmartMess-dark-primary" />
                <div>
                  <p className="text-sm text-SmartMess-light-text dark:SmartMess-dark-text-muted dark:text-SmartMess-light-text dark:SmartMess-dark-text-muted">Email</p>
                  <p className="font-medium text-SmartMess-light-text dark:SmartMess-dark-text dark:text-SmartMess-light-text dark:SmartMess-dark-text">{mess.ownerEmail}</p>
                </div>
              </div>
            </div>

            {/* Mess Types & Rating */}
            <div className="space-y-4">
              <div>
                <p className="text-sm text-SmartMess-light-text dark:SmartMess-dark-text-muted dark:text-SmartMess-light-text dark:SmartMess-dark-text-muted mb-2">Mess Types</p>
                <div className="flex flex-wrap gap-2">
                  {mess.types.map((type, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 text-sm bg-SmartMess-light-accent dark:SmartMess-dark-accent dark:bg-SmartMess-light-hover dark:SmartMess-dark-hover text-SmartMess-light-text dark:SmartMess-dark-text dark:text-SmartMess-light-text dark:SmartMess-dark-text rounded-full"
                    >
                      {type}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm text-SmartMess-light-text dark:SmartMess-dark-text-muted dark:text-SmartMess-light-text dark:SmartMess-dark-text-muted mb-2">Nearby Colleges</p>
                <div className="flex flex-wrap gap-2">
                  {mess.colleges.map((college, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 text-sm bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-full"
                    >
                      {college}
                    </span>
                  ))}
                </div>
              </div>

              {mess.rating && (
                <div className="flex items-center space-x-2">
                  <StarIcon className="w-5 h-5 text-yellow-500" />
                  <span className="font-medium text-SmartMess-light-text dark:SmartMess-dark-text dark:text-SmartMess-light-text dark:SmartMess-dark-text">
                    {mess.rating} ({mess.reviews} reviews)
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Meal Plans */}
          <div>
            <h3 className="text-xl font-semibold text-SmartMess-light-text dark:SmartMess-dark-text dark:text-SmartMess-light-text dark:SmartMess-dark-text mb-4">
              Available Meal Plans
            </h3>
            {(mess.mealPlans && mess.mealPlans.length > 0) ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {mess.mealPlans.map((plan) => (
                  <div
                    key={plan.id}
                    className="p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:border-brand-primary/50 hover:bg-brand-primary/5 SmartMess-light-border dark:SmartMess-dark-SmartMess-light-border dark:SmartMess-dark-border dark:SmartMess-light-border dark:SmartMess-dark-SmartMess-light-border dark:SmartMess-dark-border"
                    onClick={() => handleMealPlanSelect(plan)}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-SmartMess-light-text dark:SmartMess-dark-text dark:text-SmartMess-light-text dark:SmartMess-dark-text">
                        {plan.name}
                      </h4>
                      <div className="text-sm text-muted-foreground">
                        Click to select
                      </div>
                    </div>
                    
                    <p className="text-sm text-SmartMess-light-text dark:SmartMess-dark-text-muted dark:text-SmartMess-light-text dark:SmartMess-dark-text-muted mb-3">
                      {plan.description}
                    </p>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between">
                        <span className="text-sm text-SmartMess-light-text dark:SmartMess-dark-text-muted dark:text-SmartMess-light-text dark:SmartMess-dark-text-muted">Price:</span>
                        <span className="font-semibold text-SmartMess-light-primary dark:SmartMess-dark-primary dark:text-SmartMess-light-primary dark:SmartMess-dark-primary">
                          ₹{plan.pricing.amount} {getPeriodDisplay(plan.pricing.period)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-SmartMess-light-text dark:SmartMess-dark-text-muted dark:text-SmartMess-light-text dark:SmartMess-dark-text-muted">Meals per day:</span>
                        <span className="font-medium text-SmartMess-light-text dark:SmartMess-dark-text dark:text-SmartMess-light-text dark:SmartMess-dark-text">
                          {plan.mealsPerDay}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-SmartMess-light-text dark:SmartMess-dark-text-muted dark:text-SmartMess-light-text dark:SmartMess-dark-text-muted">Type:</span>
                        <span className="font-medium text-SmartMess-light-text dark:SmartMess-dark-text dark:text-SmartMess-light-text dark:SmartMess-dark-text">
                          {plan.mealType}
                        </span>
                      </div>
                    </div>

                    {/* Leave Rules */}
                    <div className="border-t SmartMess-light-border dark:SmartMess-dark-SmartMess-light-border dark:SmartMess-dark-border dark:SmartMess-light-border dark:SmartMess-dark-SmartMess-light-border dark:SmartMess-dark-border pt-3">
                      <p className="text-xs font-medium text-SmartMess-light-text dark:SmartMess-dark-text-muted dark:text-SmartMess-light-text dark:SmartMess-dark-text-muted mb-2">
                        Leave Rules:
                      </p>
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between">
                          <span>Max Leave Days:</span>
                          <span>{plan.leaveRules.maxLeaveDays}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Notice Required:</span>
                          <span>{plan.leaveRules.requireTwoHourNotice ? `${plan.leaveRules.noticeHours}h` : 'No'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Auto Approval:</span>
                          <span>{plan.leaveRules.autoApproval ? 'Yes' : 'No'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <ExclamationTriangleIcon className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
                <h4 className="font-semibold text-SmartMess-light-text dark:SmartMess-dark-text dark:text-SmartMess-light-text dark:SmartMess-dark-text mb-2">
                  No Meal Plans Available
                </h4>
                <p className="text-sm text-SmartMess-light-text dark:SmartMess-dark-text-muted dark:text-SmartMess-light-text dark:SmartMess-dark-text-muted mb-3">
                  This mess owner hasn't created any meal plans yet.
                </p>
                <p className="text-xs text-SmartMess-light-text dark:SmartMess-dark-text-muted dark:text-SmartMess-light-text dark:SmartMess-dark-text-muted">
                  Please contact the mess owner to create meal plans before joining.
                </p>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default MessDetailsModal; 