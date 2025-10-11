// frontend/hooks/use-theme.js
// Control del tema claro/oscuro con persistencia, SSR-safe y eventos personalizados

const LS_THEME = 'rvtheme'; // valores: 'light' | 'dark' | 'system'

/**
 * 📦 Obtiene el tema actual del almacenamiento
 */
export function getTheme() {
  try { return localStorage.getItem(LS_THEME) || 'system'; } catch { return 'system'; }
}

/**
 * 💾 Establece el tema y lo aplica inmediatamente
 */
export function setTheme(next) {
  try { localStorage.setItem(LS_THEME, next); } catch {}
  applyTheme(next);
  document.dispatchEvent(new CustomEvent('themechange', { detail: next }));
}

/**
 * 🖥️ Aplica el tema al DOM con soporte para `prefers-color-scheme`
 */
export function applyTheme(mode = getTheme()) {
  if (typeof window === 'undefined') return;
  const root = document.documentElement;
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

  let dark = false;
  if (mode === 'dark') dark = true;
  else if (mode === 'light') dark = false;
  else dark = prefersDark;

  root.classList.toggle('theme-dark', dark);
  root.classList.toggle('theme-light', !dark);
  root.style.transition = 'background-color 0.3s, color 0.3s';
}

/**
 * 🔘 Conecta el botón de cambio de tema
 */
export function bindThemeToggle(selector = '#themeToggle') {
  const btn = document.querySelector(selector);
  if (!btn) return;

  const updateLabel = () => {
    const cur = getTheme();
    btn.textContent = cur === 'dark' ? '🌙' : cur === 'light' ? '☀️' : '🖥️';
    btn.title = `Tema: ${cur}`;
    btn.setAttribute('aria-label', `Cambiar tema (${cur})`);
  };

  btn.addEventListener('click', () => {
    const cur = getTheme();
    const next = cur === 'system' ? 'light' : cur === 'light' ? 'dark' : 'system';
    setTheme(next);
    updateLabel();
  });

  applyTheme();
  updateLabel();
}

/**
 * 🚀 Inicializa el tema automáticamente al cargar la página
 */
export function initTheme() {
  document.addEventListener('DOMContentLoaded', () => applyTheme());
}

