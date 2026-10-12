/**
 * OMS Advertising Platform Configuration Data
 * Generic, client-friendly content with no arbitrary numbers.
 */

export const CORE_PILLARS = [
  { id: 'pillar-1', title: 'Strategic Intelligence', desc: 'In-depth market research & audience insight discovery' },
  { id: 'pillar-2', title: 'Creative Excellence', desc: 'Premium visual production & compelling storytelling' },
  { id: 'pillar-3', title: 'Omni-Channel Reach', desc: 'TV, outdoor billboards, digital & experiential media' },
  { id: 'pillar-4', title: 'Measurable Results', desc: 'Transparent reporting connecting media to real outcomes' },
];

export const AGENT_FLEET = [
  {
    id: 'agent-aura',
    code: 'RESEARCH',
    name: 'Market Intelligence & Research',
    tag: 'Deep Market Research & Consumer Insight',
    status: 'ACTIVE',
    version: 'Strategic Edition',
    avatarGradient: 'linear-gradient(135deg, #cc1a1a 0%, #f59e0b 100%)',
    summary: 'We continuously monitor market trends and consumer behavior across Egypt & MENA. Our research uncovers high-value audience clusters, evolving preferences, and market opportunities before your competition.',
    badges: [
      { label: 'Audience Analysis', val: 'In-Depth' },
      { label: 'Competitor Tracking', val: 'Continuous' },
      { label: 'Market Scanning', val: 'Ongoing' },
    ],
    capabilities: [
      'Competitive landscape audits and brand positioning analysis',
      'Consumer behavioral research and trend mapping',
      'Demographic and psychographic audience segmentation',
      'Market opportunity identification and gap analysis'
    ],
    liveSimulation: {
      inputPrompt: 'Analyze consumer sentiment & identify high-value market opportunities...',
      neuralExecution: [
        '[RESEARCH]: Gathering market data, consumer insights, and competitor positioning...',
        '[RESEARCH]: Identified key audience segments and untapped market opportunities...',
        '[RESEARCH]: Strategic audience blueprint formulated. Aligning with creative team.'
      ],
      outputHighlight: 'Strategic Market Blueprint Delivered'
    }
  },
  {
    id: 'agent-crea',
    code: 'CREATIVE',
    name: 'Creative Production & Storytelling',
    tag: 'Premium Visual Production & Brand Narrative',
    status: 'ACTIVE',
    version: 'Studio Edition',
    avatarGradient: 'linear-gradient(135deg, #7c3aed 0%, #ec4899 100%)',
    summary: 'We craft compelling campaign narratives, TV broadcast concepts, outdoor billboard visuals, and multi-format creative assets that resonate with your target audience and elevate your brand.',
    badges: [
      { label: 'Visual Quality', val: 'Premium Grade' },
      { label: 'Format Reach', val: 'Omni-Channel' },
      { label: 'Cultural Fit', val: 'Locally Relevant' },
    ],
    capabilities: [
      'TV commercial concepts, scripts & full production management',
      'High-impact outdoor billboard & digital screen design',
      'Social media content crafted for maximum platform engagement',
      'Brand storytelling rooted in authentic cultural relevance'
    ],
    liveSimulation: {
      inputPrompt: 'Develop a compelling brand narrative and visual campaign concept...',
      neuralExecution: [
        '[CREATIVE]: Analyzing brand identity, market positioning, and audience preferences...',
        '[CREATIVE]: Building campaign narrative: Brand Story, Core Message, Visual Direction...',
        '[CREATIVE]: Creative assets formatted for TV broadcast, outdoor, and digital platforms.'
      ],
      outputHighlight: 'Premium Campaign Creative Concepts Ready'
    }
  },
  {
    id: 'agent-bid',
    code: 'MEDIA',
    name: 'Media Planning & Buying',
    tag: 'Strategic Media Placement & Budget Optimization',
    status: 'ACTIVE',
    version: 'Placement Engine',
    avatarGradient: 'linear-gradient(135deg, #0ea5e9 0%, #3b82f6 100%)',
    summary: 'We plan and execute media placement across TV networks, outdoor screens, digital platforms, and print media — ensuring your message reaches the right audience at the right moment.',
    badges: [
      { label: 'Media Coverage', val: 'Full Spectrum' },
      { label: 'Budget Control', val: 'Optimized' },
      { label: 'Placement Quality', val: 'Prime Tier' },
    ],
    capabilities: [
      'Strategic media mix planning across offline and online channels',
      'TV network negotiations and prime-time slot procurement',
      'Digital platform management across Meta, Google & TikTok',
      'Outdoor billboard and transit media placement coordination'
    ],
    liveSimulation: {
      inputPrompt: 'Plan optimal media distribution to maximize campaign reach and impact...',
      neuralExecution: [
        '[MEDIA]: Assessing available media inventory and audience reach data...',
        '[MEDIA]: Allocating media budget across prime TV slots and high-traffic outdoor locations...',
        '[MEDIA]: Media schedule confirmed for maximum audience exposure during peak windows.'
      ],
      outputHighlight: 'Optimized Media Distribution Plan Activated'
    }
  },
  {
    id: 'agent-nexus',
    code: 'RESULTS',
    name: 'Performance Tracking & Reporting',
    tag: 'Transparent Campaign Measurement & Insights',
    status: 'ACTIVE',
    version: 'Analytics Core',
    avatarGradient: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)',
    summary: 'We provide clear, transparent reporting on your campaign\'s performance. From TV reach to digital conversions and outdoor impressions, our reports give you a complete picture of your investment.',
    badges: [
      { label: 'Reporting Style', val: 'Clear & Concise' },
      { label: 'Data Access', val: 'Real Time' },
      { label: 'Report Format', val: 'Executive Ready' },
    ],
    capabilities: [
      'Comprehensive cross-channel campaign performance reporting',
      'Audience reach, frequency, and engagement analysis',
      'Brand awareness lift and market sentiment tracking',
      'Transparent ROI documentation and strategic recommendations'
    ],
    liveSimulation: {
      inputPrompt: 'Compile campaign performance data and generate executive insights report...',
      neuralExecution: [
        '[RESULTS]: Aggregating performance data across all active media channels...',
        '[RESULTS]: Measuring brand reach, engagement, and campaign effectiveness metrics...',
        '[RESULTS]: Comprehensive performance report prepared for executive review.'
      ],
      outputHighlight: 'Full Campaign Performance Report Delivered'
    }
  }
];

export const CAMPAIGN_OBJECTIVES = [
  {
    id: "obj-1",
    tag: "Brand Building",
    title: "Brand Awareness & Market Presence",
    desc: "Establish your brand as a recognized name in your market using TV, outdoor billboards, and consistent digital presence across all key touchpoints.",
    agentPill: "RESEARCH + CREATIVE",
    strategicBenefit: "Strong Brand Recall"
  },
  {
    id: "obj-2",
    tag: "Product Launch",
    title: "New Product or Service Launch",
    desc: "Create powerful market impact for your new offering through a coordinated multi-channel campaign that builds excitement and drives rapid adoption.",
    agentPill: "CREATIVE + MEDIA",
    strategicBenefit: "Fast Market Entry"
  },
  {
    id: "obj-3",
    tag: "Lead Generation",
    title: "Customer Acquisition & Lead Growth",
    desc: "Attract high-quality prospects and convert them into paying customers using targeted media strategies tailored to your ideal buyer profile.",
    agentPill: "RESEARCH + RESULTS",
    strategicBenefit: "Qualified Leads"
  },
  {
    id: "obj-4",
    tag: "TV & Broadcast",
    title: "Television & Radio Production",
    desc: "Premium quality TV commercials and radio spots crafted to tell your brand story powerfully and professionally on Egypt's leading broadcast networks.",
    agentPill: "CREATIVE STUDIO",
    strategicBenefit: "Premium Brand Image"
  },
  {
    id: "obj-5",
    tag: "Sales Growth",
    title: "Revenue & Sales Acceleration",
    desc: "Drive measurable sales growth through integrated campaigns combining awareness-building media with performance-focused digital execution.",
    agentPill: "FULL TEAM",
    strategicBenefit: "Revenue Growth"
  },
  {
    id: "obj-6",
    tag: "Events & BTL",
    title: "Activations & On-Ground Experiences",
    desc: "Create memorable brand experiences through point-of-sale displays, experiential activations, and events that connect directly with your customers.",
    agentPill: "EXPERIENTIAL TEAM",
    strategicBenefit: "Direct Engagement"
  }
];

export const TIMELINE_STEPS = [
  {
    step: 1,
    title: 'Discovery & Market Research',
    phase: 'PHASE 01 // DISCOVERY',
    desc: 'We begin by deeply understanding your business, target audience, competitive landscape, and market opportunities to build a solid strategic foundation.'
  },
  {
    step: 2,
    title: 'Strategy & Campaign Architecture',
    phase: 'PHASE 02 // STRATEGY',
    desc: 'Our team crafts a tailored campaign strategy that defines your messaging, media mix, budget allocation, and timeline to achieve your specific business goals.'
  },
  {
    step: 3,
    title: 'Creative Development & Production',
    phase: 'PHASE 03 // PRODUCTION',
    desc: 'Our creative team produces premium campaign assets including TV commercials, outdoor visuals, digital content, and all materials needed across your chosen channels.'
  },
  {
    step: 4,
    title: 'Media Placement & Campaign Launch',
    phase: 'PHASE 04 // LAUNCH',
    desc: 'We execute your campaign across all planned channels simultaneously — TV networks, outdoor locations, and digital platforms — with precise timing and coordination.'
  },
  {
    step: 5,
    title: 'Performance Review & Optimization',
    phase: 'PHASE 05 // GROWTH',
    desc: 'We continuously monitor campaign performance, share transparent reports with your team, and make strategic adjustments to maximize your results and investment return.'
  }
];
