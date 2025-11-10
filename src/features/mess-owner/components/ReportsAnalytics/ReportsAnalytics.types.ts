export interface ReportsAnalyticsProps {
  // Add any props if needed
}

export interface ReportsAnalyticsState {
  loading: boolean;
  error: string | null;
  data: any;
}

export interface ReportsAnalyticsData {
  // Define your analytics data structure here
  totalUsers?: number;
  totalRevenue?: number;
  activeSubscriptions?: number;
  monthlyGrowth?: number;
}



