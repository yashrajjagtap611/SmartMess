import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import adminService from '@/services/api/adminService';
import type { DefaultMealPlan, DefaultMealPlanFormData, DefaultMealPlanState, DefaultMealPlanProps } from './DefaultMealPlans.types';
import { 
  getInitialDefaultMealPlanFormData, 
  validateDefaultMealPlanForm, 
  formatDefaultMealPlanForBackend, 
  formatBackendDefaultMealPlan,
  getDefaultMealPlanErrorMessage 
} from './DefaultMealPlans.utils';
import { toast } from '@/hooks/use-toast';

export const useDefaultMealPlans = (props?: DefaultMealPlanProps) => {
  const [state, setState] = useState<DefaultMealPlanState>({
    defaultMealPlans: [],
    isLoading: true,
    error: null,
    deletingPlanId: null,
    currentPlan: null,
    generatingForMess: false,
    generatingForAllMesses: false,
  });

  const loadDefaultMealPlans = async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      const response = await adminService.getDefaultMealPlans();
      if (response.success && response.data) {
        const formattedPlans = response.data.map(formatBackendDefaultMealPlan);
        setState(prev => ({ 
          ...prev, 
          defaultMealPlans: formattedPlans, 
          isLoading: false 
        }));
      } else {
        setState(prev => ({ 
          ...prev, 
          error: response.message || 'Failed to load default meal plans',
          isLoading: false 
        }));
      }
    } catch (error: any) {
      const errorMessage = getDefaultMealPlanErrorMessage(error);
      setState(prev => ({ 
        ...prev, 
        error: errorMessage,
        isLoading: false 
      }));
    }
  };

  const createDefaultMealPlan = async (formData: DefaultMealPlanFormData): Promise<boolean> => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const backendData = formatDefaultMealPlanForBackend(formData);
      const response = await adminService.createDefaultMealPlan(backendData as any);
      
      if (response.success) {
        await loadDefaultMealPlans();
        if (props?.onDefaultMealPlanCreate) {
          props.onDefaultMealPlanCreate(formData);
        }
        return true;
      } else {
        setState(prev => ({ 
          ...prev, 
          error: response.message || 'Failed to create default meal plan',
          isLoading: false 
        }));
        return false;
      }
    } catch (error: any) {
      const errorMessage = getDefaultMealPlanErrorMessage(error);
      setState(prev => ({ 
        ...prev, 
        error: errorMessage,
        isLoading: false 
      }));
      return false;
    }
  };

  const updateDefaultMealPlan = async (id: string, formData: DefaultMealPlanFormData): Promise<boolean> => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const backendData = formatDefaultMealPlanForBackend(formData);
      const response = await adminService.updateDefaultMealPlan(id, backendData as any);
      
      if (response.success) {
        await loadDefaultMealPlans();
        if (props?.onDefaultMealPlanUpdate) {
          props.onDefaultMealPlanUpdate(id, formData);
        }
        return true;
      } else {
        setState(prev => ({ 
          ...prev, 
          error: response.message || 'Failed to update default meal plan',
          isLoading: false 
        }));
        return false;
      }
    } catch (error: any) {
      const errorMessage = getDefaultMealPlanErrorMessage(error);
      setState(prev => ({ 
        ...prev, 
        error: errorMessage,
        isLoading: false 
      }));
      return false;
    }
  };

  const deleteDefaultMealPlan = async (id: string): Promise<boolean> => {
    try {
      setState(prev => ({ 
        ...prev, 
        deletingPlanId: id,
        error: null 
      }));
      
      const response = await adminService.deleteDefaultMealPlan(id);
      
      if (response.success) {
        setState(prev => ({ 
          ...prev, 
          defaultMealPlans: prev.defaultMealPlans.filter(plan => plan._id !== id),
          deletingPlanId: null 
        }));
        
        if (props?.onDefaultMealPlanDelete) {
          props.onDefaultMealPlanDelete(id);
        }
        return true;
      } else {
        setState(prev => ({ 
          ...prev, 
          error: response.message || 'Failed to delete default meal plan',
          deletingPlanId: null 
        }));
        return false;
      }
    } catch (error: any) {
      const errorMessage = getDefaultMealPlanErrorMessage(error);
      setState(prev => ({ 
        ...prev, 
        error: errorMessage,
        deletingPlanId: null 
      }));
      return false;
    }
  };

  const generateMealPlansForMess = async (messId: string): Promise<boolean> => {
    try {
      setState(prev => ({ ...prev, generatingForMess: true, error: null }));
      
      const response = await adminService.generateMealPlansForMess(messId);
      
      if (response.success) {
        toast({
          title: "Success",
          description: response.message,
        });
        return true;
      } else {
        setState(prev => ({ 
          ...prev, 
          error: response.message || 'Failed to generate meal plans for mess',
          generatingForMess: false 
        }));
        return false;
      }
    } catch (error: any) {
      const errorMessage = getDefaultMealPlanErrorMessage(error);
      setState(prev => ({ 
        ...prev, 
        error: errorMessage,
        generatingForMess: false 
      }));
      return false;
    }
  };

  const generateMealPlansForAllMesses = async (): Promise<boolean> => {
    try {
      setState(prev => ({ ...prev, generatingForAllMesses: true, error: null }));
      
      const response = await adminService.generateMealPlansForAllMesses();
      
      if (response.success) {
        toast({
          title: "Success",
          description: response.message,
        });
        return true;
      } else {
        setState(prev => ({ 
          ...prev, 
          error: response.message || 'Failed to generate meal plans for all messes',
          generatingForAllMesses: false 
        }));
        return false;
      }
    } catch (error: any) {
      const errorMessage = getDefaultMealPlanErrorMessage(error);
      setState(prev => ({ 
        ...prev, 
        error: errorMessage,
        generatingForAllMesses: false 
      }));
      return false;
    }
  };

  const loadDefaultMealPlanById = async (id: string): Promise<DefaultMealPlan | null> => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const response = await adminService.getDefaultMealPlan(id);
      if (response.success && response.data) {
        const formattedPlan = formatBackendDefaultMealPlan(response.data);
        setState(prev => ({ 
          ...prev, 
          currentPlan: formattedPlan,
          isLoading: false 
        }));
        return formattedPlan;
      } else {
        setState(prev => ({ 
          ...prev, 
          error: response.message || 'Failed to load default meal plan',
          isLoading: false 
        }));
        return null;
      }
    } catch (error: any) {
      const errorMessage = getDefaultMealPlanErrorMessage(error);
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
    loadDefaultMealPlans();
  }, []);

  return {
    // State
    defaultMealPlans: state.defaultMealPlans,
    isLoading: state.isLoading,
    error: state.error,
    deletingPlanId: state.deletingPlanId,
    currentPlan: state.currentPlan,
    generatingForMess: state.generatingForMess,
    generatingForAllMesses: state.generatingForAllMesses,
    
    // Actions
    loadDefaultMealPlans,
    createDefaultMealPlan,
    updateDefaultMealPlan,
    deleteDefaultMealPlan,
    loadDefaultMealPlanById,
    generateMealPlansForMess,
    generateMealPlansForAllMesses,
    clearError,
  };
};

export const useDefaultMealPlanForm = (planId?: string) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<DefaultMealPlanFormData>(getInitialDefaultMealPlanFormData());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  // Load plan data when editing
  useEffect(() => {
    if (planId) {
      const loadPlanData = async () => {
        setIsLoading(true);
        try {
          const response = await adminService.getDefaultMealPlan(planId);
          if (response.success && response.data) {
            const plan = formatBackendDefaultMealPlan(response.data);
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

  const handlePricingChange = (field: keyof DefaultMealPlanFormData['pricing'], value: any) => {
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

  const handleLeaveRuleChange = (field: keyof DefaultMealPlanFormData['leaveRules'], value: any) => {
    setFormData(prev => {
      const newLeaveRules = {
        ...prev.leaveRules,
        [field]: value,
      };

      // When enabling maxLeaveMealsEnabled, ensure maxLeaveMeals has a valid value
      if (field === 'maxLeaveMealsEnabled' && value === true && newLeaveRules.maxLeaveMeals < 1) {
        console.log('🔧 [ADMIN] Auto-fixing maxLeaveMeals from', newLeaveRules.maxLeaveMeals, 'to 30');
        newLeaveRules.maxLeaveMeals = 30;
      }

      // When enabling requireTwoHourNotice, ensure noticeHours has a valid value
      if (field === 'requireTwoHourNotice' && value === true && newLeaveRules.noticeHours < 1) {
        console.log('🔧 [ADMIN] Auto-fixing noticeHours from', newLeaveRules.noticeHours, 'to 2');
        newLeaveRules.noticeHours = 2;
      }

      // When enabling consecutiveLeaveEnabled, ensure minConsecutiveDays has a valid value
      if (field === 'consecutiveLeaveEnabled' && value === true && newLeaveRules.minConsecutiveDays < 1) {
        console.log('🔧 [ADMIN] Auto-fixing minConsecutiveDays from', newLeaveRules.minConsecutiveDays, 'to 2');
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

  const validateForm = (): boolean => {
    const validationErrors = validateDefaultMealPlanForm(formData);
    setErrors(validationErrors);
    const hasErrors = Object.values(validationErrors).some((message) => Boolean(message && message.trim().length > 0));
    return !hasErrors;
  };

  const handleSubmit = async (e: React.FormEvent): Promise<boolean> => {
    e.preventDefault();

    // Prevent double submission
    if (isLoading) {
      console.log('Form submission blocked - already loading');
      return false;
    }

    console.log('Form submission started', { planId, formData: { name: formData.name } });

    if (validateForm()) {
      setIsLoading(true);

      try {
        const backendData = formatDefaultMealPlanForBackend(formData);
        
        let response;
        if (planId) {
          console.log('Updating existing plan:', planId);
          response = await adminService.updateDefaultMealPlan(planId, backendData as any);
        } else {
          console.log('Creating new plan');
          response = await adminService.createDefaultMealPlan(backendData as any);
        }

        if (response.success) {
          // Don't navigate here, let the parent component handle it
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
              title: "Failed to save default meal plan",
              description: response.message || "Please try again.",
              variant: "destructive",
            });
          }
          return false;
        }
      } catch (error: any) {
        const errorMessage = getDefaultMealPlanErrorMessage(error);
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
    navigate("/admin/default-meal-plans");
  };

  // Note: Auto-calculation disabled since maxLeaveDays field was removed
  // Users must manually set maxLeaveMeals value
  // useEffect(() => {
  //   const calculatedMeals = calculateMaxLeaveMeals(formData.mealsPerDay, formData.leaveRules.maxLeaveDays);
  //   if (formData.leaveRules.maxLeaveMeals === (formData.mealsPerDay * (formData.leaveRules.maxLeaveDays - 1)) || 
  //       formData.leaveRules.maxLeaveMeals === (formData.mealsPerDay * (formData.leaveRules.maxLeaveDays + 1))) {
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
    validateForm,
    handleSubmit,
    handleCancel,
  };
};
