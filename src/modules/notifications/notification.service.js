const { Notification } = require('../../models');
const waService = require('../whatsapp/whatsapp.service');
const { pub } = require('../../config/redis');
const logger = require('../../config/logger');

class NotificationService {
  /**
   * Send a notification across channels.
   * @param {object} opts { user, phone, type, title, body, data, channels: ['inapp','push','whatsapp'] }
   */
  async notify({ user, phone, type, title, body, data = {}, channels = ['inapp'] }) {
    const tasks = [];

    if (channels.includes('inapp') && user) {
      tasks.push(
        Notification.create({ user_id: user.id ?? user, type, title, body, data, channel: 'inapp' }),
      );
    }
    if (channels.includes('whatsapp') && phone) {
      tasks.push(waService.send(phone, `${title}\n\n${body}`));
    }
    if (channels.includes('push') && user) {
      // Push integration hook (FCM/APN) — emit event for downstream worker.
      tasks.push(pub.publish('push:notify', JSON.stringify({ user: user.id ?? user, title, body, data })));
    }

    const results = await Promise.allSettled(tasks);
    results
      .filter((r) => r.status === 'rejected')
      .forEach((r) => logger.error('Notification channel failed', { reason: r.reason?.message }));
    return results;
  }

  async listForUser(userId, { limit, offset, unreadOnly }) {
    const where = { user_id: userId };
    if (unreadOnly) where.read_at = null;
    const { rows, count } = await Notification.findAndCountAll({
      where,
      order: [['created_at', 'DESC']],
      limit,
      offset,
    });
    return { rows, count };
  }

  async markRead(userId, notificationId) {
    const n = await Notification.findOne({ where: { id: notificationId, user_id: userId } });
    if (!n) return null;
    if (!n.read_at) await n.update({ read_at: new Date() });
    return n;
  }

  async markAllRead(userId) {
    await Notification.update({ read_at: new Date() }, { where: { user_id: userId, read_at: null } });
    return true;
  }
}

module.exports = new NotificationService();
