import React, { useState } from 'react';
import { 
  Settings, 
  Calendar, 
  Save,
  RefreshCw,
  Coffee,
  Sun,
  Moon,
  
} from 'lucide-react';
import type { DefaultOffDaySettings } from '../LeaveManagement.types';

interface DefaultOffDaySettingsProps {
  settings: DefaultOffDaySettings | null;
  onSave: (settings: Partial<DefaultOffDaySettings>) => void;
  isLoading?: boolean;
}

const DefaultOffDaySettings: React.FC<DefaultOffDaySettingsProps> = ({
  settings,
  onSave,
  isLoading = false
}) => {
  const [formData, setFormData] = useState({
    pattern: settings?.pattern || 'weekly',
    weeklySettings: {
      dayOfWeek: settings?.weeklySettings?.dayOfWeek || 0,
      enabled: settings?.weeklySettings?.enabled || false,
      mealTypes: settings?.weeklySettings?.mealTypes || ['breakfast', 'lunch', 'dinner'],
    },
    monthlySettings: {
      daysOfMonth: settings?.monthlySettings?.daysOfMonth || [1],
      enabled: settings?.monthlySettings?.enabled || false,
      mealTypes: settings?.monthlySettings?.mealTypes || ['breakfast', 'lunch', 'dinner'],
    },
    subscriptionExtension: settings?.subscriptionExtension || false,
    extensionDays: settings?.extensionDays || 1,
  });

  const [errors, setErrors] = useState<string[]>([]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear errors when user makes changes
    if (errors.length > 0) {
      setErrors([]);
    }
  };

  const handleMealTypeChange = (pattern: 'weekly' | 'monthly', mealType: 'breakfast' | 'lunch' | 'dinner', checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      [`${pattern}Settings`]: {
        ...prev[`${pattern}Settings`],
        mealTypes: checked 
          ? [...prev[`${pattern}Settings`].mealTypes, mealType]
          : prev[`${pattern}Settings`].mealTypes.filter(type => type !== mealType)
      }
    }));
    
    // Clear errors when user makes changes
    if (errors.length > 0) {
      setErrors([]);
    }
  };

  const handleDayOfMonthChange = (day: number, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      monthlySettings: {
        ...prev.monthlySettings,
        daysOfMonth: checked 
          ? [...prev.monthlySettings.daysOfMonth, day]
          : prev.monthlySettings.daysOfMonth.filter(d => d !== day)
      }
    }));
    
    // Clear errors when user makes changes
    if (errors.length > 0) {
      setErrors([]);
    }
  };

  const handleNestedInputChange = (parent: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...(prev[parent as keyof typeof prev] as any),
        [field]: value
      }
    }));
    
    if (errors.length > 0) {
      setErrors([]);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: string[] = [];

    if (formData.pattern === 'weekly' && formData.weeklySettings.enabled) {
      if (formData.weeklySettings.dayOfWeek < 0 || formData.weeklySettings.dayOfWeek > 6) {
        newErrors.push('Day of week must be between 0 (Sunday) and 6 (Saturday)');
      }
    }

    if (formData.pattern === 'monthly' && formData.monthlySettings.enabled) {
      if (formData.monthlySettings.daysOfMonth.length === 0) {
        newErrors.push('At least one day of month must be selected');
      }
      if (formData.monthlySettings.daysOfMonth.some(day => day < 1 || day > 31)) {
        newErrors.push('All days of month must be between 1 and 31');
      }
    }

    // Subscription Extension settings removed from defaults UI

    if (!formData.weeklySettings.enabled && !formData.monthlySettings.enabled) {
      newErrors.push('At least one pattern must be enabled');
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSave(formData);
    }
  };

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  return (
    <div className="SmartMess-light-surface dark:SmartMess-dark-surface rounded-lg shadow border SmartMess-light-border dark:SmartMess-dark-border p-4 sm:p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
          <Settings className="h-6 w-6 text-purple-600 dark:text-purple-400" />
        </div>
        <div>
          <h2 className="text-lg sm:text-xl font-semibold SmartMess-light-text dark:SmartMess-dark-text">Default Off Day Settings</h2>
          <p className="text-sm sm:text-base SmartMess-light-text-secondary dark:SmartMess-dark-text-secondary">Configure automatic off day patterns and billing options</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Pattern Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-SmartMess-dark-text mb-3">
            Off Day Pattern
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${
              formData.pattern === 'weekly' ? 'border-purple-500 bg-purple-50 dark:bg-purple-900' : 'border-gray-300 dark:border-SmartMess-dark-border hover:bg-gray-50 dark:hover:bg-SmartMess-dark-accent'
            }`}>
              <input
                type="radio"
                name="pattern"
                value="weekly"
                checked={formData.pattern === 'weekly'}
                onChange={(e) => handleInputChange('pattern', e.target.value)}
                className="text-purple-600 focus:ring-purple-500"
              />
                <div className="ml-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span className="font-medium text-gray-900 dark:text-SmartMess-dark-text">Weekly Pattern</span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-SmartMess-dark-text-secondary">Set a specific day of the week as off day</p>
                </div>
            </label>

            <label className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${
              formData.pattern === 'monthly' ? 'border-purple-500 bg-purple-50 dark:bg-purple-900' : 'border-gray-300 dark:border-SmartMess-dark-border hover:bg-gray-50 dark:hover:bg-SmartMess-dark-accent'
            }`}>
              <input
                type="radio"
                name="pattern"
                value="monthly"
                checked={formData.pattern === 'monthly'}
                onChange={(e) => handleInputChange('pattern', e.target.value)}
                className="text-purple-600 focus:ring-purple-500"
              />
              <div className="ml-3">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span className="font-medium text-gray-900 dark:text-SmartMess-dark-text">Monthly Pattern</span>
                </div>
                <p className="text-sm text-gray-600 dark:text-SmartMess-dark-text-secondary">Set a specific day of the month as off day</p>
              </div>
            </label>
          </div>
        </div>

        {/* Weekly Settings */}
        {formData.pattern === 'weekly' && (
          <div className="bg-blue-50 dark:bg-blue-900 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-4">
              <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-SmartMess-dark-text">Weekly Settings</h3>
            </div>
            
            <div className="space-y-4">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.weeklySettings.enabled}
                  onChange={(e) => handleNestedInputChange('weeklySettings', 'enabled', e.target.checked)}
                  className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                />
                <span className="text-sm font-medium text-gray-900 dark:text-SmartMess-dark-text">Enable Weekly Off Day</span>
              </label>

              {formData.weeklySettings.enabled && (
                <div>
                  <label htmlFor="dayOfWeek" className="block text-sm font-medium text-gray-700 dark:text-SmartMess-dark-text mb-2">
                    Day of Week
                  </label>
                  <select
                    id="dayOfWeek"
                    value={formData.weeklySettings.dayOfWeek}
                    onChange={(e) => handleNestedInputChange('weeklySettings', 'dayOfWeek', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-SmartMess-dark-border rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-SmartMess-dark-surface text-gray-900 dark:text-SmartMess-dark-text"
                  >
                    {dayNames.map((day, index) => (
                      <option key={index} value={index}>
                        {day}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {formData.weeklySettings.enabled && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-SmartMess-dark-text mb-3">
                    Affected Meal Types
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { value: 'breakfast', label: 'Breakfast', icon: Coffee, color: 'text-amber-600' },
                      { value: 'lunch', label: 'Lunch', icon: Sun, color: 'text-yellow-600' },
                      { value: 'dinner', label: 'Dinner', icon: Moon, color: 'text-indigo-600' }
                    ].map((meal) => {
                      const IconComponent = meal.icon;
                      return (
                        <label key={meal.value} className="flex items-center space-x-2 cursor-pointer p-2 border border-gray-200 dark:border-SmartMess-dark-border rounded-lg hover:bg-gray-50 dark:hover:bg-SmartMess-dark-accent transition-colors">
                          <input
                            type="checkbox"
                            checked={formData.weeklySettings.mealTypes.includes(meal.value as 'breakfast' | 'lunch' | 'dinner')}
                            onChange={(e) => handleMealTypeChange('weekly', meal.value as 'breakfast' | 'lunch' | 'dinner', e.target.checked)}
                            className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 dark:border-SmartMess-dark-border rounded"
                          />
                          <IconComponent className={`h-4 w-4 ${meal.color}`} />
                          <span className="text-sm font-medium text-gray-700 dark:text-SmartMess-dark-text">{meal.label}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Monthly Settings */}
        {formData.pattern === 'monthly' && (
          <div className="bg-green-50 dark:bg-green-900 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-4">
              <Calendar className="h-5 w-5 text-green-600 dark:text-green-400" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-SmartMess-dark-text">Monthly Settings</h3>
            </div>
            
            <div className="space-y-4">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.monthlySettings.enabled}
                  onChange={(e) => handleNestedInputChange('monthlySettings', 'enabled', e.target.checked)}
                  className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                />
                <span className="text-sm font-medium text-gray-900 dark:text-SmartMess-dark-text">Enable Monthly Off Day</span>
              </label>

              {formData.monthlySettings.enabled && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-SmartMess-dark-text mb-3">
                    Days of Month
                  </label>
                  <div className="grid grid-cols-7 gap-2 mb-3">
                    {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                      <label key={day} className="flex items-center justify-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.monthlySettings.daysOfMonth.includes(day)}
                          onChange={(e) => handleDayOfMonthChange(day, e.target.checked)}
                          className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                        />
                        <span className="ml-1 text-sm text-gray-700 dark:text-SmartMess-dark-text">{day}</span>
                      </label>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-SmartMess-dark-text-secondary">
                    Select multiple days of the month (1-31). If the month has fewer days, the last available day will be used.
                  </p>
                  {formData.monthlySettings.daysOfMonth.length > 0 && (
                    <div className="mt-2">
                      <p className="text-sm text-gray-600 dark:text-SmartMess-dark-text-secondary">
                        Selected days: {formData.monthlySettings.daysOfMonth.sort((a, b) => a - b).join(', ')}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {formData.monthlySettings.enabled && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-SmartMess-dark-text mb-3">
                    Affected Meal Types
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { value: 'breakfast', label: 'Breakfast', icon: Coffee, color: 'text-amber-600' },
                      { value: 'lunch', label: 'Lunch', icon: Sun, color: 'text-yellow-600' },
                      { value: 'dinner', label: 'Dinner', icon: Moon, color: 'text-indigo-600' }
                    ].map((meal) => {
                      const IconComponent = meal.icon;
                      return (
                        <label key={meal.value} className="flex items-center space-x-2 cursor-pointer p-2 border border-gray-200 dark:border-SmartMess-dark-border rounded-lg hover:bg-gray-50 dark:hover:bg-SmartMess-dark-accent transition-colors">
                          <input
                            type="checkbox"
                            checked={formData.monthlySettings.mealTypes.includes(meal.value as 'breakfast' | 'lunch' | 'dinner')}
                            onChange={(e) => handleMealTypeChange('monthly', meal.value as 'breakfast' | 'lunch' | 'dinner', e.target.checked)}
                            className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 dark:border-SmartMess-dark-border rounded"
                          />
                          <IconComponent className={`h-4 w-4 ${meal.color}`} />
                          <span className="text-sm font-medium text-gray-700 dark:text-SmartMess-dark-text">{meal.label}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Subscription Extension Options removed per requirement */}

        {/* Error Messages */}
        {errors.length > 0 && (
          <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-800 rounded-md p-3">
            <ul className="text-sm text-red-600 dark:text-red-400">
              {errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-SmartMess-dark-border">
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-SmartMess-dark-text bg-white dark:bg-SmartMess-dark-surface border border-gray-300 dark:border-SmartMess-dark-border rounded-md hover:bg-gray-50 dark:hover:bg-SmartMess-dark-accent focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 flex items-center gap-2"
            disabled={isLoading}
          >
            <RefreshCw className="h-4 w-4" />
            Reset
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-white bg-purple-600 border border-transparent rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                <span>Save Settings</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default DefaultOffDaySettings;
