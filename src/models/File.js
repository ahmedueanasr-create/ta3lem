const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const File = sequelize.define(
  'File',
  {
    id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    uuid: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, unique: true },
    uploader_id: { type: DataTypes.BIGINT, allowNull: false },
    entity_type: { type: DataTypes.STRING(60), allowNull: true },
    entity_id: { type: DataTypes.BIGINT, allowNull: true },
    original_name: { type: DataTypes.STRING(255), allowNull: false },
    stored_name: { type: DataTypes.STRING(255), allowNull: false },
    mime: { type: DataTypes.STRING(120), allowNull: false },
    size: { type: DataTypes.BIGINT, allowNull: false },
    url: { type: DataTypes.STRING(500), allowNull: false },
    storage_disk: { type: DataTypes.STRING(40), allowNull: false, defaultValue: 'local' },
  },
  {
    tableName: 'files',
    updatedAt: false,
    indexes: [{ fields: ['uploader_id'] }, { fields: ['entity_type', 'entity_id'] }],
  },
);

module.exports = File;
