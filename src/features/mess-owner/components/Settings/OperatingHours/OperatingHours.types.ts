export interface OperatingHoursProps {
  // Add any props if needed
}

export interface OperatingHoursState {
  operatingHours: OperatingHour[];
  loading: boolean;
  saving: boolean;
  error: string | null;
  success: string | null;
}

export interface OperatingHour {
  meal: string;
  enabled: boolean;
  start: string;
  end: string;
}

export interface OperatingHoursFormProps {
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






