import 'dotenv/config';
import express from 'express';
import cookieParser from 'cookie-parser';
import pinoHttp from 'pino-http';
import cors from 'cors';

import logger from './config/logger.js';
import buildCors from './config/cors.js'; // lo mantenemos si lo usas internamente
import security from './config/security.js';
import { mountCsrf } from './config/csrf.js';
import connectDB from './config/db.js';

import apiV1 from './routes/index.js';
import sitemapPostsRouter from './routes/sitemap.posts.routes.js'; // ✅ corregido

import { auth } from './middlewares/auth.js';
import User from './models/User.js';

const {
  NODE_ENV = 'development',
  PORT = 5000,
  PUBLIC_URL = `http://localhost:${PORT}`,
  FRONTEND_ORIGIN
} = process.env;

const app = express();
app.set('trust proxy', 1);

// Logs
app.use(pinoHttp({ logger }));

// =========================
// 🌐 CORS dinámico
// =========================
if (FRONTEND_ORIGIN) {
  const allowed = FRONTEND_ORIGIN.split(",").map(s => s.trim());
  app.use(cors({
    origin: (origin, cb) => {
      if (!origin || allowed.includes(origin)) return cb(null, true);
      cb(new Error("Not allowed by CORS"));
    },
    credentials: true
  }));
} else {
  // fallback si no defines FRONTEND_ORIGIN
  app.use(buildCors());
}

// =========================
// 🔒 Seguridad
// =========================
security(app);

// =========================
// Parsers
// =========================
app.use(cookieParser());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: false }));

// =========================
// 🛡️ CSRF
// =========================
mountCsrf(app, { basePath: '/api' });

// =========================
// 📂 Conexión DB
// =========================
await connectDB();

// =========================
// 🚀 Rutas API
// =========================
app.use('/api/v1', apiV1);
app.use('/api', apiV1);

// Sitemap dinámico en raíz
app.use('/', sitemapPostsRouter);

// Alias rápido de perfil
app.get('/api/users/profile', auth, async (req, res) => {
  const user = await User.findById(req.user.id).lean();
  if (!user) return res.status(404).json({ ok: false, error: 'User not found' });
  res.json({
    id: user._id,
    name: user.name,
    email: user.email,
    wallet: user.wallet,
    role: user.role,
    locale: user.locale || 'es',
  });
});

// =========================
// 🩺 Healthcheck
// =========================
app.get('/health', (_req, res) => {
  res.json({ ok: true, status: "running", env: NODE_ENV });
});

// =========================
// ❌ 404
// =========================
app.use((req, res) => {
  res.status(404).json({ ok: false, error: 'Not found' });
});

// =========================
// ⚠️ Handler de errores
// =========================
app.use((err, req, res, _next) => {
  req.log?.error({ err }, 'Unhandled error');
  const status = err.status || 500;
  const msg =
    err.code === 'EBADCSRFTOKEN'
      ? 'CSRF token invalid'
      : err.message || 'Internal error';
  res.status(status).json({ ok: false, error: msg });
});

// =========================
// ▶️ Start
// =========================
app.listen(PORT, () => {
  logger.info({ msg: `Servidor en ${PUBLIC_URL} (env ${NODE_ENV})` });
});
