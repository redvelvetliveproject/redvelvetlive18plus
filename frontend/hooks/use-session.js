// frontend/hooks/use-session.js
// Obtiene y gestiona el perfil de sesión desde cookie httpOnly y caché local.

import { createApi } from './use-api.js';
const api = createApi();

let _cache = null; // cache en memoria para evitar múltiples llamadas

/**
 * 📡 Obtiene el perfil de sesión actual
 * @param {object} opts - { force: boolean } fuerza actualización desde el backend
 */
export async function getSessionProfile({ force = false } = {}) {
  if (_cache && !force) return _cache;

  try {
    const user = await api.get('/users/profile');
    if (user && user.id) {
      _cache = user;
      try { localStorage.setItem('rvl_user', JSON.stringify(user)); } catch {}
    } else {
      _cache = null;
    }
  } catch {
    _cache = null;
  }

  return _cache;
}

/**
 * 🔁 Revalida la sesión sin romper la app si expira
 */
export async function refreshSession() {
  try {
    return await getSessionProfile({ force: true });
  } catch {
    return null;
  }
}

/**
 * 🚪 Cierra la sesión en backend + limpia el estado local
 */
export async function logout() {
  try { await api.post('/auth/logout'); } catch {}
  try { localStorage.removeItem('jwt_token'); localStorage.removeItem('rvl_user'); } catch {}
  _cache = null;
  return true;
}

/**
 * ✅ Verifica si hay sesión activa rápidamente
 */
export function isAuthenticated() {
  try {
    const u = _cache || JSON.parse(localStorage.getItem('rvl_user') || 'null');
    return !!(u && u.id);
  } catch {
    return false;
  }
}

