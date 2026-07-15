import { apiClient } from './client';
import type { Task, TaskListResult, TaskPriority, TaskStatus } from '../types';

interface ApiEnvelope<T> {
  success: boolean;
  data: T;
}

export const tasksApi = {
  list: (projectId: string) =>
    apiClient.get<ApiEnvelope<TaskListResult>>(`/projects/${projectId}/tasks`).then((r) => r.data.data),

  create: (
    projectId: string,
    payload: { title: string; description?: string; priority?: TaskPriority; assigneeId?: string }
  ) => apiClient.post<ApiEnvelope<Task>>(`/projects/${projectId}/tasks`, payload).then((r) => r.data.data),

  updateStatus: (taskId: string, status: TaskStatus) =>
    apiClient.patch<ApiEnvelope<Task>>(`/tasks/${taskId}`, { status }).then((r) => r.data.data),

  updateAssignee: (taskId: string, assigneeId: string | null) =>
    apiClient.patch<ApiEnvelope<Task>>(`/tasks/${taskId}`, { assigneeId }).then((r) => r.data.data),

  remove: (taskId: string) => apiClient.delete(`/tasks/${taskId}`),
};
