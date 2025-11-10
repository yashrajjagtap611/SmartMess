// Admin Services
// This file contains business logic for admin-related operations


import MessProfile from '../models/MessProfile';
import MessMembership from '../models/MessMembership';
import { IAdminDashboard, IUserAnalytics, IMessAnalytics, IMembershipAnalytics } from '../types/admin';
import User from '../models/User';

export class AdminService {
  // Dashboard Analytics
  static async getDashboardData(): Promise<IAdminDashboard> {
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

      return {
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
    } catch (error) {
      throw new Error(`Failed to get dashboard data: ${error}`);
    }
  }

  // User Analytics
  static async getUserAnalytics(period: string = '30d'): Promise<IUserAnalytics> {
    try {
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

      return {
        period,
        startDate: startDate.toISOString(),
        endDate: new Date().toISOString(),
        registrations: userRegistrations,
        roleDistribution: userRoleDistribution,
        verificationStatus: userVerificationStatus,
        totalUsers: await User.countDocuments(),
        newUsersInPeriod: await User.countDocuments({ createdAt: { $gte: startDate } })
      };
    } catch (error) {
      throw new Error(`Failed to get user analytics: ${error}`);
    }
  }

  // Mess Analytics
  static async getMessAnalytics(period: string = '30d'): Promise<IMessAnalytics> {
    try {
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
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]);

      return {
        period,
        startDate: startDate.toISOString(),
        endDate: new Date().toISOString(),
        creations: messCreations,
        statusDistribution: messStatusDistribution,
        locationDistribution: messLocationDistribution,
        totalMesses: await MessProfile.countDocuments(),
        newMessesInPeriod: await MessProfile.countDocuments({ createdAt: { $gte: startDate } })
      };
    } catch (error) {
      throw new Error(`Failed to get mess analytics: ${error}`);
    }
  }

  // Membership Analytics
  static async getMembershipAnalytics(period: string = '30d'): Promise<IMembershipAnalytics> {
    try {
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

      return {
        period,
        startDate: startDate.toISOString(),
        endDate: new Date().toISOString(),
        creations: membershipCreations,
        statusDistribution: membershipStatusDistribution,
        paymentStatusDistribution: membershipPaymentStatusDistribution,
        totalMemberships: await MessMembership.countDocuments(),
        newMembershipsInPeriod: await MessMembership.countDocuments({ createdAt: { $gte: startDate } })
      };
    } catch (error) {
      throw new Error(`Failed to get membership analytics: ${error}`);
    }
  }

  // User Management
  static async getUsersWithFilters(filters: any, page: number = 1, limit: number = 20) {
    try {
      const skip = (page - 1) * limit;
      
      // Build query
      const query: any = {};
      if (filters.search) {
        query.$or = [
          { firstName: { $regex: filters.search, $options: 'i' } },
          { lastName: { $regex: filters.search, $options: 'i' } },
          { email: { $regex: filters.search, $options: 'i' } }
        ];
      }
      if (filters.role) query.role = filters.role;
      if (filters.status) query.isVerified = filters.status === 'verified';

      // Build sort object
      const sort: any = {};
      sort[filters.sortBy || 'createdAt'] = filters.sortOrder === 'desc' ? -1 : 1;

      const users = await User.find(query)
        .select('-password')
        .sort(sort)
        .skip(skip)
        .limit(limit);

      const total = await User.countDocuments(query);

      // Get additional stats for each user
      const usersWithStats = await Promise.all(users.map(async (user) => {
        const memberships = await MessMembership.countDocuments({ userId: user._id });
        
        return {
          ...user.toObject(),
          totalMesses: memberships,
          lastActivity: user.lastLogin || user.createdAt
        };
      }));

      return {
        users: usersWithStats,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      throw new Error(`Failed to get users with filters: ${error}`);
    }
  }

  // Mess Management
  static async getMessesWithFilters(filters: any, page: number = 1, limit: number = 20) {
    try {
      const skip = (page - 1) * limit;
      
      // Build query
      const query: any = {};
      if (filters.search) {
        query.$or = [
          { name: { $regex: filters.search, $options: 'i' } },
          { 'location.city': { $regex: filters.search, $options: 'i' } },
          { 'location.state': { $regex: filters.search, $options: 'i' } }
        ];
      }
      if (filters.status) query.isActive = filters.status === 'active';

      // Build sort object
      const sort: any = {};
      sort[filters.sortBy || 'createdAt'] = filters.sortOrder === 'desc' ? -1 : 1;

      const messes = await MessProfile.find(query)
        .populate('userId', 'firstName lastName email')
        .sort(sort)
        .skip(skip)
        .limit(limit);

      const total = await MessProfile.countDocuments(query);

      // Get additional stats for each mess
      const messesWithStats = await Promise.all(messes.map(async (mess) => {
        const memberships = await MessMembership.countDocuments({ messId: mess._id });
        const activeMemberships = await MessMembership.countDocuments({ 
          messId: mess._id, 
          status: 'active' 
        });
        
        return {
          ...mess.toObject(),
          totalMembers: memberships,
          activeMembers: activeMemberships,
          owner: {
            id: (mess.userId as any)?._id,
            name: `${(mess.userId as any)?.firstName} ${(mess.userId as any)?.lastName}`,
            email: (mess.userId as any)?.email
          }
        };
      }));

      return {
        messes: messesWithStats,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      throw new Error(`Failed to get messes with filters: ${error}`);
    }
  }

  // System Health Check
  static async getSystemHealth() {
    try {
      const healthStatus = {
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env['NODE_ENV'] || 'development',
        nodeVersion: process.version,
        platform: process.platform,
        memory: {
          used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
          total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
          external: Math.round(process.memoryUsage().external / 1024 / 1024)
        },
        cpu: process.cpuUsage(),
        database: {
          status: 'connected', // This would be checked against actual DB connection
          collections: ['users', 'messes', 'memberships', 'payments']
        }
      };

      return healthStatus;
    } catch (error) {
      throw new Error(`Failed to get system health: ${error}`);
    }
  }

  // Backup Operations
  static async createBackup(type: string, adminId: string) {
    try {
      // Mock backup creation - in real implementation, you'd create actual backups
      const backupInfo = {
        type,
        filename: `backup-${type}-${new Date().toISOString().split('T')[0]}.json`,
        size: '0 KB',
        createdAt: new Date().toISOString(),
        createdBy: adminId,
        status: 'completed'
      };

      return backupInfo;
    } catch (error) {
      throw new Error(`Failed to create backup: ${error}`);
    }
  }

  // Email Testing
  static async testEmailConfiguration(email: string) {
    try {
      // Mock email test - in real implementation, you'd send actual test emails
      const testResult = {
        to: email,
        sentAt: new Date().toISOString(),
        status: 'sent',
        messageId: `test_${Date.now()}`
      };

      return testResult;
    } catch (error) {
      throw new Error(`Failed to test email configuration: ${error}`);
    }
  }
}

export default AdminService; 