import axios from 'axios';
import type { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { store } from '../app/store';
import { setSession, clearSession } from '../features/auth/authSlice';

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api';

export interface ApiErrorShape {
  status: number;
  message: string;
  details?: string[];
}

interface RetryableConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

export const apiClient = axios.create({ baseURL: BASE_URL });

apiClient.interceptors.request.use((config) => {
  const token = store.getState().auth.accessToken;
  if (token) {
    config.headers.set('Authorization', `Bearer ${token}`);
  }
  return config;
});

// Single in-flight refresh shared by every request that hits a 401 at once,
// so a burst of expired-token requests triggers one refresh call, not N.
let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = store.getState().auth.refreshToken;
  const user = store.getState().auth.user;
  if (!refreshToken || !user) return null;

  try {
    const { data } = await axios.post(`${BASE_URL}/auth/refresh`, { refreshToken });
    store.dispatch(setSession(data.data));
    return data.data.accessToken as string;
  } catch {
    // The store's own subscriber disconnects the socket when the session
    // clears (see app/store.ts) — dispatching here is enough.
    store.dispatch(clearSession());
    return null;
  }
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as RetryableConfig | undefined;

    if (error.response?.status === 401 && original && !original._retry && !original.url?.includes('/auth/')) {
      original._retry = true;
      refreshPromise ??= refreshAccessToken();
      const newToken = await refreshPromise;
      refreshPromise = null;

      if (newToken) {
        original.headers.set('Authorization', `Bearer ${newToken}`);
        return apiClient(original);
      }
    }

    return Promise.reject(normalizeError(error));
  }
);

function normalizeError(error: AxiosError): ApiErrorShape {
  const data = error.response?.data as { message?: string; details?: string[] } | undefined;
  return {
    status: error.response?.status ?? 0,
    message: data?.message ?? error.message ?? 'Unexpected error',
    details: data?.details,
  };
}
