import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './PossSection.css';
import { api, mediaUrl } from '../../api';
import { useLanguage } from '../../context/LanguageContext';
import { PAGE_TRANSLATIONS } from '../../context/translationsData';

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

export default function PossSection() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    api('/api/poss')
      .then((data) => {
        if (!cancelled) {
          if (Array.isArray(data) && data.length > 0) {
            setItems(data);
          } else {
            setItems(FALLBACK_POSS);
          }
        }
      })
      .catch(() => {
        if (!cancelled) {
          setItems(FALLBACK_POSS);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // Close lightbox modal on ESC key
  useEffect(() => {
    if (!selectedImage) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setSelectedImage(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedImage]);

  const { language } = useLanguage();
  const T = PAGE_TRANSLATIONS[language]?.poss || PAGE_TRANSLATIONS.en.poss;
  const displayList = items.length > 0 ? items : FALLBACK_POSS;

  return (
    <div className="poss-page-container">
      {/* 1. Hero Section */}
      <section className="poss-hero-header">
        <h1 className="poss-main-title">
          {T.heroTitle}{' '}
          <span className="poss-text-italic">
            {T.heroTitleItalic}
          </span>
        </h1>
        <p className="poss-subtext">
          {T.heroSub}
        </p>
      </section>

      {/* 3. Showcase Grid */}
      <section className="poss-grid-wrapper">
        <div className="poss-grid-heading-row">
          <div>
            <span className="poss-section-eyebrow">
              {T.eyebrow}
            </span>
            <h2 className="poss-section-title">
              {T.sectionTitle}
            </h2>
          </div>
          <p className="poss-grid-note">
            {T.gridNote}
          </p>
        </div>

        {loading ? (
          <div className="poss-status-msg">{T.loadingMsg}</div>
        ) : (
          <div className="poss-cards-grid">
            {displayList.map((item, index) => {
              const imgSrc = item.image?.startsWith('http')
                ? item.image
                : mediaUrl(item.image);

              return (
                <div key={item.id || index} className="poss-card">
                  <div
                    className="poss-card-img-box"
                    onClick={() => setSelectedImage({ src: imgSrc, title: item.companyName, desc: item.description })}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setSelectedImage({ src: imgSrc, title: item.companyName, desc: item.description });
                      }
                    }}
                    role="button"
                    tabIndex={0}
                    aria-label={item.companyName ? `View ${item.companyName} retail showcase` : 'View retail showcase image'}
                  >
                    <img
                      src={imgSrc}
                      alt={item.companyName}
                      className="poss-card-img"
                      loading="lazy"
                    />
                    <div className="poss-img-overlay">
                      <span>{T.enlargeHint}</span>
                    </div>
                    {item.companyName && (
                      <span className="poss-brand-badge">{item.companyName}</span>
                    )}
                  </div>

                  {(item.companyName || item.description || item.type) && (
                    <div className="poss-card-body">
                      {item.companyName && <h3 className="poss-card-company">{item.companyName}</h3>}
                      {item.description && <p className="poss-card-desc">{item.description}</p>}
                      {item.type && (
                        <span className="poss-card-type">🏷️ {item.type}</span>
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
      <section className="poss-cta-section">
        <div className="poss-cta-card">
          <div className="cta-left">
            <h2>{T.ctaTitle}</h2>
            <p>{T.ctaDesc}</p>
          </div>
          <div className="cta-right">
            <Link to="/contact" className="poss-primary-action-btn">
              {T.ctaBtn}
            </Link>
          </div>
        </div>
      </section>

      {/* 6. Lightbox Modal */}
      {selectedImage && (
        <div className="poss-modal-backdrop" onClick={() => setSelectedImage(null)}>
          <div className="poss-modal-content" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="poss-modal-close"
              onClick={() => setSelectedImage(null)}
            >
              ✕
            </button>
            <img src={selectedImage.src} alt={selectedImage.title} className="poss-modal-img" />
            <div className="poss-modal-info">
              <h3>{selectedImage.title}</h3>
              <p>{selectedImage.desc}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
