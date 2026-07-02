import { Router } from 'express';
import * as authController from '../controllers/authController.js';
import { validate } from '../middleware/validate.js';
import { authenticate } from '../middleware/auth.js';
import { authLimiter, strictAuthLimiter } from '../middleware/rateLimiter.js';
import {
  registerValidator,
  loginValidator,
  otpRequestValidator,
  otpVerifyValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
  updateProfileValidator,
} from '../validators/authValidators.js';

const router = Router();

router.post('/register', authLimiter, registerValidator, validate, authController.register);
router.post('/login', authLimiter, loginValidator, validate, authController.login);
router.post('/admin-login', authLimiter, loginValidator, validate, authController.adminLogin);
router.post('/send-otp', authLimiter, otpRequestValidator, validate, authController.sendOtp);
router.post('/verify-otp', authLimiter, otpVerifyValidator, validate, authController.verifyOtp);
router.post('/refresh', authController.refresh);
router.post('/logout', authenticate, authController.logout);
router.post('/forgot-password', strictAuthLimiter, forgotPasswordValidator, validate, authController.forgotPasswordHandler);
router.post('/reset-password', strictAuthLimiter, resetPasswordValidator, validate, authController.resetPasswordHandler);
router.get('/profile', authenticate, authController.getProfile);
router.put('/profile', authenticate, updateProfileValidator, validate, authController.updateProfile);

export default router;
