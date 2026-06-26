const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Question = sequelize.define(
  'Question',
  {
    id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    exam_id: { type: DataTypes.BIGINT, allowNull: false },
    type: {
      type: DataTypes.ENUM('mcq', 'truefalse', 'essay'),
      allowNull: false,
    },
    text: { type: DataTypes.TEXT, allowNull: false },
    options: { type: DataTypes.JSON, allowNull: true },
    correct_answer: { type: DataTypes.STRING(255), allowNull: true },
    points: { type: DataTypes.DECIMAL(5, 2), allowNull: false, defaultValue: 1 },
  },
  { tableName: 'questions', indexes: [{ fields: ['exam_id'] }] },
);

module.exports = Question;
