import { useEffect, useState } from 'react';
import { loginUser, signupUser, verifySession as verifyAuthSession } from '../api/authApi';
import { AuthContext } from './auth-context';
import { AUTH_SESSION_EXPIRED_EVENT } from '../utils/events';
import {
  clearStoredToken,
  getStoredToken,
  setStoredToken
} from '../utils/auth';

function getUserRole(payload) {
  const directRole = payload?.role;
  const nestedRole = payload?.user?.role;
  const roles = payload?.roles || payload?.user?.roles;

  if (typeof directRole === 'string' && directRole.trim()) {
    return directRole.trim().toLowerCase();
  }

  if (typeof nestedRole === 'string' && nestedRole.trim()) {
    return nestedRole.trim().toLowerCase();
  }

  if (Array.isArray(roles)) {
    const adminRole = roles.find((role) => typeof role === 'string' && role.trim().toLowerCase() === 'admin');
    return adminRole ? 'admin' : null;
  }

  return null;
}

function assertAdminSession(payload) {
  const role = getUserRole(payload);

  if (role !== 'admin') {
    throw new Error('Admin access only. Update backend session payload to include role=admin.');
  }

  return payload;
}

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
        setUser(assertAdminSession(payload));
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

    const adminPayload = assertAdminSession(payload);
    setUser(adminPayload);
    return adminPayload;
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
    isAdmin: getUserRole(user) === 'admin',
    isAuthenticated: Boolean(user && token),
    login,
    signup,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
