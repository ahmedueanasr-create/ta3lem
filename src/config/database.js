const { Sequelize } = require('sequelize');
const config = require('./index');
const logger = require('./logger');

const sequelize = new Sequelize(config.db.name, config.db.user, config.db.password, {
  host: config.db.host,
  port: config.db.port,
  dialect: 'mysql',
  logging: config.db.logging ? (msg) => logger.debug(msg) : false,
  define: {
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    charset: 'utf8mb4',
    collate: 'utf8mb4_unicode_ci',
  },
  pool: {
    min: config.db.poolMin,
    max: config.db.poolMax,
    acquire: 30000,
    idle: 10000,
  },
  dialectOptions: {
    decimalNumbers: true,
  },
});

module.exports = sequelize;
