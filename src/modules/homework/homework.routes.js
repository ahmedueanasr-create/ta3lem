const express = require('express');
const auth = require('../../middleware/auth');
const { checkRole } = require('../../middleware/rbac');
const asyncHandler = require('../../utils/asyncHandler');
const { paginate, paginateResponse } = require('../../utils/paginate');
const { body } = require('express-validator');
const validate = require('../../middleware/validate');
const ROLES = require('../../utils/roles');
const homeworkService = require('./homework.service');

const router = express.Router();
router.use(auth);

router.get('/', asyncHandler(async (req, res) => {
  const { limit, offset, page } = paginate(req);
  const { rows, count } = await homeworkService.list({ filters: req.query, limit, offset });
  res.json({ success: true, ...paginateResponse(rows, count, page, limit) });
}));

router.get('/:id', asyncHandler(async (req, res) => {
  const hw = await homeworkService.getById(req.params.id);
  res.json({ success: true, data: hw });
}));

router.post(
  '/',
  checkRole(ROLES.TEACHER, ROLES.PLATFORM_ADMIN),
  [body('title').trim().isLength({ min: 3 }), body('due_at').isISO8601(), validate],
  asyncHandler(async (req, res) => {
    const hw = await homeworkService.create(req.user.id, req.body);
    res.status(201).json({ success: true, data: hw });
  }),
);

router.post(
  '/:id/submit',
  checkRole(ROLES.STUDENT),
  [body('content').optional().isString(), validate],
  asyncHandler(async (req, res) => {
    const sub = await homeworkService.submit(req.params.id, req.user.id, {
      content: req.body.content,
      fileId: req.body.file_id,
    });
    res.status(201).json({ success: true, data: sub });
  }),
);

router.post(
  '/submissions/:id/grade',
  checkRole(ROLES.TEACHER, ROLES.TEACHERS_SUPERVISOR, ROLES.PLATFORM_ADMIN),
  [body('score').isFloat({ min: 0, max: 100 }), body('feedback').optional().isString(), validate],
  asyncHandler(async (req, res) => {
    const sub = await homeworkService.grade(req.params.id, req.body);
    res.json({ success: true, data: sub });
  }),
);

module.exports = router;
