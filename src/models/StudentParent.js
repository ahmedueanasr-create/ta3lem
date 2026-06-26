const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const StudentParent = sequelize.define(
  'StudentParent',
  {
    id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    student_id: { type: DataTypes.BIGINT, allowNull: false },
    parent_id: { type: DataTypes.BIGINT, allowNull: false },
    relationship: {
      type: DataTypes.ENUM('أب', 'أم', 'وصي'),
      allowNull: false,
      defaultValue: 'أب',
    },
    is_primary: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    tableName: 'student_parents',
    indexes: [
      { unique: true, fields: ['student_id', 'parent_id'] },
      { fields: ['parent_id'] },
    ],
  },
);

module.exports = StudentParent;
