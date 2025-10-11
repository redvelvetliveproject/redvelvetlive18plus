// frontend/hooks/use-i18n.js
// i18n ligero con soporte para data-i18n y atributos múltiples

const DEFAULT_LANG = 'es';
const LS_KEY = 'rvlang';

// Diccionario base (puedes reemplazar por carga remota si lo deseas)
const DICT = {
  es: {
    'nav.home': 'Inicio',
    'nav.register': 'Regístrate',
    'nav.login': 'Iniciar sesión',
    'nav.profile': 'Perfil',
    'nav.logout': 'Cerrar sesión',
    'footer.terms': 'Términos de servicio',
    'footer.privacy': 'Política de privacidad',
    'footer.contact': 'Contacto',

    'dashboard.heading': 'Dashboard',
    'dashboard.welcome': 'Bienvenido',
    'dashboard.kpi.tips': 'Tips',
    'dashboard.kpi.following': 'Seguidos',
    'dashboard.kpi.balance': 'Saldo',
  },
  en: {
    'nav.home': 'Home',
    'nav.register': 'Sign up',
    'nav.login': 'Log in',
    'nav.profile': 'Profile',
    'nav.logout': 'Log out',
    'footer.terms': 'Terms of Service',
    'footer.privacy': 'Privacy Policy',
    'footer.contact': 'Contact',

    'dashboard.heading': 'Dashboard',
    'dashboard.welcome': 'Welcome',
    'dashboard.kpi.tips': 'Tips',
    'dashboard.kpi.following': 'Following',
    'dashboard.kpi.balance': 'Balance',
  }
};

export function getLang() {
  try { return localStorage.getItem(LS_KEY) || DEFAULT_LANG; } catch { return DEFAULT_LANG; }
}

export function setLang(code) {
  try { localStorage.setItem(LS_KEY, code); } catch {}
}

export function t(key) {
  const lang = getLang();
  return (DICT[lang] && DICT[lang][key]) || (DICT[DEFAULT_LANG][key] || key);
}

export function applyI18n(root = document) {
  root.querySelectorAll('[data-i18n]').forEach((el) => {
    const key = el.getAttribute('data-i18n');
    const attr = el.getAttribute('data-i18n-attr'); // ej. placeholder,title
    const text = t(key);

    if (attr) {
      attr.split(',').forEach(a => el.setAttribute(a.trim(), text));
    } else {
      el.textContent = text;
    }
  });
}

export function wireLangToggle(btn = document.getElementById('langToggle')) {
  if (!btn) return;
  const update = () => {
    const curr = getLang();
    btn.textContent = curr.toUpperCase();
    btn.title = curr === 'es' ? 'Cambiar a inglés' : 'Switch to Spanish';
    btn.setAttribute('aria-label', btn.title);
  };
  update();
  btn.addEventListener('click', () => {
    const next = getLang() === 'es' ? 'en' : 'es';
    setLang(next);
    applyI18n();
    update();
  });
}

