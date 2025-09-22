// backend/src/middlewares/auth.js
import jwt from 'jsonwebtoken';
import logger from '../config/logger.js';

/**
 * Extrae el token JWT de:
 * - Authorization: Bearer <token>
 * - Cookie httpOnly: accessToken=<jwt>
 */
function getToken(req) {
  const h = req.headers.authorization || '';
  if (h.toLowerCase().startsWith('bearer ')) return h.slice(7).trim();
  if (req.cookies?.accessToken) return req.cookies.accessToken;
  if (req.cookies?.token) return req.cookies.token; // compat
  return null;
}

export function auth(req, res, next) {
  try {
    const token = getToken(req);
    if (!token) {
      return res.status(401).json({ ok: false, error: 'Unauthorized' });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      logger.error('Falta JWT_SECRET en .env');
      return res.status(500).json({ ok: false, error: 'Server misconfigured' });
    }

    const payload = jwt.verify(token, secret);
    req.user = {
      id: payload.sub || payload.uid,
      role: payload.role || 'client',
      email: payload.email,
      name: payload.name,
    };
    next();
  } catch (err) {
    logger.warn({ err }, 'Token inválido o expirado');
    return res.status(401).json({ ok: false, error: 'Invalid or expired token' });
  }
}

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ ok: false, error: 'Forbidden' });
    }
    next();
  };
}

