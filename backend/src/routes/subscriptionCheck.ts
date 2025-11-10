import express from 'express';
import { subscriptionCheckController } from '../controllers/subscriptionCheckController';
import { auth } from '../middleware';

const router: express.Router = express.Router();

// All routes require authentication
router.use(auth);

// Get current subscription status
router.get('/status', subscriptionCheckController.getSubscriptionStatus);

// Check if can access a specific module
router.get('/check-module/:module', subscriptionCheckController.checkModuleAccess);

export default router;


