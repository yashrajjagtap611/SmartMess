import { useState, useCallback, useEffect } from 'react';
import { MealManagementState, MealManagementActions, MealPlan, Meal, MealTag, CreateMealData, UpdateMealData } from './MealManagement.types';
import messService from '@/services/api/messService';

export const useMealManagement = (): MealManagementState & MealManagementActions => {
  const [state, setState] = useState<MealManagementState>({
    mealPlans: [], // This will be populated from settings/API
    meals: [],
    tags: [
      { id: '1', name: 'Spicy', color: 'bg-red-100 text-red-800' },
      { id: '2', name: 'Healthy', color: 'bg-green-100 text-green-800' },
      { id: '3', name: 'Quick', color: 'bg-blue-100 text-blue-800' },
      { id: '4', name: 'Traditional', color: 'bg-purple-100 text-purple-800' },
      { id: '5', name: 'Seasonal', color: 'bg-orange-100 text-orange-800' },
    ],
    loading: false,
    error: null,
    selectedMealPlan: null,
    selectedMeal: null,
    showAddMealModal: false,
    showEditMealModal: false,
    showDeleteMealModal: false,
    mealToDelete: null,
  });

  // Fetch meal plans and meals from backend on mount
  useEffect(() => {
    const fetchData = async () => {
      setState(prev => ({ ...prev, loading: true }));
      try {
        // Fetch meal plans
        const mealPlansResponse = await messService.getMealPlans();
        let normalizedMealPlans: MealPlan[] = [];
        
        if (mealPlansResponse.success && mealPlansResponse.data) {
          normalizedMealPlans = mealPlansResponse.data.map((p: any) => ({
            id: p._id,
            name: p.name,
            description: p.description ?? '',
            price: p.pricing?.amount ?? 0,
            mealsPerDay: p.mealsPerDay ?? 0,
            isActive: p.isActive ?? true,
            createdAt: p.createdAt ? new Date(p.createdAt) : new Date(),
            updatedAt: p.updatedAt ? new Date(p.updatedAt) : new Date(),
            mealOptions: p.mealOptions ?? { breakfast: true, lunch: true, dinner: true },
          }));
        }

        // Fetch meals
        const mealsResponse = await messService.getMeals();
        let normalizedMeals: Meal[] = [];
        
        if (mealsResponse.success && mealsResponse.data) {
          normalizedMeals = mealsResponse.data.map((m: any) => ({
            id: m._id,
            name: m.name,
            description: m.description,
            type: m.type,
            category: m.category,
            categories: m.categories || [m.category],
            date: new Date(m.date),
            isAvailable: m.isAvailable ?? true,
            price: m.price ?? 0,
            imageUrl: m.imageUrl,
            tags: m.tags || [],
            associatedMealPlans: m.associatedMealPlans || [],
            nutritionalInfo: m.nutritionalInfo,
            allergens: m.allergens || [],
            preparationTime: m.preparationTime,
            servingSize: m.servingSize,
            createdAt: new Date(m.createdAt),
            updatedAt: new Date(m.updatedAt),
          }));
        }

        setState(prev => ({ 
          ...prev, 
          mealPlans: normalizedMealPlans, 
          meals: normalizedMeals,
          loading: false,
          error: null 
        }));
      } catch (error: any) {
        setState(prev => ({ 
          ...prev, 
          mealPlans: [], 
          meals: [],
          loading: false, 
          error: error.message || 'Failed to load data' 
        }));
      }
    };
    fetchData();
  }, []);

  const createMeal = useCallback(async (mealData: CreateMealData) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      // Prepare API data
      const apiData = {
        name: mealData.name,
        description: mealData.description,
        type: mealData.type,
        category: mealData.category || mealData.categories[0], // Backward compatibility
        categories: mealData.categories,
        date: mealData.date,
        price: mealData.price,
        tags: mealData.tags,
        associatedMealPlans: mealData.associatedMealPlans,
        nutritionalInfo: mealData.nutritionalInfo,
        allergens: mealData.allergens,
        preparationTime: mealData.preparationTime,
        servingSize: mealData.servingSize,
        image: mealData.imageFile,
      };

      const response = await messService.createMeal(apiData);
      
      if (response.success && response.data) {
        const newMeal: Meal = {
          id: response.data._id,
          name: response.data.name,
          description: response.data.description,
          type: response.data.type,
          category: response.data.category,
          categories: response.data.categories || [response.data.category],
          date: new Date(response.data.date),
          isAvailable: response.data.isAvailable ?? true,
          price: response.data.price ?? 0,
          imageUrl: response.data.imageUrl,
          tags: response.data.tags || [],
          associatedMealPlans: response.data.associatedMealPlans || [],
          nutritionalInfo: response.data.nutritionalInfo,
          allergens: response.data.allergens || [],
          preparationTime: response.data.preparationTime,
          servingSize: response.data.servingSize,
          createdAt: new Date(response.data.createdAt),
          updatedAt: new Date(response.data.updatedAt),
        };

        setState(prev => ({
          ...prev,
          meals: [...prev.meals, newMeal],
          loading: false,
          showAddMealModal: false,
        }));
      } else {
        throw new Error(response.message || 'Failed to create meal');
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to create meal',
        loading: false,
      }));
      throw error;
    }
  }, [state.tags]);

  const updateMeal = useCallback(async (id: string, mealData: UpdateMealData) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const response = await messService.updateMeal(id, mealData);
      
      if (response.success && response.data) {
        const updatedMeal: Meal = {
          id: response.data._id,
          name: response.data.name,
          description: response.data.description,
          type: response.data.type,
          category: response.data.category,
          categories: response.data.categories || [response.data.category],
          date: new Date(response.data.date),
          isAvailable: response.data.isAvailable ?? true,
          price: response.data.price ?? 0,
          imageUrl: response.data.imageUrl,
          tags: response.data.tags || [],
          associatedMealPlans: response.data.associatedMealPlans || [],
          nutritionalInfo: response.data.nutritionalInfo,
          allergens: response.data.allergens || [],
          preparationTime: response.data.preparationTime,
          servingSize: response.data.servingSize,
          createdAt: new Date(response.data.createdAt),
          updatedAt: new Date(response.data.updatedAt),
        };

        setState(prev => ({
          ...prev,
          meals: prev.meals.map(m => m.id === id ? updatedMeal : m),
          loading: false,
          showEditMealModal: false,
        }));
      } else {
        throw new Error(response.message || 'Failed to update meal');
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to update meal',
        loading: false,
      }));
      throw error;
    }
  }, []);

  const deleteMeal = useCallback(async (id: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const response = await messService.deleteMeal(id);
      
      if (response.success) {
        setState(prev => ({
          ...prev,
          meals: prev.meals.filter(m => m.id !== id),
          loading: false,
          showDeleteMealModal: false,
          mealToDelete: null,
        }));
      } else {
        throw new Error(response.message || 'Failed to delete meal');
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to delete meal',
        loading: false,
      }));
      throw error;
    }
  }, []);

  const createTag = useCallback(async (tag: Omit<MealTag, 'id'>) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      // TODO: Implement API call
      const newTag: MealTag = {
        ...tag,
        id: Date.now().toString(),
      };
      setState(prev => ({
        ...prev,
        tags: [...prev.tags, newTag],
        loading: false,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to create tag',
        loading: false,
      }));
    }
  }, []);

  const updateTag = useCallback(async (id: string, tag: Partial<MealTag>) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      // TODO: Implement API call
      setState(prev => ({
        ...prev,
        tags: prev.tags.map(t => 
          t.id === id ? { ...t, ...tag } : t
        ),
        loading: false,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to update tag',
        loading: false,
      }));
    }
  }, []);

  const deleteTag = useCallback(async (id: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      // TODO: Implement API call
      setState(prev => ({
        ...prev,
        tags: prev.tags.filter(t => t.id !== id),
        loading: false,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to delete tag',
        loading: false,
      }));
    }
  }, []);

  const setSelectedMealPlan = useCallback((plan: MealPlan | null) => {
    setState(prev => ({ ...prev, selectedMealPlan: plan }));
  }, []);

  const setSelectedMeal = useCallback((meal: Meal | null) => {
    setState(prev => ({ ...prev, selectedMeal: meal }));
  }, []);

  const setShowAddMealModal = useCallback((show: boolean) => {
    setState(prev => ({ ...prev, showAddMealModal: show }));
  }, []);

  const setShowEditMealModal = useCallback((show: boolean) => {
    setState(prev => ({ ...prev, showEditMealModal: show }));
  }, []);

  const setShowDeleteMealModal = useCallback((show: boolean) => {
    setState(prev => ({ ...prev, showDeleteMealModal: show }));
  }, []);

  const setMealToDelete = useCallback((meal: Meal | null) => {
    setState(prev => ({ ...prev, mealToDelete: meal }));
  }, []);

  // Placeholder functions for meal plan management (these will be handled in settings)
  const createMealPlan = useCallback(async () => {
    // This function is kept for compatibility but should not be used
    console.warn('Meal plan creation is handled in the settings section');
  }, []);

  const updateMealPlan = useCallback(async () => {
    // This function is kept for compatibility but should not be used
    console.warn('Meal plan updates are handled in the settings section');
  }, []);

  const deleteMealPlan = useCallback(async () => {
    // This function is kept for compatibility but should not be used
    console.warn('Meal plan deletion is handled in the settings section');
  }, []);

  return {
    ...state,
    createMealPlan,
    updateMealPlan,
    deleteMealPlan,
    createMeal,
    updateMeal,
    deleteMeal,
    createTag,
    updateTag,
    deleteTag,
    setSelectedMealPlan,
    setSelectedMeal,
    setShowAddMealModal,
    setShowEditMealModal,
    setShowDeleteMealModal,
    setMealToDelete,
  };
};
