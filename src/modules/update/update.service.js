'use strict';

const path = require('path');
const fs = require('fs');
const { AppVersion } = require('../../models');
const config = require('../../config');

const APK_DIR = path.resolve(process.cwd(), config.storage.uploadDir, 'app-versions');

class UpdateService {
  async getLatestVersion() {
    return await AppVersion.findOne({
      where: { isActive: true },
      order: [['versionCode', 'DESC']],
      attributes: ['id', 'versionCode', 'versionName', 'fileSize', 'releaseNotes', 'isForceUpdate', 'filePath', 'created_at'],
    });
  }

  async listVersions() {
    return await AppVersion.findAll({ order: [['versionCode', 'DESC']] });
  }

  async uploadVersion({ versionCode, versionName, releaseNotes, isForceUpdate, filename, storedName }) {
    if (!fs.existsSync(APK_DIR)) fs.mkdirSync(APK_DIR, { recursive: true });

    const srcPath = path.resolve(process.cwd(), config.storage.uploadDir, storedName);
    const destName = `ta3lem-v${versionName}-${storedName}`;
    const destPath = path.join(APK_DIR, destName);

    fs.renameSync(srcPath, destPath);
    const stats = fs.statSync(destPath);

    return await AppVersion.create({
      versionCode,
      versionName,
      filePath: `${config.storage.uploadDir}/app-versions/${destName}`,
      fileSize: stats.size,
      releaseNotes,
      isForceUpdate: isForceUpdate === true || isForceUpdate === 'true',
    });
  }

  async deleteVersion(id) {
    const version = await AppVersion.findByPk(id);
    if (!version) throw new Error('الإصدار غير موجود');

    const fullPath = path.resolve(process.cwd(), version.filePath);
    if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);

    await version.destroy();
    return true;
  }

  getDownloadPath(relativePath) {
    return path.resolve(process.cwd(), relativePath);
  }
}

module.exports = new UpdateService();
