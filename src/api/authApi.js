import { apiRequest, ApiError } from './client';

export async function loginUser(credentials) {
  return apiRequest('/login', {
    base: 'auth',
    method: 'POST',
    body: credentials
  });
}

export async function signupUser(payload) {
  return apiRequest('/signup', {
    base: 'auth',
    method: 'POST',
    body: payload
  });
}

export async function verifySession(token) {
  if (!token) {
    throw new ApiError('Missing auth token', { status: 401 });
  }

  return apiRequest('/verify', {
    base: 'auth',
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
}