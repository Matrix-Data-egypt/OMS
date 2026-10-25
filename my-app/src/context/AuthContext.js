import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../api';

const AuthContext = createContext(null);

const TOKEN_KEY = 'oms_customer_token';
const USER_KEY  = 'oms_customer_user';

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(() => {
    try { return JSON.parse(localStorage.getItem(USER_KEY)); }
    catch { return null; }
  });
  const [loading, setLoading] = useState(false);

  // Persist user to localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(USER_KEY);
      localStorage.removeItem(TOKEN_KEY);
    }
  }, [user]);

  // ── Customer Login ──────────────────────────────────────────────────
  const loginCustomer = useCallback(async (email, password) => {
    setLoading(true);
    try {
      const data = await api('/api/customers/login', {
        method: 'POST',
        body: { email, password },
      });
      localStorage.setItem(TOKEN_KEY, data.token);
      setUser({ ...data.customer, role: 'customer' });
      return { ok: true, message: data.message };
    } catch (err) {
      return { ok: false, message: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Customer Register ───────────────────────────────────────────────
  const registerCustomer = useCallback(async (payload) => {
    setLoading(true);
    try {
      const data = await api('/api/customers/register', {
        method: 'POST',
        body: payload,
      });
      localStorage.setItem(TOKEN_KEY, data.token);
      setUser({ ...data.customer, role: 'customer' });
      return { ok: true, message: data.message };
    } catch (err) {
      return { ok: false, message: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Logout ──────────────────────────────────────────────────────────
  const logout = useCallback(() => {
    setUser(null);
  }, []);

  // ── Helpers ─────────────────────────────────────────────────────────
  const getToken = useCallback(() => localStorage.getItem(TOKEN_KEY), []);
  const isLoggedIn = !!user;

  return (
    <AuthContext.Provider value={{ user, setUser, loading, loginCustomer, registerCustomer, logout, getToken, isLoggedIn }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
