// frontend/hooks/use-auth.js
// Encapsula login, logout, refresh y profile usando cookies httpOnly
// Usa tu wrapper de API existente (use-api.js)

import { createApi } from './use-api.js';

const LS_USER = 'rvl_user'; // opcional: cachear perfil para UI rápida

export function createAuth() {
  const api = createApi();

  /** Guarda/borra el perfil en localStorage (opcional) */
  function cacheUser(user) {
    try {
      if (user) localStorage.setItem(LS_USER, JSON.stringify(user));
      else localStorage.removeItem(LS_USER);
    } catch {}
  }

  /** Obtiene el perfil desde el servidor (o cache si existe) */
  async function getProfile({ force = false } = {}) {
    if (!force) {
      try {
        const raw = localStorage.getItem(LS_USER);
        if (raw) return JSON.parse(raw);
      } catch {}
    }
    const user = await api.get('/users/profile'); // requiere cookie httpOnly 'token'
    if (user && user.id) cacheUser(user);
    return user;
  }

  /** Login con email+password */
  async function loginWithEmail({ email, password, captchaToken, persistUser = true }) {
    const payload = { email, password };
    if (captchaToken) payload.captchaToken = captchaToken;

    const res = await api.post('/auth/login', payload);
    if (persistUser && res?.user) cacheUser(res.user);
    return res;
  }

  /** Login con wallet (sin password) */
  async function loginWithWallet({ wallet, captchaToken, persistUser = true }) {
    const payload = { wallet };
    if (captchaToken) payload.captchaToken = captchaToken;

    const res = await api.post('/auth/login', payload);
    if (persistUser && res?.user) cacheUser(res.user);
    return res;
  }

  /** Registro (email+password o wallet) */
  async function register({ name, email, password, wallet, role = 'client', captchaToken, persistUser = true }) {
    const payload = { name, email, password, wallet, role };
    if (captchaToken) payload.captchaToken = captchaToken;

    const res = await api.post('/auth/register', payload);
    if (persistUser && res?.user) cacheUser(res.user);
    return res;
  }

  /** Refresca JWT */
  async function refresh() {
    return api.post('/auth/refresh', {});
  }

  /** Logout en servidor y limpieza local */
  async function logout() {
    try { await api.post('/auth/logout', {}); } catch {}
    cacheUser(null);
  }

  return {
    getProfile,
    loginWithEmail,
    loginWithWallet,
    register,
    refresh,
    logout,
  };
}
