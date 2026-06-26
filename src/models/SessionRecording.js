const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const SessionRecording = sequelize.define(
  'SessionRecording',
  {
    id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    uuid: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, unique: true },
    session_id: { type: DataTypes.BIGINT, allowNull: false },
    file_path: { type: DataTypes.STRING(500), allowNull: true },
    duration_sec: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    size_bytes: { type: DataTypes.BIGINT, allowNull: false, defaultValue: 0 },
    status: {
      type: DataTypes.ENUM('recording', 'processing', 'ready', 'failed'),
      allowNull: false,
      defaultValue: 'recording',
    },
    chat_log: { type: DataTypes.JSON, allowNull: true },
    url: { type: DataTypes.STRING(500), allowNull: true },
  },
  {
    tableName: 'session_recordings',
    indexes: [{ fields: ['session_id'] }, { fields: ['status'] }],
  },
);

module.exports = SessionRecording;
