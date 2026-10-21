import React from 'react';
import { Link } from 'react-router-dom';
import './ServicesSection.css';
import PageHero from '../PageHero/PageHero';
import { useLanguage } from '../../context/LanguageContext';
import { PAGE_TRANSLATIONS } from '../../context/translationsData';

// High-resolution realistic agency images
const SERVICE_IMAGES = {
  branding: 'https://images.unsplash.com/photo-1600132806370-bf17e65e942f?auto=format&fit=crop&w=800&q=80',
  outdoor: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80',
  pr: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=800&q=80',
  'media-buying': 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=800&q=80',
  production: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?auto=format&fit=crop&w=800&q=80',
  btl: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80',
  web: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=800&q=80',
  social: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&w=800&q=80',
  seo: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80',
  campaigns: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=800&q=80',
};

const SERVICE_CATEGORY_TAGS = {
  branding: { ar: 'الهوية البصرية', en: 'BRAND STRATEGY', fr: 'IDENTITÉ' },
  outdoor: { ar: 'شاشات وطرق', en: 'MEGA BILLBOARDS', fr: 'AFFICHAGE OOH' },
  pr: { ar: 'العلاقات العامة', en: 'PR & EVENTS', fr: 'RELATIONS PUBLIQUES' },
  'media-buying': { ar: 'بث تلفزيوني وإذاعي', en: 'TV & BROADCAST', fr: 'DIFFUSION TV' },
  production: { ar: 'إنتاج وطباعة فاخرة', en: 'PRINT CRAFT', fr: 'PRODUCTION & PRINT' },
  btl: { ar: 'منصات ونقاط بيع', en: 'RETAIL & POSS', fr: 'PLV & RETAIL' },
  web: { ar: 'تطوير وتجربة مستخدم', en: 'UI/UX & WEB', fr: 'WEB & DIGITAL' },
  social: { ar: 'محتوى وسوشيال ميديا', en: 'VIRAL CONTENT', fr: 'RÉSEAUX SOCIAUX' },
  seo: { ar: 'تصدر محركات البحث', en: 'SEO & GROWTH', fr: 'RÉFÉRENCEMENT' },
  campaigns: { ar: 'حملات إعلانية ممولة', en: 'PAID PERFORMANCE', fr: 'ADS PERFORMANCE' },
};

const SERVICE_ROUTES = {
  outdoor: '/outdoor',
  production: '/production-tv',
  btl: '/poss',
  'media-buying': '/production-tv',
};

function ServiceCard({ service, language }) {
  const imageSrc = service.image || SERVICE_IMAGES[service.id];
  const categoryBadge = SERVICE_CATEGORY_TAGS[service.id]?.[language] || SERVICE_CATEGORY_TAGS[service.id]?.en || 'AGENCY SERVICE';
  const targetRoute = SERVICE_ROUTES[service.id] || '/contact';
  const isRtl = language === 'ar';

  return (
    <article className="svc-card">
      <div className="svc-card__top-bar" />

      {imageSrc && (
        <div className="svc-card__img-wrap">
          <img
            src={imageSrc}
            alt={service.title}
            className="svc-card__img"
            loading="lazy"
          />
          <div className="svc-card__img-overlay" />
          <span className="svc-card__category-badge">{categoryBadge}</span>
        </div>
      )}

      <div className="svc-card__body">
        <h3 className="svc-card__title">{service.title}</h3>
        <p className="svc-card__desc">{service.desc}</p>

        {service.tags && (
          <div className="svc-card__tags">
            {service.tags.map((tag) => (
              <span key={tag} className="svc-tag">{tag}</span>
            ))}
          </div>
        )}

        <div className="svc-card__action-row">
          <Link to={targetRoute} className="svc-card__action-btn">
            <span>{isRtl ? 'استكشف واطلب الخدمة' : 'Explore Capability'}</span>
            <span className="svc-card__action-arrow">{isRtl ? '←' : '→'}</span>
          </Link>
        </div>
      </div>
    </article>
  );
}

/* Infinite horizontal carousel — duplicates items for seamless loop */
function ServiceCarousel({ services, language, direction = 'left' }) {
  // Duplicate the list to make a seamless loop
  const doubled = [...services, ...services];

  return (
    <div className="svc-carousel-viewport">
      <div className={`svc-carousel-track svc-carousel-track--${direction}`}>
        {doubled.map((s, i) => (
          <div className="svc-carousel-item" key={`${s.id}-${i}`}>
            <ServiceCard service={s} language={language} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ServicesSection() {
  const { language } = useLanguage();
  const tServices = PAGE_TRANSLATIONS[language]?.services || PAGE_TRANSLATIONS.en.services;
  const isRtl = language === 'ar';

  return (
    <div className="services-page-container">
      <PageHero
        badge={isRtl ? 'قدرات وإمكانيات وكالة OMS الإعلانية' : 'OMS FULL-SERVICE AGENCY CAPABILITIES'}
        title={<>{tServices.heroTitle}</>}
        subtitle={tServices.heroSub}
      />

      {/* Section 01: Traditional Marketing & Mass Media */}
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
          <h2 className="svc-section__title">
            {isRtl ? 'إعلانات الطرق، الإنتاج والوسائط الجماهيرية' : 'MASS MEDIA, PRODUCTION & OOH NETWORKS'}
          </h2>
          <p className="svc-section__sub">
            {isRtl
              ? 'من البث التلفزيوني والإذاعي في أوقات الذروة وشاشات الطرق الأيقونية إلى الطباعة الفاخرة وتنشيط المبيعات الميدانية — نصل إلى جمهورك في كل لحظة حاسمة.'
              : language === 'fr'
              ? 'Des spots télévisés aux heures de grande écoute à l\'affichage urbain majeur, l\'impression de prestige et les activations terrain — nous touchons votre audience à chaque moment clé.'
              : 'From prime-time TV broadcasts and iconic outdoor billboards to premium printing and experiential activations — we command every physical touchpoint of your audience\'s daily journey.'}
          </p>
        </div>

        <ServiceCarousel services={tServices.traditional} language={language} direction="left" />
      </section>

      {/* Middle Agency Statement */}
      <section className="svc-manifesto-banner" aria-label="Agency Strategic Manifesto">
        <div className="svc-manifesto-inner">
          <span className="svc-manifesto-quote-mark">"</span>
          <p className="svc-manifesto-text">
            {isRtl
              ? 'في OMS، لا نصنع مجرد إعلانات عابرة؛ نحن نبني علامات تجارية تصنع فارقاً حقيقياً وتستحوذ على وعي الأسواق بأعلى معايير الإبداع والتنفيذ.'
              : language === 'fr'
              ? 'Chez OMS, nous ne créons pas de simples campagnes éphémères ; nous bâtissons des marques fortes qui dominent durablement leurs marchés.'
              : "At OMS, we don't just deploy campaigns; we engineer iconic brands that dominate consumer recall and lead market categories."}
          </p>
          <span className="svc-manifesto-author">OMS • ONE MEDIA SOLUTION</span>
        </div>
      </section>

      {/* Section 02: Digital Marketing & Performance Growth */}
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
          <h2 className="svc-section__title">
            {isRtl ? 'المنصات الرقمية والأداء والنمو المتسارع' : 'DIGITAL PLATFORMS, PERFORMANCE & GROWTH'}
          </h2>
          <p className="svc-section__sub">
            {isRtl
              ? 'حملات رقمية مبنية على البيانات والإبداع والتحليل العميق لسلوك المستهلكين لتحقيق أعلى معدلات التحويل والمبيعات.'
              : language === 'fr'
              ? 'Des campagnes digitales ciblées avec précision qui convertissent — alimentées par la data, la créativité et une compréhension profonde de votre cible.'
              : 'Precision-targeted digital campaigns that convert — powered by data, creativity, and a deep understanding of your audience.'}
          </p>
        </div>

        <ServiceCarousel services={tServices.digital} language={language} direction="right" />
      </section>

      {/* Major Agency Pitch / Brief CTA */}
      <section className="svc-cta-section" aria-label="Agency Campaign Pitch">
        <div className="svc-cta-box">
          <div className="svc-cta-glow" aria-hidden="true" />
          <span className="svc-cta-badge">OMS • CAMPAIGN BRIEF</span>
          <h2>{tServices.ctaTitle}</h2>
          <p>
            {isRtl
              ? 'شاركنا تطلعات وأهداف مشروعك القادم، وسيقوم فريق خبرائنا بتصميم خطة إعلانية مخصصة تضمن لك التميز والتفوق السوقي.'
              : language === 'fr'
              ? 'Parlez-nous de votre projet et nos équipes élaboreront une stratégie sur-mesure sur les canaux traditionnels et digitaux.'
              : 'Tell us about your project and our team will craft a tailored strategy across traditional and digital channels.'}
          </p>
          <div className="svc-cta-btn-wrap">
            <Link to="/contact" className="svc-cta-btn">
              <span>{tServices.ctaBtn}</span>
              <span className="svc-cta-btn-arrow">{isRtl ? '←' : '→'}</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
