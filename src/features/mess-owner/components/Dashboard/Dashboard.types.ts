export interface DashboardStats {
  totalUsers: number;
  totalRevenue: number;
  activeSubscriptions: number;
  // Add more stats as needed
}

export interface DashboardProps {
  // Add any props needed for the Dashboard component
}

export interface DashboardHookResult {
  stats: DashboardStats | null;
  loading: boolean;
  error: Error | null;
}
