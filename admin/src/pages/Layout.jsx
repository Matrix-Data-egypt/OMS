import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';

const ROLE_BADGE_MAP = {
  admin: { label: 'الادمن (Admin)', color: 'badge-admin', title: 'صلاحيات كاملة' },
  manager: { label: 'مدير (Manager)', color: 'badge-manager', title: 'وضع المشاهدة فقط' },
  sales: { label: 'تيم Sales', color: 'badge-sales', title: 'Start Project فقط' },
  data_entry: { label: 'مدخل بيانات', color: 'badge-dataentry', title: 'إدخال وتعديل البيانات' },
};

export default function Layout() {
  const navigate = useNavigate();
  const { user, role, isReadOnly, canAccessBriefs, canAccessContent, isAdmin, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const currentRoleInfo = ROLE_BADGE_MAP[role] || {
    label: role || 'مستخدم',
    color: 'badge-ghost',
    title: ''
  };

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="login-logo">O</div>
          <div>
            <strong>OMS Admin</strong>
            <span>Company Panel</span>
          </div>
        </div>

        {/* Current User & Role Card */}
        <div className="sidebar-user-card" style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid var(--border)',
          borderRadius: '10px',
          padding: '12px 14px',
          marginBottom: '16px'
        }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--muted)', marginBottom: '4px' }}>المستخدم الحالي:</div>
          <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#fff', marginBottom: '6px' }}>
            {user?.name || user?.username || 'المستخدم'}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span className={`badge ${currentRoleInfo.color}`} style={{ fontSize: '0.75rem' }}>
              {currentRoleInfo.label}
            </span>
          </div>
        </div>

        <nav className="sidebar-nav" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {/* 1. Start Project - Allowed for Admin, Manager, Sales. Hidden from Data Entry */}
          {canAccessBriefs && (
            <NavLink to="/briefs" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <span>Start Project</span>
              {role === 'sales' && <span className="nav-tag">Sales</span>}
            </NavLink>
          )}

          {/* 2. Content Pages - Allowed for Admin, Manager, Data Entry. Hidden from Sales */}
          {canAccessContent && (
            <>
              <NavLink to="/videos" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                <span>Production TV</span>
              </NavLink>
              <NavLink to="/outdoor" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                <span>Outdoor</span>
              </NavLink>
              <NavLink to="/poss" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                <span>POSS</span>
              </NavLink>
              <NavLink to="/clients" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                <span>Clients</span>
              </NavLink>
            </>
          )}

          {/* 3. Admin-only pages */}
          {isAdmin && (
            <>
              <NavLink to="/users" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} style={{ marginTop: '12px', borderTop: '1px solid var(--border)', paddingTop: '10px' }}>
                <span>👥 الصلاحيات والمستخدمين</span>
              </NavLink>
              <NavLink to="/customers" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                <span>🙋 العملاء المسجلون</span>
              </NavLink>
            </>
          )}
        </nav>

        <div className="sidebar-footer">
          <button type="button" className="btn btn-ghost btn-block" onClick={handleLogout}>
            تسجيل الخروج (Log out)
          </button>
        </div>
      </aside>

      <main className="main">
        {/* Read-Only Notice banner for Manager role */}
        {isReadOnly && (
          <div style={{
            background: 'rgba(59, 130, 246, 0.12)',
            border: '1px solid rgba(59, 130, 246, 0.3)',
            borderRadius: '10px',
            padding: '12px 18px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            color: '#93c5fd',
            fontSize: '0.92rem'
          }}>
            <div>
              <strong>👁️ وضع المشاهدة فقط (Read-Only Mode):</strong> أنت مسجل كـ <strong>مدير</strong>، يمكنك الاطلاع على جميع الصفحات ومتابعة محتواها دون إمكانية التعديل أو الحذف.
            </div>
            <span style={{ fontSize: '0.78rem', background: 'rgba(59, 130, 246, 0.2)', padding: '2px 8px', borderRadius: '4px' }}>
              عرض فقط
            </span>
          </div>
        )}

        <Outlet />
      </main>
    </div>
  );
}
