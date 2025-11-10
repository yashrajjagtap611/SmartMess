import React, { useState, useMemo } from 'react';
import { Meal, MealPlan, MealTag, CreateMealData, UpdateMealData } from '../MealManagement.types';
import { AddMealModal } from './AddMealModal';
import { isSameDay, formatDisplayDate } from '@/utils/dateUtils';

interface TodaysMenuProps {
  meals: Meal[];
  mealPlans: MealPlan[];
  tags: MealTag[];
  loading: boolean;
  onCreateMeal: (mealData: CreateMealData) => Promise<void>;
  onUpdateMeal: (id: string, mealData: UpdateMealData) => Promise<void>;
  onDeleteMeal: (id: string) => Promise<void>;
  selectedDate?: Date;
}

export const TodaysMenu: React.FC<TodaysMenuProps> = ({
  meals,
  mealPlans,
  tags,
  loading,
  onCreateMeal,
  onUpdateMeal,
  onDeleteMeal,
  selectedDate: propSelectedDate,
}) => {
  // Use the selectedDate prop directly from the calendar
  const selectedDate = propSelectedDate || new Date();
  const [showAddMealModal, setShowAddMealModal] = useState(false);
  const [selectedMealType, setSelectedMealType] = useState<'breakfast' | 'lunch' | 'dinner'>('breakfast');
  const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null);

  // Get meals for selected date
  const todaysMeals = useMemo(() => {
    return meals.filter(meal => {
      const mealDate = new Date(meal.date);
      return isSameDay(mealDate, selectedDate);
    });
  }, [meals, selectedDate]);

  // Get meals by type
  const getMealsByType = (type: 'breakfast' | 'lunch' | 'dinner') => {
    return todaysMeals.filter(meal => meal.type === type);
  };

  const mealTypes = [
    { key: 'breakfast' as const, label: 'Breakfast', icon: '🌅', color: 'bg-orange-100 dark:bg-orange-900/20' },
    { key: 'lunch' as const, label: 'Lunch', icon: '☀️', color: 'bg-yellow-100 dark:bg-yellow-900/20' },
    { key: 'dinner' as const, label: 'Dinner', icon: '🌙', color: 'bg-blue-100 dark:bg-blue-900/20' },
  ];

  const formatDate = (date: Date) => {
    return formatDisplayDate(date);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-SmartMess-light-text dark:SmartMess-dark-text dark:text-SmartMess-light-text dark:SmartMess-dark-text">
            Today's Menu
          </h2>
          <p className="text-SmartMess-light-text dark:SmartMess-dark-text-muted dark:text-SmartMess-light-text dark:SmartMess-dark-text-muted">
            View and manage today's meals
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-2 bg-green-100 dark:bg-green-900/20 px-3 py-1 rounded-full">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-sm font-medium text-green-700 dark:text-green-300">Live</span>
          </div>
        </div>
      </div>



      {/* Today's Menu Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mt-6">
        {mealTypes.map((mealType) => {
          const typeMeals = getMealsByType(mealType.key);
          
          return (
            <div key={mealType.key} className="bg-SmartMess-light-surface dark:SmartMess-dark-surface dark:bg-SmartMess-light-surface dark:SmartMess-dark-surface rounded-lg border SmartMess-light-border dark:SmartMess-dark-SmartMess-light-border dark:SmartMess-dark-border dark:SmartMess-light-border dark:SmartMess-dark-SmartMess-light-border dark:SmartMess-dark-border overflow-hidden">
              {/* Card Header */}
              <div className="p-4 border-b SmartMess-light-border dark:SmartMess-dark-SmartMess-light-border dark:SmartMess-dark-border dark:SmartMess-light-border dark:SmartMess-dark-SmartMess-light-border dark:SmartMess-dark-border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{mealType.icon}</span>
                    <h3 className="text-lg font-semibold text-SmartMess-light-text dark:SmartMess-dark-text dark:text-SmartMess-light-text dark:SmartMess-dark-text">
                      {mealType.label}
                    </h3>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedMealType(mealType.key);
                      setShowAddMealModal(true);
                    }}
                    className="p-2 text-SmartMess-light-text dark:SmartMess-dark-text-muted dark:text-SmartMess-light-text dark:SmartMess-dark-text-muted hover:text-SmartMess-light-text dark:SmartMess-dark-text dark:hover:text-SmartMess-light-text dark:SmartMess-dark-text hover:bg-SmartMess-light-surface dark:SmartMess-dark-surface-hover dark:hover:bg-SmartMess-light-surface dark:SmartMess-dark-surface-hover rounded-lg transition-all duration-200"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Card Content */}
              <div className="p-4">
                {typeMeals.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-lg border-2 border-dashed SmartMess-light-border dark:SmartMess-dark-SmartMess-light-border dark:SmartMess-dark-border dark:SmartMess-light-border dark:SmartMess-dark-SmartMess-light-border dark:SmartMess-dark-border flex items-center justify-center">
                      <span className="text-2xl text-SmartMess-light-text dark:SmartMess-dark-text-muted dark:text-SmartMess-light-text dark:SmartMess-dark-text-muted">◎</span>
                    </div>
                    <p className="text-SmartMess-light-text dark:SmartMess-dark-text-muted dark:text-SmartMess-light-text dark:SmartMess-dark-text-muted mb-4">
                      No items planned yet
                    </p>
                                         <button
                       onClick={() => {
                         setSelectedMealType(mealType.key);
                         setShowAddMealModal(true);
                       }}
                      className="w-full py-3 bg-SmartMess-light-primary dark:SmartMess-dark-primary text-white rounded-lg hover:bg-SmartMess-light-primary dark:SmartMess-dark-primary/90 transition-colors font-medium"
                    >
                      + Add Meal
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {typeMeals.map((meal) => (
                      <div key={meal.id} className="bg-SmartMess-light-bg dark:SmartMess-dark-bg dark:bg-SmartMess-light-bg dark:SmartMess-dark-bg rounded-lg p-3 border SmartMess-light-border dark:SmartMess-dark-SmartMess-light-border dark:SmartMess-dark-border dark:SmartMess-light-border dark:SmartMess-dark-SmartMess-light-border dark:SmartMess-dark-border">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium text-SmartMess-light-text dark:SmartMess-dark-text dark:text-SmartMess-light-text dark:SmartMess-dark-text">
                              {meal.name}
                            </h4>
                            {meal.description && (
                              <p className="text-sm text-SmartMess-light-text dark:SmartMess-dark-text-muted dark:text-SmartMess-light-text dark:SmartMess-dark-text-muted mt-1">
                                {meal.description}
                              </p>
                            )}
                            {meal.categories && meal.categories.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {meal.categories.map((category, index) => (
                                  <span
                                    key={index}
                                    className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300"
                                  >
                                    {category}
                                  </span>
                                ))}
                              </div>
                            )}
                            {meal.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {meal.tags.map((tag) => (
                                  <span
                                    key={tag.id}
                                    className={`px-2 py-1 text-xs rounded-full ${tag.color || 'bg-gray-100 dark:bg-gray-800'}`}
                                  >
                                    {tag.name}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => {
                                setSelectedMeal(meal);
                                setShowAddMealModal(true);
                              }}
                              className="p-1 text-blue-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                              title="Edit meal"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => onDeleteMeal(meal.id)}
                              className="p-1 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                              title="Delete meal"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {/* Add More Button */}
                    <button
                      onClick={() => {
                        setSelectedMealType(mealType.key);
                        setShowAddMealModal(true);
                      }}
                      className="w-full py-2 border SmartMess-light-border dark:SmartMess-dark-SmartMess-light-border dark:SmartMess-dark-border dark:SmartMess-light-border dark:SmartMess-dark-SmartMess-light-border dark:SmartMess-dark-border rounded-lg text-SmartMess-light-text dark:SmartMess-dark-text dark:text-SmartMess-light-text dark:SmartMess-dark-text hover:bg-SmartMess-light-surface dark:SmartMess-dark-surface-hover dark:hover:bg-SmartMess-light-surface dark:SmartMess-dark-surface-hover transition-colors"
                    >
                      + Add More
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Date Display */}
      <div className="text-center">
        <p className="text-lg font-medium text-SmartMess-light-text dark:SmartMess-dark-text dark:text-SmartMess-light-text dark:SmartMess-dark-text">
          {formatDate(selectedDate)}
        </p>
      </div>

                    {/* Add/Edit Meal Modal */}
       {showAddMealModal && (
         <AddMealModal
           isOpen={showAddMealModal}
           onClose={() => {
             setShowAddMealModal(false);
             setSelectedMeal(null);
           }}
           onSubmit={onCreateMeal}
           onUpdate={onUpdateMeal}
           mealPlans={mealPlans}
           tags={tags}
           loading={loading}
           initialDate={selectedDate}
           initialMealType={selectedMealType}
           editMeal={selectedMeal}
         />
       )}
    </div>
  );

};
