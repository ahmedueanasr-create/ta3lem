const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const AuditLog = sequelize.define(
  'AuditLog',
  {
    id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    user_id: { type: DataTypes.BIGINT, allowNull: true },
    action: { type: DataTypes.STRING(100), allowNull: false },
    entity_type: { type: DataTypes.STRING(60), allowNull: true },
    entity_id: { type: DataTypes.BIGINT, allowNull: true },
    before: { type: DataTypes.JSON, allowNull: true },
    after: { type: DataTypes.JSON, allowNull: true },
    ip: { type: DataTypes.STRING(45), allowNull: true },
    user_agent: { type: DataTypes.STRING(300), allowNull: true },
  },
  {
    tableName: 'audit_logs',
    updatedAt: false,
    indexes: [{ fields: ['user_id'] }, { fields: ['action'] }, { fields: ['entity_type', 'entity_id'] }],
  },
);

module.exports = AuditLog;
