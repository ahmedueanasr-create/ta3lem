const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Wallet = sequelize.define(
  'Wallet',
  {
    id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    user_id: { type: DataTypes.BIGINT, unique: true, allowNull: false },
    balance: { type: DataTypes.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
    currency: { type: DataTypes.STRING(3), allowNull: false, defaultValue: 'EGP' },
  },
  { tableName: 'wallets', indexes: [{ fields: ['user_id'] }] },
);

module.exports = Wallet;
