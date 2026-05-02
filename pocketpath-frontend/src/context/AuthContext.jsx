import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true); // checking saved token on boot
  const [error,   setError]   = useState(null);

  // On mount — restore session from localStorage
  useEffect(() => {
    const token = localStorage.getItem('pp_token');
    if (!token) { setLoading(false); return; }

    authApi.me()
      .then(data => setUser(data.user))
      .catch(() => {
        localStorage.removeItem('pp_token');
        localStorage.removeItem('pp_user');
      })
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async ({ email, password }) => {
    setError(null);
    const data = await authApi.login({ email, password });
    localStorage.setItem('pp_token', data.token);
    localStorage.setItem('pp_user',  JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  }, []);

  const register = useCallback(async ({ name, email, password, monthlyIncome, currency }) => {
    setError(null);
    const data = await authApi.register({ name, email, password, monthlyIncome, currency });
    localStorage.setItem('pp_token', data.token);
    localStorage.setItem('pp_user',  JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('pp_token');
    localStorage.removeItem('pp_user');
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, error, setError, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}