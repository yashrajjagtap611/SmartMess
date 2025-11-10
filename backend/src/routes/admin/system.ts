import express from 'express';
import { Request, Response, NextFunction } from 'express';
import requireAuth from '../../middleware/requireAuth';
import { handleAuthError } from '../../middleware/errorHandler';
import User from '../../models/User';
import mongoose from 'mongoose';

const router: express.Router = express.Router();

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
    
    next();
  } catch (err) {
    return handleAuthError(res, err);
  }
};

// GET /api/admin/system/health - Get system health status
router.get('/health', requireAuth, requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const startTime = Date.now();

    // Database health check
    const dbStartTime = Date.now();
    await mongoose.connection.db.admin().ping();
    const dbResponseTime = Date.now() - dbStartTime;
    const dbConnections = mongoose.connections.length;
    const dbUptime = process.uptime();

    // API Server metrics
    const memoryUsage = process.memoryUsage();
    const memoryUsagePercent = Math.round((memoryUsage.heapUsed / memoryUsage.heapTotal) * 100);
    const cpuUsage = Math.round(Math.random() * 20 + 10); // Simulated CPU usage
    const apiUptime = process.uptime();

    // File storage health (simulated - would integrate with actual storage service)
    const totalSpace = 100 * 1024 * 1024 * 1024; // 100GB
    const usedSpace = Math.floor(totalSpace * 0.35); // 35% used
    const storageResponseTime = Math.floor(Math.random() * 50) + 10;

    // Email service health (simulated)
    const emailQueueSize = Math.floor(Math.random() * 10);
    const emailsSentToday = Math.floor(Math.random() * 100) + 50;
    const emailsFailedToday = Math.floor(Math.random() * 5);

    // Determine health status based on metrics
    const getDatabaseStatus = () => {
      if (dbResponseTime > 1000) return 'critical';
      if (dbResponseTime > 500) return 'warning';
      return 'healthy';
    };

    const getApiServerStatus = () => {
      if (cpuUsage > 80 || memoryUsagePercent > 85) return 'critical';
      if (cpuUsage > 60 || memoryUsagePercent > 70) return 'warning';
      return 'healthy';
    };

    const getFileStorageStatus = () => {
      const usagePercent = (usedSpace / totalSpace) * 100;
      if (usagePercent > 90 || storageResponseTime > 2000) return 'critical';
      if (usagePercent > 75 || storageResponseTime > 1000) return 'warning';
      return 'healthy';
    };

    const getEmailServiceStatus = () => {
      if (emailQueueSize > 50 || emailsFailedToday > 20) return 'critical';
      if (emailQueueSize > 20 || emailsFailedToday > 10) return 'warning';
      return 'healthy';
    };

    const formatUptime = (seconds: number) => {
      const days = Math.floor(seconds / 86400);
      const hours = Math.floor((seconds % 86400) / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      
      if (days > 0) return `${days}d ${hours}h ${minutes}m`;
      if (hours > 0) return `${hours}h ${minutes}m`;
      return `${minutes}m`;
    };

    const healthData = {
      database: {
        status: getDatabaseStatus(),
        responseTime: dbResponseTime,
        connections: dbConnections,
        uptime: formatUptime(dbUptime)
      },
      apiServer: {
        status: getApiServerStatus(),
        responseTime: Date.now() - startTime,
        memoryUsage: memoryUsagePercent,
        cpuUsage,
        uptime: formatUptime(apiUptime)
      },
      fileStorage: {
        status: getFileStorageStatus(),
        usedSpace,
        totalSpace,
        responseTime: storageResponseTime
      },
      emailService: {
        status: getEmailServiceStatus(),
        queueSize: emailQueueSize,
        sentToday: emailsSentToday,
        failedToday: emailsFailedToday
      },
      timestamp: new Date().toISOString()
    };

    return res.status(200).json({
      success: true,
      data: healthData
    });
  } catch (err) {
    console.error('Error fetching system health:', err);
    return handleAuthError(res, err);
  }
});

// GET /api/admin/system/performance - Get performance metrics history
router.get('/performance', requireAuth, requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { period = '1h' } = req.query;
    
    // Generate simulated performance history
    const now = Date.now();
    const intervals = period === '1h' ? 60 : period === '6h' ? 360 : 1440; // minutes
    const dataPoints = Math.min(intervals / 5, 50); // Max 50 data points
    
    const performanceHistory = Array.from({ length: dataPoints }, (_, i) => {
      const timestamp = new Date(now - (dataPoints - i - 1) * 5 * 60 * 1000); // 5-minute intervals
      
      return {
        timestamp: timestamp.toISOString(),
        cpu: Math.floor(Math.random() * 30) + 15, // 15-45%
        memory: Math.floor(Math.random() * 25) + 35, // 35-60%
        responseTime: Math.floor(Math.random() * 100) + 50, // 50-150ms
        activeConnections: Math.floor(Math.random() * 50) + 20 // 20-70 connections
      };
    });

    return res.status(200).json({
      success: true,
      data: performanceHistory
    });
  } catch (err) {
    console.error('Error fetching performance metrics:', err);
    return handleAuthError(res, err);
  }
});

// GET /api/admin/system/logs - Get system logs
router.get('/logs', requireAuth, requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { level = 'all', limit = 100 } = req.query;
    
    // Simulated log entries
    const logLevels = ['info', 'warning', 'error'];
    const logMessages = [
      'User authentication successful',
      'Database connection established',
      'Email sent successfully',
      'File upload completed',
      'Payment processed',
      'System backup completed',
      'Cache cleared',
      'API rate limit exceeded',
      'Database query timeout',
      'Email delivery failed'
    ];

    const logs = Array.from({ length: Number(limit) }, (_, i) => {
      const logLevel = logLevels[Math.floor(Math.random() * logLevels.length)];
      const message = logMessages[Math.floor(Math.random() * logMessages.length)];
      
      return {
        id: `log_${Date.now()}_${i}`,
        level: logLevel,
        message,
        timestamp: new Date(Date.now() - i * 60000).toISOString(), // 1 minute intervals
        source: 'api-server'
      };
    }).filter(log => level === 'all' || log.level === level);

    return res.status(200).json({
      success: true,
      data: logs
    });
  } catch (err) {
    console.error('Error fetching system logs:', err);
    return handleAuthError(res, err);
  }
});

// POST /api/admin/system/restart - Restart system services (simulated)
router.post('/restart', requireAuth, requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { service } = req.body;
    
    if (!service || !['api', 'database', 'email', 'storage'].includes(service)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid service specified'
      });
    }

    // Simulate service restart
    await new Promise(resolve => setTimeout(resolve, 2000));

    res.status(200).json({
      success: true,
      message: `${service} service restart initiated`,
      data: {
        service,
        restartTime: new Date().toISOString(),
        estimatedDowntime: '30 seconds'
      }
    });
  } catch (err) {
    console.error('Error restarting service:', err);
    return handleAuthError(res, err);
  }
});

// GET /api/admin/system/backup - Get backup status
router.get('/backup', requireAuth, requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Simulated backup information
    const backupData = {
      lastBackup: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      nextScheduledBackup: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      backupSize: '2.5GB',
      status: 'completed',
      retentionDays: 30,
      backupLocation: 'cloud-storage',
      autoBackupEnabled: true
    };

    return res.status(200).json({
      success: true,
      data: backupData
    });
  } catch (err) {
    console.error('Error fetching backup status:', err);
    return handleAuthError(res, err);
  }
});

// POST /api/admin/system/backup - Create manual backup
router.post('/backup', requireAuth, requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Simulate backup creation
    await new Promise(resolve => setTimeout(resolve, 3000));

    const backupData = {
      backupId: `backup_${Date.now()}`,
      startTime: new Date().toISOString(),
      status: 'in_progress',
      estimatedDuration: '5 minutes'
    };

    return res.status(200).json({
      success: true,
      message: 'Manual backup initiated',
      data: backupData
    });
  } catch (err) {
    console.error('Error creating backup:', err);
    return handleAuthError(res, err);
  }
});

export default router;
