// frontend/components/LangToggle.jsx
import React, { useEffect, useState } from 'react';
import { getLang, setLang, applyI18n } from '../hooks/use-i18n.js';

export default function LangToggle() {
  const [lang, setLangState] = useState(getLang());

  useEffect(() => {
    applyI18n();
  }, [lang]);

  function toggleLang() {
    const next = lang === 'es' ? 'en' : 'es';
    setLang(next);
    setLangState(next);
  }

  return (
    <button onClick={toggleLang} className="lang-toggle">
      🌐 {lang.toUpperCase()}
    </button>
  );
}
