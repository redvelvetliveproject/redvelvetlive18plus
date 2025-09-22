<<<<<<< HEAD
// frontend/hooks/use-session.js
// Obtiene el perfil de sesión desde cookie httpOnly (si existe).

import { createApi } from './use-api.js';
const api = createApi();

let _cache = null; // cache en memoria por navegación

export async function getSessionProfile({ force = false } = {}) {
  if (_cache && !force) return _cache;
  try {
    const u = await api.get('/users/profile');
    _cache = u || null;
  } catch {
    _cache = null;
  }
  return _cache;
}

export async function logout() {
  try { await api.post('/auth/logout'); } catch {}
  try { localStorage.removeItem('jwt_token'); } catch {}
  _cache = null;
  return true;
}
=======
// frontend/hooks/use-session.js
// Obtiene el perfil de sesión desde cookie httpOnly (si existe).

import { createApi } from './use-api.js';
const api = createApi();

let _cache = null; // cache en memoria por navegación

export async function getSessionProfile({ force = false } = {}) {
  if (_cache && !force) return _cache;
  try {
    const u = await api.get('/users/profile');
    _cache = u || null;
  } catch {
    _cache = null;
  }
  return _cache;
}

export async function logout() {
  try { await api.post('/auth/logout'); } catch {}
  try { localStorage.removeItem('jwt_token'); } catch {}
  _cache = null;
  return true;
}
>>>>>>> 685d169 (Primer commit limpio)
