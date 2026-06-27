const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const SessionReport = sequelize.define(
  'SessionReport',
  {
    id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    session_id: { type: DataTypes.BIGINT, allowNull: false },
    user_id: { type: DataTypes.BIGINT, allowNull: false },
    type: {
      type: DataTypes.ENUM('conduct', 'technical', 'content', 'other'),
      allowNull: false,
      defaultValue: 'other',
    },
    description: { type: DataTypes.TEXT, allowNull: false },
    severity: {
      type: DataTypes.ENUM('low', 'medium', 'high', 'critical'),
      defaultValue: 'medium',
    },
    status: {
      type: DataTypes.ENUM('open', 'resolved', 'dismissed'),
      defaultValue: 'open',
    },
    resolved_by: { type: DataTypes.BIGINT, allowNull: true },
    resolved_at: { type: DataTypes.DATE, allowNull: true },
    resolution_notes: { type: DataTypes.TEXT, allowNull: true },
  },
  {
    tableName: 'session_reports',
    indexes: [
      { fields: ['session_id'] },
      { fields: ['user_id'] },
      { fields: ['status'] },
    ],
  },
);

module.exports = SessionReport;
