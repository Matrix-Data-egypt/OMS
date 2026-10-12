import React from 'react';
import './AboutSection.css';
import PageHero from '../PageHero/PageHero';

// 1. Static Data defined outside the component to optimize memory and prevent re-creation on re-renders
const CHOOSE_REASONS = [
  { id: "reason-1", title: "Dedicated Teams", desc: "Specialized squads focused entirely on your brand's growth and delivery vertical." },
  { id: "reason-2", title: "True Partners", desc: "We embed directly into your pipeline, aligning our success metrics with your commercial goals." },
  { id: "reason-3", title: "Global Know-How", desc: "Leveraging international marketing disciplines localized for supreme regional impact." },
  { id: "reason-4", title: "Focus on Innovation", desc: "Constantly pushing creative boundaries and tech integrations to outperform competition." },
  { id: "reason-5", title: "Respect of Client Needs", desc: "Deeply honoring and aligning with our clients' custom culture, identity, and strict objectives." }
];

const WHAT_WE_DO_LIST = [
  "Production & TV, Radio Broadcasting",
  "Outdoor Advertising",
  "Branding & Events Management",
  "Digital Marketing",
  "BTL (Below the Line) Activations"
];

const CORE_VALUES = [
  { id: "value-1", title: "Innovation", desc: "Foster creativity, think outside of established or perceived boundaries, and engage in informed risk-taking to set us apart from the competition." },
  { id: "value-2", title: "Motivation", desc: "Motivate people to work hard to attract, engage, develop, and retain by providing a great place to work that provides opportunities for continuous learning." },
  { id: "value-3", title: "Satisfaction", desc: "Satisfying your customers by understanding their business, agreeing on KPIs, sharing prospects' mindset, and building a plan to make their presence the best it can be." }
];

export default function AboutSection() {
  return (
    <main className="about-page-container">
      {/* Decorative ambient background blur */}
      <div className="about-ambient-glow" aria-hidden="true" />

      {/* Hero Banner Section */}
      <header>
        <PageHero 
          badge="Corporate Profile & Manifesto" 
          title={<>We Are <span>OMS Advertising.</span></>} 
          subtitle="A high-intent, premium media and consultant agency engineering full-scale marketing infrastructures across Egypt and the MENA region." 
        />
      </header>

      {/* Mission & Vision Section */}
      <section className="about-statement-grid" aria-label="Company Statements">
        <div className="statement-card mission-box">
          <div className="statement-card-glow-bar red-bar" />
          <span className="statement-tag">Our Promise</span>
          <h2>Mission</h2>
          <p>
            Our Awareness and Our Commitment to your business is our every day's Focus to prove it and we will forever be here to Support with a Supreme Quality as well as an Affordable Cost. We are guiding our clients in maintaining the balance between expression of design and business solutions.
          </p>
        </div>

        <div className="statement-card vision-box">
          <div className="statement-card-glow-bar gold-bar" />
          <span className="statement-tag">Our Future</span>
          <h2>Vision</h2>
          <p>
            Our Vision is to deliver results-oriented marketing programs and brand activation campaigns that enhance our clients' awareness, leverage their sales, and support their growth. We're Passionate about what we do as well as our Seriousness about our successful future. Our ambitious experts never fear to take small risks and believe in the provision of highest quality services.
          </p>
        </div>
      </section>

      {/* Capabilities & Advantages Section */}
      <section className="about-capabilities-layout" aria-label="Capabilities and Advantages">
        {/* Why To Choose Column */}
        <div className="capabilities-column choose-column">
          <div className="column-title-wrapper">
            <span className="mini-gold-accent" aria-hidden="true">•</span>
            <h2>Why To Choose?</h2>
          </div>
          <div className="choose-cards-stack">
            {CHOOSE_REASONS.map(({ id, title, desc }, index) => (
              <div key={id} className="choose-interactive-row">
                <span className="choose-item-idx" aria-hidden="true">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <div className="choose-item-content">
                  <h4>{title}</h4>
                  <p>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* What We Do Column */}
        <div className="capabilities-column core-do-column">
          <div className="column-title-wrapper">
            <span className="mini-gold-accent" aria-hidden="true">•</span>
            <h2>What We Do?</h2>
          </div>
          <ul className="about-do-bullets-list">
            {WHAT_WE_DO_LIST.map((item) => (
              <li key={item} className="do-bullet-item">
                <span className="bullet-icon-arrow" aria-hidden="true">→</span>
                <span className="bullet-text-main">{item}</span>
              </li>
            ))}
          </ul>
          <div className="do-embedded-note-card">
            <p>Unified cross-channel execution driving tactical category dominance.</p>
          </div>
        </div>
      </section>

      {/* Core Values Section */}
      <section className="about-values-section" aria-label="Our Core Values">
        <div className="values-header-center">
          <span className="about-badge-gold">The Pillars of OMS</span>
          <h2>Our Core Values</h2>
        </div>
        <div className="values-display-grid">
          {CORE_VALUES.map(({ id, title, desc }, index) => {
            const formattedIndex = String(index + 1).padStart(2, '0');
            return (
              <div key={id} className="value-pillar-card">
                <div className="value-pillar-watermark" aria-hidden="true">{formattedIndex}</div>
                <div className="value-pillar-top-row">
                  <span className="value-serial-indicator" aria-hidden="true">{formattedIndex}</span>
                  <h3>{title}</h3>
                </div>
                <p>{desc}</p>
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}
