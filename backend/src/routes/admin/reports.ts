import { Router, Request, Response, NextFunction } from 'express';
import requireAuth from '../../middleware/requireAuth';
import { handleAuthError } from '../../middleware/errorHandler';
import User from '../../models/User';
import MessProfile from '../../models/MessProfile';
import MessMembership from '../../models/MessMembership';
import PaymentSettings from '../../models/PaymentSettings';

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

// GET /api/admin/reports/users - Generate user report
router.get('/users', requireAuth, requireAdmin, async (req: Request, res: Response, next: NextFunction) => { 
  try {
    const { 
      status, 
      role, 
      verified, 
      startDate, 
      endDate,
      page = 1,
      limit = 50
    } = req.query;

    // Build filter object
    const filter: any = {};
    
    if (status) filter.status = status;
    if (role) filter.role = role;
    if (verified !== undefined) filter.isVerified = verified === 'true';
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate as string);
      if (endDate) filter.createdAt.$lte = new Date(endDate as string);
    }

    // Calculate pagination
    const skip = (Number(page) - 1) * Number(limit);
    
    // Get users with pagination
    const users = await User.find(filter)
      .select('-password -otp -otpExpiry')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    // Get total count for pagination
    const totalUsers = await User.countDocuments(filter);
    const totalPages = Math.ceil(totalUsers / Number(limit));

    // Get summary statistics
    const summary = {
      total: totalUsers,
      verified: await User.countDocuments({ ...filter, isVerified: true }),
      unverified: await User.countDocuments({ ...filter, isVerified: false }),
      admins: await User.countDocuments({ ...filter, role: 'admin' }),
      regular: await User.countDocuments({ ...filter, role: 'user' }),
      suspended: await User.countDocuments({ ...filter, isSuspended: true })
    };

    const report = {
      summary,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: totalUsers,
        totalPages,
        hasNext: Number(page) < totalPages,
        hasPrev: Number(page) > 1
      },
      data: users,
      generatedAt: new Date().toISOString()
    };

    return res.status(200).json({
      success: true,
      data: report
    });
  } catch (err) {
    console.error('Error generating user report:', err);
    return handleAuthError(res, err);
  }
});

// GET /api/admin/reports/messes - Generate mess report
router.get('/messes', requireAuth, requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { 
      status, 
      location,
      startDate, 
      endDate,
      page = 1,
      limit = 50
    } = req.query;

    // Build filter object
    const filter: any = {};
    
    if (status !== undefined) filter.isActive = status === 'true';
    if (location) filter['location.state'] = location;
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate as string);
      if (endDate) filter.createdAt.$lte = new Date(endDate as string);
    }

    // Calculate pagination
    const skip = (Number(page) - 1) * Number(limit);
    
    // Get messes with pagination
    const messes = await MessProfile.find(filter)
      .populate('userId', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    // Get total count for pagination
    const totalMesses = await MessProfile.countDocuments(filter);
    const totalPages = Math.ceil(totalMesses / Number(limit));

    // Get summary statistics
    const summary = {
      total: totalMesses,
      active: await MessProfile.countDocuments({ ...filter, isActive: true }),
      inactive: await MessProfile.countDocuments({ ...filter, isActive: false }),
      withLogo: await MessProfile.countDocuments({ ...filter, logo: { $exists: true, $ne: null } }),
      withoutLogo: await MessProfile.countDocuments({ ...filter, $or: [{ logo: null }, { logo: { $exists: false } }] })
    };

    // Get location distribution
    const locationDistribution = await MessProfile.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$location.state',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    const report = {
      summary,
      locationDistribution,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: totalMesses,
        totalPages,
        hasNext: Number(page) < totalPages,
        hasPrev: Number(page) > 1
      },
      data: messes,
      generatedAt: new Date().toISOString()
    };

    return res.status(200).json({
      success: true,
      data: report
    });
  } catch (err) {
    console.error('Error generating mess report:', err);
    return handleAuthError(res, err);
  }
});

// GET /api/admin/reports/memberships - Generate membership report
router.get('/memberships', requireAuth, requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { 
      status, 
      paymentStatus,
      startDate, 
      endDate,
      page = 1,
      limit = 50
    } = req.query;

    // Build filter object
    const filter: any = {};
    
    if (status) filter.status = status;
    if (paymentStatus) filter.paymentStatus = paymentStatus;
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate as string);
      if (endDate) filter.createdAt.$lte = new Date(endDate as string);
    }

    // Calculate pagination
    const skip = (Number(page) - 1) * Number(limit);
    
    // Get memberships with pagination
    const memberships = await MessMembership.find(filter)
      .populate('userId', 'firstName lastName email')
      .populate('messId', 'name location')
      .populate('mealPlanId', 'name pricing')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    // Get total count for pagination
    const totalMemberships = await MessMembership.countDocuments(filter);
    const totalPages = Math.ceil(totalMemberships / Number(limit));

    // Get summary statistics
    const summary = {
      total: totalMemberships,
      active: await MessMembership.countDocuments({ ...filter, status: 'active' }),
      pendingMemberships: await MessMembership.countDocuments({ ...filter, status: 'pending' }),
      inactive: await MessMembership.countDocuments({ ...filter, status: 'inactive' }),
      paid: await MessMembership.countDocuments({ ...filter, paymentStatus: 'paid' }),
      pendingPayments: await MessMembership.countDocuments({ ...filter, paymentStatus: 'pending' }),
      overdue: await MessMembership.countDocuments({ ...filter, paymentStatus: 'overdue' })
    };

    // Get status distribution
    const statusDistribution = await MessMembership.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get payment status distribution
    const paymentStatusDistribution = await MessMembership.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$paymentStatus',
          count: { $sum: 1 }
        }
      }
    ]);

    const report = {
      summary,
      statusDistribution,
      paymentStatusDistribution,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: totalMemberships,
        totalPages,
        hasNext: Number(page) < totalPages,
        hasPrev: Number(page) > 1
      },
      data: memberships,
      generatedAt: new Date().toISOString()
    };

    return res.status(200).json({
      success: true,
      data: report
    });
  } catch (err) {
    console.error('Error generating membership report:', err);
    return handleAuthError(res, err);
  }
});

// GET /api/admin/reports/financial - Generate financial report
router.get('/financial', requireAuth, requireAdmin, async (req: Request, res: Response, next: NextFunction) => {    const userId = (req as any).user.id;
    try {
    const { 
      startDate, 
      endDate,
      messId,
      userId
    } = req.query;

    // Build filter object
    const filter: any = {};
    
    if (messId) filter.messId = messId;
    if (userId) filter.userId = userId;
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate as string);
      if (endDate) filter.createdAt.$lte = new Date(endDate as string);
    }

    // Get payment data
    const payments = await PaymentSettings.find(filter)
      .populate('userId', 'firstName lastName email')
      .populate('messId', 'name')
      .sort({ createdAt: -1 });

    // Calculate financial summary
    const totalPayments = payments.length;
    const totalAmount = payments.reduce((sum, payment) => sum + ((payment as any).amount || 0), 0);
    const successfulPayments = payments.filter(p => (p as any).status === 'completed').length;
    const failedPayments = payments.filter(p => (p as any).status === 'failed').length;
    const pendingPayments = payments.filter(p => (p as any).status === 'pending').length;

    // Get payment status distribution
    const paymentStatusDistribution = await PaymentSettings.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' }
        }
      }
    ]);

    // Get monthly payment trends
    const monthlyTrends = await PaymentSettings.aggregate([
      { $match: filter },
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m',
              date: '$createdAt'
            }
          },
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const report = {
      summary: {
        totalPayments,
        totalAmount,
        successfulPayments,
        failedPayments,
        pendingPayments,
        successRate: totalPayments > 0 ? Math.round((successfulPayments / totalPayments) * 100) : 0
      },
      paymentStatusDistribution,
      monthlyTrends,
      data: payments,
      generatedAt: new Date().toISOString()
    };

    return res.status(200).json({
      success: true,
      data: report
    });
  } catch (err) {
    console.error('Error generating financial report:', err);
    return handleAuthError(res, err);
  }
});

// GET /api/admin/reports/export/:type - Export report data
router.get('/export/:type', requireAuth, requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { type } = req.params;
    const { format = 'json' } = req.query;

    let data;
    let filename;

    switch (type) {
      case 'users':
        data = await User.find().select('-password -otp -otpExpiry').sort({ createdAt: -1 });
        filename = `users-report-${new Date().toISOString().split('T')[0]}`;
        break;
        
      case 'messes':
        data = await MessProfile.find()
          .populate('userId', 'firstName lastName email')
          .sort({ createdAt: -1 });
        filename = `messes-report-${new Date().toISOString().split('T')[0]}`;
        break;
        
      case 'memberships':
        data = await MessMembership.find()
          .populate('userId', 'firstName lastName email')
          .populate('messId', 'name location')
          .populate('mealPlanId', 'name pricing')
          .sort({ createdAt: -1 });
        filename = `memberships-report-${new Date().toISOString().split('T')[0]}`;
        break;
        
      case 'financial':
        data = await PaymentSettings.find()
          .populate('userId', 'firstName lastName email')
          .populate('messId', 'name')
          .sort({ createdAt: -1 });
        filename = `financial-report-${new Date().toISOString().split('T')[0]}`;
        break;
        
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid report type. Supported types: users, messes, memberships, financial'
        });
    }

    if (format === 'csv') {
      // Convert to CSV format
      const csvData = convertToCSV(data);
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}.csv"`);
      return res.send(csvData);
    } else {
      // Return JSON format
      return res.status(200).json({
        success: true,
        data: {
          type,
          filename: `${filename}.json`,
          recordCount: data.length,
          generatedAt: new Date().toISOString(),
          data
        }
      });
    }
  } catch (err) {
    console.error('Error exporting report:', err);
    return handleAuthError(res, err);
  }
});

// Helper function to convert data to CSV format
function convertToCSV(data: any[]): string {
  if (data.length === 0) return '';
  
  // Get headers from first object
  const headers = Object.keys(data[0]);
  
  // Convert nested objects to string representation
  const csvRows = data.map(row => {
    return headers.map(header => {
      const value = row[header];
      if (value === null || value === undefined) return '';
      if (typeof value === 'object') return JSON.stringify(value);
      return String(value);
    }).join(',');
  });
  
  return [headers.join(','), ...csvRows].join('\n');
}

export default router; 