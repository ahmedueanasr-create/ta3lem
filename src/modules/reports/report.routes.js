const express = require('express');
const auth = require('../../middleware/auth');
const { checkRole } = require('../../middleware/rbac');
const asyncHandler = require('../../utils/asyncHandler');
const { paginate, paginateResponse } = require('../../utils/paginate');
const reportService = require('./report.service');
const ROLES = require('../../utils/roles');
const waService = require('../whatsapp/whatsapp.service');
const { Student, User } = require('../../models');

const router = express.Router();
router.use(auth, checkRole(ROLES.PLATFORM_ADMIN, ROLES.SUPER_ADMIN, ROLES.TEACHERS_SUPERVISOR, ROLES.STUDENT_SUPERVISOR));

router.get('/platform', asyncHandler(async (req, res) => {
  const stats = await reportService.platformStats();
  res.json({ success: true, data: stats });
}));

router.get('/revenue', asyncHandler(async (req, res) => {
  const rows = await reportService.revenue({ from: req.query.from, to: req.query.to });
  res.json({ success: true, data: rows });
}));

router.get('/top-subjects', asyncHandler(async (req, res) => {
  const rows = await reportService.topSubjects();
  res.json({ success: true, data: rows });
}));

router.get('/top-teachers', asyncHandler(async (req, res) => {
  const rows = await reportService.topTeachers();
  res.json({ success: true, data: rows });
}));

router.get('/teacher/:id', asyncHandler(async (req, res) => {
  const data = await reportService.teacherReport(req.params.id);
  res.json({ success: true, data });
}));

router.get('/student/:id', asyncHandler(async (req, res) => {
  const data = await reportService.studentReport(req.params.id);
  res.json({ success: true, data });
}));

router.get('/student/:id/attendance', asyncHandler(async (req, res) => {
  const { limit, offset, page } = paginate(req);
  const { rows, count } = await reportService.studentAttendanceDetail(req.params.id, { limit, offset });
  res.json({ success: true, ...paginateResponse(rows, count, page, limit) });
}));

router.get('/session/:id/attendance', asyncHandler(async (req, res) => {
  const data = await reportService.sessionAttendanceReport(req.params.id);
  if (!data) return res.status(404).json({ success: false, message: 'Session not found' });
  res.json({ success: true, data });
}));

router.get('/students', asyncHandler(async (req, res) => {
  const { limit, offset, page } = paginate(req);
  const { rows, count } = await reportService.allStudentsSummary({ limit, offset });
  res.json({ success: true, ...paginateResponse(rows, count, page, limit) });
}));

// Contact guardian via WhatsApp
router.post('/student/:id/contact-guardian', asyncHandler(async (req, res) => {
  const student = await Student.findByPk(req.params.id, { include: [{ model: User, as: 'user' }] });
  if (!student) return res.status(404).json({ success: false, message: 'Student not found' });
  if (!student.guardian_phone) return res.status(400).json({ success: false, message: 'No guardian phone' });
  const message = req.body.message || `مرحباً ${student.guardian_name || ''}، هذه رسالة من منصة تعليم بخصوص الطالب ${student.user?.name}.`;
  const result = await waService.send(student.guardian_phone, message);
  res.json({ success: true, data: result });
}));

module.exports = router;
