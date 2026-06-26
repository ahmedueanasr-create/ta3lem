const Redis = require('ioredis');
const config = require('./index');
const logger = require('./logger');

const redis = new Redis({
  host: config.redis.host,
  port: config.redis.port,
  password: config.redis.password || undefined,
  db: config.redis.db,
  retryStrategy: (times) => Math.min(times * 200, 2000),
  maxRetriesPerRequest: 3,
  enableReadyCheck: true,
  lazyConnect: true, // don't block server start
  enableOfflineQueue: false, // fail fast if Redis is down
  commandTimeout: 5000,
});

redis.on('error', (err) => logger.error('Redis error', { message: err.message }));
redis.on('connect', () => logger.info('Redis connected'));

// Pub/Sub clients (separate connections)
const pub = redis.duplicate();
const sub = redis.duplicate();
pub.on('error', (err) => logger.warn('Redis pub error', { message: err.message }));
sub.on('error', (err) => logger.warn('Redis sub error', { message: err.message }));

module.exports = { redis, pub, sub };
