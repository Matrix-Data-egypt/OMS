import { useEffect, useState } from 'react';
import { api, mediaUrl } from '../api';
import { useAuth } from '../AuthContext';

const emptyForm = { name: '', website: '', logoUrl: '' };

export default function ClientsAdmin() {
  const { isReadOnly } = useAuth();
  const [clients, setClients] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingClient, setEditingClient] = useState(null);
  const [logoFile, setLogoFile] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [bulkFiles, setBulkFiles] = useState([]);
  const [bulkPreviews, setBulkPreviews] = useState([]);
  const [bulkSaving, setBulkSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
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
    setEditingClient(null);
    setLogoFile(null);
    setShowForm(false);
  };

  const handleEdit = (client) => {
    setEditingClient(client);
    setForm({
      name: client.name || '',
      website: client.website || '',
      logoUrl: client.logo?.startsWith('http') ? client.logo : '',
    });
    setLogoFile(null);
    setShowForm(true);
    setShowBulkUpload(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetBulk = () => {
    setBulkFiles([]);
    setBulkPreviews([]);
    setShowBulkUpload(false);
  };

  const handleBulkFilesChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setBulkFiles(files);
    const previews = files.map((file) => ({
      name: file.name,
      url: URL.createObjectURL(file),
    }));
    setBulkPreviews(previews);
  };

  const handleBulkSubmit = async () => {
    if (!bulkFiles.length) return;
    setError('');
    setSuccessMsg('');
    setBulkSaving(true);
    try {
      const fd = new FormData();
      bulkFiles.forEach((file) => {
        fd.append('logos', file);
      });

      const res = await api('/api/clients/bulk', { method: 'POST', body: fd });
      setSuccessMsg(`✓ تم بنجاح رفع ${res.count || bulkFiles.length} لوجو جديد!`);
      resetBulk();
      await load();
      setTimeout(() => setSuccessMsg(''), 6000);
    } catch (err) {
      setError(err.message || 'فشل في رفع اللوجوهات المجمعة');
    } finally {
      setBulkSaving(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('name', form.name);
      if (form.website !== undefined) fd.append('website', form.website);
      if (form.logoUrl !== undefined) fd.append('logoUrl', form.logoUrl);
      if (logoFile) fd.append('logo', logoFile);

      if (editingClient) {
        await api(`/api/clients/${editingClient.id}`, { method: 'PUT', body: fd });
        setSuccessMsg('✓ تم تعديل بيانات العميل بنجاح');
      } else {
        await api('/api/clients', { method: 'POST', body: fd });
        setSuccessMsg('✓ تم حفظ اللوجو بنجاح');
      }

      reset();
      await load();
      setTimeout(() => setSuccessMsg(''), 4000);
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
      if (editingClient?.id === id) reset();
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
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn btn-primary"
              style={{
                background: '#c68a4c',
                borderColor: '#c68a4c',
                color: '#fff',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
              onClick={() => {
                setShowBulkUpload(true);
                setShowForm(false);
              }}
            >
              <span>⚡</span> رفع مجمّع (Bulk 10+ Logos)
            </button>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => {
                setShowForm((prev) => !prev);
                setShowBulkUpload(false);
              }}
            >
              {showForm ? 'Cancel' : '+ Add single logo'}
            </button>
          </div>
        )}
      </div>

      {error && <div className="error-banner">{error}</div>}
      {successMsg && (
        <div
          style={{
            background: 'rgba(34, 197, 94, 0.1)',
            border: '1px solid rgba(34, 197, 94, 0.3)',
            color: '#16a34a',
            padding: '12px 18px',
            borderRadius: 8,
            marginBottom: 20,
            fontWeight: 600,
            fontSize: 14,
          }}
        >
          {successMsg}
        </div>
      )}

      {showBulkUpload && (
        <div className="card form-panel" style={{ marginBottom: 24, border: '2px dashed #c68a4c' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <div>
              <h2 style={{ fontFamily: 'var(--display)', margin: '0 0 4px', fontSize: 20, color: 'var(--text)' }}>
                ⚡ رفع مجمّع للوجوهات (Bulk Logo Upload)
              </h2>
              <p style={{ margin: 0, color: 'var(--muted)', fontSize: 13 }}>
                حدد أكثر من 10 أو 20 أو 50 لوجو دفعة واحدة من جهازك وسيتم رفعها وإضافتها للموقع فوراً!
              </p>
            </div>
            <button type="button" className="btn btn-ghost btn-sm" onClick={resetBulk}>
              إلغاء ✕
            </button>
          </div>

          <div
            style={{
              padding: '30px 20px',
              textAlign: 'center',
              border: '2px dashed var(--border)',
              borderRadius: 12,
              background: 'rgba(198, 138, 76, 0.04)',
              cursor: 'pointer',
              marginBottom: 16,
              transition: 'all 0.2s ease',
            }}
            onClick={() => document.getElementById('bulk-file-input')?.click()}
          >
            <input
              id="bulk-file-input"
              type="file"
              multiple
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleBulkFilesChange}
            />
            <div style={{ fontSize: 40, marginBottom: 8 }}>📂</div>
            <strong style={{ display: 'block', fontSize: 16, marginBottom: 4, color: 'var(--text)' }}>
              اضغط هنا لاختيار عدة لوجوهات معاً (أو اسحب الملفات هنا)
            </strong>
            <span style={{ fontSize: 13, color: 'var(--muted)' }}>
              يمكنك تظليل واختيار عدد غير محدود من ملفات الصور (PNG, JPG, SVG, WebP)
            </span>
          </div>

          {bulkFiles.length > 0 && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: '#c68a4c' }}>
                  ✓ تم تحديد {bulkFiles.length} لوجو جاهز للرفع:
                </span>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  style={{ fontSize: 12 }}
                  onClick={() => {
                    setBulkFiles([]);
                    setBulkPreviews([]);
                  }}
                >
                  مسح التحديد
                </button>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(85px, 1fr))',
                  gap: 10,
                  maxHeight: 240,
                  overflowY: 'auto',
                  padding: 12,
                  background: 'rgba(0,0,0,0.02)',
                  borderRadius: 10,
                  border: '1px solid var(--border)',
                  marginBottom: 16,
                }}
              >
                {bulkPreviews.map((prev, idx) => (
                  <div
                    key={idx}
                    style={{
                      position: 'relative',
                      aspectRatio: '1/1',
                      border: '1px solid var(--border)',
                      borderRadius: 8,
                      overflow: 'hidden',
                      background: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: 6,
                    }}
                    title={prev.name}
                  >
                    <img
                      src={prev.url}
                      alt={prev.name}
                      style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                    />
                    <span
                      style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        background: 'rgba(0,0,0,0.7)',
                        color: '#fff',
                        fontSize: 9,
                        padding: '2px 4px',
                        textAlign: 'center',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {prev.name}
                    </span>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-ghost" onClick={resetBulk}>
                  إلغاء
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  disabled={bulkSaving}
                  onClick={handleBulkSubmit}
                  style={{ minWidth: 220, background: '#c68a4c', borderColor: '#c68a4c' }}
                >
                  {bulkSaving ? `جاري رفع ${bulkFiles.length} لوجو...` : `🚀 رفع ${bulkFiles.length} لوجو فوراً`}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {showForm && (
        <form className="card form-panel" onSubmit={handleSubmit}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h2 style={{ fontFamily: 'var(--display)', margin: 0 }}>
              {editingClient ? 'تعديل بيانات العميل / اللوجو (Edit Client)' : 'New client logo'}
            </h2>
            {editingClient && (
              <span className="badge badge-in_review">وضع التعديل</span>
            )}
          </div>

          <div className="grid-2">
            <div className="field">
              <label>
                {editingClient
                  ? 'تغيير صورة اللوجو (اختياري - اتركه فارغاً للاحتفاظ باللوجو الحالي)'
                  : 'Logo image *'}
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
                required={!editingClient && !form.logoUrl}
              />
              {editingClient?.logo && (
                <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 12, color: 'var(--muted)' }}>اللوجو الحالي:</span>
                  <img
                    src={mediaUrl(editingClient.logo)}
                    alt="Current Logo"
                    style={{
                      maxHeight: 38,
                      maxWidth: 80,
                      objectFit: 'contain',
                      background: '#fff',
                      padding: '3px 6px',
                      borderRadius: 6,
                      border: '1px solid var(--border)',
                    }}
                  />
                </div>
              )}
            </div>
            <div className="field">
              <label>Or logo URL (رابط اللوجو إن وُجد)</label>
              <input
                value={form.logoUrl}
                onChange={(e) => setForm({ ...form, logoUrl: e.target.value })}
                placeholder="https://..."
              />
            </div>
          </div>

          <div className="grid-2">
            <div className="field">
              <label>Client name (اسم العميل / البراند)</label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Brand Name"
              />
            </div>
            <div className="field">
              <label>Website (موقع العميل الإلكتروني)</label>
              <input
                value={form.website}
                onChange={(e) => setForm({ ...form, website: e.target.value })}
                placeholder="https://client.com"
              />
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-ghost" onClick={reset}>
              إلغاء (Cancel)
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving…' : (editingClient ? 'حفظ التعديلات (Save changes)' : 'Save client logo')}
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
              <div key={c.id} className="client-admin-card" title={c.website || c.name || 'Client logo'}>
                <div className="client-admin-thumb-wrapper">
                  <img
                    src={mediaUrl(c.logo)}
                    alt={c.name || 'Client logo'}
                    loading="lazy"
                  />
                </div>
                {c.name && (
                  <div style={{
                    fontSize: 12,
                    fontWeight: 600,
                    textAlign: 'center',
                    padding: '4px 6px',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    borderTop: '1px solid var(--border)',
                    background: 'rgba(255,255,255,0.02)'
                  }}>
                    {c.name}
                  </div>
                )}
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
                    <>
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        style={{ padding: '2px 8px', fontSize: '11px' }}
                        onClick={() => handleEdit(c)}
                        title="تعديل بيانات العميل"
                      >
                        ✏️ تعديل
                      </button>
                      <button
                        type="button"
                        className="btn btn-danger btn-sm"
                        style={{ padding: '2px 8px', fontSize: '11px' }}
                        onClick={() => remove(c.id)}
                        title="Delete logo"
                      >
                        حذف
                      </button>
                    </>
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
