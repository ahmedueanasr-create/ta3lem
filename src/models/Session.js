const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Session = sequelize.define(
  'Session',
  {
    id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    uuid: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, unique: true },
    course_id: { type: DataTypes.BIGINT, allowNull: true },
    teacher_id: { type: DataTypes.BIGINT, allowNull: false },
    subject_id: { type: DataTypes.BIGINT, allowNull: false },
    title: { type: DataTypes.STRING(200), allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: true },
    scheduled_at: { type: DataTypes.DATE, allowNull: false },
    duration_min: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 60 },
    status: {
      type: DataTypes.ENUM('scheduled', 'live', 'ended', 'cancelled'),
      allowNull: false,
      defaultValue: 'scheduled',
    },
    is_private: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    price: { type: DataTypes.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
    room_name: { type: DataTypes.STRING(120), unique: true, allowNull: false },
    recording_enabled: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    started_at: { type: DataTypes.DATE, allowNull: true },
    ended_at: { type: DataTypes.DATE, allowNull: true },
  },
  {
    tableName: 'sessions',
    indexes: [
      { fields: ['teacher_id'] },
      { fields: ['subject_id'] },
      { fields: ['status'] },
      { fields: ['scheduled_at'] },
    ],
  },
);

module.exports = Session;
