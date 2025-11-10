// Utility functions for AdminDashboard
import { AdminRecentActivity } from './AdminDashboard.types';

export const formatCurrency = (amount: number): string => {
  return `₹${amount.toLocaleString()}`;
};

export const formatNumber = (num: number): string => {
  return num.toLocaleString();
};

export const getStatusColorClass = (status: 'success' | 'warning' | 'info' | 'error'): string => {
  switch (status) {
    case 'success': return 'bg-green-500';
    case 'warning': return 'bg-yellow-500';
    case 'info': return 'bg-blue-500';
    case 'error': return 'bg-red-500';
    default: return 'bg-gray-500';
  }
};

export const getActivityIcon = (type: AdminRecentActivity['type']) => {
  switch (type) {
    case 'user_registration':
      return '👤';
    case 'mess_creation':
      return '🏠';
    case 'payment':
      return '💰';
    case 'complaint':
      return '⚠️';
    case 'subscription':
      return '📅';
    default:
      return '📋';
  }
};

export const calculateGrowthRate = (current: number, previous: number): number => {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
};

export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export const formatDateTime = (dateString: string): string => {
  return new Date(dateString).toLocaleString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};
