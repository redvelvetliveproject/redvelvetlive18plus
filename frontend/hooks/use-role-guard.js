// frontend/hooks/use-role-guard.js
// Redirige si el usuario no cumple el rol requerido definido en <body data-role-required="...">

import { getSessionProfile } from './use-session.js';

export async function enforceRoleGuard({ redirectTo = './login.html' } = {}) {
  const requiredRaw = (document.body.getAttribute('data-role-required') || '').trim();
  if (!requiredRaw) return true; // sin restricción

  const requiredRoles = requiredRaw
    .split(',')
    .map(r => r.trim().toLowerCase())
    .filter(Boolean);

  const user = await getSessionProfile();

  const userRole = (user?.role || '').toLowerCase();
  const authorized = requiredRoles.includes(userRole);

  if (!authorized) {
    if (import.meta.env?.DEV) {
      console.warn(`[RoleGuard] Rol requerido: ${requiredRoles.join(', ')} | Rol actual: ${userRole || 'ninguno'}`);
    }
    window.location.href = encodeURI(redirectTo);
    return false;
  }

  return true;
}

