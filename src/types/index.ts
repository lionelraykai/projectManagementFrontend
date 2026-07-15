export type TaskStatus = 'todo' | 'in_progress' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high';
export type ProjectRole = 'owner' | 'member' | 'viewer';
export type UserRole = 'admin' | 'user';

export const TASK_STATUSES: TaskStatus[] = ['todo', 'in_progress', 'done'];

export interface User {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface Project {
  _id: string;
  name: string;
  description: string;
  ownerId: string;
  archived: boolean;
  myRole?: ProjectRole;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectMember {
  _id: string;
  projectId: string;
  userId: User | string;
  role: ProjectRole;
}

export interface Task {
  _id: string;
  projectId: string;
  title: string;
  description: string;
  status: TaskStatus;
  assigneeId: string | null;
  priority: TaskPriority;
  dueDate: string | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface TaskListResult {
  tasks: Task[];
  total: number;
  page: number;
  limit: number;
}

// Derived from a project's member list (populated userId) — the shape the
// assignee pickers in CreateTaskForm/TaskCard actually need.
export interface MemberOption {
  id: string;
  name: string;
}
