import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import NeuralCanvas from '../common/NeuralCanvas';
import {
  CORE_PILLARS,
  CAMPAIGN_OBJECTIVES,
  TIMELINE_STEPS
} from '../../data/agentData';
import './HomeSection.css';

export default function HomeSection() {
  const [activeStep, setActiveStep] = useState(1);

  const activeTimelineObj = TIMELINE_STEPS.find((t) => t.step === activeStep) || TIMELINE_STEPS[0];

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
              Your Vision, Amplified<br />
              Across Every <span className="highlight-gold-clean">Channel & Screen.</span>
            </h1>

            <p className="hero-paragraph-clean">
              From award-winning TV commercials and iconic outdoor billboards to high-performance digital campaigns — we bring your brand to life across Egypt and the MENA region with creativity, strategy, and measurable impact.
            </p>

            <div className="hero-buttons-clean">
              <Link to="/contact" className="btn-gold-action">
                Start Your Campaign &rarr;
              </Link>
              <a
                href="#campaign-builder-section"
                onClick={handleScrollToCampaign}
                className="btn-outline-action"
              >
                Explore Our Services ↓
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
          <span className="tag-purple-small">Our Process</span>
          <h2>One Partner. Your Entire Campaign Journey.</h2>
          <p className="section-intro-desc">
            From initial strategy and creative production to media placement and performance reporting — we handle every step.
          </p>
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
          <span className="tag-purple-small">What We Help You Achieve</span>
          <h2>What's Your Business Goal?</h2>
          <p className="section-intro-desc">
            Whether you're launching a product, building brand awareness, or driving sales — we have the expertise and resources to deliver results.
          </p>
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
          <span className="tag-purple-small">Full-Service Capabilities</span>
          <h2>Everything Your Brand Needs, Under One Roof</h2>
          <p className="section-intro-desc">
            A complete suite of advertising and marketing services, seamlessly integrated for maximum impact and efficiency.
          </p>
        </div>

        <div className="home-services-layout-grid">
          <FrameworkGroup />
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

function FrameworkGroup() {
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
        <span className="framework-num-pill">CAPABILITY // FULL-SERVICE SUITE</span>
        <h3>Integrated Advertising Capabilities</h3>
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
            Explore Our Work &amp; Portfolio &rarr;
          </Link>
        </div>
      </div>

      <div className="group-detailed-subcards-stack">
        <div className="detailed-subcard">
          <div className="subcard-glow-line" aria-hidden="true" />
          <h4>Brand Identity &amp; Visual Direction</h4>
          <p>
            Your brand is more than a logo — it's the story your audience tells about you. We develop powerful brand identities, visual systems, and strategic positioning that make your brand instantly recognizable and deeply trusted.
          </p>
        </div>

        <div className="detailed-subcard">
          <div className="subcard-glow-line" aria-hidden="true" />
          <h4>Outdoor &amp; Indoor Advertising (OOH)</h4>
          <p>
            Prime billboard placements, digital LED screens, and high-visibility transit media across Cairo, Alexandria, and key regional markets — putting your brand in front of the audiences that matter most.
          </p>
        </div>

        <div className="detailed-subcard">
          <div className="subcard-glow-line" aria-hidden="true" />
          <h4>Events, PR &amp; Brand Activations</h4>
          <p>
            Memorable launch events, trade show experiences, and on-ground brand activations designed to create real connections with your customers and generate lasting positive brand associations.
          </p>
        </div>

        <div className="detailed-subcard">
          <div className="subcard-glow-line" aria-hidden="true" />
          <h4>TV &amp; Radio Broadcast Production</h4>
          <p>
            Professional TV commercials and radio spots produced to broadcast standards, crafted to tell your brand story compellingly and distributed across Egypt and MENA's leading broadcast networks.
          </p>
        </div>
      </div>
    </article>
  );
}
