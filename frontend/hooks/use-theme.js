<<<<<<< HEAD
// frontend/hooks/use-theme.js
// Control de modo claro/oscuro con prefers-color-scheme y persistencia

const LS_THEME = 'rvtheme'; // 'light' | 'dark' | 'system'

export function getTheme() {
  try { return localStorage.getItem(LS_THEME) || 'system'; } catch { return 'system'; }
}

export function setTheme(next) {
  try { localStorage.setItem(LS_THEME, next); } catch {}
  applyTheme(next);
}

export function applyTheme(mode = getTheme()) {
  const root = document.documentElement;
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

  let dark = false;
  if (mode === 'dark') dark = true;
  else if (mode === 'light') dark = false;
  else dark = prefersDark;

  root.classList.toggle('theme-dark', dark);
  root.classList.toggle('theme-light', !dark);
}

export function bindThemeToggle(selector = '#themeToggle') {
  const btn = document.querySelector(selector);
  if (!btn) return;

  const updateLabel = () => {
    const cur = getTheme();
    btn.textContent = cur === 'dark' ? '🌙' : cur === 'light' ? '☀️' : '🖥️';
    btn.title = `Tema: ${cur}`;
  };

  btn.addEventListener('click', () => {
    const cur = getTheme();
    const next = cur === 'system' ? 'light' : cur === 'light' ? 'dark' : 'system';
    setTheme(next);
    updateLabel();
  });

  // inicial
  applyTheme();
  updateLabel();
}
=======
// frontend/hooks/use-theme.js
// Control de modo claro/oscuro con prefers-color-scheme y persistencia

const LS_THEME = 'rvtheme'; // 'light' | 'dark' | 'system'

export function getTheme() {
  try { return localStorage.getItem(LS_THEME) || 'system'; } catch { return 'system'; }
}

export function setTheme(next) {
  try { localStorage.setItem(LS_THEME, next); } catch {}
  applyTheme(next);
}

export function applyTheme(mode = getTheme()) {
  const root = document.documentElement;
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

  let dark = false;
  if (mode === 'dark') dark = true;
  else if (mode === 'light') dark = false;
  else dark = prefersDark;

  root.classList.toggle('theme-dark', dark);
  root.classList.toggle('theme-light', !dark);
}

export function bindThemeToggle(selector = '#themeToggle') {
  const btn = document.querySelector(selector);
  if (!btn) return;

  const updateLabel = () => {
    const cur = getTheme();
    btn.textContent = cur === 'dark' ? '🌙' : cur === 'light' ? '☀️' : '🖥️';
    btn.title = `Tema: ${cur}`;
  };

  btn.addEventListener('click', () => {
    const cur = getTheme();
    const next = cur === 'system' ? 'light' : cur === 'light' ? 'dark' : 'system';
    setTheme(next);
    updateLabel();
  });

  // inicial
  applyTheme();
  updateLabel();
}
>>>>>>> 685d169 (Primer commit limpio)
