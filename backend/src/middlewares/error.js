// backend/src/middlewares/error.js
import logger from '../config/logger.js';

// 404 middleware
export function notFound(req, res, _next) {
  const msg = req.t ? req.t('common.notFound') : 'Not Found';
  res.status(404).json({ ok: false, error: msg });
}

// Centralized error handler
export function errorHandler(err, req, res, _next) {
  const status = err.status || err.statusCode || 500;

  // CORS bloqueado (definido en app.js)
  if (err && err.message === 'CORS blocked') {
    return res.status(403).json({ ok: false, error: 'CORS blocked' });
  }

  // Mensaje traducible si i18n está cargado
  const msg =
    status >= 500
      ? (req.t ? req.t('common.serverError') : 'Internal server error')
      : err.message || (req.t ? req.t('common.requestError') : 'Request error');

  // Log siempre en servidor
  logger.error({ err, path: req.originalUrl }, 'Error en middleware');

  // En dev: devolvemos detalle adicional
  if (process.env.NODE_ENV !== 'production') {
    return res.status(status).json({
      ok: false,
      error: msg,
      details: err.message || String(err),
      stack: err.stack,
    });
  }

  // En prod: respuesta limpia
  return res.status(status).json({ ok: false, error: msg });
}
