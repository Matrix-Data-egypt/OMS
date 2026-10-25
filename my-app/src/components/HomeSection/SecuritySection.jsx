import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { SECURITY_STANDARDS } from '../../data/agentData';

const SEC_TRANSLATIONS = {
  ar: {
    tag: 'الثقة والأمان',
    title: 'معايير أمان وسرية البيانات المؤسسية',
    desc: 'مصممة للشركات والمجموعات القابضة والعلامات التجارية الرائدة. تظل بيانات عملائك وأصولك الإعلانية واستراتيجياتك التجارية سرية ومحمية بنسبة 100%.',
    badge1: 'سرية تامة وعقود NDA ملزمة',
    badge2: 'عزل وحماية بيانات الحملات',
    badge3: 'امتثال للوائح الإعلانية والتجارية',
    badge4: 'تشفير آمن للبيانات والاتصال',
    standards: [
      {
        id: 'sec-1',
        badge: 'السرية والخصوصية',
        title: 'عزل تام للمعلومات التجارية',
        desc: 'جميع استراتيجيات الحملات وأبحاث السوق والملفات الإبداعية تظل معزولة ومحمية باتفاقيات سرية صارمة.'
      },
      {
        id: 'sec-2',
        badge: 'نزاهة البث والنشر',
        title: 'توثيق وتدقيق شامل للبث والمواقع',
        desc: 'يتم توثيق كل ثانية بث تلفزيوني وكل موقع لوحة إعلانية بتقارير تنفيذ وفحص دورية معتمدة.'
      },
      {
        id: 'sec-3',
        badge: 'حماية البيانات الرقمية',
        title: 'معالجة مشفرة وآمنة',
        desc: 'تأمين تحليلات الجمهور والبيانات التسويقية الرقمية باستخدام أحدث معايير التشفير وأفضل ممارسات الأمان.'
      }
    ]
  },
  en: {
    tag: 'Trust & Privacy',
    title: 'Enterprise-Grade Security & Confidentiality',
    desc: 'Engineered for regional corporations, holding groups, and high-growth brands. Your proprietary customer datasets, media assets, and commercial strategies remain 100% confidential.',
    badge1: 'Strict Commercial NDA Protection',
    badge2: 'Isolated Campaign Data Architecture',
    badge3: 'Egyptian & Regional Media Compliance',
    badge4: 'Industry Standard Encrypted Transfer',
    standards: SECURITY_STANDARDS
  },
  fr: {
    tag: 'Confiance & Sécurité',
    title: 'Normes de Sécurité et Confidentialité Entreprise',
    desc: 'Conçu pour les grandes entreprises, groupes holding et marques en forte croissance. Vos données clients, visuels de campagne et secrets commerciaux restent 100% confidentiels.',
    badge1: 'Accords de Confidentialité Stricts (NDA)',
    badge2: 'Isolation des Données de Campagne',
    badge3: 'Conformité Réglementaire Médias & Commerce',
    badge4: 'Chiffrement Standard & Sécurisé',
    standards: [
      {
        id: 'sec-1',
        badge: 'Confidentialité',
        title: 'Isolation Commerciale Stricte',
        desc: 'Toutes les stratégies de campagne, études de marché et créations restent confidentielles et protégées par des accords stricts.'
      },
      {
        id: 'sec-2',
        badge: 'Transparence Média',
        title: 'Vérification et Audit de Diffusion',
        desc: 'Chaque seconde d\'antenne et chaque panneau d\'affichage est rigoureusement audité et validé par des rapports de diffusion.'
      },
      {
        id: 'sec-3',
        badge: 'Protection des Données',
        title: 'Traitement Numérique Sécurisé',
        desc: 'Les analyses d\'audience et données commerciales sont protégées par les meilleures pratiques de chiffrement moderne.'
      }
    ]
  }
};

export default function SecuritySection() {
  const { language } = useLanguage();
  const t = SEC_TRANSLATIONS[language] || SEC_TRANSLATIONS.en;
  const cards = t.standards || SECURITY_STANDARDS;

  return (
    <section className="security-assurance-section" aria-label="Enterprise Data Security & Standards">
      <div className="section-intro">
        <span className="tag-purple-small">{t.tag}</span>
        <h2>{t.title}</h2>
        <p className="section-intro-desc">
          {t.desc}
        </p>
      </div>

      <div className="security-cards-grid">
        {cards.map((sec, index) => (
          <div key={sec.id} className="security-card">
            <div className="security-card-header">
              <span className="security-index-pill">0{index + 1}</span>
              <span className="security-badge-text">{sec.badge}</span>
            </div>
            <h3>{sec.title}</h3>
            <p>{sec.desc}</p>
            <div className="security-card-glow" aria-hidden="true" />
          </div>
        ))}
      </div>

      {/* Trust Badges Strip */}
      <div className="security-badges-strip">
        <div className="security-badge-item">
          <span className="badge-icon">🔒</span>
          <span className="badge-text">{t.badge1}</span>
        </div>
        <div className="security-badge-item">
          <span className="badge-icon">🛡️</span>
          <span className="badge-text">{t.badge2}</span>
        </div>
        <div className="security-badge-item">
          <span className="badge-icon">🇪🇬</span>
          <span className="badge-text">{t.badge3}</span>
        </div>
        <div className="security-badge-item">
          <span className="badge-icon">⚡</span>
          <span className="badge-text">{t.badge4}</span>
        </div>
      </div>
    </section>
  );
}
