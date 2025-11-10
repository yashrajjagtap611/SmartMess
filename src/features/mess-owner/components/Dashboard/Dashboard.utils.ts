// Utility functions for the Dashboard component

import type { DashboardStats } from './Dashboard.types';

export const dashboardUtils = {
  // Format currency values
  formatCurrency: (amount: number): string => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  },

  // Calculate percentage change
  calculatePercentageChange: (current: number, previous: number): number => {
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  },

  // Format large numbers with K/M suffix
  formatNumber: (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  },

  // Sort stats by value
  sortStatsByValue: (stats: DashboardStats): DashboardStats => {
    // Implement sorting logic
    return stats;
  }
};
