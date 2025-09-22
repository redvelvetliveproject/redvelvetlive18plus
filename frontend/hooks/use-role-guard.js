<<<<<<< HEAD
// frontend/hooks/use-role-guard.js
// Redirige si el usuario no cumple el rol requerido en <body data-role-required="...">

import { getSessionProfile } from './use-session.js';

export async function enforceRoleGuard({ redirectTo = './login.html' } = {}) {
  const required = (document.body.getAttribute('data-role-required') || '').trim().toLowerCase();
  if (!required) return true; // no hay restricción

  const u = await getSessionProfile();
  if (!u || (u.role || '').toLowerCase() !== required) {
    window.location.href = redirectTo;
    return false;
  }
  return true;
}
=======
// frontend/hooks/use-role-guard.js
// Redirige si el usuario no cumple el rol requerido en <body data-role-required="...">

import { getSessionProfile } from './use-session.js';

export async function enforceRoleGuard({ redirectTo = './login.html' } = {}) {
  const required = (document.body.getAttribute('data-role-required') || '').trim().toLowerCase();
  if (!required) return true; // no hay restricción

  const u = await getSessionProfile();
  if (!u || (u.role || '').toLowerCase() !== required) {
    window.location.href = redirectTo;
    return false;
  }
  return true;
}
>>>>>>> 685d169 (Primer commit limpio)
