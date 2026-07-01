const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const DeviceToken = sequelize.define('DeviceToken', {
  id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
  user_id: { type: DataTypes.BIGINT, allowNull: false },
  token: { type: DataTypes.STRING(500), allowNull: false },
  platform: { type: DataTypes.ENUM('android', 'ios', 'web'), allowNull: false, defaultValue: 'android' },
  device_name: { type: DataTypes.STRING(200), allowNull: true },
  is_active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
}, {
  tableName: 'device_tokens',
  underscored: true,
  timestamps: true,
  indexes: [
    { fields: ['user_id'] },
    { fields: ['token'], unique: true },
  ],
});

module.exports = DeviceToken;
