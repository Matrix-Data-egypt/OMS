import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const OBJECTIVES = [
  { id: 'brand-authority', label: 'Brand Authority & Equity', squad: 'AURA + CREA', focus: 'Iconic category positioning & lasting consumer recall' },
  { id: 'product-launch', label: 'Commercial Product Launch', squad: 'CREA + BID', focus: 'Rapid multi-channel market penetration & viral momentum' },
  { id: 'lead-generation', label: 'Enterprise B2B Lead Gen', squad: 'AURA + NEXUS', focus: 'High-intent executive pipeline & account-based acquisition' },
  { id: 'omni-channel', label: 'TV & Outdoor Mega Blitz', squad: 'FULL FLEET', focus: 'Synchronized prime broadcast, highway LED screens & digital retargeting' },
];

const MEDIA_CHANNELS = [
  { id: 'prime-tv', label: 'TV Broadcast & Cinema', desc: 'Cinematic commercials on premier regional broadcast networks' },
  { id: 'mega-ooh', label: 'Mega Outdoor Billboards', desc: 'High-density highway LEDs and landmark bridge placements' },
  { id: 'digital-perf', label: 'Algorithmic Digital Suite', desc: 'Meta, TikTok, Google Search, Programmatics & YouTube' },
  { id: 'experiential', label: 'POSS & Ground Activations', desc: 'Interactive retail fixtures and experiential booths' },
];

const REGIONS = [
  { id: 'egypt-metro', label: 'Greater Cairo & Giza Hubs' },
  { id: 'egypt-national', label: 'Nationwide Egypt Corridors' },
  { id: 'mena-expansion', label: 'Regional GCC & MENA Expansion' },
];

export default function CampaignBlueprintStudio() {
  const [selectedObjective, setSelectedObjective] = useState(OBJECTIVES[0].id);
  const [selectedChannels, setSelectedChannels] = useState(['prime-tv', 'mega-ooh', 'digital-perf']);
  const [selectedRegion, setSelectedRegion] = useState(REGIONS[0].id);

  const activeObj = OBJECTIVES.find((o) => o.id === selectedObjective) || OBJECTIVES[0];
  const activeReg = REGIONS.find((r) => r.id === selectedRegion) || REGIONS[0];

  const toggleChannel = (id) => {
    setSelectedChannels((prev) =>
      prev.includes(id) ? (prev.length > 1 ? prev.filter((c) => c !== id) : prev) : [...prev, id]
    );
  };

  return (
    <section className="blueprint-studio-section" aria-label="Interactive Campaign Blueprint Studio">
      <div className="section-intro">
        <span className="tag-purple-small">Interactive Blueprint Studio</span>
        <h2>Architect Your Campaign Strategy</h2>
        <p className="section-intro-desc">
          Configure your core objective, media distribution channels, and regional scope to generate an autonomous agency blueprint.
        </p>
      </div>

      <div className="blueprint-studio-card">
        {/* Left Interactive Configuration Panel */}
        <div className="studio-config-column">
          {/* Step 1: Objective */}
          <div className="studio-control-group">
            <span className="studio-step-label">STEP 01 // CORE CAMPAIGN GOAL</span>
            <div className="studio-options-grid">
              {OBJECTIVES.map((obj) => (
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
            <span className="studio-step-label">STEP 02 // MEDIA DISTRIBUTION CHANNELS</span>
            <div className="studio-channels-grid">
              {MEDIA_CHANNELS.map((ch) => {
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
            <span className="studio-step-label">STEP 03 // GEOGRAPHIC & MARKET SCOPE</span>
            <div className="studio-regions-row">
              {REGIONS.map((reg) => (
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
              <span className="manifest-code">OMS_BLUEPRINT_CONFIG</span>
              <span className="manifest-status">
                <span className="live-dot" /> SQUAD READY
              </span>
            </div>
            <h3 className="manifest-title">{activeObj.label}</h3>
            <span className="manifest-region-tag">Target Scope: {activeReg.label}</span>
          </div>

          <div className="manifest-body-card">
            <div className="manifest-squad-row">
              <span className="squad-label">ASSIGNED AGENT SQUAD:</span>
              <span className="squad-value">{activeObj.squad}</span>
            </div>

            <div className="manifest-deliverables-block">
              <span className="deliv-title">ORCHESTRATED DELIVERABLES & PHASES:</span>
              <ul className="deliv-list">
                <li>
                  <span className="deliv-bullet">⚡</span>
                  <span>Deep Audience Behavioral Synthesis & Competitive Mapping</span>
                </li>
                <li>
                  <span className="deliv-bullet">⚡</span>
                  <span>High-Fidelity Visual Scripts & Multi-Format Creative Production</span>
                </li>
                <li>
                  <span className="deliv-bullet">⚡</span>
                  <span>Cross-Channel Synchronized Placement ({selectedChannels.length} Media Channels Selected)</span>
                </li>
                <li>
                  <span className="deliv-bullet">⚡</span>
                  <span>Closed-Loop Attribution & Full-Funnel Executive Dashboard</span>
                </li>
              </ul>
            </div>

            <div className="manifest-cta-box">
              <Link to="/contact" className="btn-manifest-deploy">
                Initiate Brief with this Blueprint &rarr;
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
