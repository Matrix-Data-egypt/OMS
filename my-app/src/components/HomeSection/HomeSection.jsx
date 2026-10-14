import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import NeuralCanvas from '../common/NeuralCanvas';
import { useLanguage } from '../../context/LanguageContext';
import { PAGE_TRANSLATIONS } from '../../context/translationsData';
import {
  CORE_PILLARS,
  CAMPAIGN_OBJECTIVES,
  TIMELINE_STEPS
} from '../../data/agentData';
import './HomeSection.css';

export default function HomeSection() {
  const [activeStep, setActiveStep] = useState(1);
  const { t, language } = useLanguage();
  const TH = PAGE_TRANSLATIONS[language]?.home || PAGE_TRANSLATIONS.en.home;

  const activeTimelineObj = TIMELINE_STEPS.find((ts) => ts.step === activeStep) || TIMELINE_STEPS[0];

  const handleScrollToCampaign = (e) => {
    e.preventDefault();
    const elem = document.getElementById('campaign-builder-section');
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <main className="home-container">
      {/* Interactive 60fps Neural Particle Mesh Background */}
      <NeuralCanvas />

      {/* Ambient glowing radial lights */}
      <div className="home-ambient-glow glow-1" aria-hidden="true" />
      <div className="home-ambient-glow glow-2" aria-hidden="true" />
      <div className="home-ambient-glow glow-3" aria-hidden="true" />

      {/* Hero Banner Section */}
      <header className="home-hero-clean">
        <div
          className="hero-banner-bg"
          style={{ backgroundImage: `url(${process.env.PUBLIC_URL}/hero-banner.png)` }}
        >
          <div className="hero-clean-content overlay">
            <h1 className="hero-main-title-clean">
              {t('home.heroTitle1', 'Your Vision, Amplified')}<br />
              <span className="highlight-gold-clean">{t('home.heroTitle2', 'Across Every Channel & Screen.')}</span>
            </h1>

            <p className="hero-paragraph-clean">
              {t(
                'home.heroDesc',
                'From award-winning TV commercials and iconic outdoor billboards to high-performance digital campaigns — we bring your brand to life across Egypt and the MENA region with creativity, strategy, and measurable impact.'
              )}
            </p>

            <div className="hero-buttons-clean">
              <Link to="/contact" className="btn-gold-action">
                {t('home.startCampaign', 'Start Your Campaign →')}
              </Link>
              <a
                href="#campaign-builder-section"
                onClick={handleScrollToCampaign}
                className="btn-outline-action"
              >
                {t('home.exploreServices', 'Explore Our Services ↓')}
              </a>
            </div>

            {/* Strategic Pillars Bar */}
            <div className="hero-pillars-bar" aria-label="Core Service Pillars">
              {CORE_PILLARS.map((pillar) => (
                <div key={pillar.id} className="pillar-pill">
                  <span className="pillar-title">{pillar.title}</span>
                  <span className="pillar-desc">{pillar.desc}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Campaign Lifecycle Section */}
      <section className="strategy-timeline" aria-label="How We Work">
        <div className="section-intro">
          <span className="tag-purple-small">{TH.processTag}</span>
          <h2>{TH.processTitle}</h2>
          <p className="section-intro-desc">{TH.processDesc}</p>
        </div>

        <div className="timeline-steps-bar" role="tablist" aria-label="Campaign phases">
          {TIMELINE_STEPS.map((item) => {
            const stepNum = item.step;
            const isActive = activeStep === stepNum;
            return (
              <button
                key={item.step}
                className={`timeline-node ${isActive ? 'active' : ''}`}
                onClick={() => setActiveStep(stepNum)}
                role="tab"
                aria-selected={isActive}
                aria-controls="timeline-panel"
                id={`timeline-tab-${stepNum}`}
              >
                <span className="node-num" aria-hidden="true">
                  PHASE // {stepNum}
                </span>
                <span className="node-text">{item.title}</span>
                <div className="node-active-bar" />
              </button>
            );
          })}
        </div>

        {/* Dynamic Phase Detail */}
        <div
          className="timeline-dynamic-content"
          role="tabpanel"
          id="timeline-panel"
          aria-labelledby={`timeline-tab-${activeStep}`}
          aria-live="polite"
        >
          <span className="timeline-content-badge">
            {activeTimelineObj.phase}
          </span>
          <h3>{activeTimelineObj.title}</h3>
          <p>{activeTimelineObj.desc}</p>
        </div>
      </section>

      {/* Campaign Goals Section */}
      <section className="objectives-section" aria-label="What We Help You Achieve">
        <div className="section-intro">
          <span className="tag-purple-small">{TH.goalsTag}</span>
          <h2>{TH.goalsTitle}</h2>
          <p className="section-intro-desc">{TH.goalsDesc}</p>
        </div>

        <div className="objectives-grid">
          {CAMPAIGN_OBJECTIVES.map((obj) => (
            <ObjectiveCard key={obj.id} obj={obj} />
          ))}
        </div>
      </section>

      {/* Core Capabilities Section */}
      <section className="home-services-section" aria-label="Our Capabilities">
        <div className="section-intro">
          <span className="tag-purple-small">{TH.capsTag}</span>
          <h2>{TH.capsTitle}</h2>
          <p className="section-intro-desc">{TH.capsDesc}</p>
        </div>

        <div className="home-services-layout-grid">
          <FrameworkGroup TH={TH} />
        </div>
      </section>

    </main>
  );
}

function ObjectiveCard({ obj }) {
  const { tag, title, desc, agentPill, strategicBenefit } = obj;
  return (
    <article className="objective-card">
      <div className="obj-card-top">
        <span className="obj-tag">{tag}</span>
        {strategicBenefit && <span className="obj-kpi-pill">{strategicBenefit}</span>}
      </div>
      <h3>{title}</h3>
      <p>{desc}</p>
      <div className="obj-card-bottom">
        <span className="obj-agent-pill">
          <span className="agent-dot" /> {agentPill}
        </span>
      </div>
    </article>
  );
}

function FrameworkGroup({ TH }) {
  const serviceBullets = [
    'Media Buying — TV & Radio Broadcast',
    'Production & Cinematic TV Commercials',
    'Indoor & Outdoor Mega Billboards',
    'PR, Booths & Experiential Events',
    'Design & Premium Print Production',
    'Brand Identity & Corporate Image',
    'Digital Marketing & Social Media',
    'BTL & Ground Activations'
  ];

  return (
    <article className="home-service-group-card">
      <div className="group-card-header">
        <span className="framework-num-pill">{TH.suiteBadge}</span>
        <h3>{TH.suiteTitle}</h3>
        <ul className="group-bullets-preview">
          {serviceBullets.map((bullet) => (
            <li key={bullet}>
              <span className="bullet-glow-dot" />
              <span>{bullet}</span>
            </li>
          ))}
        </ul>
        <div className="framework-bottom-cta">
          <Link to="/work" className="framework-link-btn">
            {TH.exploreWork}
          </Link>
        </div>
      </div>

      <div className="group-detailed-subcards-stack">
        <div className="detailed-subcard">
          <div className="subcard-glow-line" aria-hidden="true" />
          <h4>{TH.subcard1Title}</h4>
          <p>{TH.subcard1Desc}</p>
        </div>

        <div className="detailed-subcard">
          <div className="subcard-glow-line" aria-hidden="true" />
          <h4>{TH.subcard2Title}</h4>
          <p>{TH.subcard2Desc}</p>
        </div>

        <div className="detailed-subcard">
          <div className="subcard-glow-line" aria-hidden="true" />
          <h4>{TH.subcard3Title}</h4>
          <p>{TH.subcard3Desc}</p>
        </div>

        <div className="detailed-subcard">
          <div className="subcard-glow-line" aria-hidden="true" />
          <h4>{TH.subcard4Title}</h4>
          <p>{TH.subcard4Desc}</p>
        </div>
      </div>
    </article>
  );
}
