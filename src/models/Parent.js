const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Parent = sequelize.define(
  'Parent',
  {
    id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    user_id: { type: DataTypes.BIGINT, allowNull: false },
    full_name: { type: DataTypes.STRING(150), allowNull: false },
    phone: { type: DataTypes.STRING(20), unique: true, allowNull: false },
    email: { type: DataTypes.STRING(190), allowNull: true },
    relation_type: {
      type: DataTypes.ENUM('أب', 'أم', 'وصي', 'غيره'),
      allowNull: false,
      defaultValue: 'أب',
    },
    notification_preference: {
      type: DataTypes.ENUM('sms', 'whatsapp', 'email'),
      allowNull: false,
      defaultValue: 'whatsapp',
    },
  },
  {
    tableName: 'parents',
    indexes: [{ fields: ['user_id'] }, { fields: ['phone'] }],
  },
);

module.exports = Parent;
