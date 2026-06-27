const express = require('express');
const auth = require('../../middleware/auth');
const { checkRole } = require('../../middleware/rbac');
const asyncHandler = require('../../utils/asyncHandler');
const { body } = require('express-validator');
const validate = require('../../middleware/validate');
const ApiError = require('../../utils/ApiError');
const waService = require('../whatsapp/whatsapp.service');
const settingsService = require('./settings.service');
const ROLES = require('../../utils/roles');

const router = express.Router();
router.use(auth, checkRole(ROLES.PLATFORM_ADMIN, ROLES.SUPER_ADMIN));

// WhatsApp status
router.get('/whatsapp/status', (req, res) => {
  res.json({
    success: true,
    data: {
      ready: waService.isReady(),
      status: waService.getStatus(),
      qr: waService.getLastQr(),
      pairingCode: waService.getPairingCode(),
    },
  });
});

// SSE real-time QR stream
router.get('/whatsapp/qr-stream', (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
  });

  const send = (type, payload) => {
    res.write(`data: ${JSON.stringify({ type, ...payload })}\n\n`);
  };

  send('status', {
    ready: waService.isReady(),
    status: waService.getStatus(),
    qr: waService.getLastQr(),
    pairingCode: waService.getPairingCode(),
  });

  const interval = setInterval(() => {
    send('ping', { ts: Date.now() });
  }, 15000);

  const unsubscribeQr = waService.onQr((qr) => {
    send('qr', { qr });
    send('status', { ready: false, status: 'awaiting_scan', qr, pairingCode: null });
  });

  const unsubscribeStatus = waService.onStatusChange((status) => {
    const ready = status === 'connected';
    send('status', {
      ready,
      status,
      qr: ready ? null : waService.getLastQr(),
      pairingCode: ready ? null : waService.getPairingCode(),
    });
  });

  req.on('close', () => {
    clearInterval(interval);
    unsubscribeQr();
    unsubscribeStatus();
  });
});

// WhatsApp pair
router.post('/whatsapp/pair', asyncHandler(async (req, res) => {
  const { phone } = req.body;
  if (!phone) throw new ApiError(400, 'رقم الهاتف مطلوب');
  if (waService.isReady()) throw new ApiError(400, 'واتساب متصل بالفعل');
  const code = await waService.requestPairingCode(phone);
  res.json({ success: true, data: { pairingCode: code, phone } });
}));

router.post('/whatsapp/restart', asyncHandler(async (req, res) => {
  await waService.restart();
  res.json({ success: true, message: 'WhatsApp restarting...' });
}));

router.post('/whatsapp/logout', asyncHandler(async (req, res) => {
  await waService.logout();
  res.json({ success: true, message: 'Session deleted, new QR will be generated.' });
}));

// Platform settings (fallback API URL, etc.)
router.get('/', (req, res) => {
  res.json({ success: true, data: settingsService.getAll() });
});

router.put(
  '/',
  asyncHandler(async (req, res) => {
    const allowed = ['waFallbackApiUrl'];
    const updates = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }
    const result = settingsService.update(updates);
    res.json({ success: true, data: result });
  }),
);

// Test fallback WhatsApp API
router.post(
  '/whatsapp/test-fallback',
  [body('phone').notEmpty(), body('message').notEmpty(), validate],
  asyncHandler(async (req, res) => {
    const result = await settingsService.testFallback(req.body.phone, req.body.message);
    res.json({ success: true, data: result });
  }),
);

module.exports = router;
