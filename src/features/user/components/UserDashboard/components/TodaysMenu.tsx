import React, { useState, useEffect } from 'react';
import messService from '@/services/api/messService';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import { 
  SunIcon, 
  ClockIcon, 
  MoonIcon,
  SparklesIcon,
  ArrowRightIcon,
  ExclamationCircleIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';
import {
  FireIcon
} from '@heroicons/react/24/solid';

interface Meal {
  id: string;
  name: string;
  description?: string;
  type: 'breakfast' | 'lunch' | 'dinner';
  category: string;
  categories?: string[];
  imageUrl?: string;
  tags?: Array<{
    id: string;
    name: string;
    color: string;
  }>;
  messName: string;
  mealPlanName: string;
}

interface TodaysMenuProps {
  className?: string;
}

const TodaysMenu: React.FC<TodaysMenuProps> = ({ className = '' }) => {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [scrollPosition, setScrollPosition] = useState(0);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadTodaysMenu();
    
    // Update time immediately and then every minute
    setCurrentTime(new Date());
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    
    return () => clearInterval(timeInterval);
  }, []);

  // Auto-scroll to current meal type on mobile
  useEffect(() => {
    const currentMeal = getCurrentMealType();
    if (currentMeal) {
      const container = document.getElementById('menu-scroll-container');
      if (container && window.innerWidth < 768) { // Only on mobile
        const currentIndex = mealTypes.findIndex(meal => meal.key === currentMeal);
        if (currentIndex !== -1) {
          const cardWidth = 288; // w-72 = 18rem = 288px
          const gap = 16; // gap-4 = 1rem = 16px
          const scrollPosition = currentIndex * (cardWidth + gap);
          container.scrollTo({ left: scrollPosition, behavior: 'smooth' });
        }
      }
    }
  }, [currentTime, meals]);

  const loadTodaysMenu = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await messService.getTodaysMenuForUser();
      
      if (response.success && response.data) {
        setMeals(response.data);
      } else {
        setError('No meals available for today');
      }
    } catch (error: any) {
      console.error('Error loading today\'s menu:', error);
      setError(error.message || 'Failed to load today\'s menu');
    } finally {
      setLoading(false);
    }
  };

  const getMealsByType = (type: 'breakfast' | 'lunch' | 'dinner') => {
    return meals.filter(meal => meal.type === type);
  };

  const getCurrentMealType = () => {
    const hour = currentTime.getHours();
    // Removed excessive console logs - only log in development if needed
    // console.log('🕐 Current time:', currentTime.toLocaleTimeString(), 'Hour:', hour);
    
    if (hour >= 6 && hour < 11) {
      // console.log('🍳 Breakfast time detected');
      return 'breakfast';
    }
    if (hour >= 11 && hour < 16) {
      // console.log('🍽️ Lunch time detected');
      return 'lunch';
    }
    if (hour >= 16 && hour < 22) {
      // console.log('🌙 Dinner time detected');
      return 'dinner';
    }
    // console.log('❌ No meal time detected');
    return null;
  };

  const getMealTypeStatus = (type: 'breakfast' | 'lunch' | 'dinner') => {
    const hour = currentTime.getHours();
    
    if (type === 'breakfast') {
      if (hour >= 6 && hour < 11) return 'current';
      if (hour < 6) return 'upcoming';
      return 'past';
    }
    if (type === 'lunch') {
      if (hour >= 11 && hour < 16) return 'current';
      if (hour >= 6 && hour < 11) return 'upcoming';
      return 'past';
    }
    if (type === 'dinner') {
      if (hour >= 16 && hour < 22) return 'current';
      if (hour >= 11 && hour < 16) return 'upcoming';
      return 'past';
    }
    return 'past';
  };

  const scrollLeft = () => {
    const container = document.getElementById('menu-scroll-container');
    if (container) {
      const newPosition = Math.max(0, scrollPosition - 300);
      container.scrollTo({ left: newPosition, behavior: 'smooth' });
      setScrollPosition(newPosition);
    }
  };

  const scrollRight = () => {
    const container = document.getElementById('menu-scroll-container');
    if (container) {
      const maxScroll = container.scrollWidth - container.clientWidth;
      const newPosition = Math.min(maxScroll, scrollPosition + 300);
      container.scrollTo({ left: newPosition, behavior: 'smooth' });
      setScrollPosition(newPosition);
    }
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    const newPosition = container.scrollLeft;
    setScrollPosition(newPosition);
    setCanScrollLeft(newPosition > 0);
    setCanScrollRight(newPosition < container.scrollWidth - container.clientWidth);
  };

  const getMealTypeIcon = (type: string) => {
    switch (type) {
      case 'breakfast': 
        return <SunIcon className="w-6 h-6 text-orange-500" />;
      case 'lunch': 
        return <FireIcon className="w-6 h-6 text-yellow-500" />;
      case 'dinner': 
        return <MoonIcon className="w-6 h-6 text-indigo-500" />;
      default: 
        return <SparklesIcon className="w-6 h-6 text-gray-500" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'vegetarian': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'non-vegetarian': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      case 'vegan': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-300';
      case 'jain': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300';
      case 'eggetarian': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  const handleMealTypeClick = (mealType: 'breakfast' | 'lunch' | 'dinner') => {
    navigate(ROUTES.USER.MENU_DETAIL.replace(':mealType', mealType));
  };

  if (loading) {
    return (
      <div className={`bg-card rounded-xl border border-border p-6 ${className}`}>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-card rounded-xl border border-border p-6 ${className}`}>
        <div className="text-center py-8">
          <div className="text-6xl mb-4">🍽️</div>
          <h3 className="text-lg font-medium text-foreground mb-2">
            No Menu Available
          </h3>
          <p className="text-muted-foreground">
            {error}
          </p>
        </div>
      </div>
    );
  }

  const mealTypes = [
    { key: 'breakfast' as const, label: 'Breakfast' },
    { key: 'lunch' as const, label: 'Lunch' },
    { key: 'dinner' as const, label: 'Dinner' },
  ];

  return (
    <div className={`bg-card rounded-xl border border-border p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <SparklesIcon className="w-6 h-6 text-secondary-foreground" />
            Today's Menu
          </h2>
          <p className="text-sm text-secondary-foreground mt-1">
            Your meals for today based on your subscriptions
          </p>
        </div>
        <div className="flex items-center space-x-2 bg-green-100 dark:bg-green-900/20 px-3 py-2 rounded-full border border-green-200 dark:border-green-800">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm font-medium text-green-700 dark:text-green-300">Live</span>
        </div>
      </div>

      {/* Time-based Action Banner */}
      {getCurrentMealType() && (
        <div className="mb-4 p-3 bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-secondary-foreground">
                {getCurrentMealType() === 'breakfast' && 'Good Morning! Time for breakfast'}
                {getCurrentMealType() === 'lunch' && 'Lunch time! Check out today\'s menu'}
                {getCurrentMealType() === 'dinner' && 'Evening! Ready for dinner?'}
              </span>
            </div>
            <div className="text-xs text-muted-foreground">
              {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        </div>
      )}

      {/* Menu Cards - Horizontal Scroll on Mobile */}
      <div className="relative">
        {/* Scroll Buttons - Only show on mobile */}
        <div className="md:hidden flex justify-between items-center mb-4">
          <button
            onClick={scrollLeft}
            disabled={!canScrollLeft}
            className="p-2 rounded-full bg-background border border-border hover:bg-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeftIcon className="w-5 h-5" />
          </button>
          <span className="text-sm text-muted-foreground">Swipe to see all meals</span>
          <button
            onClick={scrollRight}
            disabled={!canScrollRight}
            className="p-2 rounded-full bg-background border border-border hover:bg-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRightIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Menu Cards Container */}
        <div 
          id="menu-scroll-container"
          className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory md:grid md:grid-cols-3 md:gap-4 md:overflow-visible md:pb-0 md:snap-none [&::-webkit-scrollbar]:hidden"
          onScroll={handleScroll}
          style={{ 
            scrollbarWidth: 'none', 
            msOverflowStyle: 'none'
          }}
        >
          {mealTypes.map((mealType) => {
            const typeMeals = getMealsByType(mealType.key);
            const status = getMealTypeStatus(mealType.key);
            const isCurrent = status === 'current';
            const isUpcoming = status === 'upcoming';
            const isPast = status === 'past';
            
            return (
              <div 
                key={mealType.key} 
                className={`bg-card rounded-xl border overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-[1.02] hover:border-primary/50 group flex-shrink-0 w-65 sm:w-80 md:w-auto snap-center ${
                  isCurrent 
                    ? 'border-primary shadow-lg ring-2 ring-primary/20' 
                    : isUpcoming 
                    ? 'border-yellow-300 dark:border-yellow-600' 
                    : 'border-border'
                }`}
                onClick={() => handleMealTypeClick(mealType.key)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleMealTypeClick(mealType.key);
                  }
                }}
                tabIndex={0}
                role="button"
                aria-label={`View ${mealType.label} menu details`}
              >
              {/* Card Header */}
              <div className={`p-4 border-b border-border ${
                isCurrent 
                  ? 'bg-primary/5 border-primary/20' 
                  : isUpcoming 
                  ? 'bg-yellow-50 dark:bg-yellow-900/10 border-yellow-200 dark:border-yellow-800' 
                  : 'bg-muted/30'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg border ${
                      isCurrent 
                        ? 'bg-primary/10 border-primary/30' 
                        : isUpcoming 
                        ? 'bg-yellow-100 dark:bg-yellow-900/20 border-yellow-300 dark:border-yellow-700' 
                        : 'bg-background border-border'
                    }`}>
                      {getMealTypeIcon(mealType.key)}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">
                        {mealType.label}
                      </h3>
                      {isCurrent && (
                        <div className="flex items-center space-x-1 mt-1">
                          <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                          <span className="text-xs text-primary font-medium">Now</span>
                        </div>
                      )}
                      {isUpcoming && (
                        <div className="flex items-center space-x-1 mt-1">
                          <ClockIcon className="w-3 h-3 text-yellow-600 dark:text-yellow-400" />
                          <span className="text-xs text-yellow-600 dark:text-yellow-400 font-medium">Upcoming</span>
                        </div>
                      )}
                      {isPast && (
                        <div className="flex items-center space-x-1 mt-1">
                          <span className="text-xs text-muted-foreground">Completed</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-muted-foreground group-hover:text-primary transition-colors">
                    <ArrowRightIcon className="w-5 h-5" />
                  </div>
                </div>
              </div>

              {/* Card Content */}
              <div className="p-4">
                {typeMeals.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full border-2 border-dashed border-border flex items-center justify-center bg-muted/50">
                      <ExclamationCircleIcon className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <p className="text-sm font-medium text-foreground mb-1">
                      No {mealType.label.toLowerCase()} planned
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Check with your mess for today's menu
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {typeMeals.map((meal) => (
                      <div key={meal.id} className="bg-background rounded-lg p-3 border border-border hover:border-primary/50 transition-colors">
                        <div className="flex items-start space-x-3">
                          {meal.imageUrl && (
                            <img
                              src={meal.imageUrl}
                              alt={meal.name}
                              className="w-12 h-12 object-cover rounded-lg border border-border flex-shrink-0"
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-foreground truncate">
                              {meal.name}
                            </h4>
                            {meal.description && (
                              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                {meal.description}
                              </p>
                            )}
                            
                            {/* Categories */}
                            <div className="flex flex-wrap gap-1 mt-2">
                              {meal.categories && meal.categories.length > 0 ? (
                                meal.categories.map((category, index) => (
                                  <span
                                    key={index}
                                    className={`px-2 py-1 text-xs rounded-full ${getCategoryColor(category)}`}
                                  >
                                    {category}
                                  </span>
                                ))
                              ) : (
                                <span className={`px-2 py-1 text-xs rounded-full ${getCategoryColor(meal.category)}`}>
                                  {meal.category}
                                </span>
                              )}
                            </div>

                            {/* Tags */}
                            {meal.tags && meal.tags.length > 0 && (
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

                            {/* Mess and Plan Info */}
                            <div className="mt-2 text-xs text-secondary-foreground">
                              <p>From: <span className="font-medium text-foreground">{meal.messName}</span></p>
                              <p>Plan: <span className="font-medium text-foreground">{meal.mealPlanName}</span></p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
        </div>
      </div>

      {/* Refresh Button */}
      <div className="mt-6 text-center">
        <button
          onClick={loadTodaysMenu}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary border border-primary rounded-lg hover:bg-primary hover:text-primary-foreground transition-colors"
        >
          <ClockIcon className="w-4 h-4" />
          Refresh Menu
        </button>
      </div>
    </div>
  );
};

export default TodaysMenu;
