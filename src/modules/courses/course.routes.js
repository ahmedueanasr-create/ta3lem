const express = require('express');
const auth = require('../../middleware/auth');
const { checkRole } = require('../../middleware/rbac');
const asyncHandler = require('../../utils/asyncHandler');
const { paginate, paginateResponse } = require('../../utils/paginate');
const { body } = require('express-validator');
const validate = require('../../middleware/validate');
const ROLES = require('../../utils/roles');
const courseService = require('./course.service');

const router = express.Router();
router.use(auth);

router.get('/', asyncHandler(async (req, res) => {
  const { limit, offset, page } = paginate(req);
  const { rows, count } = await courseService.list({ filters: req.query, limit, offset });
  res.json({ success: true, ...paginateResponse(rows, count, page, limit) });
}));

router.get('/:id', asyncHandler(async (req, res) => {
  const course = await courseService.getById(req.params.id);
  res.json({ success: true, data: course });
}));

router.post(
  '/',
  checkRole(ROLES.TEACHER, ROLES.PLATFORM_ADMIN),
  [body('title').trim().isLength({ min: 3 }), body('subject_id').isInt({ gt: 0 }), validate],
  asyncHandler(async (req, res) => {
    const course = await courseService.create(req.user.id, req.body);
    res.status(201).json({ success: true, data: course });
  }),
);

router.put('/:id', [body('title').optional().trim().isLength({ min: 3 }), validate], asyncHandler(async (req, res) => {
  const isAdmin = [ROLES.PLATFORM_ADMIN, ROLES.SUPER_ADMIN].includes(req.user.role.name);
  const course = await courseService.update(req.params.id, req.body, req.user.id, isAdmin);
  res.json({ success: true, data: course });
}));

router.delete('/:id', asyncHandler(async (req, res) => {
  const isAdmin = [ROLES.PLATFORM_ADMIN, ROLES.SUPER_ADMIN].includes(req.user.role.name);
  await courseService.remove(req.params.id, req.user.id, isAdmin);
  res.json({ success: true });
}));

module.exports = router;
