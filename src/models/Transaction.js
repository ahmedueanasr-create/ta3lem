const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Transaction = sequelize.define(
  'Transaction',
  {
    id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    uuid: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, unique: true },
    wallet_id: { type: DataTypes.BIGINT, allowNull: false },
    type: {
      type: DataTypes.ENUM('charge', 'deduct', 'refund', 'bonus', 'payout'),
      allowNull: false,
    },
    amount: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
    balance_before: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
    balance_after: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
    reason: { type: DataTypes.STRING(255), allowNull: true },
    reference_type: { type: DataTypes.STRING(60), allowNull: true },
    reference_id: { type: DataTypes.BIGINT, allowNull: true },
  },
  {
    tableName: 'transactions',
    updatedAt: false,
    indexes: [{ fields: ['wallet_id'] }, { fields: ['reference_type', 'reference_id'] }],
  },
);

module.exports = Transaction;
