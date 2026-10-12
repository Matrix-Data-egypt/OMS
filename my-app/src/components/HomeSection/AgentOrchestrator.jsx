import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { AGENT_FLEET } from '../../data/agentData';

export default function AgentOrchestrator() {
  const [selectedAgentId, setSelectedAgentId] = useState(AGENT_FLEET[0].id);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simStep, setSimStep] = useState(0);

  const activeAgent = AGENT_FLEET.find((a) => a.id === selectedAgentId) || AGENT_FLEET[0];

  const handleRunSimulation = () => {
    setIsSimulating(true);
    setSimStep(1);
    const t1 = setTimeout(() => setSimStep(2), 700);
    const t2 = setTimeout(() => setSimStep(3), 1500);
    const t3 = setTimeout(() => {
      setSimStep(4);
      setIsSimulating(false);
    }, 2300);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  };

  return (
    <section className="agent-orchestrator-section" aria-label="Our Core Services">
      <div className="section-intro">
        <span className="tag-purple-small">Our Services</span>
        <h2>How We Deliver Results for Your Brand</h2>
        <p className="section-intro-desc">
          Specialized teams working across market research, creative production, media placement, and campaign performance — all focused on achieving your business goals.
        </p>
      </div>

      {/* Agents Selector Tabs */}
      <div className="agent-selector-nav" role="tablist" aria-label="Select Service Area">
        {AGENT_FLEET.map((agent) => {
          const isSelected = agent.id === activeAgent.id;
          return (
            <button
              key={agent.id}
              role="tab"
              aria-selected={isSelected}
              className={`agent-nav-tab ${isSelected ? 'is-active' : ''}`}
              onClick={() => {
                setSelectedAgentId(agent.id);
                setSimStep(0);
                setIsSimulating(false);
              }}
            >
              <div className="agent-nav-icon-badge" style={{ background: agent.avatarGradient }}>
                <span>{agent.code.slice(0, 2)}</span>
              </div>
              <div className="agent-nav-info">
                <span className="agent-nav-code">{agent.code}</span>
                <span className="agent-nav-name">{agent.name}</span>
              </div>
              {isSelected && <div className="agent-active-glow-bar" />}
            </button>
          );
        })}
      </div>

      {/* Interactive Agent Command Center Display */}
      <div className="agent-display-card">
        {/* Card Header */}
        <div className="agent-display-header">
          <div className="agent-meta-badge-group">
            <span className="agent-code-tag">{activeAgent.code}</span>
            <span className="agent-live-pill">
              <span className="live-dot" /> LIVE ENGINE ACTIVE
            </span>
            <span className="agent-version-tag">{activeAgent.version}</span>
          </div>

          <div className="agent-match-score">
            <span className="match-label">SERVICE STATUS</span>
            <span className="match-value">AVAILABLE NOW</span>
          </div>
        </div>

        {/* Card Core Content */}
        <div className="agent-display-body">
          <div className="agent-details-column">
            <h3 className="agent-headline">{activeAgent.name}</h3>
            <span className="agent-subtag">{activeAgent.tag}</span>
            <p className="agent-summary-text">{activeAgent.summary}</p>

            {/* Service Highlights */}
            <div className="agent-kpi-matrix">
              {activeAgent.badges.map((badge, idx) => (
                <div key={idx} className="kpi-mini-card">
                  <span className="kpi-val">{badge.val}</span>
                  <span className="kpi-label">{badge.label}</span>
                </div>
              ))}
            </div>

            {/* What We Deliver */}
            <div className="agent-capabilities-list">
              <span className="caps-title">What We Deliver:</span>
              <ul>
                {activeAgent.capabilities.map((cap, i) => (
                  <li key={i}>
                    <span className="cap-bullet-icon" aria-hidden="true">⚡</span>
                    <span>{cap}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="agent-card-actions">
              <Link to="/contact" className="btn-agent-deploy">
                Get Started with {activeAgent.code} &rarr;
              </Link>
              <button
                type="button"
                className="btn-agent-simulate"
                onClick={handleRunSimulation}
                disabled={isSimulating}
              >
                {isSimulating ? 'Processing...' : '⚡ See How It Works'}
              </button>
            </div>
          </div>

          {/* Interactive Agent Telemetry Console / Terminal */}
          <div className="agent-console-column">
            <div className="console-window">
              <div className="console-top-bar">
                <div className="console-lights">
                  <span className="light-dot red" />
                  <span className="light-dot yellow" />
                  <span className="light-dot green" />
                </div>
                <span className="console-title">oms_agency // {activeAgent.code.toLowerCase()}_workflow</span>
                <span className="console-status-text">LIVE PROCESS</span>
              </div>

              <div className="console-body">
                <div className="console-prompt-block">
                  <span className="console-prompt-label">CLIENT BRIEF RECEIVED:</span>
                  <p className="console-prompt-text">"{activeAgent.liveSimulation.inputPrompt}"</p>
                </div>

                <div className="console-divider" />

                <div className="console-logs-stream">
                  <span className="console-stream-label">TEAM WORKFLOW:</span>
                  
                  {activeAgent.liveSimulation.neuralExecution.map((log, index) => {
                    const isVisible = simStep === 0 || simStep > index;
                    return (
                      <div
                        key={index}
                        className={`console-log-row ${isVisible ? 'is-visible' : 'is-pending'}`}
                      >
                        <span className="log-timestamp">[STEP {index + 1}]</span>
                        <span className="log-text">{log}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Simulated Synthesis Outcome */}
                <div className="console-outcome-badge">
                  <div className="outcome-icon" aria-hidden="true">✓</div>
                  <div className="outcome-info">
                    <span className="outcome-label">DELIVERABLE:</span>
                    <span className="outcome-metric">{activeAgent.liveSimulation.outputHighlight}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
