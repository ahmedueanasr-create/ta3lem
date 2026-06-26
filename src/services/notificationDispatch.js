const logger = require('../config/logger');
const emailService = require('./email.service');

// WhatsApp service — lazily required to avoid crash if Baileys missing
let waService = null;
function getWaService() {
  if (!waService) {
    try { waService = require('../modules/whatsapp/whatsapp.service'); } catch (e) { logger.warn('WhatsApp service unavailable'); }
  }
  return waService;
}

class NotificationDispatch {
  async dispatch(notification) {
    const { user, email, phone, channels = [], title, body, data } = notification;
    const results = [];

    if (channels.includes('whatsapp') && phone) {
      const wa = getWaService();
      if (wa) {
        try {
          const r = await wa.send(phone, `${title}\n\n${body}`);
          results.push({ channel: 'whatsapp', status: r.status });
        } catch (e) {
          logger.error('WhatsApp dispatch failed', { error: e.message });
          results.push({ channel: 'whatsapp', status: 'failed', error: e.message });
        }
      }
    }

    if (channels.includes('email') && email) {
      try {
        const r = await emailService.sendNotification(email, { title, body, data });
        results.push({ channel: 'email', status: r.status });
      } catch (e) {
        logger.error('Email dispatch failed', { error: e.message });
        results.push({ channel: 'email', status: 'failed', error: e.message });
      }
    }

    return results;
  }
}

module.exports = new NotificationDispatch();
