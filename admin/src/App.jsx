import { Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { api } from './api';
import Login from './pages/Login';
import Layout from './pages/Layout';
import Briefs from './pages/Briefs';
import Videos from './pages/Videos';
import OutdoorAdmin from './pages/OutdoorAdmin';
import PossAdmin from './pages/PossAdmin';
import ClientsAdmin from './pages/ClientsAdmin';

function Protected({ children }) {
  const [ready, setReady] = useState(false);
  const [ok, setOk] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('oms_admin_token');
    if (!token) {
      setReady(true);
      setOk(false);
      return;
    }
    api('/api/auth/me')
      .then(() => setOk(true))
      .catch(() => {
        localStorage.removeItem('oms_admin_token');
        setOk(false);
      })
      .finally(() => setReady(true));
  }, []);

  if (!ready) return <div className="boot">Loading…</div>;
  if (!ok) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
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
        <Route index element={<Navigate to="/briefs" replace />} />
        <Route path="briefs" element={<Briefs />} />
        <Route path="videos" element={<Videos />} />
        <Route path="outdoor" element={<OutdoorAdmin />} />
        <Route path="poss" element={<PossAdmin />} />
        <Route path="clients" element={<ClientsAdmin />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
