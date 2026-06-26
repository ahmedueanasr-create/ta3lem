const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const WhatsAppMessage = sequelize.define(
  'WhatsAppMessage',
  {
    id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    jid: { type: DataTypes.STRING(80), allowNull: false },
    message: { type: DataTypes.TEXT, allowNull: true },
    media_url: { type: DataTypes.STRING(500), allowNull: true },
    status: {
      type: DataTypes.ENUM('queued', 'sent', 'delivered', 'read', 'failed'),
      allowNull: false,
      defaultValue: 'queued',
    },
    direction: { type: DataTypes.ENUM('in', 'out'), allowNull: false, defaultValue: 'out' },
    session: { type: DataTypes.STRING(60), allowNull: true },
    wa_message_id: { type: DataTypes.STRING(120), allowNull: true },
    error: { type: DataTypes.TEXT, allowNull: true },
  },
  {
    tableName: 'whatsapp_messages',
    updatedAt: false,
    indexes: [{ fields: ['jid'] }, { fields: ['status'] }, { fields: ['direction'] }],
  },
);

module.exports = WhatsAppMessage;
