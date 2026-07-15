import { apiClient } from './client';
import type { Session } from '../features/auth/authSlice';

interface ApiEnvelope<T> {
  success: boolean;
  data: T;
}

export const authApi = {
  register: (payload: { name: string; email: string; password: string }) =>
    apiClient.post<ApiEnvelope<Session>>('/auth/register', payload).then((r) => r.data.data),

  login: (payload: { email: string; password: string }) =>
    apiClient.post<ApiEnvelope<Session>>('/auth/login', payload).then((r) => r.data.data),

  logout: (refreshToken: string) => apiClient.post('/auth/logout', { refreshToken }),
};
