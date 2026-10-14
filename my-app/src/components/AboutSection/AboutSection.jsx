import React from 'react';
import { Link } from 'react-router-dom';
import './AboutSection.css';
import PageHero from '../PageHero/PageHero';
import { useLanguage } from '../../context/LanguageContext';
import { PAGE_TRANSLATIONS } from '../../context/translationsData';

export default function AboutSection() {
  const { language } = useLanguage();
  const tAbout = PAGE_TRANSLATIONS[language]?.about || PAGE_TRANSLATIONS.en.about;

  const REASONS_ICONS = [
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
      <circle cx="9" cy="7" r="4"></circle>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
    </svg>,
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.42 4.58a5.4 5.4 0 0 0-7.65 0l-.77.78-.77-.78a5.4 5.4 0 0 0-7.65 7.65l.77.78L12 20.66l7.65-7.65.77-.78a5.4 5.4 0 0 0 0-7.65z"></path>
    </svg>,
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"></circle>
      <line x1="2" y1="12" x2="22" y2="12"></line>
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
    </svg>,
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
    </svg>,
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
    </svg>
  ];

  const VALUE_ACCENTS = ['crimson', 'gold', 'gradient'];

  return (
    <main className="about-page-container">
      {/* Decorative ambient background blur & grid overlays */}
      <div className="about-ambient-glow" aria-hidden="true" />
      <div className="about-mesh-grid" aria-hidden="true" />

      {/* Hero Banner Section */}
      <header>
        <PageHero 
          title={<>{tAbout.heroTitle}</>} 
          subtitle={tAbout.heroSub} 
        />
      </header>

      {/* Mission & Vision Section */}
      <section className="about-statement-grid" aria-label="Company Statements">
        <div className="statement-card mission-box">
          <div className="statement-card-glow-bar red-bar" />
          <div className="statement-card-header">
            <span className="statement-tag">{tAbout.promiseTag}</span>
            <span className="statement-badge-mini">{tAbout.promiseBadge}</span>
          </div>
          <h2>{tAbout.missionTitle}</h2>
          <p>{tAbout.missionDesc}</p>
          <div className="statement-card-footer">
            <span className="footer-accent-line" />
            <span className="footer-label">{tAbout.missionFooter}</span>
          </div>
        </div>

        <div className="statement-card vision-box">
          <div className="statement-card-glow-bar gold-bar" />
          <div className="statement-card-header">
            <span className="statement-tag">{tAbout.futureTag}</span>
            <span className="statement-badge-mini">{tAbout.futureBadge}</span>
          </div>
          <h2>{tAbout.visionTitle}</h2>
          <p>{tAbout.visionDesc}</p>
          <div className="statement-card-footer">
            <span className="footer-accent-line gold" />
            <span className="footer-label">{tAbout.visionFooter}</span>
          </div>
        </div>
      </section>

      {/* Capabilities & Advantages Section */}
      <section className="about-capabilities-layout" aria-label="Capabilities and Advantages">
        {/* Why To Choose Column */}
        <div className="capabilities-column choose-column">
          <div className="column-title-wrapper">
            <div className="title-left-group">
              <span className="mini-gold-accent" aria-hidden="true">•</span>
              <h2>{tAbout.whyTitle}</h2>
            </div>
            <span className="column-counter-pill">{tAbout.whyPillars}</span>
          </div>
          <div className="choose-cards-stack">
            {tAbout.reasons.map(({ title, desc }, index) => (
              <div key={`reason-${index}`} className="choose-interactive-row">
                <div className="choose-icon-box" aria-hidden="true">
                  {REASONS_ICONS[index % REASONS_ICONS.length]}
                </div>
                <div className="choose-item-content">
                  <div className="choose-title-row">
                    <h4>{title}</h4>
                    <span className="choose-item-idx" aria-hidden="true">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                  </div>
                  <p>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* What We Do Column */}
        <div className="capabilities-column core-do-column">
          <div className="column-title-wrapper">
            <div className="title-left-group">
              <span className="mini-gold-accent" aria-hidden="true">•</span>
              <h2>{tAbout.whatTitle}</h2>
            </div>
            <span className="column-counter-pill">{tAbout.whatSuite}</span>
          </div>
          <ul className="about-do-bullets-list">
            {tAbout.whatList.map((item, idx) => (
              <li key={`what-${idx}`} className="do-bullet-item">
                <div className="do-bullet-left">
                  <span className="do-bullet-serial">0{idx + 1}</span>
                  <div className="do-bullet-texts">
                    <span className="bullet-text-main">{item.name}</span>
                    <span className="bullet-badge-tag">{item.badge}</span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
          <div className="do-embedded-note-card">
            <div className="note-pulse-dot" />
            <p>{tAbout.whatNote}</p>
          </div>
        </div>
      </section>

      {/* Core Values Section */}
      <section className="about-values-section" aria-label="Our Core Values">
        <div className="values-header-center">
          <span className="about-badge-gold">{tAbout.valuesBadge}</span>
          <h2>{tAbout.valuesTitle}</h2>
          <p className="values-subtitle">{tAbout.valuesSub}</p>
        </div>
        <div className="values-display-grid">
          {tAbout.valuesList.map(({ title, desc, tag }, index) => {
            const formattedIndex = String(index + 1).padStart(2, '0');
            const accent = VALUE_ACCENTS[index % VALUE_ACCENTS.length];
            return (
              <div key={`val-${index}`} className={`value-pillar-card accent-${accent}`}>
                <div className="value-pillar-watermark" aria-hidden="true">{formattedIndex}</div>
                <div className="value-pillar-top-row">
                  <span className="value-serial-indicator" aria-hidden="true">{formattedIndex}</span>
                  <span className="value-category-tag">{tag}</span>
                </div>
                <h3>{title}</h3>
                <p>{desc}</p>
                <div className="value-card-highlight-bar" />
              </div>
            );
          })}
        </div>
      </section>

      {/* Call to Action Bar */}
      <section className="about-cta-section" aria-label="Call to Action">
        <div className="about-cta-box">
          <div className="about-cta-left">
            <span className="cta-accent-badge">{tAbout.ctaBadge}</span>
            <h2>{tAbout.ctaTitle}</h2>
            <p>{tAbout.ctaDesc}</p>
          </div>
          <div className="about-cta-right">
            <Link to="/contact" className="about-action-button">
              <span>{tAbout.ctaBtn}</span>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
