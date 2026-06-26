const express = require('express');
const auth = require('../../middleware/auth');
const asyncHandler = require('../../utils/asyncHandler');
const ROLES = require('../../utils/roles');
const { checkRole } = require('../../middleware/rbac');
const ctrl = require('./parent.controller');
const { registerRules, linkStudentRules } = require('./parent.validator');

const router = express.Router();

router.post('/register', registerRules, ctrl.register);
router.get('/dashboard', auth, checkRole(ROLES.PARENT), ctrl.getDashboard);
router.post('/link-student', auth, checkRole(ROLES.PARENT), linkStudentRules, ctrl.linkStudent);
router.get('/students/:studentId/report', auth, checkRole(ROLES.PARENT), ctrl.getStudentReport);
router.get('/payments', auth, checkRole(ROLES.PARENT), ctrl.getPayments);

module.exports = router;
