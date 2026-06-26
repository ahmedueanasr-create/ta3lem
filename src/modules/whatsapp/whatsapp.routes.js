const express = require('express');
const auth = require('../../middleware/auth');
const { checkRole } = require('../../middleware/rbac');
const waService = require('./whatsapp.service');
const { WhatsAppMessage } = require('../../models');
const asyncHandler = require('../../utils/asyncHandler');
const { body } = require('express-validator');
const validate = require('../../middleware/validate');
const { paginate, paginateResponse } = require('../../utils/paginate');

const router = express.Router();
router.use(auth);

router.get('/status', (_req, res) =>
  res.json({ success: true, data: { ready: waService.isReady() } }),
);

router.post(
  '/send',
  checkRole('platform_admin', 'teachers_supervisor', 'student_supervisor', 'teacher'),
  [body('phone').notEmpty(), body('message').notEmpty(), validate],
  asyncHandler(async (req, res) => {
    const result = await waService.send(req.body.phone, req.body.message);
    res.json({ success: true, data: result });
  }),
);

router.post(
  '/broadcast',
  checkRole('platform_admin'),
  [body('phones').isArray({ min: 1 }), body('message').notEmpty(), validate],
  asyncHandler(async (req, res) => {
    const result = await waService.broadcast(req.body.phones, req.body.message);
    res.json({ success: true, data: result });
  }),
);

router.get(
  '/messages',
  checkRole('platform_admin', 'teachers_supervisor', 'student_supervisor'),
  asyncHandler(async (req, res) => {
    const { limit, offset, page } = paginate(req);
    const where = {};
    if (req.query.direction) where.direction = req.query.direction;
    if (req.query.status) where.status = req.query.status;
    const { rows, count } = await WhatsAppMessage.findAndCountAll({
      where,
      order: [['created_at', 'DESC']],
      limit,
      offset,
    });
    res.json({ success: true, ...paginateResponse(rows, count, page, limit) });
  }),
);

module.exports = router;
