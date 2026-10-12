import { useEffect, useState } from 'react';
import { api, mediaUrl } from '../api';
import { useAuth } from '../AuthContext';

const emptyForm = { companyName: '', description: '', imageUrl: '' };

export default function PossAdmin() {
  const { isReadOnly } = useAuth();
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      const data = await api('/api/poss');
      setItems(data);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const reset = () => {
    setForm(emptyForm);
    setImageFile(null);
    setImagePreview('');
    setEditingId(null);
    setShowForm(false);
  };

  const startEdit = (item) => {
    setEditingId(item.id);
    setForm({
      companyName: item.companyName || '',
      description: item.description || '',
      imageUrl: item.image || '',
    });
    setImageFile(null);
    setImagePreview(item.image ? mediaUrl(item.image) : '');
    setShowForm(true);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    setImageFile(file || null);
    if (file) {
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('companyName', form.companyName);
      fd.append('description', form.description);
      if (form.imageUrl) fd.append('imageUrl', form.imageUrl);
      if (imageFile) fd.append('image', imageFile);

      if (editingId) {
        await api(`/api/poss/${editingId}`, { method: 'PUT', body: fd });
      } else {
        await api('/api/poss', { method: 'POST', body: fd });
      }
      reset();
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    if (!window.confirm('Delete this POSS item?')) return;
    try {
      await api(`/api/poss/${id}`, { method: 'DELETE' });
      setItems((list) => list.filter((c) => c.id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1>POSS (Point of Sale Services)</h1>
            {isReadOnly && <span className="badge badge-manager">وضع المشاهدة فقط</span>}
          </div>
          <p>Manage POS displays, brand activations & retail setups.</p>
        </div>
        {!isReadOnly && (
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => {
              if (showForm) reset();
              else setShowForm(true);
            }}
          >
            {showForm ? 'Cancel' : '+ Add POSS Item'}
          </button>
        )}
      </div>

      {error && <div className="error-banner">{error}</div>}

      {showForm && (
        <form className="card form-panel" onSubmit={handleSubmit} style={{ marginBottom: 24 }}>
          <h2 style={{ fontFamily: 'var(--display)', marginBottom: 16 }}>
            {editingId ? 'Edit POSS Item' : 'New POSS Item'}
          </h2>

          <div className="field">
            <label>Company Name (اسم الشركة) *</label>
            <input
              value={form.companyName}
              onChange={(e) => setForm({ ...form, companyName: e.target.value })}
              placeholder="e.g. Aroma Cosmetics"
              required
            />
          </div>

          <div className="field">
            <label>Short Description (شرح بسيط) *</label>
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="e.g. Customized Point of Sale displays, retail booths and store branding units..."
              required
            />
          </div>

          <div className="grid-2">
            <div className="field">
              <label>Upload Image (صورة) {!editingId && !form.imageUrl ? '*' : ''}</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                required={!editingId && !form.imageUrl}
              />
            </div>
            <div className="field">
              <label>Or Image URL</label>
              <input
                value={form.imageUrl}
                onChange={(e) => {
                  setForm({ ...form, imageUrl: e.target.value });
                  if (!imageFile) setImagePreview(e.target.value);
                }}
                placeholder="https://..."
              />
            </div>
          </div>

          {imagePreview && (
            <div style={{ marginBottom: 16 }}>
              <span style={{ fontSize: 12, color: 'var(--muted)', display: 'block', marginBottom: 6 }}>
                Image Preview:
              </span>
              <img
                src={imagePreview}
                alt="Preview"
                style={{
                  maxHeight: 180,
                  maxWidth: '100%',
                  borderRadius: 8,
                  objectFit: 'cover',
                  border: '1px solid var(--border)',
                }}
              />
            </div>
          )}

          <div style={{ display: 'flex', gap: 12 }}>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving…' : editingId ? 'Update POSS Item' : 'Save POSS Item'}
            </button>
            <button type="button" className="btn btn-ghost" onClick={reset}>
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="card">
        {items.length === 0 ? (
          <p className="empty">No POSS items yet. Click &quot;+ Add POSS Item&quot; to create one.</p>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th style={{ width: 100 }}>Image</th>
                  <th>Company Name</th>
                  <th>Short Description</th>
                  <th style={{ width: 150 }}>Created</th>
                  <th style={{ width: 140 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id}>
                    <td>
                      {item.image ? (
                        <img
                          src={mediaUrl(item.image)}
                          alt={item.companyName}
                          style={{
                            width: 80,
                            height: 52,
                            objectFit: 'cover',
                            borderRadius: 6,
                            border: '1px solid var(--border)',
                          }}
                        />
                      ) : (
                        <span style={{ color: 'var(--muted)', fontSize: 12 }}>No image</span>
                      )}
                    </td>
                    <td>
                      <strong style={{ fontSize: 14 }}>{item.companyName}</strong>
                    </td>
                    <td>
                      <p style={{ margin: 0, fontSize: 13, color: 'var(--muted)', maxWidth: 360, lineHeight: 1.4 }}>
                        {item.description}
                      </p>
                    </td>
                    <td style={{ fontSize: 12, color: 'var(--muted)' }}>
                      {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : '—'}
                    </td>
                    <td>
                      {isReadOnly ? (
                        <span style={{ fontSize: 12, color: 'var(--muted)' }}>مشاهدة فقط</span>
                      ) : (
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button
                            type="button"
                            className="btn btn-ghost btn-sm"
                            onClick={() => startEdit(item)}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            className="btn btn-danger btn-sm"
                            onClick={() => remove(item.id)}
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
