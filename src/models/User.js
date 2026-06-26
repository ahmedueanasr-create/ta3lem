const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define(
  'User',
  {
    id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    uuid: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, unique: true, allowNull: false },
    name: { type: DataTypes.STRING(150), allowNull: false },
    email: { type: DataTypes.STRING(190), unique: true, allowNull: false, validate: { isEmail: true } },
    phone: { type: DataTypes.STRING(20), unique: true, allowNull: true },
    password_hash: { type: DataTypes.STRING(255), allowNull: false },
    role_id: { type: DataTypes.BIGINT, allowNull: false },
    status: {
      type: DataTypes.ENUM('active', 'inactive', 'suspended', 'pending'),
      allowNull: false,
      defaultValue: 'active',
    },
    avatar: { type: DataTypes.STRING(500), allowNull: true },
    last_login: { type: DataTypes.DATE, allowNull: true },
    email_verified: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    phone_verified: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    refresh_jti: { type: DataTypes.STRING(64), allowNull: true },
    first_login: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    must_change_password: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    health_status: { type: DataTypes.TEXT, allowNull: true },
    health_notes: { type: DataTypes.TEXT, allowNull: true },
  },
  { tableName: 'users', indexes: [
    { fields: ['role_id'] },
    { fields: ['status'] },
    { fields: ['email'] },
    { fields: ['phone'] },
  ] },
);

// hide password from JSON
User.prototype.toJSON = function toJSON() {
  const values = { ...this.get() };
  delete values.password_hash;
  delete values.refresh_jti;
  return values;
};

module.exports = User;
