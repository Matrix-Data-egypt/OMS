import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthUser } from '../types/index.js';
import { apiRequest } from '../services/api.js';

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  isReadOnly: boolean;
  login: (token: string, user: AuthUser) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('oms_media_token');
    const storedUser = localStorage.getItem('oms_media_user');

    if (token && storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        localStorage.removeItem('oms_media_token');
        localStorage.removeItem('oms_media_user');
      }
    }
    setLoading(false);
  }, []);

  const login = (token: string, userData: AuthUser) => {
    localStorage.setItem('oms_media_token', token);
    localStorage.setItem('oms_media_user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('oms_media_token');
    localStorage.removeItem('oms_media_user');
    setUser(null);
  };

  const isReadOnly = Boolean(
    user?.isReadOnly ||
    user?.username === 'manager' ||
    user?.username === 'مدير' ||
    user?.name?.includes('عرض فقط')
  );

  return (
    <AuthContext.Provider value={{ user, loading, isReadOnly, login, logout }}>
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
