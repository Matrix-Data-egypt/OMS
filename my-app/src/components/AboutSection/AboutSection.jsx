import React from 'react';
import { Link } from 'react-router-dom';
import './AboutSection.css';
import PageHero from '../PageHero/PageHero';

// 1. Static Data defined outside the component to optimize memory and prevent re-creation on re-renders
const CHOOSE_REASONS = [
  { 
    id: "reason-1", 
    title: "Dedicated Teams", 
    desc: "Specialized squads focused entirely on your brand's growth and delivery vertical.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
        <circle cx="9" cy="7" r="4"></circle>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
      </svg>
    )
  },
  { 
    id: "reason-2", 
    title: "True Partners", 
    desc: "We embed directly into your pipeline, aligning our success metrics with your commercial goals.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.42 4.58a5.4 5.4 0 0 0-7.65 0l-.77.78-.77-.78a5.4 5.4 0 0 0-7.65 7.65l.77.78L12 20.66l7.65-7.65.77-.78a5.4 5.4 0 0 0 0-7.65z"></path>
      </svg>
    )
  },
  { 
    id: "reason-3", 
    title: "Global Know-How", 
    desc: "Leveraging international marketing disciplines localized for supreme regional impact.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="2" y1="12" x2="22" y2="12"></line>
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
      </svg>
    )
  },
  { 
    id: "reason-4", 
    title: "Focus on Innovation", 
    desc: "Constantly pushing creative boundaries and tech integrations to outperform competition.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
      </svg>
    )
  },
  { 
    id: "reason-5", 
    title: "Respect of Client Needs", 
    desc: "Deeply honoring and aligning with our clients' custom culture, identity, and strict objectives.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
      </svg>
    )
  }
];

const WHAT_WE_DO_LIST = [
  { name: "Production & TV, Radio Broadcasting", badge: "Commercials & Audio" },
  { name: "Outdoor Advertising", badge: "Prime Billboards & Megas" },
  { name: "Branding & Events Management", badge: "Corporate Activation" },
  { name: "Digital Marketing", badge: "Performance & Growth" },
  { name: "BTL (Below the Line) Activations", badge: "Experiential Impact" }
];

const CORE_VALUES = [
  { 
    id: "value-1", 
    title: "Innovation", 
    desc: "Foster creativity, think outside of established or perceived boundaries, and engage in informed risk-taking to set us apart from the competition.",
    tag: "Creative Edge",
    accent: "crimson"
  },
  { 
    id: "value-2", 
    title: "Motivation", 
    desc: "Motivate people to work hard to attract, engage, develop, and retain by providing a great place to work that provides opportunities for continuous learning.",
    tag: "Human Capital",
    accent: "gold"
  },
  { 
    id: "value-3", 
    title: "Satisfaction", 
    desc: "Satisfying your customers by understanding their business, agreeing on KPIs, sharing prospects' mindset, and building a plan to make their presence the best it can be.",
    tag: "Client Success",
    accent: "gradient"
  }
];


export default function AboutSection() {
  return (
    <main className="about-page-container">
      {/* Decorative ambient background blur & grid overlays */}
      <div className="about-ambient-glow" aria-hidden="true" />
      <div className="about-mesh-grid" aria-hidden="true" />

      {/* Hero Banner Section */}
      <header>
        <PageHero 
          title={<>We Are <span>OMS Advertising.</span></>} 
          subtitle="A high-intent, premium media and consultant agency engineering full-scale marketing infrastructures across Egypt and the MENA region." 
        />
      </header>

      {/* Mission & Vision Section */}
      <section className="about-statement-grid" aria-label="Company Statements">
        <div className="statement-card mission-box">
          <div className="statement-card-glow-bar red-bar" />
          <div className="statement-card-header">
            <span className="statement-tag">Our Promise</span>
            <span className="statement-badge-mini">Strategic Commitment</span>
          </div>
          <h2>Mission</h2>
          <p>
            Our Awareness and Our Commitment to your business is our every day's Focus to prove it and we will forever be here to Support with a Supreme Quality as well as an Affordable Cost. We are guiding our clients in maintaining the balance between expression of design and business solutions.
          </p>
          <div className="statement-card-footer">
            <span className="footer-accent-line" />
            <span className="footer-label">Quality • Affordability • Balance</span>
          </div>
        </div>

        <div className="statement-card vision-box">
          <div className="statement-card-glow-bar gold-bar" />
          <div className="statement-card-header">
            <span className="statement-tag">Our Future</span>
            <span className="statement-badge-mini">Global Horizons</span>
          </div>
          <h2>Vision</h2>
          <p>
            Our Vision is to deliver results-oriented marketing programs and brand activation campaigns that enhance our clients' awareness, leverage their sales, and support their growth. We're Passionate about what we do as well as our Seriousness about our successful future. Our ambitious experts never fear to take small risks and believe in the provision of highest quality services.
          </p>
          <div className="statement-card-footer">
            <span className="footer-accent-line gold" />
            <span className="footer-label">Results • Growth • Innovation</span>
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
              <h2>Why To Choose?</h2>
            </div>
            <span className="column-counter-pill">5 Core Pillars</span>
          </div>
          <div className="choose-cards-stack">
            {CHOOSE_REASONS.map(({ id, title, desc, icon }, index) => (
              <div key={id} className="choose-interactive-row">
                <div className="choose-icon-box" aria-hidden="true">
                  {icon}
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
              <h2>What We Do?</h2>
            </div>
            <span className="column-counter-pill">Full-Service Suite</span>
          </div>
          <ul className="about-do-bullets-list">
            {WHAT_WE_DO_LIST.map((item, idx) => (
              <li key={item.name} className="do-bullet-item">
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
            <p>Unified cross-channel execution driving tactical category dominance.</p>
          </div>
        </div>
      </section>

      {/* Core Values Section */}
      <section className="about-values-section" aria-label="Our Core Values">
        <div className="values-header-center">
          <span className="about-badge-gold">The Pillars of OMS</span>
          <h2>Our Core Values</h2>
          <p className="values-subtitle">Guiding principles fueling our creative culture and client partnerships.</p>
        </div>
        <div className="values-display-grid">
          {CORE_VALUES.map(({ id, title, desc, tag, accent }, index) => {
            const formattedIndex = String(index + 1).padStart(2, '0');
            return (
              <div key={id} className={`value-pillar-card accent-${accent}`}>
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
            <span className="cta-accent-badge">Partner With OMS</span>
            <h2>Let's build your next market triumph.</h2>
            <p>From nationwide TV commercials and prime outdoor billboard networks to experiential BTL activations.</p>
          </div>
          <div className="about-cta-right">
            <Link to="/contact" className="about-action-button">
              <span>Start Project Brief</span>
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
