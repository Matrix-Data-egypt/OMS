import React from 'react';
import { SECURITY_STANDARDS } from '../../data/agentData';

export default function SecuritySection() {
  return (
    <section className="security-assurance-section" aria-label="Enterprise Data Security & Standards">
      <div className="section-intro">
        <span className="tag-purple-small">Trust & Compliance</span>
        <h2>Enterprise-Grade Security Standards</h2>
        <p className="section-intro-desc">
          Engineered for global corporations, holding groups, and high-growth brands. Your proprietary customer datasets, media assets, and commercial secrets remain 100% confidential.
        </p>
      </div>

      <div className="security-cards-grid">
        {SECURITY_STANDARDS.map((sec, index) => (
          <div key={sec.id} className="security-card">
            <div className="security-card-header">
              <span className="security-index-pill">0{index + 1}</span>
              <span className="security-badge-text">{sec.badge}</span>
            </div>
            <h3>{sec.title}</h3>
            <p>{sec.desc}</p>
            <div className="security-card-glow" aria-hidden="true" />
          </div>
        ))}
      </div>

      {/* Trust Badges Strip */}
      <div className="security-badges-strip">
        <div className="security-badge-item">
          <span className="badge-icon">🔒</span>
          <span className="badge-text">SOC2 Type II Aligned</span>
        </div>
        <div className="security-badge-item">
          <span className="badge-icon">🛡️</span>
          <span className="badge-text">Zero Data Model Training</span>
        </div>
        <div className="security-badge-item">
          <span className="badge-icon">🇪🇬</span>
          <span className="badge-text">Egypt Law No. 151 Compliant</span>
        </div>
        <div className="security-badge-item">
          <span className="badge-icon">⚡</span>
          <span className="badge-text">TLS 1.3 / AES-256 Encrypted</span>
        </div>
      </div>
    </section>
  );
}
