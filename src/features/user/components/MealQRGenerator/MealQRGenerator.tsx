import React, { useState, useEffect } from 'react';
import { 
  QrCodeIcon, 
  ClockIcon, 
  CheckCircleIcon,
  ExclamationCircleIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { 
  SunIcon, 
  FireIcon, 
  MoonIcon 
} from '@heroicons/react/24/solid';
import mealActivationService, { AvailableMeal, QRCodeGenerationResult } from '@/services/api/mealActivationService';

interface MealQRGeneratorProps {
  className?: string;
}

const MealQRGenerator: React.FC<MealQRGeneratorProps> = ({ className = '' }) => {
  const [availableMeals, setAvailableMeals] = useState<AvailableMeal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [generatingQR, setGeneratingQR] = useState<string | null>(null);
  const [generatedQRs, setGeneratedQRs] = useState<Map<string, QRCodeGenerationResult>>(new Map());
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    loadAvailableMeals();
    
    // Update time every minute
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timeInterval);
  }, []);

  const loadAvailableMeals = async () => {
    try {
      setLoading(true);
      setError(null);
      const meals = await mealActivationService.getTodaysMeals();
      setAvailableMeals(meals);
    } catch (error: any) {
      console.error('Error loading available meals:', error);
      setError(error.message || 'Failed to load available meals');
    } finally {
      setLoading(false);
    }
  };

  const generateQRCode = async (meal: AvailableMeal) => {
    try {
      setGeneratingQR(meal.id);
      setError(null);
      
      const result = await mealActivationService.generateQRCode(meal.id, meal.type);
      
      // Update the generated QRs map
      setGeneratedQRs(prev => new Map(prev.set(meal.id, result)));
      
      // Update the meal's hasQRCode status
      setAvailableMeals(prev => 
        prev.map(m => 
          m.id === meal.id 
            ? { ...m, hasQRCode: true, canGenerate: false }
            : m
        )
      );
      
    } catch (error: any) {
      console.error('Error generating QR code:', error);
      setError(error.message || 'Failed to generate QR code');
    } finally {
      setGeneratingQR(null);
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
        return <QrCodeIcon className="w-5 h-5 text-gray-500" />;
    }
  };

  const getMealTypeStatus = (type: string) => {
    const hour = currentTime.getHours();
    
    switch (type) {
      case 'breakfast':
        if (hour >= 6 && hour < 11) return 'current';
        if (hour < 6) return 'upcoming';
        return 'past';
      case 'lunch':
        if (hour >= 11 && hour < 16) return 'current';
        if (hour >= 6 && hour < 11) return 'upcoming';
        return 'past';
      case 'dinner':
        if (hour >= 16 && hour < 22) return 'current';
        if (hour >= 11 && hour < 16) return 'upcoming';
        return 'past';
      default:
        return 'past';
    }
  };

  const getTimeRemaining = (expiresAt: Date): string => {
    const now = new Date();
    const diff = expiresAt.getTime() - now.getTime();

    if (diff <= 0) {
      return 'Expired';
    }

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 0) {
      return `${hours}h ${minutes}m left`;
    } else {
      return `${minutes}m left`;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'vegetarian':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'non-vegetarian':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      case 'vegan':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-300';
      case 'jain':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300';
      case 'eggetarian':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
    }
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

  if (error && availableMeals.length === 0) {
    return (
      <div className={`bg-card rounded-xl border border-border p-6 ${className}`}>
        <div className="text-center py-8">
          <ExclamationCircleIcon className="w-16 h-16 mx-auto text-red-500 mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">
            Unable to Load Meals
          </h3>
          <p className="text-muted-foreground mb-4">{error}</p>
          <button
            onClick={loadAvailableMeals}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            Try Again
          </button>
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
            <QrCodeIcon className="w-6 h-6 text-primary" />
            Meal QR Codes
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Generate QR codes for your meals today
          </p>
        </div>
        <button
          onClick={loadAvailableMeals}
          className="p-2 hover:bg-accent rounded-lg transition-colors"
          title="Refresh meals"
        >
          <ArrowPathIcon className="w-5 h-5 text-muted-foreground" />
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

      {/* Meals List */}
      {availableMeals.length === 0 ? (
        <div className="text-center py-8">
          <QrCodeIcon className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">
            No Meals Available
          </h3>
          <p className="text-muted-foreground">
            No meals found for today. Check back later or contact your mess.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {availableMeals.map((meal) => {
            const status = getMealTypeStatus(meal.type);
            const qrResult = generatedQRs.get(meal.id);
            const isGenerating = generatingQR === meal.id;
            const isCurrent = status === 'current';
            const isUpcoming = status === 'upcoming';
            const isPast = status === 'past';

            return (
              <div
                key={meal.id}
                className={`border rounded-lg p-4 transition-all ${
                  isCurrent
                    ? 'border-primary bg-primary/5'
                    : isUpcoming
                    ? 'border-yellow-300 dark:border-yellow-600 bg-yellow-50 dark:bg-yellow-900/10'
                    : 'border-border bg-background'
                }`}
              >
                <div className="flex items-start space-x-4">
                  {/* Meal Image */}
                  {meal.imageUrl ? (
                    <img
                      src={meal.imageUrl}
                      alt={meal.name}
                      className="w-16 h-16 object-cover rounded-lg border border-border flex-shrink-0"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-muted rounded-lg border border-border flex items-center justify-center flex-shrink-0">
                      {getMealTypeIcon(meal.type)}
                    </div>
                  )}

                  {/* Meal Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-foreground flex items-center gap-2">
                          {meal.name}
                          {isCurrent && (
                            <span className="px-2 py-1 text-xs bg-primary text-primary-foreground rounded-full">
                              Now
                            </span>
                          )}
                          {isUpcoming && (
                            <span className="px-2 py-1 text-xs bg-yellow-500 text-white rounded-full">
                              Upcoming
                            </span>
                          )}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {meal.description || `${meal.type} from ${meal.messName}`}
                        </p>

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
                      </div>

                      {/* QR Code Section */}
                      <div className="flex-shrink-0 ml-4">
                        {qrResult ? (
                          <div className="text-center space-y-2">
                            <div className="w-24 h-24 border border-border rounded-lg overflow-hidden bg-white p-1">
                              <img
                                src={qrResult.qrCode}
                                alt="Meal QR Code"
                                className="w-full h-full object-contain"
                              />
                            </div>
                            <div className="text-xs text-muted-foreground">
                              <div className="flex items-center justify-center gap-1">
                                <ClockIcon className="w-3 h-3" />
                                {getTimeRemaining(qrResult.expiresAt)}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => generateQRCode(meal)}
                            disabled={isGenerating || meal.hasQRCode || isPast}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                              isPast
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : meal.hasQRCode
                                ? 'bg-green-100 text-green-700 cursor-not-allowed'
                                : 'bg-primary text-primary-foreground hover:bg-primary/90'
                            }`}
                          >
                            {isGenerating ? (
                              <div className="flex items-center gap-2">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                                Generating...
                              </div>
                            ) : meal.hasQRCode ? (
                              <div className="flex items-center gap-2">
                                <CheckCircleIcon className="w-4 h-4" />
                                Generated
                              </div>
                            ) : isPast ? (
                              'Time Passed'
                            ) : (
                              <div className="flex items-center gap-2">
                                <QrCodeIcon className="w-4 h-4" />
                                Generate QR
                              </div>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Info Footer */}
      <div className="mt-6 p-4 bg-muted/50 rounded-lg">
        <div className="flex items-start space-x-2">
          <ExclamationCircleIcon className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-muted-foreground">
            <p className="font-medium text-foreground mb-1">How to use:</p>
            <ul className="space-y-1">
              <li>• Generate QR codes for meals during their serving times</li>
              <li>• Show the QR code to mess staff or scan it yourself to activate your meal</li>
              <li>• QR codes expire at the end of each meal period</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MealQRGenerator;
