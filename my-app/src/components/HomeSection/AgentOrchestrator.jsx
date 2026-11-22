import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { AGENT_FLEET } from '../../data/agentData';

const ORCHESTRATOR_STRINGS = {
  ar: {
    tag: 'خدماتنا الاستراتيجية',
    title: 'كيف نحقق لعلامتك التجارية أقصى عائد وتأثير؟',
    desc: 'فرق عمل متخصصة تعمل بتناغم وتكامل في أبحاث السوق، والإنتاج الإبداعي، وإعلانات الطرق، والتسويق الرقمي.',
    liveActive: 'فريق العمل في وضع التشغيل الكامل',
    statusLabel: 'حالة الخدمة',
    statusValue: 'متاح للتعاقد فوراً',
    whatDeliver: 'أبرز مخرجات الخدمة:',
    startWith: 'ابدأ حملتك مع هذا القطاع ←',
    seeHow: '⚡ محاكاة دورة العمل',
    processing: 'جاري محاكاة سير العمل...',
    workflowLabel: 'سير العمل التنفيذي:',
    briefLabel: 'ملخص متطلبات العميل:',
    deliverableLabel: 'المخرجات النهائية للمشروع:',
    stepPrefix: 'المرحلة'
  },
  en: {
    tag: 'Our Services',
    title: 'How We Deliver Results for Your Brand',
    desc: 'Specialized squads working across market research, creative production, media placement, and campaign performance — all focused on achieving your business goals.',
    liveActive: 'LIVE STRATEGIC EXECUTION ACTIVE',
    statusLabel: 'SERVICE STATUS',
    statusValue: 'AVAILABLE NOW',
    whatDeliver: 'What We Deliver:',
    startWith: 'Get Started with',
    seeHow: '⚡ See How It Works',
    processing: 'Processing...',
    workflowLabel: 'TEAM WORKFLOW:',
    briefLabel: 'CLIENT BRIEF RECEIVED:',
    deliverableLabel: 'DELIVERABLE:',
    stepPrefix: 'STEP'
  },
  fr: {
    tag: 'Nos Services',
    title: 'Comment Nous Obtenons des Résultats pour Votre Marque',
    desc: 'Des équipes spécialisées intervenant en synergie sur l’étude de marché, la création visuelle, l’affichage et la performance média.',
    liveActive: 'EXÉCUTION STRATÉGIQUE ACTIVE',
    statusLabel: 'STATUT DE SERVICE',
    statusValue: 'DISPONIBLE IMMÉDIATEMENT',
    whatDeliver: 'Nos Livrables :',
    startWith: 'Démarrer avec',
    seeHow: '⚡ Voir la Méthode en Action',
    processing: 'Simulation en cours...',
    workflowLabel: 'FLUX DE TRAVAIL DE L’ÉQUIPE :',
    briefLabel: 'BRIEF CLIENT REÇU :',
    deliverableLabel: 'LIVRABLE FINAL :',
    stepPrefix: 'ÉTAPE'
  }
};

export default function AgentOrchestrator() {
  const { language } = useLanguage();
  const t = ORCHESTRATOR_STRINGS[language] || ORCHESTRATOR_STRINGS.en;

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
        <span className="tag-purple-small">{t.tag}</span>
        <h2>{t.title}</h2>
        <p className="section-intro-desc">
          {t.desc}
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
              <span className="live-dot" /> {t.liveActive}
            </span>
            <span className="agent-version-tag">{activeAgent.version}</span>
          </div>

          <div className="agent-match-score">
            <span className="match-label">{t.statusLabel}</span>
            <span className="match-value">{t.statusValue}</span>
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
              <span className="caps-title">{t.whatDeliver}</span>
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
                {language === 'ar' ? `${t.startWith} (${activeAgent.code})` : `${t.startWith} ${activeAgent.code} →`}
              </Link>
              <button
                type="button"
                className="btn-agent-simulate"
                onClick={handleRunSimulation}
                disabled={isSimulating}
              >
                {isSimulating ? t.processing : t.seeHow}
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
                  <span className="console-prompt-label">{t.briefLabel}</span>
                  <p className="console-prompt-text">"{activeAgent.liveSimulation.inputPrompt}"</p>
                </div>

                <div className="console-divider" />

                <div className="console-logs-stream">
                  <span className="console-stream-label">{t.workflowLabel}</span>
                  
                  {activeAgent.liveSimulation.neuralExecution.map((log, index) => {
                    const isVisible = simStep === 0 || simStep > index;
                    return (
                      <div
                        key={index}
                        className={`console-log-row ${isVisible ? 'is-visible' : 'is-pending'}`}
                      >
                        <span className="log-timestamp">[{t.stepPrefix} {index + 1}]</span>
                        <span className="log-text">{log}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Simulated Synthesis Outcome */}
                <div className="console-outcome-badge">
                  <div className="outcome-icon" aria-hidden="true">✓</div>
                  <div className="outcome-info">
                    <span className="outcome-label">{t.deliverableLabel}</span>
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




