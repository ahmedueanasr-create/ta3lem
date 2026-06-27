const express = require('express');
const auth = require('../../middleware/auth');
const { checkRole, checkPermission } = require('../../middleware/rbac');
const asyncHandler = require('../../utils/asyncHandler');
const { paginate, paginateResponse } = require('../../utils/paginate');
const { body } = require('express-validator');
const validate = require('../../middleware/validate');
const ROLES = require('../../utils/roles');
const sessionService = require('./session.service');

const router = express.Router();
router.use(auth);

router.get('/', asyncHandler(async (req, res) => {
  const { limit, offset, page } = paginate(req);
  const { rows, count } = await sessionService.list({
    filters: req.query,
    limit,
    offset,
  });
  res.json({ success: true, ...paginateResponse(rows, count, page, limit) });
}));

router.get('/:id', asyncHandler(async (req, res) => {
  const session = await sessionService.getById(req.params.id);
  res.json({ success: true, data: session });
}));

const createRules = [
  body('title').trim().isLength({ min: 3 }),
  body('subject_id').isInt({ gt: 0 }),
  body('scheduled_at').isISO8601(),
  body('price').optional().isFloat({ min: 0 }),
  validate,
];

router.post(
  '/',
  checkRole(ROLES.TEACHER, ROLES.PLATFORM_ADMIN),
  createRules,
  asyncHandler(async (req, res) => {
    const session = await sessionService.create(req.user.id, req.body);
    res.status(201).json({ success: true, data: session });
  }),
);

router.post(
  '/:id/start',
  checkRole(ROLES.TEACHER, ROLES.PLATFORM_ADMIN),
  asyncHandler(async (req, res) => {
    const result = await sessionService.start(req.user.id, req.params.id);
    res.json({ success: true, data: result });
  }),
);

router.post(
  '/:id/end',
  checkRole(ROLES.TEACHER, ROLES.PLATFORM_ADMIN),
  asyncHandler(async (req, res) => {
    const session = await sessionService.end(req.user.id, req.params.id);
    res.json({ success: true, data: session });
  }),
);

router.post(
  '/:id/join',
  checkRole(ROLES.STUDENT, ROLES.PLATFORM_ADMIN),
  asyncHandler(async (req, res) => {
    const result = await sessionService.join(req.user.id, req.params.id);
    res.json({ success: true, data: result });
  }),
);

router.post(
  '/:id/enroll',
  checkRole(ROLES.STUDENT),
  asyncHandler(async (req, res) => {
    const enrollment = await sessionService.enroll(req.user.id, req.params.id);
    res.json({ success: true, data: enrollment });
  }),
);

router.post(
  '/:id/cancel',
  asyncHandler(async (req, res) => {
    const isAdmin = req.user.role.name === ROLES.PLATFORM_ADMIN || req.user.role.name === ROLES.SUPER_ADMIN;
    const session = await sessionService.cancel(req.user.id, req.params.id, req.body.reason, isAdmin);
    res.json({ success: true, data: session });
  }),
);

// Recordings list (auth required) — mounted before the auth-protected block
// Actually this is already auth-protected since router.use(auth) is above.

// Public webhook for LiveKit Egress (no auth) — mount on the main app separately
// See recording.routes.js → the webhook route is exported and mounted in modules/index.js

// Recording webhook is mounted publicly in modules/index.js

// Recordings list for a session (auth required)
router.get(
  '/:id/recordings',
  asyncHandler(async (req, res) => {
    const { SessionRecording } = require('../../models');
    const recordings = await SessionRecording.findAll({
      where: { session_id: req.params.id, status: 'ready' },
      order: [['id', 'DESC']],
    });
    res.json({ success: true, data: recordings });
  }),
);

// Session rating
const ratingService = require('./rating.service');
const { body: body2 } = require('express-validator');

router.post(
  '/:id/rate',
  checkRole(ROLES.STUDENT, ROLES.PLATFORM_ADMIN),
  [body2('rating').isInt({ min: 1, max: 5 }), body2('comment').optional().isString(), validate],
  asyncHandler(async (req, res) => {
    const enrollment = await ratingService.rateSession(req.user.id, req.params.id, req.body);
    res.json({ success: true, data: enrollment });
  }),
);

router.get('/:id/ratings', asyncHandler(async (req, res) => {
  const ratings = await ratingService.getSessionRatings(req.params.id);
  res.json({ success: true, data: ratings });
}));

// Attendance CSV export
router.get('/:id/attendance/export', asyncHandler(async (req, res) => {
  const { SessionAttendance, Session, User } = require('../../models');
  const session = await Session.findByPk(req.params.id);
  if (!session) return res.status(404).json({ success: false, message: 'Not found' });
  const records = await SessionAttendance.findAll({
    where: { session_id: req.params.id },
    include: [{ model: User, as: 'user', attributes: ['name', 'email', 'phone'] }],
    order: [['joined_at', 'ASC']],
  });
  const header = 'Student ID,Name,Email,Phone,Joined,Left,Duration(sec),Attendance %,Status\n';
  const rows = records.map((r) => {
    return [
      r.user_id,
      `"${r.user?.name || ''}"`,
      `"${r.user?.email || ''}"`,
      `"${r.user?.phone || ''}"`,
      r.joined_at ? new Date(r.joined_at).toISOString() : '',
      r.left_at ? new Date(r.left_at).toISOString() : '',
      r.duration_sec,
      r.attendance_pct,
      r.status,
    ].join(',');
  }).join('\n');
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="attendance-session-${req.params.id}.csv"`);
  res.send(header + rows);
}));

// ── Observer join (admin / supervisor incognito) ──────────────
router.post(
  '/:id/join-as-observer',
  checkRole(ROLES.PLATFORM_ADMIN, ROLES.SUPER_ADMIN, ROLES.TEACHERS_SUPERVISOR, ROLES.STUDENT_SUPERVISOR),
  asyncHandler(async (req, res) => {
    const result = await sessionService.joinAsObserver(req.user.id, req.params.id);
    res.json({ success: true, data: result });
  }),
);

// ── Recording start / stop ───────────────────────────────────
router.post(
  '/:id/recording/start',
  checkRole(ROLES.TEACHER, ROLES.PLATFORM_ADMIN),
  asyncHandler(async (req, res) => {
    const recording = await sessionService.startRecording(req.user.id, req.params.id);
    res.json({ success: true, data: recording });
  }),
);

router.post(
  '/:id/recording/stop',
  checkRole(ROLES.TEACHER, ROLES.PLATFORM_ADMIN),
  asyncHandler(async (req, res) => {
    const recording = await sessionService.stopRecording(req.user.id, req.params.id);
    res.json({ success: true, data: recording });
  }),
);

// ── Lock / unlock room ───────────────────────────────────────
router.post(
  '/:id/lock',
  checkRole(ROLES.TEACHER, ROLES.PLATFORM_ADMIN),
  asyncHandler(async (req, res) => {
    const session = await sessionService.lockRoom(req.user.id, req.params.id, req.body.locked !== false);
    res.json({ success: true, data: session });
  }),
);

// ── Admin: force-end session ─────────────────────────────────
router.post(
  '/:id/force-end',
  checkRole(ROLES.PLATFORM_ADMIN, ROLES.SUPER_ADMIN),
  asyncHandler(async (req, res) => {
    const session = await sessionService.forceEnd(req.user.id, req.params.id);
    res.json({ success: true, data: session });
  }),
);

// ── Admin: ban user from session ──────────────────────────────
router.post(
  '/:id/ban-user',
  checkRole(ROLES.PLATFORM_ADMIN, ROLES.SUPER_ADMIN),
  asyncHandler(async (req, res) => {
    const { user_id, reason } = req.body;
    if (!user_id) return res.status(400).json({ success: false, message: 'user_id required' });
    const ban = await sessionService.banUser(req.user.id, req.params.id, user_id, reason);
    res.json({ success: true, data: ban });
  }),
);

// ── Admin: suspend teacher mid-session ────────────────────────
router.post(
  '/:id/suspend-teacher',
  checkRole(ROLES.PLATFORM_ADMIN, ROLES.SUPER_ADMIN),
  asyncHandler(async (req, res) => {
    const session = await sessionService.suspendTeacher(req.user.id, req.params.id);
    res.json({ success: true, data: session });
  }),
);

// ── Reports ──────────────────────────────────────────────────
router.post(
  '/:id/report',
  asyncHandler(async (req, res) => {
    const report = await sessionService.createReport(req.user.id, req.params.id, req.body);
    res.status(201).json({ success: true, data: report });
  }),
);

router.get(
  '/:id/reports',
  checkRole(ROLES.PLATFORM_ADMIN, ROLES.SUPER_ADMIN, ROLES.TEACHERS_SUPERVISOR),
  asyncHandler(async (req, res) => {
    const { SessionReport } = require('../../models');
    const reports = await SessionReport.findAll({
      where: { session_id: req.params.id },
      order: [['id', 'DESC']],
    });
    res.json({ success: true, data: reports });
  }),
);

module.exports = router;
