const express = require('express');
const auth = require('../../middleware/auth');
const { checkRole } = require('../../middleware/rbac');
const asyncHandler = require('../../utils/asyncHandler');
const { paginate, paginateResponse } = require('../../utils/paginate');
const { body } = require('express-validator');
const validate = require('../../middleware/validate');
const ROLES = require('../../utils/roles');
const teacherService = require('./teacher.service');

const router = express.Router();
router.use(auth);

router.get('/', asyncHandler(async (req, res) => {
  const { limit, offset, page } = paginate(req);
  const { rows, count } = await teacherService.list({ filters: req.query, limit, offset });
  res.json({ success: true, ...paginateResponse(rows, count, page, limit) });
}));

router.get('/:id', asyncHandler(async (req, res) => {
  const teacher = await teacherService.getById(req.params.id);
  res.json({ success: true, data: teacher });
}));

router.post(
  '/:id/approve',
  checkRole(ROLES.TEACHERS_SUPERVISOR, ROLES.PLATFORM_ADMIN, ROLES.SUPER_ADMIN),
  asyncHandler(async (req, res) => {
    const teacher = await teacherService.approve(req.params.id, req.user.id);
    res.json({ success: true, data: teacher });
  }),
);

router.post(
  '/:id/reject',
  checkRole(ROLES.TEACHERS_SUPERVISOR, ROLES.PLATFORM_ADMIN, ROLES.SUPER_ADMIN),
  asyncHandler(async (req, res) => {
    const teacher = await teacherService.reject(req.params.id);
    res.json({ success: true, data: teacher });
  }),
);

const pricingRules = [
  body('session_price').optional().isFloat({ min: 0 }),
  body('private_session_price').optional().isFloat({ min: 0 }),
  body('monthly_price').optional().isFloat({ min: 0 }),
  body('yearly_price').optional().isFloat({ min: 0 }),
  validate,
];

router.put(
  '/:id/pricing',
  checkRole(ROLES.PLATFORM_ADMIN, ROLES.SUPER_ADMIN, ROLES.TEACHER),
  pricingRules,
  asyncHandler(async (req, res) => {
    const isAdmin = [ROLES.PLATFORM_ADMIN, ROLES.SUPER_ADMIN].includes(req.user.role.name);
    if (req.user.role.name === ROLES.TEACHER && String(req.user.id) !== String(req.params.id)) {
      return res.status(403).json({ success: false, message: 'Not allowed' });
    }
    const pricing = await teacherService.updatePricing(req.params.id, req.body);
    res.json({ success: true, data: pricing });
  }),
);

module.exports = router;
