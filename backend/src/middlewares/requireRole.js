// backend/src/middlewares/requireRole.js
/**
 * Middleware para exigir uno o varios roles.
 * Uso:
 *   router.get('/admin', requireRole('admin'), handler)
 */
export const requireRole = (...roles) => (req, res, next) => {
  const have = (req.user?.role || '').toLowerCase();
  const allowed = roles.map(r => r.toLowerCase());
  if (!have || (allowed.length && !allowed.includes(have))) {
    return res.status(403).json({ ok: false, error: 'Forbidden' });
  }
  next();
};
