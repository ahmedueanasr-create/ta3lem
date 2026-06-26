const express = require('express');
const { authLimiter } = require('../../middleware/rateLimit');
const auth = require('../../middleware/auth');
const ROLES = require('../../utils/roles');
const { checkRole } = require('../../middleware/rbac');
const ctrl = require('./auth.controller');
const {
  registerRules, loginRules, verifyOtpRules, refreshRules,
  forgotRules, resetRules, changePwdRules, onboardingRules,
} = require('./auth.validator');

const router = express.Router();

router.post('/register', authLimiter, registerRules, ctrl.register);
router.post('/login', authLimiter, loginRules, ctrl.login);
router.post('/verify-otp', authLimiter, verifyOtpRules, ctrl.verifyOtp);
router.post('/resend-otp', authLimiter, ctrl.resendOtp);
router.post('/refresh', authLimiter, refreshRules, ctrl.refresh);
router.post('/logout', ctrl.logout);
router.get('/me', auth, ctrl.me);
router.post('/forgot-password', authLimiter, forgotRules, ctrl.forgotPassword);
router.post('/reset-password', authLimiter, resetRules, ctrl.resetPassword);
router.post('/change-password', auth, changePwdRules, ctrl.changePassword);
router.post('/teacher-onboarding', auth, onboardingRules, ctrl.teacherOnboarding);

module.exports = router;
