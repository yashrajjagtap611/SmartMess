import React from 'react';
import { MealPlan } from '../MealManagement.types';
import { formatPrice } from '../MealManagement.utils';

interface MealPlansSectionProps {
  mealPlans: MealPlan[];
  loading: boolean;
  onDeletePlan: (id: string) => Promise<void>;
  selectedPlan: MealPlan | null;
  onSelectPlan: (plan: MealPlan | null) => void;
}

export const MealPlansSection: React.FC<MealPlansSectionProps> = ({
  mealPlans,
  loading,
  onDeletePlan,
  selectedPlan,
  onSelectPlan,
}) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-SmartMess-light-primary dark:SmartMess-dark-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-SmartMess-light-text dark:SmartMess-dark-text dark:text-SmartMess-light-text dark:SmartMess-dark-text">
          Meal Plans
        </h2>
        <button className="px-4 py-2 text-sm font-medium text-white bg-SmartMess-light-primary dark:SmartMess-dark-primary hover:bg-SmartMess-light-primary dark:SmartMess-dark-primary/90 rounded-lg transition-colors">
          + Add New Plan
        </button>
      </div>

      {mealPlans.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🍽️</div>
          <h3 className="text-lg font-medium text-SmartMess-light-text dark:SmartMess-dark-text dark:text-SmartMess-light-text dark:SmartMess-dark-text mb-2">
            No meal plans yet
          </h3>
          <p className="text-SmartMess-light-text dark:SmartMess-dark-text-muted dark:text-SmartMess-light-text dark:SmartMess-dark-text-muted mb-4">
            Create your first meal plan to get started
          </p>
          <button className="px-6 py-3 text-sm font-medium text-white bg-SmartMess-light-primary dark:SmartMess-dark-primary hover:bg-SmartMess-light-primary dark:SmartMess-dark-primary/90 rounded-lg transition-colors">
            Create Meal Plan
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mealPlans.map((plan) => (
            <div
              key={plan.id}
              className={`p-6 rounded-lg border transition-all duration-200 cursor-pointer ${
                selectedPlan?.id === plan.id
                  ? 'border-SmartMess-light-primary dark:SmartMess-dark-primary bg-SmartMess-light-primary dark:SmartMess-dark-primary/5 dark:bg-SmartMess-light-primary dark:SmartMess-dark-primary/10'
                  : 'SmartMess-light-border dark:SmartMess-dark-SmartMess-light-border dark:SmartMess-dark-border dark:SmartMess-light-border dark:SmartMess-dark-SmartMess-light-border dark:SmartMess-dark-border bg-SmartMess-light-surface dark:SmartMess-dark-surface dark:bg-SmartMess-light-surface dark:SmartMess-dark-surface hover:border-SmartMess-light-primary dark:SmartMess-dark-primary/50 dark:hover:border-SmartMess-light-primary dark:SmartMess-dark-primary/50'
              }`}
              onClick={() => onSelectPlan(plan)}
            >
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-lg font-semibold text-SmartMess-light-text dark:SmartMess-dark-text dark:text-SmartMess-light-text dark:SmartMess-dark-text">
                  {plan.name}
                </h3>
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-full ${
                    plan.isActive
                      ? 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/20'
                      : 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900/20'
                  }`}
                >
                  {plan.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              
              <p className="text-SmartMess-light-text dark:SmartMess-dark-text-muted dark:text-SmartMess-light-text dark:SmartMess-dark-text-muted text-sm mb-4">
                {plan.description}
              </p>
              
              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-SmartMess-light-text dark:SmartMess-dark-text-muted dark:text-SmartMess-light-text dark:SmartMess-dark-text-muted">Price:</span>
                  <span className="font-medium text-SmartMess-light-text dark:SmartMess-dark-text dark:text-SmartMess-light-text dark:SmartMess-dark-text">
                    {formatPrice(plan.price)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-SmartMess-light-text dark:SmartMess-dark-text-muted dark:text-SmartMess-light-text dark:SmartMess-dark-text-muted">Meals per day:</span>
                  <span className="font-medium text-SmartMess-light-text dark:SmartMess-dark-text dark:text-SmartMess-light-text dark:SmartMess-dark-text">
                    {plan.mealsPerDay}
                  </span>
                </div>
              </div>
              
              <div className="flex space-x-2">
                <button
                  className="flex-1 px-3 py-2 text-xs font-medium text-SmartMess-light-primary dark:SmartMess-dark-primary border border-SmartMess-light-primary dark:SmartMess-dark-primary rounded-md hover:bg-SmartMess-light-primary dark:SmartMess-dark-primary hover:text-white transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    // TODO: Implement edit functionality
                  }}
                >
                  Edit
                </button>
                <button
                  className="flex-1 px-3 py-2 text-xs font-medium text-red-600 border border-red-600 rounded-md hover:bg-red-600 hover:text-white transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeletePlan(plan.id);
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
