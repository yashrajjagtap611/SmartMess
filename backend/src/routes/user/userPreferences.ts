import { Router, Request, Response, NextFunction } from 'express';
import requireAuth from '../../middleware/requireAuth';
import { handleAuthError } from '../../middleware/errorHandler';
import User from '../../models/User';
import { AuthenticatedRequest } from '../../types/requests';
import { ParamsDictionary } from 'express-serve-static-core';
import { ParsedQs } from 'qs';

const router: Router = Router();

// GET /api/user/preferences - Get user's preferences
router.get('/', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
    const userId = (req as any).user.id;
  try {
        const user = await User.findById(userId).select('preferences');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: user.preferences || {}
    });
  } catch (err) {
    console.error('Error fetching user preferences:', err);
    return handleAuthError(res, err);
  }
});

// PUT /api/user/preferences - Update user's preferences
router.put('/', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
    const userId = (req as any).user.id;
  try {
        const preferences = req.body;

    const user = await User.findByIdAndUpdate(
      userId,
      { preferences },
      { new: true }
    ).select('preferences');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: user.preferences,
      message: 'Preferences updated successfully'
    });
  } catch (err) {
    console.error('Error updating user preferences:', err);
    return handleAuthError(res, err);
  }
});

// PUT /api/user/preferences/dietary - Update dietary preferences
router.put('/dietary', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
    const userId = (req as any).user.id;
  try {
        const { dietary } = req.body;

    if (!Array.isArray(dietary)) {
      return res.status(400).json({
        success: false,
        message: 'Dietary preferences must be an array'
      });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { 'preferences.dietary': dietary },
      { new: true }
    ).select('preferences');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: user.preferences?.dietary || [],
      message: 'Dietary preferences updated successfully'
    });
  } catch (err) {
    console.error('Error updating dietary preferences:', err);
    return handleAuthError(res, err);
  }
});

// PUT /api/user/preferences/allergies - Update allergy preferences
router.put('/allergies', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
    const userId = (req as any).user.id;
  try {
        const { allergies } = req.body;

    if (!Array.isArray(allergies)) {
      return res.status(400).json({
        success: false,
        message: 'Allergies must be an array'
      });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { 'preferences.allergies': allergies },
      { new: true }
    ).select('preferences');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: user.preferences?.allergies || [],
      message: 'Allergy preferences updated successfully'
    });
  } catch (err) {
    console.error('Error updating allergy preferences:', err);
    return handleAuthError(res, err);
  }
});

// PUT /api/user/preferences/meal-times - Update meal time preferences
router.put('/meal-times', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
    const userId = (req as any).user.id;
  try {
        const { mealTimes } = req.body;

    if (!mealTimes || typeof mealTimes !== 'object') {
      return res.status(400).json({
        success: false,
        message: 'Meal times must be an object'
      });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { 'preferences.mealTimes': mealTimes },
      { new: true }
    ).select('preferences');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: user.preferences?.mealTimes || {},
      message: 'Meal time preferences updated successfully'
    });
  } catch (err) {
    console.error('Error updating meal time preferences:', err);
    return handleAuthError(res, err);
  }
});

export default router; 