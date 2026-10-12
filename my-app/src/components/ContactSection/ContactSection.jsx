import React, { useState } from 'react';
import './ContactSection.css';
import { api } from '../../api';

const CAMPAIGN_OBJECTIVES = [
  'Build a New Brand', 'Launch a New Product', 'National B2B Blitz',
  'TV Commercial Production', 'Full-Funnel Digital Performance',
  'Brand & Press Events', 'Mega Experimental Activation'
];

const INDUSTRY_SECTORS = [
  'Real Estate', 'FMCG / F&B', 'Healthcare', 'Automotive',
  'Retail & Luxury', 'Banking & Fintech', 'Telecom & Technology'
];

export default function ContactSection() {
  const [objective, setObjective] = useState('Launch a New Product');
  const [sector, setSector] = useState('Real Estate');
  const [formData, setFormData] = useState({ fullName: '', companyName: '', email: '', phone: '', summary: '' });
  const [submitting, setSubmitting] = useState(false);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.fullName.trim()) return alert('لقد نسيت كتابة خانة: الاسم الكامل (Full Name)');
    if (!formData.companyName.trim()) return alert('لقد نسيت كتابة خانة: اسم الشركة (Company Name)');
    if (!formData.email.trim()) return alert('لقد نسيت كتابة خانة: البريد الإلكتروني (Email Address)');
    if (!formData.phone.trim()) return alert('لقد نسيت كتابة خانة: رقم الهاتف (Phone Number)');
    if (!formData.summary.trim()) return alert('لقد نسيت كتابة خانة: ملخص المشروع (Project Summary)');

    setSubmitting(true);
    try {
      await api('/api/briefs', {
        method: 'POST',
        body: {
          objective,
          sector,
          ...formData,
        },
      });
      alert('تم التسجيل بنجاح! 🎉');
      setFormData({ fullName: '', companyName: '', email: '', phone: '', summary: '' });
    } catch (err) {
      alert(err.message || 'حصل خطأ أثناء الإرسال. تأكد أن السيرفر شغال.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="contact-container">
      <section className="contact-hero">
        <div className="hero-wrapper">
          <div className="hero-content">
            <span className="badge-purple">Executive Briefing Intake - Egypt & MENA Region</span>
            <h1 className="hero-heading">Have a challenge <br />worth solving? <span className="text-italic-purple">Let's Talk.</span></h1>
            <p className="hero-subtext">Tell us what you're trying to achieve. Let's engineer the strategy, creative campaign, and media execution around your commercial goals.</p>
          </div>
          <div className="hero-nda-box">
            <div className="nda-icon">🔒</div>
            <div className="nda-text">
              <strong>Institutional NDA Guarantee</strong>
              <p>All project inquiries are automatically protected under strict corporate NDA protocols. Pre-exec SLA within 24 hours.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="workspace-section">
        <div className="workspace-grid">
          
          <div className="brief-architect-card">
            <div className="architect-header">
              <div>
                <span className="step-tag">Interactive Project Scope</span>
                <h2 className="architect-title">Strategic Brief Architect</h2>
              </div>
              <span className="date-stamp">Today: May / OMS / 2026</span>
            </div>

            <form className="architect-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="group-label"><span>1</span> Primary Campaign Objectives</label>
                <div className="chips-grid">
                  {CAMPAIGN_OBJECTIVES.map((item) => (
                    <button key={item} type="button" className={`chip-btn ${objective === item ? 'active' : ''}`} onClick={() => setObjective(item)}>
                      {item === objective && <span className="check-icon">✓</span>} {item}
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label className="group-label"><span>2</span> Industry Sector</label>
                <div className="chips-grid">
                  {INDUSTRY_SECTORS.map((item) => (
                    <button key={item} type="button" className={`chip-btn ${sector === item ? 'active' : ''}`} onClick={() => setSector(item)}>
                      {item === sector && <span className="check-icon">✓</span>} {item}
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label className="group-label"><span>3</span> Key Commercial & Contact Credentials</label>
                <div className="inputs-grid">
                  <div className="input-field"><label>Full Name *</label><input type="text" name="fullName" value={formData.fullName} onChange={handleInputChange} placeholder="e.g. Tarek Mansour" /></div>
                  <div className="input-field"><label>Company / Enterprise Name *</label><input type="text" name="companyName" value={formData.companyName} onChange={handleInputChange} placeholder="e.g. Palm Hills Developments" /></div>
                  <div className="input-field"><label>Corporate Email Address *</label><input type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="tarek@company.com" /></div>
                  <div className="input-field"><label>Direct Phone Number (WhatsApp) *</label><input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} placeholder="+20 102 345 6789" /></div>
                </div>
              </div>

              <div className="form-group">
                <label className="group-label">Project Summary & Core Challenges *</label>
                <textarea name="summary" value={formData.summary} onChange={handleInputChange} placeholder="Outline your key project objectives..."></textarea>
              </div>

              <div className="form-footer">
                <p className="footer-notice">🔒 Secure submission via encrypted channel. Response guaranteed within 2 hours.</p>
                <button type="submit" className="submit-btn" disabled={submitting}>
                  {submitting ? 'Sending…' : 'Initiate Strategic Briefing →'}
                </button>
              </div>
            </form>
          </div>

          <div className="sidebar-column">
            {/* تم الإبقاء فقط على كارت الـ Emergency Desk */}
            <div className="emergency-desk-card">
              <span className="card-tag">Direct Media Desk</span>
              <h3 className="card-heading">Emergency Campaign & Media Buying Desk</h3>
              <p className="card-paragraph">Critical heavy-hitter campaigns across Global, Egypt, & MENA. For fast implementation requirements, reach out directly.</p>
              <div className="contact-row"><span className="icon">✉️</span><div><label>Encrypted Brief Intake</label><a href="mailto:desk@omsadvertising.com">info@omsegy.agency</a></div></div>
            </div>
          </div>

        </div>
      </section>
    </div>
  );
}
