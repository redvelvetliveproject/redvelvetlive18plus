// /public/js/main.js
// Punto de entrada global: arranca i18n, incluye partials, activa navegación y helpers globales

import "./i18n.js";
import "./includes.js";
import "./navigation.js";
import { showToast } from "./index.js";

// Marca el enlace activo en la navegación
document.addEventListener("DOMContentLoaded", () => {
  const normalize = (href) => {
    if (!href) return "";
    href = href.replace(/[?#].*$/, "").replace(/\/+$/, "");
    if (!href || href.endsWith("/")) {
      return (href + "index.html").replace(/\/+index\.html$/, "/index.html");
    }
    return href;
  };

  const here = normalize(location.pathname);

  document.querySelectorAll(".nav a[href]").forEach((a) => {
    const target = normalize(a.getAttribute("href"));
    if (!target) return;

    if (here.endsWith(target)) {
      a.classList.add("active-link");
      a.setAttribute("aria-current", "page");
    } else {
      a.classList.remove("active-link");
      a.removeAttribute("aria-current");
    }
  });
});

// Toast global al cargar la página (solo una vez por sesión)
window.addEventListener("load", () => {
  try {
    const alreadyShown = sessionStorage.getItem("welcomeToastShown");

    if (!alreadyShown) {
      showToast(
        "✨ Bienvenido a RedVelvetLive: pagos al instante, sin intermediarios y sin bloqueos injustos.",
        "info"
      );
      sessionStorage.setItem("welcomeToastShown", "true");
    }
  } catch (err) {
    // Si sessionStorage no está disponible, mostramos el toast igual
    showToast(
      "✨ Bienvenido a RedVelvetLive: pagos al instante, sin intermediarios y sin bloqueos injustos.",
      "info"
    );
  }
});
