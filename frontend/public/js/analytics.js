(function () {
  // 1) Verificar consentimiento
  let consent = null;
  try { consent = localStorage.getItem('cookiesChoice'); } catch (_) {}
  if (consent !== 'accepted') {
    console.info('[analytics] Inactivo hasta aceptar cookies.');
    return;
  }

  // 2) Obtener GA_ID (con soporte import.meta.env para Vite)
  const GA_ID =
    (document.querySelector('meta[name="ga-id"]')?.content || '').trim() ||
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GA_ID) ||
    (typeof window !== 'undefined' ? (window.GA_ID || '') : '') ||
    'G-XXXXXXXXXX';

  if (!/^G-[A-Z0-9]+$/i.test(GA_ID)) {
    console.warn('[analytics] GA_ID no configurado.');
    return;
  }

  // 3) Soporte CSP
  const CSP_NONCE = document.querySelector('meta[name="csp-nonce"]')?.content || '';

  // 4) Cargar GA4
  const s1 = document.createElement('script');
  s1.async = true;
  s1.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GA_ID)}`;
  if (CSP_NONCE) s1.nonce = CSP_NONCE;
  document.head.appendChild(s1);

  const s2 = document.createElement('script');
  if (CSP_NONCE) s2.nonce = CSP_NONCE;
  s2.text = `
    window.dataLayer = window.dataLayer || [];
    function gtag(){ dataLayer.push(arguments); }
    gtag('js', new Date());
    gtag('config', '${GA_ID}', { anonymize_ip: true });
  `;
  document.head.appendChild(s2);

  // 5) Exponer función global para eventos personalizados
  window.trackEvent = function (eventName, eventParams = {}) {
    if (typeof gtag === 'function') {
      gtag('event', eventName, eventParams);
    } else {
      console.warn('[analytics] gtag aún no disponible');
    }
  };

  console.log('[analytics] GA4 cargado.');
})();
