import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import './ServicesSection.css';
import PageHero from '../PageHero/PageHero';

const TRADITIONAL_SERVICES = [
  {
    id: 'branding',
    icon: '◈',
    title: 'Branding & CI',
    desc: 'Your brand is not a product, a website, a logo or your company name. It\'s a hard-to-pin-down feeling. At OMS, we develop a comprehensive brand strategy that positions your company and ensures it stands out in the mind of the consumer.',
    tags: ['Brand Strategy', 'Visual Identity', 'Corporate Image']
  },
  {
    id: 'outdoor',
    icon: '▣',
    title: 'Indoor & Outdoor Advertising',
    desc: 'The presence of indoor & outdoor advertising continually reaches consumers where they live, work, shop and play. With repeated exposure and retention, OMS helps you reach your targeted audience at the point of decision.',
    tags: ['Billboards', 'Mega Unipoles', 'Transit Media']
  },
  {
    id: 'pr',
    icon: '◉',
    title: 'PR & Events',
    desc: 'Our wealth of PR experience combined with our attention to perfection means great things for your business. We build fruitful relationships using tried-and-true business processes, excellent communication, and red carpet treatment.',
    tags: ['Booths', 'Exhibitions', 'Brand Activations']
  },
  {
    id: 'media-buying',
    icon: '◐',
    title: 'Media Buying — TV & Radio',
    desc: 'Media planning and buying is at the heart of everything we do. We have the experience to expertly guide our clients through the maze of media options and innovative technology solutions existing in the market.',
    tags: ['TV Networks', 'Radio Broadcast', 'Prime Slots']
  },
  {
    id: 'production',
    icon: '◑',
    title: 'Production & Printing',
    desc: 'Create a personality for your products with customized designs that reflect your brand identity and core values. Your printed marketing materials are the remnants of your company left behind to customers — make sure they pass the test.',
    tags: ['TVC Production', 'Premium Print', 'Design Services']
  },
  {
    id: 'btl',
    icon: '◇',
    title: 'BTL Activations',
    desc: 'Below-the-line activations that create direct, personal connections between your brand and your audience — from point-of-sale displays to immersive experiential campaigns that leave lasting impressions.',
    tags: ['POSS', 'Experiential', 'Ground Activation']
  }
];

const DIGITAL_SERVICES = [
  {
    id: 'web',
    icon: '⬡',
    title: 'Web Design & Development',
    desc: 'Website design tells your audience a story, conveys your brand personality, engages and informs users while inspiring them to take action. We create custom designs with strategic insights that generate brand engagement and measurable results.',
    tags: ['UI/UX Design', 'Development', 'Conversion Focused']
  },
  {
    id: 'social',
    icon: '⬢',
    title: 'Social Media Management',
    desc: 'Social media marketing is essential for a successful online strategy. At OMS, we don\'t just plan — we manage. We help you understand tools, benefits of different networks, and execute your social media strategy with 24H service.',
    tags: ['Content Creation', 'Community Management', '24/7 Service']
  },
  {
    id: 'digital-buying',
    icon: '◈',
    title: 'Digital Media Buying',
    desc: 'Through an extensive network of partners, OMS offers a wide array of digital advertising media: Google Ads, Meta, YouTube, TikTok, high-traffic websites, bloggers and influencers — all to communicate effectively with your target audience.',
    tags: ['Google Ads', 'Meta Ads', 'Programmatic']
  },
  {
    id: 'creative',
    icon: '◉',
    title: 'Creative Concept',
    desc: 'The idea is the center of every great campaign. We work with organizations to discover special qualities, shape experiences, and evoke the brand\'s essence at every touchpoint — from new brands to established enterprises.',
    tags: ['Creative Strategy', 'Concept Development', 'Copywriting']
  },
  {
    id: 'sms',
    icon: '◐',
    title: 'SMS & LBA Campaigns',
    desc: 'We deliver solutions that prepare our clients to meet the demands of mobile marketing. We leverage geographic location data (Location Based Advertisement) to deliver engaging, personalized SMS campaigns that drive action.',
    tags: ['SMS Marketing', 'Location-Based', 'Personalized']
  }
];

function ServiceCard({ service, index }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <article
      ref={ref}
      className={`svc-card ${visible ? 'svc-card--visible' : ''}`}
      style={{ transitionDelay: `${index * 70}ms` }}
    >
      <div className="svc-card__top-bar" />
      <div className="svc-card__icon">{service.icon}</div>
      <h3 className="svc-card__title">{service.title}</h3>
      <p className="svc-card__desc">{service.desc}</p>
      <div className="svc-card__tags">
        {service.tags.map(tag => (
          <span key={tag} className="svc-tag">{tag}</span>
        ))}
      </div>
    </article>
  );
}

export default function ServicesSection() {
  return (
    <div className="services-page-container">
      <div className="services-ambient-glow" aria-hidden="true" />
      <div className="services-grid-lines" aria-hidden="true" />

      {/* Hero */}
      <PageHero
        title={<>Our Strategic <span>Services.</span></>}
        subtitle="Explore our fully-integrated marketing frameworks — from traditional broadcast media and outdoor advertising to cutting-edge digital performance."
      />

      {/* Traditional Marketing */}
      <section className="svc-section">
        <div className="svc-section__header">
          <div className="svc-section__label-row">
            <div className="svc-section__label">
              <span className="svc-label-num">01</span>
              <span className="svc-label-divider">/</span>
              <span className="svc-label-text">Traditional Marketing</span>
            </div>
            <div className="svc-label-bar" />
          </div>
          <p className="svc-section__sub">
            From prime-time TV broadcasts and iconic outdoor billboards to premium printing and experiential activations — we command every physical touchpoint of your audience's daily journey.
          </p>
        </div>
        <div className="svc-grid">
          {TRADITIONAL_SERVICES.map((s, i) => (
            <ServiceCard key={s.id} service={s} index={i} />
          ))}
        </div>
      </section>

      {/* Digital Marketing */}
      <section className="svc-section svc-section--digital">
        <div className="svc-section__header">
          <div className="svc-section__label-row">
            <div className="svc-section__label">
              <span className="svc-label-num">02</span>
              <span className="svc-label-divider">/</span>
              <span className="svc-label-text">Digital Marketing</span>
            </div>
            <div className="svc-label-bar" />
          </div>
          <p className="svc-section__sub">
            Precision-targeted digital campaigns that convert — powered by data, creativity, and a deep understanding of your audience.
          </p>
        </div>
        <div className="svc-grid">
          {DIGITAL_SERVICES.map((s, i) => (
            <ServiceCard key={s.id} service={s} index={i} />
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="svc-cta-section">
        <div className="svc-cta-box">
          <div className="svc-cta-glow" aria-hidden="true" />
          <span className="svc-cta-badge">Partner With OMS</span>
          <h2>Ready to build something remarkable?</h2>
          <p>Tell us about your project and our team will craft a tailored strategy across traditional and digital channels.</p>
          <Link to="/contact" className="svc-cta-btn">
            Start Your Project Brief →
          </Link>
        </div>
      </section>
    </div>
  );
}
