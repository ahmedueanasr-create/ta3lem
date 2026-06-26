const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Teacher = sequelize.define(
  'Teacher',
  {
    user_id: { type: DataTypes.BIGINT, primaryKey: true },
    bio: { type: DataTypes.TEXT, allowNull: true },
    specialization: { type: DataTypes.STRING(150), allowNull: true },
    status: {
      type: DataTypes.ENUM('pending', 'approved', 'rejected', 'suspended'),
      allowNull: false,
      defaultValue: 'pending',
    },
    rating: { type: DataTypes.DECIMAL(3, 2), allowNull: false, defaultValue: 0 },
    total_sessions: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    total_students: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    approved_by: { type: DataTypes.BIGINT, allowNull: true },
    approved_at: { type: DataTypes.DATE, allowNull: true },
  },
  { tableName: 'teachers', indexes: [{ fields: ['status'] }] },
);

module.exports = Teacher;
