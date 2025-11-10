import type { FilterOption } from './UserManagement.types';
import { Users, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';

export const getPlanBadgeColor = (plan: string) => {
  switch (plan) {
    case 'Premium':
      return 'bg-gradient-to-r from-SmartMess-light-success/20 to-SmartMess-light-success/10 text-SmartMess-light-success dark:from-SmartMess-dark-success/30 dark:to-SmartMess-dark-success/20 dark:text-SmartMess-dark-success font-semibold';
    case 'Basic':
      return 'bg-gradient-to-r from-SmartMess-light-info/20 to-SmartMess-light-info/10 text-SmartMess-light-info dark:from-SmartMess-dark-info/30 dark:to-SmartMess-dark-info/20 dark:text-SmartMess-dark-info font-semibold';
    case 'Standard':
      return 'bg-gradient-to-r from-SmartMess-light-secondary dark:SmartMess-dark-secondary/20 to-SmartMess-light-secondary dark:SmartMess-dark-secondary/10 text-SmartMess-light-secondary dark:SmartMess-dark-secondary dark:from-SmartMess-light-secondary dark:SmartMess-dark-secondary/30 dark:to-SmartMess-light-secondary dark:SmartMess-dark-secondary/20 dark:text-SmartMess-light-secondary dark:SmartMess-dark-secondary font-semibold';
    default:
      return 'bg-gradient-to-r from-gray-100 to-gray-50 text-gray-800 dark:from-gray-800/30 dark:to-gray-700/30 dark:text-gray-300 font-semibold';
  }
};

export const getPaymentStatusColor = (status: string) => {
  switch (status) {
    case 'Paid':
      return 'text-SmartMess-light-success dark:text-SmartMess-dark-success';
    case 'Pending':
      return 'text-SmartMess-light-warning dark:text-SmartMess-dark-warning';
    case 'Overdue':
      return 'text-SmartMess-light-error dark:text-SmartMess-dark-error';
    default:
      return 'text-SmartMess-light-text dark:SmartMess-dark-text-muted dark:text-SmartMess-light-text dark:SmartMess-dark-text-muted';
  }
};

export const getStatusIndicatorColor = (status: string) => {
  switch (status) {
    case 'Paid':
      return 'bg-SmartMess-light-success dark:bg-SmartMess-dark-success';
    case 'Pending':
      return 'bg-SmartMess-light-warning dark:bg-SmartMess-dark-warning';
    case 'Overdue':
      return 'bg-SmartMess-light-error dark:bg-SmartMess-dark-error';
    default:
      return 'bg-SmartMess-light-text dark:SmartMess-dark-text-muted dark:bg-SmartMess-light-text dark:SmartMess-dark-text-muted';
  }
};

export const getStatusBadgeBackground = (status: string) => {
  switch (status) {
    case 'Paid':
      return 'bg-SmartMess-light-success/15 dark:bg-SmartMess-dark-success/25 border-SmartMess-light-success/30 dark:border-SmartMess-dark-success/40';
    case 'Pending':
      return 'bg-SmartMess-light-warning/15 dark:bg-SmartMess-dark-warning/25 border-SmartMess-light-warning/30 dark:border-SmartMess-dark-warning/40';
    case 'Overdue':
      return 'bg-SmartMess-light-error/15 dark:bg-SmartMess-dark-error/25 border-SmartMess-light-error/30 dark:border-SmartMess-dark-error/40';
    default:
      return 'bg-gray-100/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700';
  }
};

export const getFilterBadgeColor = (filter: FilterOption) => {
  switch (filter) {
    case 'active':
      return 'bg-SmartMess-light-success/20 text-SmartMess-light-success dark:bg-SmartMess-dark-success/30 dark:text-SmartMess-dark-success';
    case 'inactive':
      return 'bg-SmartMess-light-error/20 text-SmartMess-light-error dark:bg-SmartMess-dark-error/30 dark:text-SmartMess-dark-error';
    case 'pending':
      return 'bg-SmartMess-light-warning/20 text-SmartMess-light-warning dark:bg-SmartMess-dark-warning/30 dark:text-SmartMess-dark-warning';
    case 'overdue':
      return 'bg-SmartMess-light-error/20 text-SmartMess-light-error dark:bg-SmartMess-dark-error/30 dark:text-SmartMess-dark-error';
    default:
      return 'bg-SmartMess-light-primary dark:SmartMess-dark-primary/20 text-SmartMess-light-primary dark:SmartMess-dark-primary dark:bg-SmartMess-light-primary dark:SmartMess-dark-primary/30 dark:text-SmartMess-light-primary dark:SmartMess-dark-primary';
  }
};

// Filter options configuration
export const FILTER_OPTIONS = [
  {
    id: 'all' as FilterOption,
    title: 'All Users',
    description: 'Show all registered users',
    icon: Users,
    selected: false
  },
  {
    id: 'active' as FilterOption,
    title: 'Active Users',
    description: 'Users with active subscriptions',
    icon: CheckCircle,
    selected: false
  },
  {
    id: 'inactive' as FilterOption,
    title: 'Inactive Users',
    description: 'Users with expired or suspended accounts',
    icon: XCircle,
    selected: false
  },
  {
    id: 'pending' as FilterOption,
    title: 'Pending Payment',
    description: 'Users with outstanding payments',
    icon: Clock,
    selected: false
  },
  {
    id: 'overdue' as FilterOption,
    title: 'Overdue Payment',
    description: 'Users with overdue payments',
    icon: AlertCircle,
    selected: false
  }
];

export const ALPHABET = Array.from('ABCDEFGHIJKLMNOPQRSTUVWXYZ');
