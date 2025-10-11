// frontend/components/ThemeToggle.jsx
import React, { useEffect } from 'react';
import { getTheme, setTheme, applyTheme } from '../hooks/use-theme.js';

export default function ThemeToggle() {
  useEffect(() => {
    applyTheme();
  }, []);

  function toggleTheme() {
    const cur = getTheme();
    const next = cur === 'light' ? 'dark' : cur === 'dark' ? 'system' : 'light';
    setTheme(next);
  }

  return (
    <button onClick={toggleTheme} className="theme-toggle">
      🌓 Cambiar tema
    </button>
  );
}
