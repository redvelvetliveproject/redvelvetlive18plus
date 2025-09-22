// backend/src/middlewares/rateLimit.js
import rateLimit from 'express-rate-limit';
import logger from '../config/logger.js';

/**
 * Lee enteros desde env con fallback.
 */
function envInt(name, def) {
  const v = parseInt(process.env[name], 10);
  return Number.isFinite(v) ? v : def;
}

const isProd = process.env.NODE_ENV === 'production';

/**
 * Público (GET, health, listados, estáticos proxied).
 * Prod: más alto (páginas públicas).
 * Dev: más bajo para testear.
 */
export const publicLimiter = rateLimit({
  windowMs: envInt('RATE_LIMIT_PUBLIC_WINDOW_MS', 60_000),             // 1 min
  max: envInt('RATE_LIMIT_PUBLIC_MAX', isProd ? 300 : 120),            // req/min/IP
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn(`[rate-limit] Público bloqueado ${req.ip}`);
    res.status(429).json({ ok: false, error: 'Too many requests. Please try again later.' });
  }
});

/**
 * Auth (login, register, refresh): estricto para frenar bruteforce.
 */
export const authLimiter = rateLimit({
  windowMs: envInt('RATE_LIMIT_AUTH_WINDOW_MS', 60_000),               // 1 min
  max: envInt('RATE_LIMIT_AUTH_MAX', 10),                              // 10 req/min/IP
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn(`[rate-limit] Auth bloqueado ${req.ip}`);
    res.status(429).json({ ok: false, error: 'Too many auth requests, slow down.' });
  }
});

/**
 * Utilidad para crear límites ad-hoc por ruta.
 * Ej: app.use('/api/payments', makeLimiter({ windowMs: 15*60_000, max: 30 }))
 */
export function makeLimiter({ windowMs = 60_000, max = 60, message } = {}) {
  return rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      logger.warn(`[rate-limit] Custom bloqueado ${req.ip}`);
      res.status(429).json(message || { ok: false, error: 'Too many requests' });
    }
  });
}
