import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const FOOTER_SECTIONS = [
  {
    id: "sec-company",
    title: "Company",
    links: [
      { id: "lnk-about", name: "About & Manifesto", soon: false, to: "/about" },
      { id: "lnk-work", name: "Work & Capabilities", soon: false, to: "/work" },
      { id: "lnk-outdoor", name: "Outdoor Network", soon: false, to: "/outdoor" },
      { id: "lnk-poss", name: "POSS Displays", soon: false, to: "/poss" },
      { id: "lnk-tv", name: "TV Production", soon: false, to: "/production-tv" }
    ],
  },
  {
    id: "sec-resources",
    title: "Intelligence & Platform",
    links: [
      { id: "lnk-agents", name: "Agent Orchestrator", soon: false, to: "/#agent-fleet-section" },
      { id: "lnk-community", name: "Community Sandbox", soon: true },
      { id: "lnk-help", name: "Client Knowledgebase", soon: true },
      { id: "lnk-guides", name: "Campaign Blueprints", soon: true }
    ],
  },
];

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="custom-footer">
      {/* Action Prompt Banner */}
      <section className="footer-top-section" aria-label="Agency Call to Action">
        <div className="footer-top-text">
          <div className="footer-status-pill">
            <span className="footer-status-dot" />
            <span>OMS Autonomous Engine v4.2.1 • Operational</span>
          </div>
          <h2 className="footer-main-title">
            HAVE A CHALLENGE<br />
            <span className="footer-title-highlight">WORTH SCALING?</span>
          </h2>
        </div>

        <div className="footer-button-container">
          <Link to="/contact" className="footer-primary-btn">
            INITIATE CAMPAIGN BRIEF &rarr;
          </Link>
          <Link to="/production-tv" className="footer-secondary-btn">
            VIEW CREDENTIALS
          </Link>
        </div>
      </section>

      {/* Main Structural Columns */}
      <section className="footer-grid-section" aria-label="Corporate Directory">
        {FOOTER_SECTIONS.map((section) => (
          <FooterColumn key={section.id} section={section} />
        ))}

        <div className="footer-column">
          <h4 className="footer-column-title">HEADQUARTERS & DESK</h4>
          <p className="footer-address-text">
            Cairo &amp; Giza Media Corridors<br />
            Regional Presence: Egypt &amp; MENA
          </p>
          <p className="footer-address-text">
            <a href="mailto:info@omsegy.agency" className="footer-link-highlight">
              info@omsegy.agency
            </a>
          </p>
        </div>
      </section>

      {/* Bottom Metadata & Legal Links */}
      <section className="footer-bottom-bar" aria-label="Legal &amp; Social">
        <div className="footer-bottom-left">
          <Link to="/" className="footer-logo-link" aria-label="Go to homepage">
            <div className="footer-logo-pill">
              <img
                src="/oms-logo-no-names.png"
                alt="OMS Corporate Logo"
                className="footer-bottom-logo"
              />
            </div>
          </Link>
          <p className="footer-copyright">
            &copy; {currentYear} OMS Advertising &amp; Autonomous Marketing Systems. All rights reserved.
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
