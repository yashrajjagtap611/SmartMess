import { Router, Request, Response } from 'express';
import MessProfile from '../models/MessProfile';
import MealPlan from '../models/MealPlan';

const router: Router = Router();

// GET /api/public/mess/:messId - Get public mess profile with plans
router.get('/mess/:messId', async (req: Request, res: Response) => {
  try {
    const { messId } = req.params;

    // Get mess profile
    const messProfile = await MessProfile.findById(messId)
      .select('name location colleges types ownerPhone operatingHours logo')
      .lean();

    if (!messProfile) {
      return res.status(404).json({
        success: false,
        message: 'Mess not found'
      });
    }

    // Get all meal plans for this mess
    const mealPlans = await MealPlan.find({ messId, isActive: true })
      .select('name description pricing mealType mealsPerDay mealOptions')
      .lean();

    return res.status(200).json({
      success: true,
      message: 'Mess profile retrieved successfully',
      data: {
        mess: messProfile,
        plans: mealPlans
      }
    });

  } catch (error: any) {
    console.error('Error fetching public mess profile:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch mess profile'
    });
  }
});

export default router;
