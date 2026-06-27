'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class AppVersion extends Model {
    static associate() {}
  }

  AppVersion.init(
    {
      versionCode: { type: DataTypes.INTEGER, field: 'version_code', allowNull: false },
      versionName: { type: DataTypes.STRING(50), field: 'version_name', allowNull: false },
      filePath: { type: DataTypes.STRING(255), field: 'file_path', allowNull: false },
      fileSize: { type: DataTypes.BIGINT, field: 'file_size', allowNull: true },
      releaseNotes: { type: DataTypes.TEXT, field: 'release_notes', allowNull: true },
      isForceUpdate: { type: DataTypes.BOOLEAN, field: 'is_force_update', defaultValue: false },
      isActive: { type: DataTypes.BOOLEAN, field: 'is_active', defaultValue: true },
    },
    {
      sequelize,
      modelName: 'AppVersion',
      tableName: 'app_versions',
      underscored: true,
    },
  );

  return AppVersion;
};
