// /server.js
require('dotenv').config();

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const pino = require('pino');
const pinoHttp = require('pino-http');
const { randomUUID } = require('crypto');

// ===== Entorno =====
const {
  NODE_ENV = 'development',
  PORT = 5000,
  MONGO_URI = 'mongodb://localhost:27017/redvelvetlive',
  PUBLIC_URL = `http://localhost:${PORT}`,
  CORS_ORIGINS = '',
} = process.env;

const isProd = NODE_ENV === 'production';
const app = express();

// ===== Logger =====
const logger = pino({
  level: isProd ? 'info' : 'debug',
  redact: { paths: ['req.headers.authorization', 'req.headers.cookie'], remove: true },
  transport: isProd
    ? undefined
    : { target: 'pino-pretty', options: { translateTime: 'SYS:yyyy-mm-dd HH:MM:ss', singleLine: true } },
});

// ===== Seguridad =====
app.disable('x-powered-by');
app.set('trust proxy', 1);

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// ===== CORS =====
const list = CORS_ORIGINS.split(',').map(s => s.trim()).filter(Boolean);
const corsOptions = {
  origin: (origin, cb) => {
    if (!origin) return cb(null, true);
    if (!isProd) return cb(null, true);
    if (list.includes(origin)) return cb(null, true);
    return cb(new Error('CORS not allowed'), false);
  },
  credentials: true,
};
app.use(cors(corsOptions));

// ===== Middlewares base =====
app.use(compression());
app.use(cookieParser());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: false }));
app.use(mongoSanitize());

app.use(
  pinoHttp({
    logger,
    genReqId: (req) => req.headers['x-request-id'] || randomUUID(),
  })
);

// ===== Rate limits =====
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
});
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', apiLimiter);
app.use('/auth/', authLimiter);

// ===== Mongo =====
mongoose.set('strictQuery', true);
mongoose
  .connect(MONGO_URI)
  .then(() => logger.info({ msg: 'MongoDB conectado' }))
  .catch(err => {
    logger.error({ err }, 'Error conectando a MongoDB');
    process.exit(1);
  });

// ===== Rutas =====
app.get('/healthz', (req, res) => res.json({ ok: true, env: NODE_ENV }));
app.get('/readyz', (req, res) => {
  const mongoOk = mongoose.connection.readyState === 1;
  res.status(mongoOk ? 200 : 503).json({ ok: mongoOk });
});

// Demo (reemplazar luego)
app.get('/api/users/profile', (req, res) => {
  res.json({ name: 'Demo User', role: 'client', email: 'demo@example.com', locale: 'es' });
});

// ===== 404 =====
app.use((req, res) => res.status(404).json({ error: 'Not found' }));

// ===== Errores =====
app.use((err, req, res, next) => {
  req.log?.error({ err }, 'Unhandled error');
  const status = err.status || 500;
  const payload = { error: err.message || 'Internal error' };
  if (!isProd && err.stack) payload.stack = err.stack;
  res.status(status).json(payload);
});

// ===== Arranque =====
const server = app.listen(PORT, () => {
  logger.info({ msg: `Servidor en ${PUBLIC_URL} (port ${PORT}, env ${NODE_ENV})` });
});

function shutdown(signal) {
  logger.warn({ signal }, 'Recibido signal, apagando…');
  server.close(() => {
    mongoose.connection.close(false).finally(() => {
      logger.warn('Apagado completo');
      process.exit(0);
    });
  });
}
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
