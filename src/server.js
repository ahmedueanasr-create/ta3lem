const http = require('http');
const path = require('path');
const app = require('./core/app');
const config = require('./config');
const logger = require('./config/logger');
const { sequelize } = require('./models');
const initSocket = require('./realtime/socket');
const waService = require('./modules/whatsapp/whatsapp.service');
const { startJobs } = require('./jobs');

// serve uploaded files (dev). In production use nginx / object storage.
const express = require('express');
app.use('/storage', express.static(path.resolve(process.cwd(), 'storage')));

const server = http.createServer(app);
const io = initSocket(server);
app.set('io', io);

async function boot() {
  try {
    await sequelize.authenticate();
    logger.info('MySQL connected');

    if (process.env.DB_SYNC === 'true') {
      await sequelize.sync({ alter: false });
      logger.info('Models synced');
    }

    await waService.start();
    startJobs();

    server.listen(config.app.port, () => {
      logger.info(`${config.app.name} API running on :${config.app.port} (${config.app.env})`);
    });
  } catch (err) {
    logger.error('Boot failed', { message: err.message });
    process.exit(1);
  }
}

const shutdown = (signal) => {
  logger.info(`${signal} received, shutting down...`);
  server.close(() => {
    sequelize.close().finally(() => process.exit(0));
  });
  setTimeout(() => process.exit(1), 10000).unref();
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('unhandledRejection', (err) => logger.error('Unhandled rejection', { message: err?.message }));
process.on('uncaughtException', (err) => {
  logger.error('Uncaught exception', { message: err?.message, stack: err?.stack });
  shutdown('uncaughtException');
});

// Always boot (standalone and Passenger)
boot();

// Export Express app for Passenger (lsnode expects a function)
module.exports = app;
