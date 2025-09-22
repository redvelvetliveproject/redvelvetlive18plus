// public/js/i18n.js
// Traducción dinámica multilenguaje con fallback y soporte para diccionarios locales (ej: i18n-home.js)

document.addEventListener("DOMContentLoaded", async () => {
  const defaultLang = "es";
  const supportedLangs = ["es", "en", "fr", "pt", "de", "hi", "ar", "ru", "zh", "ja"];

  function getSavedLang() {
    try { return localStorage.getItem("lang"); } catch { return null; }
  }

  function detectBrowserLang() {
    const lang = navigator.language?.slice(0, 2).toLowerCase() || defaultLang;
    return supportedLangs.includes(lang) ? lang : defaultLang;
  }

  function setLang(lang) {
    try { localStorage.setItem("lang", lang); } catch {}
  }

  // Aplicar traducciones dinámicas
  async function applyTranslations(lang) {
    try {
      const res = await fetch(`/i18n/${lang}.json`, { cache: "no-cache" });
      const dict = res.ok ? await res.json() : {};
      
      // Merge con diccionario global local (ej. HOME_I18N_ES)
      const localDict = window[`HOME_I18N_${lang.toUpperCase()}`] || {};
      const merged = { ...dict, ...localDict };

      document.querySelectorAll("[data-i18n]").forEach(el => {
        const key = el.getAttribute("data-i18n");
        if (merged[key]) el.innerHTML = merged[key];
      });
      document.documentElement.setAttribute("lang", lang);
    } catch (err) {
      console.error("🌐 Error cargando traducciones:", err);
    }
  }

  // Idioma inicial
  const lang = getSavedLang() || detectBrowserLang();
  await applyTranslations(lang);

  // Botones de cambio
  document.querySelectorAll("[data-lang]").forEach(btn => {
    btn.addEventListener("click", async () => {
      const selected = btn.getAttribute("data-lang");
      if (supportedLangs.includes(selected)) {
        setLang(selected);
        await applyTranslations(selected);
      }
    });
  });

  // Método global
  window.setLanguage = async function(newLang) {
    if (supportedLangs.includes(newLang)) {
      setLang(newLang);
      await applyTranslations(newLang);
    }
  };
});
const translations = {
  es: {
    wallet_title: "💼 Mi Billetera (Modelo)",
    wallet_balance: "Saldo disponible",
    wallet_withdraw: "💸 Retirar USDT",
    wallet_history: "📜 Ver historial",
    withdraw_title: "💵 Retirar Ganancias",
    withdraw_address: "Wallet de destino (BEP20)",
    withdraw_amount: "Cantidad a retirar (ONECOP)",
    withdraw_note: "⚠️ Simulación de retiro en testnet. Asegúrate de usar una wallet válida.",
    tips_title: "💸 Historial de Tips Recibidos",
    settings_title: "⚙️ Ajustes de Cuenta",
    support_title: "🛠️ Soporte para Modelos"
  },
  en: {
    wallet_title: "💼 My Wallet (Model)",
    wallet_balance: "Available Balance",
    wallet_withdraw: "💸 Withdraw USDT",
    wallet_history: "📜 View History",
    withdraw_title: "💵 Withdraw Earnings",
    withdraw_address: "Destination Wallet (BEP20)",
    withdraw_amount: "Amount to withdraw (ONECOP)",
    withdraw_note: "⚠️ Testnet withdrawal simulation. Use a valid wallet.",
    tips_title: "💸 Received Tips History",
    settings_title: "⚙️ Account Settings",
    support_title: "🛠️ Model Support"
  }
};
