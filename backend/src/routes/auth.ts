import { Router, Request, Response, NextFunction } from 'express';
import { AuthController } from '../controllers/authController';
import { validate } from '../middleware/validation';
import { registerSchema, loginSchema, verifyOtpSchema, forgotPasswordSchema, resetPasswordSchema } from '../validators/authValidator';

const router: Router = Router();

// Register
router.post('/register', validate(registerSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    await AuthController.register(req, res);
  } catch (err) {
    next(err);
  }
});

// Login
router.post('/login', validate(loginSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    await AuthController.login(req, res);
  } catch (err) {
    next(err);
  }
});

// Send OTP
router.post('/send-otp', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await AuthController.resendOtp(req, res);
  } catch (err) {
    next(err);
  }
});

// Verify OTP for registration
router.post('/verify-otp', validate(verifyOtpSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    await AuthController.verifyOtp(req, res);
  } catch (err) {
    next(err);
  }
});

// Verify OTP for password reset
router.post('/verify-reset-otp', validate(verifyOtpSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    await AuthController.verifyResetOtp(req, res);
  } catch (err) {
    next(err);
  }
});

// Forgot Password
router.post('/forgot-password', validate(forgotPasswordSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    await AuthController.forgotPassword(req, res);
  } catch (err) {
    next(err);
  }
});

// Reset Password
router.post('/reset-password', validate(resetPasswordSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    await AuthController.resetPassword(req, res);
  } catch (err) {
    next(err);
  }
});

// Logout
router.post('/logout', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await AuthController.logout(req, res);
  } catch (err) {
    next(err);
  }
});

// Get Profile
router.get('/profile', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await AuthController.getProfile(req, res);
  } catch (err) {
    next(err);
  }
});

export default router; 