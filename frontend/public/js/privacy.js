// /public/js/privacy.js
// Muestra/oculta secciones de la política y permite descargar PDF/HTML

(function () {
  const btnDownload = document.getElementById("btnDownloadPrivacy");
  const btnToggle   = document.getElementById("btnToggleSections");

  // Descargar PDF de la política
  btnDownload?.addEventListener("click", () => {
    const link = document.createElement("a");
    link.href = "/docs/politica-privacidad.pdf";
    link.download = "politica-privacidad.pdf";
    link.click();
  });

  // Expandir/colapsar todas las secciones
  btnToggle?.addEventListener("click", () => {
    const details = document.querySelectorAll("details");
    const allOpen = Array.from(details).every(d => d.open);
    details.forEach(d => d.open = !allOpen);
    btnToggle.textContent = allOpen ? "Expandir todo" : "Colapsar todo";
  });
})();
