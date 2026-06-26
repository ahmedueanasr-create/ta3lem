require('dotenv').config();
const { sequelize } = require('../models');
const logger = require('../config/logger');

(async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ alter: true });
    logger.info('DB synced (alter=true). For production use migrations instead.');
    process.exit(0);
  } catch (err) {
    logger.error('sync failed', { message: err.message });
    process.exit(1);
  }
})();
