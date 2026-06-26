require('dotenv').config();
const config = require('./index');

module.exports = {
  development: {
    username: config.db.user,
    password: config.db.password,
    database: config.db.name,
    host: config.db.host,
    port: config.db.port,
    dialect: 'mysql',
    define: {
      underscored: true,
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      charset: 'utf8mb4',
      collate: 'utf8mb4_unicode_ci',
    },
  },
  test: {
    ...module.exports.development,
    database: `${config.db.name}_test`,
  },
  production: {
    ...module.exports.development,
    logging: false,
  },
};
