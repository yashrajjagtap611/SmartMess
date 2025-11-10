import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import messService from '@/services/api/messService';
import type { MealPlan, MealPlanFormData, MealPlanState, MealPlanProps } from './MealPlan.types';
import { 
  getInitialMealPlanFormData, 
  validateMealPlanForm, 
  formatMealPlanForBackend, 
  formatBackendMealPlan,
  getMealPlanErrorMessage 
} from './MealPlan.utils';
import { toast } from '@/hooks/use-toast';

export const useMealPlan = (props?: MealPlanProps) => {
  const [state, setState] = useState<MealPlanState>({
    mealPlans: [],
    isLoading: true,
    error: null,
    deletingPlanId: null,
    currentPlan: null,
  });

  const loadMealPlans = async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      const response = await messService.getMealPlans();
      if (response.success && response.data) {
        const formattedPlans = response.data.map(formatBackendMealPlan);
        setState(prev => ({ 
          ...prev, 
          mealPlans: formattedPlans, 
          isLoading: false 
        }));
      } else {
        setState(prev => ({ 
          ...prev, 
          error: response.message || 'Failed to load meal plans',
          isLoading: false 
        }));
      }
    } catch (error: any) {
      const errorMessage = getMealPlanErrorMessage(error);
      setState(prev => ({ 
        ...prev, 
        error: errorMessage,
        isLoading: false 
      }));
    }
  };

  const createMealPlan = async (formData: MealPlanFormData): Promise<boolean> => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const backendData = formatMealPlanForBackend(formData);
      const response = await messService.createMealPlan(backendData as any);
      
      if (response.success) {
        await loadMealPlans();
        if (props?.onMealPlanCreate) {
          props.onMealPlanCreate(formData);
        }
        return true;
      } else {
        setState(prev => ({ 
          ...prev, 
          error: response.message || 'Failed to create meal plan',
          isLoading: false 
        }));
        return false;
      }
    } catch (error: any) {
      const errorMessage = getMealPlanErrorMessage(error);
      setState(prev => ({ 
        ...prev, 
        error: errorMessage,
        isLoading: false 
      }));
      return false;
    }
  };

  const updateMealPlan = async (id: string, formData: MealPlanFormData): Promise<boolean> => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const backendData = formatMealPlanForBackend(formData);
      const response = await messService.updateMealPlan(id, backendData as any);
      
      if (response.success) {
        await loadMealPlans();
        if (props?.onMealPlanUpdate) {
          props.onMealPlanUpdate(id, formData);
        }
        return true;
      } else {
        setState(prev => ({ 
          ...prev, 
          error: response.message || 'Failed to update meal plan',
          isLoading: false 
        }));
        return false;
      }
    } catch (error: any) {
      const errorMessage = getMealPlanErrorMessage(error);
      setState(prev => ({ 
        ...prev, 
        error: errorMessage,
        isLoading: false 
      }));
      return false;
    }
  };

  const deleteMealPlan = async (id: string): Promise<boolean> => {
    try {
      setState(prev => ({ 
        ...prev, 
        deletingPlanId: id,
        error: null 
      }));
      
      const response = await messService.deleteMealPlan(id);
      
      if (response.success) {
        setState(prev => ({ 
          ...prev, 
          mealPlans: prev.mealPlans.filter(plan => plan._id !== id),
          deletingPlanId: null 
        }));
        
        if (props?.onMealPlanDelete) {
          props.onMealPlanDelete(id);
        }
        return true;
      } else {
        setState(prev => ({ 
          ...prev, 
          error: response.message || 'Failed to delete meal plan',
          deletingPlanId: null 
        }));
        return false;
      }
    } catch (error: any) {
      const errorMessage = getMealPlanErrorMessage(error);
      setState(prev => ({ 
        ...prev, 
        error: errorMessage,
        deletingPlanId: null 
      }));
      return false;
    }
  };

  const loadMealPlanById = async (id: string): Promise<MealPlan | null> => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const response = await messService.getMealPlanById(id);
      if (response.success && response.data) {
        const plan = formatBackendMealPlan(response.data);
        setState(prev => ({ 
          ...prev, 
          currentPlan: plan,
          isLoading: false 
        }));
        return plan;
      } else {
        setState(prev => ({ 
          ...prev, 
          error: response.message || 'Failed to load meal plan',
          isLoading: false 
        }));
        return null;
      }
    } catch (error: any) {
      const errorMessage = getMealPlanErrorMessage(error);
      setState(prev => ({ 
        ...prev, 
        error: errorMessage,
        isLoading: false 
      }));
      return null;
    }
  };

  const clearError = () => {
    setState(prev => ({ ...prev, error: null }));
  };

  useEffect(() => {
    loadMealPlans();
  }, []);

  return {
    // State
    mealPlans: state.mealPlans,
    isLoading: state.isLoading,
    error: state.error,
    deletingPlanId: state.deletingPlanId,
    currentPlan: state.currentPlan,
    
    // Actions
    loadMealPlans,
    createMealPlan,
    updateMealPlan,
    deleteMealPlan,
    loadMealPlanById,
    clearError,
  };
};

export const useMealPlanForm = (planId?: string) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<MealPlanFormData>(getInitialMealPlanFormData());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  // Load plan data when editing
  useEffect(() => {
    if (planId) {
      const loadPlanData = async () => {
        setIsLoading(true);
        try {
          const response = await messService.getMealPlanById(planId);
          if (response.success && response.data) {
            const plan = formatBackendMealPlan(response.data);
            setFormData({
              name: plan.name,
              pricing: plan.pricing,
              mealType: plan.mealType,
              mealsPerDay: plan.mealsPerDay,
              mealOptions: plan.mealOptions,
              description: plan.description,
              isActive: plan.isActive,
              leaveRules: plan.leaveRules
            });
          }
        } catch (error) {
          console.error('Error loading plan data:', error);
        } finally {
          setIsLoading(false);
        }
      };
      loadPlanData();
    }
  }, [planId]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  const handlePricingChange = (field: keyof MealPlanFormData['pricing'], value: any) => {
    setFormData(prev => ({
      ...prev,
      pricing: {
        ...prev.pricing,
        [field]: value,
      },
    }));

    if (errors['pricing']) {
      setErrors(prev => ({
        ...prev,
        pricing: "",
      }));
    }
  };

  const handleLeaveRuleChange = (field: keyof MealPlanFormData['leaveRules'], value: any) => {
    setFormData(prev => {
      const newLeaveRules = {
        ...prev.leaveRules,
        [field]: value,
      };

      // When enabling maxLeaveMealsEnabled, ensure maxLeaveMeals has a valid value
      if (field === 'maxLeaveMealsEnabled' && value === true && newLeaveRules.maxLeaveMeals < 1) {
        console.log('🔧 Auto-fixing maxLeaveMeals from', newLeaveRules.maxLeaveMeals, 'to 30');
        newLeaveRules.maxLeaveMeals = 30;
      }

      // When enabling requireTwoHourNotice, ensure noticeHours has a valid value
      if (field === 'requireTwoHourNotice' && value === true && newLeaveRules.noticeHours < 1) {
        console.log('🔧 Auto-fixing noticeHours from', newLeaveRules.noticeHours, 'to 2');
        newLeaveRules.noticeHours = 2;
      }

      // When enabling consecutiveLeaveEnabled, ensure minConsecutiveDays has a valid value
      if (field === 'consecutiveLeaveEnabled' && value === true && newLeaveRules.minConsecutiveDays < 1) {
        console.log('🔧 Auto-fixing minConsecutiveDays from', newLeaveRules.minConsecutiveDays, 'to 2');
        newLeaveRules.minConsecutiveDays = 2;
      }

      return {
        ...prev,
        leaveRules: newLeaveRules,
      };
    });

    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  const handleMealOptionsChange = (newMealOptions: MealPlanFormData['mealOptions']) => {
    const selectedMealsCount = [newMealOptions.breakfast, newMealOptions.lunch, newMealOptions.dinner].filter(Boolean).length;
    
    setFormData(prev => ({
      ...prev,
      mealOptions: newMealOptions,
      mealsPerDay: selectedMealsCount,
    }));

    if (errors['mealOptions'] || errors['mealsPerDay']) {
      setErrors(prev => ({
        ...prev,
        mealOptions: "",
        mealsPerDay: "",
      }));
    }
  };

  const validateForm = (): boolean => {
    const validationErrors = validateMealPlanForm(formData);
    setErrors(validationErrors);
    const hasErrors = Object.values(validationErrors).some((message) => Boolean(message && message.trim().length > 0));
    return !hasErrors;
  };

  const handleSubmit = async (e: React.FormEvent): Promise<boolean> => {
    e.preventDefault();

    if (validateForm()) {
      setIsLoading(true);

      try {
        const backendData = formatMealPlanForBackend(formData);
        console.log('📤 Sending to backend:', JSON.stringify(backendData, null, 2));
        
        let response;
        if (planId) {
          response = await messService.updateMealPlan(planId, backendData as any);
        } else {
          response = await messService.createMealPlan(backendData as any);
        }

        if (response.success) {
          navigate("/mess-owner/settings/mess-plans");
          return true;
        } else {
          if (response.errors && Array.isArray(response.errors)) {
            toast({
              title: "Validation errors",
              description: response.errors.join("\n"),
              variant: "destructive",
            });
          } else {
            toast({
              title: "Failed to save meal plan",
              description: response.message || "Please try again.",
              variant: "destructive",
            });
          }
          return false;
        }
      } catch (error: any) {
        const errorMessage = getMealPlanErrorMessage(error);
        toast({ title: "Error", description: errorMessage, variant: "destructive" });
        return false;
      } finally {
        setIsLoading(false);
      }
    } else {
      toast({ title: "Please fix the errors in the form", description: "Check highlighted fields.", variant: "destructive" });
      return false;
    }
  };

  const handleCancel = () => {
    navigate("/mess-owner/settings/mess-plans");
  };

  // Note: Auto-calculation disabled since maxLeaveDays field was removed
  // Users must manually set maxLeaveMeals value
  // useEffect(() => {
  //   const calculatedMeals = calculateMaxLeaveMeals(formData.mealsPerDay, formData.leaveRules.maxLeaveDays);
  //   const currentMeals = formData.leaveRules.maxLeaveMeals;
  //   const expectedMeals = formData.mealsPerDay * formData.leaveRules.maxLeaveDays;
  //   
  //   if (Math.abs(currentMeals - expectedMeals) <= 1 || currentMeals === 30) {
  //     setFormData(prev => ({
  //       ...prev,
  //       leaveRules: {
  //         ...prev.leaveRules,
  //         maxLeaveMeals: calculatedMeals,
  //       },
  //     }));
  //   }
  // }, [formData.mealsPerDay, formData.leaveRules.maxLeaveDays]);

  return {
    formData,
    errors,
    isLoading,
    handleInputChange,
    handlePricingChange,
    handleLeaveRuleChange,
    handleMealOptionsChange,
    validateForm,
    handleSubmit,
    handleCancel,
  };
};
