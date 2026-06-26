const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const RolePermission = sequelize.define(
  'RolePermission',
  {
    role_id: { type: DataTypes.BIGINT, primaryKey: true },
    permission_id: { type: DataTypes.BIGINT, primaryKey: true },
  },
  { tableName: 'role_permissions', timestamps: false },
);

module.exports = RolePermission;
