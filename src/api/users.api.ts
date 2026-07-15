import { apiClient } from './client';
import type { User } from '../types';

interface ApiEnvelope<T> {
  success: boolean;
  data: T;
}

export const usersApi = {
  list: () => apiClient.get<ApiEnvelope<User[]>>('/users').then((r) => r.data.data),
};
