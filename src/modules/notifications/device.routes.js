const express = require('express');
const auth = require('../../middleware/auth');
const asyncHandler = require('../../utils/asyncHandler');
const { DeviceToken } = require('../../models');

const router = express.Router();
router.use(auth);

// Register a device token
router.post('/register', asyncHandler(async (req, res) => {
  const { token, platform, device_name } = req.body;
  if (!token) return res.status(400).json({ success: false, message: 'Token is required' });

  const validPlatforms = ['android', 'ios', 'web'];
  const plat = validPlatforms.includes(platform) ? platform : 'android';

  // Upsert: one token per device (identified by token string)
  const [record, created] = await DeviceToken.upsert({
    user_id: req.user.id,
    token,
    platform: plat,
    device_name: device_name || null,
    is_active: true,
  });

  res.json({ success: true, data: { id: record.id, created } });
}));

// List tokens for current user
router.get('/', asyncHandler(async (req, res) => {
  const tokens = await DeviceToken.findAll({
    where: { user_id: req.user.id },
    attributes: ['id', 'token', 'platform', 'device_name', 'is_active', 'created_at'],
    order: [['created_at', 'DESC']],
  });
  res.json({ success: true, data: tokens });
}));

// Delete (deactivate) a token
router.delete('/:id', asyncHandler(async (req, res) => {
  const token = await DeviceToken.findOne({ where: { id: req.params.id, user_id: req.user.id } });
  if (!token) return res.status(404).json({ success: false, message: 'Token not found' });
  await token.update({ is_active: false });
  res.json({ success: true });
}));

// Delete by token value (for when app detects an invalid token)
router.post('/unregister', asyncHandler(async (req, res) => {
  const { token } = req.body;
  if (!token) return res.status(400).json({ success: false, message: 'Token is required' });
  await DeviceToken.update({ is_active: false }, { where: { token, user_id: req.user.id } });
  res.json({ success: true });
}));

module.exports = router;
