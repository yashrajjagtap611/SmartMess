// Mess Routes Barrel File
// This file exports all mess-related routes in an organized manner

import { Router } from 'express';
import messProfileRoutes from './messProfile';
import messMembershipRoutes from './messMembership';
import messUserRoutes from './messUser';
import messSearchRoutes from './messSearch';
import userManagementRoutes from './userManagement';
import messLeaveRoutes from './leaves';
import messLeaveManagementRoutes from './leaveManagement';
import messOffDayRoutes from './messOffDay';
import operatingHoursRoutes from './operatingHours';
// Subscription plans routes removed

const router: Router = Router();

// Mount sub-routes
router.use('/profile', messProfileRoutes);
router.use('/members', messMembershipRoutes);
router.use('/user', messUserRoutes);
router.use('/search', messSearchRoutes);
router.use('/user-management', userManagementRoutes);
router.use('/leaves', messLeaveRoutes);
router.use('/', messLeaveManagementRoutes);
router.use('/', messOffDayRoutes);
router.use('/', operatingHoursRoutes);
// Subscription plans routes removed

export default router;