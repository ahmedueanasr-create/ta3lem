const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const HomeworkSubmission = sequelize.define(
  'HomeworkSubmission',
  {
    id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    homework_id: { type: DataTypes.BIGINT, allowNull: false },
    user_id: { type: DataTypes.BIGINT, allowNull: false },
    file_id: { type: DataTypes.BIGINT, allowNull: true },
    content: { type: DataTypes.TEXT, allowNull: true },
    submitted_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    score: { type: DataTypes.DECIMAL(5, 2), allowNull: true },
    feedback: { type: DataTypes.TEXT, allowNull: true },
    status: {
      type: DataTypes.ENUM('submitted', 'graded', 'returned'),
      allowNull: false,
      defaultValue: 'submitted',
    },
  },
  {
    tableName: 'homework_submissions',
    indexes: [
      { fields: ['homework_id'] },
      { unique: true, fields: ['homework_id', 'user_id'] },
    ],
  },
);

module.exports = HomeworkSubmission;
