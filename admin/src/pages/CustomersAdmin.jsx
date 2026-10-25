import { useEffect, useState } from 'react';
import { api } from '../api';
import { useAuth } from '../AuthContext';

export default function CustomersAdmin() {
  const { isAdmin } = useAuth();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');
  const [deleting, setDeleting]   = useState(null);
  const [search, setSearch]       = useState('');

  const loadCustomers = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api('/api/customers');
      setCustomers(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`هل أنت متأكد من حذف العميل "${name}"؟`)) return;
    setDeleting(id);
    try {
      await api(`/api/customers/${id}`, { method: 'DELETE' });
      setCustomers((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      setError(err.message);
    } finally {
      setDeleting(null);
    }
  };

  const fmt = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleString('ar-EG', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  };

  if (!isAdmin) {
    return (
      <div className="card empty">
        <h2>غير مصرح لك بالوصول</h2>
        <p>صفحة إدارة العملاء متاحة فقط لحساب الأدمن العام.</p>
      </div>
    );
  }

  const filtered = customers.filter((c) => {
    const q = search.toLowerCase();
    return (
      c.fullName?.toLowerCase().includes(q) ||
      c.email?.toLowerCase().includes(q) ||
      c.phone?.toLowerCase().includes(q)
    );
  });

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>العملاء المسجلون (Registered Customers)</h1>
          <p>
            قائمة بالعملاء اللي سجّلوا حساب عبر موقع OMS •{' '}
            <strong>{customers.length}</strong> عميل
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button type="button" className="btn btn-ghost" onClick={loadCustomers}>
            🔄 تحديث
          </button>
        </div>
      </div>

      {error && <div className="error-banner">{error}</div>}

      {/* Stats */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '16px',
          marginBottom: '24px',
        }}
      >
        <div className="card" style={{ padding: '16px 20px', borderTop: '3px solid #ed3a3a' }}>
          <div style={{ fontSize: '2rem', fontWeight: 700 }}>{customers.length}</div>
          <div style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>إجمالي العملاء</div>
        </div>
        <div className="card" style={{ padding: '16px 20px', borderTop: '3px solid #f59e0b' }}>
          <div style={{ fontSize: '2rem', fontWeight: 700 }}>
            {customers.filter((c) => c.lastLoginAt).length}
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>سبق دخولهم للموقع</div>
        </div>
        <div className="card" style={{ padding: '16px 20px', borderTop: '3px solid #10b981' }}>
          <div style={{ fontSize: '2rem', fontWeight: 700 }}>
            {
              customers.filter((c) => {
                const d = new Date(c.registeredAt);
                const now = new Date();
                return now - d < 7 * 24 * 60 * 60 * 1000;
              }).length
            }
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>مسجلون خلال 7 أيام</div>
        </div>
      </div>

      {/* Search */}
      <div style={{ marginBottom: '16px' }}>
        <input
          type="search"
          placeholder="ابحث بالاسم أو البريد أو الهاتف…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: '100%',
            maxWidth: '360px',
            padding: '0.6rem 1rem',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            fontSize: '0.9rem',
            background: 'var(--surface)',
            color: 'var(--text)',
          }}
        />
      </div>

      {/* Table */}
      <div className="card">
        {loading ? (
          <div className="empty">جاري تحميل العملاء…</div>
        ) : filtered.length === 0 ? (
          <div className="empty">
            {search ? 'لا توجد نتائج للبحث' : 'لا يوجد عملاء مسجلون بعد'}
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>الاسم الكامل</th>
                  <th>البريد الإلكتروني</th>
                  <th>الجنس</th>
                  <th>الهاتف</th>
                  <th>تاريخ التسجيل</th>
                  <th>آخر دخول</th>
                  <th>إجراء</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c, idx) => (
                  <tr key={c.id}>
                    <td style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>{idx + 1}</td>
                    <td>
                      <strong>{c.fullName}</strong>
                    </td>
                    <td>
                      <a
                        href={`mailto:${c.email}`}
                        style={{ color: 'var(--primary)', textDecoration: 'none' }}
                      >
                        {c.email}
                      </a>
                    </td>
                    <td>{c.gender || '—'}</td>
                    <td>
                      {c.phone ? (
                        <a
                          href={`https://wa.me/${c.phone.replace(/\D/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ color: '#25d366', textDecoration: 'none' }}
                        >
                          📱 {c.phone}
                        </a>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>
                      {fmt(c.registeredAt)}
                    </td>
                    <td style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>
                      {fmt(c.lastLoginAt)}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        <a
                          href={`mailto:${c.email}`}
                          className="btn btn-ghost"
                          style={{ fontSize: '0.8rem', padding: '4px 10px' }}
                        >
                          ✉️ إيميل
                        </a>
                        {c.phone && (
                          <a
                            href={`https://wa.me/${c.phone.replace(/\D/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-ghost"
                            style={{ fontSize: '0.8rem', padding: '4px 10px', color: '#25d366' }}
                          >
                            💬 واتساب
                          </a>
                        )}
                        <button
                          type="button"
                          className="btn btn-danger"
                          style={{ fontSize: '0.8rem', padding: '4px 10px' }}
                          disabled={deleting === c.id}
                          onClick={() => handleDelete(c.id, c.fullName)}
                        >
                          {deleting === c.id ? '…' : '🗑️ حذف'}
                        </button>
                      </div>
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
