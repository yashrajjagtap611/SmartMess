// Main component exports
export { default } from './UserManagement.tsx';
export { default as UserManagement } from './UserManagement.tsx';

// Hook exports
export { useUserManagement } from './UserManagement.hooks';

// Type exports
export type {
  User,
  FilterOption,
  ViewMode,
  FilterOptionConfig,
  UserCardProps,
  UserTableRowProps,
  AlphabetScrollProps,
  FilterModalProps,
  SearchHeaderProps,
  ViewModeToggleProps,
  FilterSummaryProps,
  UserManagementViewProps
} from './UserManagement.types';

// Utility exports
export {
  getPlanBadgeColor,
  getPaymentStatusColor,
  getStatusIndicatorColor,
  getStatusBadgeBackground,
  getFilterBadgeColor,
  FILTER_OPTIONS,
  ALPHABET
} from './UserManagement.utils';

// Component exports
export * from './components';

