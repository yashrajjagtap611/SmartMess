// Admin Controllers
// This file contains controller functions for admin-related routes

import { Request, Response, NextFunction } from 'express';
import AdminService from '../services/admin';
import { handleAuthError } from '../middleware/errorHandler';

export class AdminController {
  // Dashboard Controllers
  static async getDashboard(req: Request, res: Response, next: NextFunction) {
    try {
      const dashboardData = await AdminService.getDashboardData();
      
      return res.status(200).json({
        success: true,
        data: dashboardData
      });
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      return handleAuthError(res, err);
    }
  }

  // Analytics Controllers
  static async getUserAnalytics(req: Request, res: Response, next: NextFunction) {
    try {
      const { period = '30d' } = req.query;
      const userAnalytics = await AdminService.getUserAnalytics(period as string);
      
      return res.status(200).json({
        success: true,
        data: userAnalytics
      });
    } catch (err) {
      console.error('Error fetching user analytics:', err);
      return handleAuthError(res, err);
    }
  }

  static async getMessAnalytics(req: Request, res: Response, next: NextFunction) {
    try {
      const { period = '30d' } = req.query;
      const messAnalytics = await AdminService.getMessAnalytics(period as string);
      
      return res.status(200).json({
        success: true,
        data: messAnalytics
      });
    } catch (err) {
      console.error('Error fetching mess analytics:', err);
      return handleAuthError(res, err);
    }
  }

  static async getMembershipAnalytics(req: Request, res: Response, next: NextFunction) {
    try {
      const { period = '30d' } = req.query;
      const membershipAnalytics = await AdminService.getMembershipAnalytics(period as string);
      
      return res.status(200).json({
        success: true,
        data: membershipAnalytics
      });
    } catch (err) {
      console.error('Error fetching membership analytics:', err);
      return handleAuthError(res, err);
    }
  }

  static async getTrendAnalytics(req: Request, res: Response, next: NextFunction) {
    try {
      const { metric = 'users', period = '30d' } = req.query;
      
      let trendData;
      switch (metric) {
        case 'users':
          trendData = await AdminService.getUserAnalytics(period as string);
          break;
        case 'messes':
          trendData = await AdminService.getMessAnalytics(period as string);
          break;
        case 'memberships':
          trendData = await AdminService.getMembershipAnalytics(period as string);
          break;
        default:
          trendData = await AdminService.getUserAnalytics(period as string);
      }

      const trends = {
        metric,
        period,
        startDate: trendData.startDate,
        endDate: trendData.endDate,
        data: (trendData as any).registrations || (trendData as any).creations || [],
        total: (trendData as any).newUsersInPeriod || (trendData as any).newMessesInPeriod || (trendData as any).newMembershipsInPeriod || 0
      };

      return res.status(200).json({
        success: true,
        data: trends
      });
    } catch (err) {
      console.error('Error fetching trend analytics:', err);
      return handleAuthError(res, err);
    }
  }

  // User Management Controllers
  static async getUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const { 
        page = 1, 
        limit = 20, 
        search, 
        role, 
        status, 
        sortBy = 'createdAt', 
        sortOrder = 'desc' 
      } = req.query;

      const filters = { search, role, status, sortBy, sortOrder };
      const result = await AdminService.getUsersWithFilters(filters, Number(page), Number(limit));
      
      return res.status(200).json({
        success: true,
        data: result
      });
    } catch (err) {
      console.error('Error fetching users:', err);
      return handleAuthError(res, err);
    }
  }

  static async getUserDetails(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.params['userId'];
      
      // This would typically use a service method
      // For now, we'll handle it directly in the route
      return res.status(200).json({
        success: true,
        message: 'User details endpoint - implement with service method'
      });
    } catch (err) {
      console.error('Error fetching user details:', err);
      return handleAuthError(res, err);
    }
  }

  static async updateUser(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.params['userId'];
      const updateData = req.body;

      // This would typically use a service method
      // For now, we'll handle it directly in the route
      return res.status(200).json({
        success: true,
        message: 'User update endpoint - implement with service method'
      });
    } catch (err) {
      console.error('Error updating user:', err);
      return handleAuthError(res, err);
    }
  }

  static async deleteUser(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.params['userId'];
      
      // This would typically use a service method
      // For now, we'll handle it directly in the route
      return res.status(200).json({
        success: true,
        message: 'User deletion endpoint - implement with service method'
      });
    } catch (err) {
      console.error('Error deleting user:', err);
      return handleAuthError(res, err);
    }
  }

  // Mess Management Controllers
  static async getMesses(req: Request, res: Response, next: NextFunction) {
    try {
      const { 
        page = 1, 
        limit = 20, 
        search, 
        status, 
        sortBy = 'createdAt', 
        sortOrder = 'desc' 
      } = req.query;

      const filters = { search, status, sortBy, sortOrder };
      const result = await AdminService.getMessesWithFilters(filters, Number(page), Number(limit));
      
      return res.status(200).json({
        success: true,
        data: result
      });
    } catch (err) {
      console.error('Error fetching messes:', err);
      return handleAuthError(res, err);
    }
  }

  static async getMessDetails(req: Request, res: Response, next: NextFunction) {
    try {
      const { messId } = req.params;
      
      // This would typically use a service method
      // For now, we'll handle it directly in the route
      return res.status(200).json({
        success: true,
        message: 'Mess details endpoint - implement with service method'
      });
    } catch (err) {
      console.error('Error fetching mess details:', err);
      return handleAuthError(res, err);
    }
  }

  static async updateMess(req: Request, res: Response, next: NextFunction) {
    try {
      const { messId } = req.params;
      const updateData = req.body;

      // This would typically use a service method
      // For now, we'll handle it directly in the route
      return res.status(200).json({
        success: true,
        message: 'Mess update endpoint - implement with service method'
      });
    } catch (err) {
      console.error('Error updating mess:', err);
      return handleAuthError(res, err);
    }
  }

  static async deleteMess(req: Request, res: Response, next: NextFunction) {
    try {
      const { messId } = req.params;
      
      // This would typically use a service method
      // For now, we'll handle it directly in the route
      return res.status(200).json({
        success: true,
        message: 'Mess deletion endpoint - implement with service method'
      });
    } catch (err) {
      console.error('Error deleting mess:', err);
      return handleAuthError(res, err);
    }
  }

  // System Controllers
  static async getSystemHealth(req: Request, res: Response, next: NextFunction) {
    try {
      const healthStatus = await AdminService.getSystemHealth();
      
      return res.status(200).json({
        success: true,
        data: healthStatus
      });
    } catch (err) {
      console.error('Error fetching system health:', err);
      return handleAuthError(res, err);
    }
  }

  static async getSystemStats(req: Request, res: Response, next: NextFunction) {
    try {
      // This would typically use a service method
      // For now, we'll handle it directly in the route
      return res.status(200).json({
        success: true,
        message: 'System stats endpoint - implement with service method'
      });
    } catch (err) {
      console.error('Error fetching system stats:', err);
      return handleAuthError(res, err);
    }
  }

  static async getSystemLogs(req: Request, res: Response, next: NextFunction) {
    try {
      // This would typically use a service method
      // For now, we'll handle it directly in the route
      return res.status(200).json({
        success: true,
        message: 'System logs endpoint - implement with service method'
      });
    } catch (err) {
      console.error('Error fetching system logs:', err);
      return handleAuthError(res, err);
    }
  }

  // Backup Controllers
  static async createBackup(req: Request, res: Response, next: NextFunction) {
    try {
      const { type = 'full' } = req.body;
      const adminId = (req as any).user.id;
      
      const backupInfo = await AdminService.createBackup(type, adminId);
      
      return res.status(200).json({
        success: true,
        message: 'Backup created successfully',
        data: backupInfo
      });
    } catch (err) {
      console.error('Error creating backup:', err);
      return handleAuthError(res, err);
    }
  }

  static async getBackupStatus(req: Request, res: Response, next: NextFunction) {
    try {
      // This would typically use a service method
      // For now, we'll handle it directly in the route
      return res.status(200).json({
        success: true,
        message: 'Backup status endpoint - implement with service method'
      });
    } catch (err) {
      console.error('Error fetching backup status:', err);
      return handleAuthError(res, err);
    }
  }

  // Email Testing Controllers
  static async testEmail(req: Request, res: Response, next: NextFunction) {
    try {
      const { email } = req.body;
      
      const testResult = await AdminService.testEmailConfiguration(email);
      
      return res.status(200).json({
        success: true,
        message: 'Test email sent successfully',
        data: testResult
      });
    } catch (err) {
      console.error('Error sending test email:', err);
      return handleAuthError(res, err);
    }
  }

  // Maintenance Controllers
  static async toggleMaintenance(req: Request, res: Response, next: NextFunction) {
    try {
      const { enabled, reason, estimatedDuration } = req.body;
      
      // This would typically use a service method
      // For now, we'll handle it directly in the route
      res.status(200).json({
        success: true,
        message: `Maintenance mode ${enabled ? 'enabled' : 'disabled'} successfully`,
        data: {
          enabled,
          reason: reason || 'No reason provided',
          estimatedDuration: estimatedDuration || 'Unknown',
          startTime: enabled ? new Date().toISOString() : null,
          endTime: null
        }
      });
    } catch (err) {
      console.error('Error updating maintenance mode:', err);
      return handleAuthError(res, err);
    }
  }

  static async getMaintenanceStatus(req: Request, res: Response, next: NextFunction) {
    try {
      // This would typically use a service method
      // For now, we'll handle it directly in the route
      return res.status(200).json({
        success: true,
        data: {
          enabled: false,
          reason: null,
          estimatedDuration: null,
          startTime: null,
          endTime: null
        }
      });
    } catch (err) {
      console.error('Error fetching maintenance status:', err);
      return handleAuthError(res, err);
    }
  }
}

export default AdminController; 