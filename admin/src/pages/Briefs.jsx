import { useEffect, useState } from 'react';
import { api } from '../api';
import { useAuth } from '../AuthContext';

const STATUS_OPTIONS = [
  { value: 'new', label: 'New (جديد)' },
  { value: 'in_review', label: 'In Review (قيد المراجعة)' },
  { value: 'contacted', label: 'Contacted (تم التواصل)' },
  { value: 'closed', label: 'Closed (مغلق)' },
];

export default function Briefs() {
  const { isAdmin, isManager, isSales } = useAuth();
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
    if (isManager) return; // Manager is strictly read-only
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
    if (!isAdmin) return; // Only admin can delete
    if (!window.confirm('هل أنت متأكد من حذف هذا الطلب نهائياً؟')) return;
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1>Start Project — طلبات العملاء</h1>
            {isSales && (
              <span className="badge badge-sales">فريق المبيعات (Sales)</span>
            )}
            {isManager && (
              <span className="badge badge-manager">عرض فقط (Read Only)</span>
            )}
          </div>
          <p>
            {isSales 
              ? 'متابعة بيانات العملاء والشركات المهتمة والتواصل المباشر معهم عبر واتساب أو البريد الإلكتروني.'
              : 'طلبات بدء المشاريع الواردة من نموذج الموقع (Start a Project Briefs).'}
          </p>
        </div>
        <button type="button" className="btn btn-ghost" onClick={load}>
          تحديث (Refresh)
        </button>
      </div>

      {error && <div className="error-banner">{error}</div>}

      <div className="card">
        {loading ? (
          <div className="empty">جاري تحميل الطلبات…</div>
        ) : briefs.length === 0 ? (
          <div className="empty">لا توجد طلبات مشاريع حتى الآن. عندما يرسل عميل طلباً عبر الموقع سيظهر هنا مباشرة.</div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>العميل / التواصل</th>
                <th>اسم الشركة</th>
                <th>هدف الحملة</th>
                <th>القطاع</th>
                <th>حالة المتابعة</th>
                <th>تاريخ الطلب</th>
                <th>الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {briefs.map((b) => (
                <tr key={b.id}>
                  <td>
                    <strong>{b.fullName}</strong>
                    <div className="meta">{b.phone} • {b.email}</div>
                  </td>
                  <td><strong>{b.companyName}</strong></td>
                  <td>{b.objective}</td>
                  <td>{b.sector}</td>
                  <td>
                    <span className={`badge badge-${b.status}`}>
                      {STATUS_OPTIONS.find((s) => s.value === b.status)?.label || b.status}
                    </span>
                  </td>
                  <td>{new Date(b.createdAt).toLocaleString()}</td>
                  <td>
                    <div className="row-actions">
                      <button type="button" className="btn btn-ghost btn-sm" onClick={() => setSelected(b)}>
                        عرض وتواصل
                      </button>
                      {/* Delete button: strictly reserved for Admin */}
                      {isAdmin && (
                        <button type="button" className="btn btn-danger btn-sm" onClick={() => remove(b.id)}>
                          حذف
                        </button>
                      )}
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
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '640px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2>تفاصيل طلب المشروع (Project Brief)</h2>
              <span className={`badge badge-${selected.status}`}>
                {STATUS_OPTIONS.find((s) => s.value === selected.status)?.label || selected.status}
              </span>
            </div>

            <div className="grid-2">
              <div className="field">
                <label>اسم العميل (Full Name)</label>
                <input value={selected.fullName} readOnly />
              </div>
              <div className="field">
                <label>الشركة (Company)</label>
                <input value={selected.companyName} readOnly />
              </div>
              <div className="field">
                <label>البريد الإلكتروني (Email)</label>
                <input value={selected.email} readOnly />
              </div>
              <div className="field">
                <label>الهاتف / واتساب (Phone)</label>
                <input value={selected.phone} readOnly />
              </div>
              <div className="field">
                <label>هدف الحملة (Campaign Objective)</label>
                <input value={selected.objective} readOnly />
              </div>
              <div className="field">
                <label>قطاع النشاط (Industry Sector)</label>
                <input value={selected.sector} readOnly />
              </div>
            </div>

            <div className="field">
              <label>ملخص المشروع والتحديات (Project Summary)</label>
              <textarea value={selected.summary} readOnly rows={4} />
            </div>

            <div className="field">
              <label>
                تحديث حالة المتابعة (Sales Status)
                {isManager && <span style={{ color: 'var(--muted)', fontSize: '0.8rem', marginRight: '6px' }}>(وضع المشاهدة فقط - غير متاح للتعديل)</span>}
              </label>
              <select
                value={selected.status}
                disabled={isManager}
                onChange={(e) => updateStatus(selected.id, e.target.value)}
                style={{ opacity: isManager ? 0.7 : 1 }}
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Direct Communication Channels for Sales & Admin */}
            <div style={{
              background: 'rgba(245, 158, 11, 0.08)',
              border: '1px solid rgba(245, 158, 11, 0.25)',
              borderRadius: '10px',
              padding: '14px 18px',
              margin: '18px 0',
              display: 'flex',
              flexWrap: 'wrap',
              gap: '12px',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <span style={{ fontWeight: 700, color: '#f59e0b', fontSize: '0.88rem' }}>
                📞 قنوات التواصل المباشر مع العميل:
              </span>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <a
                  className="btn btn-primary btn-sm"
                  href={`https://wa.me/${selected.phone.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noreferrer"
                  style={{ background: '#25D366', borderColor: '#25D366', color: '#fff' }}
                >
                  💬 فتح واتساب (WhatsApp)
                </a>
                <a 
                  className="btn btn-ghost btn-sm" 
                  href={`mailto:${selected.email}?subject=Regarding Your OMS Project Brief (${encodeURIComponent(selected.companyName)})`}
                >
                  ✉️ إرسال بريد (Email)
                </a>
                <a 
                  className="btn btn-ghost btn-sm" 
                  href={`tel:${selected.phone}`}
                >
                  📱 اتصال هاتفي
                </a>
              </div>
            </div>

            <div className="modal-actions">
              {isAdmin && (
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={() => remove(selected.id)}
                  style={{ marginRight: 'auto' }}
                >
                  حذف الطلب
                </button>
              )}
              <button type="button" className="btn btn-primary" onClick={() => setSelected(null)}>
                إغلاق (Close)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
