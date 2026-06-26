const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ExamAttempt = sequelize.define(
  'ExamAttempt',
  {
    id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    uuid: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, unique: true },
    exam_id: { type: DataTypes.BIGINT, allowNull: false },
    user_id: { type: DataTypes.BIGINT, allowNull: false },
    started_at: { type: DataTypes.DATE, allowNull: false },
    submitted_at: { type: DataTypes.DATE, allowNull: true },
    score: { type: DataTypes.DECIMAL(5, 2), allowNull: true },
    max_score: { type: DataTypes.DECIMAL(5, 2), allowNull: false, defaultValue: 100 },
    status: {
      type: DataTypes.ENUM('in_progress', 'submitted', 'graded'),
      allowNull: false,
      defaultValue: 'in_progress',
    },
    certificate_id: { type: DataTypes.STRING(120), allowNull: true },
  },
  {
    tableName: 'exam_attempts',
    indexes: [{ fields: ['exam_id'] }, { fields: ['user_id'] }, { fields: ['status'] }],
  },
);

module.exports = ExamAttempt;
