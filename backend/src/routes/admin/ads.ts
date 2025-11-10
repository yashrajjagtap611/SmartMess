import { Router } from 'express';
import { AdminAdController } from '../../controllers/adminAdController';
import requireAuth from '../../middleware/requireAuth';
import { requireAdmin } from '../../middleware/admin';
import { generalRateLimiter } from '../../middleware/security';

const router: Router = Router();

// All routes require admin authentication
router.use(requireAuth);
router.use(requireAdmin);
router.use(generalRateLimiter);

// Settings
router.get('/settings', AdminAdController.getSettings);
router.put('/settings', AdminAdController.updateSettings);

// Campaign management
router.get('/campaigns', AdminAdController.getAllCampaigns);
router.post('/campaigns/:campaignId/approve', AdminAdController.approveCampaign);
router.post('/campaigns/:campaignId/reject', AdminAdController.rejectCampaign);

// Analytics
router.get('/analytics', AdminAdController.getAnalytics);

export default router;

