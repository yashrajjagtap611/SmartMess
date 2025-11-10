import { useState, useEffect } from "react";
import { authService } from "@/services/authService";
import adminService from "@/services/api/adminService";
import type { AdminDashboardStats, AdminRecentActivity, UserStats } from './AdminDashboard.types';

export const useAdminDashboard = () => {
  const [stats, setStats] = useState<AdminDashboardStats>({
    totalUsers: 0,
    totalMesses: 0,
    totalRevenue: 0,
    activeSubscriptions: 0,
    pendingApprovals: 0,
    totalComplaints: 0
  });
  const [recentActivity, setRecentActivity] = useState<AdminRecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [userStats] = useState<UserStats[]>([]);
  const [unreadNotifications] = useState(0);

  const user = authService.getCurrentUser();

  useEffect(() => {
    loadDashboardData();
    loadUnreadNotifications();
  }, []);

  const loadUnreadNotifications = async () => {
    try {
      // const response = await adminService.getUnreadNotificationCount();
      // if (response.success && response.data) {
      //   setUnreadNotifications(response.data.unreadCount);
      // }
    } catch (error) {
      console.error('Error loading unread notifications:', error);
    }
  };

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load admin dashboard stats
      const statsResponse = await adminService.getDashboardStats();
      if (statsResponse.success && statsResponse.data) {
        setStats(statsResponse.data);
      }

      // Load recent activity
      const activityResponse = await adminService.getRecentActivity();
      if (activityResponse.success && activityResponse.data) {
        setRecentActivity(activityResponse.data);
      }

      // Load user statistics
      // const userStatsResponse = await adminService.getUserStats();
      // if (userStatsResponse.success && userStatsResponse.data) {
      //   setUserStats(userStatsResponse.data);
      // }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    try {
      authService.logout();
    } catch (e) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('userInfo');
      localStorage.removeItem('userRole');
      localStorage.removeItem('authExpires');
    }
    window.location.href = '/login';
  };

  return {
    stats,
    recentActivity,
    loading,
    userStats,
    unreadNotifications,
    user,
    loadDashboardData,
    loadUnreadNotifications,
    handleLogout
  };
};