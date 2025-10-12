// backend/src/app.js
import 'dotenv/config';
import express from 'express';
import cookieParser from 'cookie-parser';
import pinoHttp from 'pino-http';
import cors from 'cors';

import logger from '../config/logger.js';
import security from '../config/security.js';
import { mountCsrf } from '../config/csrf.js';
import connectDB from '../config/db.js';

import apiV1 from './routes/index.js';
import sitemapPostsRouter from './routes/sitemap.posts.routes.js';
import { auth } from './middlewares/auth.js';
import User from './models/User.js';

// ✅ Importamos la nueva ruta pública de modelos
import modelsPublicRouter from './routes/models.public.routes.js';

const {
  NODE_ENV = 'development',
  PUBLIC_URL = process.env.PUBLIC_URL || 'http://localhost:5000',
  FRONTEND_ORIGIN
} = process.env;

const app = express();
app.set('trust proxy', 1);

// 🧰 Logging de peticiones
app.use(pinoHttp({ logger }));

// 🌐 Configuración dinámica de CORS
if (FRONTEND_ORIGIN) {
  const allowed = FRONTEND_ORIGIN.split(',').map((s) => s.trim());
  app.use(
    cors({
      origin: (origin, cb) => {
        if (!origin || allowed.includes(origin)) return cb(null, true);
        cb(new Error('Not allowed by CORS'));
      },
      credentials: true,
    })
  );
} else {
  const buildCors = (await import('../config/cors.js')).default;
  app.use(buildCors());
}

// 🔐 Seguridad y middlewares globales
security(app);

// 📦 Parsers de JSON y cookies
app.use(cookieParser());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: false }));

// 🛡️ Protección CSRF
mountCsrf(app, { basePath: '/api' });

// 🗄️ Conexión con MongoDB
await connectDB();

// 📁 Rutas principales del proyecto
app.use('/api/v1', apiV1);
app.use('/api', apiV1);

// 🌐 Nueva ruta pública para explorador de modelos
app.use('/api/models', modelsPublicRouter);

// 🗺️ Sitemap para SEO
app.use('/', sitemapPostsRouter);

// 👤 Endpoint de perfil del usuario autenticado
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

// ✅ Endpoint de salud (monitorización)
app.get('/health', (_req, res) => {
  res.json({ ok: true, status: 'running', env: NODE_ENV });
});

// 🛑 404 handler global
app.use((req, res) => {
  res.status(404).json({ ok: false, error: 'Not found' });
});

// 🛠️ Manejador global de errores
app.use((err, req, res, _next) => {
  req.log?.error({ err }, 'Unhandled error');
  const status = err.status || 500;
  const msg =
    err.code === 'EBADCSRFTOKEN'
      ? 'CSRF token invalid'
      : err.message || 'Internal error';
  res.status(status).json({ ok: false, error: msg });
});

export default app;


