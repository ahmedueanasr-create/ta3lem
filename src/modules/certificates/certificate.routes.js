const express = require('express');
const auth = require('../../middleware/auth');
const asyncHandler = require('../../utils/asyncHandler');
const ctrl = require('./certificate.controller');

const router = express.Router();

router.get('/verify/:code', asyncHandler((req, res) => ctrl.verify(req, res)));

router.get('/my', auth, asyncHandler((req, res) => ctrl.myCertificates(req, res)));

router.get('/:id', auth, asyncHandler((req, res) => ctrl.getCertificate(req, res)));

module.exports = router;
