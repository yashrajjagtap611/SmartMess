import React, { useState, useRef, useMemo, useEffect } from 'react';
import { Meal, MealPlan, MealTag, CreateMealData, UpdateMealData, MealType, MealCategory } from '../MealManagement.types';
import { validateMealData } from '../MealManagement.utils';
import { formatDateForComparison, normalizeDate } from '@/utils/dateUtils';

interface AddMealModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (mealData: CreateMealData) => Promise<void>;
  onUpdate?: (id: string, mealData: UpdateMealData) => Promise<void>;
  mealPlans: MealPlan[];
  tags: MealTag[];
  loading?: boolean;
  initialDate?: Date;
  initialMealType?: MealType;
  editMeal?: Meal | null; // For edit mode
}

interface MealItem {
  id: string;
  name: string;
  description: string;
  tags: MealTag[];
  imageFile?: File | undefined;
  imagePreview?: string;
}

export const AddMealModal: React.FC<AddMealModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  onUpdate,
  mealPlans,
  tags,
  loading = false,
  initialDate = new Date(),
  initialMealType = 'breakfast',
  editMeal = null,
}) => {
  const isEditMode = !!editMeal;
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: initialMealType,
    categories: ['vegetarian'] as MealCategory[],
    date: formatDateForComparison(initialDate),
    tags: [] as MealTag[],
    associatedMealPlans: [] as string[],
    servingSize: '',
    isAvailable: true,
  });

  const [mealItems, setMealItems] = useState<MealItem[]>([]);
  const [newItemName, setNewItemName] = useState('');
  const [newItemDescription, setNewItemDescription] = useState('');
  const [newItemTags, setNewItemTags] = useState<MealTag[]>([]);
  const [newItemImageFile, setNewItemImageFile] = useState<File | null>(null);
  const [newItemImagePreview, setNewItemImagePreview] = useState<string>('');
  
  // For edit mode - single meal editing
  const [editImageFile, setEditImageFile] = useState<File | null>(null);
  const [editImagePreview, setEditImagePreview] = useState<string>('');

  const [errors, setErrors] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Only plans supporting selected meal type
  const eligibleMealPlans = useMemo(() => {
    return (mealPlans || []).filter((p) => {
      const opts = p.mealOptions || { breakfast: true, lunch: true, dinner: true };
      if (formData.type === 'breakfast') return !!opts.breakfast;
      if (formData.type === 'lunch') return !!opts.lunch;
      if (formData.type === 'dinner') return !!opts.dinner;
      return true;
    });
  }, [mealPlans, formData.type]);

  // Initialize form data for edit mode
  useEffect(() => {
    if (editMeal) {
      // Ensure we have a valid date
      const mealDate = editMeal.date instanceof Date ? editMeal.date : new Date(editMeal.date);
      const dateString = formatDateForComparison(mealDate);
      
      setFormData({
        name: editMeal.name,
        description: editMeal.description || '',
        type: editMeal.type,
        categories: editMeal.categories || [editMeal.category],
        date: dateString,
        tags: editMeal.tags,
        associatedMealPlans: editMeal.associatedMealPlans,
        servingSize: editMeal.servingSize || '',
        isAvailable: editMeal.isAvailable,
      });
      setEditImagePreview(editMeal.imageUrl || '');
    }
  }, [editMeal]);

  // Update form data when initialDate changes
  useEffect(() => {
    if (!isEditMode && initialDate) {
      const dateString = formatDateForComparison(initialDate);
      setFormData(prev => ({
        ...prev,
        date: dateString,
      }));
    }
  }, [initialDate, isEditMode]);

  // Cleanup any previously selected plans that are no longer eligible when type changes
  useEffect(() => {
    if (!isEditMode) {
      setFormData(prev => ({
        ...prev,
        associatedMealPlans: prev.associatedMealPlans.filter(id => eligibleMealPlans.some(p => p.id === id)),
      }));
    }
  }, [eligibleMealPlans, isEditMode]);

  const mealTypes: { value: MealType; label: string; icon: string }[] = [
    { value: 'breakfast', label: 'Breakfast', icon: '🌅' },
    { value: 'lunch', label: 'Lunch', icon: '☀️' },
    { value: 'dinner', label: 'Dinner', icon: '🌙' },
  ];

  const mealCategories: { value: MealCategory; label: string; icon: string }[] = [
    { value: 'vegetarian', label: 'Vegetarian', icon: '🥬' },
    { value: 'non-vegetarian', label: 'Non-Vegetarian', icon: '🍗' },
    { value: 'vegan', label: 'Vegan', icon: '🌱' },
    { value: 'jain', label: 'Jain', icon: '🕉️' },
    { value: 'eggetarian', label: 'Eggetarian', icon: '🥚' },
  ];

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
    if (errors.length > 0) setErrors([]);
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (isEditMode) {
        setEditImageFile(file);
        const reader = new FileReader();
        reader.onload = (e) => setEditImagePreview(e.target?.result as string);
        reader.readAsDataURL(file);
      } else {
        setNewItemImageFile(file);
        const reader = new FileReader();
        reader.onload = (e) => setNewItemImagePreview(e.target?.result as string);
        reader.readAsDataURL(file);
      }
    }
  };

  const handleTagToggle = (tagName: string) => {
    if (isEditMode) {
      const tag = tags.find(t => t.name === tagName);
      if (!tag) return;
      
      setFormData(prev => ({
        ...prev,
        tags: prev.tags.some(t => t.id === tag.id)
          ? prev.tags.filter(t => t.id !== tag.id)
          : [...prev.tags, tag],
      }));
    } else {
      const tag = tags.find(t => t.name === tagName);
      if (!tag) return;
      
      setNewItemTags(prev => 
        prev.some(t => t.id === tag.id)
          ? prev.filter(t => t.id !== tag.id)
          : [...prev, tag]
      );
    }
  };

  const handleMealPlanToggle = (planId: string) => {
    setFormData(prev => ({
      ...prev,
      associatedMealPlans: prev.associatedMealPlans.includes(planId)
        ? prev.associatedMealPlans.filter(id => id !== planId)
        : [...prev.associatedMealPlans, planId],
    }));
  };

  const handleCategoryToggle = (category: MealCategory) => {
    setFormData(prev => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter(c => c !== category)
        : [...prev.categories, category],
    }));
  };

  const addMealItem = () => {
    if (!newItemName.trim()) {
      setErrors(['Please enter a meal item name']);
      return;
    }

    const newItem: MealItem = {
      id: Date.now().toString(),
      name: newItemName.trim(),
      description: newItemDescription.trim() || '',
      tags: newItemTags,
      imageFile: newItemImageFile ?? undefined,
      imagePreview: newItemImagePreview,
    };

    setMealItems(prev => [...prev, newItem]);
    
    // Reset form
    setNewItemName('');
    setNewItemDescription('');
    setNewItemTags([]);
    setNewItemImageFile(null);
    setNewItemImagePreview('');
    setErrors([]);
  };

  const removeMealItem = (itemId: string) => {
    setMealItems(prev => prev.filter(item => item.id !== itemId));
  };

  const submitMeals = async () => {
    if (submitting) return;
    setSubmitting(true);

    if (isEditMode) {
      // Edit mode - update single meal
      if (!editMeal || !onUpdate) {
        setErrors(['Edit mode not properly configured']);
        setSubmitting(false);
        return;
      }

      const validation = validateMealData({
        ...formData,
        price: 0,
        associatedMealPlans: formData.associatedMealPlans,
      });

      if (!validation.isValid) {
        setErrors(validation.errors);
        setSubmitting(false);
        return;
      }

      // Ensure we have a valid date
      const dateObj = normalizeDate(new Date(formData.date));
      if (isNaN(dateObj.getTime())) {
        setErrors(['Invalid date selected']);
        setSubmitting(false);
        return;
      }

      const mealData: UpdateMealData = {
        name: formData.name.trim(),
        description: formData.description.trim() || '',
        type: formData.type,
        categories: formData.categories,
        date: dateObj,
        price: 0,
        imageFile: editImageFile ?? undefined,
        tags: formData.tags,
        associatedMealPlans: formData.associatedMealPlans,
        servingSize: formData.servingSize || '',
        isAvailable: formData.isAvailable,
      };

      try {
        await onUpdate(editMeal.id, mealData);
        handleClose();
      } catch (error) {
        console.error('Failed to update meal:', error);
        setErrors([error instanceof Error ? error.message : 'Failed to update meal']);
      } finally {
        setSubmitting(false);
      }
    } else {
      // Add mode - create multiple meals
      if (mealItems.length === 0) {
        setErrors(['Please add at least one meal item']);
        setSubmitting(false);
        return;
      }

      if (formData.associatedMealPlans.length === 0) {
        setErrors(['Please select at least one meal plan']);
        setSubmitting(false);
        return;
      }

      // Ensure we have a valid date
      const dateObj = normalizeDate(new Date(formData.date));
      if (isNaN(dateObj.getTime())) {
        setErrors(['Invalid date selected']);
        setSubmitting(false);
        return;
      }

      try {
        // Create meals for each item
        for (const item of mealItems) {
          const mealData: CreateMealData = {
            name: item.name,
            description: item.description || '',
            type: formData.type,
            categories: formData.categories,
            date: dateObj,
            price: 0,
            imageFile: item.imageFile ?? undefined,
            tags: item.tags,
            associatedMealPlans: formData.associatedMealPlans,
            servingSize: formData.servingSize || '',
          };

          await onSubmit(mealData);
        }

        handleClose();
      } catch (error) {
        console.error('Failed to create meals:', error);
        setErrors([error instanceof Error ? error.message : 'Failed to create meals']);
      } finally {
        setSubmitting(false);
      }
    }
  };

  const handleClose = () => {
    setFormData({
      name: '',
      description: '',
      type: 'breakfast',
      categories: ['vegetarian'],
      date: formatDateForComparison(initialDate),
      tags: [],
      associatedMealPlans: [],
      servingSize: '',
      isAvailable: true,
    });
    setMealItems([]);
    setNewItemName('');
    setNewItemDescription('');
    setNewItemTags([]);
    setNewItemImageFile(null);
    setNewItemImagePreview('');
    setEditImageFile(null);
    setEditImagePreview('');
    setErrors([]);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black bg-opacity-50">
      <div className="bg-SmartMess-light-surface dark:SmartMess-dark-surface dark:bg-SmartMess-light-surface dark:SmartMess-dark-surface rounded-xl shadow-2xl w-full max-w-4xl max-h-[85vh] overflow-y-auto border SmartMess-light-border dark:SmartMess-dark-SmartMess-light-border dark:SmartMess-dark-border dark:SmartMess-light-border dark:SmartMess-dark-SmartMess-light-border dark:SmartMess-dark-border scrollbar-hide">
        {/* Header */}
        <div className="sticky top-0 bg-SmartMess-light-surface dark:SmartMess-dark-surface dark:bg-SmartMess-light-surface dark:SmartMess-dark-surface border-b SmartMess-light-border dark:SmartMess-dark-SmartMess-light-border dark:SmartMess-dark-border dark:SmartMess-light-border dark:SmartMess-dark-SmartMess-light-border dark:SmartMess-dark-border rounded-t-xl p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl sm:text-2xl font-bold text-SmartMess-light-text dark:SmartMess-dark-text dark:text-SmartMess-light-text dark:SmartMess-dark-text">
              {isEditMode ? 'Edit Meal Item' : 'Add Meal Items'}
            </h2>
            <button
              onClick={handleClose}
              className="p-2 text-SmartMess-light-text dark:SmartMess-dark-text-muted dark:text-SmartMess-light-text dark:SmartMess-dark-text-muted hover:text-SmartMess-light-text dark:SmartMess-dark-text dark:hover:text-SmartMess-light-text dark:SmartMess-dark-text hover:bg-SmartMess-light-surface dark:SmartMess-dark-surface-hover dark:hover:bg-SmartMess-light-surface dark:SmartMess-dark-surface-hover rounded-lg transition-all duration-200"
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-4 sm:p-6 space-y-6">
          {/* Error Display */}
          {errors.length > 0 && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                    Please fix the following errors:
                  </h3>
                  <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                    <ul className="list-disc pl-5 space-y-1">
                      {errors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Edit Mode - Single Meal Form */}
          {isEditMode && (
            <div className="space-y-4">
              {/* Meal Name */}
              <div>
                <label className="block text-sm font-medium text-SmartMess-light-text dark:SmartMess-dark-text dark:text-SmartMess-light-text dark:SmartMess-dark-text mb-2">
                  Meal Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full px-3 py-3 border SmartMess-light-border dark:SmartMess-dark-SmartMess-light-border dark:SmartMess-dark-border dark:SmartMess-light-border dark:SmartMess-dark-SmartMess-light-border dark:SmartMess-dark-border rounded-lg focus:ring-2 focus:ring-SmartMess-light-primary dark:SmartMess-dark-primary focus:border-transparent bg-SmartMess-light-bg dark:SmartMess-dark-bg dark:bg-SmartMess-light-bg dark:SmartMess-dark-bg text-SmartMess-light-text dark:SmartMess-dark-text dark:text-SmartMess-light-text dark:SmartMess-dark-text placeholder-SmartMess-light-text dark:SmartMess-dark-text-muted dark:placeholder-SmartMess-light-text dark:SmartMess-dark-text-muted transition-all duration-200"
                  placeholder="Enter meal name"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-SmartMess-light-text dark:SmartMess-dark-text dark:text-SmartMess-light-text dark:SmartMess-dark-text mb-2">
                  Description (Optional)
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-3 border SmartMess-light-border dark:SmartMess-dark-SmartMess-light-border dark:SmartMess-dark-border dark:SmartMess-light-border dark:SmartMess-dark-SmartMess-light-border dark:SmartMess-dark-border rounded-lg focus:ring-2 focus:ring-SmartMess-light-primary dark:SmartMess-dark-primary focus:border-transparent bg-SmartMess-light-bg dark:SmartMess-dark-bg dark:bg-SmartMess-light-bg dark:SmartMess-dark-bg text-SmartMess-light-text dark:SmartMess-dark-text dark:text-SmartMess-light-text dark:SmartMess-dark-text placeholder-SmartMess-light-text dark:SmartMess-dark-text-muted dark:placeholder-SmartMess-light-text dark:SmartMess-dark-text-muted transition-all duration-200 resize-none"
                  placeholder="Describe the meal, ingredients, or special notes..."
                />
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-SmartMess-light-text dark:SmartMess-dark-text dark:text-SmartMess-light-text dark:SmartMess-dark-text mb-3">
                  Meal Image (Optional)
                </label>
                <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-3 border SmartMess-light-border dark:SmartMess-dark-SmartMess-light-border dark:SmartMess-dark-border dark:SmartMess-light-border dark:SmartMess-dark-SmartMess-light-border dark:SmartMess-dark-border rounded-lg text-sm font-medium text-SmartMess-light-text dark:SmartMess-dark-text dark:text-SmartMess-light-text dark:SmartMess-dark-text hover:bg-SmartMess-light-surface dark:SmartMess-dark-surface-hover dark:hover:bg-SmartMess-light-surface dark:SmartMess-dark-surface-hover transition-all duration-200"
                  >
                    Choose New Image
                  </button>
                  {editImagePreview && (
                    <div className="relative">
                      <img
                        src={editImagePreview}
                        alt="Preview"
                        className="w-20 h-20 object-cover rounded-lg border SmartMess-light-border dark:SmartMess-dark-SmartMess-light-border dark:SmartMess-dark-border dark:SmartMess-light-border dark:SmartMess-dark-SmartMess-light-border dark:SmartMess-dark-border"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setEditImageFile(null);
                          setEditImagePreview('');
                        }}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                      >
                        ×
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Availability Toggle */}
              <div>
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={formData.isAvailable}
                    onChange={(e) => handleInputChange('isAvailable', e.target.checked)}
                    className="rounded SmartMess-light-border dark:SmartMess-dark-SmartMess-light-border dark:SmartMess-dark-border dark:SmartMess-light-border dark:SmartMess-dark-SmartMess-light-border dark:SmartMess-dark-border text-SmartMess-light-primary dark:SmartMess-dark-primary focus:ring-SmartMess-light-primary dark:SmartMess-dark-primary"
                  />
                  <span className="text-sm font-medium text-SmartMess-light-text dark:SmartMess-dark-text dark:text-SmartMess-light-text dark:SmartMess-dark-text">
                    Available for ordering
                  </span>
                </label>
              </div>

              {/* Tags for Edit Mode */}
              <div>
                <label className="block text-sm font-medium text-SmartMess-light-text dark:SmartMess-dark-text dark:text-SmartMess-light-text dark:SmartMess-dark-text mb-3">
                  Meal Tags
                </label>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() => handleTagToggle(tag.name)}
                      className={`px-3 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                        formData.tags.some(t => t.id === tag.id)
                          ? `${tag.color} ring-2 ring-SmartMess-light-primary dark:SmartMess-dark-primary shadow-sm`
                          : 'bg-SmartMess-light-surface dark:SmartMess-dark-surface dark:bg-SmartMess-light-surface dark:SmartMess-dark-surface text-SmartMess-light-text dark:SmartMess-dark-text dark:text-SmartMess-light-text dark:SmartMess-dark-text hover:bg-SmartMess-light-surface dark:SmartMess-dark-surface-hover dark:hover:bg-SmartMess-light-surface dark:SmartMess-dark-surface-hover border SmartMess-light-border dark:SmartMess-dark-SmartMess-light-border dark:SmartMess-dark-border dark:SmartMess-light-border dark:SmartMess-dark-SmartMess-light-border dark:SmartMess-dark-border'
                      }`}
                    >
                      {tag.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Basic Settings */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Meal Type */}
            <div>
              <label className="block text-sm font-medium text-SmartMess-light-text dark:SmartMess-dark-text dark:text-SmartMess-light-text dark:SmartMess-dark-text mb-3">
                Meal Type *
              </label>
              <div className="grid grid-cols-3 gap-2">
                {mealTypes.map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => handleInputChange('type', type.value)}
                    className={`p-3 border rounded-lg text-center transition-all duration-200 ${
                      formData.type === type.value
                        ? 'border-SmartMess-light-primary dark:SmartMess-dark-primary bg-SmartMess-light-primary dark:SmartMess-dark-primary/10 text-SmartMess-light-primary dark:SmartMess-dark-primary shadow-sm'
                        : 'SmartMess-light-border dark:SmartMess-dark-SmartMess-light-border dark:SmartMess-dark-border dark:SmartMess-light-border dark:SmartMess-dark-SmartMess-light-border dark:SmartMess-dark-border hover:border-SmartMess-light-primary dark:SmartMess-dark-primary/50 dark:hover:border-SmartMess-light-primary dark:SmartMess-dark-primary/50 hover:bg-SmartMess-light-surface dark:SmartMess-dark-surface-hover dark:hover:bg-SmartMess-light-surface dark:SmartMess-dark-surface-hover'
                    }`}
                  >
                    <div className="text-2xl mb-1">{type.icon}</div>
                    <div className="text-xs sm:text-sm font-medium">{type.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Meal Categories */}
            <div>
              <label className="block text-sm font-medium text-SmartMess-light-text dark:SmartMess-dark-text dark:text-SmartMess-light-text dark:SmartMess-dark-text mb-3">
                Meal Categories *
              </label>
              <p className="text-xs text-SmartMess-light-text dark:SmartMess-dark-text-muted dark:text-SmartMess-light-text dark:SmartMess-dark-text-muted mb-3">
                Select one or more categories that apply to this meal
              </p>
              <div className="grid grid-cols-2 gap-2">
                {mealCategories.map((category) => (
                  <button
                    key={category.value}
                    type="button"
                    onClick={() => handleCategoryToggle(category.value)}
                    className={`p-3 border rounded-lg text-center transition-all duration-200 ${
                      formData.categories.includes(category.value)
                        ? 'border-SmartMess-light-primary dark:SmartMess-dark-primary bg-SmartMess-light-primary dark:SmartMess-dark-primary/10 text-SmartMess-light-primary dark:SmartMess-dark-primary shadow-sm'
                        : 'SmartMess-light-border dark:SmartMess-dark-SmartMess-light-border dark:SmartMess-dark-border dark:SmartMess-light-border dark:SmartMess-dark-SmartMess-light-border dark:SmartMess-dark-border hover:border-SmartMess-light-primary dark:SmartMess-dark-primary/50 dark:hover:border-SmartMess-light-primary dark:SmartMess-dark-primary/50 hover:bg-SmartMess-light-surface dark:SmartMess-dark-surface-hover dark:hover:bg-SmartMess-light-surface dark:SmartMess-dark-surface-hover'
                    }`}
                  >
                    <div className="text-2xl mb-1">{category.icon}</div>
                    <div className="text-xs sm:text-sm font-medium">{category.label}</div>
                  </button>
                ))}
              </div>
              {formData.categories.length > 0 && (
                <div className="mt-3">
                  <p className="text-xs text-SmartMess-light-text dark:SmartMess-dark-text-muted dark:text-SmartMess-light-text dark:SmartMess-dark-text-muted">
                    Selected: {formData.categories.map(cat => mealCategories.find(c => c.value === cat)?.label).join(', ')}
                  </p>
                </div>
              )}
            </div>

            {/* Date */}
            <div>
              <label className="block text-sm font-medium text-SmartMess-light-text dark:SmartMess-dark-text dark:text-SmartMess-light-text dark:SmartMess-dark-text mb-2">
                Date *
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => handleInputChange('date', e.target.value)}
                className="w-full px-3 py-3 border SmartMess-light-border dark:SmartMess-dark-SmartMess-light-border dark:SmartMess-dark-border dark:SmartMess-light-border dark:SmartMess-dark-SmartMess-light-border dark:SmartMess-dark-border rounded-lg focus:ring-2 focus:ring-SmartMess-light-primary dark:SmartMess-dark-primary focus:border-transparent bg-SmartMess-light-bg dark:SmartMess-dark-bg dark:bg-SmartMess-light-bg dark:SmartMess-dark-bg text-SmartMess-light-text dark:SmartMess-dark-text dark:text-SmartMess-light-text dark:SmartMess-dark-text transition-all duration-200"
                required
              />
            </div>
          </div>

          {/* Meal Plan Association */}
          <div>
            <label className="block text-sm font-medium text-SmartMess-light-text dark:SmartMess-dark-text dark:text-SmartMess-light-text dark:SmartMess-dark-text mb-3">
              Associated Meal Plans *
            </label>
            <p className="text-xs text-SmartMess-light-text dark:SmartMess-dark-text-muted dark:text-SmartMess-light-text dark:SmartMess-dark-text-muted mb-3">
              Select from meal plans created in the settings section. Plans that do not support the selected meal type are disabled.
            </p>
            {mealPlans.length === 0 ? (
              <div className="text-center py-6 border SmartMess-light-border dark:SmartMess-dark-SmartMess-light-border dark:SmartMess-dark-border dark:SmartMess-light-border dark:SmartMess-dark-SmartMess-light-border dark:SmartMess-dark-border rounded-lg bg-SmartMess-light-surface dark:SmartMess-dark-surface-hover dark:bg-SmartMess-light-surface dark:SmartMess-dark-surface-hover">
                <p className="text-SmartMess-light-text dark:SmartMess-dark-text-muted dark:text-SmartMess-light-text dark:SmartMess-dark-text-muted text-sm">
                  No meal plans available. Please create meal plans in the settings section first.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Select All Button */}
                <div className="flex justify-between items-center">
                  <span className="text-sm text-SmartMess-light-text dark:SmartMess-dark-text-muted dark:text-SmartMess-light-text dark:SmartMess-dark-text-muted">
                    {formData.associatedMealPlans.length} of {eligibleMealPlans.length} plans selected
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      const allEligibleIds = eligibleMealPlans.map(p => p.id);
                      setFormData(prev => ({
                        ...prev,
                        associatedMealPlans: prev.associatedMealPlans.length === eligibleMealPlans.length 
                          ? [] 
                          : allEligibleIds
                      }));
                    }}
                    className="text-sm text-SmartMess-light-primary dark:SmartMess-dark-primary hover:text-SmartMess-light-primary dark:SmartMess-dark-primary-dark dark:text-SmartMess-light-primary dark:SmartMess-dark-primary dark:hover:text-SmartMess-light-primary dark:SmartMess-dark-primary-light font-medium"
                  >
                    {formData.associatedMealPlans.length === eligibleMealPlans.length ? 'Deselect All' : 'Select All'}
                  </button>
                </div>
                
                {/* Meal Plan Checkboxes */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {mealPlans.map((plan) => {
                    const opts = plan.mealOptions || { breakfast: true, lunch: true, dinner: true };
                    const supportsType = formData.type === 'breakfast' ? opts.breakfast : formData.type === 'lunch' ? opts.lunch : opts.dinner;
                    const isChecked = formData.associatedMealPlans.includes(plan.id);
                    const isEligible = eligibleMealPlans.some(p => p.id === plan.id);
                    
                    return (
                      <label key={plan.id} className={`flex items-center space-x-3 p-3 border rounded-lg cursor-pointer transition-all duration-200 ${
                        supportsType && isEligible 
                          ? isChecked 
                            ? 'border-SmartMess-light-primary dark:SmartMess-dark-primary dark:border-SmartMess-light-primary dark:SmartMess-dark-primary bg-SmartMess-light-primary dark:SmartMess-dark-primary/5 dark:bg-SmartMess-light-primary dark:SmartMess-dark-primary/5' 
                            : 'SmartMess-light-border dark:SmartMess-dark-SmartMess-light-border dark:SmartMess-dark-border dark:SmartMess-light-border dark:SmartMess-dark-SmartMess-light-border dark:SmartMess-dark-border hover:bg-SmartMess-light-surface dark:SmartMess-dark-surface-hover dark:hover:bg-SmartMess-light-surface dark:SmartMess-dark-surface-hover'
                          : 'opacity-60 border-dashed SmartMess-light-border dark:SmartMess-dark-SmartMess-light-border dark:SmartMess-dark-border dark:SmartMess-light-border dark:SmartMess-dark-SmartMess-light-border dark:SmartMess-dark-border cursor-not-allowed'
                      }`}>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          disabled={!supportsType || !isEligible}
                          onChange={() => supportsType && isEligible && handleMealPlanToggle(plan.id)}
                          className="rounded SmartMess-light-border dark:SmartMess-dark-SmartMess-light-border dark:SmartMess-dark-border dark:SmartMess-light-border dark:SmartMess-dark-SmartMess-light-border dark:SmartMess-dark-border text-SmartMess-light-primary dark:SmartMess-dark-primary focus:ring-SmartMess-light-primary dark:SmartMess-dark-primary"
                        />
                        <div className="flex-1 min-w-0">
                          <span className={`text-sm font-medium ${
                            isChecked ? 'text-SmartMess-light-primary dark:SmartMess-dark-primary dark:text-SmartMess-light-primary dark:SmartMess-dark-primary' : 'text-SmartMess-light-text dark:SmartMess-dark-text dark:text-SmartMess-light-text dark:SmartMess-dark-text'
                          }`}>
                            {plan.name}
                          </span>
                          {plan.description && plan.description.trim() && (
                            <p className="text-xs text-SmartMess-light-text dark:SmartMess-dark-text-muted dark:text-SmartMess-light-text dark:SmartMess-dark-text-muted mt-1 truncate">
                              {plan.description}
                            </p>
                          )}
                        </div>
                        {!supportsType && (
                          <span className="ml-auto text-xs text-SmartMess-light-text dark:SmartMess-dark-text-muted dark:text-SmartMess-light-text dark:SmartMess-dark-text-muted">
                            Not available for {formData.type}
                          </span>
                        )}
                        {!isEligible && (
                          <span className="ml-auto text-xs text-SmartMess-light-text dark:SmartMess-dark-text-muted dark:text-SmartMess-light-text dark:SmartMess-dark-text-muted">
                            Not eligible
                          </span>
                        )}
                      </label>
                    );
                  })}
                </div>
                
                {/* Warning if no meal plans selected */}
                {formData.associatedMealPlans.length === 0 && (
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-yellow-800 dark:text-yellow-200">
                          <strong>Warning:</strong> No meal plans selected. This meal will not be visible to users with meal plan subscriptions.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Add New Meal Item - Only show in add mode */}
          {!isEditMode && (
            <div className="bg-SmartMess-light-bg dark:SmartMess-dark-bg dark:bg-SmartMess-light-bg dark:SmartMess-dark-bg rounded-lg p-4 border SmartMess-light-border dark:SmartMess-dark-SmartMess-light-border dark:SmartMess-dark-border dark:SmartMess-light-border dark:SmartMess-dark-SmartMess-light-border dark:SmartMess-dark-border">
            <h3 className="text-lg font-semibold text-SmartMess-light-text dark:SmartMess-dark-text dark:text-SmartMess-light-text dark:SmartMess-dark-text mb-4">
              Add New Meal Item
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Item Name */}
              <div>
                <label className="block text-sm font-medium text-SmartMess-light-text dark:SmartMess-dark-text dark:text-SmartMess-light-text dark:SmartMess-dark-text mb-2">
                  Item Name *
                </label>
                <input
                  type="text"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  className="w-full px-3 py-3 border SmartMess-light-border dark:SmartMess-dark-SmartMess-light-border dark:SmartMess-dark-border dark:SmartMess-light-border dark:SmartMess-dark-SmartMess-light-border dark:SmartMess-dark-border rounded-lg focus:ring-2 focus:ring-SmartMess-light-primary dark:SmartMess-dark-primary focus:border-transparent bg-SmartMess-light-bg dark:SmartMess-dark-bg dark:bg-SmartMess-light-bg dark:SmartMess-dark-bg text-SmartMess-light-text dark:SmartMess-dark-text dark:text-SmartMess-light-text dark:SmartMess-dark-text placeholder-SmartMess-light-text dark:SmartMess-dark-text-muted dark:placeholder-SmartMess-light-text dark:SmartMess-dark-text-muted transition-all duration-200"
                  placeholder="Enter meal item name"
                />
              </div>

              {/* Item Description */}
              <div>
                <label className="block text-sm font-medium text-SmartMess-light-text dark:SmartMess-dark-text dark:text-SmartMess-light-text dark:SmartMess-dark-text mb-2">
                  Description (Optional)
                </label>
                <input
                  type="text"
                  value={newItemDescription}
                  onChange={(e) => setNewItemDescription(e.target.value)}
                  className="w-full px-3 py-3 border SmartMess-light-border dark:SmartMess-dark-SmartMess-light-border dark:SmartMess-dark-border dark:SmartMess-light-border dark:SmartMess-dark-SmartMess-light-border dark:SmartMess-dark-border rounded-lg focus:ring-2 focus:ring-SmartMess-light-primary dark:SmartMess-dark-primary focus:border-transparent bg-SmartMess-light-bg dark:SmartMess-dark-bg dark:bg-SmartMess-light-bg dark:SmartMess-dark-bg text-SmartMess-light-text dark:SmartMess-dark-text dark:text-SmartMess-light-text dark:SmartMess-dark-text placeholder-SmartMess-light-text dark:SmartMess-dark-text-muted dark:placeholder-SmartMess-light-text dark:SmartMess-dark-text-muted transition-all duration-200"
                  placeholder="Brief description"
                />
              </div>
            </div>

            {/* Item Tags */}
            <div className="mt-4">
              <label className="block text-sm font-medium text-SmartMess-light-text dark:SmartMess-dark-text dark:text-SmartMess-light-text dark:SmartMess-dark-text mb-3">
                Item Tags
              </label>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => handleTagToggle(tag.name)}
                    className={`px-3 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                      newItemTags.some(t => t.id === tag.id)
                        ? `${tag.color} ring-2 ring-SmartMess-light-primary dark:SmartMess-dark-primary shadow-sm`
                        : 'bg-SmartMess-light-surface dark:SmartMess-dark-surface dark:bg-SmartMess-light-surface dark:SmartMess-dark-surface text-SmartMess-light-text dark:SmartMess-dark-text dark:text-SmartMess-light-text dark:SmartMess-dark-text hover:bg-SmartMess-light-surface dark:SmartMess-dark-surface-hover dark:hover:bg-SmartMess-light-surface dark:SmartMess-dark-surface-hover border SmartMess-light-border dark:SmartMess-dark-SmartMess-light-border dark:SmartMess-dark-border dark:SmartMess-light-border dark:SmartMess-dark-SmartMess-light-border dark:SmartMess-dark-border'
                    }`}
                  >
                    {tag.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Item Image */}
            <div className="mt-4">
              <label className="block text-sm font-medium text-SmartMess-light-text dark:SmartMess-dark-text dark:text-SmartMess-light-text dark:SmartMess-dark-text mb-3">
                Item Image (Optional)
              </label>
              <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-3 border SmartMess-light-border dark:SmartMess-dark-SmartMess-light-border dark:SmartMess-dark-border dark:SmartMess-light-border dark:SmartMess-dark-SmartMess-light-border dark:SmartMess-dark-border rounded-lg text-sm font-medium text-SmartMess-light-text dark:SmartMess-dark-text dark:text-SmartMess-light-text dark:SmartMess-dark-text hover:bg-SmartMess-light-surface dark:SmartMess-dark-surface-hover dark:hover:bg-SmartMess-light-surface dark:SmartMess-dark-surface-hover transition-all duration-200"
                >
                  Choose Image
                </button>
                {newItemImagePreview && (
                  <div className="relative">
                    <img
                      src={newItemImagePreview}
                      alt="Preview"
                      className="w-20 h-20 object-cover rounded-lg border SmartMess-light-border dark:SmartMess-dark-SmartMess-light-border dark:SmartMess-dark-border dark:SmartMess-light-border dark:SmartMess-dark-SmartMess-light-border dark:SmartMess-dark-border"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setNewItemImageFile(null);
                        setNewItemImagePreview('');
                      }}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                    >
                      ×
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Add Item Button */}
            <div className="mt-4">
              <button
                type="button"
                onClick={addMealItem}
                className="w-full py-3 bg-SmartMess-light-primary dark:SmartMess-dark-primary text-white rounded-lg hover:bg-SmartMess-light-primary dark:SmartMess-dark-primary/90 transition-colors font-medium"
              >
                + Add This Item
              </button>
            </div>
          </div>
          )}

          {/* Meal Items List - Only show in add mode */}
          {!isEditMode && mealItems.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-SmartMess-light-text dark:SmartMess-dark-text dark:text-SmartMess-light-text dark:SmartMess-dark-text mb-4">
                Meal Items ({mealItems.length})
              </h3>
              <div className="space-y-3">
                {mealItems.map((item) => (
                  <div key={item.id} className="bg-SmartMess-light-bg dark:SmartMess-dark-bg dark:bg-SmartMess-light-bg dark:SmartMess-dark-bg rounded-lg p-4 border SmartMess-light-border dark:SmartMess-dark-SmartMess-light-border dark:SmartMess-dark-border dark:SmartMess-light-border dark:SmartMess-dark-SmartMess-light-border dark:SmartMess-dark-border">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          {item.imagePreview && (
                            <img
                              src={item.imagePreview}
                              alt={item.name}
                              className="w-12 h-12 object-cover rounded-lg border SmartMess-light-border dark:SmartMess-dark-SmartMess-light-border dark:SmartMess-dark-border dark:SmartMess-light-border dark:SmartMess-dark-SmartMess-light-border dark:SmartMess-dark-border"
                            />
                          )}
                          <div>
                            <h4 className="font-medium text-SmartMess-light-text dark:SmartMess-dark-text dark:text-SmartMess-light-text dark:SmartMess-dark-text">
                              {item.name}
                            </h4>
                            {item.description && item.description.trim() && (
                              <p className="text-sm text-SmartMess-light-text dark:SmartMess-dark-text-muted dark:text-SmartMess-light-text dark:SmartMess-dark-text-muted">
                                {item.description}
                              </p>
                            )}
                          </div>
                        </div>
                        {item.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {item.tags.map((tag) => (
                              <span
                                key={tag.id}
                                className={`px-2 py-1 text-xs rounded-full ${tag.color}`}
                              >
                                {tag.name}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => removeMealItem(item.id)}
                        className="p-2 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end space-y-3 sm:space-y-0 sm:space-x-3 pt-6 border-t SmartMess-light-border dark:SmartMess-dark-SmartMess-light-border dark:SmartMess-dark-border dark:SmartMess-light-border dark:SmartMess-dark-SmartMess-light-border dark:SmartMess-dark-border">
            <button
              type="button"
              onClick={handleClose}
              className="px-6 py-3 text-sm font-medium text-SmartMess-light-text dark:SmartMess-dark-text dark:text-SmartMess-light-text dark:SmartMess-dark-text bg-SmartMess-light-surface dark:SmartMess-dark-surface dark:bg-SmartMess-light-surface dark:SmartMess-dark-surface border SmartMess-light-border dark:SmartMess-dark-SmartMess-light-border dark:SmartMess-dark-border dark:SmartMess-light-border dark:SmartMess-dark-SmartMess-light-border dark:SmartMess-dark-border rounded-lg hover:bg-SmartMess-light-surface dark:SmartMess-dark-surface-hover dark:hover:bg-SmartMess-light-surface dark:SmartMess-dark-surface-hover transition-all duration-200"
              disabled={submitting || loading}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={submitMeals}
              disabled={submitting || loading || (!isEditMode && mealItems.length === 0)}
              className="px-6 py-3 text-sm font-medium text-white bg-SmartMess-light-primary dark:SmartMess-dark-primary border border-transparent rounded-lg hover:bg-SmartMess-light-primary dark:SmartMess-dark-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-SmartMess-light-primary dark:SmartMess-dark-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {submitting 
                ? (isEditMode ? 'Updating...' : 'Saving...') 
                : (isEditMode ? 'Update Meal' : `Save ${mealItems.length} Item${mealItems.length !== 1 ? 's' : ''}`)
              }
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
