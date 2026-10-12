import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css'; 

const FOOTER_SECTIONS = [
  {
    id: "sec-company",
    title: "Company",
    links: [
      { id: "lnk-about", name: "About", soon: false, to: "/about" },
      { id: "lnk-outdoor", name: "Outdoor", soon: false, to: "/outdoor" },
      { id: "lnk-poss", name: "POSS", soon: false, to: "/poss" },
      { id: "lnk-press", name: "Press", soon: false, to: "/contact" }
    ],
  },
  {
    id: "sec-resources",
    title: "Resources",
    links: [
      { id: "lnk-community", name: "Community", soon: true },
      { id: "lnk-help", name: "Help Center", soon: true },
      { id: "lnk-templates", name: "Templates", soon: true },
      { id: "lnk-guides", name: "Guides", soon: true }
    ],
  },
];

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="custom-footer">
      {/* Action Prompt Banner */}
      <section className="footer-top-section" aria-label="Agency Call to Action">
        <div>
          <span className="footer-sub-heading">INTEGRATED AGENCY NETWORK • EGYPT &amp; MENA</span>
          <h2 className="footer-main-title">HAVE A CHALLENGE<br />WORTH SOLVING?</h2>
        </div>
        
        <div className="footer-button-container">
          <Link to="/contact" className="footer-primary-btn">
            INITIATE BRIEF
          </Link>
          <Link to="/production-tv" className="footer-secondary-btn">
            VIEW CREDENTIALS
          </Link>
        </div>
      </section>

      {/* Main Structural Information Columns */}
      <section className="footer-grid-section" aria-label="Corporate Directory">
        {FOOTER_SECTIONS.map((section) => (
          <FooterColumn key={section.id} section={section} />
        ))}
        
        <div className="footer-column">
          <h4 className="footer-column-title">EMAIL</h4>
          <p className="footer-address-text">
            <a href="mailto:info@omsegy.agency" className="footer-link">
              info@omsegy.agency
            </a>
          </p>
        </div>
      </section>

      {/* Bottom Metadata & Legal Links */}
      <section className="footer-bottom-bar" aria-label="Legal &amp; Social">
        <div className="footer-bottom-left">
          <Link to="/" className="footer-logo-link" aria-label="Go to homepage">
            <img 
              src="/oms-logo-no-names.png" 
              alt="OMS Corporate Logo" 
              className="footer-bottom-logo" 
            />
          </Link>
          <p className="footer-copyright">
            &copy; {currentYear} OMS Advertising. All rights reserved.
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

// Clean Sub-Component rendering directory matrices
function FooterColumn({ section }) {
  return (
    <div className="footer-column">
      <h4 className="footer-column-title">{section.title.toUpperCase()}</h4>
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
