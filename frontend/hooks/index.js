// frontend/hooks/index.js

// API
export { createApi, useApi } from './use-api.js';

// Formularios e i18n
export { createForm } from './use-form.js';
export { applyI18n, wireLangToggle, t as translate, setLang, getLang } from './use-i18n.js';

// Roles y sesión
export { enforceRoleGuard } from './use-role-guard.js';
export { getSession, setSession, clearSession } from './use-session.js';
export { storage } from './use-storage.js';

// Nuevos
export { createAuth } from './use-auth.js';
export { validators, validate, validateFormElement } from './use-validation.js';
export { createRealtime } from './use-realtime.js';
export { createAnalytics } from './use-analytics.js';
export { getTheme, setTheme, applyTheme, bindThemeToggle } from './use-theme.js';
