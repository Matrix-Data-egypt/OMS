import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';

const INDUSTRIES_DATA = {
  ar: [
    { id: 'real-estate', name: 'التطوير العقاري والمشاريع الفاخرة', roasMultiplier: 5.2, leadsPer10k: 140 },
    { id: 'ecommerce', name: 'التجارة الإلكترونية والمنتجات الاستهلاكية', roasMultiplier: 4.8, leadsPer10k: 650 },
    { id: 'fintech', name: 'الخدمات المالية والبنوك', roasMultiplier: 4.2, leadsPer10k: 180 },
    { id: 'automotive', name: 'السيارات والقطاع الصناعي', roasMultiplier: 4.6, leadsPer10k: 120 },
    { id: 'fmcg', name: 'الأغذية والمشروبات FMCG', roasMultiplier: 4.9, leadsPer10k: 820 },
  ],
  en: [
    { id: 'real-estate', name: 'Real Estate & Luxury Development', roasMultiplier: 5.2, leadsPer10k: 140 },
    { id: 'ecommerce', name: 'E-Commerce & Consumer Brands', roasMultiplier: 4.8, leadsPer10k: 650 },
    { id: 'fintech', name: 'Fintech & B2B Services', roasMultiplier: 4.2, leadsPer10k: 180 },
    { id: 'automotive', name: 'Automotive & Heavy Industry', roasMultiplier: 4.6, leadsPer10k: 120 },
    { id: 'fmcg', name: 'FMCG, Food & Beverage', roasMultiplier: 4.9, leadsPer10k: 820 },
  ],
  fr: [
    { id: 'real-estate', name: 'Immobilier & Projets de Luxe', roasMultiplier: 5.2, leadsPer10k: 140 },
    { id: 'ecommerce', name: 'E-Commerce & Marques Grand Public', roasMultiplier: 4.8, leadsPer10k: 650 },
    { id: 'fintech', name: 'Fintech & Services B2B', roasMultiplier: 4.2, leadsPer10k: 180 },
    { id: 'automotive', name: 'Automobile & Industrie Lourde', roasMultiplier: 4.6, leadsPer10k: 120 },
    { id: 'fmcg', name: 'Agroalimentaire & FMCG', roasMultiplier: 4.9, leadsPer10k: 820 },
  ],
};

const ROI_STRINGS = {
  ar: {
    tag: 'مؤشرات الأداء التقديرية',
    title: 'حاسبة التأثير والعائد التقديري للحملة',
    desc: 'نموذج محاكاة استرشادي يوضح كيفية مساهمة التخطيط الإعلامي المتكامل في تعظيم كفاءة الميزانية وتقليص الهدر الإعلاني.',
    budgetLabel: 'الميزانية التسويقية الشهرية المتوقعة (بالدولار أو ما يعادله)',
    sectorLabel: 'القطاع التجاري المستهدف',
    disclaimer: 'تقديرات استرشادية مبنية على مؤشرات السوق ومتوسطات أداء الحملات السابقة في مصر والشرق الأوسط. تختلف النتائج حسب طبيعة المنتج والمزيج الإعلاني.',
    projectedTitle: 'تقدير العائد الإجمالي المتوقع',
    roasSuffix: 'عائد تقديري متوقع على الإنفاق الإعلاني (ROAS استرشادي)',
    reachTitle: 'مرات الظهور المستهدفة',
    reachSub: 'جمهور ذو اهتمام حقيقي',
    leadsTitle: 'عملاء محتملون مؤهلون',
    leadsSub: 'استهداف نوعي عالي الدقة',
    hoursTitle: 'ساعات عمل تشغيلية موفرة',
    hoursSub: 'إدارة متكاملة بدون تأخير',
    cacTitle: 'متوسط خفض تكلفة الاستحواذ',
    cacSub: 'تحسين توجيه الميزانيات',
    ctaBtn: 'احجز استشارة تخطيط الحملة ←'
  },
  en: {
    tag: 'Performance Simulation',
    title: 'Illustrative Campaign ROI Calculator',
    desc: 'Simulate how integrated media planning and omni-channel deployment maximize ad efficiency and drive targeted commercial growth.',
    budgetLabel: 'Planned Monthly Campaign Capital (USD / equivalent)',
    sectorLabel: 'Target Industry Vertical',
    disclaimer: 'Illustrative estimates based on regional media performance averages and market benchmarks. Actual outcomes vary by sector and creative execution.',
    projectedTitle: 'PROJECTED REVENUE IMPACT',
    roasSuffix: 'Estimated Blended ROAS (Illustrative)',
    reachTitle: 'Targeted Impressions',
    reachSub: 'High-affinity audience',
    leadsTitle: 'Qualified Commercial Leads',
    leadsSub: 'High-intent prospects',
    hoursTitle: 'Production & Media Hours Saved',
    hoursSub: 'Streamlined agency delivery',
    cacTitle: 'Estimated CAC Optimization',
    cacSub: 'Multi-channel efficiency',
    ctaBtn: 'Lock In Campaign Allocation →'
  },
  fr: {
    tag: 'Simulation de Performance',
    title: 'Calculateur d\'Impact et ROI Prévisionnel',
    desc: 'Simulez l\'impact d\'une stratégie média intégrée pour optimiser vos budgets et générer une croissance commerciale mesurable.',
    budgetLabel: 'Budget Mensuel de Campagne Envisagé (USD / équivalent)',
    sectorLabel: 'Secteur d’Activité Ciblé',
    disclaimer: 'Estimations indicatives basées sur des moyennes de marché régionales. Les résultats réels varient selon le produit et l\'exécution créative.',
    projectedTitle: 'IMPACT REVENU PRÉVISIONNEL',
    roasSuffix: 'ROAS Global Estimé (Indicatif)',
    reachTitle: 'Impressions Ciblées',
    reachSub: 'Audience qualifiée',
    leadsTitle: 'Prospects Commerciaux Qualifiés',
    leadsSub: 'Ciblage haute intention',
    hoursTitle: 'Heures de Production Gagnées',
    hoursSub: 'Gestion clé en main sans délai',
    cacTitle: 'Optimisation du Coût d\'Acquisition',
    cacSub: 'Efficacité multi-canaux',
    ctaBtn: 'Planifier Votre Campagne →'
  }
};

export default function RoiCalculator() {
  const { language } = useLanguage();
  const t = ROI_STRINGS[language] || ROI_STRINGS.en;
  const industries = INDUSTRIES_DATA[language] || INDUSTRIES_DATA.en;

  const [budget, setBudget] = useState(35000);
  const [selectedIndustry, setSelectedIndustry] = useState(industries[0].id);

  const activeInd = industries.find((ind) => ind.id === selectedIndustry) || industries[0];

  // Dynamic algorithmic projections
  const estimatedReach = Math.round((budget / 1000) * 85000).toLocaleString();
  const estimatedLeads = Math.round((budget / 10000) * activeInd.leadsPer10k).toLocaleString();
  const projectedRevenue = Math.round(budget * activeInd.roasMultiplier).toLocaleString();
  const hoursSaved = Math.round((budget / 10000) * 48);

  return (
    <section className="roi-calculator-section" aria-label="Campaign Impact & ROI Simulator">
      <div className="section-intro">
        <span className="tag-purple-small">{t.tag}</span>
        <h2>{t.title}</h2>
        <p className="section-intro-desc">
          {t.desc}
        </p>
      </div>

      <div className="roi-calculator-card">
        <div className="calc-inputs-column">
          <div className="calc-control-group">
            <div className="calc-label-row">
              <label htmlFor="budget-slider" className="calc-label">
                {t.budgetLabel}
              </label>
              <span className="calc-display-budget">${budget.toLocaleString()}</span>
            </div>

            <input
              id="budget-slider"
              type="range"
              min="5000"
              max="200000"
              step="5000"
              value={budget}
              onChange={(e) => setBudget(Number(e.target.value))}
              className="roi-range-slider"
              aria-label="Planned Monthly Budget Slider"
            />

            <div className="slider-ticks">
              <span>$5,000</span>
              <span>$50,000</span>
              <span>$100,000</span>
              <span>$200,000+</span>
            </div>
          </div>

          <div className="calc-control-group">
            <label className="calc-label">{t.sectorLabel}</label>
            <div className="industry-pills-grid" role="radiogroup" aria-label="Select Target Industry">
              {industries.map((ind) => (
                <button
                  key={ind.id}
                  type="button"
                  role="radio"
                  aria-checked={selectedIndustry === ind.id}
                  className={`industry-pill-btn ${selectedIndustry === ind.id ? 'is-selected' : ''}`}
                  onClick={() => setSelectedIndustry(ind.id)}
                >
                  {ind.name}
                </button>
              ))}
            </div>
          </div>

          <div className="calc-security-note">
            <span className="note-shield-icon" aria-hidden="true">📊</span>
            <span>
              {t.disclaimer}
            </span>
          </div>
        </div>

        {/* Calculation Result Dashboard */}
        <div className="calc-results-column">
          <div className="result-main-card">
            <span className="result-top-tag">{t.projectedTitle}</span>
            <div className="result-big-number">${projectedRevenue}</div>
            <span className="result-multiplier-badge">
              {activeInd.roasMultiplier}x {t.roasSuffix}
            </span>
          </div>

          <div className="result-secondary-grid">
            <div className="result-metric-box">
              <span className="res-val">{estimatedReach}</span>
              <span className="res-title">{t.reachTitle}</span>
              <span className="res-sub">{t.reachSub}</span>
            </div>

            <div className="result-metric-box">
              <span className="res-val">{estimatedLeads}</span>
              <span className="res-title">{t.leadsTitle}</span>
              <span className="res-sub">{t.leadsSub}</span>
            </div>

            <div className="result-metric-box">
              <span className="res-val">~{hoursSaved} hrs</span>
              <span className="res-title">{t.hoursTitle}</span>
              <span className="res-sub">{t.hoursSub}</span>
            </div>

            <div className="result-metric-box">
              <span className="res-val">~30-40%</span>
              <span className="res-title">{t.cacTitle}</span>
              <span className="res-sub">{t.cacSub}</span>
            </div>
          </div>

          <div className="calc-cta-row">
            <Link to="/contact" className="btn-calc-deploy">
              {t.ctaBtn}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
