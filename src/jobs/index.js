const cron = require('node-cron');
const { Op } = require('sequelize');
const { Session, SessionEnrollment, User, SessionAttendance } = require('../models');
const notificationService = require('../modules/notifications/notification.service');
const waService = require('../modules/whatsapp/whatsapp.service');
const logger = require('../config/logger');
const { redis } = require('../config/redis');

const reminderKey = (sessionId, minutes) => `remind:${sessionId}:${minutes}`;

/**
 * For every scheduled session starting within the next ~16 minutes,
 * send a 15-min reminder (only once per session, guarded by Redis flag).
 */
cron.schedule('*/1 * * * *', async () => {
  try {
    const now = new Date();
    const from = new Date(now.getTime() + 13 * 60 * 1000);
    const to = new Date(now.getTime() + 17 * 60 * 1000);

    const sessions = await Session.findAll({
      where: { status: 'scheduled', scheduled_at: { [Op.between]: [from, to] } },
      include: [{ model: SessionEnrollment, as: 'enrollments', include: [{ model: User, as: 'user' }] }],
    });

    for (const s of sessions) {
      const already = await redis.set(reminderKey(s.id, 15), '1', 'NX', 'EX', 3600);
      if (!already) continue;
      for (const e of s.enrollments) {
        await notificationService.notify({
          user: e.user,
          phone: e.user.phone,
          type: 'session_reminder_15',
          title: `تذكير: حصة ${s.title} بعد 15 دقيقة`,
          body: `الحصة ستبدأ في ${new Date(s.scheduled_at).toLocaleTimeString()}.`,
          data: { sessionId: s.id },
          channels: ['inapp', 'push', 'whatsapp'],
        });
      }
      logger.info(`15-min reminders sent for session #${s.id}`);
    }
  } catch (err) {
    logger.error('cron 15min reminder error', { message: err.message });
  }
});

/**
 * 2-minute reminder.
 */
cron.schedule('*/1 * * * *', async () => {
  try {
    const now = new Date();
    const from = new Date(now.getTime() + 60 * 1000);
    const to = new Date(now.getTime() + 3 * 60 * 1000);

    const sessions = await Session.findAll({
      where: { status: 'scheduled', scheduled_at: { [Op.between]: [from, to] } },
      include: [{ model: SessionEnrollment, as: 'enrollments', include: [{ model: User, as: 'user' }] }],
    });

    for (const s of sessions) {
      const already = await redis.set(reminderKey(s.id, 2), '1', 'NX', 'EX', 3600);
      if (!already) continue;
      for (const e of s.enrollments) {
        await notificationService.notify({
          user: e.user,
          phone: e.user.phone,
          type: 'session_reminder_2',
          title: `حصة ${s.title} تبدأ بعد دقيقتين`,
          body: 'استعد للدخول الآن.',
          data: { sessionId: s.id },
          channels: ['inapp', 'push', 'whatsapp'],
        });
      }
      logger.info(`2-min reminders sent for session #${s.id}`);
    }
  } catch (err) {
    logger.error('cron 2min reminder error', { message: err.message });
  }
});

/**
 * Daily attendance summary report flag for student supervisors (placeholder).
 */
cron.schedule('0 8 * * *', async () => {
  logger.info('Daily attendance report job triggered');
});

function startJobs() {
  logger.info('Cron jobs scheduled');
}

module.exports = { startJobs };
