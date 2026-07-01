const express = require('express');

const mountRoutes = () => {
  const router = express.Router();

  router.use('/auth', require('./auth/auth.routes'));
  router.use('/users', require('./users/user.routes'));
  router.use('/wallet', require('./wallet/wallet.routes'));
  router.use('/teachers', require('./teachers/teacher.routes'));
  router.use('/subjects', require('./subjects/subject.routes'));
  router.use('/courses', require('./courses/course.routes'));
  router.use('/sessions', require('./sessions/session.routes'));
  router.use('/notifications', require('./notifications/notification.routes'));
  router.use('/devices', require('./notifications/device.routes'));
  router.use('/whatsapp', require('./whatsapp/whatsapp.routes'));
  router.use('/exams', require('./exams/exam.routes'));
  router.use('/homework', require('./homework/homework.routes'));
  router.use('/files', require('./files/file.routes'));
  router.use('/reports', require('./reports/report.routes'));
  router.use('/settings', require('./settings/settings.routes'));
  router.use('/ai', require('./ai/ai.routes'));
  router.use('/parent', require('./parent/parent.routes'));
  router.use('/certificates', require('./certificates/certificate.routes'));
  router.use('/app', require('./update/update.routes'));

  // Public webhooks (no auth) — LiveKit Egress recording callback
  router.post('/webhooks/recording/ready', require('./sessions/recording.routes').webhook);

  return router;
};

module.exports = mountRoutes;
