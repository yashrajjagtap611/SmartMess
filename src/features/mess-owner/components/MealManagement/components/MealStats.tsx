import React from 'react';
import { MealPlan, Meal } from '../MealManagement.types';
import { getMealStats, calculateTotalRevenue, getActiveMealPlans, getMealPlanStats } from '../MealManagement.utils';

interface MealStatsProps {
  meals: Meal[];
  mealPlans: MealPlan[];
  loading: boolean;
}

export const MealStats: React.FC<MealStatsProps> = ({
  meals,
  mealPlans,
  loading,
}) => {
  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-SmartMess-light-primary dark:SmartMess-dark-primary"></div>
        </div>
      </div>
    );
  }

  const mealStats = getMealStats(meals);
  const totalRevenue = calculateTotalRevenue(meals);
  const activePlans = getActiveMealPlans(mealPlans);
  const mealPlanStats = getMealPlanStats(meals, mealPlans);

  const stats = [
    {
      title: 'Total Meals',
      value: mealStats.totalMeals,
      icon: '🍽️',
      color: 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/20',
    },
    {
      title: 'Available Meals',
      value: mealStats.availableMeals,
      icon: '✅',
      color: 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/20',
    },
    {
      title: 'Unavailable Meals',
      value: mealStats.unavailableMeals,
      icon: '❌',
      color: 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/20',
    },
    {
      title: 'Active Meal Plans',
      value: activePlans.length,
      icon: '📋',
      color: 'text-purple-600 bg-purple-100 dark:text-purple-400 dark:bg-purple-900/20',
    },
    {
      title: 'Total Revenue',
      value: `₹${totalRevenue.toLocaleString()}`,
      icon: '💰',
      color: 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/20',
    },
    {
      title: 'Availability Rate',
      value: `${mealStats.availabilityRate.toFixed(1)}%`,
      icon: '📊',
      color: 'text-indigo-600 bg-indigo-100 dark:text-indigo-400 dark:bg-indigo-900/20',
    },
  ];

  const mealTypeStats = [
    {
      type: 'Breakfast',
      count: mealStats.breakfastCount,
      icon: '🌅',
      color: 'text-orange-600 bg-orange-100 dark:text-orange-400 dark:bg-orange-900/20',
    },
    {
      type: 'Lunch',
      count: mealStats.lunchCount,
      icon: '☀️',
      color: 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/20',
    },
    {
      type: 'Dinner',
      count: mealStats.dinnerCount,
      icon: '🌙',
      color: 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/20',
    },
  ];

  const mealCategoryStats = [
    {
      type: 'Vegetarian',
      count: mealStats.vegetarianCount,
      icon: '🥬',
      color: 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/20',
    },
    {
      type: 'Non-Vegetarian',
      count: mealStats.nonVegetarianCount,
      icon: '🍗',
      color: 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/20',
    },
    {
      type: 'Vegan',
      count: mealStats.veganCount,
      icon: '🌱',
      color: 'text-emerald-600 bg-emerald-100 dark:text-emerald-400 dark:bg-emerald-900/20',
    },
    {
      type: 'Jain',
      count: mealStats.jainCount,
      icon: '🕉️',
      color: 'text-purple-600 bg-purple-100 dark:text-purple-400 dark:bg-purple-900/20',
    },
    {
      type: 'Eggetarian',
      count: mealStats.eggetarianCount,
      icon: '🥚',
      color: 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/20',
    },
  ];

  return (
    <div className="p-6 space-y-8">
      <div>
        <h2 className="text-xl font-semibold text-SmartMess-light-text dark:SmartMess-dark-text dark:text-SmartMess-light-text dark:SmartMess-dark-text mb-6">
          Meal Management Statistics
        </h2>
        
        {/* Main Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="p-6 rounded-lg border SmartMess-light-border dark:SmartMess-dark-SmartMess-light-border dark:SmartMess-dark-border dark:SmartMess-light-border dark:SmartMess-dark-SmartMess-light-border dark:SmartMess-dark-border bg-SmartMess-light-surface dark:SmartMess-dark-surface dark:bg-SmartMess-light-surface dark:SmartMess-dark-surface"
            >
              <div className="flex items-center space-x-4">
                <div className={`text-3xl ${stat.color} p-3 rounded-full`}>
                  {stat.icon}
                </div>
                <div>
                  <p className="text-sm text-SmartMess-light-text dark:SmartMess-dark-text-muted dark:text-SmartMess-light-text dark:SmartMess-dark-text-muted">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold text-SmartMess-light-text dark:SmartMess-dark-text dark:text-SmartMess-light-text dark:SmartMess-dark-text">
                    {stat.value}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Detailed Statistics Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Meal Type Distribution */}
          <div className="p-6 rounded-lg border SmartMess-light-border dark:SmartMess-dark-SmartMess-light-border dark:SmartMess-dark-border dark:SmartMess-light-border dark:SmartMess-dark-SmartMess-light-border dark:SmartMess-dark-border bg-SmartMess-light-surface dark:SmartMess-dark-surface dark:bg-SmartMess-light-surface dark:SmartMess-dark-surface">
            <h3 className="text-lg font-semibold text-SmartMess-light-text dark:SmartMess-dark-text dark:text-SmartMess-light-text dark:SmartMess-dark-text mb-4">
              Meal Type Distribution
            </h3>
            <div className="space-y-4">
              {mealTypeStats.map((stat, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className={`text-xl ${stat.color} p-2 rounded-full`}>
                      {stat.icon}
                    </span>
                    <span className="text-SmartMess-light-text dark:SmartMess-dark-text dark:text-SmartMess-light-text dark:SmartMess-dark-text font-medium">
                      {stat.type}
                    </span>
                  </div>
                  <span className="text-lg font-bold text-SmartMess-light-text dark:SmartMess-dark-text dark:text-SmartMess-light-text dark:SmartMess-dark-text">
                    {stat.count}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Meal Category Distribution */}
          <div className="p-6 rounded-lg border SmartMess-light-border dark:SmartMess-dark-SmartMess-light-border dark:SmartMess-dark-border dark:SmartMess-light-border dark:SmartMess-dark-SmartMess-light-border dark:SmartMess-dark-border bg-SmartMess-light-surface dark:SmartMess-dark-surface dark:bg-SmartMess-light-surface dark:SmartMess-dark-surface">
            <h3 className="text-lg font-semibold text-SmartMess-light-text dark:SmartMess-dark-text dark:text-SmartMess-light-text dark:SmartMess-dark-text mb-4">
              Meal Category Distribution
            </h3>
            <div className="space-y-4">
              {mealCategoryStats.map((stat, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className={`text-xl ${stat.color} p-2 rounded-full`}>
                      {stat.icon}
                    </span>
                    <span className="text-SmartMess-light-text dark:SmartMess-dark-text dark:text-SmartMess-light-text dark:SmartMess-dark-text font-medium">
                      {stat.type}
                    </span>
                  </div>
                  <span className="text-lg font-bold text-SmartMess-light-text dark:SmartMess-dark-text dark:text-SmartMess-light-text dark:SmartMess-dark-text">
                    {stat.count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Meal Plan Performance */}
        {mealPlanStats.length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-SmartMess-light-text dark:SmartMess-dark-text dark:text-SmartMess-light-text dark:SmartMess-dark-text mb-4">
              Meal Plan Performance
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {mealPlanStats.map((plan, index) => (
                <div
                  key={index}
                  className="p-4 rounded-lg border SmartMess-light-border dark:SmartMess-dark-SmartMess-light-border dark:SmartMess-dark-border dark:SmartMess-light-border dark:SmartMess-dark-SmartMess-light-border dark:SmartMess-dark-border bg-SmartMess-light-surface dark:SmartMess-dark-surface dark:bg-SmartMess-light-surface dark:SmartMess-dark-surface"
                >
                  <h4 className="font-medium text-SmartMess-light-text dark:SmartMess-dark-text dark:text-SmartMess-light-text dark:SmartMess-dark-text mb-2">
                    {plan.planName}
                  </h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-SmartMess-light-text dark:SmartMess-dark-text-muted dark:text-SmartMess-light-text dark:SmartMess-dark-text-muted">Meals:</span>
                      <span className="text-SmartMess-light-text dark:SmartMess-dark-text dark:text-SmartMess-light-text dark:SmartMess-dark-text">{plan.mealCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-SmartMess-light-text dark:SmartMess-dark-text-muted dark:text-SmartMess-light-text dark:SmartMess-dark-text-muted">Revenue:</span>
                      <span className="text-SmartMess-light-text dark:SmartMess-dark-text dark:text-SmartMess-light-text dark:SmartMess-dark-text">₹{plan.totalRevenue.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-SmartMess-light-text dark:SmartMess-dark-text-muted dark:text-SmartMess-light-text dark:SmartMess-dark-text-muted">Avg Price:</span>
                      <span className="text-SmartMess-light-text dark:SmartMess-dark-text dark:text-SmartMess-light-text dark:SmartMess-dark-text">₹{plan.averagePrice.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Activity */}
        <div className="p-6 rounded-lg border SmartMess-light-border dark:SmartMess-dark-SmartMess-light-border dark:SmartMess-dark-border dark:SmartMess-light-border dark:SmartMess-dark-SmartMess-light-border dark:SmartMess-dark-border bg-SmartMess-light-surface dark:SmartMess-dark-surface dark:bg-SmartMess-light-surface dark:SmartMess-dark-surface">
          <h3 className="text-lg font-semibold text-SmartMess-light-text dark:SmartMess-dark-text dark:text-SmartMess-light-text dark:SmartMess-dark-text mb-4">
            Recent Activity
          </h3>
          <div className="space-y-3">
            {meals.slice(0, 5).map((meal, index) => (
              <div key={index} className="flex items-center space-x-3 text-sm">
                <span className="text-SmartMess-light-text dark:SmartMess-dark-text-muted dark:text-SmartMess-light-text dark:SmartMess-dark-text-muted">
                  {meal.type.charAt(0).toUpperCase() + meal.type.slice(1)}
                </span>
                <span className="text-SmartMess-light-text dark:SmartMess-dark-text dark:text-SmartMess-light-text dark:SmartMess-dark-text">
                  {meal.name}
                </span>
                <span className="text-SmartMess-light-text dark:SmartMess-dark-text-muted dark:text-SmartMess-light-text dark:SmartMess-dark-text-muted">
                  added
                </span>
                {meal.category && (
                  <span className={`px-2 py-1 text-xs rounded-full ${meal.category === 'vegetarian' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {meal.category}
                  </span>
                )}
              </div>
            ))}
            {meals.length === 0 && (
              <p className="text-SmartMess-light-text dark:SmartMess-dark-text-muted dark:text-SmartMess-light-text dark:SmartMess-dark-text-muted text-sm">
                No recent activity
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
