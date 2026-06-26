const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Permission = sequelize.define(
  'Permission',
  {
    id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING(100), unique: true, allowNull: false },
    label: { type: DataTypes.STRING(150), allowNull: false },
    group: { type: DataTypes.STRING(80), allowNull: true },
  },
  { tableName: 'permissions', indexes: [{ fields: ['group'] }] },
);

module.exports = Permission;
