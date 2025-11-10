import { useState, useEffect } from 'react';
import messService from '@/services/api/messService';
import type { OperatingHour } from '@/services/api/messService';

interface UseOperatingHoursReturn {
  operatingHours: OperatingHour[];
  loading: boolean;
  saving: boolean;
  error: string | null;
  success: string | null;
  handleOperatingHourChange: (idx: number, field: keyof OperatingHour, value: string | boolean) => void;
  validateTimeRange: (start: string, end: string) => boolean;
  handleSave: () => Promise<void>;
  getMealDisplayName: (meal: string) => string;
}

export const useOperatingHours = (): UseOperatingHoursReturn => {
  // Operating Hours State
  const [operatingHours, setOperatingHours] = useState<OperatingHour[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Default operating hours
  const defaultOperatingHours: OperatingHour[] = [
    { meal: "breakfast", enabled: true, start: "07:00", end: "10:00" },
    { meal: "lunch", enabled: true, start: "12:00", end: "15:00" },
    { meal: "dinner", enabled: true, start: "19:00", end: "22:00" },
  ];

  useEffect(() => {
    loadOperatingHours();
  }, []);

  const loadOperatingHours = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await messService.getOperatingHours();
      
      if (response.success && response.data && Array.isArray(response.data) && response.data.length > 0) {
        setOperatingHours(response.data);
      } else {
        // Use default operating hours if none exist
        setOperatingHours(defaultOperatingHours);
      }
    } catch (err: any) {
      console.error('Failed to load operating hours:', err);
      setError(err.message || 'Failed to load operating hours');
      // Use default operating hours as fallback
      setOperatingHours(defaultOperatingHours);
    } finally {
      setLoading(false);
    }
  };

  const handleOperatingHourChange = (idx: number, field: keyof OperatingHour, value: string | boolean) => {
    setOperatingHours((prev) =>
      prev.map((item, i) =>
        i === idx ? { ...item, [field]: value } : item
      )
    );
  };

  const validateTimeRange = (start: string, end: string): boolean => {
    if (!start || !end) return true; // Allow empty values during editing
    const startTime = new Date(`2000-01-01T${start}`);
    const endTime = new Date(`2000-01-01T${end}`);
    return startTime < endTime;
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      // Validate time ranges
      const invalidRanges = operatingHours.filter(hour => 
        hour.enabled && !validateTimeRange(hour.start, hour.end)
      );

      if (invalidRanges.length > 0) {
        setError('Start time must be before end time for all enabled meals');
        return;
      }

      await messService.updateOperatingHours(operatingHours);
      
      setSuccess('Operating hours updated successfully!');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (err: any) {
      console.error('Failed to save operating hours:', err);
      setError(err.message || 'Failed to save operating hours');
      
      // Clear error message after 5 seconds
      setTimeout(() => {
        setError(null);
      }, 5000);
    } finally {
      setSaving(false);
    }
  };

  const getMealDisplayName = (meal: string) => {
    return meal.charAt(0).toUpperCase() + meal.slice(1);
  };

  return {
    operatingHours,
    loading,
    saving,
    error,
    success,
    handleOperatingHourChange,
    validateTimeRange,
    handleSave,
    getMealDisplayName,
  };
};
