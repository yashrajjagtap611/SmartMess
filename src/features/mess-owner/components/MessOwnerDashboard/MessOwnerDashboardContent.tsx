import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { ROUTES } from '@/constants/routes';
import {
  UsersIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';

const MessOwnerDashboardContent: React.FC = () => {
  const { user } = useUser();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [dashboardStats, setDashboardStats] = useState<any>(null);

  useEffect(() => {
    // Mock data loading
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setDashboardStats({
          totalUsers: 45,
          activeUsers: 38,
          totalRevenue: 125000,
          pendingRequests: 3,
          todayMeals: 120,
          activeMemberships: 42
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load dashboard data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [toast]);

  const quickActions = [
    {
      title: "User Management",
      description: "Manage mess members",
      icon: UsersIcon,
      route: ROUTES.MESS_OWNER.USERS,
      color: "bg-blue-500"
    },
    {
      title: "Meal Management",
      description: "Plan today's meals",
      icon: CalendarIcon,
      route: ROUTES.MESS_OWNER.MEAL,
      color: "bg-green-500"
    },
    {
      title: "Billing & Payments",
      description: "View payments",
      icon: CurrencyDollarIcon,
      route: ROUTES.MESS_OWNER.BILLING,
      color: "bg-purple-500"
    },
    {
      title: "Reports & Analytics",
      description: "View analytics",
      icon: ChartBarIcon,
      route: ROUTES.MESS_OWNER.REPORTS,
      color: "bg-indigo-500"
    }
  ];

  const recentActivities = [
    {
      id: "1",
      type: "user_registration",
      title: "New member joined",
      description: "John Doe joined your mess",
      timestamp: "2 minutes ago",
      status: "success"
    },
    {
      id: "2",
      type: "payment_received",
      title: "Payment received",
      description: "₹1,200 received from monthly subscription",
      timestamp: "5 minutes ago",
      status: "success"
    },
    {
      id: "3",
      type: "leave_request",
      title: "Leave request",
      description: "Sarah requested leave for tomorrow",
      timestamp: "10 minutes ago",
      status: "warning"
    },
    {
      id: "4",
      type: "feedback",
      title: "New feedback",
      description: "Feedback received about meal quality",
      timestamp: "15 minutes ago",
      status: "info"
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Mess Owner Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Welcome back, {user?.firstName || 'Mess Owner'}! Here's your overview.
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
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total Members
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {dashboardStats?.totalUsers || 0}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {dashboardStats?.activeUsers || 0} active
              </p>
            </div>
            <div className="p-3 rounded-xl bg-blue-500">
              <UsersIcon className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Monthly Revenue
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                ₹{dashboardStats?.totalRevenue?.toLocaleString() || 0}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                This month
              </p>
            </div>
            <div className="p-3 rounded-xl bg-green-500">
              <CurrencyDollarIcon className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Today's Meals
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {dashboardStats?.todayMeals || 0}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Served today
              </p>
            </div>
            <div className="p-3 rounded-xl bg-purple-500">
              <CalendarIcon className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Pending Requests
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {dashboardStats?.pendingRequests || 0}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Need attention
              </p>
            </div>
            <div className="p-3 rounded-xl bg-yellow-500">
              <ExclamationTriangleIcon className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, index) => (
            <button
              key={index}
              onClick={() => navigate(action.route)}
              className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 text-left"
            >
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${action.color}`}>
                  <action.icon className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {action.title}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {action.description}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Recent Activity
        </h3>
        <div className="space-y-4">
          {recentActivities.map((activity) => (
            <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700">
              <div className={`flex-shrink-0 w-2 h-2 rounded-full mt-2 ${
                activity.status === 'success' ? 'bg-green-500' : 
                activity.status === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
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

export default MessOwnerDashboardContent;





