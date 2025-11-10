import React, { useState, useMemo } from 'react';
import { Meal, MealPlan, MealTag, CreateMealData, UpdateMealData } from '../MealManagement.types';
import { AddMealModal } from './AddMealModal';
import { isSameDay, getWeekDates } from '@/utils/dateUtils';


interface WeeklyMealPlanningProps {
  meals: Meal[];
  mealPlans: MealPlan[];
  tags: MealTag[];
  loading: boolean;
  onCreateMeal: (mealData: CreateMealData) => Promise<void>;
  onUpdateMeal: (id: string, mealData: UpdateMealData) => Promise<void>;
  onDeleteMeal: (id: string) => Promise<void>;
  selectedDate?: Date;
  onDateSelect?: (date: Date) => void;
}

export const WeeklyMealPlanning: React.FC<WeeklyMealPlanningProps> = ({
  meals,
  mealPlans,
  tags,
  loading,
  onCreateMeal,
  onUpdateMeal,
  onDeleteMeal,
  selectedDate: propSelectedDate,
  onDateSelect,
}) => {
  // Always use the selectedDate from parent component
  const selectedDate = propSelectedDate || new Date();
  const [selectedMealType, setSelectedMealType] = useState<'breakfast' | 'lunch' | 'dinner'>('breakfast');
  const [showAddMealModal, setShowAddMealModal] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null);


  // Get current week dates using utility function
  const weekDates = useMemo(() => {
    return getWeekDates(selectedDate);
  }, [selectedDate]);

  // Get meals for a specific date and meal type
  const getMealsForSlot = (date: Date, mealType: 'breakfast' | 'lunch' | 'dinner') => {
    return meals.filter(meal => {
      const mealDate = new Date(meal.date);
      return (
        isSameDay(mealDate, date) &&
        meal.type === mealType
      );
    });
  };

  // Navigate to previous/next week
  const navigateWeek = (direction: 'prev' | 'next') => {
    if (onDateSelect) {
      const newDate = new Date(selectedDate);
      newDate.setDate(selectedDate.getDate() + (direction === 'next' ? 7 : -7));
      onDateSelect(newDate);
    }
  };

  // Format date for display
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'numeric', 
      day: 'numeric' 
    });
  };

  const mealTypes = [
    { key: 'breakfast' as const, label: 'Breakfast', icon: '🌅' },
    { key: 'lunch' as const, label: 'Lunch', icon: '☀️' },
    { key: 'dinner' as const, label: 'Dinner', icon: '🌙' },
  ];

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-SmartMess-light-text dark:SmartMess-dark-text dark:text-SmartMess-light-text dark:SmartMess-dark-text">
            Weekly Meal Planning
          </h2>
          <p className="text-sm md:text-base text-SmartMess-light-text dark:SmartMess-dark-text-muted dark:text-SmartMess-light-text dark:SmartMess-dark-text-muted">
            Plan and schedule meals for the entire week
          </p>
        </div>
        <div className="flex items-center space-x-3">

        </div>
      </div>

      {/* Week Navigation */}
      <div className="flex items-center justify-between bg-SmartMess-light-surface dark:SmartMess-dark-surface dark:bg-SmartMess-light-surface dark:SmartMess-dark-surface rounded-lg p-3 md:p-4 border SmartMess-light-border dark:SmartMess-dark-SmartMess-light-border dark:SmartMess-dark-border dark:SmartMess-light-border dark:SmartMess-dark-SmartMess-light-border dark:SmartMess-dark-border">
        <button
          onClick={() => navigateWeek('prev')}
          className="p-2 hover:bg-SmartMess-light-surface dark:SmartMess-dark-surface-hover dark:hover:bg-SmartMess-light-surface dark:SmartMess-dark-surface-hover rounded-lg transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <span className="text-sm md:text-lg font-medium text-SmartMess-light-text dark:SmartMess-dark-text dark:text-SmartMess-light-text dark:SmartMess-dark-text text-center px-2">
          {weekDates[0] ? weekDates[0].toLocaleDateString('en-US', { month: 'long', day: 'numeric' }) : '...'} - {weekDates[6] ? weekDates[6].toLocaleDateString('en-US', { month: 'long', day: 'numeric' }) : '...'}, {selectedDate.getFullYear()}
        </span>
        <button
          onClick={() => navigateWeek('next')}
          className="p-2 hover:bg-SmartMess-light-surface dark:SmartMess-dark-surface-hover dark:hover:bg-SmartMess-light-surface dark:SmartMess-dark-surface-hover rounded-lg transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Weekly Grid */}
      <div className="bg-SmartMess-light-surface dark:SmartMess-dark-surface dark:bg-SmartMess-light-surface dark:SmartMess-dark-surface rounded-lg border SmartMess-light-border dark:SmartMess-dark-SmartMess-light-border dark:SmartMess-dark-border dark:SmartMess-light-border dark:SmartMess-dark-SmartMess-light-border dark:SmartMess-dark-border overflow-hidden">
        <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-SmartMess-light-border dark:SmartMess-dark-border dark:scrollbar-thumb-SmartMess-light-border dark:SmartMess-dark-border scrollbar-track-transparent">
          <div className="min-w-[1200px]">
            {/* Header Row */}
            <div className="grid grid-cols-[150px_1fr_1fr_1fr_1fr_1fr_1fr_1fr] border-b SmartMess-light-border dark:SmartMess-dark-SmartMess-light-border dark:SmartMess-dark-border dark:SmartMess-light-border dark:SmartMess-dark-SmartMess-light-border dark:SmartMess-dark-border">
              <div className="bg-SmartMess-light-surface dark:SmartMess-dark-surface-hover dark:bg-SmartMess-light-surface dark:SmartMess-dark-surface-hover p-4 border-r SmartMess-light-border dark:SmartMess-dark-SmartMess-light-border dark:SmartMess-dark-border dark:SmartMess-light-border dark:SmartMess-dark-SmartMess-light-border dark:SmartMess-dark-border">
                <span className="text-sm font-medium text-SmartMess-light-text dark:SmartMess-dark-text-muted dark:text-SmartMess-light-text dark:SmartMess-dark-text-muted">
                  Meal Type
                </span>
              </div>
              {weekDates.map((date, index) => (
                <div key={index} className="bg-SmartMess-light-surface dark:SmartMess-dark-surface-hover dark:bg-SmartMess-light-surface dark:SmartMess-dark-surface-hover p-3 border-r SmartMess-light-border dark:SmartMess-dark-SmartMess-light-border dark:SmartMess-dark-border dark:SmartMess-light-border dark:SmartMess-dark-SmartMess-light-border dark:SmartMess-dark-border last:border-r-0">
                  <div className="text-center">
                    <div className="text-sm font-medium text-SmartMess-light-text dark:SmartMess-dark-text dark:text-SmartMess-light-text dark:SmartMess-dark-text">
                      {daysOfWeek[index]}
                    </div>
                    <div className="text-xs text-SmartMess-light-text dark:SmartMess-dark-text-muted dark:text-SmartMess-light-text dark:SmartMess-dark-text-muted">
                      {formatDate(date)}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Meal Type Rows */}
            {mealTypes.map((mealType) => (
              <div key={mealType.key} className="grid grid-cols-[150px_1fr_1fr_1fr_1fr_1fr_1fr_1fr] border-b SmartMess-light-border dark:SmartMess-dark-SmartMess-light-border dark:SmartMess-dark-border dark:SmartMess-light-border dark:SmartMess-dark-SmartMess-light-border dark:SmartMess-dark-border last:border-b-0">
                {/* Meal Type Label */}
                <div className="bg-SmartMess-light-surface dark:SmartMess-dark-surface dark:bg-SmartMess-light-surface dark:SmartMess-dark-surface p-4 border-r SmartMess-light-border dark:SmartMess-dark-SmartMess-light-border dark:SmartMess-dark-border dark:SmartMess-light-border dark:SmartMess-dark-SmartMess-light-border dark:SmartMess-dark-border flex items-center">
                  <span className="text-2xl mr-3">{mealType.icon}</span>
                  <span className="text-sm font-medium text-SmartMess-light-text dark:SmartMess-dark-text dark:text-SmartMess-light-text dark:SmartMess-dark-text">
                    {mealType.label}
                  </span>
                </div>

                {/* Meal Slots for each day */}
                {weekDates.map((date, dayIndex) => {
                  const slotMeals = getMealsForSlot(date, mealType.key);
                  
                  return (
                    <div key={`${mealType.key}-${dayIndex}`} className="bg-SmartMess-light-surface dark:SmartMess-dark-surface dark:bg-SmartMess-light-surface dark:SmartMess-dark-surface p-3 border-r SmartMess-light-border dark:SmartMess-dark-SmartMess-light-border dark:SmartMess-dark-border dark:SmartMess-light-border dark:SmartMess-dark-SmartMess-light-border dark:SmartMess-dark-border last:border-r-0 min-h-[120px] w-full overflow-hidden">
                      {slotMeals.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center p-2">
                          <div className="w-8 h-8 mb-2 rounded-full border-2 border-dashed SmartMess-light-border dark:SmartMess-dark-SmartMess-light-border dark:SmartMess-dark-border dark:SmartMess-light-border dark:SmartMess-dark-SmartMess-light-border dark:SmartMess-dark-border flex items-center justify-center">
                            <span className="text-SmartMess-light-text dark:SmartMess-dark-text-muted dark:text-SmartMess-light-text dark:SmartMess-dark-text-muted text-sm">◎</span>
                          </div>
                          <div className="text-xs text-SmartMess-light-text dark:SmartMess-dark-text-muted dark:text-SmartMess-light-text dark:SmartMess-dark-text-muted mb-3 leading-tight">
                            No meal planned
                          </div>
                          <button
                            onClick={() => {
                              if (onDateSelect) onDateSelect(date);
                              setSelectedMealType(mealType.key);
                              setShowAddMealModal(true);
                            }}
                            className="w-full py-2 bg-SmartMess-light-primary dark:SmartMess-dark-primary text-white rounded-lg hover:bg-SmartMess-light-primary dark:SmartMess-dark-primary/90 transition-colors text-sm font-medium"
                          >
                            +
                          </button>
                        </div>
                      ) : (
                        <div className="h-full flex flex-col">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-2">
                              <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                                <span className="text-white text-xs">✓</span>
                              </div>
                              <span className="text-xs font-medium text-SmartMess-light-text dark:SmartMess-dark-text dark:text-SmartMess-light-text dark:SmartMess-dark-text">
                                Planned
                              </span>
                            </div>
                            <button
                              onClick={() => {
                                if (onDateSelect) onDateSelect(date);
                                setSelectedMealType(mealType.key);
                                setShowAddMealModal(true);
                              }}
                              className="p-1 hover:bg-SmartMess-light-surface dark:SmartMess-dark-surface-hover dark:hover:bg-SmartMess-light-surface dark:SmartMess-dark-surface-hover rounded transition-colors"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                              </svg>
                            </button>
                          </div>
                          
                          {/* Meal Items */}
                          <div className="space-y-2 flex-1 overflow-hidden">
                            {slotMeals.map((meal) => (
                              <div key={meal.id} className="flex items-center justify-between p-2 bg-SmartMess-light-surface dark:SmartMess-dark-surface-hover dark:bg-SmartMess-light-surface dark:SmartMess-dark-surface-hover rounded text-xs min-w-0 max-w-full">
                                <span className="text-SmartMess-light-text dark:SmartMess-dark-text dark:text-SmartMess-light-text dark:SmartMess-dark-text truncate flex-1 min-w-0 mr-2 max-w-[120px]" title={meal.name}>
                                  {meal.name}
                                </span>
                                <div className="flex items-center space-x-1 flex-shrink-0">
                                  <button
                                    onClick={() => {
                                      setSelectedMeal(meal);
                                      setShowAddMealModal(true);
                                    }}
                                    className="text-blue-500 hover:text-blue-600 transition-colors"
                                    title="Edit meal"
                                  >
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                  </button>
                                  <button
                                    onClick={() => onDeleteMeal(meal.id)}
                                    className="text-red-500 hover:text-red-600 transition-colors"
                                    title="Delete meal"
                                  >
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modals */}
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