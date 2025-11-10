import React from "react";

export interface AdminDashboardStats {
  totalUsers: number;
  totalMesses: number;
  totalRevenue: number;
  activeSubscriptions: number;
  pendingApprovals: number;
  totalComplaints: number;
}

export interface AdminRecentActivity {
  id: string;
  type: 'user_registration' | 'mess_creation' | 'payment' | 'complaint' | 'subscription';
  title: string;
  description: string;
  timestamp: string;
  status?: 'success' | 'warning' | 'info' | 'error';
  userId?: string;
  messId?: string;
}

export interface UserStats {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'mess_owner' | 'admin';
  status: 'active' | 'inactive' | 'pending';
  joinDate: string;
  lastLogin: string;
  totalPayments: number;
  totalAmount: number;
}

export interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
  subtitle?: string;
  change?: {
    value: number;
    isPositive: boolean;
  };
}

export interface ActivityItemProps {
  activity: AdminRecentActivity;
}

export interface UserStatsCardProps {
  user: UserStats;
}
