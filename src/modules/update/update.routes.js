'use strict';

const express = require('express');
const multer = require('multer');
const config = require('../../config');
const auth = require('../../middleware/auth');
const { checkRole } = require('../../middleware/rbac');
const ROLES = require('../../utils/roles');
const ctrl = require('./update.controller');

const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => {
      const path = require('path');
      const fs = require('fs');
      const dir = path.resolve(process.cwd(), config.storage.uploadDir);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      cb(null, dir);
    },
    filename: (_req, file, cb) => {
      const ext = require('path').extname(file.originalname);
      cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
    },
  }),
  limits: { fileSize: 500 * 1024 * 1024 },
});

const router = express.Router();

router.get('/version', ctrl.getLatestVersion);
router.get('/versions', auth, checkRole(ROLES.PLATFORM_ADMIN, ROLES.SUPER_ADMIN), ctrl.listVersions);
router.post('/versions', auth, checkRole(ROLES.PLATFORM_ADMIN, ROLES.SUPER_ADMIN), upload.single('file'), ctrl.uploadVersion);
router.delete('/versions/:id', auth, checkRole(ROLES.PLATFORM_ADMIN, ROLES.SUPER_ADMIN), ctrl.deleteVersion);

module.exports = router;
