import { Router, Request, Response, NextFunction } from 'express';
import requireAuth from '../../middleware/requireAuth';
import { handleAuthError } from '../../middleware/errorHandler';
import User from '../../models/User';
import DefaultMealPlan from '../../models/DefaultMealPlan';
import MealPlan from '../../models/MealPlan';
import MessProfile from '../../models/MessProfile';

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
  } catch (err: any) {
    return handleAuthError(res, err);
  }
};

// GET /api/admin/default-meal-plans - Get all default meal plans
router.get('/', requireAuth, requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const defaultMealPlans = await DefaultMealPlan.find()
      .populate('createdBy', 'firstName lastName email')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: 'Default meal plans retrieved successfully',
      data: defaultMealPlans
    });
  } catch (err: any) {
    return handleAuthError(res, err);
  }
});

// GET /api/admin/default-meal-plans/:id - Get specific default meal plan
router.get('/:id', requireAuth, requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const defaultMealPlan = await DefaultMealPlan.findById(id)
      .populate('createdBy', 'firstName lastName email');

    if (!defaultMealPlan) {
      return res.status(404).json({
        success: false,
        message: 'Default meal plan not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Default meal plan retrieved successfully',
      data: defaultMealPlan
    });
  } catch (err: any) {
    return handleAuthError(res, err);
  }
});

// POST /api/admin/default-meal-plans - Create new default meal plan
router.post('/', requireAuth, requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
        const mealPlanData = req.body;
        const userId = (req as any).user.id;

    // Validate required fields
    if (!mealPlanData.name || !mealPlanData.pricing || !mealPlanData.mealType || !mealPlanData.description) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: name, pricing, mealType, description'
      });
    }

    const newDefaultMealPlan = new DefaultMealPlan({
      ...mealPlanData,
      createdBy: userId,
      isDefault: true
    });

    const savedMealPlan = await newDefaultMealPlan.save();
    const populatedMealPlan = await DefaultMealPlan.findById(savedMealPlan._id)
      .populate('createdBy', 'firstName lastName email');

    return res.status(201).json({
      success: true,
      message: 'Default meal plan created successfully',
      data: populatedMealPlan
    });
  } catch (err: any) {
    return handleAuthError(res, err);
  }
});

// PUT /api/admin/default-meal-plans/:id - Update default meal plan
router.put('/:id', requireAuth, requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const updatedMealPlan = await DefaultMealPlan.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('createdBy', 'firstName lastName email');

    if (!updatedMealPlan) {
      return res.status(404).json({
        success: false,
        message: 'Default meal plan not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Default meal plan updated successfully',
      data: updatedMealPlan
    });
  } catch (err: any) {
    return handleAuthError(res, err);
  }
});

// POST /api/admin/default-meal-plans/generate/:messId - Generate meal plans for specific mess
router.post('/generate/:messId', requireAuth, requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { messId } = req.params;

    // Check if mess profile exists
    const messProfile = await MessProfile.findById(messId);
    if (!messProfile) {
      return res.status(404).json({
        success: false,
        message: 'Mess profile not found'
      });
    }

    // Get all active default meal plans
    const defaultMealPlans = await DefaultMealPlan.find({ isActive: true });

    if (defaultMealPlans.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No active default meal plans found'
      });
    }

    // Generate meal plans for this mess
    const generatedMealPlans = [];
    for (const defaultPlan of defaultMealPlans) {
      const newMealPlan = new MealPlan({
        messId: messId,
        name: defaultPlan.name,
        pricing: defaultPlan.pricing,
        mealType: defaultPlan.mealType,
        mealsPerDay: defaultPlan.mealsPerDay,
        mealOptions: defaultPlan.mealOptions,
        description: defaultPlan.description,
        isActive: defaultPlan.isActive,
        leaveRules: defaultPlan.leaveRules
      });

      const savedMealPlan = await newMealPlan.save();
      generatedMealPlans.push(savedMealPlan);
    }

    return res.status(201).json({
      success: true,
      message: `Generated ${generatedMealPlans.length} meal plans for mess`,
      data: generatedMealPlans
    });
  } catch (err: any) {
    return handleAuthError(res, err);
  }
});

// POST /api/admin/default-meal-plans/generate-all - Generate meal plans for all messes
router.post('/generate-all', requireAuth, requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get all active default meal plans
    const defaultMealPlans = await DefaultMealPlan.find({ isActive: true });

    if (defaultMealPlans.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No active default meal plans found'
      });
    }

    // Get all mess profiles
    const messProfiles = await MessProfile.find();

    if (messProfiles.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No mess profiles found'
      });
    }

    let totalGenerated = 0;
    const results = [];

    for (const messProfile of messProfiles) {
      const messResults = [];
      
      for (const defaultPlan of defaultMealPlans) {
        // Check if meal plan already exists for this mess
        const existingMealPlan = await MealPlan.findOne({
          messId: messProfile._id.toString(),
          name: defaultPlan.name
        });

        if (!existingMealPlan) {
          const newMealPlan = new MealPlan({
            messId: messProfile._id.toString(),
            name: defaultPlan.name,
            pricing: defaultPlan.pricing,
            mealType: defaultPlan.mealType,
            mealsPerDay: defaultPlan.mealsPerDay,
            mealOptions: defaultPlan.mealOptions,
            description: defaultPlan.description,
            isActive: defaultPlan.isActive,
            leaveRules: defaultPlan.leaveRules
          });

          const savedMealPlan = await newMealPlan.save();
          messResults.push(savedMealPlan);
          totalGenerated++;
        }
      }

      if (messResults.length > 0) {
        results.push({
          messId: messProfile._id,
          messName: messProfile.name,
          generatedPlans: messResults.length,
          plans: messResults
        });
      }
    }

    return res.status(200).json({
      success: true,
      message: `Generated ${totalGenerated} meal plans across ${results.length} messes`,
      data: {
        totalGenerated,
        messesProcessed: results.length,
        results
      }
    });
  } catch (err: any) {
    return handleAuthError(res, err);
  }
});

// DELETE /api/admin/default-meal-plans/:id - Delete default meal plan
router.delete('/:id', requireAuth, requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const deletedMealPlan = await DefaultMealPlan.findByIdAndDelete(id);

    if (!deletedMealPlan) {
      return res.status(404).json({
        success: false,
        message: 'Default meal plan not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Default meal plan deleted successfully'
    });
  } catch (err: any) {
    return handleAuthError(res, err);
  }
});

export default router;
