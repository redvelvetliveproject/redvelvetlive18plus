// /public/js/login.js
import { showToast, handleForm } from "./index.js";
import api from "./api.js";     // 🔗 Usamos wrapper centralizado
import "./i18n.js";             // inicializa traducciones

const API_BASE = window.API_BASE || "/api";

handleForm("#loginForm", async (data) => {
  if (!data.email && !data.wallet) {
    showToast("Introduce email o wallet ⚠️", "warn");
    throw new Error("Faltan credenciales");
  }

  let res;
  try {
    if (data.wallet) {
      res = await api.http.post(`${API_BASE}/auth/wallet-login`, { address: data.wallet });
    } else {
      res = await api.http.post(`${API_BASE}/auth/login`, { email: data.email, password: data.password });
    }
  } catch (err) {
    console.error("[login.js] Error login", err);
    showToast("Error al iniciar sesión ❌", "error");
    return;
  }

  showToast("Inicio de sesión exitoso ✅", "success");

  const role = String(res?.user?.role || res?.role || "").toLowerCase();
  const next = new URLSearchParams(location.search).get("returnTo");

  if (next) return location.assign(next);
  if (role === "model") return location.assign("/model-dashboard.html");
  if (role === "client") return location.assign("/client-dashboard.html");
  return location.assign("/profile.html");
});

// Navbar activo
document.addEventListener("DOMContentLoaded", () => {
  const path = location.pathname.replace(/\/+$/, "");
  document.querySelectorAll(".nav a").forEach((a) => {
    const href = a.getAttribute("href")?.replace(/\/+$/, "");
    if (href && (path.endsWith(href) || path === href)) {
      a.classList.add("active-link");
    }
  });
});


