// frontend/hooks/use-analytics.js
// Wrapper mínimo para GA4 (gtag) con fallback seguro a console.log

export function createAnalytics({ enabled = true, debug = false } = {}) {
  const hasGA =
    typeof window !== 'undefined' &&
    (typeof window.gtag === 'function' || Array.isArray(window.dataLayer));

  function track(event, params = {}) {
    if (!enabled) return;

    if (hasGA && typeof window.gtag === 'function') {
      window.gtag('event', event, params);
    } else if (hasGA && Array.isArray(window.dataLayer)) {
      window.dataLayer.push({ event, ...params });
    } else if (debug) {
      console.log('[analytics] track', event, params);
    }
  }

  function setUserId(userId) {
    if (!enabled || !userId) return;
    if (hasGA && typeof window.gtag === 'function') {
      window.gtag('set', { user_id: userId });
    } else if (debug) {
      console.log('[analytics] setUserId', userId);
    }
  }

  function setUserProps(props = {}) {
    if (!enabled) return;
    if (hasGA && typeof window.gtag === 'function') {
      window.gtag('set', 'user_properties', props);
    } else if (debug) {
      console.log('[analytics] setUserProps', props);
    }
  }

  // Nuevo: inyecta script GA4 dinámicamente
  function init(measurementId) {
    if (!measurementId || typeof document === 'undefined') return;
    if (document.getElementById('ga4-script')) return; // evitar duplicados

    const script1 = document.createElement('script');
    script1.async = true;
    script1.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
    script1.id = 'ga4-script';
    document.head.appendChild(script1);

    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', measurementId);
  }

  return { track, setUserId, setUserProps, init };
}
