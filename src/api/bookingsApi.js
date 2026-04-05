import { apiRequest } from './client';

const parsePositiveEnvInt = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : fallback;
};

const MAX_ALL_BOOKINGS_PAGES = parsePositiveEnvInt(import.meta.env.VITE_MAX_ALL_BOOKINGS_PAGES, 50);
const VALID_BOOKINGS_QUERY_MODES = new Set(['compat', 'date', 'range']);
const RAW_BOOKINGS_QUERY_MODE = (import.meta.env.VITE_BOOKINGS_QUERY_MODE || 'compat').toLowerCase();

export const BOOKINGS_QUERY_MODE = VALID_BOOKINGS_QUERY_MODES.has(RAW_BOOKINGS_QUERY_MODE)
  ? RAW_BOOKINGS_QUERY_MODE
  : 'compat';

if (import.meta.env.DEV) {
  console.info(`[bookingsApi] query mode: ${BOOKINGS_QUERY_MODE}`);
}

const toPositiveNumber = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const normalizeBookingsQueryParams = (params = {}) => {
  const normalized = { ...params };
  const date = normalized.date;
  const hasFrom = normalized.from !== undefined && normalized.from !== null && normalized.from !== '';
  const hasTo = normalized.to !== undefined && normalized.to !== null && normalized.to !== '';

  if (BOOKINGS_QUERY_MODE === 'range') {
    if (date && !hasFrom) {
      normalized.from = date;
    }

    if (date && !hasTo) {
      normalized.to = date;
    }

    delete normalized.date;
    return normalized;
  }

  if (BOOKINGS_QUERY_MODE === 'date') {
    delete normalized.from;
    delete normalized.to;
    return normalized;
  }

  // compat mode: send both date and range keys when possible.
  if (date && !hasFrom) {
    normalized.from = date;
  }

  if (date && !hasTo) {
    normalized.to = date;
  }

  return normalized;
};

const buildBookingsQuery = (params = {}) => {
  const normalizedParams = normalizeBookingsQueryParams(params);
  const query = new URLSearchParams();

  Object.entries(normalizedParams).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '' || value === 'all') {
      return;
    }

    query.set(key, String(value));
  });

  const queryString = query.toString();
  return queryString ? `?${queryString}` : '';
};

export const buildBookingsQueryString = (params = {}) => buildBookingsQuery(params);
export const buildBookingsDebugPath = (params = {}) => `/api/bookings${buildBookingsQuery(params)}`;

const normalizeBookingsPage = (payload, params = {}) => {
  const page = toPositiveNumber(params.page, 1);
  const limit = toPositiveNumber(params.limit, 10);

  if (Array.isArray(payload)) {
    const total = payload.length;

    return {
      items: payload,
      total,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(total / limit)),
      isServerPaginated: false
    };
  }

  const container = payload || {};
  const items = Array.isArray(container.data)
    ? container.data
    : Array.isArray(container.bookings)
      ? container.bookings
      : [];

  const pagination = container.pagination || container.meta || {};
  const total = toPositiveNumber(pagination.total ?? container.total, items.length);
  const normalizedPage = toPositiveNumber(pagination.page ?? container.page, page);
  const normalizedLimit = toPositiveNumber(pagination.limit ?? container.limit, limit);
  const totalPages = toPositiveNumber(
    pagination.totalPages ?? container.totalPages,
    Math.max(1, Math.ceil(total / normalizedLimit))
  );
  const isServerPaginated = Boolean(
    container.pagination
    || container.meta
    || container.total
    || container.totalPages
    || container.page
    || container.limit
  );

  return {
    items,
    total,
    page: normalizedPage,
    limit: normalizedLimit,
    totalPages,
    isServerPaginated
  };
};

export async function listBookings(options = {}) {
  const data = await apiRequest('/bookings', options);
  return Array.isArray(data) ? data : [];
}

export async function listBookingsPage(params = {}, options = {}) {
  const queryString = buildBookingsQuery(params);
  const data = await apiRequest(`/bookings${queryString}`, options);
  return normalizeBookingsPage(data, params);
}

export async function listAllBookings(params = {}, options = {}) {
  const firstPage = await listBookingsPage(
    {
      ...params,
      page: 1
    },
    options
  );

  if (!firstPage.isServerPaginated || firstPage.totalPages <= 1) {
    return firstPage.items || [];
  }

  let allItems = [...(firstPage.items || [])];
  const cappedTotalPages = Math.min(firstPage.totalPages, MAX_ALL_BOOKINGS_PAGES);

  if (import.meta.env.DEV && cappedTotalPages < firstPage.totalPages) {
    console.warn(
      `[bookingsApi] listAllBookings truncated at ${MAX_ALL_BOOKINGS_PAGES} pages.`
      + ` Received ${firstPage.totalPages} pages from backend.`
    );
  }

  for (let page = 2; page <= cappedTotalPages; page += 1) {
    const pageResult = await listBookingsPage(
      {
        ...params,
        page,
        limit: firstPage.limit
      },
      options
    );

    allItems = allItems.concat(pageResult.items || []);
  }

  return allItems;
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