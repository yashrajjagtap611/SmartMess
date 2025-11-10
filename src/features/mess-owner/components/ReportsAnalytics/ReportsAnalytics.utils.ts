import type { ReportsAnalyticsData } from './ReportsAnalytics.types';

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

export const formatPercentage = (value: number): string => {
  return `${value.toFixed(1)}%`;
};

export const formatNumber = (value: number): string => {
  return new Intl.NumberFormat('en-US').format(value);
};

export const calculateGrowthRate = (current: number, previous: number): number => {
  if (previous === 0) return 0;
  return ((current - previous) / previous) * 100;
};

export const getAnalyticsSummary = (data: ReportsAnalyticsData) => {
  return {
    totalUsers: data.totalUsers || 0,
    totalRevenue: data.totalRevenue || 0,
    activeSubscriptions: data.activeSubscriptions || 0,
    monthlyGrowth: data.monthlyGrowth || 0,
  };
};



