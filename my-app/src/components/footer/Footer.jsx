import React from 'react';
import { Link } from 'react-router-dom'; // 💡 استيراد الـ Link لتفعيل التنقل بين الصفحات بدون تحميل
import './Footer.css'; 

export default function Footer() {
  const sections = [
    {
      title: "Company",
      links: [
        { name: "About", soon: false, to: "/about" },
        { name: "Outdoor", soon: false, to: "/outdoor" },
        { name: "POSS", soon: false, to: "/poss" },
        { name: "Press", soon: false, to: "/contact" }
      ],
    },
    {
      title: "Resources",
      links: [
        { name: "Community", soon: true },
        { name: "Help Center", soon: true },
        { name: "Templates", soon: true },
        { name: "Guides", soon: true }
      ],
    },
  ];

  return (
    <footer className="custom-footer">
      <div className="footer-top-section">
        <div>
          <span className="footer-sub-heading">INTEGRATED AGENCY NETWORK • EGYPT & MENA</span>
          <h2 className="footer-main-title">HAVE A CHALLENGE<br />WORTH SOLVING?</h2>
        </div>
        
        {/* 💡 تم تصحيح الأزرار وتحويلها إلى روابط تفتح الصفحات المطلوبة فوراً */}
        <div className="footer-button-container">
          <Link to="/contact" className="footer-primary-btn" style={{ textDecoration: 'none', display: 'inline-block', textAlign: 'center' }}>
            INITIATE BRIEF
          </Link>
          <Link to="/production-tv" className="footer-secondary-btn" style={{ textDecoration: 'none', display: 'inline-block', textAlign: 'center' }}>
            VIEW CREDENTIALS
          </Link>
        </div>
      </div>

      <div className="footer-grid-section">
        {sections.map((section, index) => (
          <div key={index} className="footer-column">
            <h4 className="footer-column-title">{section.title.toUpperCase()}</h4>
            <ul className="footer-list">
              {section.links.map((link, linkIndex) => (
                <li key={linkIndex} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {link.soon ? (
                    <span className="footer-link-soon-disabled">
                      {link.name} <span className="footer-soon-badge">Soon</span>
                    </span>
                  ) : (
                    /* 🌟 تم استبدال الـ <a> بـ وسم الـ <Link> ليعمل التوجيه الذكي بدون كراش أو تحميل للصفحة */
                    <Link to={link.to} className="footer-link">
                      {link.name}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
        <div className="footer-column">
          <h4 className="footer-column-title">Email</h4>
          <p className="footer-address-text">
            <a href="mailto:desk@omsadvertising.com" className="footer-link">info@omsegy.agency</a><br />
          </p>
        </div>
      </div>
      <div className="footer-bottom-bar">
        <div className="footer-bottom-left">
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', textDecoration: 'none' }}>
            <img 
              src="/oms-logo-no-names.png" 
              alt="OMS Logo" 
              className="footer-bottom-logo" 
            />
          </Link>
          <p className="footer-copyright">
            © {new Date().getFullYear()} OMS Advertising. All rights reserved.
          </p>
        </div>
        <div className="footer-social-links">
          <a
            href="https://linkedin.com"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-link"
          >
            LinkedIn
          </a>
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-link"
          >
            Instagram
          </a>
          <a
            href="https://youtube.com"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-link"
          >
            YouTube
          </a>
          <a
            href="https://facebook.com"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-link"
          >
            Facebook
          </a>
        </div>
      </div>
    </footer>
  );
}
