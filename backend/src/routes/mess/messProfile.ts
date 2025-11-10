import { Router, Request, Response, NextFunction } from 'express';
import requireAuth from '../../middleware/requireAuth';
import { handleAuthError } from '../../middleware/errorHandler';
import MessProfile from '../../models/MessProfile';
import DefaultMealPlan from '../../models/DefaultMealPlan';
import MealPlan from '../../models/MealPlan';
import logger from '../../utils/logger';

const router: Router = Router();

// Function to generate meal plans from admin defaults for a new mess
const generateMealPlansFromDefaults = async (messId: string) => {
  try {
    // Get all active default meal plans
    const defaultMealPlans = await DefaultMealPlan.find({ isActive: true });

    if (defaultMealPlans.length === 0) {
      logger.info('No active default meal plans found for automatic generation', { messId });
      return [];
    }

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

    logger.info(`Generated ${generatedMealPlans.length} meal plans from defaults for mess`, { 
      messId, 
      planCount: generatedMealPlans.length 
    });

    return generatedMealPlans;
  } catch (error) {
    logger.error('Error generating meal plans from defaults', { messId, error });
    throw error;
  }
};

// GET /api/mess/profile - Get mess profile for current user
router.get('/', requireAuth, async (req: Request, res: Response, _next: NextFunction) => {
    const userId = (req as any).user.id;
    try {
        const messProfile = await MessProfile.findOne({ userId: (req as any).user.id });
    if (!messProfile) {
      return res.status(404).json({
        success: false,
        message: 'No mess profile found for this user'
      });
    }

    return res.status(200).json({
      success: true,
      data: messProfile
    });
  } catch (err) {
    console.error('Error fetching mess profile:', err);
    return handleAuthError(res, err);
  }
});

// POST /api/mess/profile - Create or upsert mess profile for current user
router.post('/', requireAuth, async (req: Request, res: Response, _next: NextFunction) => {
    const userId = (req as any).user.id;
    try {
        const profileData = req.body;

    // Check if a profile already exists for this user
    const existing = await MessProfile.findOne({ userId: (req as any).user.id });

    if (existing) {
      // Update existing profile with provided fields
      const updated = await MessProfile.findOneAndUpdate(
        { userId: (req as any).user.id },
        profileData,
        { new: true, runValidators: true }
      );

      return res.status(200).json({
        success: true,
        data: updated
      });
    }

    // Create a new profile
    const created = await MessProfile.create({
      ...profileData,
      userId
    });

    // Log mess profile creation
    logger.info('New mess profile created', { userId: (req as any).user.id });

    // Automatically generate meal plans from admin defaults
    let generatedMealPlans = [];
    try {
      generatedMealPlans = await generateMealPlansFromDefaults(created._id.toString());
      logger.info('Successfully generated meal plans from defaults', { 
        userId, 
        messId: created._id,
        planCount: generatedMealPlans.length 
      });
    } catch (error) {
      logger.error('Failed to generate meal plans from defaults', { 
        userId, 
        messId: created._id, 
        error 
      });
      // Don't fail the profile creation if meal plan generation fails
    }

    return res.status(201).json({
      success: true,
      data: created,
      message: `Mess profile created successfully${generatedMealPlans.length > 0 ? ` with ${generatedMealPlans.length} default meal plans` : ''}`,
      generatedMealPlans: generatedMealPlans.length
    });
  } catch (err) {
    console.error('Error creating/upserting mess profile:', err);
    return handleAuthError(res, err);
  }
});

// PUT /api/mess/profile - Update mess profile
router.put('/', requireAuth, async (req: Request, res: Response, _next: NextFunction) => {
    const userId = (req as any).user.id;
    try {
        const updateData = req.body;

    const messProfile = await MessProfile.findOneAndUpdate(
      { userId: (req as any).user.id },
      updateData,
      { new: true, runValidators: true }
    );

    if (!messProfile) {
      return res.status(404).json({
        success: false,
        message: 'No mess profile found for this user'
      });
    }

    return res.status(200).json({
      success: true,
      data: messProfile
    });
  } catch (err) {
    console.error('Error updating mess profile:', err);
    return handleAuthError(res, err);
  }
});

// GET /api/mess/profile/photo - Get mess photo
router.get('/photo', requireAuth, async (req: Request, res: Response, _next: NextFunction) => {    const userId = (req as any).user.id;
    try {
        const messProfile = await MessProfile.findOne({ userId: (req as any).user.id });
    if (!messProfile) {
      return res.status(404).json({
        success: false,
        message: 'No mess profile found for this user'
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        photoUrl: messProfile.logo || null
      }
    });
  } catch (err) {
    console.error('Error fetching mess photo:', err);
    return handleAuthError(res, err);
  }
});

// PUT /api/mess/profile/photo - Update mess photo
router.put('/photo', requireAuth, async (req: Request, res: Response, _next: NextFunction) => {
      try {
        const { photoUrl } = req.body;

    const messProfile = await MessProfile.findOneAndUpdate(
      { userId: (req as any).user.id },
      { logo: photoUrl },
      { new: true }
    );

    if (!messProfile) {
      return res.status(404).json({
        success: false,
        message: 'No mess profile found for this user'
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        photoUrl: messProfile.logo
      }
    });
  } catch (err) {
    console.error('Error updating mess photo:', err);
    return handleAuthError(res, err);
  }
});

// POST /api/mess/profile/generate-meal-plans - Generate meal plans from defaults for existing mess
router.post('/generate-meal-plans', requireAuth, async (req: Request, res: Response, _next: NextFunction) => {    const userId = (req as any).user.id;
    try {
        const messProfile = await MessProfile.findOne({ userId: (req as any).user.id });
    if (!messProfile) {
      return res.status(404).json({
        success: false,
        message: 'No mess profile found for this user'
      });
    }

    // Check if meal plans already exist for this mess
    const existingMealPlans = await MealPlan.find({ messId: messProfile._id.toString() });
    if (existingMealPlans.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Meal plans already exist for this mess. Please delete existing plans first if you want to regenerate from defaults.'
      });
    }

    // Generate meal plans from defaults
    const generatedMealPlans = await generateMealPlansFromDefaults(messProfile._id.toString());

    return res.status(200).json({
      success: true,
      message: `Successfully generated ${generatedMealPlans.length} meal plans from defaults`,
      data: {
        generatedCount: generatedMealPlans.length,
        mealPlans: generatedMealPlans
      }
    });
  } catch (err) {
    console.error('Error generating meal plans:', err);
    return handleAuthError(res, err);
  }
});

export default router; 