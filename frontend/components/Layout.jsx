// frontend/components/Layout.jsx
import React from 'react';
import LangToggle from './LangToggle.jsx';
import ThemeToggle from './ThemeToggle.jsx';
import { getSessionProfile, logout } from '../hooks/use-session.js';
import { useEffect, useState } from 'react';
import { t } from '../hooks/use-i18n.js';

export default function Layout({ children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    (async () => {
      const u = await getSessionProfile();
      setUser(u);
    })();
  }, []);

  async function handleLogout() {
    await logout();
    window.location.href = '/login.html';
  }

  return (
    <div className="layout">
      {/* 🌐 HEADER */}
      <header className="app-header">
        <div className="logo">
          <a href="/"><img src="/assets/img/logo.svg" alt="RedVelvetLive" /></a>
        </div>

        <nav className="main-nav">
          <a href="/dashboard.html">{t('nav.profile')}</a>
          <a href="/blog.html">Blog</a>
          <a href="/contact.html">{t('footer.contact')}</a>
        </nav>

        <div className="header-tools">
          <LangToggle />
          <ThemeToggle />
          {user ? (
            <>
              <span className="user-name">👤 {user.name}</span>
              <button onClick={handleLogout} className="btn-logout">
                {t('nav.logout')}
              </button>
            </>
          ) : (
            <>
              <a href="/login.html" className="btn-login">
                {t('nav.login')}
              </a>
              <a href="/register.html" className="btn-register">
                {t('nav.register')}
              </a>
            </>
          )}
        </div>
      </header>

      {/* 📦 CONTENIDO */}
      <main className="app-content">{children}</main>

      {/* ⚖️ FOOTER */}
      <footer className="app-footer">
        <p>© {new Date().getFullYear()} RedVelvetLive. {t('footer.terms')}</p>
        <p>
          <a href="/privacy.html">{t('footer.privacy')}</a> |{' '}
          <a href="/terms.html">{t('footer.terms')}</a>
        </p>
      </footer>
    </div>
  );
}
