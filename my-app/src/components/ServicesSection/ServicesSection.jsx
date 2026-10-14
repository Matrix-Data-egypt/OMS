import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import './ServicesSection.css';
import PageHero from '../PageHero/PageHero';
import { useLanguage } from '../../context/LanguageContext';
import { PAGE_TRANSLATIONS } from '../../context/translationsData';

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
  const { language } = useLanguage();
  const tServices = PAGE_TRANSLATIONS[language]?.services || PAGE_TRANSLATIONS.en.services;

  const ICONS_TRAD = ['◈', '▣', '◉', '◐', '◑', '◇'];
  const ICONS_DIGITAL = ['⬡', '✦', '▲', '◆'];

  return (
    <div className="services-page-container">
      <div className="services-ambient-glow" aria-hidden="true" />
      <div className="services-grid-lines" aria-hidden="true" />

      {/* Hero */}
      <PageHero
        title={<>{tServices.heroTitle}</>}
        subtitle={tServices.heroSub}
      />

      {/* Traditional Marketing */}
      <section className="svc-section">
        <div className="svc-section__header">
          <div className="svc-section__label-row">
            <div className="svc-section__label">
              <span className="svc-label-num">01</span>
              <span className="svc-label-divider">/</span>
              <span className="svc-label-text">{tServices.tabTraditional}</span>
            </div>
            <div className="svc-label-bar" />
          </div>
          <p className="svc-section__sub">
            {language === 'ar'
              ? 'من البث التلفزيوني والإذاعي في أوقات الذروة وشاشات الطرق الأيقونية إلى الطباعة الفاخرة وتنشيط المبيعات الميدانية — نصل إلى جمهورك في كل لحظة حاسمة.'
              : language === 'fr'
              ? 'Des spots télévisés aux heures de grande écoute à l\'affichage urbain majeur, l\'impression de prestige et les activations terrain — nous touchons votre audience à chaque moment clé.'
              : 'From prime-time TV broadcasts and iconic outdoor billboards to premium printing and experiential activations — we command every physical touchpoint of your audience\'s daily journey.'}
          </p>
        </div>
        <div className="svc-grid">
          {tServices.traditional.map((s, i) => (
            <ServiceCard
              key={s.id}
              service={{ ...s, icon: ICONS_TRAD[i % ICONS_TRAD.length] }}
              index={i}
            />
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
              <span className="svc-label-text">{tServices.tabDigital}</span>
            </div>
            <div className="svc-label-bar" />
          </div>
          <p className="svc-section__sub">
            {language === 'ar'
              ? 'حملات رقمية مبنية على البيانات والإبداع والتحليل العميق لسلوك المستهلكين لتحقيق أعلى معدلات التحويل والمبيعات.'
              : language === 'fr'
              ? 'Des campagnes digitales ciblées avec précision qui convertissent — alimentées par la data, la créativité et une compréhension profonde de votre cible.'
              : 'Precision-targeted digital campaigns that convert — powered by data, creativity, and a deep understanding of your audience.'}
          </p>
        </div>
        <div className="svc-grid">
          {tServices.digital.map((s, i) => (
            <ServiceCard
              key={s.id}
              service={{ ...s, icon: ICONS_DIGITAL[i % ICONS_DIGITAL.length] }}
              index={i}
            />
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="svc-cta-section">
        <div className="svc-cta-box">
          <div className="svc-cta-glow" aria-hidden="true" />
          <span className="svc-cta-badge">OMS Solution Hub</span>
          <h2>{tServices.ctaTitle}</h2>
          <p>
            {language === 'ar'
              ? 'شاركنا تطلعات وأهداف مشروعك القادم، وسيقوم فريق خبرائنا بتصميم خطة إعلانية مخصصة تضمن لك التميز.'
              : language === 'fr'
              ? 'Parlez-nous de votre projet et nos équipes élaboreront une stratégie sur-mesure sur les canaux traditionnels et digitaux.'
              : 'Tell us about your project and our team will craft a tailored strategy across traditional and digital channels.'}
          </p>
          <Link to="/contact" className="svc-cta-btn">
            {tServices.ctaBtn} &rarr;
          </Link>
        </div>
      </section>
    </div>
  );
}
