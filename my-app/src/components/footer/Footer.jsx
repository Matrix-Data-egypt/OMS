import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import './Footer.css';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const { t } = useLanguage();

  const footerSections = [
    {
      id: "sec-company",
      title: t('footer.company', 'Company'),
      links: [
        { id: "lnk-about", name: t('footer.aboutLink', 'About & Manifesto'), soon: false, to: "/about" },
        { id: "lnk-work", name: t('footer.workLink', 'Work & Capabilities'), soon: false, to: "/work" },
        { id: "lnk-outdoor", name: t('footer.outdoorLink', 'Outdoor Network'), soon: false, to: "/outdoor" },
        { id: "lnk-poss", name: t('footer.possLink', 'POSS Displays'), soon: false, to: "/poss" },
        { id: "lnk-tv", name: t('footer.tvLink', 'TV Production'), soon: false, to: "/production-tv" }
      ],
    },
  ];

  return (
    <footer className="custom-footer">
      {/* Action Prompt Banner */}
      <section className="footer-top-section" aria-label="Agency Call to Action">
        <div className="footer-top-text">
          <h2 className="footer-main-title">
            {t('footer.ctaTitle1', 'HAVE A CHALLENGE')}<br />
            <span className="footer-title-highlight">{t('footer.ctaTitle2', 'WORTH SCALING?')}</span>
          </h2>
        </div>

        <div className="footer-button-container">
          <Link to="/contact" className="footer-primary-btn">
            {t('footer.briefBtn', 'INITIATE CAMPAIGN BRIEF →')}
          </Link>
          <Link to="/production-tv" className="footer-secondary-btn">
            {t('footer.credentialsBtn', 'VIEW CREDENTIALS')}
          </Link>
        </div>
      </section>

      {/* Main Structural Columns */}
      <section className="footer-grid-section" aria-label="Corporate Directory">
        {footerSections.map((section) => (
          <FooterColumn key={section.id} section={section} />
        ))}

        <div className="footer-column footer-email-column">
          <h4 className="footer-column-title">{t('footer.email', 'EMAIL')}</h4>
          <a href="mailto:info@omsegy.agency" className="footer-email-link">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="footer-email-icon"
              aria-hidden="true"
            >
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
              <polyline points="22,6 12,13 2,6" />
            </svg>
            <span>info@omsegy.agency</span>
          </a>
        </div>
      </section>

      {/* Bottom Metadata & Legal Links */}
      <section className="footer-bottom-bar" aria-label="Legal & Social">
        <div className="footer-bottom-left">
          <Link to="/" className="footer-logo-link" aria-label="Go to homepage">
            <div className="footer-logo-pill">
              <img
                src="/oms-logo-dark.png"
                alt="OMS Corporate Logo"
                className="footer-bottom-logo oms-logo-light-theme"
              />
              <img
                src="/oms-logo-white.png"
                alt="OMS Corporate Logo"
                className="footer-bottom-logo oms-logo-dark-theme"
              />
            </div>
          </Link>
          <p className="footer-copyright">
            &copy; {currentYear} {t('footer.rights', 'OMS Advertising & Media Solutions. All rights reserved.')}
          </p>
        </div>

        <nav className="footer-social-links" aria-label="Social Media Corporate Handles">
          <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="footer-link">LinkedIn</a>
          <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="footer-link">Instagram</a>
          <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="footer-link">YouTube</a>
          <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="footer-link">Facebook</a>
        </nav>
      </section>
    </footer>
  );
}

function FooterColumn({ section }) {
  return (
    <div className="footer-column">
      <h4 className="footer-column-title">{section.title}</h4>
      <ul className="footer-list">
        {section.links.map(({ id, soon, name, to }) => (
          <li key={id} className="footer-list-item">
            {soon ? (
              <span className="footer-link-soon-disabled">
                {name} <span className="footer-soon-badge">Soon</span>
              </span>
            ) : (
              <Link to={to} className="footer-link">
                {name}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
