import { useEffect, useState } from 'react';
import { api, mediaUrl } from '../api';
import { useAuth } from '../AuthContext';

const emptyForm = { name: '', website: '', logoUrl: '' };

export default function ClientsAdmin() {
  const { isReadOnly } = useAuth();
  const [clients, setClients] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [logoFile, setLogoFile] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      const data = await api('/api/clients');
      setClients(data);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const reset = () => {
    setForm(emptyForm);
    setLogoFile(null);
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('name', form.name);
      if (form.website) fd.append('website', form.website);
      if (form.logoUrl) fd.append('logoUrl', form.logoUrl);
      if (logoFile) fd.append('logo', logoFile);

      await api('/api/clients', { method: 'POST', body: fd });
      reset();
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    if (!window.confirm('Delete this client?')) return;
    try {
      await api(`/api/clients/${id}`, { method: 'DELETE' });
      setClients((list) => list.filter((c) => c.id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1>Clients</h1>
            {isReadOnly && <span className="badge badge-manager">وضع المشاهدة فقط</span>}
          </div>
          <p>Client logos — displayed cleanly on the website Clients page.</p>
        </div>
        {!isReadOnly && (
          <button type="button" className="btn btn-primary" onClick={() => setShowForm(true)}>
            + Add client logo
          </button>
        )}
      </div>

      {error && <div className="error-banner">{error}</div>}

      {showForm && (
        <form className="card form-panel" onSubmit={handleSubmit}>
          <h2 style={{ fontFamily: 'var(--display)', marginBottom: 16 }}>New client logo</h2>

          <div className="grid-2">
            <div className="field">
              <label>Logo image *</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
              />
            </div>
            <div className="field">
              <label>Or logo URL</label>
              <input
                value={form.logoUrl}
                onChange={(e) => setForm({ ...form, logoUrl: e.target.value })}
                placeholder="https://..."
              />
            </div>
          </div>

          <div className="grid-2">
            <div className="field">
              <label>Client name (optional / اختياري)</label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Brand Name"
              />
            </div>
            <div className="field">
              <label>Website (optional)</label>
              <input
                value={form.website}
                onChange={(e) => setForm({ ...form, website: e.target.value })}
                placeholder="https://client.com"
              />
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-ghost" onClick={reset}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving…' : 'Save client logo'}
            </button>
          </div>
        </form>
      )}

      <div>
        {clients.length === 0 ? (
          <div className="card empty">No client logos yet.</div>
        ) : (
          <div className="clients-admin-grid">
            {clients.map((c) => (
              <div key={c.id} className="client-admin-card" title={c.website || 'Client logo'}>
                <div className="client-admin-thumb-wrapper">
                  <img
                    src={mediaUrl(c.logo)}
                    alt="Client logo"
                    loading="lazy"
                  />
                </div>
                <div className="client-admin-card-actions">
                  {c.website ? (
                    <a
                      href={c.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-ghost btn-sm"
                      style={{ padding: '2px 6px', fontSize: '11px' }}
                      title={c.website}
                    >
                      🔗
                    </a>
                  ) : <span />}
                  {!isReadOnly && (
                    <button
                      type="button"
                      className="btn btn-danger btn-sm"
                      style={{ padding: '2px 8px', fontSize: '11px' }}
                      onClick={() => remove(c.id)}
                      title="Delete logo"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
