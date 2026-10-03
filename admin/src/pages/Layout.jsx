import { NavLink, Outlet, useNavigate } from 'react-router-dom';

export default function Layout() {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem('oms_admin_token');
    navigate('/login');
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

        <NavLink to="/briefs" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          Start Project
        </NavLink>
        <NavLink to="/videos" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          Production TV
        </NavLink>
        <NavLink to="/blog" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          Blog
        </NavLink>
        <NavLink to="/clients" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          Clients
        </NavLink>

        <div className="sidebar-footer">
          <button type="button" className="btn btn-ghost btn-block" onClick={logout}>
            Log out
          </button>
        </div>
      </aside>

      <main className="main">
        <Outlet />
      </main>
    </div>
  );
}
