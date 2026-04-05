import { getStoredToken } from '../utils/auth';
import { AUTH_SESSION_EXPIRED_EVENT } from '../utils/events';
import { buildApiUrl, buildAuthUrl } from './config';

const ENABLE_LEGACY_ERROR_TRANSLATIONS =
  import.meta.env.VITE_ENABLE_LEGACY_ERROR_TRANSLATIONS === 'true';

// Temporary fallback for legacy mixed-language backend messages.
// Remove after backend contract re-validation in staging (target: 2026-04-12).
const MESSAGE_TRANSLATIONS = new Map([
  ['No se pudo guardar el huésped', 'Could not save guest'],
  ['El campo birthDate es obligatorio y debe ser una fecha valida (YYYY-MM-DD)', 'Birth date is required and must be a valid date (YYYY-MM-DD)'],
  ['Reserva no encontrada', 'Booking not found'],
  ['Huesped no encontrado', 'Guest not found'],
  ['Huésped no encontrado', 'Guest not found']
]);

const translateMessage = (message) => {
  if (typeof message !== 'string') {
    return message;
  }

  const trimmedMessage = message.trim();

  if (!trimmedMessage) {
    return message;
  }

  if (!ENABLE_LEGACY_ERROR_TRANSLATIONS) {
    return trimmedMessage;
  }

  return MESSAGE_TRANSLATIONS.get(trimmedMessage) || trimmedMessage;
};

export class ApiError extends Error {
  constructor(message, { status, payload } = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.payload = payload;
  }
}

const readResponseBody = async (response) => {
  const contentType = response.headers.get('content-type') || '';

  if (contentType.includes('application/json')) {
    return response.json().catch(() => null);
  }

  const text = await response.text().catch(() => '');
  return text || null;
};

export const getErrorMessage = (payload, fallback = 'Request failed') => {
  if (typeof payload === 'string' && payload.trim()) {
    return translateMessage(payload);
  }

  if (typeof payload?.message === 'string' && payload.message.trim()) {
    return translateMessage(payload.message);
  }

  if (typeof payload?.error === 'string' && payload.error.trim()) {
    return translateMessage(payload.error);
  }

  if (Array.isArray(payload?.details) && payload.details.length > 0) {
    const detail = payload.details[0];

    if (typeof detail === 'string' && detail.trim()) {
      return translateMessage(detail);
    }

    if (typeof detail?.msg === 'string' && detail.msg.trim()) {
      return translateMessage(detail.msg);
    }
  }

  if (Array.isArray(payload?.errors) && payload.errors.length > 0) {
    const firstError = payload.errors[0];

    if (typeof firstError === 'string' && firstError.trim()) {
      return translateMessage(firstError);
    }

    if (typeof firstError?.message === 'string' && firstError.message.trim()) {
      return translateMessage(firstError.message);
    }

    if (typeof firstError?.msg === 'string' && firstError.msg.trim()) {
      return translateMessage(firstError.msg);
    }
  }

  return translateMessage(fallback);
};

export async function apiRequest(path, options = {}) {
  const {
    base = 'api',
    auth = false,
    body,
    headers = {},
    ...restOptions
  } = options;

  const urlBuilder = base === 'auth' ? buildAuthUrl : buildApiUrl;
  const requestHeaders = { ...headers };

  if (auth) {
    const token = getStoredToken();

    if (token) {
      requestHeaders.Authorization = `Bearer ${token}`;
    }
  }

  const requestInit = {
    ...restOptions,
    headers: requestHeaders
  };

  if (body !== undefined) {
    const isFormData = body instanceof FormData;

    requestInit.body = isFormData ? body : JSON.stringify(body);

    if (!isFormData && !requestHeaders['Content-Type']) {
      requestHeaders['Content-Type'] = 'application/json';
    }
  }

  const response = await fetch(urlBuilder(path), requestInit);
  const payload = await readResponseBody(response);

  if (!response.ok) {
    const requestHasAuthHeader = Boolean(requestHeaders.Authorization);

    if (
      response.status === 401
      && requestHasAuthHeader
      && typeof window !== 'undefined'
    ) {
      window.dispatchEvent(new CustomEvent(AUTH_SESSION_EXPIRED_EVENT));
    }

    throw new ApiError(getErrorMessage(payload), {
      status: response.status,
      payload
    });
  }

  return payload;
}