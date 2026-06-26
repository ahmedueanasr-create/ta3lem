const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const config = require('../config');
const { defaultLimiter } = require('../middleware/rateLimit');
const logger = require('../config/logger');
const { notFound, errorHandler } = require('./errorHandler');
const path = require('path');
const fs = require('fs');

const mountRoutes = require('../modules');

const app = express();

app.set('trust proxy', 1);
app.use(helmet());
app.use(
  cors({
    origin: config.app.clientUrl,
    credentials: true,
  }),
);
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  morgan('tiny', {
    stream: { write: (msg) => logger.http(msg.trim()) },
    skip: (req) => req.path === '/health',
  }),
);

app.get('/health', (_req, res) =>
  res.json({ success: true, status: 'ok', service: config.app.name, time: new Date().toISOString() }),
);

app.use(`${config.app.apiPrefix}`, defaultLimiter, mountRoutes());

// serve frontend static files (production single-port deployment via Passenger)
const publicDir = path.resolve(__dirname, '../../domains/3lm.zaadllc.com/public_html');
if (fs.existsSync(publicDir)) {
  app.use(express.static(publicDir));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api/') || req.path.startsWith('/socket')) return next();
    res.sendFile(path.join(publicDir, 'index.html'), () => next());
  });
}

app.use(notFound);
app.use(errorHandler);

module.exports = app;
