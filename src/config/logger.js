const fs = require('fs');
const path = require('path');
const winston = require('winston');
const config = require('./index');

const logDir = path.resolve(process.cwd(), 'logs');
if (config.log.toFile && !fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });

const printf = winston.format.printf(
  ({ level, message, timestamp, stack, ...meta }) =>
    `${timestamp} [${level.toUpperCase()}] ${stack || message}${
      Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : ''
    }`,
);

const transports = [
  new winston.transports.Console({
    format: winston.format.combine(winston.format.colorize(), printf),
  }),
];
if (config.log.toFile) {
  transports.push(
    new winston.transports.File({ filename: path.join(logDir, 'error.log'), level: 'error' }),
    new winston.transports.File({ filename: path.join(logDir, 'combined.log') }),
  );
}

const logger = winston.createLogger({
  level: config.log.level,
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json(),
  ),
  transports,
});

module.exports = logger;
