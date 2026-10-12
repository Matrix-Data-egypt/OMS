import { useEffect, useState } from 'react';
import { api } from '../api';
import { useAuth } from '../AuthContext';

const ROLES_LIST = [
  {
    key: 'admin',
    label: 'الادمن (Admin)',
    badgeColor: 'badge-admin',
    desc: 'كافة الصلاحيات (قراءة، إضافة، تعديل، حذف، وإدارة المستخدمين)',
  },
  {
    key: 'manager',
    label: 'مدير (Manager)',
    badgeColor: 'badge-manager',
    desc: 'مشاهدة فقط لجميع الصفحات لمعرفة ما بداخلها بدون تعديل أو حذف',
  },
  {
    key: 'sales',
    label: 'تيم Sales (المبيعات)',
    badgeColor: 'badge-sales',
    desc: 'دخول فقط على Start Project لمتابعة العملاء والتواصل عبر واتساب وإيميل',
  },
  {
    key: 'data_entry',
    label: 'مدخل بيانات (Data Entry)',
    badgeColor: 'badge-dataentry',
    desc: 'مفتوح له باقي الصفحات لإدخال وتعديل البيانات ماعدا Start Project',
  },
];

export default function UsersAdmin() {
  const { isAdmin } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    username: '',
    name: '',
    password: '',
    role: 'sales',
  });

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await api('/api/auth/users');
      setUsers(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      await api('/api/auth/users', {
        method: 'POST',
        body: form,
      });
      setShowModal(false);
      setForm({ username: '', name: '', password: '', role: 'sales' });
      await loadUsers();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="card empty">
        <h2>غير مصرح لك بالوصول</h2>
        <p>صفحة إدارة المستخدمين والصلاحيات متاحة فقط لحساب الأدمن العام.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>إدارة الصلاحيات والمستخدمين</h1>
          <p>تخصيص حسابات الفريق: أدمن، مدير، مبيعات، مدخل بيانات</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button type="button" className="btn btn-primary" onClick={() => setShowModal(true)}>
            + إضافة مستخدم جديد
          </button>
          <button type="button" className="btn btn-ghost" onClick={loadUsers}>
            تحديث
          </button>
        </div>
      </div>

      {error && <div className="error-banner">{error}</div>}

      {/* Overview Cards for Roles */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        {ROLES_LIST.map((r) => (
          <div key={r.key} className="card" style={{ padding: '16px 20px', borderTop: '3px solid #f59e0b' }}>
            <span className={`badge ${r.badgeColor}`} style={{ marginBottom: '8px', display: 'inline-block' }}>
              {r.label}
            </span>
            <p style={{ fontSize: '0.85rem', color: 'var(--muted)', margin: 0, lineHeight: 1.5 }}>
              {r.desc}
            </p>
          </div>
        ))}
      </div>

      {/* Users Table */}
      <div className="card">
        {loading ? (
          <div className="empty">جاري تحميل المستخدمين…</div>
        ) : users.length === 0 ? (
          <div className="empty">لا يوجد مستخدمين مسجلين</div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>المستخدم</th>
                <th>اسم الحساب (Username)</th>
                <th>الصلاحية (Role)</th>
                <th>شرح الصلاحية</th>
                <th>تاريخ الإنشاء</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => {
                const roleObj = ROLES_LIST.find((r) => r.key === u.role) || {
                  label: u.role,
                  badgeColor: 'badge-ghost',
                  desc: '',
                };
                return (
                  <tr key={u.id || u.username}>
                    <td>
                      <strong>{u.name || u.username}</strong>
                    </td>
                    <td>
                      <code>{u.username}</code>
                    </td>
                    <td>
                      <span className={`badge ${roleObj.badgeColor}`}>
                        {roleObj.label}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.88rem', color: 'var(--muted)' }}>
                      {roleObj.desc}
                    </td>
                    <td>
                      {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'افتراضي'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal to add user */}
      {showModal && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>إضافة مستخدم وتحديد الصلاحية</h2>
            <form onSubmit={handleCreate}>
              <div className="field">
                <label>اسم الشخص / الموظف</label>
                <input
                  required
                  placeholder="مثال: أحمد مصطفى"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>

              <div className="field">
                <label>اسم تسجيل الدخول (Username)</label>
                <input
                  required
                  placeholder="مثال: ahmed_sales"
                  value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                />
              </div>

              <div className="field">
                <label>كلمة المرور</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                />
              </div>

              <div className="field">
                <label>نوع الصلاحية (Access Role)</label>
                <select
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                >
                  {ROLES_LIST.map((r) => (
                    <option key={r.key} value={r.key}>
                      {r.label}
                    </option>
                  ))}
                </select>
                <div style={{ marginTop: '8px', fontSize: '0.85rem', color: 'var(--muted)' }}>
                  {ROLES_LIST.find((r) => r.key === form.role)?.desc}
                </div>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => setShowModal(false)}
                  disabled={saving}
                >
                  إلغاء
                </button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'جاري الحفظ…' : 'حفظ المستخدم'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
