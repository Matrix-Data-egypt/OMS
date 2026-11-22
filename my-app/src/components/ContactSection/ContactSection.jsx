import React, { useState } from 'react';
import './ContactSection.css';
import { api } from '../../api';
import { useLanguage } from '../../context/LanguageContext';
import { PAGE_TRANSLATIONS } from '../../context/translationsData';

export default function ContactSection() {
  const { language } = useLanguage();
  const tContact = PAGE_TRANSLATIONS[language]?.contact || PAGE_TRANSLATIONS.en.contact;

  const OBJECTIVES_MAP = {
    ar: [
      'بناء علامة تجارية جديدة', 'إطلاق منتج جديد في السوق', 'حملة B2B على مستوى الجمهورية',
      'إنتاج إعلان تلفزيوني تجاري', 'حملات رقمية متكاملة لزيادة المبيعات',
      'تنظيم مؤتمرات وفعاليات كبرى', 'تنشيط مبيعات وتجارب ميدانية'
    ],
    en: [
      'Build a New Brand', 'Launch a New Product', 'National B2B Blitz',
      'TV Commercial Production', 'Full-Funnel Digital Performance',
      'Brand & Press Events', 'Mega Experimental Activation'
    ],
    fr: [
      'Créer une nouvelle marque', 'Lancer un nouveau produit', 'Campagne B2B Nationale',
      'Production de spots TV', 'Campagne Digitale Haute Performance',
      'Événements & Relations Presse', 'Activation Terrain & Expérientielle'
    ]
  };

  const SECTORS_MAP = {
    ar: [
      'التطوير العقاري', 'الأغذية والمشروبات FMCG', 'الرعاية الصحية والأدوية',
      'السيارات والمركبات', 'التجزئة والمنتجات الفاخرة', 'البنوك والخدمات المالية', 'الاتصالات والتكنولوجيا'
    ],
    en: [
      'Real Estate', 'FMCG / F&B', 'Healthcare', 'Automotive',
      'Retail & Luxury', 'Banking & Fintech', 'Telecom & Technology'
    ],
    fr: [
      'Immobilier', 'Biens de Consommation & Agroalimentaire', 'Santé & Pharmacie',
      'Automobile', 'Distribution & Luxe', 'Banque & Fintech', 'Télécoms & Technologies'
    ]
  };

  const currentObjectives = OBJECTIVES_MAP[language] || OBJECTIVES_MAP.en;
  const currentSectors = SECTORS_MAP[language] || SECTORS_MAP.en;

  const [objective, setObjective] = useState(currentObjectives[1]);
  const [sector, setSector] = useState(currentSectors[0]);
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
    if (!formData.fullName.trim()) {
      return language === 'ar' ? 'الاسم الكامل مطلوب.' : language === 'fr' ? 'Le nom complet est requis.' : 'Full Name is required.';
    }
    if (!formData.companyName.trim()) {
      return language === 'ar' ? 'اسم الشركة أو المؤسسة مطلوب.' : language === 'fr' ? 'Le nom de l\'entreprise est requis.' : 'Company / Enterprise Name is required.';
    }
    if (!formData.email.trim()) {
      return language === 'ar' ? 'البريد الإلكتروني للعمل مطلوب.' : language === 'fr' ? 'L\'email professionnel est requis.' : 'Corporate Email Address is required.';
    }
    if (!formData.phone.trim()) {
      return language === 'ar' ? 'رقم الهاتف المباشر أو واتساب مطلوب.' : language === 'fr' ? 'Le numéro de téléphone est requis.' : 'Direct Phone Number (WhatsApp) is required.';
    }
    if (!formData.summary.trim()) {
      return language === 'ar' ? 'يرجى كتابة ملخص مختصر للمشروع.' : language === 'fr' ? 'Le descriptif du projet est requis.' : 'Project Summary is required.';
    }
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
          fullName: formData.fullName.trim(),
          companyName: formData.companyName.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          summary: formData.summary.trim(),
        },
      });

      setStatusFeedback({
        type: 'success',
        message: tContact.successMsg,
      });

      setFormData({
        fullName: '',
        companyName: '',
        email: '',
        phone: '',
        summary: ''
      });
    } catch (err) {
      setStatusFeedback({ 
        type: 'error', 
        message: err.message || (language === 'ar' ? 'تعذر إرسال الطلب، يرجى التحقق من اتصالك والمحاولة مرة أخرى.' : 'Submission failed. Please verify your connection and try again.')
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
            <span className="badge-purple">
              {language === 'ar' ? 'استقبال ملخصات المشاريع التنفيذية — مصر والشرق الأوسط' : language === 'fr' ? 'Briefing Exécutif — Égypte & Région MENA' : 'Executive Briefing Intake - Egypt & MENA Region'}
            </span>
            <h1 className="hero-heading">
              {tContact.heroTitle}
            </h1>
            <p className="hero-subtext">
              {tContact.heroSub}
            </p>
          </div>
          <div className="hero-nda-box" role="note">
            <div className="nda-icon" aria-hidden="true">🔒</div>
            <div className="nda-text">
              <strong>{language === 'ar' ? 'ضمان اتفاقية السرية التامة (NDA)' : language === 'fr' ? 'Garantie de Confidentialité (NDA)' : 'Institutional NDA Guarantee'}</strong>
              <p>{language === 'ar' ? 'جميع استفسارات المشاريع محمية تلقائياً بموجب بروتوكولات سرية البيانات المؤسسية مع استجابة خلال 24 ساعة.' : 'All project inquiries are automatically protected under strict corporate NDA protocols. Pre-exec SLA within 24 hours.'}</p>
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
                <span className="step-tag">{language === 'ar' ? 'نطاق وتفاصيل المشروع' : 'Interactive Project Scope'}</span>
                <h2 className="architect-title">{tContact.formTitle}</h2>
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
                <span className="group-label"><span>1</span> {tContact.labelObjective}</span>
                <div className="chips-grid" role="group" aria-label="Select primary campaign objective">
                  {currentObjectives.map((item) => (
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
                <span className="group-label"><span>2</span> {tContact.labelSector}</span>
                <div className="chips-grid" role="group" aria-label="Select industry sector">
                  {currentSectors.map((item) => (
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
                <span className="group-label"><span>3</span> {language === 'ar' ? 'بيانات التواصل الرسمية' : 'Key Commercial & Contact Credentials'}</span>
                <div className="inputs-grid">
                  <div className="input-field">
                    <label htmlFor="fullName">{tContact.labelName}</label>
                    <input 
                      id="fullName"
                      type="text" 
                      name="fullName" 
                      value={formData.fullName} 
                      onChange={handleInputChange} 
                      placeholder={tContact.placeholderName} 
                      required
                    />
                  </div>
                  <div className="input-field">
                    <label htmlFor="companyName">{tContact.labelCompany}</label>
                    <input 
                      id="companyName"
                      type="text" 
                      name="companyName" 
                      value={formData.companyName} 
                      onChange={handleInputChange} 
                      placeholder={tContact.placeholderCompany} 
                      required
                    />
                  </div>
                  <div className="input-field">
                    <label htmlFor="email">{tContact.labelEmail}</label>
                    <input 
                      id="email"
                      type="email" 
                      name="email" 
                      value={formData.email} 
                      onChange={handleInputChange} 
                      placeholder={tContact.placeholderEmail} 
                      required
                    />
                  </div>
                  <div className="input-field">
                    <label htmlFor="phone">{tContact.labelPhone}</label>
                    <input 
                      id="phone"
                      type="tel" 
                      name="phone" 
                      value={formData.phone} 
                      onChange={handleInputChange} 
                      placeholder={tContact.placeholderPhone} 
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Step 4: Summary Textarea */}
              <div className="form-group">
                <label htmlFor="summary" className="group-label">{tContact.labelSummary}</label>
                <textarea 
                  id="summary"
                  name="summary" 
                  value={formData.summary} 
                  onChange={handleInputChange} 
                  placeholder={tContact.placeholderSummary}
                  rows={4}
                  required
                />
              </div>

              {/* Footer Execution Action Area */}
              <div className="form-footer">
                <p className="footer-notice">
                  🔒 {language === 'ar' ? 'إرسال آمن ومشفر عبر قنوات محمية. يتم الرد خلال 24 ساعة عمل.' : 'Secure submission via encrypted channel. Response guaranteed within 24 hours.'}
                </p>
                <button type="submit" className="submit-btn" disabled={submitting}>
                  {submitting ? tContact.sendingBtn : tContact.submitBtn}
                </button>
              </div>
            </form>
          </div>

        </div>
      </section>
    </main>
  );
}
