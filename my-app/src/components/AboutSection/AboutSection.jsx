import React from 'react';
import './AboutSection.css';
import PageHero from '../PageHero/PageHero';

export default function AboutSection() {
  const chooseReasons = [
    { title: "Dedicated Teams", desc: "Specialized squads focused entirely on your brand's growth and delivery vertical." },
    { title: "True Partners", desc: "We embed directly into your pipeline, aligning our success metrics with your commercial goals." },
    { title: "Global Know-How", desc: "Leveraging international marketing disciplines localized for supreme regional impact." },
    { title: "Focus on Innovation", desc: "Constantly pushing creative boundaries and tech integrations to outperform competition." },
    { title: "Respect of Client Needs", desc: "Deeply honoring and aligning with our clients' custom culture, identity, and strict objectives." }
  ];

  const whatWeDoList = [
    "Production & TV, Radio Broadcasting",
    "Outdoor Advertising",
    "Branding & Events Management",
    "Digital Marketing",
    "BTL (Below the Line) Activations"
  ];

  const coreValues = [
    {
      title: "Innovation",
      desc: "Foster creativity, think outside of established or perceived boundaries, and engage in informed risk-taking to set us apart from the competition."
    },
    {
      title: "Motivation",
      desc: "Motivate people to work hard to attract, engage, develop, and retain by providing a great place to work that provides opportunities for continuous learning."
    },
    {
      title: "Satisfaction",
      desc: "Satisfying your customers by understanding their business, agreeing on KPIs, sharing prospects' mindset, and building a plan to make their presence the best it can be."
    }
  ];

  return (
    <div className="about-page-container">
      {/* الخلفية المضيئة الدقيقة للأنيميشن */}
      <div className="about-ambient-glow" aria-hidden="true" />
      
      {/* Banner Hero */}
      <PageHero
        badge="Corporate Profile & Manifesto"
        title={<>We Are <span>OMS Advertising.</span></>}
        subtitle="A high-intent, premium media and consultant agency engineering full-scale marketing infrastructures across Egypt and the MENA region."
      />

      {/* قسم الرؤية والرسالة المتوازن */}
      <section className="about-statement-grid">
        <div className="statement-card mission-box">
          <div className="statement-card-glow-bar red-bar" />
          <span className="statement-tag">Our Promise</span>
          <h2>Mission</h2>
          <p>
            Our Awareness and Our Commitment to your business is our every day&apos;s Focus to prove it and we will forever be here to Support with a Supreme Quality as well as an Affordable Cost. We are guiding our clients in maintaining the balance between expression of design and business solutions.
          </p>
        </div>

        <div className="statement-card vision-box">
          <div className="statement-card-glow-bar gold-bar" />
          <span className="statement-tag">Our Future</span>
          <h2>Vision</h2>
          <p>
            Our Vision is to deliver results-oriented marketing programs and brand activation campaigns that enhance our clients&apos; awareness, leverage their sales, and support their growth. We&apos;re Passionate about what we do as well as our Seriousness about our successful future. Our ambitious experts never fear to take small risks and believe in the provision of highest quality services.
          </p>
        </div>
      </section>

      {/* قسم Why to Choose Us & What We Do المزدوج */}
      <section className="about-capabilities-layout">
        
        {/* حقل Why To Choose */}
        <div className="capabilities-column choose-column">
          <div className="column-title-wrapper">
            <span className="mini-gold-accent">•</span>
            <h2>Why To Choose?</h2>
          </div>
          <div className="choose-cards-stack">
            {chooseReasons.map((reason, index) => (
              <div key={index} className="choose-interactive-row">
                <span className="choose-item-idx">0{index + 1}</span>
                <div className="choose-item-content">
                  <h4>{reason.title}</h4>
                  <p>{reason.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* حقل What We Do */}
        <div className="capabilities-column core-do-column">
          <div className="column-title-wrapper">
            <span className="mini-gold-accent">•</span>
            <h2>What We Do?</h2>
          </div>
          <ul className="about-do-bullets-list">
            {whatWeDoList.map((item, index) => (
              <li key={index} className="do-bullet-item">
                <span className="bullet-icon-arrow">→</span>
                <span className="bullet-text-main">{item}</span>
              </li>
            ))}
          </ul>
          <div className="do-embedded-note-card">
            <p>Unified cross-channel execution driving tactical category dominance.</p>
          </div>
        </div>

      </section>

      {/* قسم القيم الجوهرية (Core Values) الشبكي الممتاز */}
      <section className="about-values-section">
        <div className="values-header-center">
          <span className="about-badge-gold">The Pillars of OMS</span>
          <h2>Our Core Values</h2>
        </div>
        
        <div className="values-display-grid">
          {coreValues.map((val, index) => (
            <div key={index} className="value-pillar-card">
              <div className="value-pillar-watermark">0{index + 1}</div>
              <div className="value-pillar-top-row">
                <span className="value-serial-indicator">0{index + 1}</span>
                <h3>{val.title}</h3>
              </div>
              <p>{val.desc}</p>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
