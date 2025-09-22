// /public/js/navigation.js
// Nav + i18n + sesión + tema claro/oscuro, listo para producción.
// Funciona aunque los partials se inserten asíncronamente por includes.js.

(function () {
  const API_BASE = (typeof window !== "undefined" && window.API_BASE) ? window.API_BASE : "/api";
  const LS_KEYS = { lang: "rvlang", token: "jwt_token", theme: "rvl_theme" };
  const DEFAULT_LANG = "es";

  // ---------- I18N ----------
  const I18N = {
    es: {
      "nav.home": "Inicio",
      "nav.register": "Regístrate",
      "nav.login": "Iniciar sesión",
      "nav.ranking": "Ranking",
      "nav.profile": "Perfil",
      "nav.logout": "Cerrar sesión",
      "footer.terms": "Términos de servicio",
      "footer.privacy": "Política de privacidad",
      "footer.contact": "Contacto",
      "nav.dashboard": "Dashboard",
      "nav.wallet": "Wallet",
      "nav.notifications": "Notificaciones",
      "nav.support": "Soporte",
    },
    en: {
      "nav.home": "Home",
      "nav.register": "Sign up",
      "nav.login": "Log in",
      "nav.ranking": "Ranking",
      "nav.profile": "Profile",
      "nav.logout": "Log out",
      "footer.terms": "Terms of Service",
      "footer.privacy": "Privacy Policy",
      "footer.contact": "Contact",
      "nav.dashboard": "Dashboard",
      "nav.wallet": "Wallet",
      "nav.notifications": "Notifications",
      "nav.support": "Support",
    },
  };

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  function getLang() {
    try { return localStorage.getItem(LS_KEYS.lang) || DEFAULT_LANG; } catch { return DEFAULT_LANG; }
  }
  function setLang(code) {
    try { localStorage.setItem(LS_KEYS.lang, code); } catch {}
  }
  function t(key) {
    const lang = getLang();
    return (I18N[lang] && I18N[lang][key]) || (I18N[DEFAULT_LANG][key] || key);
  }
  function applyI18n(root = document) {
    $$("[data-i18n]", root).forEach(el => {
      const key = el.getAttribute("data-i18n");
      el.textContent = t(key);
    });
  }

  async function safeJson(res) { try { return await res.json(); } catch { return null; } }
  async function api(path, opts = {}) {
    const url = `${API_BASE}${path}`;
    const init = Object.assign({ method: "GET", credentials: "include" }, opts);
    let res;
    try { res = await fetch(url, init); } catch { return null; }
    if (!res.ok) return null;
    return safeJson(res);
  }

  async function getSessionProfile() {
    try {
      const data = await api("/users/profile");
      window.__SESSION = data || null;
      return data;
    } catch {
      window.__SESSION = null;
      return null;
    }
  }

  async function setAuthUI() {
    const elLogin = $("#navLogin");
    const elRegister = $("#navRegister");
    const elProfile = $("#navProfile");
    const elLogout = $("#navLogout");

    if (elProfile) elProfile.style.display = "none";
    if (elLogout) elLogout.style.display = "none";
    if (elLogin) elLogin.style.display = "";
    if (elRegister) elRegister.style.display = "";

    const user = await getSessionProfile();
    if (user) {
      if (elProfile) elProfile.style.display = "";
      if (elLogout) elLogout.style.display = "";
      if (elLogin) elLogin.style.display = "none";
      if (elRegister) elRegister.style.display = "none";
    }
  }

  function wireLogout() {
    const elLogout = $("#navLogout");
    if (!elLogout || elLogout.__bound) return;
    elLogout.__bound = true;
    elLogout.addEventListener("click", async (e) => {
      e.preventDefault();
      try { await api("/auth/logout", { method: "POST" }); } catch {}
      window.location.href = "/index.html";
    });
  }

  function markActiveLink() {
    const mainNav = $("#mainNav");
    if (!mainNav) return;
    const here = location.pathname.replace(/[?#].*$/, "").replace(/\/+$/, "");
    $$("#mainNav a").forEach((a) => {
      const target = (a.getAttribute("href") || "").replace(/[?#].*$/, "").replace(/\/+$/, "");
      if (here.endsWith(target)) {
        a.classList.add("active-link");
        a.setAttribute("aria-current", "page");
      } else {
        a.classList.remove("active-link");
        a.removeAttribute("aria-current");
      }
    });
  }

  function setupMenuToggle() {
    const menuToggle = $("#menuToggle");
    const mainNav = $("#mainNav");
    if (!menuToggle || !mainNav || menuToggle.__bound) return;
    menuToggle.__bound = true;

    menuToggle.addEventListener("click", () => {
      const isOpen = mainNav.classList.toggle("nav-open");
      menuToggle.setAttribute("aria-expanded", String(isOpen));
    });
  }

  function setupLangToggle() {
    const btn = $("#langToggle");
    if (!btn || btn.__bound) return;
    btn.__bound = true;

    const applyLabel = () => {
      const curr = getLang();
      btn.textContent = curr.toUpperCase();
    };
    applyLabel();

    btn.addEventListener("click", () => {
      const curr = getLang();
      const next = curr === "es" ? "en" : "es";
      setLang(next);
      applyI18n();
      applyLabel();
    });
  }

  function themeBoot() {
    try {
      const saved = localStorage.getItem(LS_KEYS.theme);
      if (saved === "light" || saved === "dark") {
        document.documentElement.setAttribute("data-theme", saved);
      }
    } catch {}
  }
  function themeToggleInit() {
    const btn = $("#themeToggle");
    if (!btn || btn.__bound) return;
    btn.__bound = true;
    btn.addEventListener("click", () => {
      const cur = document.documentElement.getAttribute("data-theme");
      const next = cur === "dark" ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", next);
      localStorage.setItem(LS_KEYS.theme, next);
    });
  }

  async function initUI() {
    applyI18n();
    setupMenuToggle();
    markActiveLink();
    await setAuthUI();
    wireLogout();
    setupLangToggle();
    themeToggleInit();
  }

  document.addEventListener("DOMContentLoaded", () => {
    themeBoot();
    document.addEventListener("includes:loaded", initUI, { once: true });
    initUI();
  });
})();
