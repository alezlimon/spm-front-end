import { apiRequest } from './client';

export async function listBookings() {
  const data = await apiRequest('/bookings');
  return Array.isArray(data) ? data : [];
}

export async function getBookingById(bookingId) {
  const data = await apiRequest(`/bookings/${bookingId}`, {
    auth: true
  });
  return data || null;
}

export async function createBooking(payload) {
  return apiRequest('/bookings', {
    method: 'POST',
    auth: true,
    body: payload
  });
}

export async function checkInBooking(bookingId) {
  return apiRequest(`/bookings/${bookingId}/checkin`, {
    method: 'PUT',
    auth: true
  });
}

export async function checkOutBooking(bookingId) {
  return apiRequest(`/bookings/${bookingId}/checkout`, {
    method: 'PUT',
    auth: true
  });
}

export async function assignGuestToBooking(bookingId, payload) {
  return apiRequest(`/bookings/${bookingId}/assign-guest`, {
    method: 'PUT',
    auth: true,
    body: payload
  });
}