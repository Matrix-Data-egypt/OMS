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
  const [submitting, setSubmitting] = useState(false);
  const [statusFeedback, setStatusFeedback] = useState({ type: '', message: '' });
  
  const [formData, setFormData] = useState({
    fullName: '',
    companyName: '',
    email: '',
    phone: '',
    summary: ''
  });

  const currentYear = new Date().getFullYear();

  const handleInputChange = ({ target: { name, value } }) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (statusFeedback.message) setStatusFeedback({ type: '', message: '' });
  };

  const validateForm = () => {
    if (!formData.fullName.trim()) return 'Full Name is required.';
    if (!formData.companyName.trim()) return 'Company / Enterprise Name is required.';
    if (!formData.email.trim()) return 'Corporate Email Address is required.';
    if (!formData.phone.trim()) return 'Direct Phone Number (WhatsApp) is required.';
    if (!formData.summary.trim()) return 'Project Summary is required.';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationError = validateForm();
    if (validationError) {
      return setStatusFeedback({ type: 'error', message: validationError });
    }

    setSubmitting(true);
    setStatusFeedback({ type: '', message: '' });

    try {
      await api('/api/briefs', {
        method: 'POST',
        body: {
          objective,
          sector,
          ...formData,
        },
      });

      setStatusFeedback({ type: 'success', message: 'Brief initiated successfully! Our strategy team will reach out within 2 hours. 🎉' });
      setFormData({ fullName: '', companyName: '', email: '', phone: '', summary: '' });
    } catch (err) {
      setStatusFeedback({ 
        type: 'error', 
        message: err.message || 'Submission failed. Please verify your connection and try again.' 
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="contact-container">
      {/* Hero Header Context */}
      <header className="contact-hero">
        <div className="hero-wrapper">
          <div className="hero-content">
            <span className="badge-purple">Executive Briefing Intake - Egypt &amp; MENA Region</span>
            <h1 className="hero-heading">
              Have a challenge <br />
              worth solving? <span className="text-italic-purple">Let's Talk.</span>
            </h1>
            <p className="hero-subtext">
              Tell us what you're trying to achieve. Let's engineer the strategy, creative campaign, and media execution around your commercial goals.
            </p>
          </div>
          <div className="hero-nda-box" role="note">
            <div className="nda-icon" aria-hidden="true">🔒</div>
            <div className="nda-text">
              <strong>Institutional NDA Guarantee</strong>
              <p>All project inquiries are automatically protected under strict corporate NDA protocols. Pre-exec SLA within 24 hours.</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Workspace Form Flow */}
      <section className="workspace-section" aria-label="Brief Architect Workspace">
        <div className="workspace-grid">
          
          <div className="brief-architect-card">
            <div className="architect-header">
              <div>
                <span className="step-tag">Interactive Project Scope</span>
                <h2 className="architect-title">Strategic Brief Architect</h2>
              </div>
              <span className="date-stamp">OMS / Brief Intake / {currentYear}</span>
            </div>

            {statusFeedback.message && (
              <div className={`form-feedback-banner feedback-${statusFeedback.type}`} role="alert">
                {statusFeedback.type === 'error' ? '⚠️' : '✨'} {statusFeedback.message}
              </div>
            )}

            <form className="architect-form" onSubmit={handleSubmit}>
              
              {/* Step 1: Campaign Objectives */}
              <div className="form-group">
                <span className="group-label"><span>1</span> Primary Campaign Objectives</span>
                <div className="chips-grid" role="group" aria-label="Select primary campaign objective">
                  {CAMPAIGN_OBJECTIVES.map((item) => (
                    <button 
                      key={item} 
                      type="button" 
                      className={`chip-btn ${objective === item ? 'active' : ''}`} 
                      onClick={() => setObjective(item)}
                      aria-pressed={objective === item}
                    >
                      {item === objective && <span className="check-icon" aria-hidden="true">✓ </span>}
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              {/* Step 2: Industry Sector */}
              <div className="form-group">
                <span className="group-label"><span>2</span> Industry Sector</span>
                <div className="chips-grid" role="group" aria-label="Select industry sector">
                  {INDUSTRY_SECTORS.map((item) => (
                    <button 
                      key={item} 
                      type="button" 
                      className={`chip-btn ${sector === item ? 'active' : ''}`} 
                      onClick={() => setSector(item)}
                      aria-pressed={sector === item}
                    >
                      {item === sector && <span className="check-icon" aria-hidden="true">✓ </span>}
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              {/* Step 3: Contact Credentials */}
              <div className="form-group">
                <span className="group-label"><span>3</span> Key Commercial &amp; Contact Credentials</span>
                <div className="inputs-grid">
                  <div className="input-field">
                    <label htmlFor="fullName">Full Name *</label>
                    <input 
                      id="fullName"
                      type="text" 
                      name="fullName" 
                      value={formData.fullName} 
                      onChange={handleInputChange} 
                      placeholder="e.g. Tarek Mansour" 
                      required
                    />
                  </div>
                  <div className="input-field">
                    <label htmlFor="companyName">Company / Enterprise Name *</label>
                    <input 
                      id="companyName"
                      type="text" 
                      name="companyName" 
                      value={formData.companyName} 
                      onChange={handleInputChange} 
                      placeholder="e.g. Palm Hills Developments" 
                      required
                    />
                  </div>
                  <div className="input-field">
                    <label htmlFor="email">Corporate Email Address *</label>
                    <input 
                      id="email"
                      type="email" 
                      name="email" 
                      value={formData.email} 
                      onChange={handleInputChange} 
                      placeholder="tarek@company.com" 
                      required
                    />
                  </div>
                  <div className="input-field">
                    <label htmlFor="phone">Direct Phone Number (WhatsApp) *</label>
                    <input 
                      id="phone"
                      type="tel" 
                      name="phone" 
                      value={formData.phone} 
                      onChange={handleInputChange} 
                      placeholder="+20 102 345 6789" 
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Step 4: Summary Textarea */}
              <div className="form-group">
                <label htmlFor="summary" className="group-label">Project Summary &amp; Core Challenges *</label>
                <textarea 
                  id="summary"
                  name="summary" 
                  value={formData.summary} 
                  onChange={handleInputChange} 
                  placeholder="Outline your key project objectives..."
                  required
                />
              </div>

              {/* Footer Execution Action Area */}
              <div className="form-footer">
                <p className="footer-notice">🔒 Secure submission via encrypted channel. Response guaranteed within 2 hours.</p>
                <button type="submit" className="submit-btn" disabled={submitting}>
                  {submitting ? 'Sending…' : 'Initiate Strategic Briefing →'}
                </button>
              </div>
            </form>
          </div>

          {/* Secondary Information Sidebar */}
          <aside className="sidebar-column" aria-label="Direct Channels Support">
            <div className="emergency-desk-card">
              <span className="card-tag">Direct Media Desk</span>
Emergency Campaign & Media Buying Desk
Critical heavy-hitter campaigns across Global, Egypt, & MENA. For fast implementation requirements, reach out directly.

✉️
Encrypted Brief Intake
info@omsegy.agency



            </div>
          </aside>
        </div>
      </section>
    </main>



);
}
