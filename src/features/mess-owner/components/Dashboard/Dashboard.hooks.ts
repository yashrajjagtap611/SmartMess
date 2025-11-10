import { useState, useEffect } from 'react';
import type { DashboardStats, DashboardHookResult } from './Dashboard.types';

export function useDashboard(): DashboardHookResult {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        // TODO: Implement API call to fetch dashboard stats
        const response = await fetch('/api/mess-owner/dashboard-stats');
        const data = await response.json();
        setStats(data);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch dashboard stats'));
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);

  return { stats, loading, error };
}
