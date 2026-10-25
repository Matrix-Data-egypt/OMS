import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import LanguageSwitcher from './LanguageSwitcher';
import './Navbar.css';

const Navbar = ({ user, setUser }) => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const { t, language } = useLanguage();

  // Check if current route belongs to Portfolio
  const isPortfolioRoute = ['/production-tv', '/poss', '/outdoor'].includes(location.pathname);

  // Drawer Portfolio accordion state: open if on portfolio route by default
  const [isDrawerPortfolioOpen, setIsDrawerPortfolioOpen] = useState(isPortfolioRoute);

  const closeMenu = () => setIsOpen(false);
  const toggleMenu = () => setIsOpen((prev) => !prev);

  // Close menu on Escape key press and prevent body scroll when open
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    if (isOpen) {
      document.body.classList.add('nav-drawer-open');
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.classList.remove('nav-drawer-open');
    }
    return () => {
      document.body.classList.remove('nav-drawer-open');
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  // Automatically close menu when navigating between routes
  useEffect(() => {
    setIsOpen(false);
    if (['/production-tv', '/poss', '/outdoor'].includes(location.pathname)) {
      setIsDrawerPortfolioOpen(true);
    }
  }, [location.pathname]);

  // Portfolio items without icons
  const portfolioItems = [
    {
      to: '/production-tv',
      label: t('nav.productionTv', 'Production TV'),
      desc: t('nav.productionTvDesc', 'إعلانات تجارية وسينمائية'),
    },
    {
      to: '/poss',
      label: t('nav.poss', 'POSS'),
      desc: t('nav.possDesc', 'نقاط البيع ومنصات العرض'),
    },
    {
      to: '/outdoor',
      label: t('nav.outdoor', 'Outdoor'),
      desc: t('nav.outdoorDesc', 'شاشات ولافتات الطرق الأيقونية'),
    },
  ];

  const isRtl = language === 'ar';

  return (
    <>
      {/* Sleek Floating Header: Brand Logo + Language Switcher + Hamburger */}
      <header className="oms-nav-trigger-bar" role="banner">
        {/* Brand Logo */}
        <Link to="/" className="nav-bar-logo" onClick={closeMenu} aria-label="OMS Home">
          <div className="nav-logo-backdrop">
            <img
              src="/oms-logo-no-names.png"
              alt="OMS One Media Solution Logo"
              className="nav-logo-img"
            />
          </div>
        </Link>

        {/* Right Action Cluster: Language Switcher + Hamburger */}
        <div className="oms-nav-right-cluster">
          <LanguageSwitcher />

          {/* ☰ Hamburger Icon / زر فتح القائمة */}
          <button
            type="button"
            className={`nav-hamburger-btn ${isOpen ? 'is-active' : ''}`}
            onClick={toggleMenu}
            aria-label={isOpen ? t('nav.close', 'Close Menu') : t('nav.menu', 'Open Menu')}
            aria-expanded={isOpen}
            title={isOpen ? (isRtl ? 'إغلاق القائمة' : 'Close Menu') : (isRtl ? 'القائمة الرئيسية' : 'Main Menu')}
          >
            <span className="hamburger-box">
              <span className="hamburger-line line-1" />
              <span className="hamburger-line line-2" />
              <span className="hamburger-line line-3" />
            </span>
          </button>
        </div>
      </header>

      {/* Backdrop overlay */}
      <div
        className={`nav-drawer-backdrop ${isOpen ? 'is-visible' : ''}`}
        onClick={closeMenu}
        aria-hidden="true"
      />

      {/* Slide-out Drawer */}
      <aside
        className={`nav-drawer-panel ${isOpen ? 'is-open' : ''} ${isRtl ? 'is-rtl' : 'is-ltr'}`}
        aria-label="Navigation Drawer"
        aria-hidden={!isOpen}
      >
        {/* Drawer Header: Logo + Language Switcher + Close Button */}
        <div className="drawer-header">
          <div className="drawer-brand-group">
            <Link to="/" className="drawer-logo-link" onClick={closeMenu}>
              <div className="nav-logo-backdrop">
                <img
                  src="/oms-logo-no-names.png"
                  alt="OMS Logo"
                  className="drawer-logo-img"
                />
              </div>
            </Link>
            <LanguageSwitcher />
          </div>

          <button
            type="button"
            className="drawer-close-btn"
            onClick={closeMenu}
            aria-label={isRtl ? 'إغلاق' : 'Close'}
            title={isRtl ? 'إغلاق القائمة' : 'Close Menu'}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Drawer Body: Navigation Links without ANY icons */}
        <div className="drawer-body">
          <div className="drawer-section-label">
            {isRtl ? 'التنقل الرئيسي' : 'MAIN NAVIGATION'}
          </div>

          <nav className="drawer-nav-list" aria-label="Main Navigation">
            {/* 1. Home */}
            <Link
              to="/"
              className={`drawer-nav-item ${location.pathname === '/' ? 'is-active' : ''}`}
              onClick={closeMenu}
            >
              <span className="drawer-item-label">{t('nav.home', 'Home')}</span>
              <span className="drawer-item-arrow" aria-hidden="true">{isRtl ? '←' : '→'}</span>
            </Link>

            {/* 2. Work */}
            <Link
              to="/work"
              className={`drawer-nav-item ${location.pathname === '/work' ? 'is-active' : ''}`}
              onClick={closeMenu}
            >
              <span className="drawer-item-label">{t('nav.work', 'Work')}</span>
              <span className="drawer-item-arrow" aria-hidden="true">{isRtl ? '←' : '→'}</span>
            </Link>

            {/* 3. Portfolio Accordion (No icons, clean text + down arrow) */}
            <div className={`drawer-accordion-group ${isDrawerPortfolioOpen ? 'is-expanded' : ''} ${isPortfolioRoute ? 'is-active-parent' : ''}`}>
              <button
                type="button"
                className={`drawer-nav-item drawer-accordion-trigger ${isPortfolioRoute ? 'is-active' : ''}`}
                onClick={() => setIsDrawerPortfolioOpen((prev) => !prev)}
                aria-expanded={isDrawerPortfolioOpen}
              >
                <span className="drawer-item-label">
                  {t('nav.portfolio', 'Portfolio (سابقة الأعمال)')}
                </span>
                {/* Rotating Down Arrow */}
                <span className={`drawer-chevron-box ${isDrawerPortfolioOpen ? 'is-rotated' : ''}`} aria-hidden="true">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="drawer-chevron-svg"
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </span>
              </button>

              {/* Submenu: Production TV, POSS, Outdoor (Pure Clean Text) */}
              <div
                className={`drawer-accordion-sub ${isDrawerPortfolioOpen ? 'is-open' : ''}`}
                role="region"
                aria-label="Portfolio Submenu"
              >
                <div className="drawer-sub-inner">
                  {portfolioItems.map((item) => {
                    const isActive = location.pathname === item.to;
                    return (
                      <Link
                        key={item.to}
                        to={item.to}
                        className={`drawer-sub-item ${isActive ? 'is-active' : ''}`}
                        onClick={closeMenu}
                      >
                        <div className="sub-item-content">
                          <span className="sub-item-title">{item.label}</span>
                          <span className="sub-item-desc">{item.desc}</span>
                        </div>
                        <span className="sub-item-arrow" aria-hidden="true">
                          {isRtl ? '←' : '→'}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* 4. About */}
            <Link
              to="/about"
              className={`drawer-nav-item ${location.pathname === '/about' ? 'is-active' : ''}`}
              onClick={closeMenu}
            >
              <span className="drawer-item-label">{t('nav.about', 'About')}</span>
              <span className="drawer-item-arrow" aria-hidden="true">{isRtl ? '←' : '→'}</span>
            </Link>

            {/* 5. Clients */}
            <Link
              to="/clients"
              className={`drawer-nav-item ${location.pathname === '/clients' ? 'is-active' : ''}`}
              onClick={closeMenu}
            >
              <span className="drawer-item-label">{t('nav.clients', 'Clients')}</span>
              <span className="drawer-item-arrow" aria-hidden="true">{isRtl ? '←' : '→'}</span>
            </Link>
          </nav>
        </div>

        {/* Drawer Footer: Actions, Theme Switcher & User Controls */}
        <div className="drawer-footer">
          {/* Start Project CTA Button */}
          <Link to="/contact" className="drawer-btn-cta" onClick={closeMenu}>
            <span>{t('nav.startProject', 'START PROJECT →')}</span>
          </Link>

          {/* Theme & User Controls Grid */}
          <div className="drawer-controls-row">
            {/* Dark / Light Toggle */}
            <div className="theme-toggle-group" role="group" aria-label="Theme mode switcher">
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

            {/* User Profile / Login */}
            <div className="drawer-user-box">
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
                <div className="drawer-user-logged">
                  <span className="navbar-username">
                    {typeof user === 'string'
                      ? user
                      : (user.fullName || user.name || user.email || 'User')}
                  </span>
                  <button
                    onClick={() => {
                      if (window.confirm(t('nav.confirmLogout', 'هل تريد تسجيل الخروج؟'))) {
                        setUser(null);
                        closeMenu();
                      }
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
                </div>
              ) : (
                <Link
                  to="/login"
                  className={`drawer-login-link ${location.pathname === '/login' ? 'active-link' : ''}`}
                  onClick={closeMenu}
                  aria-label={t('nav.login', 'Login')}
                  title={t('nav.login', 'Login')}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="drawer-user-svg">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  <span className="drawer-login-text">{t('nav.login', 'Login')}</span>
                </Link>
              )}
            </div>
          </div>

          <div className="drawer-bottom-credit">
            OMS • ONE MEDIA SOLUTION
          </div>
        </div>
      </aside>
    </>
  );
};

export default Navbar;