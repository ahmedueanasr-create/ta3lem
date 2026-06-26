const { body } = require('express-validator');
const validate = require('../../middleware/validate');

const registerRules = [
  body('fullName').trim().isLength({ min: 2 }).withMessage('الاسم الكامل مطلوب'),
  body('phone').matches(/^01[0-9]{9}$/).withMessage('رقم هاتف غير صحيح (مثال: 01012345678)'),
  body('password').isLength({ min: 8 }).withMessage('كلمة المرور يجب أن تكون 8 أحرف على الأقل'),
  body('email').optional().isEmail().normalizeEmail(),
  body('relationType').optional().isIn(['أب', 'أم', 'وصي', 'غيره']),
  body('notificationPreference').optional().isIn(['sms', 'whatsapp', 'email']),
  body('studentCode').optional().isString().isLength({ min: 8, max: 8 }).withMessage('رمز الربط غير صحيح'),
  validate,
];

const linkStudentRules = [
  body('studentCode').isString().isLength({ min: 8, max: 8 }).withMessage('رمز الربط غير صحيح'),
  validate,
];

module.exports = { registerRules, linkStudentRules };
