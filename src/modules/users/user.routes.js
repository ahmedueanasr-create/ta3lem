const express = require('express');
const auth = require('../../middleware/auth');
const { checkRole } = require('../../middleware/rbac');
const asyncHandler = require('../../utils/asyncHandler');
const { paginate, paginateResponse } = require('../../utils/paginate');
const userService = require('./user.service');
const authService = require('../auth/auth.service');
const walletService = require('../wallet/wallet.service');
const { body } = require('express-validator');
const validate = require('../../middleware/validate');
const ROLES = require('../../utils/roles');

const router = express.Router();
router.use(auth, checkRole(ROLES.PLATFORM_ADMIN, ROLES.SUPER_ADMIN, ROLES.TEACHERS_SUPERVISOR, ROLES.STUDENT_SUPERVISOR));

router.get('/', asyncHandler(async (req, res) => {
  const { limit, offset, page } = paginate(req);
  const { rows, count } = await userService.list({ filters: req.query, limit, offset });
  res.json({ success: true, ...paginateResponse(rows, count, page, limit) });
}));

router.get('/:id', asyncHandler(async (req, res) => {
  const user = await userService.getById(req.params.id);
  res.json({ success: true, data: user });
}));

const createRules = [
  body('name').trim().isLength({ min: 2 }),
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 }),
  body('phone').matches(/^01[0-9]{9}$/).withMessage('رقم هاتف غير صحيح'),
  body('role').isIn(['student', 'teacher', 'teachers_supervisor', 'student_supervisor']),
  validate,
];

router.post('/', checkRole(ROLES.PLATFORM_ADMIN, ROLES.SUPER_ADMIN), createRules, asyncHandler(async (req, res) => {
  const user = await authService.adminCreateUser(req.body);
  res.status(201).json({ success: true, data: { id: user.id, email: user.email, mustChangePassword: user.must_change_password } });
}));

const updateRules = [
  body('name').optional().isLength({ min: 2 }),
  body('phone').optional().isString(),
  body('status').optional().isIn(['active', 'inactive', 'suspended', 'pending']),
  validate,
];

router.put('/:id', updateRules, asyncHandler(async (req, res) => {
  const user = await userService.update(req.params.id, req.body);
  res.json({ success: true, data: user });
}));

router.patch('/:id/status', [body('status').isIn(['active', 'inactive', 'suspended', 'pending']), validate], asyncHandler(async (req, res) => {
  const user = await userService.setStatus(req.params.id, req.body.status);
  res.json({ success: true, data: user });
}));

// Admin manually charges any student's wallet
router.post('/:id/wallet/charge', checkRole(ROLES.PLATFORM_ADMIN, ROLES.SUPER_ADMIN), [body('amount').isFloat({ gt: 0 }), body('reason').optional().isString(), validate], asyncHandler(async (req, res) => {
  const { wallet, balance } = await walletService.charge(req.params.id, req.body.amount, req.body.reason || 'Admin charge');
  res.json({ success: true, data: { wallet, balance } });
}));

router.delete('/:id', checkRole(ROLES.PLATFORM_ADMIN, ROLES.SUPER_ADMIN), asyncHandler(async (req, res) => {
  await userService.remove(req.params.id);
  res.json({ success: true });
}));

module.exports = router;
