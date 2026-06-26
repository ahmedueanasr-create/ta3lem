const asyncHandler = require('../../utils/asyncHandler');
const authService = require('./auth.service');

exports.register = asyncHandler(async (req, res) => {
  const user = await authService.register(req.body);
  res.status(201).json({ success: true, data: { id: user.id, uuid: user.uuid, email: user.email } });
});

exports.login = asyncHandler(async (req, res) => {
  const result = await authService.login(req.body);
  res.json({ success: true, data: result });
});

exports.verifyOtp = asyncHandler(async (req, res) => {
  const result = await authService.verifyOtp(req.body.tempToken, req.body.otp);
  res.json({ success: true, data: result });
});

exports.resendOtp = asyncHandler(async (req, res) => {
  const result = await authService.resendOtp(req.body.tempToken);
  res.json({ success: true, data: result });
});

exports.refresh = asyncHandler(async (req, res) => {
  const { accessToken, refreshToken } = await authService.refresh(req.body.refreshToken);
  res.json({ success: true, data: { accessToken, refreshToken } });
});

exports.logout = asyncHandler(async (req, res) => {
  await authService.logout(req.headers.authorization?.slice(7), req.body.refreshToken);
  res.json({ success: true, message: 'Logged out' });
});

exports.me = asyncHandler(async (req, res) => {
  const user = await authService.me(req.user);
  res.json({ success: true, data: user });
});

exports.forgotPassword = asyncHandler(async (req, res) => {
  const result = await authService.forgotPassword(req.body.email);
  if (!result) return res.json({ success: true, message: 'If the email exists, a reset link has been sent.' });
  res.json({ success: true, data: { token: result.token, message: 'Reset token generated (check server logs in dev).' } });
});

exports.resetPassword = asyncHandler(async (req, res) => {
  await authService.resetPassword(req.body.token, req.body.password);
  res.json({ success: true, message: 'Password reset successfully' });
});

exports.changePassword = asyncHandler(async (req, res) => {
  await authService.changePassword(req.user.id, req.body.oldPassword, req.body.newPassword);
  res.json({ success: true, message: 'Password changed successfully' });
});

exports.teacherOnboarding = asyncHandler(async (req, res) => {
  const user = await authService.teacherOnboarding(req.user.id, req.body);
  res.json({ success: true, data: { id: user.id, firstLogin: user.first_login } });
});
