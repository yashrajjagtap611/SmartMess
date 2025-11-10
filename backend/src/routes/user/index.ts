// User Routes Barrel File
// This file exports all user-related routes in an organized manner

import { Router } from 'express';
import userProfileRoutes from './userProfile';
import userSettingsRoutes from './userSettings';
import userPreferencesRoutes from './userPreferences';
import userActivityRoutes from './userActivity';

const router: Router = Router();

// Mount sub-routes
router.use('/profile', userProfileRoutes);
router.use('/settings', userSettingsRoutes);
router.use('/preferences', userPreferencesRoutes);
router.use('/activity', userActivityRoutes);

export default router; 