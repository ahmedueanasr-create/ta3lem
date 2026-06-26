const asyncHandler = require('../../utils/asyncHandler');
const aiService = require('./ai.service');

exports.tutorChat = asyncHandler(async (req, res) => {
  const { messages } = req.body;
  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ success: false, message: 'الرسائل مطلوبة' });
  }
  const reply = await aiService.tutorChat(messages.slice(-20));
  res.json({ success: true, data: { reply } });
});

exports.generateExam = asyncHandler(async (req, res) => {
  const { subject, level, count, types } = req.body;
  if (!subject) return res.status(400).json({ success: false, message: 'المادة مطلوبة' });
  const result = await aiService.generateExam({ subject, level, count, types });
  res.json({ success: true, data: result });
});

exports.summarizeSession = asyncHandler(async (req, res) => {
  const { title, chatLog, duration } = req.body;
  if (!title) return res.status(400).json({ success: false, message: 'عنوان الحصة مطلوب' });
  const summary = await aiService.summarizeSession({ title, chatLog, duration });
  res.json({ success: true, data: { summary } });
});
