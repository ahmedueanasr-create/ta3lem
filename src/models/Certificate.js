const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Certificate = sequelize.define(
  'Certificate',
  {
    id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    attempt_id: { type: DataTypes.BIGINT, allowNull: false },
    student_id: { type: DataTypes.BIGINT, allowNull: false },
    certificate_number: { type: DataTypes.STRING(30), unique: true, allowNull: false },
    verification_code: { type: DataTypes.UUID, unique: true, allowNull: false },
    title: { type: DataTypes.STRING(255), allowNull: false },
    student_name: { type: DataTypes.STRING(150), allowNull: false },
    subject: { type: DataTypes.STRING(100), allowNull: false },
    score: { type: DataTypes.DECIMAL(5, 2), allowNull: false },
    total: { type: DataTypes.DECIMAL(5, 2), allowNull: false },
    grade: {
      type: DataTypes.ENUM('ممتاز', 'جيد جدا', 'جيد', 'مقبول'),
      allowNull: false,
    },
    issue_date: { type: DataTypes.DATEONLY, allowNull: false },
  },
  {
    tableName: 'certificates',
    indexes: [
      { fields: ['verification_code'] },
      { fields: ['student_id'] },
      { fields: ['attempt_id'] },
    ],
  },
);

module.exports = Certificate;
