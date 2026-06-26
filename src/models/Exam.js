const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Exam = sequelize.define(
  'Exam',
  {
    id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    uuid: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, unique: true },
    course_id: { type: DataTypes.BIGINT, allowNull: true },
    session_id: { type: DataTypes.BIGINT, allowNull: true },
    title: { type: DataTypes.STRING(200), allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: true },
    duration_min: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 60 },
    pass_score: { type: DataTypes.DECIMAL(5, 2), allowNull: false, defaultValue: 50 },
    start_at: { type: DataTypes.DATE, allowNull: true },
    end_at: { type: DataTypes.DATE, allowNull: true },
    is_published: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
  },
  { tableName: 'exams', indexes: [{ fields: ['course_id'] }, { fields: ['session_id'] }] },
);

module.exports = Exam;
