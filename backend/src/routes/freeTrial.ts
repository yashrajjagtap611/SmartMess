import express from 'express';
import { freeTrialController } from '../controllers/freeTrialController';
import { auth } from '../middleware';

const router: express.Router = express.Router();

// All routes require authentication
router.use(auth);

// Check if free trial is available
router.get('/check-availability', freeTrialController.checkTrialAvailability);

// Activate free trial
router.post('/activate', freeTrialController.activateFreeTrial);

export default router;


