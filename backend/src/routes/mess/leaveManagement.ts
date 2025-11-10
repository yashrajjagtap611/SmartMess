import express, { Request, Response, NextFunction } from 'express';
import requireAuth from '../../middleware/requireAuth';
const { body, validationResult } = require('express-validator');
import {
  getLeaveRequests,
  getLeaveRequest,
  processLeaveRequest,
  processExtensionRequest,
  getLeaveStats
} from '../../controllers/leaveManagementController';

const router: express.Router = express.Router();

// Validation middleware
const validateLeaveAction = [
  body('action').isIn(['approve', 'reject']).withMessage('Action must be approve or reject'),
  body('rejectionReason').optional().isLength({ max: 500 }).withMessage('Rejection reason must be less than 500 characters')
];

const validateExtensionAction = [
  body('action').isIn(['approve', 'reject']).withMessage('Action must be approve or reject'),
  body('rejectionReason').optional().isLength({ max: 500 }).withMessage('Rejection reason must be less than 500 characters')
];

// GET /api/mess/leave-requests - Get all leave requests for mess
router.get('/leave-requests', requireAuth, getLeaveRequests);

// GET /api/mess/leave-requests/stats - Get leave statistics for mess
router.get('/leave-requests/stats', requireAuth, getLeaveStats);

// GET /api/mess/leave-requests/:id - Get specific leave request
router.get('/leave-requests/:id', requireAuth, getLeaveRequest);

// POST /api/mess/leave-requests/:id/action - Approve or reject leave request
router.post('/leave-requests/:id/action', requireAuth, validateLeaveAction, (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  return next();
}, processLeaveRequest);

// POST /api/mess/leave-requests/:id/extension/:extensionId/action - Approve or reject extension request
router.post('/leave-requests/:id/extension/:extensionId/action', requireAuth, validateExtensionAction, (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  return next();
}, processExtensionRequest);

export default router;