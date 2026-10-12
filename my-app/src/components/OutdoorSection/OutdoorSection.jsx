import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './OutdoorSection.css';
import { api, mediaUrl } from '../../api';
import PageHero from '../PageHero/PageHero';

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

  const displayList = items.length > 0 ? items : FALLBACK_OUTDOOR;

  return (
    <div className="outdoor-page-container">
      {/* 1. Hero Section */}
      <section className="outdoor-hero-header">
        <span className="outdoor-badge-gold">OMS OUTDOOR & OOH SOLUTIONS</span>
        <h1 className="outdoor-main-title">
          High-Impact <span className="outdoor-text-italic">Outdoor Presence.</span>
        </h1>
        <p className="outdoor-subtext">
          Dominating Egypt&apos;s most strategic arterial corridors, highways, and premium metropolitan hubs with unmissable scale, commanding frequency, and precision location engineering.
        </p>

        <div className="outdoor-stats-bar">
          <div className="stat-node">
            <span className="stat-number">450+</span>
            <span className="stat-label">Prime Billboard Faces</span>
          </div>
          <div className="stat-divider"></div>
          <div className="stat-node">
            <span className="stat-number">3.2M+</span>
            <span className="stat-label">Daily Commuter Impressions</span>
          </div>
          <div className="stat-divider"></div>
          <div className="stat-node">
            <span className="stat-number">99.8%</span>
            <span className="stat-label">Corridor Uptime & Illumination</span>
          </div>
        </div>
      </section>

      {/* 2. Media Formats Strip */}
      <section className="outdoor-formats-strip">
        <div className="format-pill">Mega Unipoles</div>
        <div className="format-pill">Digital DOOH Screens</div>
        <div className="format-pill">Highway Bridge Banners</div>
        <div className="format-pill">Rooftops & Megas</div>
        <div className="format-pill">Transit & Aerodrome Displays</div>
      </section>

      {/* 3. Showcase Grid */}
      <section className="outdoor-grid-wrapper">
        <div className="outdoor-grid-heading-row">
          <div>
            <span className="outdoor-section-eyebrow">FEATURED PORTFOLIO</span>
            <h2 className="outdoor-section-title">Strategic Outdoor Campaigns</h2>
          </div>
          <p className="outdoor-grid-note">
            Real campaign deployments executed across key commercial hubs.
          </p>
        </div>

        {loading ? (
          <div className="outdoor-status-msg">Loading outdoor showcase campaigns…</div>
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
                      <span>Click to enlarge view ⤢</span>
                    </div>
                    <span className="outdoor-brand-badge">{item.companyName}</span>
                  </div>

                  <div className="outdoor-card-body">
                    <h3 className="outdoor-card-company">{item.companyName}</h3>
                    <p className="outdoor-card-desc">{item.description}</p>
                    {item.location && (
                      <span className="outdoor-card-location">📍 {item.location}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 4. Strategic Locations & Coverage Highlights */}
      <section className="outdoor-coverage-section">
        <div className="coverage-card">
          <span className="coverage-badge">PRIME LOCATIONS</span>
          <h3>Arterial Coverage Across Greater Cairo & Beyond</h3>
          <div className="coverage-points-grid">
            <div className="coverage-item">
              <strong>Ring Road & Marioutiya Axis</strong>
              <p>Highest-density commuter circulation connecting New Cairo, Maadi, and Giza.</p>
            </div>
            <div className="coverage-item">
              <strong>26th of July & Mehwar Corridor</strong>
              <p>The primary high-income transit artery feeding Sheikh Zayed and 6th of October.</p>
            </div>
            <div className="coverage-item">
              <strong>North & South 90th Street</strong>
              <p>Heart of commercial business districts, corporate headquarters, and high-end retail.</p>
            </div>
            <div className="coverage-item">
              <strong>North Coast Sahel Highway</strong>
              <p>Summer flagship domination capturing Egypt&apos;s peak luxury seasonal movement.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Bottom Call to Action */}
      <section className="outdoor-cta-section">
        <div className="outdoor-cta-card">
          <div className="cta-left">
            <h2>Ready to dominate Egypt&apos;s skyline?</h2>
            <p>
              Lock in your brand&apos;s high-impact outdoor locations with OMS. Strategic planning, location securing, and turnkey production.
            </p>
          </div>
          <div className="cta-right">
            <Link to="/contact" className="outdoor-primary-action-btn">
              Initiate Outdoor Brief →
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
