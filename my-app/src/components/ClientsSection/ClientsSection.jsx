import React, { useEffect, useState } from 'react';
import './ClientsSection.css';
import { api, mediaUrl } from '../../api';

export default function ClientsSection() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api('/api/clients')
      .then(setClients)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="clients-page">
      <section className="clients-hero">
        <span className="clients-badge">Trusted Partnerships</span>
        <h1 className="clients-heading">
          Our <span className="clients-italic">Clients.</span>
        </h1>
        <p className="clients-sub">
          Brands that chose OMS to move markets — strategy, creative, and production under one roof.
        </p>
      </section>

      <section className="clients-grid-wrap">
        {loading && <p className="clients-status">Loading clients…</p>}
        {error && <p className="clients-status clients-error">{error}</p>}
        {!loading && !error && clients.length === 0 && (
          <p className="clients-status">No clients listed yet.</p>
        )}

        <div className="clients-grid">
          {clients.map((client) => {
            const inner = (
              <>
                <div className="client-logo-frame">
                  <img src={mediaUrl(client.logo)} alt={client.name} />
                </div>
                <h3 className="client-name">{client.name}</h3>
              </>
            );

            if (client.website) {
              return (
                <a
                  key={client.id}
                  href={client.website}
                  target="_blank"
                  rel="noreferrer"
                  className="client-link"
                >
                  <div className="client-logo-card">{inner}</div>
                </a>
              );
            }

            return (
              <div className="client-logo-card" key={client.id}>
                {inner}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
