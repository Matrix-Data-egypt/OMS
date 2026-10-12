import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from './api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchMe = async () => {
    const token = localStorage.getItem('oms_admin_token');
    if (!token) {
      setUser(null);
      setLoading(false);
      return null;
    }
    try {
      const data = await api('/api/auth/me');
      setUser(data.user);
      return data.user;
    } catch {
      localStorage.removeItem('oms_admin_token');
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMe();
  }, []);

  const login = async (username, password) => {
    const data = await api('/api/auth/login', {
      method: 'POST',
      body: { username, password },
    });
    localStorage.setItem('oms_admin_token', data.token);
    setUser(data.user);
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem('oms_admin_token');
    setUser(null);
  };

  const role = user?.role || '';
  const isAdmin = role === 'admin';
  const isManager = role === 'manager';
  const isSales = role === 'sales';
  const isDataEntry = role === 'data_entry';
  const isReadOnly = isManager; // Manager is strictly read-only across all pages

  // Permission checkers according to specifications:
  // 1- Admin: all permissions
  // 2- Manager: read-only access to view all pages
  // 3- Sales: access to start project (briefs) only
  // 4- Data Entry: access to all content pages, forbidden from start project
  const canAccessBriefs = isAdmin || isManager || isSales;
  const canAccessContent = isAdmin || isManager || isDataEntry;

  const value = {
    user,
    role,
    loading,
    isAdmin,
    isManager,
    isSales,
    isDataEntry,
    isReadOnly,
    canAccessBriefs,
    canAccessContent,
    login,
    logout,
    refreshUser: fetchMe,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
