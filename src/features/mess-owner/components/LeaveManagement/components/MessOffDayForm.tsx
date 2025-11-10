import React, { useState } from 'react';
import { Calendar, Clock, Sun, Moon, Coffee } from 'lucide-react';
import type { MessOffDayFormData } from '../LeaveManagement.types';

interface MessOffDayFormProps {
  onSubmit: (data: MessOffDayFormData) => void;
  onCancel: () => void;
  initialData?: Partial<MessOffDayFormData> | undefined;
  isLoading?: boolean;
}

const MessOffDayForm: React.FC<MessOffDayFormProps> = ({
  onSubmit,
  onCancel,
  initialData,
  isLoading = false
}) => {
  const [formData, setFormData] = useState<MessOffDayFormData>({
    offDate: initialData?.offDate || '',
    reason: initialData?.reason || '',
    mealTypes: initialData?.mealTypes || ['breakfast', 'lunch', 'dinner'],
    billingDeduction: initialData?.billingDeduction || false,
    subscriptionExtension: initialData?.subscriptionExtension || false,
    extensionDays: initialData?.extensionDays || 0,
    startDate: (initialData as any)?.startDate || '',
    endDate: (initialData as any)?.endDate || '',
    startDateMealTypes: (initialData as any)?.startDateMealTypes || ['breakfast', 'lunch', 'dinner'],
    endDateMealTypes: (initialData as any)?.endDateMealTypes || ['breakfast', 'lunch', 'dinner'],
    // Announcement
    sendAnnouncement: (initialData as any)?.sendAnnouncement ?? true,
    announcementMessage: (initialData as any)?.announcementMessage || ''
  });

  const [errors, setErrors] = useState<string[]>([]);

  const handleInputChange = (field: keyof MessOffDayFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear errors when user starts typing
  if (errors.length > 0) {
      setErrors([]);
    }
  };

  const handleMealTypeChange = (mealType: 'breakfast' | 'lunch' | 'dinner', checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      mealTypes: checked 
        ? [...prev.mealTypes, mealType]
        : prev.mealTypes.filter(type => type !== mealType)
    }));
    if (errors.length > 0) {
      setErrors([]);
    }
  };

  const handleBoundaryMealChange = (
    boundary: 'startDateMealTypes' | 'endDateMealTypes',
    mealType: 'breakfast' | 'lunch' | 'dinner',
    checked: boolean
  ) => {
    setFormData(prev => ({
      ...prev,
      [boundary]: checked
        ? ([...(prev[boundary] as any[] || []), mealType] as any)
        : ((prev[boundary] as any[] || []).filter(m => m !== mealType) as any)
    }));
    if (errors.length > 0) setErrors([]);
  };

  const [multiDay, setMultiDay] = useState<boolean>(Boolean((initialData as any)?.startDate && (initialData as any)?.endDate));

  const validateForm = (): boolean => {
    const newErrors: string[] = [];

    if (multiDay) {
      if (!formData.startDate || !formData.endDate) {
        newErrors.push('Start and End Date are required');
      } else {
        const s = new Date(formData.startDate);
        const e = new Date(formData.endDate);
        if (e < s) newErrors.push('End Date cannot be before Start Date');
      }
      if (!(formData.startDateMealTypes && formData.startDateMealTypes.length)) newErrors.push('Select meals for Start Date');
      if (!(formData.endDateMealTypes && formData.endDateMealTypes.length)) newErrors.push('Select meals for End Date');
    } else {
      if (!formData.offDate) {
        newErrors.push('Off date is required');
      } else {
        const selectedDate = new Date(formData.offDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (selectedDate < today) newErrors.push('Off date cannot be in the past');
      }
    }

    // Reason optional

    if (!multiDay) {
      if (!formData.mealTypes || formData.mealTypes.length === 0) {
        newErrors.push('At least one meal type must be selected');
      }
    }

    // No fixed extension days required; backend auto-calculates when enabled

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      const payload: any = { ...formData };
      // Omit extensionDays if not explicitly provided; backend computes when enabled
      if (payload.subscriptionExtension && (!payload.extensionDays || payload.extensionDays < 1)) {
        delete payload.extensionDays;
      }
      // If single-day mode, strip range fields to avoid accidental range creation
      if (!multiDay) {
        delete payload.startDate;
        delete payload.endDate;
        delete payload.startDateMealTypes;
        delete payload.endDateMealTypes;
      }
      onSubmit(payload);
    }
  };

  return (
    <div className="SmartMess-light-surface dark:SmartMess-dark-surface rounded-lg shadow border SmartMess-light-border dark:SmartMess-dark-border p-4 sm:p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
          <Calendar className="h-6 w-6 text-orange-600 dark:text-orange-400" />
        </div>
        <div>
          <h2 className="text-lg sm:text-xl font-semibold SmartMess-light-text dark:SmartMess-dark-text">
            {initialData ? 'Edit Mess Off Day' : 'Create Mess Off Day'}
          </h2>
          <p className="text-sm sm:text-base SmartMess-light-text-secondary dark:SmartMess-dark-text-secondary">
            {initialData ? 'Update the mess off day details' : 'Create a mess off day with billing and subscription options'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Date Selection */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-SmartMess-dark-text">
              {multiDay ? 'Date Range *' : 'Off Date *'}
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={multiDay}
                onChange={(e) => {
                  const next = e.target.checked;
                  setMultiDay(next);
                  if (!next) {
                    // Reset range fields when switching back to single day
                    setFormData(prev => ({
                      ...prev,
                      startDate: '',
                      endDate: '',
                      startDateMealTypes: ['breakfast','lunch','dinner'],
                      endDateMealTypes: ['breakfast','lunch','dinner']
                    }));
                  }
                }}
              />
              <span className="text-gray-700 dark:text-SmartMess-dark-text">Multiple days</span>
            </label>
          </div>
          {multiDay ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-600 dark:text-SmartMess-dark-text mb-1">Start Date</label>
                <input
                  type="date"
                  value={formData.startDate || ''}
                  onChange={(e) => handleInputChange('startDate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-SmartMess-dark-border rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-SmartMess-dark-surface text-gray-900 dark:text-SmartMess-dark-text"
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 dark:text-SmartMess-dark-text mb-1">End Date</label>
                <input
                  type="date"
                  value={formData.endDate || ''}
                  onChange={(e) => handleInputChange('endDate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-SmartMess-dark-border rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-SmartMess-dark-surface text-gray-900 dark:text-SmartMess-dark-text"
                  min={formData.startDate || new Date().toISOString().split('T')[0]}
                />
              </div>
            </div>
          ) : (
            <input
              type="date"
              id="offDate"
              value={formData.offDate}
              onChange={(e) => handleInputChange('offDate', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-SmartMess-dark-border rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-SmartMess-dark-surface text-gray-900 dark:text-SmartMess-dark-text"
              min={new Date().toISOString().split('T')[0]}
              required
            />
          )}
        </div>

        {/* Reason */}
        <div>
          <label htmlFor="reason" className="block text-sm font-medium text-gray-700 dark:text-SmartMess-dark-text mb-2">
            Reason (optional)
          </label>
          <textarea
            id="reason"
            value={formData.reason}
            onChange={(e) => handleInputChange('reason', e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 dark:border-SmartMess-dark-border rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-SmartMess-dark-surface text-gray-900 dark:text-SmartMess-dark-text"
            placeholder="Please provide a detailed reason for the mess off day..."
            
          />
          <p className="text-xs text-gray-500 dark:text-SmartMess-dark-text-secondary mt-1">
            {formData.reason.length}/500 characters
          </p>
        </div>

        {/* Meal Types */}
        {multiDay ? (
          <div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {[{ key: 'startDateMealTypes', title: 'Start Date Meals' }, { key: 'endDateMealTypes', title: 'End Date Meals' }].map((cfg) => (
                <div key={cfg.key}>
                  <label className="block text-sm font-medium text-gray-700 dark:text-SmartMess-dark-text mb-3">
                    {cfg.title} *
                  </label>
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { value: 'breakfast', label: 'Breakfast', icon: Coffee, color: 'text-amber-600' },
                      { value: 'lunch', label: 'Lunch', icon: Sun, color: 'text-yellow-600' },
                      { value: 'dinner', label: 'Dinner', icon: Moon, color: 'text-indigo-600' }
                    ].map((meal) => {
                      const IconComponent = meal.icon;
                      const checked = ((formData as any)[cfg.key] as any[]).includes(meal.value);
                      return (
                        <label key={meal.value} className="flex items-center space-x-3 cursor-pointer p-3 border border-gray-200 dark:border-SmartMess-dark-border rounded-lg hover:bg-gray-50 dark:hover:bg-SmartMess-dark-accent transition-colors">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={(e) => handleBoundaryMealChange(cfg.key as any, meal.value as any, e.target.checked)}
                            className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                          />
                          <IconComponent className={`h-5 w-5 ${meal.color}`} />
                          <span className="text-sm font-medium text-gray-700 dark:text-SmartMess-dark-text">{meal.label}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-500 dark:text-SmartMess-dark-text-secondary mt-2">
              Choose meals for the first and last day of the range. Middle days include all selected meal services.
            </p>
          </div>
        ) : (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-SmartMess-dark-text mb-3">
              Affected Meal Types *
            </label>
            <div className="grid grid-cols-3 gap-4">
              {[
                { value: 'breakfast', label: 'Breakfast', icon: Coffee, color: 'text-amber-600' },
                { value: 'lunch', label: 'Lunch', icon: Sun, color: 'text-yellow-600' },
                { value: 'dinner', label: 'Dinner', icon: Moon, color: 'text-indigo-600' }
              ].map((meal) => {
                const IconComponent = meal.icon;
                return (
                  <label key={meal.value} className="flex items-center space-x-3 cursor-pointer p-3 border border-gray-200 dark:border-SmartMess-dark-border rounded-lg hover:bg-gray-50 dark:hover:bg-SmartMess-dark-accent transition-colors">
                    <input
                      type="checkbox"
                      checked={formData.mealTypes.includes(meal.value as 'breakfast' | 'lunch' | 'dinner')}
                      onChange={(e) => handleMealTypeChange(meal.value as 'breakfast' | 'lunch' | 'dinner', e.target.checked)}
                      className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                    />
                    <IconComponent className={`h-5 w-5 ${meal.color}`} />
                    <span className="text-sm font-medium text-gray-700 dark:text-SmartMess-dark-text">{meal.label}</span>
                  </label>
                );
              })}
            </div>
            <p className="text-xs text-gray-500 dark:text-SmartMess-dark-text-secondary mt-2">
              Select which meals will be affected on this off day
            </p>
          </div>
        )}

        {/* Billing Deduction removed as per requirement */}

        {/* Subscription Extension Option */}
        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
          <div className="flex items-center gap-3 mb-3">
            <Clock className="h-5 w-5 text-green-600 dark:text-green-400" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-SmartMess-dark-text">Subscription Extension</h3>
          </div>
          
          <label className="flex items-center space-x-3 cursor-pointer mb-3">
            <input
              type="checkbox"
              checked={formData.subscriptionExtension}
              onChange={(e) => handleInputChange('subscriptionExtension', e.target.checked)}
              className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
            />
            <div>
              <span className="text-sm font-medium text-gray-900 dark:text-SmartMess-dark-text">Extend Subscriptions</span>
              <p className="text-xs text-gray-600 dark:text-SmartMess-dark-text-secondary">
                Automatically extends based on meals missed from the selected off days. No fixed days required.
              </p>
            </div>
          </label>
          {/* Extension days input removed - extension is auto-calculated by backend */}
        </div>

        {/* Announcement Section - Redesigned */}
        <div className="border border-blue-200 dark:border-blue-800 rounded-xl p-5 bg-gradient-to-br from-blue-50/50 to-indigo-50/50 dark:from-blue-950/30 dark:to-indigo-950/30 shadow-sm">
          <div className="flex items-start gap-3 mb-4">
            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/40 flex-shrink-0">
              <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-base font-semibold text-gray-900 dark:text-SmartMess-dark-text mb-1">
                Community Announcement
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-4">
                Notify members about this mess off day in the community chat
              </p>
              <label className="flex items-start gap-3 cursor-pointer group">
                <div className="relative flex items-center justify-center mt-0.5">
                  <input
                    type="checkbox"
                    checked={Boolean((formData as any).sendAnnouncement)}
                    onChange={(e) => handleInputChange('sendAnnouncement' as any, e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-5 h-5 border-2 border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-SmartMess-dark-surface peer-checked:bg-blue-600 peer-checked:border-blue-600 dark:peer-checked:bg-blue-500 dark:peer-checked:border-blue-500 transition-all duration-200 flex items-center justify-center group-hover:border-blue-400 dark:group-hover:border-blue-500">
                    {(formData as any).sendAnnouncement && (
                      <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                </div>
                <span className="text-sm font-medium text-gray-800 dark:text-SmartMess-dark-text group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  Send announcement to community chat
                </span>
              </label>
            </div>
          </div>
          
          {Boolean((formData as any).sendAnnouncement) && (
            <div className="mt-4 pt-4 border-t border-blue-200 dark:border-blue-800 animate-in slide-in-from-top-2 duration-200">
              <label className="block text-sm font-medium text-gray-700 dark:text-SmartMess-dark-text mb-2.5">
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Custom Message
                  <span className="text-xs font-normal text-gray-500 dark:text-gray-400">(optional)</span>
                </span>
              </label>
              <textarea
                value={(formData as any).announcementMessage || ''}
                onChange={(e) => handleInputChange('announcementMessage' as any, e.target.value)}
                rows={6}
                className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:border-blue-500 bg-white dark:bg-SmartMess-dark-surface text-gray-900 dark:text-SmartMess-dark-text placeholder-gray-400 dark:placeholder-gray-500 resize-none transition-all duration-200 text-sm font-mono"
                placeholder={`Example format:\n\n🚫 **Mess Closure Notice**\n\n📅 **Date:** Monday, 3 November 2025\n🍽️ **Meals Affected:** Breakfast, Lunch, and Dinner\n📝 **Reason:** [Your reason]\n\nPlease make alternative arrangements for your meals on this day.`}
              />
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400 flex items-start gap-2">
                <svg className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>If left empty, a detailed formatted message with date, day name, meals, and reason will be sent automatically. You can customize it using the format shown above.</span>
              </p>
            </div>
          )}
        </div>

        {/* Error Messages */}
        {errors.length > 0 && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-3">
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
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-SmartMess-dark-text bg-white dark:bg-SmartMess-dark-surface border border-gray-300 dark:border-SmartMess-dark-border rounded-md hover:bg-gray-50 dark:hover:bg-SmartMess-dark-accent focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-white bg-orange-600 border border-transparent rounded-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>{initialData ? 'Updating...' : 'Creating...'}</span>
              </>
            ) : (
              <>
                <Calendar className="h-4 w-4" />
                <span>{initialData ? 'Update Off Day' : 'Create Off Day'}</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default MessOffDayForm;
