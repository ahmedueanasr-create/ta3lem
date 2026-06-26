const express = require('express');
const auth = require('../../middleware/auth');
const asyncHandler = require('../../utils/asyncHandler');
const { paginate, paginateResponse } = require('../../utils/paginate');
const notificationService = require('./notification.service');

const router = express.Router();
router.use(auth);

router.get('/', asyncHandler(async (req, res) => {
  const { limit, offset, page } = paginate(req);
  const { rows, count } = await notificationService.listForUser(req.user.id, {
    limit,
    offset,
    unreadOnly: req.query.unread === 'true',
  });
  res.json({ success: true, ...paginateResponse(rows, count, page, limit) });
}));

router.patch('/:id/read', asyncHandler(async (req, res) => {
  const n = await notificationService.markRead(req.user.id, req.params.id);
  if (!n) return res.status(404).json({ success: false, message: 'Not found' });
  res.json({ success: true, data: n });
}));

router.post('/read-all', asyncHandler(async (req, res) => {
  await notificationService.markAllRead(req.user.id);
  res.json({ success: true });
}));

module.exports = router;
