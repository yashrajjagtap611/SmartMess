import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  BuildingStorefrontIcon,
  MapPinIcon,
  PhoneIcon,
  ClockIcon,
  CurrencyRupeeIcon,
  CheckCircleIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';
import axios from 'axios';

const API_URL = import.meta.env['VITE_API_URL'] || 'http://localhost:5000/api';

interface MessProfile {
  name: string;
  location: {
    city: string;
    state: string;
    street?: string;
  };
  colleges: string[];
  types: string[];
  ownerPhone: string;
  operatingHours: Array<{
    meal: string;
    enabled: boolean;
    start: string;
    end: string;
  }>;
}

interface MealPlan {
  _id: string;
  name: string;
  description: string;
  pricing: {
    amount: number;
    period: 'day' | 'week' | '15days' | 'month' | '3months' | '6months' | 'year';
  };
  mealType: string;
  mealsPerDay: number;
  mealOptions?: {
    breakfast: boolean;
    lunch: boolean;
    dinner: boolean;
  };
}

const PublicMessProfile: React.FC = () => {
  const { messId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [messProfile, setMessProfile] = useState<MessProfile | null>(null);
  const [mealPlans, setMealPlans] = useState<MealPlan[]>([]);

  useEffect(() => {
    loadMessProfile();
  }, [messId]);

  const loadMessProfile = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/public/mess/${messId}`);
      setMessProfile(response.data.data.mess);
      setMealPlans(response.data.data.plans);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load mess profile');
    } finally {
      setLoading(false);
    }
  };

  const getMealsText = (mealOptions: MealPlan['mealOptions']) => {
    if (!mealOptions) {
      return 'No meals specified';
    }
    
    const meals = [];
    if (mealOptions.breakfast) meals.push('Breakfast');
    if (mealOptions.lunch) meals.push('Lunch');
    if (mealOptions.dinner) meals.push('Dinner');
    return meals.length > 0 ? meals.join(' + ') : 'No meals included';
  };

  const formatPeriod = (period: string) => {
    const periodMap: Record<string, string> = {
      'day': 'per day',
      'week': 'per week',
      '15days': 'per 15 days',
      'month': 'per month',
      '3months': 'per 3 months',
      '6months': 'per 6 months',
      'year': 'per year'
    };
    return periodMap[period] || period;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading mess profile...</p>
        </div>
      </div>
    );
  }

  if (error || !messProfile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="bg-card rounded-xl border border-border p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <BuildingStorefrontIcon className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
          <h2 className="text-xl font-bold text-foreground mb-2">Mess Not Found</h2>
          <p className="text-muted-foreground mb-6">{error || 'This mess profile could not be found.'}</p>
          <button
            onClick={() => navigate('/login')}
            className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border">
        <div className="max-w-5xl mx-auto px-4 py-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            Back
          </button>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <BuildingStorefrontIcon className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">{messProfile.name}</h1>
              <div className="flex items-center gap-2 text-muted-foreground mt-1">
                <MapPinIcon className="w-4 h-4" />
                <span>{messProfile.location.city}, {messProfile.location.state}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
        {/* Mess Details */}
        <div className="bg-card rounded-xl border border-border p-6 space-y-4">
          <h2 className="text-xl font-semibold text-foreground">About This Mess</h2>
          
          <div className="grid md:grid-cols-2 gap-4">
            {/* Location */}
            <div className="flex items-start gap-3">
              <MapPinIcon className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium text-foreground">Location</p>
                <p className="text-sm text-muted-foreground">
                  {messProfile.location.street && `${messProfile.location.street}, `}
                  {messProfile.location.city}, {messProfile.location.state}
                </p>
              </div>
            </div>

            {/* Phone */}
            <div className="flex items-start gap-3">
              <PhoneIcon className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium text-foreground">Contact</p>
                <p className="text-sm text-muted-foreground">{messProfile.ownerPhone}</p>
              </div>
            </div>

            {/* Types */}
            <div className="flex items-start gap-3">
              <BuildingStorefrontIcon className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium text-foreground">Mess Type</p>
                <p className="text-sm text-muted-foreground">{messProfile.types.join(', ')}</p>
              </div>
            </div>

            {/* Colleges */}
            <div className="flex items-start gap-3">
              <CheckCircleIcon className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium text-foreground">Nearby Colleges</p>
                <p className="text-sm text-muted-foreground">{messProfile.colleges.join(', ')}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Operating Hours */}
        {messProfile.operatingHours && messProfile.operatingHours.length > 0 && (
          <div className="bg-card rounded-xl border border-border p-6">
            <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
              <ClockIcon className="w-6 h-6 text-primary" />
              Operating Hours
            </h2>
            <div className="grid md:grid-cols-3 gap-4">
              {messProfile.operatingHours
                .filter(hour => hour.enabled)
                .map((hour, index) => (
                  <div key={index} className="p-4 bg-muted/50 rounded-lg">
                    <p className="font-semibold text-foreground capitalize mb-1">{hour.meal}</p>
                    <p className="text-sm text-muted-foreground">
                      {hour.start} - {hour.end}
                    </p>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Meal Plans */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <CurrencyRupeeIcon className="w-7 h-7 text-primary" />
            Available Meal Plans
          </h2>

          {mealPlans.length === 0 ? (
            <div className="bg-card rounded-xl border border-border p-8 text-center">
              <p className="text-muted-foreground">No meal plans available at the moment.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mealPlans.map((plan) => (
                <div
                  key={plan._id}
                  className="bg-card rounded-xl border-2 border-border hover:border-primary transition-all p-6 space-y-4"
                >
                  <div>
                    <h3 className="text-xl font-bold text-foreground">{plan.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{plan.description}</p>
                  </div>

                  <div className="pt-4 border-t border-border">
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-bold text-primary">₹{plan.pricing.amount}</span>
                      <span className="text-muted-foreground">{formatPeriod(plan.pricing.period)}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-foreground">Meal Type:</p>
                      <p className="text-sm text-muted-foreground">{plan.mealType}</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-foreground">Meals/Day:</p>
                      <p className="text-sm text-muted-foreground">{plan.mealsPerDay}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground mb-1">Includes:</p>
                      <p className="text-sm text-muted-foreground">{getMealsText(plan.mealOptions)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-xl border border-primary/20 p-8 text-center">
          <h3 className="text-2xl font-bold text-foreground mb-2">Interested in joining?</h3>
          <p className="text-muted-foreground mb-6">
            Create an account or login to subscribe to meal plans
          </p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => navigate('/register')}
              className="px-8 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
            >
              Register Now
            </button>
            <button
              onClick={() => navigate('/login')}
              className="px-8 py-3 bg-secondary text-secondary-foreground border border-border rounded-lg hover:bg-accent transition-colors font-medium"
            >
              Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicMessProfile;
