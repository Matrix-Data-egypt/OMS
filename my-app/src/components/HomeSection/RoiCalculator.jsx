import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const INDUSTRIES = [
  { id: 'real-estate', name: 'Real Estate & Luxury Development', roasMultiplier: 5.2, leadsPer10k: 140 },
  { id: 'ecommerce', name: 'E-Commerce & Consumer Brands', roasMultiplier: 4.8, leadsPer10k: 650 },
  { id: 'fintech', name: 'Fintech & B2B Services', roasMultiplier: 4.2, leadsPer10k: 180 },
  { id: 'automotive', name: 'Automotive & Heavy Industry', roasMultiplier: 4.6, leadsPer10k: 120 },
  { id: 'fmcg', name: 'FMCG, Food & Beverage', roasMultiplier: 4.9, leadsPer10k: 820 },
];

export default function RoiCalculator() {
  const [budget, setBudget] = useState(35000); // USD or EGP value
  const [selectedIndustry, setSelectedIndustry] = useState(INDUSTRIES[0].id);

  const activeInd = INDUSTRIES.find((ind) => ind.id === selectedIndustry) || INDUSTRIES[0];

  // Dynamic algorithmic projections
  const estimatedReach = Math.round((budget / 1000) * 85000).toLocaleString();
  const estimatedLeads = Math.round((budget / 10000) * activeInd.leadsPer10k).toLocaleString();
  const projectedRevenue = Math.round(budget * activeInd.roasMultiplier).toLocaleString();
  const hoursSaved = Math.round((budget / 10000) * 48);

  return (
    <section className="roi-calculator-section" aria-label="Campaign Impact & ROI Simulator">
      <div className="section-intro">
        <span className="tag-purple-small">Performance Telemetry</span>
        <h2>Autonomous Campaign Impact Calculator</h2>
        <p className="section-intro-desc">
          Simulate how OMS Autonomous Marketing Agents scale ad efficiency, drive high-intent pipeline, and eliminate wasted broadcast and digital spend.
        </p>
      </div>

      <div className="roi-calculator-card">
        <div className="calc-inputs-column">
          <div className="calc-control-group">
            <div className="calc-label-row">
              <label htmlFor="budget-slider" className="calc-label">
                Planned Monthly Campaign Capital (USD / EGP equivalent)
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
            <label className="calc-label">Target Industry Vertical</label>
            <div className="industry-pills-grid" role="radiogroup" aria-label="Select Target Industry">
              {INDUSTRIES.map((ind) => (
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
            <span className="note-shield-icon" aria-hidden="true">🛡️</span>
            <span>
              Projections computed using proprietary empirical telemetry from 140+ campaigns across Egypt & MENA.
            </span>
          </div>
        </div>

        {/* Calculation Result Dashboard */}
        <div className="calc-results-column">
          <div className="result-main-card">
            <span className="result-top-tag">PROJECTED REVENUE IMPACT</span>
            <div className="result-big-number">${projectedRevenue}</div>
            <span className="result-multiplier-badge">
              {activeInd.roasMultiplier}x Projected Blended ROAS
            </span>
          </div>

          <div className="result-secondary-grid">
            <div className="result-metric-box">
              <span className="res-val">{estimatedReach}</span>
              <span className="res-title">Targeted Impressions</span>
              <span className="res-sub">High-affinity audience</span>
            </div>

            <div className="result-metric-box">
              <span className="res-val">{estimatedLeads}</span>
              <span className="res-title">Qualified Commercial Leads</span>
              <span className="res-sub">Scored by AURA-01</span>
            </div>

            <div className="result-metric-box">
              <span className="res-val">~{hoursSaved} hrs</span>
              <span className="res-title">Creative & Bidding Hours Saved</span>
              <span className="res-sub">Zero manual delay</span>
            </div>

            <div className="result-metric-box">
              <span className="res-val">-38%</span>
              <span className="res-title">Average CAC Reduction</span>
              <span className="res-sub">Algorithmic bidding</span>
            </div>
          </div>

          <div className="calc-cta-row">
            <Link to="/contact" className="btn-calc-deploy">
              Lock In Campaign Allocation &rarr;
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
