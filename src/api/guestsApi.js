import { apiRequest } from './client';

export async function listGuests(query = '') {
  const path = query
    ? `/guests/search?query=${encodeURIComponent(query)}`
    : '/guests';
  const data = await apiRequest(path);
  return Array.isArray(data) ? data : [];
}

export async function createGuest(payload) {
  return apiRequest('/guests', {
    method: 'POST',
    auth: true,
    body: payload
  });
}

export async function updateGuest(guestId, payload) {
  return apiRequest(`/guests/${guestId}`, {
    method: 'PUT',
    auth: true,
    body: payload
  });
}