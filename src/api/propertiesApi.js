import { apiRequest } from './client';

export async function listProperties() {
  const data = await apiRequest('/properties');
  return Array.isArray(data) ? data : [];
}

export async function getProperty(propertyId) {
  const data = await apiRequest(`/properties/${propertyId}`);
  return data?.property || data || null;
}

export async function listPropertyRooms(propertyId) {
  const data = await apiRequest(`/properties/${propertyId}/rooms`);
  return Array.isArray(data) ? data : [];
}

export async function getPropertyOverview(propertyId) {
  return apiRequest(`/properties/${propertyId}/overview`);
}