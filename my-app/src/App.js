import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar/Navbar';
import HomeSection from './components/HomeSection/HomeSection';
// 💡 تم استبدال استيراد WorkSection بـ ServicesSection الجديد
import ServicesSection from './components/ServicesSection/ServicesSection';
import AboutSection from './components/AboutSection/AboutSection';
import ContactSection from './components/ContactSection/ContactSection';
import AuthSection from './components/AuthSection/AuthSection';
import SignUpSection from './components/SignUpSection/SignUpSection';
import ProductionTvSection from './components/ProductionTvSection/ProductionTvSection';
import OutdoorSection from './components/OutdoorSection/OutdoorSection';
import PossSection from './components/PossSection/PossSection';
import ClientsSection from './components/ClientsSection/ClientsSection';
import Footer from './components/footer/Footer';

import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';

function AppContent() {
  const location = useLocation();

  // إخفاء الـ Navbar والـ Footer في شاشات الـ Login والـ SignUp لتمتد بكامل الشاشة
  const isHideLayout = location.pathname === '/login' || location.pathname === '/signup';
  const [user, setUser] = useState(null);

  return (
    <div className="app-container">
      {!isHideLayout && <Navbar user={user} setUser={setUser} />}

      <main style={{ minHeight: isHideLayout ? '100vh' : '80vh' }}>
        <Routes>
          <Route path="/" element={<HomeSection />} />
          {/* 💡 تم تعديل الـ Element ليقوم بتشغيل صفحة الخدمات والأعمال المدمجة مباشرة */}
          <Route path="/work" element={<ServicesSection />} />
          <Route path="/portfolio" element={<ServicesSection />} />
          <Route path="/profilo" element={<ServicesSection />} />
          <Route path="/outdoor" element={<OutdoorSection />} />
          <Route path="/poss" element={<PossSection />} />
          <Route path="/production-tv" element={<ProductionTvSection />} />
          <Route path="/clients" element={<ClientsSection />} />
          <Route path="/about" element={<AboutSection />} />
          <Route path="/contact" element={<ContactSection />} />
          <Route path="/login" element={<AuthSection setUser={setUser} />} />
          <Route path="/signup" element={<SignUpSection setUser={setUser} />} />
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
        <Router>
          <AppContent />
        </Router>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;
