import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './OutdoorSection.css';
import { api, mediaUrl } from '../../api';
import { useLanguage } from '../../context/LanguageContext';
import { PAGE_TRANSLATIONS } from '../../context/translationsData';

// Fallback showcase items if database is empty or loading
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

export default function OutdoorSection() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    api('/api/outdoor')
      .then((data) => {
        if (!cancelled) {
          if (Array.isArray(data) && data.length > 0) {
            setItems(data);
          } else {
            setItems(FALLBACK_OUTDOOR);
          }
        }
      })
      .catch(() => {
        if (!cancelled) {
          setItems(FALLBACK_OUTDOOR);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const { language } = useLanguage();
  const T = PAGE_TRANSLATIONS[language]?.outdoor || PAGE_TRANSLATIONS.en.outdoor;
  const displayList = items.length > 0 ? items : FALLBACK_OUTDOOR;

  return (
    <div className="outdoor-page-container">
      {/* 1. Hero Section */}
      <section className="outdoor-hero-header">
        <span className="outdoor-badge-gold">
          {language === 'ar' ? 'حلول إعلانات الطرق واللوحات العملاقة OOH' : language === 'fr' ? "Solutions d'Affichage Extérieur & DOOH" : 'OMS OUTDOOR & OOH SOLUTIONS'}
        </span>
        <h1 className="outdoor-main-title">
          {language === 'ar' ? 'حضور استثنائي في' : language === 'fr' ? 'Présence Impactante' : 'High-Impact'}{' '}
          <span className="outdoor-text-italic">
            {language === 'ar' ? 'أهم محاور الطرق.' : language === 'fr' ? 'en Affichage Urbain.' : 'Outdoor Presence.'}
          </span>
        </h1>
        <p className="outdoor-subtext">
          {language === 'ar'
            ? 'الريادة والسيطرة البصرية على أهم المحاور الاستراتيجية، الكباري، والميادين الحيوية في القاهرة والجيزة والمحافظات بمقاييس عملاقة ومواقع هندسية دقيقة.'
            : language === 'fr'
            ? "Dominant les corridors stratégiques, autoroutes et carrefours majeurs en Égypte avec des formats spectaculaires et un ciblage géographique millimétré."
            : "Dominating Egypt's most strategic arterial corridors, highways, and premium metropolitan hubs with unmissable scale, commanding frequency, and precision location engineering."}
        </p>
      </section>

      {/* 2. Media Formats Strip */}
      <section className="outdoor-formats-strip">
        <div className="format-pill">{language === 'ar' ? 'لوحات يونيبول عملاقة' : language === 'fr' ? 'Unipoles Géants' : 'Mega Unipoles'}</div>
        <div className="format-pill">{language === 'ar' ? 'شاشات رقمية تفاعلية DOOH' : language === 'fr' ? 'Écrans Digitaux DOOH' : 'Digital DOOH Screens'}</div>
        <div className="format-pill">{language === 'ar' ? 'لافتات الكباري والمحاور' : language === 'fr' ? 'Bannières de Ponts' : 'Highway Bridge Banners'}</div>
        <div className="format-pill">{language === 'ar' ? 'أسطح المباني والميادين' : language === 'fr' ? 'Toitures & Mégas' : 'Rooftops & Megas'}</div>
        <div className="format-pill">{language === 'ar' ? 'لوحات المطارات ووسائط النقل' : language === 'fr' ? 'Affichage Transports & Aéroports' : 'Transit & Aerodrome Displays'}</div>
      </section>

      {/* 3. Showcase Grid */}
      <section className="outdoor-grid-wrapper">
        <div className="outdoor-grid-heading-row">
          <div>
            <span className="outdoor-section-eyebrow">
              {language === 'ar' ? 'أبرز الأعمال والمواقع' : language === 'fr' ? 'Portfolio Sélectionné' : 'FEATURED PORTFOLIO'}
            </span>
            <h2 className="outdoor-section-title">
              {language === 'ar' ? 'حملات إعلانات الطرق الاستراتيجية' : language === 'fr' ? "Campagnes d'Affichage Stratégiques" : 'Strategic Outdoor Campaigns'}
            </h2>
          </div>
          <p className="outdoor-grid-note">{T.gridNote}</p>
        </div>

        {loading ? (
          <div className="outdoor-status-msg">{T.loadingMsg}</div>
        ) : (
          <div className="outdoor-cards-grid">
            {displayList.map((item, index) => {
              const imgSrc = item.image?.startsWith('http')
                ? item.image
                : mediaUrl(item.image);

              return (
                <div key={item.id || index} className="outdoor-card">
                  <div
                    className="outdoor-card-img-box"
                    onClick={() => setSelectedImage({ src: imgSrc, title: item.companyName, desc: item.description })}
                    role="button"
                    tabIndex={0}
                  >
                    <img
                      src={imgSrc}
                      alt={item.companyName}
                      className="outdoor-card-img"
                      loading="lazy"
                    />
                    <div className="outdoor-img-overlay">
                      <span>{T.enlargeHint}</span>
                    </div>
                    {item.companyName && (
                      <span className="outdoor-brand-badge">{item.companyName}</span>
                    )}
                  </div>

                  {(item.companyName || item.description || item.location) && (
                    <div className="outdoor-card-body">
                      {item.companyName && <h3 className="outdoor-card-company">{item.companyName}</h3>}
                      {item.description && <p className="outdoor-card-desc">{item.description}</p>}
                      {item.location && (
                        <span className="outdoor-card-location">📍 {item.location}</span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>


      {/* 5. Bottom Call to Action */}
      <section className="outdoor-cta-section">
        <div className="outdoor-cta-card">
          <div className="cta-left">
            <h2>{T.ctaTitle}</h2>
            <p>{T.ctaDesc}</p>
          </div>
          <div className="cta-right">
            <Link to="/contact" className="outdoor-primary-action-btn">
              {T.ctaBtn}
            </Link>
          </div>
        </div>
      </section>

      {/* 6. Lightbox Modal */}
      {selectedImage && (
        <div className="outdoor-modal-backdrop" onClick={() => setSelectedImage(null)}>
          <div className="outdoor-modal-content" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="outdoor-modal-close"
              onClick={() => setSelectedImage(null)}
            >
              ✕
            </button>
            <img src={selectedImage.src} alt={selectedImage.title} className="outdoor-modal-img" />
            <div className="outdoor-modal-info">
              <h3>{selectedImage.title}</h3>
              <p>{selectedImage.desc}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
