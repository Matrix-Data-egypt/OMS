import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar/Navbar';
import HomeSection from './components/HomeSection/HomeSection';
import ServicesSection from './components/ServicesSection/ServicesSection';
import AboutSection from './components/AboutSection/AboutSection';
import ContactSection from './components/ContactSection/ContactSection';
import AuthSection from './components/AuthSection/AuthSection';
import SignUpSection from './components/SignUpSection/SignUpSection';
import ProductionTvSection from './components/ProductionTvSection/ProductionTvSection';
import OutdoorSection from './components/OutdoorSection/OutdoorSection';
import PossSection from './components/PossSection/PossSection';
import ClientsSection from './components/ClientsSection/ClientsSection';
import BlogSection from './components/BlogSection/BlogSection';
import BlogDetail from './components/BlogSection/BlogDetail';
import Footer from './components/footer/Footer';

import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider, useAuth } from './context/AuthContext';

function AppContent() {
  const location = useLocation();
  const { user, logout } = useAuth();

  // Hide Navbar & Footer on login/signup screens
  const isHideLayout = location.pathname === '/login' || location.pathname === '/signup';

  return (
    <div className="app-container">
      {!isHideLayout && <Navbar user={user} setUser={logout} />}

      <main style={{ minHeight: isHideLayout ? '100vh' : '80vh' }}>
        <Routes>
          <Route path="/"              element={<HomeSection />} />
          <Route path="/work"          element={<ServicesSection />} />
          <Route path="/portfolio"     element={<ServicesSection />} />
          <Route path="/profilo"       element={<ServicesSection />} />
          <Route path="/outdoor"       element={<OutdoorSection />} />
          <Route path="/poss"          element={<PossSection />} />
          <Route path="/production-tv" element={<ProductionTvSection />} />
          <Route path="/clients"       element={<ClientsSection />} />
          <Route path="/about"         element={<AboutSection />} />
          <Route path="/contact"       element={<ContactSection />} />
          <Route path="/blog"          element={<BlogSection />} />
          <Route path="/blog/:id"      element={<BlogDetail />} />
          <Route path="/login"         element={<AuthSection />} />
          <Route path="/signup"        element={<SignUpSection />} />
          <Route path="*"              element={<HomeSection />} />
        </Routes>
      </main>

      {!isHideLayout && <Footer />}
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <Router>
            <AppContent />
          </Router>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;
