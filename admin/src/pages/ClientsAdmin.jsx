import { useEffect, useState } from 'react';
import { api, mediaUrl } from '../api';

const emptyForm = { name: '', website: '', logoUrl: '' };

export default function ClientsAdmin() {
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
          <h1>Clients</h1>
          <p>Add client name + logo — they appear on the website Clients page.</p>
        </div>
        <button type="button" className="btn btn-primary" onClick={() => setShowForm(true)}>
          + Add client
        </button>
      </div>

      {error && <div className="error-banner">{error}</div>}

      {showForm && (
        <form className="card form-panel" onSubmit={handleSubmit}>
          <h2 style={{ fontFamily: 'var(--display)', marginBottom: 16 }}>New client</h2>

          <div className="field">
            <label>Client name *</label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Palm Hills"
              required
            />
          </div>

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

          <div className="field">
            <label>Website (optional)</label>
            <input
              value={form.website}
              onChange={(e) => setForm({ ...form, website: e.target.value })}
              placeholder="https://client.com"
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-ghost" onClick={reset}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving…' : 'Save client'}
            </button>
          </div>
        </form>
      )}

      <div className="list-stack">
        {clients.length === 0 ? (
          <div className="card empty">No clients yet.</div>
        ) : (
          clients.map((c) => (
            <div key={c.id} className="item-card">
              <img className="thumb" src={mediaUrl(c.logo)} alt={c.name} style={{ objectFit: 'contain', background: '#fff' }} />
              <div>
                <h3>{c.name}</h3>
                <div className="meta">{c.website || 'No website'}</div>
              </div>
              <div className="row-actions">
                <button type="button" className="btn btn-danger btn-sm" onClick={() => remove(c.id)}>
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
