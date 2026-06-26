const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const SessionAttendance = sequelize.define(
  'SessionAttendance',
  {
    id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    session_id: { type: DataTypes.BIGINT, allowNull: false },
    user_id: { type: DataTypes.BIGINT, allowNull: false },
    joined_at: { type: DataTypes.DATE, allowNull: true },
    left_at: { type: DataTypes.DATE, allowNull: true },
    duration_sec: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    attendance_pct: { type: DataTypes.DECIMAL(5, 2), allowNull: false, defaultValue: 0 },
    status: {
      type: DataTypes.ENUM('present', 'absent', 'late'),
      allowNull: false,
      defaultValue: 'absent',
    },
  },
  {
    tableName: 'session_attendance',
    updatedAt: false,
    indexes: [
      { unique: true, fields: ['session_id', 'user_id'] },
      { fields: ['user_id'] },
    ],
  },
);

module.exports = SessionAttendance;
