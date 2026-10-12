import React, { useEffect, useState } from 'react';
import './ClientsSection.css';
import { api, mediaUrl } from '../../api';

export default function ClientsSection() {
  const [clients, setClients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const data = await api('/api/clients');
        setClients(data || []);
      } catch (err) {
        setError(err.message || 'Failed to load clients.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchClients();
  }, []);

  // Trigger entrance animation after data loads
  useEffect(() => {
    if (!isLoading) {
      const timer = setTimeout(() => setVisible(true), 80);
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  return (
    <main className="clients-page" aria-busy={isLoading}>
      {/* Hero Header Context */}
      <header className={`clients-hero ${visible ? 'hero-visible' : ''}`}>
        <h1 className="clients-heading">
          Our <span className="clients-italic">Clients.</span>
        </h1>
        <p className="clients-sub">
          Brands that chose OMS to move markets — strategy, creative, and production under one roof.
        </p>
      </header>

      {/* Grid Canvas Wrapper */}
      <section className="clients-grid-wrap" aria-label="Partner Directory">
        {isLoading && <p className="clients-status">Loading clients…</p>}
        {error && <p className="clients-status clients-error">{error}</p>}
        {!isLoading && !error && clients.length === 0 && (
          <p className="clients-status">No clients listed yet.</p>
        )}

        <div className="clients-grid">
          {clients.map((client, index) => (
            <ClientCard
              key={client.id}
              client={client}
              index={index}
              visible={visible}
            />
          ))}
        </div>
      </section>
    </main>
  );
}

// Sub-Component cleanly separating layout rendering logic
function ClientCard({ client, index, visible }) {
  const { name, logo, website } = client;

  const delay = Math.min(index * 80, 800); // max 800ms delay cap

  const cardContent = (
    <article
      className={`client-logo-card ${visible ? 'card-visible' : ''}`}
      style={{ animationDelay: `${delay}ms`, transitionDelay: `${delay}ms` }}
    >
      <div className="client-logo-frame">
        <img
          src={mediaUrl(logo)}
          alt={`${name} corporate logo`}
          loading="lazy"
        />
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
