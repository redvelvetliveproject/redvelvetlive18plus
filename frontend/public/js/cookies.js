// public/js/cookies.js
// Gestiona el banner y guarda la preferencia. No inyecta GA aquí.
// analytics.js leerá localStorage y cargará GA sólo si "accepted".

(function () {
  const hasLS = (() => {
    try { localStorage.setItem('__t','1'); localStorage.removeItem('__t'); return true; } catch { return false; }
  })();
  const dntOn = ['1','yes','true'].includes(String(navigator.doNotTrack || window.doNotTrack || navigator.msDoNotTrack || '').toLowerCase());

  document.addEventListener('DOMContentLoaded', () => {
    const banner    = document.getElementById('cookieBanner');
    const acceptBtn = document.getElementById('acceptCookies');
    const rejectBtn = document.getElementById('rejectCookies');

    // Si DNT está activo, no mostramos banner (trato como rechazado)
    if (dntOn) {
      hasLS && localStorage.setItem('cookiesChoice','rejected');
      banner && (banner.hidden = true);
      window.dispatchEvent(new CustomEvent('cookies:rejected'));
      return;
    }

    const choice = hasLS ? localStorage.getItem('cookiesChoice') : null;

    if (!choice && banner) banner.hidden = false;
    if (choice === 'accepted' && banner) banner.hidden = true;

    acceptBtn?.addEventListener('click', () => {
      hasLS && localStorage.setItem('cookiesChoice', 'accepted');
      banner && (banner.hidden = true);
      // avisar a otros scripts (p.ej., podrías recargar analytics si lo deseas)
      window.dispatchEvent(new CustomEvent('cookies:accepted'));
    });

    rejectBtn?.addEventListener('click', () => {
      hasLS && localStorage.setItem('cookiesChoice', 'rejected');
      banner && (banner.hidden = true);
      window.dispatchEvent(new CustomEvent('cookies:rejected'));
    });
  });
})();
