// /public/js/index.js
// Helpers globales de UI (toasts, formularios, accesibilidad, fetch JSON)

//
// === Toast ===
//
export function showToast(message, type = "info") {
  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.textContent = message;

  document.body.appendChild(toast);

  setTimeout(() => toast.classList.add("show"), 100);
  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 400);
  }, 3200);
}

// Inyectar estilos una sola vez
(function injectToastStyles() {
  if (document.getElementById("toast-styles")) return;
  const style = document.createElement("style");
  style.id = "toast-styles";
  style.textContent = `
.toast {
  position: fixed;
  bottom: 20px;
  right: -320px;
  min-width: 220px;
  max-width: 320px;
  padding: 12px 18px;
  border-radius: 8px;
  font-weight: 600;
  color: #fff;
  font-size: 0.9rem;
  box-shadow: 0 4px 12px rgba(0,0,0,0.3);
  opacity: 0;
  transition: all .4s ease;
  z-index: 9999;
}
.toast.show { right: 20px; opacity: 1; }
.toast-success { background: #16a34a; }
.toast-error   { background: #dc2626; }
.toast-info    { background: #2563eb; }
.toast-warn    { background: #f59e0b; color:#111; }
  `;
  document.head.appendChild(style);
})();

//
// === Form helper ===
//
export function handleForm(formSelector, onSubmit) {
  const form = typeof formSelector === "string" 
    ? document.querySelector(formSelector) 
    : formSelector;
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    btn && (btn.disabled = true);

    try {
      const data = Object.fromEntries(new FormData(form).entries());
      await onSubmit(data, form);
    } catch (err) {
      console.error("[handleForm]", err);
      showToast("❌ Error en el formulario", "error");
    } finally {
      btn && (btn.disabled = false);
    }
  });
}

//
// === Accesibilidad global ===
//
export function toggleContrast() {
  document.documentElement.classList.toggle("contrast-mode");
  showToast("Modo alto contraste activado", "info");
}

export function toggleDyslexiaFont() {
  document.documentElement.classList.toggle("dyslexia-mode");
  showToast("Fuente disléxica activada", "info");
}

//
// === Fetch helper JSON ===
//
export async function postJSON(url, body) {
  const r = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(body || {})
  });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return r.json();
}
