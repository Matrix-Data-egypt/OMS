import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from './components/Navbar.js';
import { Sidebar } from './components/Sidebar.js';
import { Dashboard } from './pages/Dashboard.js';
import { Clients } from './pages/Clients.js';
import { Suppliers } from './pages/Suppliers.js';
import { Channels } from './pages/Channels.js';
import { ContentTypes } from './pages/ContentTypes.js';
import { Contents } from './pages/Contents.js';
import { AccountingSync } from './pages/AccountingSync.js';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
        <Navbar />
        <div className="flex flex-1">
          <Sidebar />
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/clients" element={<Clients />} />
              <Route path="/suppliers" element={<Suppliers />} />
              <Route path="/channels" element={<Channels />} />
              <Route path="/content-types" element={<ContentTypes />} />
              <Route path="/contents" element={<Contents />} />
              <Route path="/accounting-sync" element={<AccountingSync />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </div>
    </BrowserRouter>
  );
};

export default App;
