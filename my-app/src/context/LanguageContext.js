import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

export const LANGUAGES = [
  { code: 'ar', name: 'العربية', flag: '🇪🇬', dir: 'rtl', label: 'عربي' },
  { code: 'en', name: 'English', flag: '🇬🇧', dir: 'ltr', label: 'EN' },
  { code: 'fr', name: 'Français', flag: '🇫🇷', dir: 'ltr', label: 'FR' },
];

export const TRANSLATIONS = {
  ar: {
    // Navbar
    'nav.home': 'الرئيسية',
    'nav.work': 'أعمالنا والخدمات',
    'nav.outdoor': 'إعلانات الطرق',
    'nav.poss': 'نقاط البيع POSS',
    'nav.about': 'عن OMS',
    'nav.productionTv': 'الإنتاج التلفزيوني',
    'nav.clients': 'عملاؤنا',
    'nav.startProject': 'ابدأ مشروعك ←',
    'nav.light': 'نهاري',
    'nav.dark': 'ليلي',
    'nav.login': 'تسجيل الدخول',
    'nav.logout': 'تسجيل الخروج',
    'nav.confirmLogout': 'هل تريد تسجيل الخروج؟',
    'nav.adminHub': 'لوحة الإدارة ↗',
    'nav.language': 'اللغة',
    'nav.selectLang': 'اختر اللغة المفضلة',

    // Clients Page
    'clients.heading1': 'شركاء',
    'clients.heading2': 'النجاح والعملاء.',
    'clients.sub': 'علامات تجارية رائدة اختارت OMS لتحريك الأسواق وتحقيق الريادة — استراتيجية وإبداع وإنتاج متكامل تحت سقف واحد.',
    'clients.loading': 'جاري تحميل الشركاء...',
    'clients.empty': 'لا يوجد عملاء مدرجون حالياً.',
    'clients.visitWebsite': 'زيارة الموقع الرسمي',

    // Home Section
    'home.heroTitle1': 'رؤيتك، نضخم أثرها',
    'home.heroTitle2': 'عبر كل شاشة وقناة إعلامية.',
    'home.heroDesc': 'من الإعلانات التلفزيونية الحائزة على جوائز وإعلانات الطرق الأيقونية إلى الحملات الرقمية المتكاملة — نبث الروح في علامتك التجارية في مصر والشرق الأوسط باستراتيجية وإبداع وأثر ملموس.',
    'home.startCampaign': 'ابدأ حملتك الإعلانية ←',
    'home.exploreServices': 'استكشف خدماتنا ↓',

    // About Section
    'about.badge': 'من نحن • وكالة إعلانية متكاملة',
    'about.title1': 'نحن نصنع علامات تجارية',
    'about.title2': 'تقود الأسواق وتلهم الجماهير.',
    'about.desc': 'في OMS (One Media Solution)، نجمع بين الاستراتيجية الثاقبة، الإبداع السينمائي، وهندسة الوسائط المبتكرة لبناء علامات تجارية تصنع فارقاً حقيقياً وتستحوذ على اهتمام المستهلكين في مصر والشرق الأوسط.',
    'about.whyUs': 'لماذا يختارنا الشركاء؟',

    // Services Section
    'services.badge': 'قدراتنا الإبداعية والإنتاجية',
    'services.title': 'حلول إعلانية متكاملة وشاملة',
    'services.sub': 'من الهوية البصرية وإعلانات الطرق إلى الإنتاج التلفزيوني والمنصات الرقمية — نقدم كل ما تحتاجه علامتك التجارية تحت سقف واحد.',

    // Outdoor Section
    'outdoor.badge': 'شبكة إعلانات الطرق الأيقونية',
    'outdoor.title': 'مواقع استراتيجية في أهم محاور الجمهورية',
    'outdoor.sub': 'شاشات ولافتات إعلانية عملاقة بأعلى دقة وتوزيع جغرافي ذكي يضمن أعلى معدل وصول وتأثير في القاهرة والجيزة والمحافظات.',

    // POSS Section
    'poss.badge': 'نقاط البيع والعرض POSS',
    'poss.title': 'تصميم وتصنيع منصات العرض المبتكرة',
    'poss.sub': 'نحول زيارات المتاجر إلى قرارات شراء حاسمة من خلال تصاميم هندسية فاخرة ومنصات عرض متطورة في أكبر المتاجر والمولات.',

    // Production TV Section
    'prod.badge': 'الإنتاج التلفزيوني والسينمائي',
    'prod.title': 'إعلانات تجارية بمعايير سينمائية عالمية',
    'prod.sub': 'قصص بصرية آسرة وإخراج سينمائي استثنائي ينقل رسالة علامتك التجارية بأعلى جودة على كبرى القنوات التلفزيونية والمنصات الرقمية.',

    // Contact Section
    'contact.badge': 'تواصل معنا',
    'contact.title': 'دعنا نبدأ مشروعك القادم',
    'contact.sub': 'فريقنا مستعد لمساعدتك في التخطيط، الإنتاج، وإطلاق حملتك الإعلانية القادمة بنجاح باهر.',

    // Footer
    'footer.ctaTitle1': 'هل لديك تحدٍّ إعلامي',
    'footer.ctaTitle2': 'يستحق التوسع وصناعة الأثر؟',
    'footer.briefBtn': 'ابدأ ملخص حملتك الآن ←',
    'footer.credentialsBtn': 'استعرض أعمالنا والإنتاج',
    'footer.company': 'الشركة',
    'footer.aboutLink': 'عن الشركة ورؤيتنا',
    'footer.workLink': 'أعمالنا وقدراتنا',
    'footer.outdoorLink': 'شبكة إعلانات الطرق',
    'footer.possLink': 'نقاط البيع والتوزيع POSS',
    'footer.tvLink': 'الإنتاج التلفزيوني والسينمائي',
    'footer.email': 'البريد الإلكتروني',
    'footer.rights': 'جميع الحقوق محفوظة لشركة One Media Solution (OMS).',
  },

  en: {
    // Navbar
    'nav.home': 'Home',
    'nav.work': 'Work',
    'nav.outdoor': 'Outdoor',
    'nav.poss': 'POSS',
    'nav.about': 'About',
    'nav.productionTv': 'Production TV',
    'nav.clients': 'Clients',
    'nav.startProject': 'START PROJECT →',
    'nav.light': 'Light',
    'nav.dark': 'Dark',
    'nav.login': 'Login',
    'nav.logout': 'Log Out',
    'nav.confirmLogout': 'Are you sure you want to log out?',
    'nav.adminHub': 'Panel Hub ↗',
    'nav.language': 'Language',
    'nav.selectLang': 'Select Preferred Language',

    // Clients Page
    'clients.heading1': 'Our',
    'clients.heading2': 'Clients.',
    'clients.sub': 'Brands that chose OMS to move markets — strategy, creative, and production under one roof.',
    'clients.loading': 'Loading clients...',
    'clients.empty': 'No clients listed yet.',
    'clients.visitWebsite': 'Visit official website',

    // Home Section
    'home.heroTitle1': 'Your Vision, Amplified',
    'home.heroTitle2': 'Across Every Channel & Screen.',
    'home.heroDesc': 'From award-winning TV commercials and iconic outdoor billboards to high-performance digital campaigns — we bring your brand to life across Egypt and the MENA region with creativity, strategy, and measurable impact.',
    'home.startCampaign': 'Start Your Campaign →',
    'home.exploreServices': 'Explore Our Services ↓',

    // About Section
    'about.badge': 'Who We Are • Full-Service Agency',
    'about.title1': 'We Build Iconic Brands That',
    'about.title2': 'Move Markets & Inspire Audiences.',
    'about.desc': 'At OMS (One Media Solution), we fuse high-level strategic intelligence, cinematic storytelling, and engineered media distribution to create campaigns that command consumer recall across Egypt and the MENA region.',
    'about.whyUs': 'Why Strategic Leaders Choose OMS',

    // Services Section
    'services.badge': 'Creative & Production Capabilities',
    'services.title': 'Full-Spectrum Marketing Solutions',
    'services.sub': 'From visual identity & outdoor networks to television production & digital platforms — everything your brand needs under one single roof.',

    // Outdoor Section
    'outdoor.badge': 'Iconic Outdoor Billboard Network',
    'outdoor.title': 'Strategic Prime Locations Across Egypt',
    'outdoor.sub': 'Mega-format digital screens and static billboards deployed across high-traffic corridors in Cairo, Giza, and major travel arteries.',

    // POSS Section
    'poss.badge': 'Engineered Point-of-Sale Displays',
    'poss.title': 'Converting Footfall Into Commercial Purchase',
    'poss.sub': 'Precision-manufactured luxury retail displays, kiosks, and experiential retail pods engineered for maximum brand retention.',

    // Production TV Section
    'prod.badge': 'Cinematic TV Commercial Production',
    'prod.title': 'Commercial Fire Meets Cinematic Discipline',
    'prod.sub': 'Compelling brand narratives and high-intent commercial films broadcasted across major television networks and global digital platforms.',

    // Contact Section
    'contact.badge': 'Connect With Us',
    'contact.title': 'Let’s Ignite Your Next Campaign',
    'contact.sub': 'Our cross-functional teams are primed to plan, produce, and deploy your brand across Egypt and MENA.',

    // Footer
    'footer.ctaTitle1': 'HAVE A CHALLENGE',
    'footer.ctaTitle2': 'WORTH SCALING?',
    'footer.briefBtn': 'INITIATE CAMPAIGN BRIEF →',
    'footer.credentialsBtn': 'VIEW CREDENTIALS',
    'footer.company': 'Company',
    'footer.aboutLink': 'About & Manifesto',
    'footer.workLink': 'Work & Capabilities',
    'footer.outdoorLink': 'Outdoor Network',
    'footer.possLink': 'POSS Displays',
    'footer.tvLink': 'TV Production',
    'footer.email': 'EMAIL',
    'footer.rights': 'All rights reserved. One Media Solution (OMS).',
  },

  fr: {
    // Navbar
    'nav.home': 'Accueil',
    'nav.work': 'Nos Projets',
    'nav.outdoor': 'Affichage Extérieur',
    'nav.poss': 'PLV & POSS',
    'nav.about': 'À Propos',
    'nav.productionTv': 'Production TV',
    'nav.clients': 'Nos Clients',
    'nav.startProject': 'LANCER UN PROJET →',
    'nav.light': 'Clair',
    'nav.dark': 'Sombre',
    'nav.login': 'Connexion',
    'nav.logout': 'Déconnexion',
    'nav.confirmLogout': 'Voulez-vous vraiment vous déconnecter?',
    'nav.adminHub': 'Panneau Hub ↗',
    'nav.language': 'Langue',
    'nav.selectLang': 'Sélectionnez votre langue',

    // Clients Page
    'clients.heading1': 'Nos',
    'clients.heading2': 'Clients.',
    'clients.sub': 'Des marques qui ont choisi OMS pour conquérir les marchés — stratégie, créativité et production sous un même toit.',
    'clients.loading': 'Chargement des clients...',
    'clients.empty': 'Aucun client répertorié pour le moment.',
    'clients.visitWebsite': 'Visiter le site officiel',

    // Home Section
    'home.heroTitle1': 'Votre Vision, Amplifiée',
    'home.heroTitle2': 'Sur Chaque Écran et Canal.',
    'home.heroDesc': 'Des spots télévisés primés aux réseaux d’affichage extérieur en passant par les campagnes digitales performantes — nous donnons vie à votre marque en Égypte et dans la région MENA.',
    'home.startCampaign': 'Lancez Votre Campagne →',
    'home.exploreServices': 'Découvrez Nos Services ↓',

    // About Section
    'about.badge': 'Qui Sommes-Nous • Agence Intégrée',
    'about.title1': 'Nous Créons des Marques Qui',
    'about.title2': 'Dominent les Marchés et Inspirent.',
    'about.desc': 'Chez OMS (One Media Solution), nous combinons stratégie percutante, narration cinématographique et ingénierie média pour créer des campagnes mémorables en Égypte et dans la région MENA.',
    'about.whyUs': 'Pourquoi les Leaders Choisissent OMS',

    // Services Section
    'services.badge': 'Capacités Créatives & Production',
    'services.title': 'Solutions Publicitaires Complètes',
    'services.sub': 'De l’identité visuelle et l’affichage urbain à la production télévisée et digitale — tout ce dont votre marque a besoin sous un même toit.',

    // Outdoor Section
    'outdoor.badge': 'Réseau d’Affichage Extérieur',
    'outdoor.title': 'Emplacements Stratégiques Majeurs',
    'outdoor.sub': 'Écrans digitaux géants et panneaux publicitaires le long des axes routiers les plus fréquentés du Caire, de Gizeh et des grandes villes.',

    // POSS Section
    'poss.badge': 'Affichage & PLV POSS',
    'poss.title': 'Convertir la Visite en Achat Concret',
    'poss.sub': 'Présentoirs de luxe, stands modulaires et îlots de vente interactifs conçus pour maximiser l’impact au point de décision.',

    // Production TV Section
    'prod.badge': 'Production Télévisée & Cinéma',
    'prod.title': 'Excellence Cinématographique et Impact Commercial',
    'prod.sub': 'Récits visuels captivants et réalisation cinématographique de pointe diffusés sur les plus grandes chaînes et plateformes.',

    // Contact Section
    'contact.badge': 'Contactez-Nous',
    'contact.title': 'Démarrons Votre Prochaine Campagne',
    'contact.sub': 'Nos équipes dédiées sont prêtes à concevoir, produire et lancer votre prochaine campagne avec succès.',

    // Footer
    'footer.ctaTitle1': 'VOUS AVEZ UN DÉFI',
    'footer.ctaTitle2': 'À GRANDE ÉCHELLE?',
    'footer.briefBtn': 'DÉMARRER LE BRIEF DE CAMPAGNE →',
    'footer.credentialsBtn': 'VOIR NOS RÉFÉRENCES',
    'footer.company': 'Entreprise',
    'footer.aboutLink': 'À Propos & Manifeste',
    'footer.workLink': 'Réalisations & Capacités',
    'footer.outdoorLink': 'Réseau d\'Affichage',
    'footer.possLink': 'Affichage & PLV POSS',
    'footer.tvLink': 'Production Télévisée',
    'footer.email': 'EMAIL',
    'footer.rights': 'Tous droits réservés. One Media Solution (OMS).',
  },
};

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => {
    try {
      const saved = localStorage.getItem('oms_language');
      if (saved && ['ar', 'en', 'fr'].includes(saved)) {
        return saved;
      }
    } catch (e) {
      // ignore
    }
    return 'ar'; // Default to Arabic as requested by user
  });

  const currentLangMeta = LANGUAGES.find((l) => l.code === language) || LANGUAGES[0];

  useEffect(() => {
    try {
      localStorage.setItem('oms_language', language);
    } catch (e) {
      // ignore
    }

    const html = document.documentElement;
    const body = document.body;

    html.setAttribute('lang', language);
    html.setAttribute('dir', currentLangMeta.dir);
    body.setAttribute('data-lang', language);
    body.setAttribute('dir', currentLangMeta.dir);

    // Toggle RTL / LTR class for easy CSS targeting
    if (currentLangMeta.dir === 'rtl') {
      html.classList.add('is-rtl');
      html.classList.remove('is-ltr');
    } else {
      html.classList.add('is-ltr');
      html.classList.remove('is-rtl');
    }
  }, [language, currentLangMeta]);

  const t = (key, defaultText = '') => {
    const dict = TRANSLATIONS[language] || TRANSLATIONS.en;
    if (dict && dict[key]) {
      return dict[key];
    }
    // Fallback to English
    if (TRANSLATIONS.en && TRANSLATIONS.en[key]) {
      return TRANSLATIONS.en[key];
    }
    return defaultText || key;
  };

  const changeLanguage = (code) => {
    if (['ar', 'en', 'fr'].includes(code)) {
      setLanguage(code);
    }
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        changeLanguage,
        t,
        currentLangMeta,
        languages: LANGUAGES,
        isRTL: currentLangMeta.dir === 'rtl',
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
