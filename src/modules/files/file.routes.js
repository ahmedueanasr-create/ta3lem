const express = require('express');
const auth = require('../../middleware/auth');
const asyncHandler = require('../../utils/asyncHandler');
const upload = require('./multer');
const { File } = require('../../models');
const config = require('../../config');

const router = express.Router();
router.use(auth);

router.post('/upload', upload.single('file'), asyncHandler(async (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });
  const url = `${config.app.url}/${config.storage.uploadDir}/${req.file.filename}`;
  const file = await File.create({
    uploader_id: req.user.id,
    original_name: req.file.originalname,
    stored_name: req.file.filename,
    mime: req.file.mimetype,
    size: req.file.size,
    url,
    entity_type: req.body.entity_type,
    entity_id: req.body.entity_id || null,
  });
  res.status(201).json({ success: true, data: file });
}));

router.get('/', asyncHandler(async (req, res) => {
  const where = { uploader_id: req.user.id };
  if (req.query.entity_type) where.entity_type = req.query.entity_type;
  const files = await File.findAll({ where, order: [['id', 'DESC']], limit: 100 });
  res.json({ success: true, data: files });
}));

module.exports = router;
