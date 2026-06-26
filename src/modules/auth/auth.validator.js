const { body } = require('express-validator');
const validate = require('../../middleware/validate');

const registerRules = [
  body('name').trim().isLength({ min: 5 }).withMessage('الاسم مطلوب'),
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 }).withMessage('كلمة المرور يجب أن تكون 8 أحرف على الأقل'),
  body('phone').matches(/^01[0-9]{9}$/).withMessage('رقم هاتف غير صحيح (مثال: 01012345678)'),
  body('guardian_name').trim().isLength({ min: 3 }).withMessage('اسم ولي الأمر مطلوب'),
  body('guardian_phone').matches(/^01[0-9]{9}$/).withMessage('رقم ولي الأمر غير صحيح'),
  body('grade').optional().isString(),
  validate,
];

const loginRules = [body('email').isEmail().normalizeEmail(), body('password').notEmpty(), validate];

const verifyOtpRules = [
  body('tempToken').notEmpty(),
  body('otp').isLength({ min: 6, max: 6 }).withMessage('الرمز必须 6 أرقام'),
  validate,
];

const refreshRules = [body('refreshToken').notEmpty(), validate];

const forgotRules = [body('email').isEmail().normalizeEmail(), validate];

const resetRules = [body('token').notEmpty(), body('password').isLength({ min: 8 }), validate];

const changePwdRules = [body('oldPassword').notEmpty(), body('newPassword').isLength({ min: 8 }), validate];

const onboardingRules = [
  body('health_status').trim().isLength({ min: 3 }).withMessage('الحالة الصحية مطلوبة'),
  body('newPassword').isLength({ min: 8 }).withMessage('كلمة المرور 8 أحرف على الأقل'),
  validate,
];

module.exports = {
  registerRules, loginRules, verifyOtpRules, refreshRules,
  forgotRules, resetRules, changePwdRules, onboardingRules,
};
