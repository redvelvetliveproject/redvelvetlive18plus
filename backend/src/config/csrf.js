import csurf from 'csurf';
import env from './env.js';

export function mountCsrf(app, { basePath = '/api' } = {}) {
  const sameSite = (env.COOKIE_SAMESITE || 'lax').toLowerCase();
  const secure = !!env.COOKIE_SECURE;

  const csrfMw = csurf({
    cookie: {
      httpOnly: true,
      sameSite,
      secure,
      path: '/',
      maxAge: 60 * 60 * 1000,
    },
    value: (req) => req.headers['x-csrf-token'],
  });

  app.use(basePath, (req, res, next) => {
    const method = req.method.toUpperCase();
    const isMutating = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method);
    return isMutating ? csrfMw(req, res, next) : next();
  });

  app.get(`${basePath}/csrf`, (req, res) => {
    const token = req.csrfToken ? req.csrfToken() : '';
    res.json({ ok: true, csrfToken: token });
  });
}
