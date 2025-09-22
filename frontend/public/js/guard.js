// public/js/guard.js
// Verifica sesión/rol requerido y prepara UI básica (logout, nombre, rol, avatar)

import { logout, profile } from "/js/api.js";

(function(){
  async function roleAllowed(user, required){
    if (!required || required === "any") return !!user; // solo requiere login
    if (!user) return false;
    const have = String(user.role || "").toLowerCase();
    return required.split(",").map(s => s.trim().toLowerCase()).includes(have);
  }

  async function boot(){
    const required = (document.body.getAttribute("data-role-required") || "").trim().toLowerCase();
    let user = null;
    try {
      user = await profile();
    } catch (err) {
      console.warn("[guard] No se pudo obtener perfil:", err.message);
    }

    if (!roleAllowed(user, required)) {
      document.body.innerHTML = `
        <section role="alert" style="text-align:center; padding:2rem">
          <h1 style="color:#e33">Acceso denegado</h1>
          <p>No tienes permisos para acceder a esta página.</p>
          <p>Redirigiendo al inicio de sesión…</p>
        </section>`;
      setTimeout(() => {
        const returnTo = encodeURIComponent(location.pathname + location.search + location.hash);
        location.replace(`/login.html?returnTo=${returnTo}`);
      }, 2000);
      return;
    }

    // Exponer sesión solo lectura
    try {
      Object.defineProperty(window, "__SESSION", {
        value: user,
        writable: false,
        configurable: false,
        enumerable: false
      });
    } catch {}

    // Mostrar nombre
    const nameEl = document.getElementById("userName");
    if (nameEl && user?.name) nameEl.textContent = user.name;

    // Rol
    const roleEl = document.getElementById("dashUserRole");
    if (roleEl && user?.role) roleEl.textContent = user.role;

    // Avatar
    const avatarEl = document.getElementById("userAvatar");
    if (avatarEl && user?.avatar) {
      avatarEl.src = user.avatar;
      avatarEl.alt = user.name || "Usuario";
    }

    // Logout
    const btnLogout = document.getElementById("navLogout");
    if (btnLogout) {
      btnLogout.style.display = "";
      btnLogout.addEventListener("click", async (e) => {
        e.preventDefault();
        try { await logout(); } catch {}
        location.href = "/login.html";
      });
    }

    // Mostrar ítem Perfil
    const navProfile = document.getElementById("navProfile");
    if (navProfile) navProfile.style.display = "";
  }

  document.addEventListener("DOMContentLoaded", boot);
})();
