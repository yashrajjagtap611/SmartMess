// Common Shared Types
export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface ApiError {
  message: string;
  code: string;
  statusCode: number;
  details?: Record<string, any>;
}

export interface LoadingState {
  isLoading: boolean;
  error: string | null;
}

export interface FormState {
  isValid: boolean;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
}

// UI Types
export interface Theme {
  mode: 'light' | 'dark' | 'auto';
  primary: string;
  secondary: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
  error: string;
  warning: string;
  success: string;
  info: string;
}

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  closeOnOverlayClick?: boolean;
  showCloseButton?: boolean;
}

export interface DropdownOption {
  value: string;
  label: string;
  disabled?: boolean;
  icon?: React.ReactNode;
}

export interface TableColumn<T = any> {
  key: string;
  label: string;
  sortable?: boolean;
  width?: string | number;
  render?: (value: any, row: T) => React.ReactNode;
}

export interface TableProps<T> {
  data: T[];
  columns: TableColumn<T>[];
  loading?: boolean;
  pagination?: PaginatedResult<T>;
  onPageChange?: (page: number) => void;
  onSort?: (key: string, order: 'asc' | 'desc') => void;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  emptyMessage?: string;
  rowKey?: keyof T | ((row: T) => string);
}

// Form Types
export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'date' | 'file';
  placeholder?: string;
  required?: boolean;
  validation?: ValidationRule[];
  options?: DropdownOption[];
  disabled?: boolean;
  defaultValue?: any;
}

export interface ValidationRule {
  type: 'required' | 'email' | 'min' | 'max' | 'pattern' | 'custom';
  value?: any;
  message: string;
}

export interface FormConfig {
  fields: FormField[];
  onSubmit: (data: Record<string, any>) => void | Promise<void>;
  submitText?: string;
  loading?: boolean;
  initialValues?: Record<string, any>;
}

// File Upload Types
export interface FileUploadConfig {
  accept?: string;
  maxSize?: number; // in bytes
  maxFiles?: number;
  multiple?: boolean;
  onUpload: (files: File[]) => Promise<void>;
  onError?: (error: string) => void;
}

export interface UploadProgress {
  file: File;
  progress: number;
  status: 'uploading' | 'completed' | 'error';
  url?: string;
  error?: string;
}

// Notification Types
export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  actionUrl?: string;
  metadata?: Record<string, any>;
}

export interface NotificationPreferences {
  email: boolean;
  sms: boolean;
  push: boolean;
  mealReminders: boolean;
  paymentReminders: boolean;
  promotionalEmails: boolean;
}

// Search and Filter Types
export interface SearchFilters {
  query?: string;
  category?: string;
  tags?: string[];
  dateRange?: {
    start: string;
    end: string;
  };
  priceRange?: {
    min: number;
    max: number;
  };
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface SearchResult<T> {
  data: T[];
  total: number;
  query: string;
  filters: SearchFilters;
}

// Permission Types
export type Permission = 
  | 'read:users'
  | 'write:users'
  | 'delete:users'
  | 'read:mess'
  | 'write:mess'
  | 'delete:mess'
  | 'read:payments'
  | 'write:payments'
  | 'read:reports'
  | 'write:reports'
  | 'admin:all';

export interface RolePermissions {
  role: string;
  permissions: Permission[];
}

// Analytics Types
export interface AnalyticsData {
  period: string;
  metrics: Record<string, number>;
  trends: Record<string, number>;
  breakdown: Record<string, any>;
}

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string;
    borderColor?: string;
  }[];
} 