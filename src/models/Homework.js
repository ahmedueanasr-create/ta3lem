const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Homework = sequelize.define(
  'Homework',
  {
    id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    uuid: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, unique: true },
    course_id: { type: DataTypes.BIGINT, allowNull: true },
    session_id: { type: DataTypes.BIGINT, allowNull: true },
    teacher_id: { type: DataTypes.BIGINT, allowNull: false },
    title: { type: DataTypes.STRING(200), allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: true },
    due_at: { type: DataTypes.DATE, allowNull: false },
    max_score: { type: DataTypes.DECIMAL(5, 2), allowNull: false, defaultValue: 100 },
  },
  { tableName: 'homework', indexes: [{ fields: ['teacher_id'] }, { fields: ['session_id'] }] },
);

module.exports = Homework;
