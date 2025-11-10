// Main Routes Index
// This file exports all route modules in an organized manner

import { Router } from 'express';
import authRoutes from './auth';
import messRoutes from './mess';
import messMembershipRoutes from './mess/messMembership';
import userRoutes from './user';
import adminRoutes from './admin';
import notificationRoutes from './notifications';
import messPhotoRoutes from './messPhoto';
import mealPlanRoutes from './mealPlan';
import mealRoutes from './meals';
import paymentSettingsRoutes from './paymentSettings';
import paymentRoutes from './payments';
import billingRoutes from './billing';
import paymentVerificationRoutes from './paymentVerification';
import feedbackRoutes from './feedback';
import messOwnerLeavesRoutes from '../api/mess-owner/leaves';
import userLeaveRequestsRoutes from './user/leaveRequests';
import leaveBillingRoutes from './leaveBilling';
import mealActivationRoutes from './mealActivation';
import messQRVerificationRoutes from './messQRVerification';
import publicMessProfileRoutes from './publicMessProfile';

import securitySettingsRoutes from './securitySettings';
import chatRoutes from './chat';
import pollRoutes from './polls';
import tutorialVideosRoutes from './tutorialVideos';
import creditManagementRoutes from './creditManagement';
import messBillingRoutes from './messBilling';
import razorpayPaymentRoutes from './payment';
import subscriptionCheckRoutes from './subscriptionCheck';
import freeTrialRoutes from './freeTrial';
import joinRequestsRoutes from './joinRequests';
import paymentRequestsRoutes from './paymentRequests';
import adsRoutes from './ads';

const router: Router = Router();

// Health check endpoint
router.get('/health', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'SmartMess API is running',
    timestamp: new Date().toISOString(),
    version: process.env['npm_package_version'] || '1.0.0'
  });
});

// Mount all route modules
router.use('/auth', authRoutes);
router.use('/mess', messRoutes);
// Backward-compatible alias exposing only members endpoints under /mess-owner/members
router.use('/mess-owner/members', messMembershipRoutes);
router.use('/mess-owner/leaves', messOwnerLeavesRoutes);
router.use('/user', userRoutes);
router.use('/user/leave-requests', userLeaveRequestsRoutes);
router.use('/admin', adminRoutes);
router.use('/notifications', notificationRoutes);
router.use('/mess-photo', messPhotoRoutes);
// Add alias for backward compatibility - mount under /mess/photo to avoid conflicts
router.use('/mess/photo', messPhotoRoutes);
router.use('/meal-plan', mealPlanRoutes);
router.use('/meals', mealRoutes);

router.use('/payment-settings', paymentSettingsRoutes);
router.use('/payments', paymentRoutes);
router.use('/billing', billingRoutes);
router.use('/payment-verification', paymentVerificationRoutes);
router.use('/security-settings', securitySettingsRoutes);
router.use('/feedback', feedbackRoutes);
router.use('/leave-billing', leaveBillingRoutes);
router.use('/meal-activation', mealActivationRoutes);
router.use('/mess-qr', messQRVerificationRoutes);
router.use('/public', publicMessProfileRoutes); // Public routes (no auth required)
router.use('/chat', chatRoutes);
router.use('/polls', pollRoutes);
router.use('/tutorial-videos', tutorialVideosRoutes);
router.use('/credit-management', creditManagementRoutes);
router.use('/mess-billing', messBillingRoutes);
router.use('/razorpay', razorpayPaymentRoutes);
router.use('/subscription-check', subscriptionCheckRoutes);
router.use('/free-trial', freeTrialRoutes);
router.use('/join-requests', joinRequestsRoutes);
router.use('/payment-requests', paymentRequestsRoutes);
router.use('/ads', adsRoutes);

export default router; 