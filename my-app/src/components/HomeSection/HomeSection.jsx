import React, { useState } from 'react';
import { Link } from 'react-router-dom'; 
import './HomeSection.css';

// 1. Static Configuration Data defined outside the component to optimize runtime memory
const OBJECTIVES_DATA = [
  { id: "obj-1", tag: 'Strategy', title: 'Build Brand Equity', desc: 'Define your core market positioning and build robust equity.' },
  { id: "obj-2", tag: 'Growth', title: 'Launch a Product', desc: 'Create maximum commercial impact for your new market offerings.' },
  { id: "obj-3", tag: 'B2B Blitz', title: 'Lead Generation', desc: 'High-intent acquisition campaigns targeting enterprise buyers.' },
  { id: "obj-4", tag: 'Production', title: 'Video Commercials', desc: 'Cinematic storytelling designed for TV broadcast and digital channels.' },
  { id: "obj-5", tag: 'Performance', title: 'Full Digital Conversion', desc: 'Full-funnel digital optimizations to extract maximum ROI.' },
  { id: "obj-6", tag: 'Activation', title: 'Experimental Events', desc: 'Immersive ground events and experimental press activations.' }
];

const TIMELINE_STEPS = ['Research', 'Brief Architect', 'Creative Production', 'Media Optimization', 'Data Insights'];

const TIMELINE_DETAILS = {
  1: { title: 'Deep Market Research', desc: 'Analyzing audience behavior, mapping out competitors, and isolating key media intake opportunities.' },
  2: { title: 'Brief Architecture', desc: 'Crafting definitive parameters, identifying strict KPIs, and solidifying the tactical route map.' },
  3: { title: 'Creative Production', desc: 'Forging high-fire premium visuals, copies, and interactive concepts engineered around your identity.' },
  4: { title: 'Media Optimization', desc: 'Deploying laser-targeted distribution models across digital, TV, and outdoor setups to minimize loss.' },
  5: { title: 'Data Insights', desc: 'Auditing data signals post-launch, parsing conversion values, and locking down consistent scale.' }
};

export default function HomeSection() {
  const [activeStep, setActiveStep] = useState(1);

  return (
    <main className="home-container">
      {/* Decorative ambient background blurs */}
      <div className="home-ambient-glow glow-1" aria-hidden="true" />
      <div className="home-ambient-glow glow-2" aria-hidden="true" />
      
      {/* Hero Banner Section */}
      <header className="home-hero-clean">
        <div 
          className="hero-banner-bg" 
          style={{ backgroundImage: `url(${process.env.PUBLIC_URL}/hero-banner.png)` }}
        >
          <div className="hero-clean-content overlay">
            <span className="hero-badge-top-clean">New Horizon Campaign Blueprint</span>
            <h1 className="hero-main-title-clean">
              Turning Business Challenges<br />
              Into Brands That <span className="highlight-gold-clean">Move People.</span>
            </h1>
            <p className="hero-paragraph-clean">
              We tie unified strategic thinking, creative fire, and rigorous performance optimizations across every channel to deliver absolute category dominance and concrete commercial revenue creation.
            </p>
            <div className="hero-buttons-clean">
              <Link to="/contact" className="btn-gold-action">
                Find Campaign &darr;
              </Link>
              <Link to="/production-tv" className="btn-outline-action">
                Consult Media Desk
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Strategy Timeline Section */}
      <section className="strategy-timeline" aria-label="Campaign Strategic Lifecycle">
        <div className="section-intro">
          <span className="tag-purple-small">Unified Integration</span>
          <h2>One Partner. The Whole Campaign.</h2>
        </div>
        
        <div className="timeline-steps-bar" role="tablist" aria-label="Strategy phases">
          {TIMELINE_STEPS.map((step, idx) => {
            const stepNum = idx + 1;
            const isActive = activeStep === stepNum;
            return (
              <button 
                key={step} 
                className={`timeline-node ${isActive ? 'active' : ''}`} 
                onClick={() => setActiveStep(stepNum)}
                role="tab"
                aria-selected={isActive}
                aria-controls="timeline-panel"
                id={`timeline-tab-${stepNum}`}
              >
                <span className="node-num" aria-hidden="true">
                  {String(stepNum).padStart(2, '0')}
                </span>
                <span className="node-text">{step}</span>
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
            PHASE 0{activeStep} ARCHITECTURE
          </span>
          <h3>{TIMELINE_DETAILS[activeStep].title}</h3>
          <p>{TIMELINE_DETAILS[activeStep].desc}</p>
        </div>
      </section>

      {/* Objectives Matcher Section */}
      <section className="objectives-section" aria-label="Campaign Goals Selector">
        <div className="section-intro">
          <span className="tag-purple-small">Campaign Matcher</span>
          <h2>What are you trying to achieve?</h2>
        </div>
        <div className="objectives-grid">
          {OBJECTIVES_DATA.map((obj) => (
            <ObjectiveCard key={obj.id} obj={obj} />
          ))}
        </div>
      </section>

      {/* Marketing Frameworks & Capabilities Section */}
      <section className="home-services-section" aria-label="Corporate Capabilities">
        <div className="section-intro">
          <span className="tag-purple-small">OMS Core Capabilities</span>
          <h2>Our Strategic Marketing Frameworks</h2>
        </div>

        <div className="home-services-layout-grid">
          <FrameworkGroup />
        </div>
      </section>
    </main>
  );
}

function ObjectiveCard({ obj }) {
  const { tag, title, desc } = obj;
  return (
    <article className="objective-card">
      <div className="obj-card-top">
        <span className="obj-tag">{tag}</span>
        <span className="obj-arrow-cue" aria-hidden="true">&rarr;</span>
      </div>
      <h3>{title}</h3>
      <p>{desc}</p>
    </article>
  );
}

function FrameworkGroup() {
  const traditionalBullets = [
    'Media Buying "TV & Radio"', 'Production', 'Indoor & Outdoor Adv.',
    'PR "Booths & Events"', 'Designs & Printing Services',
    'CI & Branding', 'Digital Marketing & Social Media', 'BTL'
  ];

  return (
    <article className="home-service-group-card">
      <div className="group-card-header">
        <span className="framework-num-pill">01 / CAPABILITY</span>
        <h3>Traditional Marketing</h3>
        <ul className="group-bullets-preview">
          {traditionalBullets.map((bullet) => (
            <li key={bullet}>{bullet}</li>
          ))}
        </ul>
      </div>

      <div className="group-detailed-subcards-stack">
        <div className="detailed-subcard">
          <div className="subcard-glow-line" aria-hidden="true" />
          <h4>Branding</h4>
          <p>
            Your brand is not a product, a website, a logo or your company name. It's a hard-to-pin-down feeling. 
            It's also the thing that separates a mediocre brand from a great one. At OMS, we will work with you to 
            develop a comprehensive brand strategy that helps position your company, and ensure that it stands out 
            and remains memorable in the mind of the consumer.
          </p>
        </div>

        <div className="detailed-subcard">
          <div className="subcard-glow-line" aria-hidden="true" />
          <h4>Indoor &amp; Outdoor Advertising</h4>
          <p>
            The presence of indoor &amp; outdoor advertising continually reaches consumers where they live, work, 
            shop and play to deliver your marketing message as they travel throughout their daily life. With repeated 
            familiarity, exposure and retention, OMS will help you reach your targeted audience to make a choice at 
            the point of decision.
          </p>
        </div>

        <div className="detailed-subcard">
          <div className="subcard-glow-line" aria-hidden="true" />
          <h4>PR "Booths &amp; Events"</h4>
          <p>
            Our wealth of PR experience and know-how, combined with our addiction to perfection, means great things 
            for your business. We love to build fruitful relationships with our clients, using our tried-and-true 
            business processes, excellent communication, and red carpet treatment.
          </p>
        </div>

        <div className="detailed-subcard">
          <div className="subcard-glow-line" aria-hidden="true" />
          <h4>Media Buying "TV &amp; Radio"</h4>
          <p>
            Media planning and buying are foundational channels for high-reach awareness execution. Our agency models 
            negotiate directly with elite broadcasting channels across Egypt and the MENA networks, securing strategic, 
            prime-time advertising placements that yield maximum impression delivery at fully optimized media costs.
          </p>
        </div>
      </div>
    </article>
  );
}
