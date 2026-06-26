const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Supervisor = sequelize.define(
  'Supervisor',
  {
    user_id: { type: DataTypes.BIGINT, primaryKey: true },
    type: {
      type: DataTypes.ENUM('teachers', 'students'),
      allowNull: false,
    },
  },
  { tableName: 'supervisors', indexes: [{ fields: ['type'] }] },
);

module.exports = Supervisor;
