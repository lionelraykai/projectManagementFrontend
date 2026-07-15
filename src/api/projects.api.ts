import { apiClient } from './client';
import type { Project, ProjectMember, ProjectRole } from '../types';

interface ApiEnvelope<T> {
  success: boolean;
  data: T;
}

export const projectsApi = {
  list: () => apiClient.get<ApiEnvelope<Project[]>>('/projects').then((r) => r.data.data),

  create: (payload: { name: string; description?: string }) =>
    apiClient.post<ApiEnvelope<Project>>('/projects', payload).then((r) => r.data.data),

  get: (projectId: string) =>
    apiClient
      .get<ApiEnvelope<{ project: Project; members: ProjectMember[] }>>(`/projects/${projectId}`)
      .then((r) => r.data.data),

  addMember: (projectId: string, payload: { userId: string; role: ProjectRole }) =>
    apiClient.post<ApiEnvelope<ProjectMember>>(`/projects/${projectId}/members`, payload).then((r) => r.data.data),

  removeMember: (projectId: string, userId: string) =>
    apiClient.delete(`/projects/${projectId}/members/${userId}`),
};
