import React, { useEffect, useState } from 'react';
import './ClientsSection.css';
import { api, mediaUrl } from '../../api';
import { useLanguage } from '../../context/LanguageContext';
import { DEFAULT_CLIENTS } from '../../data/clientsData';

export default function ClientsSection() {
  const { t } = useLanguage();
  const [clients, setClients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const fetchClients = async () => {
      try {
        const data = await api('/api/clients');
        if (!cancelled) {
          if (Array.isArray(data) && data.length > 0) {
            setClients(data);
          } else {
            // Use curated default brands if database has no clients yet
            setClients(DEFAULT_CLIENTS);
          }
        }
      } catch (err) {
        if (!cancelled) {
          // Graceful fallback to default brands
          setClients(DEFAULT_CLIENTS);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    fetchClients();
    return () => {
      cancelled = true;
    };
  }, []);

  // Trigger entrance animation after data loads
  useEffect(() => {
    if (!isLoading) {
      const timer = setTimeout(() => setVisible(true), 80);
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  // Split into 4 rows for 4 full-width horizontal lanes
  const chunkSize = Math.max(1, Math.ceil(clients.length / 4));
  const row1 = clients.slice(0, chunkSize);
  const row2 = clients.slice(chunkSize, chunkSize * 2);
  const row3 = clients.slice(chunkSize * 2, chunkSize * 3);
  const row4 = clients.slice(chunkSize * 3);

  // Duplicate each row so it loops seamlessly and infinitely across the screen width
  const track1 = row1.length > 0 ? [...row1, ...row1, ...row1] : [];
  const track2 = row2.length > 0 ? [...row2, ...row2, ...row2] : [];
  const track3 = row3.length > 0 ? [...row3, ...row3, ...row3] : [];
  const track4 = row4.length > 0 ? [...row4, ...row4, ...row4] : [];

  return (
    <main className="clients-page" aria-busy={isLoading}>
      {/* Hero Header Context - Exact Previous Style with Translation */}
      <header className={`clients-hero ${visible ? 'hero-visible' : ''}`}>
        <h1 className="clients-heading">
          {t('clients.heading1', 'Our')}{' '}
          <span className="clients-italic">{t('clients.heading2', 'Clients.')}</span>
        </h1>
        <p className="clients-sub">
          {t(
            'clients.sub',
            'Brands that chose OMS to move markets — strategy, creative, and production under one roof.'
          )}
        </p>
      </header>

      {/* Full-Width Horizontal Motion Wrapper with 4 Slow Moving Rows */}
      <section className="clients-marquee-wrapper" aria-label="Partner Directory">
        {isLoading && <p className="clients-status">{t('clients.loading', 'Loading clients…')}</p>}
        {error && <p className="clients-status clients-error">{error}</p>}

        {!isLoading && clients.length > 0 && (
          <div className="clients-marquee-lanes four-lanes">
            {/* Row 1 - Gentle Left Scroll */}
            {track1.length > 0 && (
              <div className="clients-marquee-track track-row-1">
                {track1.map((client, index) => (
                  <ClientCard
                    key={`r1-${client.id || index}-${index}`}
                    client={client}
                    index={index}
                    visible={visible}
                  />
                ))}
              </div>
            )}

            {/* Row 2 - Gentle Right Scroll */}
            {track2.length > 0 && (
              <div className="clients-marquee-track track-row-2">
                {track2.map((client, index) => (
                  <ClientCard
                    key={`r2-${client.id || index}-${index}`}
                    client={client}
                    index={index}
                    visible={visible}
                  />
                ))}
              </div>
            )}

            {/* Row 3 - Gentle Left Scroll */}
            {track3.length > 0 && (
              <div className="clients-marquee-track track-row-3">
                {track3.map((client, index) => (
                  <ClientCard
                    key={`r3-${client.id || index}-${index}`}
                    client={client}
                    index={index}
                    visible={visible}
                  />
                ))}
              </div>
            )}

            {/* Row 4 - Gentle Right Scroll */}
            {track4.length > 0 && (
              <div className="clients-marquee-track track-row-4">
                {track4.map((client, index) => (
                  <ClientCard
                    key={`r4-${client.id || index}-${index}`}
                    client={client}
                    index={index}
                    visible={visible}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </section>
    </main>
  );
}

// Sub-Component - Exact Previous Card Design & Structure
function ClientCard({ client, index, visible }) {
  const { name, logo, logoSvg, website } = client;

  const cardContent = (
    <article className={`client-logo-card ${visible ? 'card-visible' : ''}`}>
      <div className="client-logo-frame">
        {logo ? (
          <img
            src={logo.startsWith('http') || logo.startsWith('data:') ? logo : mediaUrl(logo)}
            alt={`${name} corporate logo`}
            loading="lazy"
          />
        ) : logoSvg ? (
          <img src={logoSvg} alt={`${name} corporate logo`} loading="lazy" />
        ) : (
          <span className="client-text-fallback">{name}</span>
        )}
      </div>
      <h2 className="client-name">{name}</h2>
    </article>
  );

  if (website) {
    return (
      <a
        href={website}
        target="_blank"
        rel="noopener noreferrer"
        className="client-link"
        aria-label={`Visit ${name} official website`}
      >
        {cardContent}
      </a>
    );
  }

  return cardContent;
}
