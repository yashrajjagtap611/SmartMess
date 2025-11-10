import { Router, Request, Response, NextFunction } from 'express';
import requireAuth from '../middleware/requireAuth';
import { handleAuthError } from '../middleware/errorHandler';
import MealPlan, { IMealPlan } from '../models/MealPlan';
import MessProfile from '../models/MessProfile';

// Utility function to ensure mealOptions backward compatibility
const ensureMealOptionsCompatibility = async (mealPlans: IMealPlan[]): Promise<IMealPlan[]> => {
  for (const mealPlan of mealPlans) {
    if (!mealPlan.mealOptions) {
      // Set default mealOptions based on mealsPerDay
      let defaultMealOptions;
      if (mealPlan.mealsPerDay === 1) {
        defaultMealOptions = { breakfast: true, lunch: false, dinner: false };
      } else if (mealPlan.mealsPerDay === 2) {
        defaultMealOptions = { breakfast: true, lunch: true, dinner: false };
      } else {
        defaultMealOptions = { breakfast: true, lunch: true, dinner: true };
      }

      // Update the document to include mealOptions
      await MealPlan.findByIdAndUpdate(mealPlan._id, { mealOptions: defaultMealOptions });
      
      // Update the local object for response
      mealPlan.mealOptions = defaultMealOptions;
    }
  }
  return mealPlans;
};

const router: Router = Router();

// Alias routes at base path to match frontend expectations (/api/meal-plan)
// GET /api/meal-plan - list meal plans
router.get('/', requireAuth, async (req: Request, res: Response, _next: NextFunction) => {
    try {
        const userId = (req as any).user.id;
        const messProfile = await MessProfile.findOne({ userId: (req as any).user.id });
    if (!messProfile) {
      return res.status(404).json({ message: 'Mess profile not found. Please create a mess profile first.' });
    }
    const mealPlans = await MealPlan.find({ messId: messProfile._id.toString() }).sort({ createdAt: -1 });
    
    // Ensure all meal plans have mealOptions for backward compatibility
    await ensureMealOptionsCompatibility(mealPlans);
    
    return res.status(200).json({ success: true, message: 'Meal plans retrieved successfully', data: mealPlans });
  } catch (err) {
    return handleAuthError(res, err);
  }
});

// GET /api/meal-plan/:id - get specific meal plan
router.get('/:id', requireAuth, async (req: Request, res: Response, _next: NextFunction) => {
    const userId = (req as any).user.id;
    try {
        const mealPlanId = req.params['id'];
    const messProfile = await MessProfile.findOne({ userId: (req as any).user.id });
    if (!messProfile) {
      return res.status(404).json({ message: 'Mess profile not found' });
    }
    const mealPlan = await MealPlan.findOne({ _id: mealPlanId, messId: messProfile._id.toString() });
    if (!mealPlan) {
      return res.status(404).json({ message: 'Meal plan not found' });
    }

    // Ensure mealOptions exists for backward compatibility
    if (!mealPlan.mealOptions) {
      mealPlan.mealOptions = {
        breakfast: true,
        lunch: true,
        dinner: true,
      };
      // Update the document to include mealOptions
      await MealPlan.findByIdAndUpdate(mealPlanId, { mealOptions: mealPlan.mealOptions });
    }
    return res.status(200).json({ success: true, message: 'Meal plan retrieved successfully', data: mealPlan });
  } catch (err) {
    return handleAuthError(res, err);
  }
});

// POST /api/meal-plan - create meal plan
router.post('/', requireAuth, async (req: Request, res: Response, _next: NextFunction) => {
    const userId = (req as any).user.id;
    try {
        const mealPlanData = req.body;
    const messProfile = await MessProfile.findOne({ userId: (req as any).user.id });
    if (!messProfile) {
      return res.status(404).json({ message: 'Mess profile not found. Please create a mess profile first.' });
    }
    // Validate using existing rules
    const validation = validateMealPlan(mealPlanData, false);
    if (!validation.isValid) {
      return res.status(400).json({ message: 'Validation failed', errors: validation.errors });
    }
    const newMealPlan = new MealPlan({
      messId: messProfile._id.toString(),
      name: mealPlanData.name.trim(),
      pricing: { amount: mealPlanData.pricing.amount, period: mealPlanData.pricing.period },
      mealType: mealPlanData.mealType,
      mealsPerDay: mealPlanData.mealsPerDay,
      mealOptions: {
        breakfast: mealPlanData.mealOptions?.breakfast ?? true,
        lunch: mealPlanData.mealOptions?.lunch ?? true,
        dinner: mealPlanData.mealOptions?.dinner ?? true,
      },
      description: mealPlanData.description.trim(),
      isActive: mealPlanData.isActive !== undefined ? mealPlanData.isActive : true,
      leaveRules: {
        maxLeaveMeals: mealPlanData.leaveRules?.maxLeaveMeals || 30,
        requireTwoHourNotice: mealPlanData.leaveRules?.requireTwoHourNotice !== undefined ? mealPlanData.leaveRules.requireTwoHourNotice : true,
        noticeHours: mealPlanData.leaveRules?.noticeHours || 2,
        minConsecutiveDays: mealPlanData.leaveRules?.minConsecutiveDays || 2,
        extendSubscription: mealPlanData.leaveRules?.extendSubscription !== undefined ? mealPlanData.leaveRules.extendSubscription : true,
        autoApproval: mealPlanData.leaveRules?.autoApproval !== undefined ? mealPlanData.leaveRules.autoApproval : true,
        leaveLimitsEnabled: mealPlanData.leaveRules?.leaveLimitsEnabled !== undefined ? mealPlanData.leaveRules.leaveLimitsEnabled : true,
        consecutiveLeaveEnabled: mealPlanData.leaveRules?.consecutiveLeaveEnabled !== undefined ? mealPlanData.leaveRules.consecutiveLeaveEnabled : true,
        maxLeaveMealsEnabled: mealPlanData.leaveRules?.maxLeaveMealsEnabled !== undefined ? mealPlanData.leaveRules.maxLeaveMealsEnabled : true
      }
    });
    const savedMealPlan = await newMealPlan.save();
    return res.status(201).json({ success: true, message: 'Meal plan created successfully', data: savedMealPlan });
  } catch (err) {
    return handleAuthError(res, err);
  }
});

// PUT /api/meal-plan/:id - update meal plan
router.put('/:id', requireAuth, async (req: Request, res: Response, _next: NextFunction) => {    const userId = (req as any).user.id;
    try {
        const mealPlanId = req.params['id'];
    const updateData = req.body;
    const messProfile = await MessProfile.findOne({ userId: (req as any).user.id });
    if (!messProfile) {
      return res.status(404).json({ message: 'Mess profile not found' });
    }
    const existingMealPlan = await MealPlan.findOne({ _id: mealPlanId, messId: messProfile._id.toString() });
    if (!existingMealPlan) {
      return res.status(404).json({ message: 'Meal plan not found' });
    }
    const validation = validateMealPlan(updateData, true);
    if (!validation.isValid) {
      return res.status(400).json({ message: 'Validation failed', errors: validation.errors });
    }
    const updateFields: any = {};
    if (updateData.name !== undefined) updateFields.name = updateData.name.trim();
    if (updateData.pricing !== undefined) updateFields.pricing = { amount: updateData.pricing.amount, period: updateData.pricing.period };
    if (updateData.mealType !== undefined) updateFields.mealType = updateData.mealType;
    if (updateData.mealsPerDay !== undefined) updateFields.mealsPerDay = updateData.mealsPerDay;
    if (updateData.mealOptions !== undefined) {
      updateFields.mealOptions = {
        breakfast: updateData.mealOptions.breakfast,
        lunch: updateData.mealOptions.lunch,
        dinner: updateData.mealOptions.dinner,
      };
      // Also update mealsPerDay to match the new meal options
      updateFields.mealsPerDay = [
        updateData.mealOptions.breakfast,
        updateData.mealOptions.lunch,
        updateData.mealOptions.dinner
      ].filter(Boolean).length;
    }
    if (updateData.description !== undefined) updateFields.description = updateData.description.trim();
    if (updateData.isActive !== undefined) updateFields.isActive = updateData.isActive;
    if (updateData.leaveRules !== undefined) updateFields.leaveRules = { ...existingMealPlan.leaveRules, ...updateData.leaveRules };
    const updatedMealPlan = await MealPlan.findByIdAndUpdate(mealPlanId, updateFields, { new: true, runValidators: true });
    return res.status(200).json({ success: true, message: 'Meal plan updated successfully', data: updatedMealPlan });
  } catch (err) {
    return handleAuthError(res, err);
  }
});

// DELETE /api/meal-plan/:id - delete meal plan
router.delete('/:id', requireAuth, async (req: Request, res: Response, _next: NextFunction) => {    const userId = (req as any).user.id;
    try {
        const mealPlanId = req.params['id'];
    const messProfile = await MessProfile.findOne({ userId: (req as any).user.id });
    if (!messProfile) {
      return res.status(404).json({ message: 'Mess profile not found' });
    }
    const existingMealPlan = await MealPlan.findOne({ _id: mealPlanId, messId: messProfile._id.toString() });
    if (!existingMealPlan) {
      return res.status(404).json({ message: 'Meal plan not found' });
    }
    await MealPlan.findByIdAndDelete(mealPlanId);
    return res.status(200).json({ success: true, message: 'Meal plan deleted successfully' });
  } catch (err) {
    return handleAuthError(res, err);
  }
});

// Validation function for meal plan data
const validateMealPlan = (mealPlanData: any, isUpdate: boolean = false): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  // For updates, only validate fields that are present
  if (isUpdate) {
    if (mealPlanData.name !== undefined) {
      if (!mealPlanData.name || mealPlanData.name.trim().length === 0) {
        errors.push('Meal plan name is required');
      } else if (mealPlanData.name.trim().length < 2) {
        errors.push('Meal plan name must be at least 2 characters long');
      } else if (mealPlanData.name.trim().length > 100) {
        errors.push('Meal plan name must be less than 100 characters');
      }
    }

    if (mealPlanData.pricing !== undefined) {
      if (mealPlanData.pricing.amount !== undefined && mealPlanData.pricing.amount <= 0) {
        errors.push('Pricing amount must be greater than 0');
      }
      if (mealPlanData.pricing.period !== undefined && !['day', 'week', '15days', 'month', '3months', '6months', 'year'].includes(mealPlanData.pricing.period)) {
        errors.push('Invalid pricing period');
      }
    }

    if (mealPlanData.mealType !== undefined && !['Vegetarian', 'Non-Vegetarian', 'Mixed', 'Custom', 'Vegan'].includes(mealPlanData.mealType)) {
      errors.push('Invalid meal type');
    }

    if (mealPlanData.mealsPerDay !== undefined && (mealPlanData.mealsPerDay < 1 || mealPlanData.mealsPerDay > 5)) {
      errors.push('Meals per day must be between 1 and 5');
    }

    if (mealPlanData.mealOptions !== undefined) {
      if (!mealPlanData.mealOptions.breakfast && !mealPlanData.mealOptions.lunch && !mealPlanData.mealOptions.dinner) {
        errors.push('At least one meal option must be selected');
      }
      
      // If both mealsPerDay and mealOptions are being updated, validate consistency
      if (mealPlanData.mealsPerDay !== undefined) {
        const selectedMeals = [
          mealPlanData.mealOptions.breakfast,
          mealPlanData.mealOptions.lunch,
          mealPlanData.mealOptions.dinner
        ].filter(Boolean).length;
        
        if (mealPlanData.mealsPerDay !== selectedMeals) {
          errors.push(`Meals per day (${mealPlanData.mealsPerDay}) must match the number of selected meal options (${selectedMeals})`);
        }
      }
    }

    if (mealPlanData.description !== undefined) {
      if (!mealPlanData.description || mealPlanData.description.trim().length === 0) {
        errors.push('Description is required');
      } else if (mealPlanData.description.trim().length < 10) {
        errors.push('Description must be at least 10 characters long');
      } else if (mealPlanData.description.trim().length > 500) {
        errors.push('Description must be less than 500 characters');
      }
    }

    if (mealPlanData.leaveRules !== undefined) {
      // Only validate maxLeaveMeals if the feature is enabled
      if (mealPlanData.leaveRules.leaveLimitsEnabled && mealPlanData.leaveRules.maxLeaveMealsEnabled) {
        if (mealPlanData.leaveRules.maxLeaveMeals !== undefined && (mealPlanData.leaveRules.maxLeaveMeals < 1 || mealPlanData.leaveRules.maxLeaveMeals > 93)) {
          errors.push('Maximum leave meals must be between 1 and 93');
        }
      }
      
      // Only validate noticeHours if requireTwoHourNotice is enabled
      if (mealPlanData.leaveRules.requireTwoHourNotice) {
        if (mealPlanData.leaveRules.noticeHours !== undefined && (mealPlanData.leaveRules.noticeHours < 1 || mealPlanData.leaveRules.noticeHours > 24)) {
          errors.push('Notice hours must be between 1 and 24');
        }
      }
      
      // Only validate minConsecutiveDays if consecutiveLeaveEnabled is enabled
      if (mealPlanData.leaveRules.consecutiveLeaveEnabled) {
        if (mealPlanData.leaveRules.minConsecutiveDays !== undefined && (mealPlanData.leaveRules.minConsecutiveDays < 1 || mealPlanData.leaveRules.minConsecutiveDays > 31)) {
          errors.push('Minimum consecutive days must be between 1 and 31');
        }
      }
    }
  } else {
    // For new meal plans, validate all required fields
    if (!mealPlanData.name || mealPlanData.name.trim().length === 0) {
      errors.push('Meal plan name is required');
    } else if (mealPlanData.name.trim().length < 2) {
      errors.push('Meal plan name must be at least 2 characters long');
    } else if (mealPlanData.name.trim().length > 100) {
      errors.push('Meal plan name must be less than 100 characters');
    }

    if (!mealPlanData.pricing || mealPlanData.pricing.amount <= 0) {
      errors.push('Pricing amount must be greater than 0');
    }

    if (!mealPlanData.pricing || !['day', 'week', '15days', 'month', '3months', '6months', 'year'].includes(mealPlanData.pricing.period)) {
      errors.push('Valid pricing period is required');
    }

    if (!mealPlanData.mealType || !['Vegetarian', 'Non-Vegetarian', 'Mixed', 'Custom', 'Vegan'].includes(mealPlanData.mealType)) {
      errors.push('Valid meal type is required');
    }

    if (!mealPlanData.mealsPerDay || mealPlanData.mealsPerDay < 1 || mealPlanData.mealsPerDay > 5) {
      errors.push('Meals per day must be between 1 and 5');
    }

    // Validate meal options
    if (!mealPlanData.mealOptions) {
      errors.push('Meal options are required');
    } else {
      if (!mealPlanData.mealOptions.breakfast && !mealPlanData.mealOptions.lunch && !mealPlanData.mealOptions.dinner) {
        errors.push('At least one meal option must be selected');
      }
      
      // Validate that mealsPerDay matches the number of selected meal options
      const selectedMeals = [
        mealPlanData.mealOptions.breakfast,
        mealPlanData.mealOptions.lunch,
        mealPlanData.mealOptions.dinner
      ].filter(Boolean).length;
      
      if (mealPlanData.mealsPerDay !== selectedMeals) {
        errors.push(`Meals per day (${mealPlanData.mealsPerDay}) must match the number of selected meal options (${selectedMeals})`);
      }
    }

    if (!mealPlanData.description || mealPlanData.description.trim().length === 0) {
      errors.push('Description is required');
    } else if (mealPlanData.description.trim().length < 10) {
      errors.push('Description must be at least 10 characters long');
    } else if (mealPlanData.description.trim().length > 500) {
      errors.push('Description must be less than 500 characters');
    }

    if (mealPlanData.leaveRules) {
      // Only validate maxLeaveMeals if the feature is enabled
      if (mealPlanData.leaveRules.leaveLimitsEnabled && mealPlanData.leaveRules.maxLeaveMealsEnabled) {
        if (mealPlanData.leaveRules.maxLeaveMeals !== undefined && (mealPlanData.leaveRules.maxLeaveMeals < 1 || mealPlanData.leaveRules.maxLeaveMeals > 93)) {
          errors.push('Maximum leave meals must be between 1 and 93');
        }
      }
      
      // Only validate noticeHours if requireTwoHourNotice is enabled
      if (mealPlanData.leaveRules.requireTwoHourNotice) {
        if (mealPlanData.leaveRules.noticeHours !== undefined && (mealPlanData.leaveRules.noticeHours < 1 || mealPlanData.leaveRules.noticeHours > 24)) {
          errors.push('Notice hours must be between 1 and 24');
        }
      }
      
      // Only validate minConsecutiveDays if consecutiveLeaveEnabled is enabled
      if (mealPlanData.leaveRules.consecutiveLeaveEnabled) {
        if (mealPlanData.leaveRules.minConsecutiveDays !== undefined && (mealPlanData.leaveRules.minConsecutiveDays < 1 || mealPlanData.leaveRules.minConsecutiveDays > 31)) {
          errors.push('Minimum consecutive days must be between 1 and 31');
        }
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Migration endpoint to update existing meal plans with mealOptions
router.post('/migrate-meal-options', requireAuth, async (req: Request, res: Response, _next: NextFunction) => {    const userId = (req as any).user.id;
    try {
        const messProfile = await MessProfile.findOne({ userId: (req as any).user.id });
    if (!messProfile) {
      return res.status(404).json({ message: 'Mess profile not found' });
    }

    // Find all meal plans without mealOptions
    const mealPlansToUpdate = await MealPlan.find({ 
      messId: messProfile._id.toString(),
      $or: [
        { mealOptions: { $exists: false } },
        { mealOptions: null }
      ]
    });

    let updatedCount = 0;
    for (const mealPlan of mealPlansToUpdate) {
      // Set default mealOptions based on mealsPerDay
      let defaultMealOptions;
      if (mealPlan.mealsPerDay === 1) {
        defaultMealOptions = { breakfast: true, lunch: false, dinner: false };
      } else if (mealPlan.mealsPerDay === 2) {
        defaultMealOptions = { breakfast: true, lunch: true, dinner: false };
      } else {
        defaultMealOptions = { breakfast: true, lunch: true, dinner: true };
      }

      await MealPlan.findByIdAndUpdate(mealPlan._id, { mealOptions: defaultMealOptions });
      updatedCount++;
    }

    return res.status(200).json({
      success: true,
      message: `Migration completed. Updated ${updatedCount} meal plans.`,
      updatedCount
    });
  } catch (err) {
    return handleAuthError(res, err);
  }
});

// GET /api/mess/meal-plans - Get all meal plans for the mess
router.get('/meal-plans', requireAuth, async (req: Request, res: Response, _next: NextFunction) => {
    const userId = (req as any).user.id;
    try {
        // First, get the mess profile to get the messId
    const messProfile = await MessProfile.findOne({ userId: (req as any).user.id });
    if (!messProfile) {
      return res.status(404).json({ message: 'Mess profile not found. Please create a mess profile first.' });
    }

    // Get all meal plans for this mess
    const mealPlans = await MealPlan.find({ messId: messProfile._id.toString() }).sort({ createdAt: -1 });

    // Ensure all meal plans have mealOptions for backward compatibility
    await ensureMealOptionsCompatibility(mealPlans);

    return res.status(200).json({
      success: true,
      message: 'Meal plans retrieved successfully',
      data: mealPlans
    });
  } catch (err) {
    return handleAuthError(res, err);
  }
});

// GET /api/mess/meal-plans/:id - Get a specific meal plan
router.get('/meal-plans/:id', requireAuth, async (req: Request, res: Response, _next: NextFunction) => {    const userId = (req as any).user.id;
    try {
        const mealPlanId = req.params['id'];

    // First, get the mess profile to get the messId
    const messProfile = await MessProfile.findOne({ userId: (req as any).user.id });
    if (!messProfile) {
      return res.status(404).json({ message: 'Mess profile not found' });
    }

    // Get the specific meal plan
    const mealPlan = await MealPlan.findOne({ 
      _id: mealPlanId, 
      messId: messProfile._id.toString() 
    });

    if (!mealPlan) {
      return res.status(404).json({ message: 'Meal plan not found' });
    }

    // Ensure mealOptions exists for backward compatibility
    if (!mealPlan.mealOptions) {
      // Set default mealOptions based on mealsPerDay
      let defaultMealOptions;
      if (mealPlan.mealsPerDay === 1) {
        defaultMealOptions = { breakfast: true, lunch: false, dinner: false };
      } else if (mealPlan.mealsPerDay === 2) {
        defaultMealOptions = { breakfast: true, lunch: true, dinner: false };
      } else {
        defaultMealOptions = { breakfast: true, lunch: true, dinner: true };
      }

      // Update the document to include mealOptions
      await MealPlan.findByIdAndUpdate(mealPlanId, { mealOptions: defaultMealOptions });
      
      // Update the local object for response
      mealPlan.mealOptions = defaultMealOptions;
    }

    return res.status(200).json({
      success: true,
      message: 'Meal plan retrieved successfully',
      data: mealPlan
    });
  } catch (err) {
    return handleAuthError(res, err);
  }
});

// POST /api/mess/meal-plans - Create a new meal plan
router.post('/meal-plans', requireAuth, async (req: Request, res: Response, _next: NextFunction) => {    const userId = (req as any).user.id;
    try {
        const mealPlanData = req.body;

    // First, get the mess profile to get the messId
    const messProfile = await MessProfile.findOne({ userId: (req as any).user.id });
    if (!messProfile) {
      return res.status(404).json({ message: 'Mess profile not found. Please create a mess profile first.' });
    }

    // Validate meal plan data
    const validation = validateMealPlan(mealPlanData, false);
    if (!validation.isValid) {
      console.log('Validation failed:', validation.errors);
      console.log('Received data:', JSON.stringify(mealPlanData, null, 2));
      return res.status(400).json({
        message: 'Validation failed',
        errors: validation.errors
      });
    }

    // Create new meal plan
    const newMealPlan = new MealPlan({
      messId: messProfile._id.toString(),
      name: mealPlanData.name.trim(),
      pricing: {
        amount: mealPlanData.pricing.amount,
        period: mealPlanData.pricing.period
      },
      mealType: mealPlanData.mealType,
      mealsPerDay: mealPlanData.mealsPerDay,
      mealOptions: {
        breakfast: mealPlanData.mealOptions?.breakfast ?? true,
        lunch: mealPlanData.mealOptions?.lunch ?? true,
        dinner: mealPlanData.mealOptions?.dinner ?? true,
      },
      description: mealPlanData.description.trim(),
      isActive: mealPlanData.isActive !== undefined ? mealPlanData.isActive : true,
      leaveRules: {
        maxLeaveMeals: mealPlanData.leaveRules?.maxLeaveMeals || 30,
        requireTwoHourNotice: mealPlanData.leaveRules?.requireTwoHourNotice !== undefined ? mealPlanData.leaveRules.requireTwoHourNotice : true,
        noticeHours: mealPlanData.leaveRules?.noticeHours || 2,
        minConsecutiveDays: mealPlanData.leaveRules?.minConsecutiveDays || 2,
        extendSubscription: mealPlanData.leaveRules?.extendSubscription !== undefined ? mealPlanData.leaveRules.extendSubscription : true,
        autoApproval: mealPlanData.leaveRules?.autoApproval !== undefined ? mealPlanData.leaveRules.autoApproval : true,
        leaveLimitsEnabled: mealPlanData.leaveRules?.leaveLimitsEnabled !== undefined ? mealPlanData.leaveRules.leaveLimitsEnabled : true,
        consecutiveLeaveEnabled: mealPlanData.leaveRules?.consecutiveLeaveEnabled !== undefined ? mealPlanData.leaveRules.consecutiveLeaveEnabled : true,
        maxLeaveMealsEnabled: mealPlanData.leaveRules?.maxLeaveMealsEnabled !== undefined ? mealPlanData.leaveRules.maxLeaveMealsEnabled : true
      }
    });

    const savedMealPlan = await newMealPlan.save();

    return res.status(201).json({
      success: true,
      message: 'Meal plan created successfully',
      data: savedMealPlan
    });
  } catch (err) {
    return handleAuthError(res, err);
  }
});

// PUT /api/mess/meal-plans/:id - Update a meal plan
router.put('/meal-plans/:id', requireAuth, async (req: Request, res: Response, _next: NextFunction) => {    const userId = (req as any).user.id;
    try {
        const mealPlanId = req.params['id'];
    const updateData = req.body;

    // First, get the mess profile to get the messId
    const messProfile = await MessProfile.findOne({ userId: (req as any).user.id });
    if (!messProfile) {
      return res.status(404).json({ message: 'Mess profile not found' });
    }

    // Check if meal plan exists and belongs to this mess
    const existingMealPlan = await MealPlan.findOne({ 
      _id: mealPlanId, 
      messId: messProfile._id.toString() 
    });

    if (!existingMealPlan) {
      return res.status(404).json({ message: 'Meal plan not found' });
    }

    // Validate update data
    const validation = validateMealPlan(updateData, true);
    if (!validation.isValid) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: validation.errors
      });
    }

    // Prepare update fields
    const updateFields: any = {};
    
    if (updateData.name !== undefined) {
      updateFields.name = updateData.name.trim();
    }
    
    if (updateData.pricing !== undefined) {
      updateFields.pricing = {
        amount: updateData.pricing.amount,
        period: updateData.pricing.period
      };
    }
    
    if (updateData.mealType !== undefined) {
      updateFields.mealType = updateData.mealType;
    }
    
    if (updateData.mealsPerDay !== undefined) {
      updateFields.mealsPerDay = updateData.mealsPerDay;
    }
    
    if (updateData.description !== undefined) {
      updateFields.description = updateData.description.trim();
    }
    
    if (updateData.isActive !== undefined) {
      updateFields.isActive = updateData.isActive;
    }
    
    if (updateData.leaveRules !== undefined) {
      updateFields.leaveRules = {
        ...existingMealPlan.leaveRules,
        ...updateData.leaveRules
      };
    }

    // Update the meal plan
    const updatedMealPlan = await MealPlan.findByIdAndUpdate(
      mealPlanId,
      updateFields,
      { new: true, runValidators: true }
    );

    return res.status(200).json({
      success: true,
      message: 'Meal plan updated successfully',
      data: updatedMealPlan
    });
  } catch (err) {
    return handleAuthError(res, err);
  }
});

// DELETE /api/mess/meal-plans/:id - Delete a meal plan
router.delete('/meal-plans/:id', requireAuth, async (req: Request, res: Response, _next: NextFunction) => {    const userId = (req as any).user.id;
    try {
        const mealPlanId = req.params['id'];

    // First, get the mess profile to get the messId
    const messProfile = await MessProfile.findOne({ userId: (req as any).user.id });
    if (!messProfile) {
      return res.status(404).json({ message: 'Mess profile not found' });
    }

    // Check if meal plan exists and belongs to this mess
    const existingMealPlan = await MealPlan.findOne({ 
      _id: mealPlanId, 
      messId: messProfile._id.toString() 
    });

    if (!existingMealPlan) {
      return res.status(404).json({ message: 'Meal plan not found' });
    }

    // Delete the meal plan
    await MealPlan.findByIdAndDelete(mealPlanId);

    return res.status(200).json({
      success: true,
      message: 'Meal plan deleted successfully'
    });
  } catch (err) {
    return handleAuthError(res, err);
  }
});

export default router; 