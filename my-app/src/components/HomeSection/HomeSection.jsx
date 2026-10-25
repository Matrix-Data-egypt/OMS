import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { PAGE_TRANSLATIONS } from '../../context/translationsData';
import { api, mediaUrl } from '../../api';
import { DEFAULT_CLIENTS } from '../../data/clientsData';
import {
  CAMPAIGN_OBJECTIVES,
  TIMELINE_STEPS
} from '../../data/agentData';
import './HomeSection.css';

// Helper to extract YouTube video ID
function getYouTubeId(url) {
  if (!url) return null;
  const match = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/i
  );
  return match ? match[1] : null;
}

// Helper to get high-quality video thumbnail
function getVideoThumbnail(item) {
  if (item.thumbnail && item.thumbnail.trim()) {
    return item.thumbnail.startsWith('http')
      ? item.thumbnail
      : mediaUrl(item.thumbnail);
  }
  const ytId = getYouTubeId(item.youtubeUrl || item.embedUrl);
  if (ytId) {
    return `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`;
  }
  return '';
}

const FALLBACK_TV = [
  {
    id: 'tv-fb-1',
    brand: 'NOVA Tools',
    title: 'NOVA Tools — Heavy Power Commercial',
    category: 'Industrial',
    youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    embedUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    thumbnail: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
    type: 'youtube',
    desc: 'Cinematic brand commercial showcasing precision heavy machinery and engineering excellence across industrial sectors.'
  },
  {
    id: 'tv-fb-2',
    brand: 'Palm Hills',
    title: 'Palm Hills — Luxury Living Campaign',
    category: 'Real Estate',
    youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    embedUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    thumbnail: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80',
    type: 'youtube',
    desc: 'High-end TV spot broadcasted on national prime-time networks capturing upscale lifestyle and architectural mastery.'
  },
  {
    id: 'tv-fb-3',
    brand: 'Aroma Cosmetics',
    title: 'Aroma — Essence of Luxury Film',
    category: 'Cosmetics',
    youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    embedUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    thumbnail: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80',
    type: 'youtube',
    desc: 'Artistic beauty film featuring emotive color grading, delicate typography, and high-frequency digital engagement.'
  }
];

const FALLBACK_OUTDOOR = [
  {
    id: 'fb-1',
    companyName: 'Palm Hills Developments',
    description: 'Prime Mega Unipole campaign along the Ring Road & 26th of July Corridor, ensuring unmatched visual dominance and high-frequency reach.',
    image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80',
    location: 'Ring Road & 26th July Corridor'
  },
  {
    id: 'fb-2',
    companyName: 'Kabbani Furniture',
    description: 'Dynamic digital billboard network across New Cairo and Sheikh Zayed capturing prime automotive commuter dwell time.',
    image: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1200&q=80',
    location: 'North 90th & Zayed Artery'
  },
  {
    id: 'fb-3',
    companyName: 'NOVA Tools & Industrial',
    description: 'High-impact highway bridge banners commanding high-speed visibility across inter-city trade and logistical routes.',
    image: 'https://images.unsplash.com/photo-1508873696983-2df5293cb32f?auto=format&fit=crop&w=1200&q=80',
    location: 'Cairo-Alex Desert Highway'
  }
];

const FALLBACK_POSS = [
  {
    id: 'poss-fb-1',
    companyName: 'Aroma Cosmetics',
    description: 'Custom luxury Point of Sale displays and branded retail counters engineered for flagship beauty outlets nationwide.',
    image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1200&q=80',
    type: 'Luxury Counter & Gondola'
  },
  {
    id: 'poss-fb-2',
    companyName: 'NOVA Tools',
    description: 'Heavy-duty modular industrial display units built for hardware mega-stores and high-traffic regional distribution centers.',
    image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80',
    type: 'Heavy Modular Stand'
  },
  {
    id: 'poss-fb-3',
    companyName: 'Kabbani Home & Decor',
    description: 'Interactive experiential shop-in-shop display pods showcasing interior textile fabrics and luxury furniture accents.',
    image: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=80',
    type: 'Shop-in-Shop Pod'
  }
];

const LOCALIZED_PREVIEWS = {
  ar: {
    clientsBadge: 'شركاء النجاح • CLIENTS & PARTNERS',
    clientsTitle: 'علامات تجارية رائدة تثق في OMS',
    clientsDesc: 'شراكات استراتيجية مع كبرى الشركات والمؤسسات الإقليمية لتحقيق أقصى تأثير تسويقي وريادة السوق.',
    clientsViewAll: 'استعرض جميع العملاء والشركاء ←',
    otherClients: 'باقي العملاء',
    viewAllShort: 'استعراض الكل ↗',

    tvBadge: 'الإنتاج التلفزيوني والسينمائي • PRODUCTION TV',
    tvTitle: 'إعلانات تجارية بمعايير سينمائية عالمية',
    tvDesc: 'حيث تلتقي الفكرة الإبداعية الجريئة بالإخراج السينمائي الفاخر لبث رسالة علامتك بأعلى جودة على كبرى القنوات.',
    tvViewAll: 'استكشف مكتبة الإنتاج كاملة ←',
    playHint: 'مشاهدة الإعلان',
    otherTvTitle: 'باقي الإعلانات التلفزيونية',
    otherTvDesc: 'استكشف الأرشيف الكامل للإعلانات والإنتاج السينمائي للعلامات التجارية.',

    outdoorBadge: 'إعلانات الطرق واللوحات العملاقة • OUTDOOR & OOH',
    outdoorTitle: 'حضور استثنائي وسيطرة بصرية على أهم المحاور',
    outdoorDesc: 'شاشات رقمية DOOH، ولوحات يونيبول عملاقة، ولافتات كباري في أكثر المواقع حيوية بالقاهرة والمحافظات.',
    outdoorViewAll: 'استكشف شبكة الطرق بالكامل ←',
    enlargeHint: 'تكبير المعاينة',
    otherOutdoorTitle: 'باقي شبكات إعلانات الطرق',
    otherOutdoorDesc: 'تصفح خريطة المواقع الاستراتيجية واللوحات والشاشات على أهم المحاور.',

    possBadge: 'منصات العرض ونقاط البيع • POSS & RETAIL',
    possTitle: 'تصميم وهندسة وحدات عرض تحول الزوار إلى مشترين',
    possDesc: 'وحدات عرض أرضية FSDU فاخرة، أكشاك تجارية تفاعلية، ومنصات نقاط بيع مخصصة لأقوى العلامات التجارية.',
    possViewAll: 'استكشف معرض نقاط البيع POSS ←',
    otherPossTitle: 'باقي وحدات ومنصات العرض',
    otherPossDesc: 'اطلع على كافة حلول ونماذج نقاط البيع والأكشاك المخصصة للمتاجر.',
    
    closeModal: 'إغلاق',
    watchYouTube: 'مشاهدة على YouTube ↗',
    exploreSection: 'فتح الصفحة كاملة ←'
  },
  en: {
    clientsBadge: 'CLIENTS & PARTNERS',
    clientsTitle: 'Leading Brands That Trust OMS',
    clientsDesc: 'Strategic partnerships with top regional and global market leaders driving market dominance.',
    clientsViewAll: 'View All Clients & Partners ←',
    otherClients: 'Other Brands',
    viewAllShort: 'View All ↗',

    tvBadge: 'CINEMATIC TV & VIDEO PRODUCTION',
    tvTitle: 'Commercial Fire Meets Cinematic Discipline',
    tvDesc: 'Compelling brand narratives and high-intent commercial films broadcasted across major television networks.',
    tvViewAll: 'Explore Full TV Production Library ←',
    playHint: 'Play Commercial',
    otherTvTitle: 'Other TV Commercials',
    otherTvDesc: 'Explore our full creative portfolio of commercial films and media spots.',

    outdoorBadge: 'OUTDOOR & OOH NETWORK',
    outdoorTitle: 'Visual Dominance Across Key Arterial Corridors',
    outdoorDesc: 'High-frequency mega unipoles, digital DOOH screens, and highway bridges capturing maximum commuter attention.',
    outdoorViewAll: 'Explore Full Outdoor Network ←',
    enlargeHint: 'Enlarge Preview',
    otherOutdoorTitle: 'Other Outdoor Locations',
    otherOutdoorDesc: 'Browse our full network of strategic mega billboards and digital DOOH displays.',

    possBadge: 'IN-STORE POS & RETAIL BRANDING',
    possTitle: 'Converting In-Store Footfall Into Decisive Sales',
    possDesc: 'Precision-manufactured luxury retail displays, gondolas, and experiential retail pods engineered for maximum retention.',
    possViewAll: 'Discover All POSS Retail Solutions ←',
    otherPossTitle: 'Other POSS Displays',
    otherPossDesc: 'Discover our comprehensive portfolio of custom kiosks and point-of-sale displays.',

    closeModal: 'Close',
    watchYouTube: 'Watch on YouTube ↗',
    exploreSection: 'Explore Full Page ←'
  },
  fr: {
    clientsBadge: 'PARTENAIRES & CLIENTS',
    clientsTitle: 'Les Grandes Marques Qui Font Confiance à OMS',
    clientsDesc: 'Partenariats stratégiques avec des leaders régionaux et mondiaux pour maximiser l’impact de marque.',
    clientsViewAll: 'Découvrir Tous Nos Clients ←',
    otherClients: 'Autres Marques',
    viewAllShort: 'Voir Tout ↗',

    tvBadge: 'PRODUCTION TÉLÉVISÉE & CINÉMA',
    tvTitle: 'Excellence Cinématographique & Impact Commercial',
    tvDesc: 'Récits visuels captivants et réalisation cinématographique de pointe diffusés sur les plus grands réseaux.',
    tvViewAll: 'Explorer Toute la Production TV ←',
    playHint: 'Lire la Vidéo',
    otherTvTitle: 'Autres Spots Télévisés',
    otherTvDesc: 'Découvrez l’intégralité de nos réalisations audiovisuelles et films de marque.',

    outdoorBadge: 'AFFICHAGE EXTÉRIEUR & DOOH',
    outdoorTitle: 'Présence Dominante sur les Axes Stratégiques',
    outdoorDesc: 'Panneaux géants, écrans digitaux DOOH et affichage urbain captivant l’attention des millions d’usagers.',
    outdoorViewAll: 'Explorer le Réseau Affichage Complet ←',
    enlargeHint: 'Agrandir',
    otherOutdoorTitle: 'Autres Emplacements OOH',
    otherOutdoorDesc: 'Consultez l’ensemble de nos panneaux géants et écrans digitaux urbains.',

    possBadge: 'PLV & MERCHANDISING EN MAGASIN',
    possTitle: 'Transformer le Flux de Visiteurs en Actes d’Achat',
    possDesc: 'Conception et fabrication de présentoirs de luxe et stands modulaires pour sublimer votre présence en magasin.',
    possViewAll: 'Découvrir Toutes les Réalisations POSS ←',
    otherPossTitle: 'Autres Présentoirs PLV',
    otherPossDesc: 'Explorez l’ensemble de nos présentoirs de vente et kiosques sur mesure.',

    closeModal: 'Fermer',
    watchYouTube: 'Voir sur YouTube ↗',
    exploreSection: 'Voir la Page Complète ←'
  }
};

const LOCALIZED_TIMELINE = {
  ar: [
    {
      step: 1,
      title: 'الاستكشاف وبحوث السوق',
      phase: 'مرحلة الاستكشاف والبحوث السوقية',
      desc: 'نبدأ بفهم عميق لنموذج عملك، جمهورك المستهدف، المشهد التنافسي، والفرص السوقية لبناء أساس استراتيجي متين.'
    },
    {
      step: 2,
      title: 'الاستراتيجية وهندسة الحملة',
      phase: 'مرحلة الاستراتيجية وهندسة الحملة',
      desc: 'يصمم فريقنا استراتيجية حملة مخصصة تحدد الرسائل الرئيسية، مزيج القنوات الإعلامية، وتوزيع الميزانية لتحقيق أهدافك التجارية بدقة.'
    },
    {
      step: 3,
      title: 'الإنتاج الإبداعي والتنفيذ',
      phase: 'مرحلة الإنتاج الإبداعي والتنفيذ',
      desc: 'نحول الاستراتيجية إلى واقع ملموس: إعلانات تلفزيونية سينمائية، تصاميم شاشات الطرق، وحدات عرض المتاجر، ومحتوى رقمي عالي التأثير.'
    },
    {
      step: 4,
      title: 'الإطلاق والتحسين والنتائج',
      phase: 'مرحلة الإطلاق والنتائج والنمو',
      desc: 'إطلاق الحملة عبر كافة القنوات مع رصد مستمر لمعدلات التفاعل ومؤشرات الأداء لضمان تحقيق أعلى عائد على الاستثمار.'
    }
  ],
  fr: [
    {
      step: 1,
      title: 'Découverte & Étude de Marché',
      phase: 'Phase : Découverte & Étude',
      desc: 'Compréhension approfondie de vos activités, de votre public cible et de la concurrence pour bâtir une base stratégique solide.'
    },
    {
      step: 2,
      title: 'Stratégie & Architecture de Campagne',
      phase: 'Phase : Stratégie & Architecture',
      desc: 'Notre équipe élabore une stratégie sur mesure définissant vos messages clés, le mix média et l\'allocation budgétaire optimale.'
    },
    {
      step: 3,
      title: 'Production Créative & Réalisation',
      phase: 'Phase : Production Créative',
      desc: 'Nous donnons vie à votre stratégie : spots TV cinématographiques, affichage urbain spectaculaire, PLV en magasin et contenus digitaux percutants.'
    },
    {
      step: 4,
      title: 'Déploiement & Optimisation des Résultats',
      phase: 'Phase : Déploiement & Résultats',
      desc: 'Lancement multicanal coordonné avec suivi rigoureux des KPI pour maximiser votre notoriété et votre retour sur investissement.'
    }
  ]
};

const LOCALIZED_PILLARS = {
  ar: [
    { id: 'p1', title: 'الرؤية الاستراتيجية', desc: 'دراسات سوق وأبحاث تحليلية متعمقة' },
    { id: 'p2', title: 'التميز الإبداعي', desc: 'إنتاج إعلاني سينمائي ومحتوى مؤثر' },
    { id: 'p3', title: 'الانتشار الشامل', desc: 'إعلانات التلفزيون وشاشات الطرق الكبرى' },
    { id: 'p4', title: 'قيادة السوق والنمو', desc: 'تحقيق أثر تجاري ملموس ومستدام' },
  ],
  en: [
    { id: 'p1', title: 'Strategic Vision', desc: 'Deep market intelligence & audience research' },
    { id: 'p2', title: 'Creative Excellence', desc: 'Cinematic production & compelling storytelling' },
    { id: 'p3', title: 'Omni-Channel Media', desc: 'Prime TV broadcasts & iconic outdoor billboards' },
    { id: 'p4', title: 'Market Leadership', desc: 'Measurable commercial impact & brand authority' },
  ],
  fr: [
    { id: 'p1', title: 'Vision Stratégique', desc: 'Études de marché et analyse des cibles' },
    { id: 'p2', title: 'Excellence Créative', desc: 'Production cinématographique et storytelling' },
    { id: 'p3', title: 'Diffusion 360°', desc: 'Télévision, affichage urbain et digital' },
    { id: 'p4', title: 'Croissance Décisive', desc: 'Impact commercial mesurable et pérenne' },
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

/* Animated service names scrolling in hero ticker */
const HERO_SERVICES = {
  ar: ['الإنتاج التلفزيوني', 'إعلانات الطرق', 'نقاط البيع POSS', 'التسويق الرقمي', 'العلاقات العامة', 'الهوية البصرية'],
  en: ['TV Production', 'Outdoor & OOH', 'POSS & Retail', 'Digital Marketing', 'PR & Events', 'Brand Identity'],
  fr: ['Production TV', 'Affichage OOH', 'PLV & Retail', 'Marketing Digital', 'Relations Publiques', 'Identité de Marque'],
};

export default function HomeSection() {
  const [activeStep, setActiveStep] = useState(1);
  const { t, language } = useLanguage();
  const TH = PAGE_TRANSLATIONS[language]?.home || PAGE_TRANSLATIONS.en.home;
  const P = LOCALIZED_PREVIEWS[language] || LOCALIZED_PREVIEWS.en;

  // State for dynamic content
  const [videos, setVideos] = useState([]);
  const [outdoor, setOutdoor] = useState([]);
  const [poss, setPoss] = useState([]);
  const [clients, setClients] = useState([]);

  // Modals state
  const [activeVideoModal, setActiveVideoModal] = useState(null);
  const [activeImageModal, setActiveImageModal] = useState(null);

  useEffect(() => {
    let cancelled = false;

    // Fetch Videos
    api('/api/videos')
      .then((data) => {
        if (!cancelled && Array.isArray(data) && data.length > 0) {
          setVideos(data.slice(0, 3));
        } else if (!cancelled) {
          setVideos(FALLBACK_TV);
        }
      })
      .catch(() => {
        if (!cancelled) setVideos(FALLBACK_TV);
      });

    // Fetch Outdoor
    api('/api/outdoor')
      .then((data) => {
        if (!cancelled && Array.isArray(data) && data.length > 0) {
          setOutdoor(data.slice(0, 3));
        } else if (!cancelled) {
          setOutdoor(FALLBACK_OUTDOOR);
        }
      })
      .catch(() => {
        if (!cancelled) setOutdoor(FALLBACK_OUTDOOR);
      });

    // Fetch POSS
    api('/api/poss')
      .then((data) => {
        if (!cancelled && Array.isArray(data) && data.length > 0) {
          setPoss(data.slice(0, 3));
        } else if (!cancelled) {
          setPoss(FALLBACK_POSS);
        }
      })
      .catch(() => {
        if (!cancelled) setPoss(FALLBACK_POSS);
      });

    // Fetch Clients
    api('/api/clients')
      .then((data) => {
        if (!cancelled && Array.isArray(data) && data.length > 0) {
          setClients(data);
        } else if (!cancelled) {
          setClients(DEFAULT_CLIENTS);
        }
      })
      .catch(() => {
        if (!cancelled) setClients(DEFAULT_CLIENTS);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // Close modals on ESC key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setActiveVideoModal(null);
        setActiveImageModal(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const currentTimelineSteps = LOCALIZED_TIMELINE[language] || TIMELINE_STEPS;
  const currentObjectives = LOCALIZED_OBJECTIVES[language] || CAMPAIGN_OBJECTIVES;
  const currentBullets = LOCALIZED_BULLETS[language] || LOCALIZED_BULLETS.en;
  const heroServices = HERO_SERVICES[language] || HERO_SERVICES.en;

  const activeTimelineObj = currentTimelineSteps.find((ts) => ts.step === activeStep) || currentTimelineSteps[0];

  const handleScrollToCampaign = (e) => {
    e.preventDefault();
    const elem = document.getElementById('home-tv-section');
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Curated client logos & moving marquee track
  const displayClients = clients.length > 0 ? clients : DEFAULT_CLIENTS;

  // Helper to build a seamless infinite loop track with 2 identical wide halves
  const buildInfiniteRow = (items) => {
    if (!items || items.length === 0) return [];
    let base = [...items];
    while (base.length < 16) {
      base = [...base, ...items];
    }
    return [...base, ...base];
  };

  const half = Math.max(1, Math.ceil(displayClients.length / 2));
  const row1 = displayClients.slice(0, half);
  const row2 = displayClients.slice(half);

  const homeTrack1 = buildInfiniteRow(row1);
  const homeTrack2 = buildInfiniteRow(row2);

  return (
    <main className="home-container">
      {/* Subtle Warm Agency Vignette */}
      <div className="home-agency-vignette" aria-hidden="true" />

      {/* Hero Banner Section */}
      <header className="home-hero-clean">
        <div
          className="hero-banner-bg"
          style={{ backgroundImage: `url(${process.env.PUBLIC_URL}/hero-banner.png)` }}
        >
          <div className="hero-clean-content overlay">

                      {/* Bold agency eyebrow */}
            <div className="hero-agency-eyebrow" aria-hidden="true">
              <span className="hero-eyebrow-line" />
              <span className="hero-eyebrow-text">
                {language === 'ar' ? 'وكالة التسويق الرائدة' : language === 'fr' ? 'Agence de Marketing de Référence' : 'Egypt\'s Leading Marketing Agency'}
              </span>
            </div>

            {/* Animated services ticker */}
            <div className="hero-services-ticker" aria-hidden="true">
              <div className="hero-ticker-track">
                {[...heroServices, ...heroServices].map((s, i) => (
                  <span key={i} className="hero-ticker-item">
                    <span className="hero-ticker-dot" />
                    {s}
                  </span>
                ))}
              </div>
            </div>

            <h1 className="hero-main-title-clean">
              {t('home.heroTitle1', 'Your Vision, Amplified')}<br />
              <span className="highlight-gold-clean">{t('home.heroTitle2', 'Across Every Channel & Screen.')}</span>
            </h1>

            <span className="hero-title-divider" aria-hidden="true" />

            <p className="hero-paragraph-clean">
              {t(
                'home.heroDesc',
                'From award-winning TV commercials and iconic outdoor billboards to high-performance digital campaigns — we bring your brand to life across Egypt and the MENA region.'
              )}
            </p>

            <div className="hero-buttons-clean">
              <Link to="/contact" className="btn-gold-action">
                {t('home.startCampaign', 'Start Your Campaign →')}
              </Link>
              <a
                href="#home-tv-section"
                onClick={handleScrollToCampaign}
                className="btn-outline-action"
              >
                {t('home.exploreServices', 'Explore Our Work ↓')}
              </a>
            </div>

            {/* Strategic Pillars Bar */}
            <div className="hero-pillars-bar" aria-label="Core Service Pillars">
              {(LOCALIZED_PILLARS[language] || LOCALIZED_PILLARS.en).map((pillar) => (
                <div key={pillar.id} className="pillar-pill">
                  <span className="pillar-title">{pillar.title}</span>
                  <span className="pillar-desc">{pillar.desc}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* ============================================================== */}
      {/* 1. CLIENTS SECTION (Moving Infinite Logo Marquee)               */}
      {/* ============================================================== */}
      <section className="home-clients-strip" aria-label="Clients & Partners">
        <div className="home-clients-header-row">
          <div>
            <span className="home-section-tag-gold">{P.clientsBadge}</span>
            <h2 className="home-clients-title">{P.clientsTitle}</h2>
          </div>
          <Link to="/clients" className="home-explore-link">
            {P.clientsViewAll}
          </Link>
        </div>

        {/* Full-width continuous moving marquee */}
        <div className="home-clients-marquee-wrapper" dir="ltr">
          {/* Row 1 - Smooth Left Motion */}
          {homeTrack1.length > 0 && (
            <div className="home-clients-marquee-track home-track-row-1">
              {homeTrack1.map((client, idx) => (
                <ClientLogoCard key={`ht1-${client.id || idx}-${idx}`} client={client} />
              ))}
            </div>
          )}

          {/* Row 2 - Smooth Right Motion */}
          {homeTrack2.length > 0 && (
            <div className="home-clients-marquee-track home-track-row-2">
              {homeTrack2.map((client, idx) => (
                <ClientLogoCard key={`ht2-${client.id || idx}-${idx}`} client={client} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ============================================================== */}
      {/* 2. PRODUCTION TV SECTION (3 كروت + كارت Other للإنتاج التلفزيوني) */}
      {/* ============================================================== */}
      <section id="home-tv-section" className="home-preview-section home-tv-spotlight" aria-label="Production TV Showcase">
        <div className="home-section-header-bar">
          <div>
            <span className="home-section-tag-red">{P.tvBadge}</span>
            <h2 className="home-section-heading">{P.tvTitle}</h2>
            <p className="home-section-sub">{P.tvDesc}</p>
          </div>
          <Link to="/production-tv" className="home-explore-btn">
            {P.tvViewAll}
          </Link>
        </div>

        <div className="home-tv-cards-grid">
          {(videos.length > 0 ? videos : FALLBACK_TV).map((item) => {
            const thumb = getVideoThumbnail(item);
            return (
              <article
                key={item.id}
                className="home-tv-card"
                onClick={() => setActiveVideoModal(item)}
                role="button"
                tabIndex={0}
              >
                <div className="home-tv-thumb-wrap">
                  {thumb ? (
                    <img src={thumb} alt={item.title} className="home-tv-thumb-img" loading="lazy" />
                  ) : item.fileUrl ? (
                    <video src={mediaUrl(item.fileUrl)} className="home-tv-thumb-img" muted />
                  ) : (
                    <div className="home-tv-thumb-placeholder">
                      <span>OMS TV Production</span>
                    </div>
                  )}

                  <div className="home-tv-play-bubble">
                    <span className="play-triangle">▶</span>
                  </div>

                  {item.brand && <span className="home-tv-brand-pill">{item.brand}</span>}
                  {item.category && <span className="home-tv-cat-pill">{item.category}</span>}
                </div>

                <div className="home-tv-info">
                  <h3 className="home-tv-title">{item.title}</h3>
                  <div className="home-tv-meta">
                    <span className="home-tv-action-hint">
                      <span className="hint-dot" /> {P.playHint}
                    </span>
                    <span className="home-tv-format-label">
                      {language === 'ar' ? 'إنتاج سينمائي فائق' : language === 'fr' ? 'Qualité Cinéma' : 'Cinematic Grade'}
                    </span>
                  </div>
                </div>
              </article>
            );
          })}

          {/* Interactive "Other / باقي الإعلانات" Card */}
          <Link to="/production-tv" className="home-showcase-other-card tv-other-card">
            <div className="home-other-card-inner">
              <span className="home-other-card-tag">{language === 'ar' ? 'أرشيف الإنتاج' : language === 'fr' ? 'Archive TV' : 'TV Archive'}</span>
              <h3 className="home-other-card-title">{P.otherTvTitle}</h3>
              <p className="home-other-card-desc">{P.otherTvDesc}</p>
              <span className="home-other-card-btn">{P.exploreSection}</span>
            </div>
          </Link>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 3. OUTDOOR SECTION (3 كروت + كارت Other لشبكة إعلانات الطرق)   */}
      {/* ============================================================== */}
      <section className="home-preview-section home-outdoor-spotlight" aria-label="Outdoor Billboards Showcase">
        <div className="home-section-header-bar">
          <div>
            <span className="home-section-tag-gold">{P.outdoorBadge}</span>
            <h2 className="home-section-heading">{P.outdoorTitle}</h2>
            <p className="home-section-sub">{P.outdoorDesc}</p>
          </div>
          <Link to="/outdoor" className="home-explore-btn">
            {P.outdoorViewAll}
          </Link>
        </div>

        <div className="home-outdoor-cards-grid">
          {(outdoor.length > 0 ? outdoor : FALLBACK_OUTDOOR).map((item) => {
            const imgSrc = item.image?.startsWith('http')
              ? item.image
              : mediaUrl(item.image);

            return (
              <article
                key={item.id}
                className="home-outdoor-card"
                onClick={() =>
                  setActiveImageModal({
                    src: imgSrc,
                    title: item.companyName,
                    desc: item.description,
                    tag: item.location || 'Mega Billboard'
                  })
                }
                role="button"
                tabIndex={0}
              >
                <div className="home-outdoor-img-box">
                  <img src={imgSrc} alt={item.companyName} className="home-outdoor-img" loading="lazy" />
                  <div className="home-img-overlay-hover">
                    <span className="zoom-label">⊕ {P.enlargeHint}</span>
                  </div>
                  {item.companyName && (
                    <span className="home-outdoor-brand-badge">{item.companyName}</span>
                  )}
                </div>

                <div className="home-outdoor-info">
                  <h3 className="home-outdoor-company">{item.companyName}</h3>
                  {item.description && (
                    <p className="home-outdoor-desc">{item.description}</p>
                  )}
                  {item.location && (
                    <div className="home-outdoor-loc-pill">
                      <span className="pin-icon">◎</span>
                      <span>{item.location}</span>
                    </div>
                  )}
                </div>
              </article>
            );
          })}

          {/* Interactive "Other / باقي شبكات الطرق" Card */}
          <Link to="/outdoor" className="home-showcase-other-card outdoor-other-card">
            <div className="home-other-card-inner">
              <span className="home-other-card-tag">{language === 'ar' ? 'خريطة المواقع' : language === 'fr' ? 'Réseau OOH' : 'OOH Network'}</span>
              <h3 className="home-other-card-title">{P.otherOutdoorTitle}</h3>
              <p className="home-other-card-desc">{P.otherOutdoorDesc}</p>
              <span className="home-other-card-btn">{P.exploreSection}</span>
            </div>
          </Link>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 4. POSS SECTION (3 كروت + كارت Other لنقاط البيع والتجزئة)      */}
      {/* ============================================================== */}
      <section className="home-preview-section home-poss-spotlight" aria-label="Point of Sale Showcase">
        <div className="home-section-header-bar">
          <div>
            <span className="home-section-tag-gold">{P.possBadge}</span>
            <h2 className="home-section-heading">{P.possTitle}</h2>
            <p className="home-section-sub">{P.possDesc}</p>
          </div>
          <Link to="/poss" className="home-explore-btn">
            {P.possViewAll}
          </Link>
        </div>

        <div className="home-poss-cards-grid">
          {(poss.length > 0 ? poss : FALLBACK_POSS).map((item) => {
            const imgSrc = item.image?.startsWith('http')
              ? item.image
              : mediaUrl(item.image);

            return (
              <article
                key={item.id}
                className="home-poss-card"
                onClick={() =>
                  setActiveImageModal({
                    src: imgSrc,
                    title: item.companyName,
                    desc: item.description,
                    tag: item.type || 'Custom POSS Display'
                  })
                }
                role="button"
                tabIndex={0}
              >
                <div className="home-poss-img-box">
                  <img src={imgSrc} alt={item.companyName} className="home-poss-img" loading="lazy" />
                  <div className="home-img-overlay-hover">
                    <span className="zoom-label">⊕ {P.enlargeHint}</span>
                  </div>
                  {item.type && (
                    <span className="home-poss-type-badge">{item.type}</span>
                  )}
                </div>

                <div className="home-poss-info">
                  {item.companyName && (
                    <h3 className="home-poss-company">{item.companyName}</h3>
                  )}
                  {item.description && (
                    <p className="home-poss-desc">{item.description}</p>
                  )}
                </div>
              </article>
            );
          })}

          {/* Interactive "Other / باقي وحدات العرض" Card */}
          <Link to="/poss" className="home-showcase-other-card poss-other-card">
            <div className="home-other-card-inner">
              <span className="home-other-card-tag">{language === 'ar' ? 'حلول التجزئة' : language === 'fr' ? 'Solutions Retail' : 'Retail Solutions'}</span>
              <h3 className="home-other-card-title">{P.otherPossTitle}</h3>
              <p className="home-other-card-desc">{P.otherPossDesc}</p>
              <span className="home-other-card-btn">{P.exploreSection}</span>
            </div>
          </Link>
        </div>
      </section>

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

      {/* ============================================================== */}
      {/* 5. CINEMA VIDEO PLAYER MODAL                                    */}
      {/* ============================================================== */}
      {activeVideoModal && (
        <div
          className="home-modal-backdrop"
          onClick={() => setActiveVideoModal(null)}
          role="dialog"
          aria-modal="true"
        >
          <div className="home-modal-dialog" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="home-modal-close-btn"
              onClick={() => setActiveVideoModal(null)}
              aria-label={P.closeModal}
            >
              ✕
            </button>

            <div className="home-modal-viewport">
              {activeVideoModal.type === 'youtube' && activeVideoModal.embedUrl ? (
                <iframe
                  src={`${activeVideoModal.embedUrl}?autoplay=1&rel=0`}
                  title={activeVideoModal.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="home-modal-iframe"
                />
              ) : activeVideoModal.fileUrl ? (
                <video
                  src={mediaUrl(activeVideoModal.fileUrl)}
                  controls
                  autoPlay
                  className="home-modal-iframe"
                />
              ) : (
                <div className="home-tv-thumb-placeholder" style={{ height: '100%' }}>
                  <span>Video Preview Unavailable</span>
                </div>
              )}
            </div>

            <div className="home-modal-meta">
              <div className="home-modal-tags-row">
                {activeVideoModal.brand && (
                  <span className="home-modal-badge-red">{activeVideoModal.brand}</span>
                )}
                {activeVideoModal.category && (
                  <span className="home-modal-badge-gold">{activeVideoModal.category}</span>
                )}
              </div>
              <h3 className="home-modal-title">{activeVideoModal.title}</h3>
              {activeVideoModal.desc && (
                <p className="home-modal-desc">{activeVideoModal.desc}</p>
              )}
              {activeVideoModal.youtubeUrl && (
                <a
                  href={activeVideoModal.youtubeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="home-modal-yt-btn"
                >
                  {P.watchYouTube}
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 6. IMAGE ZOOM MODAL (Outdoor & POSS)                           */}
      {/* ============================================================== */}
      {activeImageModal && (
        <div
          className="home-modal-backdrop"
          onClick={() => setActiveImageModal(null)}
          role="dialog"
          aria-modal="true"
        >
          <div className="home-modal-dialog image-modal" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="home-modal-close-btn"
              onClick={() => setActiveImageModal(null)}
              aria-label={P.closeModal}
            >
              ✕
            </button>

            <div className="home-modal-image-wrap">
              <img
                src={activeImageModal.src}
                alt={activeImageModal.title || 'Preview'}
                className="home-modal-img"
              />
            </div>

            <div className="home-modal-meta">
              {activeImageModal.tag && (
                <span className="home-modal-badge-gold">{activeImageModal.tag}</span>
              )}
              <h3 className="home-modal-title">{activeImageModal.title}</h3>
              {activeImageModal.desc && (
                <p className="home-modal-desc">{activeImageModal.desc}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

// Sub-Component for Curated Logo Tile
function ClientLogoCard({ client }) {
  const { name, logo, logoSvg, website } = client;

  const card = (
    <div className="home-client-logo-box" title={name || 'Client logo'}>
      {logo ? (
        <img
          src={logo.startsWith('http') || logo.startsWith('data:') ? logo : mediaUrl(logo)}
          alt={`${name || 'Client'} logo`}
          loading="lazy"
        />
      ) : logoSvg ? (
        <img src={logoSvg} alt={`${name || 'Client'} logo`} loading="lazy" />
      ) : (
        <span className="home-client-fallback-text">{name || 'OMS'}</span>
      )}
    </div>
  );

  if (website) {
    return (
      <a
        href={website}
        target="_blank"
        rel="noopener noreferrer"
        className="home-client-link"
        aria-label={`Visit ${name || 'client'} website`}
      >
        {card}
      </a>
    );
  }

  return card;
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
        <span className="obj-team-pill">
          <span className="team-dot" /> {agentPill}
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
