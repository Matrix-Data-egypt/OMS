import { useEffect, useState } from 'react';
import { api, mediaUrl } from '../api';

const emptyForm = {
  title: '',
  author: 'OMS Editorial',
  desc: '',
  content: '',
  imgUrl: '',
  published: true,
};

export default function BlogAdmin() {
  const [posts, setPosts] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [imageFile, setImageFile] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      const data = await api('/api/blog/admin/all');
      setPosts(data);
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
    setEditingId(null);
    setShowForm(false);
  };

  const startEdit = (post) => {
    setEditingId(post.id);
    setForm({
      title: post.title,
      author: post.author,
      desc: post.desc,
      content: post.content,
      imgUrl: post.img || '',
      published: post.published !== false,
    });
    setImageFile(null);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('title', form.title);
      fd.append('author', form.author);
      fd.append('desc', form.desc);
      fd.append('content', form.content);
      fd.append('published', String(form.published));
      if (form.imgUrl) fd.append('imgUrl', form.imgUrl);
      if (imageFile) fd.append('image', imageFile);

      if (editingId) {
        await api(`/api/blog/${editingId}`, { method: 'PUT', body: fd });
      } else {
        await api('/api/blog', { method: 'POST', body: fd });
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
    if (!window.confirm('Delete this blog post?')) return;
    try {
      await api(`/api/blog/${id}`, { method: 'DELETE' });
      setPosts((list) => list.filter((p) => p.id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Blog</h1>
          <p>Write posts with a title and full article body — they show on the company website Blog page.</p>
        </div>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => {
            setEditingId(null);
            setForm(emptyForm);
            setShowForm(true);
          }}
        >
          + New post
        </button>
      </div>

      {error && <div className="error-banner">{error}</div>}

      {showForm && (
        <form className="card form-panel" onSubmit={handleSubmit}>
          <h2 style={{ fontFamily: 'var(--display)', marginBottom: 16 }}>
            {editingId ? 'Edit post' : 'New blog post'}
          </h2>

          <div className="field">
            <label>Topic / Title *</label>
            <input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Article title"
              required
            />
          </div>

          <div className="grid-2">
            <div className="field">
              <label>Author</label>
              <input
                value={form.author}
                onChange={(e) => setForm({ ...form, author: e.target.value })}
              />
            </div>
            <div className="field">
              <label>Short description</label>
              <input
                value={form.desc}
                onChange={(e) => setForm({ ...form, desc: e.target.value })}
                placeholder="Card summary on the website"
              />
            </div>
          </div>

          <div className="field">
            <label>Full post content *</label>
            <textarea
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              placeholder="Write your article here…"
              style={{ minHeight: 220 }}
              required
            />
          </div>

          <div className="grid-2">
            <div className="field">
              <label>Cover image URL (optional)</label>
              <input
                value={form.imgUrl}
                onChange={(e) => setForm({ ...form, imgUrl: e.target.value })}
                placeholder="https://..."
              />
            </div>
            <div className="field">
              <label>Or upload cover image</label>
              <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] || null)} />
            </div>
          </div>

          <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, color: 'var(--muted)' }}>
            <input
              type="checkbox"
              checked={form.published}
              onChange={(e) => setForm({ ...form, published: e.target.checked })}
            />
            Published on website
          </label>

          <div className="modal-actions">
            <button type="button" className="btn btn-ghost" onClick={reset}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving…' : editingId ? 'Update post' : 'Publish post'}
            </button>
          </div>
        </form>
      )}

      <div className="list-stack">
        {posts.length === 0 ? (
          <div className="card empty">No blog posts yet.</div>
        ) : (
          posts.map((p) => (
            <div key={p.id} className="item-card">
              {p.img ? (
                <img className="thumb" src={mediaUrl(p.img)} alt={p.title} />
              ) : (
                <div className="thumb" style={{ background: 'var(--border)' }} />
              )}
              <div>
                <h3>{p.title}</h3>
                <div className="meta">
                  By {p.author} · {p.date} · {p.readTime}
                  {p.published === false ? ' · Draft' : ' · Published'}
                </div>
                <p style={{ marginTop: 8, color: 'var(--muted)', fontSize: '0.9rem' }}>{p.desc}</p>
              </div>
              <div className="row-actions">
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => startEdit(p)}>
                  Edit
                </button>
                <button type="button" className="btn btn-danger btn-sm" onClick={() => remove(p.id)}>
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
