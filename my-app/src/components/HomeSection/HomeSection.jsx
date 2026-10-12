import React, { useState } from 'react';
import { Link } from 'react-router-dom'; 
import './HomeSection.css';

// بيانات قسم الأهداف المحدثة بتنسيق أرقى
const OBJECTIVES_DATA = [
  { id: 1, tag: 'Strategy', title: 'Build Brand Brand', desc: 'Define your core market positioning and build robust equity.' },
  { id: 2, tag: 'Growth', title: 'Launch a Product', desc: 'Create maximum commercial impact for your new market offerings.' },
  { id: 3, tag: 'B2B Blitz', title: 'Lead Generation', desc: 'High-intent acquisition campaigns targeting enterprise buyers.' },
  { id: 4, tag: 'Production', title: 'Video Commercials', desc: 'Cinematic storytelling designed for TV broadcast and digital channels.' },
  { id: 5, tag: 'Performance', title: 'Full Digital Conversion', desc: 'Full-funnel digital optimizations to extract maximum ROI.' },
  { id: 6, tag: 'Activation', title: 'Experimental Events', desc: 'Immersive ground events and experimental press activations.' }
];

// نصوص تفاصيل الخطوات للجدول الزمني
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
    <div className="home-container">
      {/* إضاءات خلفية هادئة ومتحركة */}
      <div className="home-ambient-glow glow-1" aria-hidden="true" />
      <div className="home-ambient-glow glow-2" aria-hidden="true" />
      
      {/* 1. Main Hero Section */}
      <section className="home-hero-clean">
        <div className="hero-banner-bg" style={{ backgroundImage: `url(${process.env.PUBLIC_URL + "/hero-banner.png"})`, backgroundSize: "cover", backgroundRepeat: "no-repeat", backgroundPosition: "center" }}><div className="hero-clean-content overlay">
          <span className="hero-badge-top-clean">New Horizon Campaign Blueprint</span>
          <h1 className="hero-main-title-clean">
            Turning Business Challenges<br />Into Brands That <span className="highlight-gold-clean">Move People.</span>
          </h1>
          <p className="hero-paragraph-clean">
            We tie unified strategic thinking, creative fire, and rigorous performance optimizations across every channel to deliver absolute category dominance and concrete commercial revenue creation.
          </p>
          <div className="hero-buttons-clean">
            <Link to="/contact" className="btn-gold-action">
              Find Campaign ↓
            </Link>
            <Link to="/production-tv" className="btn-outline-action">
              Consult Media Desk
            </Link>
          </div>

            </div></div>
      </section>

      {/* 2. Strategy Timeline Section */}
      <section className="strategy-timeline">
        <div className="section-intro">
          <span className="tag-purple-small">Unified Integration</span>
          <h2>One Partner. The Whole Campaign.</h2>
        </div>
        
        <div className="timeline-steps-bar">
          {['Research', 'Brief Architect', 'Creative Production', 'Media Optimization', 'Data Insights'].map((step, idx) => (
            <div 
              key={idx} 
              className={`timeline-node ${activeStep === idx + 1 ? 'active' : ''}`} 
              onClick={() => setActiveStep(idx + 1)}
              role="button"
              tabIndex={0}
            >
              <span className="node-num">0{idx + 1}</span>
              <span className="node-text">{step}</span>
              <div className="node-active-bar" />
            </div>
          ))}
        </div>

        <div className="timeline-dynamic-content">
          <div className="timeline-content-badge">PHASE 0{activeStep} ARCHITECTURE</div>
          <h3>{TIMELINE_DETAILS[activeStep].title}</h3>
          <p>{TIMELINE_DETAILS[activeStep].desc}</p>
        </div>
      </section>

      {/* 3. Objectives Grid Section */}
      <section className="objectives-section">
        <div className="section-intro">
          <span className="tag-purple-small">Campaign Matcher</span>
          <h2>What are you trying to achieve?</h2>
        </div>
        <div className="objectives-grid">
          {OBJECTIVES_DATA.map((obj) => (
            <div key={obj.id} className="objective-card">
              <div className="obj-card-top">
                <span className="obj-tag">{obj.tag}</span>
                <span className="obj-arrow-cue">→</span>
              </div>
              <h3>{obj.title}</h3>
              <p>{obj.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 4. قسم الهياكل التسويقية والخدمات المطوّر */}
      <section className="home-services-section">
        <div className="section-intro">
          <span className="tag-purple-small">OMS Core Capabilities</span>
          <h2>Our Strategic Marketing Frameworks</h2>
        </div>

        <div className="home-services-layout-grid">
          
          {/* Traditional Marketing */}
          <div className="home-service-group-card">
            <div className="group-card-header">
              <span className="framework-num-pill">01 / CAPABILITY</span>
              <h3>Traditional Marketing</h3>
              <ul className="group-bullets-preview">
                <li>Media Buying &quot;TV &amp; Radio&quot;</li>
                <li>Production</li>
                <li>Indoor &amp; Outdoor Adv.</li>
                <li>PR &quot;Booths &amp; Events&quot;</li>
                <li>Designs &amp; Printing Services</li>
                <li>CI &amp; Branding</li>
                <li>Digital Marketing &amp; Social Media</li>
                <li>BTL</li>
              </ul>
            </div>

            <div className="group-detailed-subcards-stack">
              <div className="detailed-subcard">
                <div className="subcard-glow-line" />
                <h4>Branding</h4>
                <p>Your brand is not a product, a website, a logo or your company name. It&apos;s a hard-to-pin-down feeling. It&apos;s also the thing that separates a mediocre brand from a great one. At OMS, we will work with you to develop a comprehensive brand strategy that helps position your company, and ensure that it stands out and remains memorable in the mind of the consumer.</p>
              </div>

              <div className="detailed-subcard">
                <div className="subcard-glow-line" />
                <h4>Indoor &amp; Outdoor Advertising</h4>
                <p>The presence of indoor &amp; outdoor advertising continually reaches consumers where they live, work, shop and play to deliver your marketing/promotional message as they travel throughout their daily life. With repeated familiarity, exposure and retention, OMS will help you reach your targeted audience to make a choice at the point of decision.</p>
              </div>

              <div className="detailed-subcard">
                <div className="subcard-glow-line" />
                <h4>PR &quot;Booths &amp; Events&quot;</h4>
                <p>Our wealth of PR experience and know-how, combined with our addiction to perfection, means great things for your business. We love to build fruitful relationships with our clients, using our tried-and-true business processes, excellent communication, and red carpet treatment.</p>
              </div>

              <div className="detailed-subcard">
                <div className="subcard-glow-line" />
                <h4>Media Buying &quot;TV &amp; Radio&quot;</h4>
                <p>Media planning and buying is at the heart of everything we do. We have the wealth of experience needed to expertly guide our clients through the maze of media options and innovative technology solutions existing in the market.</p>
              </div>

              <div className="detailed-subcard">
                <div className="subcard-glow-line" />
                <h4>Designs &amp; Printing Services</h4>
                <p>Create a personality for your products with customized designs that reflect your brand identity and core values. Your printed marketing materials are the only remnants of your company that are left behind to your customers. Make sure that they pass the test.</p>
              </div>
            </div>
          </div>

          {/* Digital Marketing */}
          <div className="home-service-group-card">
            <div className="group-card-header">
              <span className="framework-num-pill">02 / CAPABILITY</span>
              <h3>Digital Marketing</h3>
              <ul className="group-bullets-preview">
                <li>Website Design &amp; Development</li>
                <li>Social Media &amp; Management</li>
                <li>Digital Media &amp; Buying</li>
                <li>Creative Concept</li>
                <li>SMS / LBA Campaigns</li>
              </ul>
            </div>

            <div className="group-detailed-subcards-stack">
              <div className="detailed-subcard">
                <div className="subcard-glow-line" />
                <h4>Web Design &amp; Development</h4>
                <p>Website design is more than just beautiful images, it tells your audience a story, conveys your brand personality, engages and informs the user while at the same time inspiring them to take action. With OMS, custom website designs with strategic insights are created to generate greater brand engagement, higher conversions and measurable results.</p>
              </div>

              <div className="detailed-subcard">
                <div className="subcard-glow-line" />
                <h4>Social Media Management</h4>
                <p>Social media marketing is essential for a successful online marketing strategy. At OMS, we don&apos;t do planning only, we do Management as well! Social Media Management can help you better understand the tools available to you, the benefits of the different networks, and most importantly, help you plan and execute your social media strategy accordingly with 24H service.</p>
              </div>

              <div className="detailed-subcard">
                <div className="subcard-glow-line" />
                <h4>Digital Media Buying</h4>
                <p>Through an extensive network of partners and suppliers, OMS offers a wide array of digital advertising media to promote any campaign communicating effectively for your target audience such as Google Adwords, FB Ads, Youtube, High traffic Websites, Bloggers and influencers &amp; a lot more...</p>
              </div>

              <div className="detailed-subcard">
                <div className="subcard-glow-line" />
                <h4>Creative Concept</h4>
                <p>We believe that the idea is the center of an organization&apos;s universe, and it should be thoughtfully developed, nurtured, tracked and amplified to positively differentiate and position it in the market. At OMS, we work with organizations both new and renowned to discover special qualities, shape experiences, and evoke the brand&apos;s essence at every touch point.</p>
              </div>

              <div className="detailed-subcard">
                <div className="subcard-glow-line" />
                <h4>SMS / LBA Campaigns</h4>
                <p>We deliver the solutions that prepare our clients to meet the demands and seize the opportunities that mobile presents. At OMS, we take advantage of Geographic location (Location Based Advertisement) and user history to deliver an engaging personalized SMS campaigns and much more.</p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 5. الفوتر والاتصال السريع */}
      <section className="home-cta-pitch-block">
        <div className="home-cta-inner">
          <h3>Ready to move your market?</h3>
          <p>Let&apos;s discuss your next campaign. Embed our strategic squads directly into your pipeline. Zero translation loss, pure output acceleration.</p>
          <div className="cta-actions-row">
            <Link to="/contact" className="initiate-brief-btn">
              Initiate Brief Architect →
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
