"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authController_1 = require("../controllers/authController");
const validation_1 = require("../middleware/validation");
const authValidator_1 = require("../validators/authValidator");
const router = (0, express_1.Router)();
// Register
router.post('/register', (0, validation_1.validate)(authValidator_1.registerSchema), async (req, res, next) => {
    try {
        await authController_1.AuthController.register(req, res);
    }
    catch (err) {
        next(err);
    }
});
// Login
router.post('/login', (0, validation_1.validate)(authValidator_1.loginSchema), async (req, res, next) => {
    try {
        await authController_1.AuthController.login(req, res);
    }
    catch (err) {
        next(err);
    }
});
// Send OTP
router.post('/send-otp', async (req, res, next) => {
    try {
        await authController_1.AuthController.resendOtp(req, res);
    }
    catch (err) {
        next(err);
    }
});
// Verify OTP for registration
router.post('/verify-otp', (0, validation_1.validate)(authValidator_1.verifyOtpSchema), async (req, res, next) => {
    try {
        await authController_1.AuthController.verifyOtp(req, res);
    }
    catch (err) {
        next(err);
    }
});
// Verify OTP for password reset
router.post('/verify-reset-otp', (0, validation_1.validate)(authValidator_1.verifyOtpSchema), async (req, res, next) => {
    try {
        await authController_1.AuthController.verifyResetOtp(req, res);
    }
    catch (err) {
        next(err);
    }
});
// Forgot Password
router.post('/forgot-password', (0, validation_1.validate)(authValidator_1.forgotPasswordSchema), async (req, res, next) => {
    try {
        await authController_1.AuthController.forgotPassword(req, res);
    }
    catch (err) {
        next(err);
    }
});
// Reset Password
router.post('/reset-password', (0, validation_1.validate)(authValidator_1.resetPasswordSchema), async (req, res, next) => {
    try {
        await authController_1.AuthController.resetPassword(req, res);
    }
    catch (err) {
        next(err);
    }
});
// Logout
router.post('/logout', async (req, res, next) => {
    try {
        await authController_1.AuthController.logout(req, res);
    }
    catch (err) {
        next(err);
    }
});
// Get Profile
router.get('/profile', async (req, res, next) => {
    try {
        await authController_1.AuthController.getProfile(req, res);
    }
    catch (err) {
        next(err);
    }
});
exports.default = router;
//# sourceMappingURL=auth.js.map