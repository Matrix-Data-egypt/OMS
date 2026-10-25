import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';
import Login from './pages/Login';
import Layout from './pages/Layout';
import Briefs from './pages/Briefs';
import Videos from './pages/Videos';
import OutdoorAdmin from './pages/OutdoorAdmin';
import PossAdmin from './pages/PossAdmin';
import ClientsAdmin from './pages/ClientsAdmin';
import UsersAdmin from './pages/UsersAdmin';
import CustomersAdmin from './pages/CustomersAdmin';

function Protected({ children }) {
  const { user, loading } = useAuth();

  if (loading) return <div className="boot">Loading OMS Panel…</div>;
  if (!user) return <Navigate to="/login" replace />;

  return children;
}

// Guard specifically for Briefs (Start Project): sales, manager, admin allowed. Data entry blocked!
function BriefsRoute() {
  const { canAccessBriefs } = useAuth();
  if (!canAccessBriefs) {
    return <Navigate to="/videos" replace />;
  }
  return <Briefs />;
}

// Guard specifically for Content pages: data_entry, manager, admin allowed. Sales blocked!
function ContentRoute({ element }) {
  const { canAccessContent } = useAuth();
  if (!canAccessContent) {
    return <Navigate to="/briefs" replace />;
  }
  return element;
}

// Guard specifically for Admin-only pages
function AdminRoute({ element }) {
  const { isAdmin, isSales } = useAuth();
  if (!isAdmin) {
    return <Navigate to={isSales ? "/briefs" : "/videos"} replace />;
  }
  return element;
}

// Index redirector based on role
function IndexRedirect() {
  const { isDataEntry } = useAuth();
  return <Navigate to={isDataEntry ? "/videos" : "/briefs"} replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <Protected>
              <Layout />
            </Protected>
          }
        >
          <Route index element={<IndexRedirect />} />
          <Route path="briefs" element={<BriefsRoute />} />
          <Route path="videos" element={<ContentRoute element={<Videos />} />} />
          <Route path="outdoor" element={<ContentRoute element={<OutdoorAdmin />} />} />
          <Route path="poss" element={<ContentRoute element={<PossAdmin />} />} />
          <Route path="clients" element={<ContentRoute element={<ClientsAdmin />} />} />
          <Route path="users" element={<AdminRoute element={<UsersAdmin />} />} />
          <Route path="customers" element={<AdminRoute element={<CustomersAdmin />} />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}
