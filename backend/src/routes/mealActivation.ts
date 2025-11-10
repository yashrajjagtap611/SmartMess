import { Router, Request, Response, NextFunction } from 'express';
import requireAuth from '../middleware/requireAuth';
import { handleAuthError } from '../middleware/errorHandler';
import qrCodeService from '../services/qrCodeService';
import MealActivation from '../models/MealActivation';
import MessProfile from '../models/MessProfile';
import Meal from '../models/Meal';
import MessMembership from '../models/MessMembership';

const router: Router = Router();

// POST /api/meal-activation/generate - Generate QR code for meal activation
router.post('/generate', requireAuth, async (req: Request, res: Response, _next: NextFunction) => {
  try {
    const userId = (req as any).user.id;
    const { mealId, mealType, date } = req.body;

    if (!mealId || !mealType) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: mealId, mealType'
      });
    }

    // Get meal details
    const meal = await Meal.findById(mealId);
    if (!meal) {
      return res.status(404).json({
        success: false,
        message: 'Meal not found'
      });
    }

    // Find user's active subscription for this meal
    const subscription = await MessMembership.findOne({
      userId,
      messId: meal.messId,
      status: 'active',
      mealPlanId: { $in: meal.associatedMealPlans }
    });

    if (!subscription) {
      return res.status(403).json({
        success: false,
        message: 'No active subscription found for this meal'
      });
    }

    // Generate QR code
    const result = await qrCodeService.generateMealQRCode({
      userId,
      messId: meal.messId,
      mealId,
      mealPlanId: subscription.mealPlanId.toString(),
      mealType,
      date: date ? new Date(date) : new Date()
    });

    return res.status(200).json({
      success: true,
      message: 'QR code generated successfully',
      data: result
    });

  } catch (error: any) {
    console.error('Error generating QR code:', error);
    return res.status(400).json({
      success: false,
      message: error.message || 'Failed to generate QR code'
    });
  }
});

// POST /api/meal-activation/scan - Scan and activate QR code (for mess owners)
router.post('/scan', requireAuth, async (req: Request, res: Response, _next: NextFunction) => {
  try {
    const scannerId = (req as any).user.id;
    const { qrCodeData } = req.body;

    if (!qrCodeData) {
      return res.status(400).json({
        success: false,
        message: 'QR code data is required'
      });
    }

    // Verify scanner is a mess owner
    const messProfile = await MessProfile.findOne({ userId: scannerId });
    if (!messProfile) {
      return res.status(403).json({
        success: false,
        message: 'Only mess owners can scan QR codes'
      });
    }

    // Activate QR code
    const result = await qrCodeService.activateQRCode(qrCodeData, scannerId, 'mess_owner');

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.message
      });
    }

    return res.status(200).json({
      success: true,
      message: result.message,
      data: {
        activation: result.activation,
        mealInfo: result.mealInfo
      }
    });

  } catch (error: any) {
    console.error('Error scanning QR code:', error);
    return handleAuthError(res, error);
  }
});

// POST /api/meal-activation/user-scan - User self-scan for meal activation
router.post('/user-scan', requireAuth, async (req: Request, res: Response, _next: NextFunction) => {
  try {
    const userId = (req as any).user.id;
    const { qrCodeData } = req.body;

    if (!qrCodeData) {
      return res.status(400).json({
        success: false,
        message: 'QR code data is required'
      });
    }

    // Activate QR code (user self-scan)
    const result = await qrCodeService.activateQRCode(qrCodeData, userId, 'user');

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.message
      });
    }

    return res.status(200).json({
      success: true,
      message: result.message,
      data: {
        activation: result.activation,
        mealInfo: result.mealInfo
      }
    });

  } catch (error: any) {
    console.error('Error in user scan:', error);
    return handleAuthError(res, error);
  }
});

// GET /api/meal-activation/history - Get user's meal activation history
router.get('/history', requireAuth, async (req: Request, res: Response, _next: NextFunction) => {
  try {
    const userId = (req as any).user.id;
    const { limit = 50 } = req.query;

    const history = await qrCodeService.getUserMealHistory(userId, parseInt(limit as string));

    return res.status(200).json({
      success: true,
      message: 'Meal history retrieved successfully',
      data: history
    });

  } catch (error: any) {
    console.error('Error fetching meal history:', error);
    return handleAuthError(res, error);
  }
});

// GET /api/meal-activation/active - Get user's active meals for today
router.get('/active', requireAuth, async (req: Request, res: Response, _next: NextFunction) => {
  try {
    const userId = (req as any).user.id;
    const { date } = req.query;

    const targetDate = date ? new Date(date as string) : new Date();
    const activeMeals = await qrCodeService.getUserActiveMeals(userId, targetDate);

    return res.status(200).json({
      success: true,
      message: 'Active meals retrieved successfully',
      data: activeMeals
    });

  } catch (error: any) {
    console.error('Error fetching active meals:', error);
    return handleAuthError(res, error);
  }
});

// GET /api/meal-activation/stats - Get meal activation statistics (for mess owners)
router.get('/stats', requireAuth, async (req: Request, res: Response, _next: NextFunction) => {
  try {
    const userId = (req as any).user.id;
    const { date, mealType } = req.query;

    // Verify user is a mess owner
    const messProfile = await MessProfile.findOne({ userId });
    if (!messProfile) {
      return res.status(403).json({
        success: false,
        message: 'Only mess owners can view activation statistics'
      });
    }

    const targetDate = date ? new Date(date as string) : new Date();
    const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));

    const filter: any = {
      messId: messProfile._id.toString(),
      activationDate: { $gte: startOfDay, $lte: endOfDay }
    };

    if (mealType) {
      filter.mealType = mealType;
    }

    // Get activation statistics
    const totalGenerated = await MealActivation.countDocuments({
      ...filter,
      status: { $in: ['generated', 'activated', 'expired'] }
    });

    const totalActivated = await MealActivation.countDocuments({
      ...filter,
      status: 'activated'
    });

    const totalExpired = await MealActivation.countDocuments({
      ...filter,
      status: 'expired'
    });

    const pending = await MealActivation.countDocuments({
      ...filter,
      status: 'generated'
    });

    // Get breakdown by meal type
    const mealTypeStats = await MealActivation.aggregate([
      { $match: filter },
      {
        $group: {
          _id: {
            mealType: '$mealType',
            status: '$status'
          },
          count: { $sum: 1 }
        }
      }
    ]);

    return res.status(200).json({
      success: true,
      message: 'Activation statistics retrieved successfully',
      data: {
        summary: {
          totalGenerated,
          totalActivated,
          totalExpired,
          pending,
          activationRate: totalGenerated > 0 ? (totalActivated / totalGenerated * 100).toFixed(2) : 0
        },
        mealTypeBreakdown: mealTypeStats
      }
    });

  } catch (error: any) {
    console.error('Error fetching activation stats:', error);
    return handleAuthError(res, error);
  }
});

// GET /api/meal-activation/today-meals - Get today's available meals for QR generation
router.get('/today-meals', requireAuth, async (req: Request, res: Response, _next: NextFunction) => {
  try {
    const userId = (req as any).user.id;
    const { date } = req.query;

    const targetDate = date ? new Date(date as string) : new Date();
    const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));

    // Get user's active subscriptions
    const subscriptions = await MessMembership.find({
      userId,
      status: 'active'
    }).populate([
      { path: 'mealPlanId', select: 'name' },
      { path: 'messId', select: 'name' }
    ]);

    if (!subscriptions.length) {
      return res.status(200).json({
        success: true,
        message: 'No active subscriptions found',
        data: []
      });
    }

    // Get available meals for today
    const messIds = subscriptions.map(sub => (sub.messId as any)._id.toString());
    const mealPlanIds = subscriptions.map(sub => (sub.mealPlanId as any)._id.toString());

    const meals = await Meal.find({
      messId: { $in: messIds },
      date: { $gte: startOfDay, $lte: endOfDay },
      isAvailable: true,
      associatedMealPlans: { $in: mealPlanIds }
    }).populate([
      { path: 'messId', model: 'MessProfile', select: 'name' }
    ]);

    // Check which meals already have QR codes generated
    const existingActivations = await MealActivation.find({
      userId,
      activationDate: { $gte: startOfDay, $lte: endOfDay },
      status: { $in: ['generated', 'activated'] }
    });

    const activatedMealIds = new Set(existingActivations.map(a => a.mealId));

    const availableMeals = meals.map(meal => ({
      id: meal._id,
      name: meal.name,
      description: meal.description,
      type: meal.type,
      category: meal.category,
      categories: meal.categories,
      imageUrl: meal.imageUrl,
      messName: (meal.messId as any).name,
      hasQRCode: activatedMealIds.has(meal._id.toString()),
      canGenerate: !activatedMealIds.has(meal._id.toString())
    }));

    return res.status(200).json({
      success: true,
      message: 'Available meals retrieved successfully',
      data: availableMeals
    });

  } catch (error: any) {
    console.error('Error fetching today\'s meals:', error);
    return handleAuthError(res, error);
  }
});

export default router;
