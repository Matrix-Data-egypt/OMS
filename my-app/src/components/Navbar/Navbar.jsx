import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import LanguageSwitcher from './LanguageSwitcher';
import './Navbar.css';

const Navbar = ({ user, setUser }) => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const { t } = useLanguage();

  const closeMenu = () => setMobileMenuOpen(false);

  return (
    <nav className="custom-navbar">
      {/* Brand Logo with High-Contrast Badge and Language Switcher */}
      <div className="nav-brand-section">
        <Link to="/" className="nav-logo-link" onClick={closeMenu}>
          <div className="nav-logo-backdrop">
            <img
              src="/oms-logo-no-names.png"
              alt="OMS One Media Solution Logo"
              className="nav-logo-img"
            />
          </div>
        </Link>

        {/* 🌐 Language Switcher with rotating 3D Earth Globe Icon & Flags */}
        <LanguageSwitcher />
      </div>

      {/* Navigation Links */}
      <ul className={`nav-menu-links ${mobileMenuOpen ? 'is-open' : ''}`}>
        <li>
          <Link to="/" className={`nav-item ${location.pathname === '/' ? 'active-link' : ''}`} onClick={closeMenu}>
            {t('nav.home', 'Home')}
          </Link>
        </li>
        <li>
          <Link to="/work" className={`nav-item ${location.pathname === '/work' ? 'active-link' : ''}`} onClick={closeMenu}>
            {t('nav.work', 'Work')}
          </Link>
        </li>
        <li>
          <Link to="/outdoor" className={`nav-item ${location.pathname === '/outdoor' ? 'active-link' : ''}`} onClick={closeMenu}>
            {t('nav.outdoor', 'Outdoor')}
          </Link>
        </li>
        <li>
          <Link to="/poss" className={`nav-item ${location.pathname === '/poss' ? 'active-link' : ''}`} onClick={closeMenu}>
            {t('nav.poss', 'POSS')}
          </Link>
        </li>
        <li>
          <Link to="/about" className={`nav-item ${location.pathname === '/about' ? 'active-link' : ''}`} onClick={closeMenu}>
            {t('nav.about', 'About')}
          </Link>
        </li>
        <li>
          <Link to="/production-tv" className={`nav-item ${location.pathname === '/production-tv' ? 'active-link' : ''}`} onClick={closeMenu}>
            {t('nav.productionTv', 'Production TV')}
          </Link>
        </li>
        <li>
          <Link to="/clients" className={`nav-item ${location.pathname === '/clients' ? 'active-link' : ''}`} onClick={closeMenu}>
            {t('nav.clients', 'Clients')}
          </Link>
        </li>
        {/* Mobile Theme Toggle */}
        <li className="nav-mobile-theme-row">
          <div className="theme-toggle-group">
            <button
              type="button"
              className={`theme-mode-btn ${theme === 'light' ? 'is-active' : ''}`}
              onClick={() => setTheme('light')}
              title="Light Mode (White)"
              aria-label="Light Mode"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="theme-mode-icon">
                <circle cx="12" cy="12" r="5" />
                <line x1="12" y1="1" x2="12" y2="3" />
                <line x1="12" y1="21" x2="12" y2="23" />
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                <line x1="1" y1="12" x2="3" y2="12" />
                <line x1="21" y1="12" x2="23" y2="12" />
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
              </svg>
              <span>{t('nav.light', 'Light')}</span>
            </button>
            <button
              type="button"
              className={`theme-mode-btn ${theme === 'dark' ? 'is-active' : ''}`}
              onClick={() => setTheme('dark')}
              title="Dark Mode"
              aria-label="Dark Mode"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="theme-mode-icon">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
              <span>{t('nav.dark', 'Dark')}</span>
            </button>
          </div>
        </li>
      </ul>

      {/* Right Controls & CTAs */}
      <div className="nav-actions-section">
        {/* Dark Mode / Light Mode Switcher — Placed right next to Start Project */}
        <div className="theme-toggle-group nav-theme-desktop" role="group" aria-label="Theme mode switcher">
          <button
            type="button"
            className={`theme-mode-btn ${theme === 'light' ? 'is-active' : ''}`}
            onClick={() => setTheme('light')}
            title="Light Mode"
            aria-label="Light Mode"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="theme-mode-icon">
              <circle cx="12" cy="12" r="5" />
              <line x1="12" y1="1" x2="12" y2="3" />
              <line x1="12" y1="21" x2="12" y2="23" />
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
              <line x1="1" y1="12" x2="3" y2="12" />
              <line x1="21" y1="12" x2="23" y2="12" />
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
            </svg>
            <span className="theme-btn-label">{t('nav.light', 'Light')}</span>
          </button>

          <button
            type="button"
            className={`theme-mode-btn ${theme === 'dark' ? 'is-active' : ''}`}
            onClick={() => setTheme('dark')}
            title="Dark Mode"
            aria-label="Dark Mode"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="theme-mode-icon">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
            <span className="theme-btn-label">{t('nav.dark', 'Dark')}</span>
          </button>
        </div>

        <Link to="/contact" className="nav-btn-primary" onClick={closeMenu}>
          {t('nav.startProject', 'START PROJECT →')}
        </Link>

        {/* User / Admin Controls */}
        <div className="user-nav-wrapper">
          {user && user.role === 'admin' && (
            <a
              href={process.env.REACT_APP_ADMIN_URL || 'http://localhost:5173'}
              target="_blank"
              rel="noopener noreferrer"
              className="nav-admin-badge"
            >
              {t('nav.adminHub', 'Panel Hub ↗')}
            </a>
          )}

          {user ? (
            <button
              onClick={() => {
                if (window.confirm(t('nav.confirmLogout', 'هل تريد تسجيل الخروج؟'))) setUser(null);
              }}
              className="nav-btn-user"
              title={t('nav.logout', 'Log Out')}
              aria-label={t('nav.logout', 'Log Out')}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </button>
          ) : (
            <Link
              to="/login"
              className={`nav-btn-user ${location.pathname === '/login' ? 'active-link' : ''}`}
              aria-label="Login"
              title="Login"
              onClick={closeMenu}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </Link>
          )}

          {user && (
            <span className="navbar-username">
              {user.name || user}
            </span>
          )}
        </div>

        {/* Mobile Hamburger Toggle */}
        <button
          className="nav-mobile-toggle"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle navigation menu"
        >
          <span className={`bar ${mobileMenuOpen ? 'open' : ''}`} />
          <span className={`bar ${mobileMenuOpen ? 'open' : ''}`} />
        </button>
      </div>
    </nav>
  );
};

export default Navbar;