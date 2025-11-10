
import { ClockIcon } from '@heroicons/react/24/outline';
import type { OperatingHour } from '../../../../../../services/api/messService';

interface OperatingHoursFormProps {
  operatingHours: OperatingHour[];
  loading: boolean;
  saving: boolean;
  error: string | null;
  success: string | null;
  onOperatingHourChange: (idx: number, field: keyof OperatingHour, value: string | boolean) => void;
  validateTimeRange: (start: string, end: string) => boolean;
  onSave: () => Promise<void>;
  getMealDisplayName: (meal: string) => string;
}

export default function OperatingHoursForm({
  operatingHours,
  loading,
  saving,
  error,
  success,
  onOperatingHourChange,
  validateTimeRange,
  onSave,
  getMealDisplayName,
}: OperatingHoursFormProps) {
  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div>
        <h2 className="text-2xl font-bold SmartMess-light-text dark:SmartMess-dark-text mb-2">Operating Hours</h2>
        <p className="SmartMess-light-text-secondary dark:SmartMess-dark-text-secondary">Set your mess operating hours for different meals</p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
          <p className="text-destructive text-sm">{error}</p>
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
          <p className="text-green-600 dark:text-green-400 text-sm">{success}</p>
        </div>
      )}

      {/* Operating Hours Cards */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary"></div>
            <p className="text-SmartMess-light-text dark:SmartMess-dark-text-muted dark:text-SmartMess-light-text dark:SmartMess-dark-text-muted mt-2">Loading operating hours...</p>
          </div>
        ) : operatingHours.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-SmartMess-light-text dark:SmartMess-dark-text-muted dark:text-SmartMess-light-text dark:SmartMess-dark-text-muted">No operating hours found. Please add some.</p>
          </div>
        ) : (
          operatingHours.map((meal, idx) => (
            <div key={meal.meal} className="rounded-lg border SmartMess-light-border dark:SmartMess-dark-border SmartMess-light-surface dark:SmartMess-dark-surface p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg SmartMess-light-primary dark:SmartMess-dark-primary/10">
                    <ClockIcon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold SmartMess-light-text dark:SmartMess-dark-text capitalize">
                      {getMealDisplayName(meal.meal)}
                    </h3>
                    <p className="text-sm SmartMess-light-text-secondary dark:SmartMess-dark-text-secondary">
                      {meal.enabled ? 'Active' : 'Inactive'}
                    </p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary">
                  <input
                    type="checkbox"
                    checked={meal.enabled}
                    onChange={(e) => onOperatingHourChange(idx, "enabled", e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-border peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:SmartMess-light-primary dark:SmartMess-dark-primary"></div>
                </label>
              </div>
              
              {meal.enabled && (
                <div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium SmartMess-light-text dark:SmartMess-dark-text mb-2">
                        Start Time
                      </label>
                      <input
                        type="time"
                        value={meal.start}
                        onChange={(e) => onOperatingHourChange(idx, "start", e.target.value)}
                        className={`w-full px-4 py-3 rounded-lg border SmartMess-light-bg dark:SmartMess-dark-bg SmartMess-light-text dark:SmartMess-dark-text focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${
                          meal.enabled && meal.start && meal.end && !validateTimeRange(meal.start, meal.end)
                            ? 'border-destructive focus:ring-destructive'
                            : 'border-input focus:ring-primary'
                        }`}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium SmartMess-light-text dark:SmartMess-dark-text mb-2">
                        End Time
                      </label>
                      <input
                        type="time"
                        value={meal.end}
                        onChange={(e) => onOperatingHourChange(idx, "end", e.target.value)}
                        className={`w-full px-4 py-3 rounded-lg border SmartMess-light-bg dark:SmartMess-dark-bg SmartMess-light-text dark:SmartMess-dark-text focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${
                          meal.enabled && meal.start && meal.end && !validateTimeRange(meal.start, meal.end)
                            ? 'border-destructive focus:ring-destructive'
                            : 'border-input focus:ring-primary'
                        }`}
                      />
                    </div>
                  </div>
                  
                  {meal.enabled && meal.start && meal.end && !validateTimeRange(meal.start, meal.end) && (
                    <div className="mt-2 text-sm text-red-600 dark:text-red-400">
                      Start time must be before end time
                    </div>
                  )}
                </div>
              )}
              
              {!meal.enabled && (
                <div className="text-center py-4">
                  <p className="text-SmartMess-light-text dark:SmartMess-dark-text-muted dark:text-SmartMess-light-text dark:SmartMess-dark-text-muted">
                    This meal is currently disabled
                  </p>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Save Button */}
      <div className="flex justify-end pt-6">
        <button
          type="button"
          onClick={onSave}
          disabled={loading || saving}
          className="px-8 py-3 SmartMess-light-primary dark:SmartMess-dark-primary text-primary-foreground rounded-lg font-semibold hover:SmartMess-light-primary dark:SmartMess-dark-primary/90 transition-colors focus:ring-2 focus:ring-primary/50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {saving ? (
            <>
              <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Saving...
            </>
          ) : (
            'Save Changes'
          )}
        </button>
      </div>
    </div>
  );
}






