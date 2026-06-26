const asyncHandler = require('../../utils/asyncHandler');
const ApiError = require('../../utils/ApiError');
const { Parent } = require('../../models');
const parentService = require('./parent.service');

exports.register = asyncHandler(async (req, res) => {
  const result = await parentService.register(req.body);
  res.status(201).json({ success: true, data: { user: result.user, parent: result.parent } });
});

exports.getDashboard = asyncHandler(async (req, res) => {
  const parent = await Parent.findOne({ where: { user_id: req.user.id } });
  if (!parent) throw new ApiError(404, 'Parent profile not found');
  const data = await parentService.getDashboard(parent.id);
  res.json({ success: true, data });
});

exports.linkStudent = asyncHandler(async (req, res) => {
  const parent = await Parent.findOne({ where: { user_id: req.user.id } });
  if (!parent) throw new ApiError(404, 'Parent profile not found');
  const result = await parentService.linkStudent(parent.id, req.body.studentCode);
  res.json({ success: true, data: result });
});

exports.getStudentReport = asyncHandler(async (req, res) => {
  const parent = await Parent.findOne({ where: { user_id: req.user.id } });
  if (!parent) throw new ApiError(404, 'Parent profile not found');
  const data = await parentService.getStudentReport(parent.id, req.params.studentId);
  res.json({ success: true, data });
});

exports.getPayments = asyncHandler(async (req, res) => {
  const parent = await Parent.findOne({ where: { user_id: req.user.id } });
  if (!parent) throw new ApiError(404, 'Parent profile not found');
  const data = await parentService.getPayments(parent.id);
  res.json({ success: true, data });
});
