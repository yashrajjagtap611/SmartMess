import React, { useState, useEffect } from "react";
import type { StatCardProps, AdminRecentActivity } from './AdminDashboard.types';
import {
  UsersIcon,
  BuildingOfficeIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { useUser } from '@/contexts/AuthContext';
import { authService } from '@/services/authService';
import adminService from '../../../../services/api/adminService';
import { useToast } from '@/hooks/use-toast';

const AdminDashboardContent: React.FC = () => {
  const { user } = useUser();
  const { toast } = useToast();
  const token = authService.isAuthenticated() ? localStorage.getItem('authToken') : null;
  
  const [realTimeData, setRealTimeData] = useState<any>(null);
  const [dashboardStats, setDashboardStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Real-time data updates
  useEffect(() => {
    const fetchRealTimeData = async () => {
      try {
        const response = await fetch('/api/admin/analytics/realtime', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          setRealTimeData(data.data);
        }
      } catch (error) {
        console.error('Failed to fetch real-time data:', error);
        toast({
          title: "Error",
          description: "Failed to fetch real-time data",
          variant: "destructive",
        });
      }
    };

    const fetchChartData = async () => {
      try {
        const response = await fetch('/api/admin/analytics/charts', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (response.ok) {
          await response.json();
        }
      } catch (error) {
        console.error('Failed to fetch chart data:', error);
        toast({
          title: "Error",
          description: "Failed to fetch chart data",
          variant: "destructive",
        });
      }
    };

    const fetchDashboardStats = async () => {
      try {
        setLoading(true);
        const response = await adminService.getDashboardStats();
        setDashboardStats(response.data);
        setError(null);
      } catch (error: any) {
        console.error('Failed to fetch dashboard stats:', error);
        setError(error.message || 'Failed to load dashboard data');
        toast({
          title: "Error",
          description: error.message || 'Failed to load dashboard data',
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchRealTimeData();
      fetchChartData();
      fetchDashboardStats();

      // Update real-time data every 30 seconds
      const interval = setInterval(fetchRealTimeData, 30000);
      return () => clearInterval(interval);
    }
  }, [token, toast]);

  // Mock data for demonstration
  const mockStats: StatCardProps[] = [
    {
      title: "Total Users",
      value: dashboardStats?.totalUsers || "1,234",
      change: { value: 12, isPositive: true },
      icon: UsersIcon,
      color: "blue",
      subtitle: "Active users this month"
    },
    {
      title: "Mess Owners",
      value: dashboardStats?.totalMessOwners || "45",
      change: { value: 8, isPositive: true },
      icon: BuildingOfficeIcon,
      color: "green",
      subtitle: "Registered mess owners"
    },
    {
      title: "Revenue",
      value: `₹${dashboardStats?.revenue || "2,45,678"}`,
      change: { value: 15, isPositive: true },
      icon: CurrencyDollarIcon,
      color: "yellow",
      subtitle: "Monthly revenue"
    },
    {
      title: "System Health",
      value: "98.5%",
      change: { value: 0.2, isPositive: true },
      icon: ChartBarIcon,
      color: "purple",
      subtitle: "Uptime this month"
    }
  ];

  const mockActivities: AdminRecentActivity[] = [
    {
      id: "1",
      type: "user_registration",
      title: "New user registered",
      description: "John Doe joined the platform",
      timestamp: "2 minutes ago",
      status: "success"
    },
    {
      id: "2",
      type: "payment",
      title: "Payment processed",
      description: "₹1,200 received from Mess ABC",
      timestamp: "5 minutes ago",
      status: "success"
    },
    {
      id: "3",
      type: "subscription",
      title: "High server load",
      description: "CPU usage at 85%",
      timestamp: "10 minutes ago",
      status: "warning"
    },
    {
      id: "4",
      type: "mess_creation",
      title: "Mess owner approved",
      description: "XYZ Mess approved for operation",
      timestamp: "15 minutes ago",
      status: "success"
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <ExclamationTriangleIcon className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Error Loading Dashboard</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Admin Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Welcome back, {user?.firstName || 'Admin'}
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Last updated: {new Date().toLocaleTimeString()}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {mockStats.map((stat, index) => (
          <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {stat.title}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stat.value}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {stat.subtitle}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <stat.icon className="h-8 w-8 text-primary" />
                {stat.change && (
                  <span className={`text-sm font-medium ${
                    stat.change.isPositive ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {stat.change.isPositive ? '+' : ''}{stat.change.value}%
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Real-time Data */}
      {realTimeData && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Real-time Data
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {realTimeData.activeUsers || 0}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Active Users
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {realTimeData.activeMesses || 0}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Active Messes
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {realTimeData.todayRevenue || 0}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Today's Revenue
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recent Activity */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Recent Activity
        </h3>
        <div className="space-y-4">
          {mockActivities.map((activity) => (
            <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700">
              <div className={`flex-shrink-0 w-2 h-2 rounded-full mt-2 ${
                activity.status === 'success' ? 'bg-green-500' : 
                activity.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
              }`} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {activity.title}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {activity.description}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {activity.timestamp}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardContent;





