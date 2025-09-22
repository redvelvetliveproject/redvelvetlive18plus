// public/js/guide.js
// Guía: verificación de mayoría de edad + i18n

import { initI18n } from "/js/i18n.js";

(function boot() {
  try { initI18n(); } catch (_) {}

  const btn = document.getElementById("btnContinuar");
  const check = document.getElementById("mayoriaEdad");
  const errorBox = document.getElementById("ageError");

  if (btn) {
    btn.addEventListener("click", () => {
      if (!check?.checked) {
        if (errorBox) {
          errorBox.textContent = "❌ Debes confirmar que eres mayor de edad para continuar.";
          errorBox.style.display = "block";
        } else {
          alert("❌ Debes confirmar que eres mayor de edad para continuar.");
        }
        return;
      }

      try { localStorage.setItem("guiaLeida", "true"); } catch (_) {}
      window.location.href = "/register.html";
    });
  }
})();
