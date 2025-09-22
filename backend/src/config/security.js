// backend/src/config/security.js
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import rateLimit from 'express-rate-limit';
import logger from './logger.js';

export default function security(app) {
  app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
  app.use(mongoSanitize());

  // Limit básico para /api/*
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 300, // máximo 300 requests por ventana
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      logger.warn(`[rate-limit] Bloqueado ${req.ip}`);
      res.status(429).json({ ok: false, error: 'Too many requests, slow down.' });
    }
  });

  app.use('/api', limiter);
}
