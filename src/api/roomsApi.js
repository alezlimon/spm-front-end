import { apiRequest } from './client';

export async function listRooms() {
  const data = await apiRequest('/rooms');
  return Array.isArray(data) ? data : [];
}

export async function updateRoom(roomId, payload) {
  return apiRequest(`/rooms/${roomId}`, {
    method: 'PUT',
    auth: true,
    body: payload
  });
}

export async function listRoomBookings(roomId) {
  const data = await apiRequest(`/rooms/${roomId}/bookings`);
  return Array.isArray(data) ? data : [];
}