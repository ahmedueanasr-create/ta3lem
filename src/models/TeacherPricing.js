const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const TeacherPricing = sequelize.define(
  'TeacherPricing',
  {
    teacher_id: { type: DataTypes.BIGINT, primaryKey: true },
    session_price: { type: DataTypes.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
    private_session_price: { type: DataTypes.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
    monthly_price: { type: DataTypes.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
    yearly_price: { type: DataTypes.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
    currency: { type: DataTypes.STRING(3), allowNull: false, defaultValue: 'EGP' },
  },
  { tableName: 'teacher_pricing' },
);

module.exports = TeacherPricing;
