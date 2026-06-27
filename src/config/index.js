require('dotenv').config();

const env = (key, fallback = '') => process.env[key] ?? fallback;
const bool = (key, fallback = false) => (process.env[key] === undefined ? fallback : process.env[key] === 'true');
const int = (key, fallback) => {
  const v = parseInt(process.env[key], 10);
  return Number.isNaN(v) ? fallback : v;
};

module.exports = {
  app: {
    name: env('APP_NAME', 'ta3lem'),
    env: env('NODE_ENV', 'development'),
    port: int('PORT', 4000),
    url: env('APP_URL', 'http://localhost:4000'),
    clientUrl: env('CLIENT_URL', 'http://localhost:3000'),
    apiPrefix: env('API_PREFIX', '/api/v1'),
  },
  db: {
    host: env('DB_HOST', '127.0.0.1'),
    port: int('DB_PORT', 3306),
    name: env('DB_NAME', 'ta3lem'),
    user: env('DB_USER', 'root'),
    password: env('DB_PASSWORD', ''),
    poolMin: int('DB_POOL_MIN', 5),
    poolMax: int('DB_POOL_MAX', 50),
    logging: bool('DB_LOGGING', false),
  },
  redis: {
    host: env('REDIS_HOST', '127.0.0.1'),
    port: int('REDIS_PORT', 6379),
    password: env('REDIS_PASSWORD', ''),
    db: int('REDIS_DB', 0),
  },
  jwt: {
    accessSecret: env('JWT_ACCESS_SECRET', 'access-secret'),
    refreshSecret: env('JWT_REFRESH_SECRET', 'refresh-secret'),
    accessTtl: env('JWT_ACCESS_TTL', '1h'),
    refreshTtl: env('JWT_REFRESH_TTL', '7d'),
    issuer: env('JWT_ISSUER', 'ta3lem'),
  },
  security: {
    bcryptRounds: int('BCRYPT_ROUNDS', 12),
    rateLimitWindowMs: int('RATE_LIMIT_WINDOW_MS', 900000),
    rateLimitMax: int('RATE_LIMIT_MAX', 300),
  },
  storage: {
    uploadDir: env('UPLOAD_DIR', 'storage/uploads'),
    recordingDir: env('RECORDING_DIR', 'storage/recordings'),
    maxUploadMb: int('MAX_UPLOAD_MB', 200),
  },
  live: {
    provider: env('LIVE_PROVIDER', 'livekit'),
    livekit: {
      host: env('LIVEKIT_HOST', 'http://127.0.0.1:7880'),
      url: env('LIVEKIT_URL', 'ws://127.0.0.1:7880'),
      apiKey: env('LIVEKIT_API_KEY', 'devkey'),
      apiSecret: env('LIVEKIT_API_SECRET', 'secret'),
    },
    agora: {
      appId: env('AGORA_APP_ID', ''),
      appCertificate: env('AGORA_APP_CERTIFICATE', ''),
    },
  },
  ai: {
    provider: env('AI_PROVIDER', 'openai'),
    openaiKey: env('OPENAI_API_KEY', ''),
    geminiKey: env('GEMINI_API_KEY', ''),
  },
  whatsapp: {
    enabled: bool('WA_ENABLED', true),
    sessionDir: env('WA_SESSION_DIR', 'storage/wa-session'),
    groupNotify: bool('WA_GROUP_NOTIFY', true),
    fallbackApiUrl: env('WA_FALLBACK_API_URL', ''),
  },
  email: {
    host: env('SMTP_HOST', 'smtp.gmail.com'),
    port: int('SMTP_PORT', 587),
    secure: bool('SMTP_SECURE', false),
    user: env('SMTP_USER', ''),
    pass: env('SMTP_PASS', ''),
    from: env('SMTP_FROM', 'noreply@ta3lem.app'),
  },
  log: {
    level: env('LOG_LEVEL', 'info'),
    toFile: bool('LOG_TO_FILE', true),
  },
};
