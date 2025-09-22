// frontend/hooks/use-api.js
// Minimal wrapper para llamadas a la API con cookies httpOnly.

import { useMemo } from 'react';

export function createApi(base = (window.API_BASE || import.meta.env?.VITE_API_BASE || '/api')) {
  async function request(path, { method = 'GET', headers = {}, body, ...rest } = {}) {
    const init = {
      method,
      credentials: 'include',
      headers: { Accept: 'application/json', ...headers },
      ...rest,
    };

    if (body && !(body instanceof FormData)) {
      init.headers['Content-Type'] = init.headers['Content-Type'] || 'application/json';
      init.body = typeof body === 'string' ? body : JSON.stringify(body);
    } else if (body instanceof FormData) {
      init.body = body; // no tocar headers
    }

    const res = await fetch(`${base}${path}`, init);

    let data = null;
    try {
      data = await res.json();
    } catch {
      /* noop */
    }

    if (!res.ok) {
      const msg = (data && (data.error || data.message)) || `HTTP ${res.status}`;
      if (import.meta.env?.DEV) {
        console.error('[API error]', msg, data);
      }
      const err = new Error(msg);
      err.status = res.status;
      err.data = data;
      throw err;
    }

    return data;
  }

  return {
    get: (p, opts) => request(p, { ...opts, method: 'GET' }),
    post: (p, body, opts) => request(p, { ...opts, method: 'POST', body }),
    put: (p, body, opts) => request(p, { ...opts, method: 'PUT', body }),
    del: (p, opts) => request(p, { ...opts, method: 'DELETE' }),
    raw: request,
    base,
  };
}

// Hook React para instanciar la API una sola vez
export function useApi(base) {
  return useMemo(() => createApi(base), [base]);
}
