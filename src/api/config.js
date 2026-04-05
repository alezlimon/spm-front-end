const DEFAULT_API_URL = 'http://localhost:5005/api';

const normalizeProtocol = (value) => {
  if (!value) {
    return DEFAULT_API_URL;
  }

  return /^https?:\/\//i.test(value) ? value : `https://${value}`;
};

const trimTrailingSlash = (value) => value.replace(/\/+$/, '');

export const API_URL = trimTrailingSlash(
  normalizeProtocol(import.meta.env.VITE_API_URL || DEFAULT_API_URL)
);

export const AUTH_URL = API_URL.replace(/\/api\/?$/i, '/auth');

export const buildApiUrl = (path = '') => {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_URL}${normalizedPath}`;
};

export const buildAuthUrl = (path = '') => {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${AUTH_URL}${normalizedPath}`;
};