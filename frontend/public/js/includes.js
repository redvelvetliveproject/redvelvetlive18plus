// public/js/includes.js
// Carga fragmentos HTML (header, footer, cookies) y notifica a otros scripts

(async function loadPartials() {
  const zones = Array.from(document.querySelectorAll("[data-include]"));

  for (const zone of zones) {
    const name = zone.getAttribute("data-include"); // ej: 'header', 'footer'
    zone.setAttribute("aria-busy", "true");

    try {
      const res = await fetch(`/partials/${name}.html`, { cache: "no-cache" });

      if (res.ok) {
        const html = await res.text();
        zone.innerHTML = html;
        zone.setAttribute("aria-busy", "false");
        zone.setAttribute("aria-label", `${name} cargado`);
      } else {
        console.warn(`⚠️ No se pudo cargar /partials/${name}.html`);
        zone.innerHTML = `<p class="muted">[${name}] no disponible.</p>`;
      }
    } catch (err) {
      console.error(`❌ Error al cargar ${name}.html`, err);
      zone.innerHTML = `<p class="muted">[${name}] error de carga.</p>`;
      if (window.showToast) showToast(`Error al cargar ${name}`, "error");
    }
  }

  // 🔔 Evento global para otros scripts
  document.dispatchEvent(new CustomEvent("includes:loaded"));
})();
