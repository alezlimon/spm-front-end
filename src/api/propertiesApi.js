import { apiRequest } from './client';

export async function listProperties() {
  const data = await apiRequest('/properties');
  return Array.isArray(data) ? data : [];
}

export async function getProperty(propertyId) {
  const data = await apiRequest(`/properties/${propertyId}`);
  return data?.property || data || null;
}

export async function listPropertyRooms(propertyId, params = {}) {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      query.set(key, value);
    }
  });

  const queryString = query.toString();
  const path = queryString
    ? `/properties/${propertyId}/rooms?${queryString}`
    : `/properties/${propertyId}/rooms`;

  const data = await apiRequest(path);
  return Array.isArray(data) ? data : [];
}

export async function getPropertyOverview(propertyId) {
  return apiRequest(`/properties/${propertyId}/overview`);
}