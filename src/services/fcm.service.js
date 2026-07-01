const logger = require('../config/logger');

let admin = null;
let initialized = false;

function init() {
  if (initialized) return;
  try {
    const serviceAccount = process.env.FCM_SERVICE_ACCOUNT;
    if (!serviceAccount) {
      logger.warn('FCM: FCM_SERVICE_ACCOUNT not set — push notifications disabled');
      return;
    }
    admin = require('firebase-admin');
    const credentials = JSON.parse(serviceAccount);
    admin.initializeApp({
      credential: admin.credential.cert(credentials),
    });
    initialized = true;
    logger.info('FCM: Firebase app initialized');
  } catch (err) {
    logger.error('FCM: Failed to initialize', { message: err.message });
    admin = null;
  }
}

async function sendPush(userId, title, body, data = {}) {
  if (!admin) {
    logger.debug('FCM: Skipping push — not initialized');
    return { status: 'skipped' };
  }

  const { DeviceToken } = require('../models');
  const tokens = await DeviceToken.findAll({
    where: { user_id: userId, is_active: true },
    attributes: ['token', 'platform'],
  });

  if (tokens.length === 0) {
    logger.debug(`FCM: No device tokens for user ${userId}`);
    return { status: 'no_tokens' };
  }

  const payload = {
    notification: { title, body },
    data: Object.fromEntries(Object.entries(data).map(([k, v]) => [k, String(v ?? '']) )),
  };

  const results = [];
  for (const t of tokens) {
    try {
      const res = await admin.messaging().send({ ...payload, token: t.token });
      results.push({ platform: t.platform, status: 'sent', response: res });
    } catch (err) {
      if (err.code === 'messaging/registration-token-not-registered' ||
          err.code === 'messaging/invalid-registration-token') {
        await DeviceToken.update({ is_active: false }, { where: { token: t.token } });
        logger.warn(`FCM: Deactivated invalid token for user ${userId}`);
      }
      results.push({ platform: t.platform, status: 'failed', error: err.code });
    }
  }
  return { status: 'done', results };
}

module.exports = { init, sendPush };
