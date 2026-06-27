const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const SessionBan = sequelize.define(
  'SessionBan',
  {
    id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    session_id: { type: DataTypes.BIGINT, allowNull: false },
    user_id: { type: DataTypes.BIGINT, allowNull: false },
    banned_by: { type: DataTypes.BIGINT, allowNull: false },
    reason: { type: DataTypes.STRING(500), allowNull: true },
  },
  {
    tableName: 'session_bans',
    updatedAt: false,
    indexes: [
      { unique: true, fields: ['session_id', 'user_id'] },
      { fields: ['user_id'] },
    ],
  },
);

module.exports = SessionBan;
