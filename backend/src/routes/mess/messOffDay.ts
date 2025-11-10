import express, { Request, Response, NextFunction } from 'express';
import requireAuth from '../../middleware/requireAuth';
const { body, validationResult } = require('express-validator');
import {
  getMessOffDays,
  createMessOffDay,
  updateMessOffDay,
  deleteMessOffDay,
  getMessOffDayStats,
  getDefaultOffDaySettings,
  saveDefaultOffDaySettings
} from '../../controllers/messOffDayController';
import MessOffDayAudit from '../../models/MessOffDayAudit';
import MessProfile from '../../models/MessProfile';

const router: express.Router = express.Router();

// Validation middleware
// Accept either single day (offDate + mealTypes) OR range (startDate/endDate + boundary meal types)
const validateMessOffDayRequest = [
  body('reason').optional().isString().isLength({ max: 500 }).withMessage('Reason must be at most 500 characters'),
  body('offDate').optional({ checkFalsy: true }).isISO8601().withMessage('offDate must be a valid date'),
  body('startDate').optional({ checkFalsy: true }).isISO8601().withMessage('startDate must be a valid date'),
  body('endDate').optional({ checkFalsy: true }).isISO8601().withMessage('endDate must be a valid date'),
  body('mealTypes').optional().isArray().withMessage('mealTypes must be an array'),
  body('mealTypes.*').optional().isIn(['breakfast', 'lunch', 'dinner']).withMessage('Invalid meal type'),
  body('startDateMealTypes').optional({ checkFalsy: true, nullable: true }).isArray().withMessage('startDateMealTypes must be an array'),
  body('endDateMealTypes').optional({ checkFalsy: true, nullable: true }).isArray().withMessage('endDateMealTypes must be an array'),
  body('subscriptionExtension').optional().isBoolean(),
  body('extensionDays').optional().isInt({ min: 0, max: 30 }),
  body().custom((value: any) => {
    if (value && value.subscriptionExtension) {
      if (value.extensionDays !== undefined) {
        const days = Number(value.extensionDays);
        if (!Number.isFinite(days) || days < 1) {
          throw new Error('Extension days must be at least 1 when subscription extension is enabled');
        }
      }
    }
    return true;
  }),
  body('sendAnnouncement').optional().isBoolean(),
  body('announcementMessage').optional({ checkFalsy: true }).isString().isLength({ max: 2000 })
];

const validateMessOffDayUpdate = [
  body('offDate').optional().isISO8601().withMessage('Valid off date is required'),
  body('reason').optional().isLength({ min: 10, max: 500 }).withMessage('Reason must be between 10 and 500 characters'),
  body('mealTypes').optional().isArray({ min: 1 }).withMessage('At least one meal type must be selected'),
  body('mealTypes.*').optional().isIn(['breakfast', 'lunch', 'dinner']).withMessage('Invalid meal type'),
  body('billingDeduction').optional().isBoolean().withMessage('Billing deduction must be a boolean'),
  body('subscriptionExtension').optional().isBoolean().withMessage('Subscription extension must be a boolean'),
  body('extensionDays').optional().isInt({ min: 0, max: 30 }).withMessage('Extension days must be between 0 and 30'),
  body().custom((value: any) => {
    if (value && value.subscriptionExtension !== undefined) {
      if (value.subscriptionExtension && value.extensionDays !== undefined) {
        const days = Number(value.extensionDays);
        if (!Number.isFinite(days) || days < 1) {
          throw new Error('Extension days must be at least 1 when subscription extension is enabled');
        }
      }
    }
    return true;
  }),
  body('sendAnnouncement').optional().isBoolean(),
  body('announcementMessage').optional({ checkFalsy: true }).isString().isLength({ max: 2000 })
];

const validateDefaultSettings = [
  body('pattern').isIn(['weekly', 'monthly']).withMessage('Pattern must be weekly or monthly'),
  body('weeklySettings.dayOfWeek').optional().isInt({ min: 0, max: 6 }).withMessage('Day of week must be between 0 and 6'),
  body('weeklySettings.enabled').optional().isBoolean().withMessage('Weekly enabled must be a boolean'),
  body('weeklySettings.mealTypes').optional().isArray({ min: 1 }).withMessage('At least one meal type must be selected for weekly settings'),
  body('weeklySettings.mealTypes.*').optional().isIn(['breakfast', 'lunch', 'dinner']).withMessage('Invalid meal type in weekly settings'),
  body('monthlySettings.daysOfMonth').optional().isArray({ min: 1 }).withMessage('At least one day of month must be selected'),
  body('monthlySettings.daysOfMonth.*').optional().isInt({ min: 1, max: 31 }).withMessage('Day of month must be between 1 and 31'),
  body('monthlySettings.enabled').optional().isBoolean().withMessage('Monthly enabled must be a boolean'),
  body('monthlySettings.mealTypes').optional().isArray({ min: 1 }).withMessage('At least one meal type must be selected for monthly settings'),
  body('monthlySettings.mealTypes.*').optional().isIn(['breakfast', 'lunch', 'dinner']).withMessage('Invalid meal type in monthly settings'),
  body('billingDeduction').optional().isBoolean().withMessage('Billing deduction must be a boolean')
];

// Validation error handler
const handleValidationErrors = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const first = errors.array()[0];
    return res.status(400).json({
      success: false,
      message: first?.msg || 'Validation failed',
      errors: errors.array()
    });
  }
  return next();
};

// GET /api/mess/off-days - Get all mess off days
router.get('/off-days', requireAuth, getMessOffDays);

// POST /api/mess/off-days - Create new mess off day
router.post('/off-days', requireAuth, validateMessOffDayRequest, handleValidationErrors, createMessOffDay);

// PUT /api/mess/off-days/:id - Update mess off day
router.put('/off-days/:id', requireAuth, validateMessOffDayUpdate, handleValidationErrors, updateMessOffDay);

// DELETE /api/mess/off-days/:id - Delete mess off day
router.delete('/off-days/:id', requireAuth, deleteMessOffDay);

// GET /api/mess/off-days/:id/history - Get audit history for a specific off day
router.get('/off-days/:id/history', requireAuth, async (req: any, res: Response) => {
  try {
    const messOwnerId = req.user.id;
    const messProfile = await MessProfile.findOne({ userId: messOwnerId });
    if (!messProfile) return res.status(400).json({ success: false, message: 'Mess owner not associated with any mess' });
    const { id } = req.params;
    const history = await MessOffDayAudit.find({ messId: messProfile._id, offDayId: id }).sort({ at: -1 }).lean();
    return res.json({ success: true, data: history });
  } catch (e) {
    return res.status(500).json({ success: false, message: 'Failed to fetch history' });
  }
});

// GET /api/mess/off-days/stats - Get mess off day statistics
router.get('/off-days/stats', requireAuth, getMessOffDayStats);

// GET /api/mess/off-day-settings - Get default off day settings
router.get('/off-day-settings', requireAuth, getDefaultOffDaySettings);

// POST /api/mess/off-day-settings - Save default off day settings
router.post('/off-day-settings', requireAuth, validateDefaultSettings, handleValidationErrors, saveDefaultOffDaySettings);

export default router;
