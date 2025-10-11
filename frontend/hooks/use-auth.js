// frontend/hooks/use-auth.js
// Encapsula login, logout, refresh y perfil usando cookies httpOnly + API segura

import { createApi } from './use-api.js';

const LS_USER = 'rvl_user'; // opcional: cachear perfil para UI rápida

export function createAuth() {
  const api = createApi();

  /** 📦 Guarda o borra el perfil en localStorage (opcional, solo para UI) */
  function cacheUser(user) {
    try {
      if (user) localStorage.setItem(LS_USER, JSON.stringify(user));
      else localStorage.removeItem(LS_USER);
    } catch {}
  }

  /** 👤 Obtiene perfil actual desde cache o API */
  async function getProfile({ force = false } = {}) {
    if (!force) {
      try {
        const raw = localStorage.getItem(LS_USER);
        if (raw) return JSON.parse(raw);
      } catch {}
    }

    try {
      const user = await api.get('/users/profile');
      if (user?.id) cacheUser(user);
      return user;
    } catch (err) {
      console.error('[Auth] No se pudo obtener el perfil:', err.message);
      return null;
    }
  }

  /** 🔑 Login con email y contraseña */
  async function loginWithEmail({ email, password, captchaToken, persistUser = true }) {
    if (!email || !password) throw new Error('Email y contraseña requeridos');
    const payload = { email, password, captchaToken };

    const res = await api.post('/auth/login', payload);
    if (persistUser && res?.user) cacheUser(res.user);
    return res;
  }

  /** 🔐 Login con wallet */
  async function loginWithWallet({ wallet, captchaToken, persistUser = true }) {
    if (!wallet) throw new Error('Dirección de wallet requerida');
    const payload = { wallet, captchaToken };

    const res = await api.post('/auth/login', payload);
    if (persistUser && res?.user) cacheUser(res.user);
    return res;
  }

  /** 🧾 Registro (email o wallet) */
  async function register({ name, email, password, wallet, role = 'client', captchaToken, persistUser = true }) {
    const payload = { name, email, password, wallet, role, captchaToken };
    const res = await api.post('/auth/register', payload);
    if (persistUser && res?.user) cacheUser(res.user);
    return res;
  }

  /** ♻️ Refresca JWT si existe cookie válida */
  async function refresh() {
    try {
      return await api.post('/auth/refresh', {});
    } catch (e) {
      console.warn('[Auth] No se pudo refrescar sesión:', e.message);
      return null;
    }
  }

  /** 🚪 Cierra sesión en servidor y limpia cache */
  async function logout() {
    try {
      await api.post('/auth/logout', {});
    } catch (e) {
      console.warn('[Auth] Error al cerrar sesión:', e.message);
    }
    cacheUser(null);
  }

  /** ✅ Verifica si hay sesión activa */
  async function isLoggedIn() {
    const user = await getProfile();
    return !!user?.id;
  }

  return {
    getProfile,
    loginWithEmail,
    loginWithWallet,
    register,
    refresh,
    logout,
    isLoggedIn,
  };
}

