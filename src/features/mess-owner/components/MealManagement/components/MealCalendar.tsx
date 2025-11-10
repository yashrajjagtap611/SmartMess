import React, { useState, useMemo, useEffect } from 'react';
import { isSameDay, normalizeDate, getWeekDates } from '@/utils/dateUtils';

interface MealCalendarProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  meals?: any[]; // Array of meals to show indicators
  className?: string;
  view?: 'month' | 'week';
}

export const MealCalendar: React.FC<MealCalendarProps> = ({
  selectedDate,
  onDateSelect,
  meals = [],
  className = '',
  view = 'month',
}) => {
  const [currentMonth, setCurrentMonth] = useState(() => {
    return normalizeDate(selectedDate);
  });

  // Update current month when selectedDate changes
  useEffect(() => {
    setCurrentMonth(normalizeDate(selectedDate));
  }, [selectedDate]);

  // Get calendar data for the current month or week
  const calendarData = useMemo(() => {
    if (view === 'week') {
      // Week view: use utility function for consistent week calculation
      return getWeekDates(selectedDate);
    } else {
      // Month view: show full month
      const year = currentMonth.getFullYear();
      const month = currentMonth.getMonth();
      
      // First day of the month
      const firstDay = new Date(year, month, 1);
      // Last day of the month
      const lastDay = new Date(year, month + 1, 0);
      // First day of the calendar (might be from previous month) - start from Monday
      const startDate = new Date(firstDay);
      const dayOfWeek = firstDay.getDay();
      const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Monday = 0
      startDate.setDate(startDate.getDate() - daysToSubtract);
      
      // Last day of the calendar (might be from next month) - end on Sunday
      const endDate = new Date(lastDay);
      const lastDayOfWeek = lastDay.getDay();
      const daysToAdd = lastDayOfWeek === 0 ? 0 : 7 - lastDayOfWeek; // Sunday = 0
      endDate.setDate(endDate.getDate() + daysToAdd);
      
      const days = [];
      const current = new Date(startDate);
      
      while (current <= endDate) {
        days.push(new Date(current));
        current.setDate(current.getDate() + 1);
      }
      
      return days;
    }
  }, [currentMonth, selectedDate, view]);

  // Check if a date has meals
  const hasMeals = (date: Date) => {
    return meals.some(meal => {
      const mealDate = new Date(meal.date);
      return isSameDay(mealDate, date);
    });
  };

  // Check if a date is the selected date
  const isSelected = (date: Date) => {
    return isSameDay(date, selectedDate);
  };

  // Check if a date is today
  const isToday = (date: Date) => {
    const today = new Date();
    return isSameDay(date, today);
  };

  // Check if a date is in the current month
  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentMonth.getMonth();
  };

  // Navigate to previous month
  const goToPreviousMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  // Navigate to next month
  const goToNextMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  // Format month and year for display
  const monthYear = currentMonth.toLocaleDateString('en-US', { 
    month: 'long', 
    year: 'numeric' 
  });

  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']; // Always start with Monday

  return (
    <div className={`bg-SmartMess-light-surface dark:SmartMess-dark-surface dark:bg-SmartMess-light-surface dark:SmartMess-dark-surface rounded-lg border SmartMess-light-border dark:SmartMess-dark-SmartMess-light-border dark:SmartMess-dark-border dark:SmartMess-light-border dark:SmartMess-dark-SmartMess-light-border dark:SmartMess-dark-border p-3 shadow-sm ${className}`}>
      {/* Header with month navigation */}
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={view === 'week' ? () => {
            const newDate = new Date(selectedDate);
            newDate.setDate(selectedDate.getDate() - 7);
            onDateSelect(normalizeDate(newDate));
          } : goToPreviousMonth}
          className="p-1.5 text-SmartMess-light-text dark:SmartMess-dark-text dark:text-SmartMess-light-text dark:SmartMess-dark-text hover:bg-SmartMess-light-surface dark:SmartMess-dark-surface-hover dark:hover:bg-SmartMess-light-surface dark:SmartMess-dark-surface-hover rounded-md transition-all duration-200"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        
        <h3 className="text-sm font-semibold text-SmartMess-light-text dark:SmartMess-dark-text dark:text-SmartMess-light-text dark:SmartMess-dark-text text-center px-2">
          {view === 'week' ? (() => {
            const weekDates = getWeekDates(selectedDate);
            const startDate = weekDates[0];
            const endDate = weekDates[6];
            if (!startDate || !endDate) {
              return 'Invalid Date Range';
            }
            const startMonth = startDate.toLocaleDateString('en-US', { month: 'short' });
            const endMonth = endDate.toLocaleDateString('en-US', { month: 'short' });
            const year = startDate.getFullYear();
            
            if (startMonth === endMonth) {
              return `${startMonth} ${startDate.getDate()}-${endDate.getDate()}, ${year}`;
            } else {
              return `${startMonth} ${startDate.getDate()} - ${endMonth} ${endDate.getDate()}, ${year}`;
            }
          })() : monthYear}
        </h3>
        
        <button
          onClick={view === 'week' ? () => {
            const newDate = new Date(selectedDate);
            newDate.setDate(selectedDate.getDate() + 7);
            onDateSelect(normalizeDate(newDate));
          } : goToNextMonth}
          className="p-1.5 text-SmartMess-light-text dark:SmartMess-dark-text dark:text-SmartMess-light-text dark:SmartMess-dark-text hover:bg-SmartMess-light-surface dark:SmartMess-dark-surface-hover dark:hover:bg-SmartMess-light-surface dark:SmartMess-dark-surface-hover rounded-md transition-all duration-200"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Day names header */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {dayNames.map(day => (
          <div
            key={day}
            className="text-center text-xs font-medium text-SmartMess-light-text dark:SmartMess-dark-text-muted dark:text-SmartMess-light-text dark:SmartMess-dark-text-muted py-1"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {calendarData.map((date, index) => {
          const isSelectedDate = isSelected(date);
          const isCurrentMonthDate = isCurrentMonth(date);
          const hasMealsOnDate = hasMeals(date);
          const isTodayDate = isToday(date);
          
          return (
            <button
              key={index}
              onClick={() => onDateSelect(date)}
              className={`
                relative p-1 text-xs rounded-md transition-all duration-200 min-h-[28px] flex items-center justify-center
                ${isSelectedDate
                  ? 'bg-SmartMess-light-primary dark:SmartMess-dark-primary text-black shadow-md'
                  : isTodayDate && !isSelectedDate
                    ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 border border-green-500 dark:border-green-400'
                    : isCurrentMonthDate
                      ? 'text-SmartMess-light-text dark:SmartMess-dark-text dark:text-SmartMess-light-text dark:SmartMess-dark-text hover:bg-SmartMess-light-surface dark:SmartMess-dark-surface-hover dark:hover:bg-SmartMess-light-surface dark:SmartMess-dark-surface-hover'
                      : 'text-SmartMess-light-text dark:SmartMess-dark-text-muted dark:text-SmartMess-light-text dark:SmartMess-dark-text-muted hover:bg-SmartMess-light-surface dark:SmartMess-dark-surface-hover dark:hover:bg-SmartMess-light-surface dark:SmartMess-dark-surface-hover'
                }
              `}
            >
              {date.getDate()}
              {hasMealsOnDate && (
                <div className="absolute bottom-0.5 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-orange-400 rounded-full"></div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
