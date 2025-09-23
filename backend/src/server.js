import 'dotenv/config';
import express from 'express';
import cookieParser from 'cookie-parser';
import pinoHttp from 'pino-http';
import cors from 'cors';

import logger from './config/logger.js';
import buildCors from './config/cors.js';
import security from './config/security.js';
import { mountCsrf } from './config/csrf.js';
import connectDB from './config/db.js';

import apiV1 from './routes/index.js';
import sitemapPostsRouter from './routes/sitemap.posts.routes.js';

import { auth } from './middlewares/auth.js';
import User from './models/User.js';

const {
  NODE_ENV = 'development',
  PORT = 3001,
  PUBLIC_URL = `http://localhost:${PORT}`,
  FRONTEND_ORIGIN
} = process.env;

const app = express();
app.set('trust proxy', 1);

// Logs
app.use(pinoHttp({ logger }));

// CORS dinámico
if (FRONTEND_ORIGIN) {
  const allowed = FRONTEND_ORIGIN.split(',').map(s => s.trim());
  app.use(cors({
    origin: (origin, cb) => {
      if (!origin || allowed.includes(origin)) return cb(null, true);
      cb(new Error('Not allowed by CORS'));
    },
    credentials: true
  }));
} else {
  // Fallback si FRONTEND_ORIGIN no está definido
  app.use(buildCors());
}

// Seguridad
security(app);

// Parsers
app.use(cookieParser());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: false }));

// CSRF (asumiendo que tienes rutas bajo /api)
mountCsrf(app, { basePath: '/api' });

// Conexión a la base de datos
await connectDB();

// Rutas principales
app.use('/api/v1', apiV1);
app.use('/api', apiV1);

// Ruta home / sitemap dinámico
app.use('/', sitemapPostsRouter);

// Ruta de perfil autenticado
app.get('/api/users/profile', auth, async (req, res) => {
  try {
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
  } catch (err) {
    // Puedes añadir manejo de errores aquí
    logger.error({ err }, 'Error perfil usuario');
    res.status(500).json({ ok: false, error: 'Internal server error' });
  }
});

// Healthcheck
app.get('/health', (_req, res) => {
  res.json({ ok: true, status: 'running', env: NODE_ENV });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ ok: false, error: 'Not found' });
});

// Error handling middleware
app.use((err, req, res, _next) => {
  req.log?.error({ err }, 'Unhandled error');
  const status = err.status || 500;
  const msg = err.code === 'EBADCSRFTOKEN'
    ? 'CSRF token invalid'
    : err.message || 'Internal error';
  res.status(status).json({ ok: false, error: msg });
});

// Start del servidor
app.listen(PORT, () => {
  logger.info({ msg: `Servidor corriendo en ${PUBLIC_URL} (env ${NODE_ENV})` });
});
