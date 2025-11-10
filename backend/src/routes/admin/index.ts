// Admin Routes Barrel File
// This file exports all admin-related routes in an organized manner

import { Router, NextFunction } from 'express';
import userManagementRoutes from './userManagement';
import analyticsRoutes from './analytics';
import reportsRoutes from './reports';
import settingsRoutes from './settings';
import systemRoutes from './system';
import defaultMealPlansRoutes from './defaultMealPlans';
import tutorialVideosRoutes from './tutorialVideos';
import adminAdsRoutes from './ads';
import requireAuth from '../../middleware/requireAuth';
import { handleAuthError } from '../../middleware/errorHandler';
import User from '../../models/User';
import MessProfile from '../../models/MessProfile';
import MessMembership from '../../models/MessMembership';

const router: Router = Router();

// Middleware to check if user is admin
const requireAdmin = async (req: any, res: any, next: NextFunction) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    
    if (!user || user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }
    
    next();
  } catch (err) {
    return handleAuthError(res, err);
  }
};

// GET /api/admin/dashboard/stats - Get dashboard stats (direct route)
router.get('/dashboard/stats', requireAuth, requireAdmin, async (_req: any, res: any, next: NextFunction) => {
  try {
    // Get user statistics
    const totalUsers = await User.countDocuments();
    const verifiedUsers = await User.countDocuments({ isVerified: true });
    const unverifiedUsers = await User.countDocuments({ isVerified: false });
    const adminUsers = await User.countDocuments({ role: 'admin' });
    const suspendedUsers = await User.countDocuments({ isSuspended: true });

    // Get mess statistics
    const totalMesses = await MessProfile.countDocuments();
    const activeMesses = await MessProfile.countDocuments({ isActive: true });
    const inactiveMesses = await MessProfile.countDocuments({ isActive: false });

    // Get membership statistics
    const totalMemberships = await MessMembership.countDocuments();
    const activeMemberships = await MessMembership.countDocuments({ status: 'active' });
    const pendingMemberships = await MessMembership.countDocuments({ status: 'pending' });
    const inactiveMemberships = await MessMembership.countDocuments({ status: 'inactive' });

    // Get recent activity (last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const newUsersLastWeek = await User.countDocuments({ createdAt: { $gte: sevenDaysAgo } });
    const newMessesLastWeek = await MessProfile.countDocuments({ createdAt: { $gte: sevenDaysAgo } });

    const dashboardData = {
      overview: {
        totalUsers,
        totalMesses,
        totalMemberships,
        activeMemberships
      },
      userStats: {
        verified: verifiedUsers,
        unverified: unverifiedUsers,
        admins: adminUsers,
        suspended: suspendedUsers,
        verificationRate: totalUsers > 0 ? Math.round((verifiedUsers / totalUsers) * 100) : 0
      },
      messStats: {
        active: activeMesses,
        inactive: inactiveMesses,
        activeRate: totalMesses > 0 ? Math.round((activeMesses / totalMesses) * 100) : 0
      },
      membershipStats: {
        active: activeMemberships,
        pending: pendingMemberships,
        inactive: inactiveMemberships,
        activeRate: totalMemberships > 0 ? Math.round((activeMemberships / totalMemberships) * 100) : 0
      },
      recentActivity: {
        newUsersLastWeek,
        newMessesLastWeek
      },
      timestamp: new Date().toISOString()
    };

    return res.status(200).json({
      success: true,
      data: dashboardData
    });
  } catch (err) {
    console.error('Error fetching dashboard stats:', err);
    return handleAuthError(res, err);
  }
});

// GET /api/admin/recent-activity - Get recent activity
router.get('/recent-activity', requireAuth, requireAdmin, async (_req: any, res: any, next: NextFunction) => {
  try {
    // Get recent user registrations
    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .select('firstName lastName email role createdAt');

    // Get recent mess creations
    const recentMesses = await MessProfile.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .select('name location createdAt');

    // Get recent memberships
    const recentMemberships = await MessMembership.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('userId', 'firstName lastName email')
      .populate('messId', 'name location');

    const recentActivity = {
      users: recentUsers.map(user => ({
        id: user._id,
        type: 'user_registration',
        title: `New ${user.role} registered`,
        description: `${user.firstName} ${user.lastName} (${user.email})`,
        timestamp: user.createdAt,
        status: 'success'
      })),
      messes: recentMesses.map(mess => ({
        id: mess._id,
        type: 'mess_creation',
        title: `New mess created`,
        description: `${mess.name} in ${mess.location}`,
        timestamp: mess.createdAt,
        status: 'success'
      })),
      memberships: recentMemberships.map(membership => {
        const user = membership.userId as any;
        const mess = membership.messId as any;
        return {
          id: membership._id,
          type: 'subscription',
          title: `New membership`,
          description: `${user?.firstName || 'Unknown'} ${user?.lastName || 'User'} joined ${mess?.name || 'Unknown Mess'}`,
          timestamp: membership.createdAt,
          status: membership.status === 'active' ? 'success' : 'warning'
        };
      })
    };

    // Combine and sort all activities by timestamp
    const allActivities = [
      ...recentActivity.users,
      ...recentActivity.messes,
      ...recentActivity.memberships
    ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 20); // Get top 20 most recent activities

    return res.status(200).json({
      success: true,
      data: allActivities
    });
  } catch (err) {
    console.error('Error fetching recent activity:', err);
    return handleAuthError(res, err);
  }
});

// Mount sub-routes
router.use('/users', userManagementRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/reports', reportsRoutes);
router.use('/settings', settingsRoutes);
router.use('/system', systemRoutes);
router.use('/default-meal-plans', defaultMealPlansRoutes);
router.use('/tutorial-videos', tutorialVideosRoutes);
router.use('/ads', adminAdsRoutes);

export default router;