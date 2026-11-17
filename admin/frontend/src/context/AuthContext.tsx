import React, { createContext, useContext, useState, useEffect } from 'react';
import { AdminUser } from '../types/index.js';

interface AuthContextType {
  admin: AdminUser | null;
  loading: boolean;
  login: (token: string, user: AdminUser) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('oms_admin_token');
    const stored = localStorage.getItem('oms_admin_user');

    if (token && stored) {
      try {
        setAdmin(JSON.parse(stored));
      } catch (e) {
        localStorage.removeItem('oms_admin_token');
        localStorage.removeItem('oms_admin_user');
      }
    }
    setLoading(false);
  }, []);

  const login = (token: string, userData: AdminUser) => {
    localStorage.setItem('oms_admin_token', token);
    localStorage.setItem('oms_admin_user', JSON.stringify(userData));
    setAdmin(userData);
  };

  const logout = () => {
    localStorage.removeItem('oms_admin_token');
    localStorage.removeItem('oms_admin_user');
    setAdmin(null);
  };

  return (
    <AuthContext.Provider value={{ admin, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
