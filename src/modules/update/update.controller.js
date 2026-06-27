'use strict';

const asyncHandler = require('../../utils/asyncHandler');
const updateService = require('./update.service');

exports.getLatestVersion = asyncHandler(async (req, res) => {
  const version = await updateService.getLatestVersion();
  res.json({ success: true, data: version });
});

exports.listVersions = asyncHandler(async (req, res) => {
  const versions = await updateService.listVersions();
  res.json({ success: true, data: versions });
});

exports.uploadVersion = asyncHandler(async (req, res) => {
  const version = await updateService.uploadVersion({
    versionCode: parseInt(req.body.versionCode, 10),
    versionName: req.body.versionName,
    releaseNotes: req.body.releaseNotes,
    isForceUpdate: req.body.isForceUpdate,
    filename: req.file.originalname,
    storedName: req.file.filename,
  });

  res.status(201).json({ success: true, data: version });
});

exports.deleteVersion = asyncHandler(async (req, res) => {
  await updateService.deleteVersion(req.params.id);
  res.json({ success: true, message: 'تم الحذف' });
});
