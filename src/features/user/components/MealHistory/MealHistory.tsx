import React, { useState, useEffect } from 'react';
import { 
  ClockIcon, 
  CheckCircleIcon,
  ArrowPathIcon,
  CalendarDaysIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';
import { 
  SunIcon, 
  FireIcon, 
  MoonIcon 
} from '@heroicons/react/24/solid';
import mealActivationService, { MealActivation } from '@/services/api/mealActivationService';

interface MealHistoryProps {
  className?: string;
  limit?: number;
}

const MealHistory: React.FC<MealHistoryProps> = ({ className = '', limit = 50 }) => {
  const [mealHistory, setMealHistory] = useState<MealActivation[]>([]);
  const [activeMeals, setActiveMeals] = useState<MealActivation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'active' | 'history'>('active');

  useEffect(() => {
    loadMealData();
  }, [limit]);

  const loadMealData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Load both active meals and history in parallel
      const [activeMealsData, historyData] = await Promise.all([
        mealActivationService.getActiveMeals(),
        mealActivationService.getMealHistory(limit)
      ]);
      
      setActiveMeals(activeMealsData);
      setMealHistory(historyData);
    } catch (error: any) {
      console.error('Error loading meal data:', error);
      setError(error.message || 'Failed to load meal data');
    } finally {
      setLoading(false);
    }
  };

  const getMealTypeIcon = (type: string) => {
    switch (type) {
      case 'breakfast':
        return <SunIcon className="w-5 h-5 text-orange-500" />;
      case 'lunch':
        return <FireIcon className="w-5 h-5 text-yellow-500" />;
      case 'dinner':
        return <MoonIcon className="w-5 h-5 text-indigo-500" />;
      default:
        return <ClockIcon className="w-5 h-5 text-gray-500" />;
    }
  };

  const formatDateTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).format(new Date(date));
  };

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).format(new Date(date));
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'activated':
        return (
          <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300 rounded-full">
            <CheckCircleIcon className="w-3 h-3 mr-1" />
            Activated
          </span>
        );
      case 'generated':
        return (
          <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300 rounded-full">
            <ClockIcon className="w-3 h-3 mr-1" />
            Ready
          </span>
        );
      case 'expired':
        return (
          <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300 rounded-full">
            <ExclamationCircleIcon className="w-3 h-3 mr-1" />
            Expired
          </span>
        );
      default:
        return null;
    }
  };

  const renderMealCard = (meal: MealActivation, showDate: boolean = false) => (
    <div key={meal.id} className="bg-background border border-border rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start space-x-4">
        {/* Meal Image or Icon */}
        {meal.meal?.imageUrl ? (
          <img
            src={meal.meal.imageUrl}
            alt={meal.meal.name}
            className="w-12 h-12 object-cover rounded-lg border border-border flex-shrink-0"
          />
        ) : (
          <div className="w-12 h-12 bg-muted rounded-lg border border-border flex items-center justify-center flex-shrink-0">
            {getMealTypeIcon(meal.mealType)}
          </div>
        )}

        {/* Meal Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-medium text-foreground">
                {meal.meal?.name || `${meal.mealType} meal`}
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                {meal.mess?.name || 'Unknown Mess'}
              </p>
              {meal.meal?.description && (
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                  {meal.meal.description}
                </p>
              )}
            </div>
            
            <div className="flex flex-col items-end space-y-2">
              {getStatusBadge(meal.status)}
              <div className="text-xs text-muted-foreground text-right">
                {meal.status === 'activated' && meal.activatedAt ? (
                  <div>
                    {showDate ? formatDateTime(meal.activatedAt) : formatTime(meal.activatedAt)}
                  </div>
                ) : meal.status === 'generated' && meal.expiresAt ? (
                  <div>
                    Expires: {formatTime(meal.expiresAt)}
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          {/* QR Code Preview for Active Meals */}
          {meal.status === 'generated' && meal.qrCode && (
            <div className="mt-3 flex items-center space-x-3">
              <div className="w-16 h-16 border border-border rounded-lg overflow-hidden bg-white p-1">
                <img
                  src={meal.qrCode}
                  alt="QR Code"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="text-sm text-muted-foreground">
                <p>Show this QR code to activate your meal</p>
                <p className="text-xs">Expires: {formatTime(meal.expiresAt)}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className={`bg-card rounded-xl border border-border p-6 ${className}`}>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-card rounded-xl border border-border p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <CalendarDaysIcon className="w-6 h-6 text-primary" />
            My Meals
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Track your meal activations and QR codes
          </p>
        </div>
        <button
          onClick={loadMealData}
          className="p-2 hover:bg-accent rounded-lg transition-colors"
          title="Refresh meals"
        >
          <ArrowPathIcon className="w-5 h-5 text-muted-foreground" />
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 mb-6 bg-muted p-1 rounded-lg">
        <button
          onClick={() => setActiveTab('active')}
          className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
            activeTab === 'active'
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Active Meals ({activeMeals.length})
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
            activeTab === 'history'
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          History ({mealHistory.length})
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <div className="flex items-center space-x-2">
            <ExclamationCircleIcon className="w-5 h-5 text-red-600 dark:text-red-400" />
            <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="space-y-4">
        {activeTab === 'active' ? (
          activeMeals.length === 0 ? (
            <div className="text-center py-8">
              <ClockIcon className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                No Active Meals
              </h3>
              <p className="text-muted-foreground">
                Generate QR codes for today's meals to see them here.
              </p>
            </div>
          ) : (
            activeMeals.map(meal => renderMealCard(meal, false))
          )
        ) : (
          mealHistory.length === 0 ? (
            <div className="text-center py-8">
              <CalendarDaysIcon className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                No Meal History
              </h3>
              <p className="text-muted-foreground">
                Your activated meals will appear here.
              </p>
            </div>
          ) : (
            mealHistory.map(meal => renderMealCard(meal, true))
          )
        )}
      </div>

      {/* Stats Footer */}
      {(activeMeals.length > 0 || mealHistory.length > 0) && (
        <div className="mt-6 pt-4 border-t border-border">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-primary">{activeMeals.length}</div>
              <div className="text-sm text-muted-foreground">Active Today</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">{mealHistory.length}</div>
              <div className="text-sm text-muted-foreground">Total Activated</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MealHistory;
