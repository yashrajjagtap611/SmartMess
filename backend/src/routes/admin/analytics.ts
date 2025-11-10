import { Router, Request, Response, NextFunction } from 'express';
import requireAuth from '../../middleware/requireAuth';
import { handleAuthError } from '../../middleware/errorHandler';
import User from '../../models/User';
import MessProfile from '../../models/MessProfile';
import MessMembership from '../../models/MessMembership';

const router: Router = Router();

// Middleware to check if user is admin
const requireAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
        const userId = (req as any).user.id;
        const user = await User.findById(userId);
    
    if (!user || user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }
    
    return next();
  } catch (err) {
    return handleAuthError(res, err);
  }
};

// GET /api/admin/dashboard/stats - Get dashboard stats (alias for compatibility)
router.get('/dashboard/stats', requireAuth, requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
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

// GET /api/admin/analytics/dashboard - Get analytics dashboard data
router.get('/dashboard', requireAuth, requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
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
    console.error('Error fetching analytics dashboard:', err);
    return handleAuthError(res, err);
  }
});

// GET /api/admin/analytics/users - Get user analytics
router.get('/users', requireAuth, requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { period = '30d' } = req.query;

    // Calculate date range based on period
    let startDate: Date;
    switch (period) {
      case '7d':
        startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    }

    // Get user registration data
    const userRegistrations = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$createdAt'
            }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    // Get user role distribution
    const userRoleDistribution = await User.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get user verification status
    const userVerificationStatus = await User.aggregate([
      {
        $group: {
          _id: '$isVerified',
          count: { $sum: 1 }
        }
      }
    ]);

    const userAnalytics = {
      period,
      startDate: startDate.toISOString(),
      endDate: new Date().toISOString(),
      registrations: userRegistrations,
      roleDistribution: userRoleDistribution,
      verificationStatus: userVerificationStatus,
      totalUsers: await User.countDocuments(),
      newUsersInPeriod: await User.countDocuments({ createdAt: { $gte: startDate } })
    };

    return res.status(200).json({
      success: true,
      data: userAnalytics
    });
  } catch (err) {
    console.error('Error fetching user analytics:', err);
    return handleAuthError(res, err);
  }
});

// GET /api/admin/analytics/messes - Get mess analytics
router.get('/messes', requireAuth, requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { period = '30d' } = req.query;

    // Calculate date range based on period
    let startDate: Date;
    switch (period) {
      case '7d':
        startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    }

    // Get mess creation data
    const messCreations = await MessProfile.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$createdAt'
            }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    // Get mess status distribution
    const messStatusDistribution = await MessProfile.aggregate([
      {
        $group: {
          _id: '$isActive',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get mess location distribution
    const messLocationDistribution = await MessProfile.aggregate([
      {
        $group: {
          _id: '$location.state',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      },
      {
        $limit: 10
      }
    ]);

    const messAnalytics = {
      period,
      startDate: startDate.toISOString(),
      endDate: new Date().toISOString(),
      creations: messCreations,
      statusDistribution: messStatusDistribution,
      locationDistribution: messLocationDistribution,
      totalMesses: await MessProfile.countDocuments(),
      newMessesInPeriod: await MessProfile.countDocuments({ createdAt: { $gte: startDate } })
    };

    return res.status(200).json({
      success: true,
      data: messAnalytics
    });
  } catch (err) {
    console.error('Error fetching mess analytics:', err);
    return handleAuthError(res, err);
  }
});

// GET /api/admin/analytics/memberships - Get membership analytics
router.get('/memberships', requireAuth, requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { period = '30d' } = req.query;

    // Calculate date range based on period
    let startDate: Date;
    switch (period) {
      case '7d':
        startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    }

    // Get membership creation data
    const membershipCreations = await MessMembership.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$createdAt'
            }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    // Get membership status distribution
    const membershipStatusDistribution = await MessMembership.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get membership payment status distribution
    const membershipPaymentStatusDistribution = await MessMembership.aggregate([
      {
        $group: {
          _id: '$paymentStatus',
          count: { $sum: 1 }
        }
      }
    ]);

    const membershipAnalytics = {
      period,
      startDate: startDate.toISOString(),
      endDate: new Date().toISOString(),
      creations: membershipCreations,
      statusDistribution: membershipStatusDistribution,
      paymentStatusDistribution: membershipPaymentStatusDistribution,
      totalMemberships: await MessMembership.countDocuments(),
      newMembershipsInPeriod: await MessMembership.countDocuments({ createdAt: { $gte: startDate } })
    };

    return res.status(200).json({
      success: true,
      data: membershipAnalytics
    });
  } catch (err) {
    console.error('Error fetching membership analytics:', err);
    return handleAuthError(res, err);
  }
});

// GET /api/admin/analytics/trends - Get trend analytics
router.get('/trends', requireAuth, requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { metric = 'users', period = '30d' } = req.query;

    // Calculate date range based on period
    let startDate: Date;
    let interval: string;
    
    switch (period) {
      case '7d':
        startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        interval = '%Y-%m-%d';
        break;
      case '30d':
        startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        interval = '%Y-%m-%d';
        break;
      case '90d':
        startDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
        interval = '%Y-%m-%d';
        break;
      default:
        startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        interval = '%Y-%m-%d';
    }

    let trendData;
    
    switch (metric) {
      case 'users':
        trendData = await User.aggregate([
          {
            $match: {
              createdAt: { $gte: startDate }
            }
          },
          {
            $group: {
              _id: {
                $dateToString: {
                  format: interval,
                  date: '$createdAt'
                }
              },
              count: { $sum: 1 }
            }
          },
          {
            $sort: { _id: 1 }
          }
        ]);
        break;
        
      case 'messes':
        trendData = await MessProfile.aggregate([
          {
            $match: {
              createdAt: { $gte: startDate }
            }
          },
          {
            $group: {
              _id: {
                $dateToString: {
                  format: interval,
                  date: '$createdAt'
                }
              },
              count: { $sum: 1 }
            }
          },
          {
            $sort: { _id: 1 }
          }
        ]);
        break;
        
      case 'memberships':
        trendData = await MessMembership.aggregate([
          {
            $match: {
              createdAt: { $gte: startDate }
            }
          },
          {
            $group: {
              _id: {
                $dateToString: {
                  format: interval,
                  date: '$createdAt'
                }
              },
              count: { $sum: 1 }
            }
          },
          {
            $sort: { _id: 1 }
          }
        ]);
        break;
        
      default:
        trendData = [];
    }

    const trends = {
      metric,
      period,
      startDate: startDate.toISOString(),
      endDate: new Date().toISOString(),
      data: trendData,
      total: trendData.reduce((sum, item) => sum + item.count, 0)
    };

    return res.status(200).json({
      success: true,
      data: trends
    });
  } catch (err) {
    console.error('Error fetching trend analytics:', err);
    return handleAuthError(res, err);
  }
});

// GET /api/admin/analytics/realtime - Get real-time analytics data
router.get('/realtime', requireAuth, requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);

    // Get today's signups
    const todaySignups = await User.countDocuments({
      createdAt: { $gte: today }
    });

    // Get active users (users who logged in within last 24 hours)
    const activeUsers = await User.countDocuments({
      lastLoginAt: { $gte: last24Hours }
    });

    // Get online users (simulated - would need session tracking in real app)
    const onlineUsers = Math.floor(activeUsers * 0.3); // Approximate 30% of active users

    // Get today's revenue (would need payment model in real app)
    const todayRevenue = Math.floor(Math.random() * 50000) + 10000; // Simulated

    // System health check
    const systemHealth = 'healthy'; // Would check actual system metrics

    const realTimeData = {
      activeUsers,
      onlineUsers,
      todayRevenue,
      todaySignups,
      systemHealth,
      timestamp: new Date().toISOString()
    };

    return res.status(200).json({
      success: true,
      data: realTimeData
    });
  } catch (err) {
    console.error('Error fetching real-time analytics:', err);
    return handleAuthError(res, err);
  }
});

// GET /api/admin/analytics/charts - Get chart data for dashboard
router.get('/charts', requireAuth, requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const last7Days = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    // Get user growth data for last 7 days
    const userGrowth = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: last7Days }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$createdAt'
            }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    // Get revenue growth data (simulated)
    const revenueGrowth = Array.from({ length: 7 }, (_, i) => ({
      _id: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      amount: Math.floor(Math.random() * 10000) + 5000
    }));

    // Get mess growth data for last 7 days
    const messGrowth = await MessProfile.aggregate([
      {
        $match: {
          createdAt: { $gte: last7Days }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$createdAt'
            }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    const chartData = {
      userGrowth,
      revenueGrowth,
      messGrowth,
      period: '7d',
      timestamp: new Date().toISOString()
    };

    return res.status(200).json({
      success: true,
      data: chartData
    });
  } catch (err) {
    console.error('Error fetching chart data:', err);
    return handleAuthError(res, err);
  }
});

export default router;