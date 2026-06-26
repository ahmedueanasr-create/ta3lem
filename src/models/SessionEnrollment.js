const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const SessionEnrollment = sequelize.define(
  'SessionEnrollment',
  {
    id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    session_id: { type: DataTypes.BIGINT, allowNull: false },
    user_id: { type: DataTypes.BIGINT, allowNull: false },
    charged_amount: { type: DataTypes.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
    transaction_id: { type: DataTypes.BIGINT, allowNull: true },
    rating: { type: DataTypes.INTEGER, allowNull: true, validate: { min: 1, max: 5 } },
    rating_comment: { type: DataTypes.TEXT, allowNull: true },
  },
  {
    tableName: 'session_enrollments',
    updatedAt: false,
    indexes: [
      { unique: true, fields: ['session_id', 'user_id'] },
      { fields: ['user_id'] },
    ],
  },
);

module.exports = SessionEnrollment;
