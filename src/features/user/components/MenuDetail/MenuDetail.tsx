import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Clock, MapPin, Tag, Star } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import messService from '@/services/api/messService';

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
  price?: number;
  nutritionalInfo?: {
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
    fiber?: number;
  };
  allergens?: string[];
  preparationTime?: number;
  servingSize?: string;
}

const MenuDetail: React.FC = () => {
  const { mealType } = useParams<{ mealType: string }>();
  const navigate = useNavigate();
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadTodaysMenu();
  }, []);

  const loadTodaysMenu = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await messService.getTodaysMenuForUser();
      
      if (response.success && response.data) {
        // Filter meals by the selected meal type
        const filteredMeals = response.data.filter((meal: Meal) => 
          meal.type === mealType
        );
        setMeals(filteredMeals);
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

  const getMealTypeIcon = (type: string) => {
    switch (type) {
      case 'breakfast': return '🌅';
      case 'lunch': return '☀️';
      case 'dinner': return '🌙';
      default: return '🍽️';
    }
  };

  const getMealTypeLabel = (type: string) => {
    switch (type) {
      case 'breakfast': return 'Breakfast';
      case 'lunch': return 'Lunch';
      case 'dinner': return 'Dinner';
      default: return 'Meal';
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

  const handleBackClick = () => {
    navigate('/user');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-SmartMess-light-bg dark:SmartMess-dark-bg dark:bg-SmartMess-light-bg dark:SmartMess-dark-bg">
        <Header
          title={`${getMealTypeLabel(mealType || '')} Menu`}
          subtitle="Today's delicious meals"
          showBackButton
          onBackClick={handleBackClick}
        />
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-SmartMess-light-primary dark:SmartMess-dark-primary"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-SmartMess-light-bg dark:SmartMess-dark-bg dark:bg-SmartMess-light-bg dark:SmartMess-dark-bg">
        <Header
          title={`${getMealTypeLabel(mealType || '')} Menu`}
          subtitle="Today's delicious meals"
          showBackButton
          onBackClick={handleBackClick}
        />
        <div className="text-center py-20">
          <div className="text-8xl mb-6">🍽️</div>
          <h3 className="text-2xl font-medium text-SmartMess-light-text dark:SmartMess-dark-text dark:text-SmartMess-light-text dark:SmartMess-dark-text mb-4">
            No Menu Available
          </h3>
          <p className="text-SmartMess-light-text dark:SmartMess-dark-text-muted dark:text-SmartMess-light-text dark:SmartMess-dark-text-muted text-lg">
            {error}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-SmartMess-light-bg dark:SmartMess-dark-bg dark:bg-SmartMess-light-bg dark:SmartMess-dark-bg">
      <Header
        title={`${getMealTypeIcon(mealType || '')} ${getMealTypeLabel(mealType || '')} Menu`}
        subtitle="Today's delicious meals"
        showBackButton
        onBackClick={handleBackClick}
      />
      
      <div className="container mx-auto px-4 py-6">
        {meals.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-24 h-24 mx-auto mb-6 rounded-2xl border-2 border-dashed SmartMess-light-border dark:SmartMess-dark-SmartMess-light-border dark:SmartMess-dark-border dark:SmartMess-light-border dark:SmartMess-dark-SmartMess-light-border dark:SmartMess-dark-border flex items-center justify-center">
              <span className="text-4xl text-SmartMess-light-text dark:SmartMess-dark-text-muted dark:text-SmartMess-light-text dark:SmartMess-dark-text-muted">◎</span>
            </div>
            <h3 className="text-2xl font-medium text-SmartMess-light-text dark:SmartMess-dark-text dark:text-SmartMess-light-text dark:SmartMess-dark-text mb-4">
              No {getMealTypeLabel(mealType || '')} Planned
            </h3>
            <p className="text-SmartMess-light-text dark:SmartMess-dark-text-muted dark:text-SmartMess-light-text dark:SmartMess-dark-text-muted text-lg">
              Check back later or contact your mess for today's menu
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {meals.map((meal) => (
              <div
                key={meal.id}
                className="bg-SmartMess-light-surface dark:SmartMess-dark-surface dark:bg-SmartMess-light-surface dark:SmartMess-dark-surface rounded-2xl border SmartMess-light-border dark:SmartMess-dark-SmartMess-light-border dark:SmartMess-dark-border dark:SmartMess-light-border dark:SmartMess-dark-SmartMess-light-border dark:SmartMess-dark-border overflow-hidden shadow-lg"
              >
                {/* Meal Header */}
                <div className="p-6 border-b SmartMess-light-border dark:SmartMess-dark-SmartMess-light-border dark:SmartMess-dark-border dark:SmartMess-light-border dark:SmartMess-dark-SmartMess-light-border dark:SmartMess-dark-border">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h2 className="text-2xl font-bold text-SmartMess-light-text dark:SmartMess-dark-text dark:text-SmartMess-light-text dark:SmartMess-dark-text mb-2">
                        {meal.name}
                      </h2>
                      {meal.description && (
                        <p className="text-SmartMess-light-text dark:SmartMess-dark-text-muted dark:text-SmartMess-light-text dark:SmartMess-dark-text-muted text-lg leading-relaxed">
                          {meal.description}
                        </p>
                      )}
                    </div>
                    {meal.imageUrl && (
                      <img
                        src={meal.imageUrl}
                        alt={meal.name}
                        className="w-24 h-24 object-cover rounded-xl border SmartMess-light-border dark:SmartMess-dark-SmartMess-light-border dark:SmartMess-dark-border dark:SmartMess-light-border dark:SmartMess-dark-SmartMess-light-border dark:SmartMess-dark-border ml-6 flex-shrink-0"
                      />
                    )}
                  </div>
                </div>

                {/* Meal Details */}
                <div className="p-6">
                  {/* Categories */}
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-SmartMess-light-text dark:SmartMess-dark-text dark:text-SmartMess-light-text dark:SmartMess-dark-text mb-3">
                      Dietary Information
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {meal.categories && meal.categories.length > 0 ? (
                        meal.categories.map((category, index) => (
                          <span
                            key={index}
                            className={`px-4 py-2 text-sm font-medium rounded-full ${getCategoryColor(category)}`}
                          >
                            {category}
                          </span>
                        ))
                      ) : (
                        <span className={`px-4 py-2 text-sm font-medium rounded-full ${getCategoryColor(meal.category)}`}>
                          {meal.category}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Tags */}
                  {meal.tags && meal.tags.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-SmartMess-light-text dark:SmartMess-dark-text dark:text-SmartMess-light-text dark:SmartMess-dark-text mb-3">
                        Tags
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {meal.tags.map((tag) => (
                          <span
                            key={tag.id}
                            className={`px-3 py-1 text-sm rounded-full ${tag.color || 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200'}`}
                          >
                            {tag.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Nutritional Information */}
                  {meal.nutritionalInfo && (
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-SmartMess-light-text dark:SmartMess-dark-text dark:text-SmartMess-light-text dark:SmartMess-dark-text mb-3">
                        Nutritional Information
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        {meal.nutritionalInfo.calories && (
                          <div className="text-center p-3 bg-SmartMess-light-bg dark:SmartMess-dark-bg dark:bg-SmartMess-light-bg dark:SmartMess-dark-bg rounded-lg">
                            <div className="text-2xl font-bold text-SmartMess-light-primary dark:SmartMess-dark-primary">🔥</div>
                            <div className="text-sm font-medium text-SmartMess-light-text dark:SmartMess-dark-text dark:text-SmartMess-light-text dark:SmartMess-dark-text">
                              {meal.nutritionalInfo.calories}
                            </div>
                            <div className="text-xs text-SmartMess-light-text dark:SmartMess-dark-text-muted dark:text-SmartMess-light-text dark:SmartMess-dark-text-muted">
                              Calories
                            </div>
                          </div>
                        )}
                        {meal.nutritionalInfo.protein && (
                          <div className="text-center p-3 bg-SmartMess-light-bg dark:SmartMess-dark-bg dark:bg-SmartMess-light-bg dark:SmartMess-dark-bg rounded-lg">
                            <div className="text-2xl font-bold text-SmartMess-light-primary dark:SmartMess-dark-primary">🥩</div>
                            <div className="text-sm font-medium text-SmartMess-light-text dark:SmartMess-dark-text dark:text-SmartMess-light-text dark:SmartMess-dark-text">
                              {meal.nutritionalInfo.protein}g
                            </div>
                            <div className="text-xs text-SmartMess-light-text dark:SmartMess-dark-text-muted dark:text-SmartMess-light-text dark:SmartMess-dark-text-muted">
                              Protein
                            </div>
                          </div>
                        )}
                        {meal.nutritionalInfo.carbs && (
                          <div className="text-center p-3 bg-SmartMess-light-bg dark:SmartMess-dark-bg dark:bg-SmartMess-light-bg dark:SmartMess-dark-bg rounded-lg">
                            <div className="text-2xl font-bold text-SmartMess-light-primary dark:SmartMess-dark-primary">🍞</div>
                            <div className="text-sm font-medium text-SmartMess-light-text dark:SmartMess-dark-text dark:text-SmartMess-light-text dark:SmartMess-dark-text">
                              {meal.nutritionalInfo.carbs}g
                            </div>
                            <div className="text-xs text-SmartMess-light-text dark:SmartMess-dark-text-muted dark:text-SmartMess-light-text dark:SmartMess-dark-text-muted">
                              Carbs
                            </div>
                          </div>
                        )}
                        {meal.nutritionalInfo.fat && (
                          <div className="text-center p-3 bg-SmartMess-light-bg dark:SmartMess-dark-bg dark:bg-SmartMess-light-bg dark:SmartMess-dark-bg rounded-lg">
                            <div className="text-2xl font-bold text-SmartMess-light-primary dark:SmartMess-dark-primary">🥑</div>
                            <div className="text-sm font-medium text-SmartMess-light-text dark:SmartMess-dark-text dark:text-SmartMess-light-text dark:SmartMess-dark-text">
                              {meal.nutritionalInfo.fat}g
                            </div>
                            <div className="text-xs text-SmartMess-light-text dark:SmartMess-dark-text-muted dark:text-SmartMess-light-text dark:SmartMess-dark-text-muted">
                              Fat
                            </div>
                          </div>
                        )}
                        {meal.nutritionalInfo.fiber && (
                          <div className="text-center p-3 bg-SmartMess-light-bg dark:SmartMess-dark-bg dark:bg-SmartMess-light-bg dark:SmartMess-dark-bg rounded-lg">
                            <div className="text-2xl font-bold text-SmartMess-light-primary dark:SmartMess-dark-primary">🌾</div>
                            <div className="text-sm font-medium text-SmartMess-light-text dark:SmartMess-dark-text dark:text-SmartMess-light-text dark:SmartMess-dark-text">
                              {meal.nutritionalInfo.fiber}g
                            </div>
                            <div className="text-xs text-SmartMess-light-text dark:SmartMess-dark-text-muted dark:text-SmartMess-light-text dark:SmartMess-dark-text-muted">
                              Fiber
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Additional Details */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    {meal.preparationTime && (
                      <div className="flex items-center space-x-3 p-3 bg-SmartMess-light-bg dark:SmartMess-dark-bg dark:bg-SmartMess-light-bg dark:SmartMess-dark-bg rounded-lg">
                        <Clock className="w-5 h-5 text-SmartMess-light-primary dark:SmartMess-dark-primary" />
                        <div>
                          <div className="text-sm font-medium text-SmartMess-light-text dark:SmartMess-dark-text dark:text-SmartMess-light-text dark:SmartMess-dark-text">
                            {meal.preparationTime} min
                          </div>
                          <div className="text-xs text-SmartMess-light-text dark:SmartMess-dark-text-muted dark:text-SmartMess-light-text dark:SmartMess-dark-text-muted">
                            Prep Time
                          </div>
                        </div>
                      </div>
                    )}
                    {meal.servingSize && (
                      <div className="flex items-center space-x-3 p-3 bg-SmartMess-light-bg dark:SmartMess-dark-bg dark:bg-SmartMess-light-bg dark:SmartMess-dark-bg rounded-lg">
                        <Tag className="w-5 h-5 text-SmartMess-light-primary dark:SmartMess-dark-primary" />
                        <div>
                          <div className="text-sm font-medium text-SmartMess-light-text dark:SmartMess-dark-text dark:text-SmartMess-light-text dark:SmartMess-dark-text">
                            {meal.servingSize}
                          </div>
                          <div className="text-xs text-SmartMess-light-text dark:SmartMess-dark-text-muted dark:text-SmartMess-light-text dark:SmartMess-dark-text-muted">
                            Serving Size
                          </div>
                        </div>
                      </div>
                    )}
                    {meal.price && (
                      <div className="flex items-center space-x-3 p-3 bg-SmartMess-light-bg dark:SmartMess-dark-bg dark:bg-SmartMess-light-bg dark:SmartMess-dark-bg rounded-lg">
                        <Star className="w-5 h-5 text-SmartMess-light-primary dark:SmartMess-dark-primary" />
                        <div>
                          <div className="text-sm font-medium text-SmartMess-light-text dark:SmartMess-dark-text dark:text-SmartMess-light-text dark:SmartMess-dark-text">
                            ₹{meal.price}
                          </div>
                          <div className="text-xs text-SmartMess-light-text dark:SmartMess-dark-text-muted dark:text-SmartMess-light-text dark:SmartMess-dark-text-muted">
                            Price
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Allergens */}
                  {meal.allergens && meal.allergens.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-SmartMess-light-text dark:SmartMess-dark-text dark:text-SmartMess-light-text dark:SmartMess-dark-text mb-3">
                        Allergens
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {meal.allergens.map((allergen, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 text-sm bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300 rounded-full"
                          >
                            {allergen}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Mess and Plan Info */}
                  <div className="p-4 bg-SmartMess-light-bg dark:SmartMess-dark-bg dark:bg-SmartMess-light-bg dark:SmartMess-dark-bg rounded-lg">
                    <h3 className="text-lg font-semibold text-SmartMess-light-text dark:SmartMess-dark-text dark:text-SmartMess-light-text dark:SmartMess-dark-text mb-3">
                      Meal Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center space-x-3">
                        <MapPin className="w-5 h-5 text-SmartMess-light-primary dark:SmartMess-dark-primary" />
                        <div>
                          <div className="text-sm font-medium text-SmartMess-light-text dark:SmartMess-dark-text dark:text-SmartMess-light-text dark:SmartMess-dark-text">
                            {meal.messName}
                          </div>
                          <div className="text-xs text-SmartMess-light-text dark:SmartMess-dark-text-muted dark:text-SmartMess-light-text dark:SmartMess-dark-text-muted">
                            Mess Name
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Tag className="w-5 h-5 text-SmartMess-light-primary dark:SmartMess-dark-primary" />
                        <div>
                          <div className="text-sm font-medium text-SmartMess-light-text dark:SmartMess-dark-text dark:text-SmartMess-light-text dark:SmartMess-dark-text">
                            {meal.mealPlanName}
                          </div>
                          <div className="text-xs text-SmartMess-light-text dark:SmartMess-dark-text-muted dark:text-SmartMess-light-text dark:SmartMess-dark-text-muted">
                            Meal Plan
                          </div>
                        </div>
                      </div>
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
};

export default MenuDetail;
