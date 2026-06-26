const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ExamAnswer = sequelize.define(
  'ExamAnswer',
  {
    id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    attempt_id: { type: DataTypes.BIGINT, allowNull: false },
    question_id: { type: DataTypes.BIGINT, allowNull: false },
    answer: { type: DataTypes.TEXT, allowNull: true },
    is_correct: { type: DataTypes.BOOLEAN, allowNull: true },
    points: { type: DataTypes.DECIMAL(5, 2), allowNull: false, defaultValue: 0 },
  },
  {
    tableName: 'exam_answers',
    updatedAt: false,
    indexes: [{ fields: ['attempt_id'] }, { unique: true, fields: ['attempt_id', 'question_id'] }],
  },
);

module.exports = ExamAnswer;
