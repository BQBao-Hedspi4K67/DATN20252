import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { api, unwrapApiData } from '../lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const logout = () => {
    localStorage.removeItem('lms_access_token');
    setUser(null);
  };

  const login = async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    const payload = unwrapApiData(response);
    localStorage.setItem('lms_access_token', payload.accessToken);
    setUser(payload.user);
    return payload.user;
  };

  const loadMe = async () => {
    try {
      const token = localStorage.getItem('lms_access_token');
      if (!token) {
        setUser(null);
        return;
      }
      const response = await api.get('/auth/me');
      const payload = unwrapApiData(response);
      setUser(payload);
    } catch (_error) {
      logout();
    }
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      await loadMe();
      if (mounted) {
        setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated: Boolean(user),
      login,
      logout,
      reloadProfile: loadMe
    }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}
