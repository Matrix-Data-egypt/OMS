import { useEffect, useState } from 'react';
import { api } from '../api';

const STATUS_OPTIONS = [
  { value: 'new', label: 'New' },
  { value: 'in_review', label: 'In Review' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'closed', label: 'Closed' },
];

export default function Briefs() {
  const [briefs, setBriefs] = useState([]);
  const [selected, setSelected] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const data = await api('/api/briefs');
      setBriefs(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const updateStatus = async (id, status) => {
    try {
      const updated = await api(`/api/briefs/${id}/status`, {
        method: 'PATCH',
        body: { status },
      });
      setBriefs((list) => list.map((b) => (b.id === id ? updated : b)));
      if (selected?.id === id) setSelected(updated);
    } catch (err) {
      setError(err.message);
    }
  };

  const remove = async (id) => {
    if (!window.confirm('Delete this project brief?')) return;
    try {
      await api(`/api/briefs/${id}`, { method: 'DELETE' });
      setBriefs((list) => list.filter((b) => b.id !== id));
      if (selected?.id === id) setSelected(null);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Start Project</h1>
          <p>Client briefs from the website contact form — same fields as Strategic Brief Architect.</p>
        </div>
        <button type="button" className="btn btn-ghost" onClick={load}>
          Refresh
        </button>
      </div>

      {error && <div className="error-banner">{error}</div>}

      <div className="card">
        {loading ? (
          <div className="empty">Loading briefs…</div>
        ) : briefs.length === 0 ? (
          <div className="empty">No project briefs yet. When a client submits Start a Project on the site, it appears here.</div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Client</th>
                <th>Company</th>
                <th>Objective</th>
                <th>Sector</th>
                <th>Status</th>
                <th>Date</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {briefs.map((b) => (
                <tr key={b.id}>
                  <td>
                    <strong>{b.fullName}</strong>
                    <div className="meta">{b.email}</div>
                  </td>
                  <td>{b.companyName}</td>
                  <td>{b.objective}</td>
                  <td>{b.sector}</td>
                  <td>
                    <span className={`badge badge-${b.status}`}>{b.status.replace('_', ' ')}</span>
                  </td>
                  <td>{new Date(b.createdAt).toLocaleString()}</td>
                  <td>
                    <div className="row-actions">
                      <button type="button" className="btn btn-ghost btn-sm" onClick={() => setSelected(b)}>
                        View
                      </button>
                      <button type="button" className="btn btn-danger btn-sm" onClick={() => remove(b.id)}>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {selected && (
        <div className="modal-backdrop" onClick={() => setSelected(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Project Brief</h2>
            <div className="grid-2">
              <div className="field">
                <label>Full Name</label>
                <input value={selected.fullName} readOnly />
              </div>
              <div className="field">
                <label>Company</label>
                <input value={selected.companyName} readOnly />
              </div>
              <div className="field">
                <label>Email</label>
                <input value={selected.email} readOnly />
              </div>
              <div className="field">
                <label>Phone (WhatsApp)</label>
                <input value={selected.phone} readOnly />
              </div>
              <div className="field">
                <label>Campaign Objective</label>
                <input value={selected.objective} readOnly />
              </div>
              <div className="field">
                <label>Industry Sector</label>
                <input value={selected.sector} readOnly />
              </div>
            </div>
            <div className="field">
              <label>Project Summary & Core Challenges</label>
              <textarea value={selected.summary} readOnly />
            </div>
            <div className="field">
              <label>Status</label>
              <select
                value={selected.status}
                onChange={(e) => updateStatus(selected.id, e.target.value)}
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="modal-actions">
              <a className="btn btn-ghost" href={`mailto:${selected.email}`}>
                Email client
              </a>
              <a className="btn btn-ghost" href={`https://wa.me/${selected.phone.replace(/\D/g, '')}`} target="_blank" rel="noreferrer">
                WhatsApp
              </a>
              <button type="button" className="btn btn-primary" onClick={() => setSelected(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
