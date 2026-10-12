import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import NeuralCanvas from '../common/NeuralCanvas';
import AgentOrchestrator from './AgentOrchestrator';
import CampaignBlueprintStudio from './CampaignBlueprintStudio';
import {
  CORE_PILLARS,
  CAMPAIGN_OBJECTIVES,
  TIMELINE_STEPS
} from '../../data/agentData';
import './HomeSection.css';

export default function HomeSection() {
  const [activeStep, setActiveStep] = useState(1);

  const activeTimelineObj = TIMELINE_STEPS.find((t) => t.step === activeStep) || TIMELINE_STEPS[0];

  const handleScrollToOrchestrator = (e) => {
    e.preventDefault();
    const elem = document.getElementById('agent-fleet-section');
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
            <div className="hero-badge-top-clean">
              <span className="live-dot" />
              <span>Autonomous Marketing Agents &amp; Full-Funnel Media</span>
            </div>

            <h1 className="hero-main-title-clean">
              Turning Business Challenges<br />
              Into Brands That <span className="highlight-gold-clean">Move People.</span>
            </h1>

            <p className="hero-paragraph-clean">
              We merge autonomous intelligence agents, broadcast-grade creative fire, and synchronized multi-channel media buying across TV, Outdoor billboards, and digital networks to secure undisputed category dominance.
            </p>

            <div className="hero-buttons-clean">
              <Link to="/contact" className="btn-gold-action">
                Initiate Campaign Brief &rarr;
              </Link>
              <a
                href="#agent-fleet-section"
                onClick={handleScrollToOrchestrator}
                className="btn-outline-action"
              >
                Inspect Agent Fleet ⚡
              </a>
            </div>

            {/* Strategic Pillars Bar (Qualitative - No arbitrary numbers) */}
            <div className="hero-pillars-bar" aria-label="Core Strategic Pillars">
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

      {/* Flagship Feature: Autonomous Agent Orchestrator */}
      <div id="agent-fleet-section">
        <AgentOrchestrator />
      </div>

      {/* Interactive Campaign Strategy Blueprint Studio */}
      <CampaignBlueprintStudio />

      {/* Campaign Strategic Lifecycle Timeline */}
      <section className="strategy-timeline" aria-label="Campaign Strategic Lifecycle">
        <div className="section-intro">
          <span className="tag-purple-small">Unified Integration</span>
          <h2>One Partner. The Whole Campaign Lifecycle.</h2>
          <p className="section-intro-desc">
            From deep market intelligence to prime-time television broadcast and live telemetry auditing.
          </p>
        </div>

        <div className="timeline-steps-bar" role="tablist" aria-label="Strategy phases">
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

        {/* Dynamic Context Canvas */}
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

      {/* Objectives Matcher Section */}
      <section className="objectives-section" aria-label="Campaign Goals Selector">
        <div className="section-intro">
          <span className="tag-purple-small">Campaign Goal Matcher</span>
          <h2>What are you trying to achieve?</h2>
          <p className="section-intro-desc">
            Select your primary objective to activate specialized agent squad configurations.
          </p>
        </div>

        <div className="objectives-grid">
          {CAMPAIGN_OBJECTIVES.map((obj) => (
            <ObjectiveCard key={obj.id} obj={obj} />
          ))}
        </div>
      </section>

      {/* Marketing Frameworks & Capabilities Section */}
      <section className="home-services-section" aria-label="Corporate Capabilities">
        <div className="section-intro">
          <span className="tag-purple-small">OMS Core Infrastructure</span>
          <h2>Integrated Marketing & Media Frameworks</h2>
          <p className="section-intro-desc">
            Proven offline execution powerhouses seamlessly orchestrated by next-generation digital intelligence.
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
        <span className="obj-arrow-cue" aria-hidden="true">&rarr;</span>
      </div>
    </article>
  );
}

function FrameworkGroup() {
  const traditionalBullets = [
    'Media Buying "TV & Radio"',
    'Production & Cinematic TVCs',
    'Indoor & Outdoor Mega Billboards',
    'PR "Booths & Experiential Events"',
    'Designs & Ultra-Premium Printing',
    'CI & Strategic Brand Architecture',
    'Digital Marketing & Social Algorithmic Blitz',
    'BTL & Ground Activations'
  ];

  return (
    <article className="home-service-group-card">
      <div className="group-card-header">
        <span className="framework-num-pill">CAPABILITY // CORE INFRASTRUCTURE</span>
        <h3>Integrated Full-Funnel Capabilities</h3>
        <ul className="group-bullets-preview">
          {traditionalBullets.map((bullet) => (
            <li key={bullet}>
              <span className="bullet-glow-dot" />
              <span>{bullet}</span>
            </li>
          ))}
        </ul>
        <div className="framework-bottom-cta">
          <Link to="/work" className="framework-link-btn">
            Explore All Capabilities &amp; Work &rarr;
          </Link>
        </div>
      </div>

      <div className="group-detailed-subcards-stack">
        <div className="detailed-subcard">
          <div className="subcard-glow-line" aria-hidden="true" />
          <h4>Brand Architecture &amp; Identity</h4>
          <p>
            Your brand is not a mere logo or company name. It is an emotional gravity well. At OMS, we architect distinct positioning strategies that ensure your brand cuts through noise and commands instant market authority.
          </p>
        </div>

        <div className="detailed-subcard">
          <div className="subcard-glow-line" aria-hidden="true" />
          <h4>Indoor &amp; Outdoor Advertising (OOH)</h4>
          <p>
            Mega billboards, digital screens, and high-frequency transit placements reaching millions across Cairo, Alexandria, and prime regional highways. Synchronized with digital retargeting pixels for closed-loop conversions.
          </p>
        </div>

        <div className="detailed-subcard">
          <div className="subcard-glow-line" aria-hidden="true" />
          <h4>PR &amp; Experiential Brand Activations</h4>
          <p>
            Red-carpet PR events, trade show pavilions, and ground activations designed to create viral social buzz and foster high-trust commercial relationships.
          </p>
        </div>

        <div className="detailed-subcard">
          <div className="subcard-glow-line" aria-hidden="true" />
          <h4>Media Buying "TV &amp; Radio Broadcasting"</h4>
          <p>
            Direct algorithmic and prime-time negotiations with Egypt and MENA’s premier TV networks. Delivering maximum gross rating points at optimized media investment costs.
          </p>
        </div>
      </div>
    </article>
  );
}
