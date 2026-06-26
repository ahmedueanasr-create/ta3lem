const express = require('express');
const auth = require('../../middleware/auth');
const { checkRole } = require('../../middleware/rbac');
const asyncHandler = require('../../utils/asyncHandler');
const { paginate, paginateResponse } = require('../../utils/paginate');
const { body } = require('express-validator');
const validate = require('../../middleware/validate');
const ROLES = require('../../utils/roles');
const examService = require('./exam.service');

const router = express.Router();
router.use(auth);

router.get('/', asyncHandler(async (req, res) => {
  const { limit, offset, page } = paginate(req);
  const { rows, count } = await examService.list({ filters: req.query, limit, offset });
  res.json({ success: true, ...paginateResponse(rows, count, page, limit) });
}));

router.get('/:id', asyncHandler(async (req, res) => {
  const exam = await examService.getById(req.params.id);
  res.json({ success: true, data: exam });
}));

router.post(
  '/',
  checkRole(ROLES.TEACHER, ROLES.PLATFORM_ADMIN, ROLES.SUPER_ADMIN),
  [body('title').trim().isLength({ min: 3 }), validate],
  asyncHandler(async (req, res) => {
    const exam = await examService.create(req.body);
    res.status(201).json({ success: true, data: exam });
  }),
);

router.post('/:id/publish', checkRole(ROLES.TEACHER, ROLES.PLATFORM_ADMIN), asyncHandler(async (req, res) => {
  const exam = await examService.getById(req.params.id, false);
  await exam.update({ is_published: true });
  res.json({ success: true, data: exam });
}));

router.post('/:id/attempts', checkRole(ROLES.STUDENT), asyncHandler(async (req, res) => {
  const attempt = await examService.startAttempt(req.params.id, req.user.id);
  res.status(201).json({ success: true, data: attempt });
}));

router.post(
  '/attempts/:attemptId/submit',
  checkRole(ROLES.STUDENT),
  [body('answers').isArray(), validate],
  asyncHandler(async (req, res) => {
    const result = await examService.submitAttempt(req.params.attemptId, req.user.id, req.body.answers);
    res.json({ success: true, data: result });
  }),
);

router.get('/attempts/history', checkRole(ROLES.STUDENT), asyncHandler(async (req, res) => {
  const { limit, offset, page } = paginate(req);
  const { rows, count } = await examService.myAttempts(req.user.id, { limit, offset });
  res.json({ success: true, ...paginateResponse(rows, count, page, limit) });
}));

module.exports = router;
