const express = require('express');
const auth = require('../../middleware/auth');
const asyncHandler = require('../../utils/asyncHandler');
const ctrl = require('./ai.controller');

const router = express.Router();

router.post('/tutor/chat', auth, asyncHandler(ctrl.tutorChat));
router.post('/exam/generate', auth, asyncHandler(ctrl.generateExam));
router.post('/session/summarize', auth, asyncHandler(ctrl.summarizeSession));

module.exports = router;
