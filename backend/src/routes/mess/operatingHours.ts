import { Router, Request, Response, NextFunction } from 'express';
import requireAuth from '../../middleware/requireAuth';
import { handleAuthError } from '../../middleware/errorHandler';
import logger from '../../utils/logger';
import OperatingHours from '../../models/OperatingHours';

const router: Router = Router();

// Default operating hours structure
const defaultOperatingHours = [
  {
    meal: 'breakfast',
    enabled: true,
    start: '07:00',
    end: '09:00'
  },
  {
    meal: 'lunch',
    enabled: true,
    start: '12:00',
    end: '14:00'
  },
  {
    meal: 'dinner',
    enabled: true,
    start: '19:00',
    end: '21:00'
  }
];

// GET /api/mess/operating-hours - Get operating hours
router.get('/operating-hours', requireAuth, async (req: Request, res: Response, _next: NextFunction) => {
  try {
    const userId = (req as any).user.id;
    logger.info('Getting operating hours for user', { userId: (req as any).user.id });

    // Find operating hours in database
    let operatingHours = await OperatingHours.findOne({ userId: (req as any).user.id });
    
    // If no operating hours exist, create default ones
    if (!operatingHours) {
      operatingHours = new OperatingHours({
        userId,
        operatingHours: defaultOperatingHours
      });
      await operatingHours.save();
      logger.info('Created default operating hours for user', { userId: (req as any).user.id });
    }

    return res.status(200).json({
      success: true,
      message: 'Operating hours retrieved successfully',
      data: operatingHours.operatingHours
    });
  } catch (error: any) {
    logger.error('Error getting operating hours', { error: error.message, userId: (req as any).user?.id });
    return handleAuthError(res, error);
  }
});

// PUT /api/mess/operating-hours - Update operating hours
router.put('/operating-hours', requireAuth, async (req: Request, res: Response, _next: NextFunction) => {
      try {
        const userId = (req as any).user.id;
        const { operatingHours } = req.body;

    logger.info('Updating operating hours for user', { userId, operatingHours });

    // Validate operating hours structure
    if (!Array.isArray(operatingHours)) {
      return res.status(400).json({
        success: false,
        message: 'Operating hours must be an array'
      });
    }

    // Validate each operating hour entry
    for (const hour of operatingHours) {
      if (!hour.meal || !hour.start || !hour.end || typeof hour.enabled !== 'boolean') {
        return res.status(400).json({
          success: false,
          message: 'Invalid operating hour format. Each entry must have meal, start, end, and enabled fields.'
        });
      }

      // Validate time format (HH:MM)
      const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
      if (!timeRegex.test(hour.start) || !timeRegex.test(hour.end)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid time format. Use HH:MM format (e.g., 07:00, 19:30)'
        });
      }
    }

    // Find existing operating hours or create new ones
    let existingHours = await OperatingHours.findOne({ userId: (req as any).user.id });
    
    if (existingHours) {
      // Update existing operating hours
      existingHours.operatingHours = operatingHours;
      await existingHours.save();
      logger.info('Updated operating hours for user', { userId: (req as any).user.id });
    } else {
      // Create new operating hours
      existingHours = new OperatingHours({
        userId,
        operatingHours
      });
      await existingHours.save();
      logger.info('Created new operating hours for user', { userId: (req as any).user.id });
    }

    return res.status(200).json({
      success: true,
      message: 'Operating hours updated successfully',
      data: existingHours.operatingHours
    });

  } catch (error: any) {
    logger.error('Error updating operating hours', { error: error.message, userId: (req as any).user?.id });
    return handleAuthError(res, error);
  }
});

export default router;
