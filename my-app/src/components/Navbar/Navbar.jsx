import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Navbar.css';

const Navbar = ({ user, setUser }) => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const closeMenu = () => setMobileMenuOpen(false);

  return (
    <nav className="custom-navbar">
      {/* Brand Logo with High-Contrast Badge */}
      <div className="nav-brand-section">
        <Link to="/" className="nav-logo-link" onClick={closeMenu}>
          <div className="nav-logo-backdrop">
            <img
              src="/oms-logo-no-names.png"
              alt="OMS One Media Solution Logo"
              className="nav-logo-img"
            />
          </div>
          <div className="nav-logo-text-group">
            <span className="brand-tag-mini">AUTONOMOUS</span>
            <span className="brand-sub-mini">AGENCY OS</span>
          </div>
        </Link>
      </div>

      {/* Navigation Links */}
      <ul className={`nav-menu-links ${mobileMenuOpen ? 'is-open' : ''}`}>
        <li>
          <Link to="/" className={`nav-item ${location.pathname === '/' ? 'active-link' : ''}`} onClick={closeMenu}>
            Home
          </Link>
        </li>
        <li>
          <Link to="/work" className={`nav-item ${location.pathname === '/work' ? 'active-link' : ''}`} onClick={closeMenu}>
            Work
          </Link>
        </li>
        <li>
          <Link to="/outdoor" className={`nav-item ${location.pathname === '/outdoor' ? 'active-link' : ''}`} onClick={closeMenu}>
            Outdoor
          </Link>
        </li>
        <li>
          <Link to="/poss" className={`nav-item ${location.pathname === '/poss' ? 'active-link' : ''}`} onClick={closeMenu}>
            POSS
          </Link>
        </li>
        <li>
          <Link to="/about" className={`nav-item ${location.pathname === '/about' ? 'active-link' : ''}`} onClick={closeMenu}>
            About
          </Link>
        </li>
        <li>
          <Link to="/production-tv" className={`nav-item ${location.pathname === '/production-tv' ? 'active-link' : ''}`} onClick={closeMenu}>
            Production TV
          </Link>
        </li>
        <li>
          <Link to="/clients" className={`nav-item ${location.pathname === '/clients' ? 'active-link' : ''}`} onClick={closeMenu}>
            Clients
          </Link>
        </li>
      </ul>

      {/* Right Controls & CTAs */}
      <div className="nav-actions-section">
        <Link to="/contact" className="nav-btn-primary" onClick={closeMenu}>
          LAUNCH CAMPAIGN &rarr;
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
              Panel Hub ↗
            </a>
          )}

          {user ? (
            <button
              onClick={() => {
                if (window.confirm('هل تريد تسجيل الخروج؟')) setUser(null);
              }}
              className="nav-btn-user"
              title="Log Out"
              aria-label="Log Out"
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