// /public/js/toast.js
// Módulo global de notificaciones visuales

export function showToast(message, type = "info") {
  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.textContent = message;

  document.body.appendChild(toast);

  // Entrada animada
  setTimeout(() => toast.classList.add("show"), 100);

  // Salida automática
  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 500);
  }, 3000);
}

// === Estilos globales (inyectados una sola vez) ===
if (!document.getElementById("toast-styles")) {
  const style = document.createElement("style");
  style.id = "toast-styles";
  style.textContent = `
    .toast {
      position: fixed;
      bottom: 20px;
      right: -320px;
      min-width: 220px;
      padding: 12px 18px;
      border-radius: 8px;
      color: #fff;
      font-size: 0.9rem;
      font-weight: 500;
      box-shadow: 0 4px 8px rgba(0,0,0,0.2);
      opacity: 0;
      transition: all 0.4s ease;
      z-index: 9999;
    }
    .toast.show { right: 20px; opacity: 1; }
    .toast-success { background: #16a34a; }
    .toast-error   { background: #dc2626; }
    .toast-info    { background: #2563eb; }
    .toast-warn    { background: #f59e0b; color:#111; }
  `;
  document.head.appendChild(style);
}
