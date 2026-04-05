import { useEffect, useState } from 'react';
import { loginUser, signupUser, verifySession as verifyAuthSession } from '../api/authApi';
import { AuthContext } from './auth-context';
import { AUTH_SESSION_EXPIRED_EVENT } from '../utils/events';
import {
  clearStoredToken,
  getStoredToken,
  setStoredToken
} from '../utils/auth';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(getStoredToken());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const handleSessionExpired = () => {
      clearStoredToken();
      setUser(null);
      setToken(null);
      setIsLoading(false);
    };

    window.addEventListener(AUTH_SESSION_EXPIRED_EVENT, handleSessionExpired);

    return () => {
      window.removeEventListener(AUTH_SESSION_EXPIRED_EVENT, handleSessionExpired);
    };
  }, []);

  useEffect(() => {
    const loadSession = async () => {
      const storedToken = getStoredToken();

      if (!storedToken) {
        setIsLoading(false);
        return;
      }

      try {
        const payload = await verifyAuthSession(storedToken);
        setUser(payload);
        setToken(storedToken);
      } catch {
        clearStoredToken();
        setUser(null);
        setToken(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadSession();
  }, []);

  const login = async ({ email, password }) => {
    const data = await loginUser({ email, password });

    if (!data.authToken) {
      throw new Error('Missing auth token');
    }

    setStoredToken(data.authToken);
    setToken(data.authToken);

    let payload;

    try {
      payload = await verifyAuthSession(data.authToken);
    } catch {
      clearStoredToken();
      setUser(null);
      setToken(null);
      throw new Error('Could not verify session');
    }

    setUser(payload);
    return payload;
  };

  const signup = async ({ name, email, password }) => {
    await signupUser({ name, email, password });
    return login({ email, password });
  };

  const logout = () => {
    clearStoredToken();
    setUser(null);
    setToken(null);
  };

  const value = {
    user,
    token,
    isLoading,
    isAuthenticated: Boolean(user && token),
    login,
    signup,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
