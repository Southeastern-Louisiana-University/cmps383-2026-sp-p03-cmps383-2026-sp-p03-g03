const AZURE_API_BASE_URL = 'https://selu383-sp26-p03-g03.azurewebsites.net';
const LOCAL_API_BASE_URL = 'https://localhost:7116';
const TIMEOUT = 30000;

const getApiBaseUrl = (): string => {
  const envUrl = process.env.EXPO_PUBLIC_API_BASE_URL?.trim();
  const envTarget = process.env.EXPO_PUBLIC_API_TARGET?.trim().toLowerCase();
  const azureEnvUrl = process.env.EXPO_PUBLIC_AZURE_API_BASE_URL?.trim();
  const localEnvUrl = process.env.EXPO_PUBLIC_LOCAL_API_BASE_URL?.trim();

  if (envUrl) {
    return envUrl.replace(/\/$/, '');
  }

  if (envTarget === 'local') {
    return (localEnvUrl || LOCAL_API_BASE_URL).replace(/\/$/, '');
  }

  return (azureEnvUrl || AZURE_API_BASE_URL).replace(/\/$/, '');
};

export const API_BASE_URL = getApiBaseUrl();

function extractErrorText(data: unknown): string {
  if (!data) return '';
  if (typeof data === 'string') return data.trim();
  if (typeof data !== 'object') return '';

  const error = data as Record<string, unknown>;

  if (typeof error.message === 'string' && error.message.trim()) return error.message.trim();
  if (typeof error.error === 'string' && error.error.trim()) return error.error.trim();
  if (typeof error.details === 'string' && error.details.trim()) return error.details.trim();
  if (typeof error.detail === 'string' && error.detail.trim()) return error.detail.trim();
  if (typeof error.title === 'string' && error.title.trim()) return error.title.trim();

  if (error.errors && typeof error.errors === 'object') {
    const messages = Object.values(error.errors as Record<string, string[]>)
      .flat()
      .filter((value): value is string => typeof value === 'string' && value.trim().length > 0);

    if (messages.length > 0) {
      return messages[0];
    }
  }

  return '';
}

export class ApiError<T = unknown> extends Error {
  status: number;
  code?: string;
  data?: T;

  constructor(message: string, status: number, data?: T) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;

    if (data && typeof data === 'object' && 'code' in (data as object)) {
      this.code = (data as Record<string, unknown>).code as string | undefined;
    }
  }
}

export const apiCall = async (
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' = 'GET',
  data?: unknown,
): Promise<any> => {
  const url = `${API_BASE_URL}${endpoint}`;

  const options: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  };

  if (data && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
    options.body = JSON.stringify(data);
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), TIMEOUT);

    let response: Response;
    try {
      response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timeout);
    }

    const contentType = response.headers.get('content-type') ?? '';

    if (!response.ok) {
      let errorData: unknown;
      let errorText = '';

      if (contentType.includes('application/json')) {
        try {
          errorData = await response.json();
        } catch {
          errorData = undefined;
        }
      } else {
        errorText = (await response.text())?.trim();
      }

      if (!errorText) {
        errorText = extractErrorText(errorData);
      }

      if (response.status === 401) {
        throw new ApiError(errorText || 'Unauthorized. Please log in again.', response.status, errorData);
      }
      if (response.status === 402) {
        throw new ApiError(errorText || 'Payment required.', response.status, errorData);
      }
      if (response.status === 403) {
        throw new ApiError(errorText || 'Access denied for this account.', response.status, errorData);
      }

      throw new ApiError(`API Error: ${response.status} - ${errorText || 'Request failed'}`, response.status, errorData);
    }

    if (response.status === 204 || !contentType.includes('application/json')) {
      return null;
    }

    return await response.json();
  } catch (error: any) {
    if (error instanceof ApiError) {
      throw error;
    }

    if (error?.name === 'AbortError') {
      throw new Error(`Request timed out after ${TIMEOUT / 1000} seconds`);
    }

    if (error?.message === 'Network request failed') {
      throw new Error(
        `Network request failed. Verify API host is reachable: ${API_BASE_URL}. If testing on a physical phone, localhost will not point to your PC; use your machine LAN IP or a dev tunnel URL.`,
      );
    }

    throw new Error(error.message || 'Network request failed');
  }
};