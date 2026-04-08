import { getStoredToken } from '../utils/auth';
import { AUTH_SESSION_EXPIRED_EVENT } from '../utils/events';
import { buildApiUrl, buildAuthUrl } from './config';

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
    return payload.trim();
  }

  if (typeof payload?.message === 'string' && payload.message.trim()) {
    return payload.message.trim();
  }

  if (typeof payload?.error === 'string' && payload.error.trim()) {
    return payload.error.trim();
  }

  if (Array.isArray(payload?.details) && payload.details.length > 0) {
    const firstDetail = payload.details[0];

    if (typeof firstDetail === 'string' && firstDetail.trim()) {
      return firstDetail.trim();
    }

    if (typeof firstDetail?.msg === 'string' && firstDetail.msg.trim()) {
      return firstDetail.msg.trim();
    }
  }

  if (Array.isArray(payload?.errors) && payload.errors.length > 0) {
    const firstError = payload.errors[0];

    if (typeof firstError === 'string' && firstError.trim()) {
      return firstError.trim();
    }

    if (typeof firstError?.message === 'string' && firstError.message.trim()) {
      return firstError.message.trim();
    }

    if (typeof firstError?.msg === 'string' && firstError.msg.trim()) {
      return firstError.msg.trim();
    }
  }

  return fallback;
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
      response.status === 401 &&
      requestHasAuthHeader &&
      typeof window !== 'undefined'
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