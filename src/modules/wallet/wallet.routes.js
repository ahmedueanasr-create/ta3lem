const express = require('express');
const auth = require('../../middleware/auth');
const ctrl = require('./wallet.controller');

const router = express.Router();
router.use(auth);

router.get('/', ctrl.me);
router.get('/history', ctrl.history);
router.post('/charge', ctrl.charge);

module.exports = router;
