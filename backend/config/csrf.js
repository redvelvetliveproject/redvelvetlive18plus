import csrf from 'csurf';

export function mountCsrf(app, { basePath = '/api' } = {}) {
  const csrfProtection = csrf({ cookie: true });
  app.use(basePath, csrfProtection);
}
