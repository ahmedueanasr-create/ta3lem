const express = require('express');
const auth = require('../../middleware/auth');
const { checkRole } = require('../../middleware/rbac');
const asyncHandler = require('../../utils/asyncHandler');
const waService = require('../whatsapp/whatsapp.service');
const ROLES = require('../../utils/roles');

const router = express.Router();
router.use(auth, checkRole(ROLES.PLATFORM_ADMIN, ROLES.SUPER_ADMIN));

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

router.post('/whatsapp/pair', asyncHandler(async (req, res) => {
  const { phone } = req.body;
  if (!phone) {
    return res.status(400).json({ success: false, message: 'رقم الهاتف مطلوب' });
  }
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

module.exports = router;
