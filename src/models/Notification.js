const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Notification = sequelize.define(
  'Notification',
  {
    id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    user_id: { type: DataTypes.BIGINT, allowNull: false },
    type: { type: DataTypes.STRING(60), allowNull: false },
    title: { type: DataTypes.STRING(200), allowNull: false },
    body: { type: DataTypes.TEXT, allowNull: true },
    data: { type: DataTypes.JSON, allowNull: true },
    channel: {
      type: DataTypes.ENUM('inapp', 'push', 'whatsapp', 'email'),
      allowNull: false,
      defaultValue: 'inapp',
    },
    read_at: { type: DataTypes.DATE, allowNull: true },
  },
  {
    tableName: 'notifications',
    updatedAt: false,
    indexes: [{ fields: ['user_id', 'read_at'] }],
  },
);

module.exports = Notification;
