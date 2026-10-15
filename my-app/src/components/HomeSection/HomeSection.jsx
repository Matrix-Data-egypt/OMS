import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import NeuralCanvas from '../common/NeuralCanvas';
import { useLanguage } from '../../context/LanguageContext';
import { PAGE_TRANSLATIONS } from '../../context/translationsData';
import {
  CORE_PILLARS,
  CAMPAIGN_OBJECTIVES,
  TIMELINE_STEPS
} from '../../data/agentData';
import './HomeSection.css';

const LOCALIZED_TIMELINE = {
  ar: [
    {
      step: 1,
      title: 'الاستكشاف وبحوث السوق',
      phase: 'المرحلة 01 // الاستكشاف',
      desc: 'نبدأ بفهم عميق لنموذج عملك، جمهورك المستهدف، المشهد التنافسي، والفرص السوقية لبناء أساس استراتيجي متين.'
    },
    {
      step: 2,
      title: 'الاستراتيجية وهندسة الحملة',
      phase: 'المرحلة 02 // الاستراتيجية',
      desc: 'يصمم فريقنا استراتيجية حملة مخصصة تحدد الرسائل الرئيسية، مزيج القنوات الإعلامية، وتوزيع الميزانية لتحقيق أهدافك التجارية بدقة.'
    },
    {
      step: 3,
      title: 'الإنتاج الإبداعي والتنفيذ',
      phase: 'المرحلة 03 // الإنتاج',
      desc: 'نحول الاستراتيجية إلى واقع ملموس: إعلانات تلفزيونية سينمائية، تصاميم شاشات الطرق، وحدات عرض المتاجر، ومحتوى رقمي عالي التأثير.'
    },
    {
      step: 4,
      title: 'الإطلاق والتحسين والنتائج',
      phase: 'المرحلة 04 // الإطلاق والنتائج',
      desc: 'إطلاق الحملة عبر كافة القنوات مع رصد مستمر لمعدلات التفاعل ومؤشرات الأداء لضمان تحقيق أعلى عائد على الاستثمار.'
    }
  ],
  fr: [
    {
      step: 1,
      title: 'Découverte & Étude de Marché',
      phase: 'PHASE 01 // DÉCOUVERTE',
      desc: 'Compréhension approfondie de vos activités, de votre public cible et de la concurrence pour bâtir une base stratégique solide.'
    },
    {
      step: 2,
      title: 'Stratégie & Architecture de Campagne',
      phase: 'PHASE 02 // STRATÉGIE',
      desc: 'Notre équipe élabore une stratégie sur mesure définissant vos messages clés, le mix média et l\'allocation budgétaire optimale.'
    },
    {
      step: 3,
      title: 'Production Créative & Réalisation',
      phase: 'PHASE 03 // PRODUCTION',
      desc: 'Nous donnons vie à votre stratégie : spots TV cinématographiques, affichage urbain spectaculaire, PLV en magasin et contenus digitaux percutants.'
    },
    {
      step: 4,
      title: 'Déploiement & Optimisation des Résultats',
      phase: 'PHASE 04 // RÉSULTATS',
      desc: 'Lancement multicanal coordonné avec suivi rigoureux des KPI pour maximiser votre notoriété et votre retour sur investissement.'
    }
  ]
};

const LOCALIZED_OBJECTIVES = {
  ar: [
    {
      id: "obj-1",
      tag: "بناء العلامة التجارية",
      title: "الوعي بالعلامة وترسيخ التواجد",
      desc: "ترسيخ اسم علامتك في أذهان الجمهور عبر التلفزيون وشاشات الطرق والتواجد الرقمي المنسق عبر كافة القنوات.",
      agentPill: "أبحاث + إبداع",
      strategicBenefit: "تذكر قوي للعلامة"
    },
    {
      id: "obj-2",
      tag: "إطلاق المنتجات",
      title: "إطلاق منتج أو خدمة جديدة",
      desc: "صناعة زخم فوري لمنتجك الجديد بحملة متزامنة عبر القنوات تثير الحماس وتدفع نحو الشراء والتبني السريع.",
      agentPill: "إبداع + ميديا",
      strategicBenefit: "اختراق سريع للسوق"
    },
    {
      id: "obj-3",
      tag: "توليد العملاء المحتملين",
      title: "اكتساب العملاء وزيادة الطلبات",
      desc: "جذب عملاء محتملين مؤهلين وتحويلهم إلى مشترين فعليين عبر استراتيجيات إعلانية مستهدفة ومحكمة.",
      agentPill: "أبحاث + نتائج",
      strategicBenefit: "عملاء جاهزون للشراء"
    },
    {
      id: "obj-4",
      tag: "الإنتاج التلفزيوني",
      title: "إعلانات تلفزيونية وإذاعية بمعايير عالمية",
      desc: "إنتاج سينمائي تجاري فائق الجودة يروي قصة علامتك بإبهار ويبث على كبرى الشبكات التلفزيونية في مصر والمنطقة.",
      agentPill: "استوديو الإبداع",
      strategicBenefit: "صورة مؤسسية راقية"
    },
    {
      id: "obj-5",
      tag: "نمو المبيعات",
      title: "مضاعفة الإيرادات وتسريع المبيعات",
      desc: "تحقيق نمو ملموس في حجم المبيعات من خلال حملات مدمجة تجمع بين الانتشار الجماهيري والأداء الرقمي الموجه للتحويل.",
      agentPill: "الفريق المتكامل",
      strategicBenefit: "نمو حقيقي للإيرادات"
    },
    {
      id: "obj-6",
      tag: "التنشيط والفعاليات",
      title: "تجارب وتنشيط ميداني ونقاط بيع",
      desc: "خلق تجارب تفاعلية لا تُنسى من خلال منصات نقاط البيع الفاخرة والفعاليات التي تصنع اتصالاً مباشراً مع المستهلكين.",
      agentPill: "فريق التنشيط الميداني",
      strategicBenefit: "تفاعل مباشر مؤثر"
    }
  ],
  fr: [
    {
      id: "obj-1",
      tag: "Construction de Marque",
      title: "Notoriété & Présence sur le Marché",
      desc: "Instaurez votre marque comme une référence incontournable via la télévision, l'affichage urbain et une présence digitale unifiée.",
      agentPill: "RECHERCHE + CRÉATIVITÉ",
      strategicBenefit: "Forte Mémorisation"
    },
    {
      id: "obj-2",
      tag: "Lancement de Produit",
      title: "Lancement de Nouveau Produit ou Service",
      desc: "Créez un impact décisif pour votre lancement grâce à une campagne synchronisée suscitant l'engouement immédiat.",
      agentPill: "CRÉATIF + MÉDIA",
      strategicBenefit: "Pénétration Rapide"
    },
    {
      id: "obj-3",
      tag: "Génération de Leads",
      title: "Acquisition Clients & Croissance des Ventes",
      desc: "Attirez des prospects hautement qualifiés et convertissez-les en clients grâce à des ciblages publicitaires ultra-précis.",
      agentPill: "RECHERCHE + RÉSULTATS",
      strategicBenefit: "Prospects Qualifiés"
    },
    {
      id: "obj-4",
      tag: "Production Audiovisuelle",
      title: "Spots Télévisés & Production Radio",
      desc: "Des publicités de qualité cinématographique diffusées sur les grandes chaînes pour sublimer votre image de marque.",
      agentPill: "STUDIO CRÉATIF",
      strategicBenefit: "Image de Marque Premium"
    },
    {
      id: "obj-5",
      tag: "Accélération des Ventes",
      title: "Croissance du Chiffre d'Affaires",
      desc: "Générez des ventes tangibles grâce à des campagnes mariant branding à grande échelle et performance digitale de pointe.",
      agentPill: "ÉQUIPE INTÉGRÉE",
      strategicBenefit: "Croissance des Revenus"
    },
    {
      id: "obj-6",
      tag: "Événements & Terrain",
      title: "Activations Terrain & PLV en Magasin",
      desc: "Créez des expériences immersives et des présentoirs de vente qui connectent directement votre marque avec vos consommateurs.",
      agentPill: "EXPÉRIENTIEL BTL",
      strategicBenefit: "Engagement Direct"
    }
  ]
};

const LOCALIZED_BULLETS = {
  ar: [
    'حجز وشراء الوسائط — بث تلفزيوني وإذاعي',
    'الإنتاج والإعلانات التلفزيونية السينمائية',
    'إعلانات الطرق واللوحات العملاقة الداخلية والخارجية',
    'العلاقات العامة وتنظيم المعارض والفعاليات',
    'التصميم والطباعة الفاخرة للشركات',
    'بناء الهوية البصرية والصورة المؤسسية',
    'التسويق الرقمي وإدارة السوشيال ميديا',
    'تنشيط المبيعات الميدانية (BTL) ونقاط البيع'
  ],
  fr: [
    'Achat d’espace — Diffusion TV & Radio',
    'Production & Spots TV Cinématographiques',
    'Affichage Intérieur & Mégas Panneaux OOH',
    'Relations Publiques, Salons & Événements',
    'Design & Impression Haut de Gamme',
    'Identité de Marque & Image de Marque',
    'Marketing Digital & Réseaux Sociaux',
    'Activations Terrain BTL & PLV'
  ],
  en: [
    'Media Buying — TV & Radio Broadcast',
    'Production & Cinematic TV Commercials',
    'Indoor & Outdoor Mega Billboards',
    'PR, Booths & Experiential Events',
    'Design & Premium Print Production',
    'Brand Identity & Corporate Image',
    'Digital Marketing & Social Media',
    'BTL & Ground Activations'
  ]
};

export default function HomeSection() {
  const [activeStep, setActiveStep] = useState(1);
  const { t, language } = useLanguage();
  const TH = PAGE_TRANSLATIONS[language]?.home || PAGE_TRANSLATIONS.en.home;

  const currentTimelineSteps = LOCALIZED_TIMELINE[language] || TIMELINE_STEPS;
  const currentObjectives = LOCALIZED_OBJECTIVES[language] || CAMPAIGN_OBJECTIVES;
  const currentBullets = LOCALIZED_BULLETS[language] || LOCALIZED_BULLETS.en;

  const activeTimelineObj = currentTimelineSteps.find((ts) => ts.step === activeStep) || currentTimelineSteps[0];

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
              {t('home.heroTitle1', 'Your Vision, Amplified')}<br />
              <span className="highlight-gold-clean">{t('home.heroTitle2', 'Across Every Channel & Screen.')}</span>
            </h1>

            <p className="hero-paragraph-clean">
              {t(
                'home.heroDesc',
                'From award-winning TV commercials and iconic outdoor billboards to high-performance digital campaigns — we bring your brand to life across Egypt and the MENA region with creativity, strategy, and measurable impact.'
              )}
            </p>

            <div className="hero-buttons-clean">
              <Link to="/contact" className="btn-gold-action">
                {t('home.startCampaign', 'Start Your Campaign →')}
              </Link>
              <a
                href="#campaign-builder-section"
                onClick={handleScrollToCampaign}
                className="btn-outline-action"
              >
                {t('home.exploreServices', 'Explore Our Services ↓')}
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
          <span className="tag-purple-small">{TH.processTag}</span>
          <h2>{TH.processTitle}</h2>
          <p className="section-intro-desc">{TH.processDesc}</p>
        </div>

        <div className="timeline-steps-bar" role="tablist" aria-label="Campaign phases">
          {currentTimelineSteps.map((item) => {
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
          <h3>{activeTimelineObj.title}</h3>
          <p>{activeTimelineObj.desc}</p>
        </div>
      </section>

      {/* Campaign Goals Section */}
      <section className="objectives-section" aria-label="What We Help You Achieve">
        <div className="section-intro">
          <span className="tag-purple-small">{TH.goalsTag}</span>
          <h2>{TH.goalsTitle}</h2>
          <p className="section-intro-desc">{TH.goalsDesc}</p>
        </div>

        <div className="objectives-grid">
          {currentObjectives.map((obj) => (
            <ObjectiveCard key={obj.id} obj={obj} />
          ))}
        </div>
      </section>

      {/* Core Capabilities Section */}
      <section className="home-services-section" aria-label="Our Capabilities">
        <div className="section-intro">
          <span className="tag-purple-small">{TH.capsTag}</span>
          <h2>{TH.capsTitle}</h2>
          <p className="section-intro-desc">{TH.capsDesc}</p>
        </div>

        <div className="home-services-layout-grid">
          <FrameworkGroup TH={TH} serviceBullets={currentBullets} />
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

function FrameworkGroup({ TH, serviceBullets = [] }) {
  return (
    <article className="home-service-group-card">
      <div className="group-card-header">
        <span className="framework-num-pill">{TH.suiteBadge}</span>
        <h3>{TH.suiteTitle}</h3>
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
            {TH.exploreWork}
          </Link>
        </div>
      </div>

      <div className="group-detailed-subcards-stack">
        <div className="detailed-subcard">
          <div className="subcard-glow-line" aria-hidden="true" />
          <h4>{TH.subcard1Title}</h4>
          <p>{TH.subcard1Desc}</p>
        </div>

        <div className="detailed-subcard">
          <div className="subcard-glow-line" aria-hidden="true" />
          <h4>{TH.subcard2Title}</h4>
          <p>{TH.subcard2Desc}</p>
        </div>

        <div className="detailed-subcard">
          <div className="subcard-glow-line" aria-hidden="true" />
          <h4>{TH.subcard3Title}</h4>
          <p>{TH.subcard3Desc}</p>
        </div>

        <div className="detailed-subcard">
          <div className="subcard-glow-line" aria-hidden="true" />
          <h4>{TH.subcard4Title}</h4>
          <p>{TH.subcard4Desc}</p>
        </div>
      </div>
    </article>
  );
}
