import { Router, Request, Response, NextFunction } from 'express';
import requireAuth from '../middleware/requireAuth';
import { handleAuthError } from '../middleware/errorHandler';
import { LeaveBillingService } from '../services/leaveBillingService';

const router: Router = Router();

// GET /api/leave-billing/summary/:messId - Get leave billing summary for a user
router.get('/summary/:messId', requireAuth, async (req: Request, res: Response, _next: NextFunction) => {
  try {
    const userId = (req as any).user.id;
    const { messId } = req.params;

    if (!messId) {
      return res.status(400).json({
        success: false,
        message: 'Mess ID is required'
      });
    }

    const result = await LeaveBillingService.getLeaveBillingSummary(userId, messId);

    return res.status(200).json(result);

  } catch (error) {
    console.error('Error getting leave billing summary:', error);
    return handleAuthError(res, error);
  }
});

// POST /api/leave-billing/process/:leaveId - Manually process leave billing (admin/mess-owner only)
router.post('/process/:leaveId', requireAuth, async (req: Request, res: Response, _next: NextFunction) => {
  try {
    const userId = (req as any).user.id;
    const userRole = (req as any).user.role;
    const { leaveId } = req.params;
    const { action } = req.body; // 'approve' or 'reject'

    if (userRole !== 'mess-owner' && userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only mess owners and admins can process leave billing.'
      });
    }

    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid action. Must be "approve" or "reject"'
      });
    }

    let result;
    if (action === 'approve') {
      result = await LeaveBillingService.processApprovedLeave(leaveId as string, userId);
    } else {
      result = await LeaveBillingService.processRejectedLeave(leaveId as string, userId, req.body.rejectionReason);
    }

    return res.status(200).json(result);

  } catch (error) {
    console.error('Error processing leave billing:', error);
    return handleAuthError(res, error);
  }
});

export default router;
