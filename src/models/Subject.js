const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Subject = sequelize.define(
  'Subject',
  {
    id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING(150), unique: true, allowNull: false },
    slug: { type: DataTypes.STRING(160), unique: true, allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: true },
    icon: { type: DataTypes.STRING(500), allowNull: true },
    is_active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
  },
  { tableName: 'subjects', indexes: [{ fields: ['slug'] }] },
);

module.exports = Subject;
