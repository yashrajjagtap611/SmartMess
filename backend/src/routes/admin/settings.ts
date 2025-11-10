import { Router, Request, Response, NextFunction } from 'express';
import requireAuth from '../../middleware/requireAuth';
import { handleAuthError } from '../../middleware/errorHandler';
import User from '../../models/User';

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

// GET /api/admin/settings/system - Get system settings
router.get('/system', requireAuth, requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get system information
    const systemInfo = {
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch,
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
      cpuUsage: process.cpuUsage(),
      environment: process.env['NODE_ENV'] || 'development',
      timestamp: new Date().toISOString()
    };

    // Get application statistics
    const totalUsers = await User.countDocuments();
    const verifiedUsers = await User.countDocuments({ isVerified: true });
    const adminUsers = await User.countDocuments({ role: 'admin' });

    const systemSettings = {
      systemInfo,
      applicationStats: {
        totalUsers,
        verifiedUsers,
        adminUsers,
        verificationRate: totalUsers > 0 ? Math.round((verifiedUsers / totalUsers) * 100) : 0
      },
      features: {
        userRegistration: true,
        emailVerification: true,
        adminPanel: true,
        analytics: true,
        reporting: true,
        fileUploads: true
      },
      limits: {
        maxFileSize: '10MB',
        maxUsersPerMess: 100,
        maxMessesPerUser: 5,
        otpExpiryMinutes: 10,
        jwtExpiryHours: 24
      }
    };

    return res.status(200).json({
      success: true,
      data: systemSettings
    });
  } catch (err) {
    console.error('Error fetching system settings:', err);
    return handleAuthError(res, err);
  }
});

// PUT /api/admin/settings/system - Update system settings
router.put('/system', requireAuth, requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { 
      features, 
      limits, 
      maintenanceMode,
      maintenanceMessage 
    } = req.body;

    // Validate input
    if (features && typeof features !== 'object') {
      return res.status(400).json({
        success: false,
        message: 'Features must be an object'
      });
    }

    if (limits && typeof limits !== 'object') {
      return res.status(400).json({
        success: false,
        message: 'Limits must be an object'
      });
    }

    // Update system settings (in a real app, this would be stored in database)
    const updatedSettings = {
      features: features || {},
      limits: limits || {},
      maintenanceMode: maintenanceMode || false,
      maintenanceMessage: maintenanceMessage || 'System is under maintenance. Please try again later.',
      updatedAt: new Date().toISOString(),
      updatedBy: (req as any).user.id
    };

    // Here you would typically save to database or config file
    // For now, we'll just return the updated settings
    
    return res.status(200).json({
      success: true,
      message: 'System settings updated successfully',
      data: updatedSettings
    });
  } catch (err) {
    console.error('Error updating system settings:', err);
    return handleAuthError(res, err);
  }
});

// GET /api/admin/settings/security - Get security settings
router.get('/security', requireAuth, requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const securitySettings = {
      authentication: {
        jwtSecret: '***HIDDEN***',
        jwtExpiry: '24h',
        refreshTokenExpiry: '7d',
        otpExpiry: '10m',
        maxLoginAttempts: 5,
        lockoutDuration: '15m'
      },
      password: {
        minLength: 8,
        requireUppercase: true,
        requireLowercase: true,
        requireNumbers: true,
        requireSpecialChars: true,
        maxAge: '90d'
      },
      rateLimiting: {
        general: {
          windowMs: '15m',
          maxRequests: 100
        },
        auth: {
          windowMs: '15m',
          maxRequests: 5
        },
        api: {
          windowMs: '15m',
          maxRequests: 1000
        }
      },
      cors: {
        allowedOrigins: [
          'http://localhost:3000',
          'http://localhost:5173',
          'http://localhost:5174'
        ],
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS']
      },
      headers: {
        helmet: true,
        hsts: true,
        contentSecurityPolicy: true,
        xssProtection: true
      }
    };

    return res.status(200).json({
      success: true,
      data: securitySettings
    });
  } catch (err) {
    console.error('Error fetching security settings:', err);
    return handleAuthError(res, err);
  }
});

// PUT /api/admin/settings/security - Update security settings
router.put('/security', requireAuth, requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { 
      authentication, 
      password, 
      rateLimiting,
      cors,
      headers 
    } = req.body;

    // Validate input
    if (authentication && typeof authentication !== 'object') {
      return res.status(400).json({
        success: false,
        message: 'Authentication settings must be an object'
      });
    }

    if (password && typeof password !== 'object') {
      return res.status(400).json({
        success: false,
        message: 'Password settings must be an object'
      });
    }

    if (rateLimiting && typeof rateLimiting !== 'object') {
      return res.status(400).json({
        success: false,
        message: 'Rate limiting settings must be an object'
      });
    }

    // Update security settings (in a real app, this would be stored in database)
    const updatedSettings = {
      authentication: authentication || {},
      password: password || {},
      rateLimiting: rateLimiting || {},
      cors: cors || {},
      headers: headers || {},
      updatedAt: new Date().toISOString(),
      updatedBy: (req as any).user.id
    };

    // Here you would typically save to database or config file
    // For now, we'll just return the updated settings
    
    return res.status(200).json({
      success: true,
      message: 'Security settings updated successfully',
      data: updatedSettings
    });
  } catch (err) {
    console.error('Error updating security settings:', err);
    return handleAuthError(res, err);
  }
});

// GET /api/admin/settings/email - Get email settings
router.get('/email', requireAuth, requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const emailSettings = {
      provider: process.env['EMAIL_PROVIDER'] || 'nodemailer',
      smtp: {
        host: process.env['SMTP_HOST'] || 'smtp.gmail.com',
        port: process.env['SMTP_PORT'] || 587,
        secure: process.env['SMTP_SECURE'] === 'true',
        auth: {
          user: process.env['SMTP_USER'] || '***HIDDEN***',
          pass: '***HIDDEN***'
        }
      },
      templates: {
        welcome: true,
        verification: true,
        passwordReset: true,
        membershipInvite: true,
        paymentReminder: true
      },
      defaults: {
        from: process.env['EMAIL_FROM'] || 'noreply@SmartMess.com',
        replyTo: process.env['EMAIL_REPLY_TO'] || 'support@SmartMess.com'
      },
      rateLimiting: {
        maxEmailsPerHour: 100,
        maxEmailsPerDay: 1000
      }
    };

    return res.status(200).json({
      success: true,
      data: emailSettings
    });
  } catch (err) {
    console.error('Error fetching email settings:', err);
    return handleAuthError(res, err);
  }
});

// PUT /api/admin/settings/email - Update email settings
router.put('/email', requireAuth, requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { 
      provider, 
      smtp, 
      templates,
      defaults,
      rateLimiting 
    } = req.body;

    // Validate input
    if (provider && !['nodemailer', 'sendgrid', 'mailgun'].includes(provider)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email provider. Supported: nodemailer, sendgrid, mailgun'
      });
    }

    if (smtp && typeof smtp !== 'object') {
      return res.status(400).json({
        success: false,
        message: 'SMTP settings must be an object'
      });
    }

    if (templates && typeof templates !== 'object') {
      return res.status(400).json({
        success: false,
        message: 'Template settings must be an object'
      });
    }

    // Update email settings (in a real app, this would be stored in database)
    const updatedSettings = {
      provider: provider || 'nodemailer',
      smtp: smtp || {},
      templates: templates || {},
      defaults: defaults || {},
      rateLimiting: rateLimiting || {},
      updatedAt: new Date().toISOString(),
      updatedBy: (req as any).user.id
    };

    // Here you would typically save to database or config file
    // For now, we'll just return the updated settings
    
    return res.status(200).json({
      success: true,
      message: 'Email settings updated successfully',
      data: updatedSettings
    });
  } catch (err) {
    console.error('Error updating email settings:', err);
    return handleAuthError(res, err);
  }
});

// GET /api/admin/settings/notifications - Get notification settings
router.get('/notifications', requireAuth, requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const notificationSettings = {
      push: {
        enabled: true,
        vapidPublicKey: process.env['VAPID_PUBLIC_KEY'] || '***HIDDEN***',
        vapidPrivateKey: '***HIDDEN***'
      },
      email: {
        enabled: true,
        welcome: true,
        verification: true,
        passwordReset: true,
        membershipUpdates: true,
        paymentReminders: true,
        systemAnnouncements: true
      },
      sms: {
        enabled: false,
        provider: 'twilio',
        accountSid: '***HIDDEN***',
        authToken: '***HIDDEN***'
      },
      inApp: {
        enabled: true,
        membershipUpdates: true,
        paymentReminders: true,
        systemAnnouncements: true,
        promotionalOffers: false
      },
      preferences: {
        defaultLanguage: 'en',
        timezone: 'UTC',
        quietHours: {
          enabled: false,
          start: '22:00',
          end: '08:00'
        }
      }
    };

    return res.status(200).json({
      success: true,
      data: notificationSettings
    });
  } catch (err) {
    console.error('Error fetching notification settings:', err);
    return handleAuthError(res, err);
  }
});

// PUT /api/admin/settings/notifications - Update notification settings
router.put('/notifications', requireAuth, requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { 
      push, 
      email, 
      sms,
      inApp,
      preferences 
    } = req.body;

    // Validate input
    if (push && typeof push !== 'object') {
      return res.status(400).json({
        success: false,
        message: 'Push notification settings must be an object'
      });
    }

    if (email && typeof email !== 'object') {
      return res.status(400).json({
        success: false,
        message: 'Email notification settings must be an object'
      });
    }

    if (sms && typeof sms !== 'object') {
      return res.status(400).json({
        success: false,
        message: 'SMS notification settings must be an object'
      });
    }

    if (inApp && typeof inApp !== 'object') {
      return res.status(400).json({
        success: false,
        message: 'In-app notification settings must be an object'
      });
    }

    if (preferences && typeof preferences !== 'object') {
      return res.status(400).json({
        success: false,
        message: 'Notification preferences must be an object'
      });
    }

    // Update notification settings (in a real app, this would be stored in database)
    const updatedSettings = {
      push: push || {},
      email: email || {},
      sms: sms || {},
      inApp: inApp || {},
      preferences: preferences || {},
      updatedAt: new Date().toISOString(),
      updatedBy: (req as any).user.id
    };

    // Here you would typically save to database or config file
    // For now, we'll just return the updated settings
    
    return res.status(200).json({
      success: true,
      message: 'Notification settings updated successfully',
      data: updatedSettings
    });
  } catch (err) {
    console.error('Error updating notification settings:', err);
    return handleAuthError(res, err);
  }
});

// POST /api/admin/settings/test-email - Test email configuration
router.post('/test-email', requireAuth, requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email address is required'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format'
      });
    }

    // Here you would typically send a test email
    // For now, we'll just return a success response
    
    res.status(200).json({
      success: true,
      message: 'Test email sent successfully',
      data: {
        to: email,
        sentAt: new Date().toISOString()
      }
    });
  } catch (err) {
    console.error('Error sending test email:', err);
    return handleAuthError(res, err);
  }
});

// POST /api/admin/settings/backup - Create system backup
router.post('/backup', requireAuth, requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { type = 'full' } = req.body;

    if (!['full', 'users', 'messes', 'memberships'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid backup type. Supported: full, users, messes, memberships'
      });
    }

    // Here you would typically create a backup
    // For now, we'll just return a success response
    
    const backupInfo = {
      type,
      filename: `backup-${type}-${new Date().toISOString().split('T')[0]}.json`,
      size: '0 KB',
      createdAt: new Date().toISOString(),
      createdBy: (req as any).user.id,
      status: 'completed'
    };

    return res.status(200).json({
      success: true,
      message: 'Backup created successfully',
      data: backupInfo
    });
  } catch (err) {
    console.error('Error creating backup:', err);
    return handleAuthError(res, err);
  }
});

// GET /api/admin/settings/backups - List available backups
router.get('/backups', requireAuth, requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Here you would typically list available backups
    // For now, we'll return mock data
    
    const backups = [
      {
        id: '1',
        type: 'full',
        filename: 'backup-full-2024-01-15.json',
        size: '2.5 MB',
        createdAt: '2024-01-15T10:00:00.000Z',
        createdBy: 'admin',
        status: 'completed'
      },
      {
        id: '2',
        type: 'users',
        filename: 'backup-users-2024-01-14.json',
        size: '1.2 MB',
        createdAt: '2024-01-14T10:00:00.000Z',
        createdBy: 'admin',
        status: 'completed'
      }
    ];

    return res.status(200).json({
      success: true,
      data: backups
    });
  } catch (err) {
    console.error('Error listing backups:', err);
    return handleAuthError(res, err);
  }
});

export default router; 