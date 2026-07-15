export const queryKeys = {
  projects: ['projects'] as const,
  project: (projectId: string) => ['projects', projectId] as const,
  tasks: (projectId: string) => ['tasks', projectId] as const,
  users: ['users'] as const,
};
