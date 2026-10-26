import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';

const BLUEPRINT_DATA = {
  ar: {
    tag: 'صمم خطتك الإعلانية',
    title: 'خطط لاستراتيجية حملتك القادمة',
    desc: 'حدد هدفك الإعلاني، وقنوات النشر المفضلة، ونطاق التغطية الجغرافية لنصمم لك استراتيجية تسويقية مخصصة تحقق أهدافك بدقة.',
    step1: 'الخطوة 01 // هدف الحملة الإعلانية',
    step2: 'الخطوة 02 // القنوات والوسائط الإعلانية',
    step3: 'الخطوة 03 // النطاق الجغرافي المستهدف',
    planStatus: 'فريق العمل جاهز للتنفيذ',
    scopeLabel: 'نطاق التغطية:',
    squadLabel: 'الفريق الاستشاري المخصص:',
    delivTitle: 'ما نقدمه لعلامتك التجارية:',
    deliv1: 'دراسة وتحليل معمق للسوق وسلوك المستهلكين والمنافسين',
    deliv2: 'أفكار إبداعية، سيناريوهات، وإنتاج مرئي وتصميمي متكامل',
    deliv3: 'حجز وإدارة مساحات إعلانية استراتيجية في القنوات المختارة',
    deliv4: 'تقارير دورية شفافة لمتابعة أداء الحملة ونمو المبيعات',
    ctaBtn: 'احصل على عرض وخطة متكاملة ←',
    objectives: [
      { id: 'brand-authority', label: 'ترسيخ مكانة العلامة التجارية', squad: 'فريق الاستراتيجية والإبداع', focus: 'ريادة بصرية في السوق وانطباع راسخ لدى الجمهور المستهدف' },
      { id: 'product-launch', label: 'إطلاق منتج أو خدمة جديدة', squad: 'فريق الإنتاج وحملات الإطلاق', focus: 'اختراق سريع للسوق وزخم جماهيري متعدد القنوات' },
      { id: 'lead-generation', label: 'جذب العملاء وزيادة المبيعات', squad: 'فريق الأداء والتسويق الرقمي', focus: 'توليد عملاء محتملين ذوي اهتمام حقيقي للشراء' },
      { id: 'omni-channel', label: 'حملة كبرى شاملة (تلفزيون + طرق)', squad: 'فريق التخطيط الإعلامي الشامل', focus: 'هيمنة إعلانية موحدة على الشاشات والمحاور الرقمية' },
    ],
    channels: [
      { id: 'prime-tv', label: 'الإنتاج والإعلانات التلفزيونية', desc: 'إعلانات تلفزيونية احترافية على كبرى القنوات الفضائية' },
      { id: 'mega-ooh', label: 'إعلانات الطرق والشاشات العملاقة', desc: 'لوحات يونيبول وشاشات LED على أهم المحاور الحيوية' },
      { id: 'digital-perf', label: 'الحملات الرقمية والتسويق الإلكتروني', desc: 'إدارة احترافية على فيسبوك، تيك توك، جوجل، ويوتيوب' },
      { id: 'experiential', label: 'منصات ونقاط البيع والتنشيط الميداني', desc: 'وحدات عرض POSS فاخرة وأجنحة معارض تفاعلية' },
    ],
    regions: [
      { id: 'egypt-metro', label: 'القاهرة الكبرى والجيزة' },
      { id: 'egypt-national', label: 'كافة محافظات جمهورية مصر' },
      { id: 'mena-expansion', label: 'التوسع الإقليمي بالخليج والشرق الأوسط' },
    ]
  },
  en: {
    tag: 'Build Your Campaign',
    title: 'Plan Your Campaign Strategy',
    desc: 'Select your objective, media channels, and target region to see how we can build a tailored campaign for your brand.',
    step1: 'STEP 01 // YOUR CAMPAIGN GOAL',
    step2: 'STEP 02 // MEDIA CHANNELS',
    step3: 'STEP 03 // YOUR TARGET MARKET',
    planStatus: 'SPECIALIZED TEAM READY',
    scopeLabel: 'Target Scope:',
    squadLabel: 'DEDICATED ADVISORY TEAM:',
    delivTitle: "WHAT WE'LL DELIVER:",
    deliv1: 'In-Depth Market Research, Audience Analysis & Competitive Insights',
    deliv2: 'Premium Creative Concepts, Scripts & Turnkey Video Production',
    deliv3: 'Strategic Media Booking Across Your Selected Prime Channels',
    deliv4: 'Transparent Reporting & Live Campaign Performance Review',
    ctaBtn: 'Get a Tailored Proposal →',
    objectives: [
      { id: 'brand-authority', label: 'Brand Authority & Equity', squad: 'Strategy & Creative Squad', focus: 'Iconic category positioning & lasting consumer recall' },
      { id: 'product-launch', label: 'Commercial Product Launch', squad: 'Production & Launch Squad', focus: 'Rapid multi-channel market penetration & viral momentum' },
      { id: 'lead-generation', label: 'Sales & Qualified Lead Gen', squad: 'Digital & Performance Squad', focus: 'High-intent commercial pipeline & customer acquisition' },
      { id: 'omni-channel', label: 'TV & Outdoor Mega Blitz', squad: 'Full Integrated Media Squad', focus: 'Synchronized prime broadcast, highway LED screens & digital media' },
    ],
    channels: [
      { id: 'prime-tv', label: 'TV Broadcast & Video Production', desc: 'Professional commercials on premier broadcast networks' },
      { id: 'mega-ooh', label: 'Mega Outdoor Billboards', desc: 'High-density highway LEDs and landmark bridge placements' },
      { id: 'digital-perf', label: 'Digital & Social Media Suite', desc: 'Meta, TikTok, Google Search, Programmatics & YouTube' },
      { id: 'experiential', label: 'POSS & Ground Activations', desc: 'Interactive retail fixtures, branded kiosks and booths' },
    ],
    regions: [
      { id: 'egypt-metro', label: 'Greater Cairo & Giza Hubs' },
      { id: 'egypt-national', label: 'Nationwide Egypt Corridors' },
      { id: 'mena-expansion', label: 'Regional GCC & MENA Expansion' },
    ]
  },
  fr: {
    tag: 'Construire Votre Campagne',
    title: 'Planifiez Votre Stratégie de Campagne',
    desc: 'Sélectionnez votre objectif, vos canaux médias et votre zone géographique pour découvrir votre plan média sur mesure.',
    step1: 'ÉTAPE 01 // OBJECTIF DE CAMPAGNE',
    step2: 'ÉTAPE 02 // MIX MÉDIA ET CANAUX',
    step3: 'ÉTAPE 03 // MARCHÉ ET COUVERTURE',
    planStatus: 'ÉQUIPE DÉDIÉE PRÊTE',
    scopeLabel: 'Périmètre:',
    squadLabel: 'ÉQUIPE D’EXPERTS DÉDIÉE:',
    delivTitle: 'NOS LIVRABLES CLÉS:',
    deliv1: 'Étude de Marché Approfondie, Analyse d’Audience & Concurrence',
    deliv2: 'Concepts Créatifs Haut de Gamme, Scénarios & Production Clé en Main',
    deliv3: 'Réservation et Placement Média Stratégique sur Vos Canaux',
    deliv4: 'Rapports de Performance Transparents et Suivi Régulier',
    ctaBtn: 'Recevoir une Proposition Sur Mesure →',
    objectives: [
      { id: 'brand-authority', label: 'Notoriété & Image de Marque', squad: 'Pôle Stratégie & Création', focus: 'Positionnement iconique et mémorisation consommateur durable' },
      { id: 'product-launch', label: 'Lancement Commercial de Produit', squad: 'Pôle Lancement & Production', focus: 'Pénétration rapide du marché et élan multi-canal' },
      { id: 'lead-generation', label: 'Génération de Leads & Ventes', squad: 'Pôle Performance Digitale', focus: 'Acquisition ciblée de prospects commerciaux qualifiés' },
      { id: 'omni-channel', label: 'Campagne Majeure TV & Affichage', squad: 'Pôle Média Intégré 360°', focus: 'Synchronisation broadcast, écrans LED géants et retargeting' },
    ],
    channels: [
      { id: 'prime-tv', label: 'Production & Diffusion TV', desc: 'Spots publicitaires professionnels sur les grandes chaînes' },
      { id: 'mega-ooh', label: 'Panneaux & Affichage Urbain', desc: 'Écrans LED autoroutiers et emplacements ponts stratégiques' },
      { id: 'digital-perf', label: 'Campagnes Digitales & Réseaux', desc: 'Gestion haute performance Meta, TikTok, Google et YouTube' },
      { id: 'experiential', label: 'PLV & Activations Terrain', desc: 'Présentoirs de vente premium, stands et kiosques interactifs' },
    ],
    regions: [
      { id: 'egypt-metro', label: 'Grand Caire & Gizeh' },
      { id: 'egypt-national', label: 'Territoire National Égyptien' },
      { id: 'mena-expansion', label: 'Expansion Régionale Golfe & MENA' },
    ]
  }
};

export default function CampaignBlueprintStudio() {
  const { language } = useLanguage();
  const t = BLUEPRINT_DATA[language] || BLUEPRINT_DATA.en;

  const [selectedObjective, setSelectedObjective] = useState(t.objectives[0].id);
  const [selectedChannels, setSelectedChannels] = useState(['prime-tv', 'mega-ooh', 'digital-perf']);
  const [selectedRegion, setSelectedRegion] = useState(t.regions[0].id);

  const activeObj = t.objectives.find((o) => o.id === selectedObjective) || t.objectives[0];
  const activeReg = t.regions.find((r) => r.id === selectedRegion) || t.regions[0];

  const toggleChannel = (id) => {
    setSelectedChannels((prev) =>
      prev.includes(id) ? (prev.length > 1 ? prev.filter((c) => c !== id) : prev) : [...prev, id]
    );
  };

  return (
    <section className="blueprint-studio-section" aria-label="Interactive Campaign Planner">
      <div className="section-intro">
        <span className="tag-purple-small">{t.tag}</span>
        <h2>{t.title}</h2>
        <p className="section-intro-desc">
          {t.desc}
        </p>
      </div>

      <div className="blueprint-studio-card">
        {/* Left Interactive Configuration Panel */}
        <div className="studio-config-column">
          {/* Step 1: Objective */}
          <div className="studio-control-group">
            <span className="studio-step-label">{t.step1}</span>
            <div className="studio-options-grid">
              {t.objectives.map((obj) => (
                <button
                  key={obj.id}
                  type="button"
                  className={`studio-option-btn ${selectedObjective === obj.id ? 'is-selected' : ''}`}
                  onClick={() => setSelectedObjective(obj.id)}
                >
                  <span className="opt-title">{obj.label}</span>
                  <span className="opt-desc">{obj.focus}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Step 2: Media Mix */}
          <div className="studio-control-group">
            <span className="studio-step-label">{t.step2}</span>
            <div className="studio-channels-grid">
              {t.channels.map((ch) => {
                const isChecked = selectedChannels.includes(ch.id);
                return (
                  <button
                    key={ch.id}
                    type="button"
                    className={`studio-channel-btn ${isChecked ? 'is-active' : ''}`}
                    onClick={() => toggleChannel(ch.id)}
                  >
                    <span className="channel-checkbox-indicator">{isChecked ? '✓' : '+'}</span>
                    <div className="channel-text-group">
                      <span className="channel-title">{ch.label}</span>
                      <span className="channel-sub">{ch.desc}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 3: Geographic Scope */}
          <div className="studio-control-group">
            <span className="studio-step-label">{t.step3}</span>
            <div className="studio-regions-row">
              {t.regions.map((reg) => (
                <button
                  key={reg.id}
                  type="button"
                  className={`studio-region-btn ${selectedRegion === reg.id ? 'is-selected' : ''}`}
                  onClick={() => setSelectedRegion(reg.id)}
                >
                  {reg.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Dynamic Blueprint Outcome Panel */}
        <div className="studio-output-column">
          <div className="blueprint-manifest-header">
            <div className="manifest-badge-row">
              <span className="manifest-code">OMS_CAMPAIGN_PLAN</span>
              <span className="manifest-status">
                <span className="live-dot" /> {t.planStatus}
              </span>
            </div>
            <h3 className="manifest-title">{activeObj.label}</h3>
            <span className="manifest-region-tag">{t.scopeLabel} {activeReg.label}</span>
          </div>

          <div className="manifest-body-card">
            <div className="manifest-squad-row">
              <span className="squad-label">{t.squadLabel}</span>
              <span className="squad-value">{activeObj.squad}</span>
            </div>

            <div className="manifest-deliverables-block">
              <span className="deliv-title">{t.delivTitle}</span>
              <ul className="deliv-list">
                <li>
                  <span className="deliv-bullet">⚡</span>
                  <span>{t.deliv1}</span>
                </li>
                <li>
                  <span className="deliv-bullet">⚡</span>
                  <span>{t.deliv2}</span>
                </li>
                <li>
                  <span className="deliv-bullet">⚡</span>
                  <span>{t.deliv3}</span>
                </li>
                <li>
                  <span className="deliv-bullet">⚡</span>
                  <span>{t.deliv4}</span>
                </li>
              </ul>
            </div>

            <div className="manifest-cta-box">
              <Link to="/contact" className="btn-manifest-deploy">
                {t.ctaBtn}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
