// frontend/hooks/use-api.js
// Wrapper para llamadas a la API con cookies httpOnly y base dinámica

import { useMemo } from 'react';

export function createApi(
  base =
    process.env.NEXT_PUBLIC_API_URL || 
    import.meta.env?.VITE_API_BASE || 
    (typeof window !== 'undefined' && window.API_BASE) || 
    '/api'
) {
  async function request(path, { method = 'GET', headers = {}, body, ...rest } = {}) {
    const url = `${base.replace(/\/$/, '')}${path.startsWith('/') ? path : `/${path}`}`;

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

    let res;
    try {
      res = await fetch(url, init);
    } catch (networkErr) {
      console.error('[API] Error de red o CORS:', networkErr);
      throw new Error('No se pudo conectar con el servidor. Verifica tu conexión o el dominio de la API.');
    }

    let data = null;
    try {
      data = await res.json();
    } catch {
      // Si no es JSON, no pasa nada
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

