import { useEffect, useState } from 'react';
import { api, mediaUrl } from '../api';

export const VIDEO_CATEGORIES = [
  'Furniture',
  'Electronics',
  'Food and Beverages',
  'Real Estate',
  'Cosmetics',
  'Pharmaceutical',
  'Clothes',
  'Paints',
  'Banking and Finance',
];

const emptyForm = {
  brand: '',
  title: '',
  desc: '',
  category: '',
  youtubeUrl: '',
  featured: true,
};

export default function Videos() {
  const [videos, setVideos] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [mode, setMode] = useState('youtube');
  const [videoFile, setVideoFile] = useState(null);
  const [thumbFile, setThumbFile] = useState(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const load = async () => {
    try {
      const data = await api('/api/videos');
      setVideos(data);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const reset = () => {
    setForm(emptyForm);
    setVideoFile(null);
    setThumbFile(null);
    setMode('youtube');
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      if (!form.category) {
        setError('Category is required');
        setSaving(false);
        return;
      }

      const fd = new FormData();
      fd.append('brand', form.brand);
      fd.append('title', form.title);
      fd.append('desc', form.desc);
      fd.append('category', form.category);
      fd.append('featured', String(form.featured));
      fd.append('type', mode);
      if (mode === 'youtube') {
        fd.append('youtubeUrl', form.youtubeUrl);
      } else if (videoFile) {
        fd.append('video', videoFile);
      }
      if (thumbFile) fd.append('thumbnail', thumbFile);

      await api('/api/videos', { method: 'POST', body: fd });
      reset();
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    if (!window.confirm('Delete this video?')) return;
    try {
      await api(`/api/videos/${id}`, { method: 'DELETE' });
      setVideos((list) => list.filter((v) => v.id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Production TV</h1>
          <p>Add YouTube links or upload video files — they appear on the website Production TV page.</p>
        </div>
        <button type="button" className="btn btn-primary" onClick={() => setShowForm(true)}>
          + Add video
        </button>
      </div>

      {error && <div className="error-banner">{error}</div>}

      {showForm && (
        <form className="card form-panel" onSubmit={handleSubmit}>
          <h2 style={{ fontFamily: 'var(--display)', marginBottom: 16 }}>New video</h2>

          <div className="chips" style={{ marginBottom: 16 }}>
            <button type="button" className={`chip ${mode === 'youtube' ? 'active' : ''}`} onClick={() => setMode('youtube')}>
              YouTube link
            </button>
            <button type="button" className={`chip ${mode === 'file' ? 'active' : ''}`} onClick={() => setMode('file')}>
              Upload video file
            </button>
          </div>

          <div className="grid-2">
            <div className="field">
              <label>Brand *</label>
              <input
                value={form.brand}
                onChange={(e) => setForm({ ...form, brand: e.target.value })}
                placeholder="e.g. SADEN Travel"
                required
              />
            </div>
            <div className="field">
              <label>Title *</label>
              <input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="field">
            <label>Category *</label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              required
            >
              <option value="">Select a category…</option>
              {VIDEO_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label>Description</label>
            <textarea
              value={form.desc}
              onChange={(e) => setForm({ ...form, desc: e.target.value })}
              placeholder="Short campaign description…"
            />
          </div>

          {mode === 'youtube' ? (
            <div className="field">
              <label>YouTube URL *</label>
              <input
                value={form.youtubeUrl}
                onChange={(e) => setForm({ ...form, youtubeUrl: e.target.value })}
                placeholder="https://www.youtube.com/watch?v=..."
                required
              />
            </div>
          ) : (
            <div className="field">
              <label>Video file *</label>
              <input
                type="file"
                accept="video/*"
                onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
                required
              />
            </div>
          )}

          <div className="field">
            <label>Thumbnail (optional)</label>
            <input type="file" accept="image/*" onChange={(e) => setThumbFile(e.target.files?.[0] || null)} />
          </div>

          <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, color: 'var(--muted)' }}>
            <input
              type="checkbox"
              checked={form.featured}
              onChange={(e) => setForm({ ...form, featured: e.target.checked })}
            />
            Show in slideshow (featured)
          </label>

          <div className="modal-actions">
            <button type="button" className="btn btn-ghost" onClick={reset}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving…' : 'Publish video'}
            </button>
          </div>
        </form>
      )}

      <div className="list-stack">
        {videos.length === 0 ? (
          <div className="card empty">No videos yet. Add a YouTube link or upload a file.</div>
        ) : (
          videos.map((v) => (
            <div key={v.id} className="item-card">
              <div>
                {v.type === 'youtube' && v.embedUrl ? (
                  <div className="preview-box" style={{ width: 140, height: 80, aspectRatio: 'auto' }}>
                    <iframe src={v.embedUrl} title={v.title} allowFullScreen />
                  </div>
                ) : v.fileUrl ? (
                  <video className="thumb" src={mediaUrl(v.fileUrl)} style={{ width: 140, height: 80, objectFit: 'cover', borderRadius: 8 }} />
                ) : v.thumbnail ? (
                  <img className="thumb" src={mediaUrl(v.thumbnail)} alt={v.title} />
                ) : (
                  <div className="thumb" />
                )}
              </div>
              <div>
                <h3>{v.title}</h3>
                <div className="meta">
                  {v.category ? `${v.category} · ` : ''}
                  {v.brand} · {v.type === 'youtube' ? 'YouTube' : 'Uploaded file'}
                  {v.featured ? ' · Featured' : ''}
                </div>
                <p style={{ marginTop: 8, color: 'var(--muted)', fontSize: '0.9rem' }}>{v.desc}</p>
              </div>
              <div className="row-actions">
                <button type="button" className="btn btn-danger btn-sm" onClick={() => remove(v.id)}>
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
