import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  clearStoredToken,
  getAuthHeaders,
  getStoredToken,
  setStoredToken
} from '../utils/auth';

const rawApiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5005/api';
const API_URL = /^https?:\/\//i.test(rawApiUrl) ? rawApiUrl : `https://${rawApiUrl}`;
const AUTH_URL = API_URL
  .replace(/\/+$/, '')
  .replace(/\/api\/?$/i, '/auth');

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(getStoredToken());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const verifySession = async () => {
      const storedToken = getStoredToken();

      if (!storedToken) {
        setIsLoading(false);
        return;
      }

      try {
        const res = await fetch(`${AUTH_URL}/verify`, {
          headers: getAuthHeaders()
        });

        if (!res.ok) {
          throw new Error('Session expired');
        }

        const payload = await res.json();
        setUser(payload);
        setToken(storedToken);
      } catch (error) {
        clearStoredToken();
        setUser(null);
        setToken(null);
      } finally {
        setIsLoading(false);
      }
    };

    verifySession();
  }, []);

  const login = async ({ email, password }) => {
    const res = await fetch(`${AUTH_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new Error(data.message || 'Could not sign in');
    }

    if (!data.authToken) {
      throw new Error('Missing auth token');
    }

    setStoredToken(data.authToken);
    setToken(data.authToken);

    const verifyRes = await fetch(`${AUTH_URL}/verify`, {
      headers: {
        Authorization: `Bearer ${data.authToken}`
      }
    });

    const payload = await verifyRes.json().catch(() => null);

    if (!verifyRes.ok || !payload) {
      clearStoredToken();
      setUser(null);
      setToken(null);
      throw new Error('Could not verify session');
    }

    setUser(payload);
    return payload;
  };

  const signup = async ({ name, email, password }) => {
    const res = await fetch(`${AUTH_URL}/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name, email, password })
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new Error(data.message || 'Could not create account');
    }

    return login({ email, password });
  };

  const logout = () => {
    clearStoredToken();
    setUser(null);
    setToken(null);
  };

  const value = useMemo(
    () => ({
      user,
      token,
      isLoading,
      isAuthenticated: Boolean(user && token),
      login,
      signup,
      logout
    }),
    [user, token, isLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}
