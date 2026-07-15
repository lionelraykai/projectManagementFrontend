import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { getSocket, joinProject, leaveProject } from '../socket/socket';
import { queryKeys } from '../api/queryKeys';
import type { Task, TaskListResult } from '../types';

function upsertTask(result: TaskListResult | undefined, task: Task): TaskListResult {
  if (!result) return { tasks: [task], total: 1, page: 1, limit: 50 };
  const exists = result.tasks.some((t) => t._id === task._id);
  const tasks = exists ? result.tasks.map((t) => (t._id === task._id ? task : t)) : [task, ...result.tasks];
  return { ...result, tasks, total: exists ? result.total : result.total + 1 };
}

function dropTask(result: TaskListResult | undefined, taskId: string): TaskListResult | undefined {
  if (!result) return result;
  return { ...result, tasks: result.tasks.filter((t) => t._id !== taskId), total: Math.max(0, result.total - 1) };
}

// Joins the project's Socket.IO room for the lifetime of the board, and
// patches the TanStack Query cache directly from each event — this is what
// makes User B's screen update the instant User A moves a task, with no
// refetch round trip. Late joiners (User C) never rely on this: the query's
// initial fetch already reflects current DB state before this effect runs.
export function useProjectSocket(projectId: string | undefined): void {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!projectId) return;
    const socket = getSocket();
    if (!socket) return;

    joinProject(projectId);
    // A dropped connection (server restart, network blip) loses server-side
    // room membership even though socket.io-client auto-reconnects the
    // socket itself — rejoin on every reconnect, not just on mount.
    const onConnect = () => joinProject(projectId);
    socket.on('connect', onConnect);

    const key = queryKeys.tasks(projectId);
    const onCreated = (task: Task) => queryClient.setQueryData<TaskListResult>(key, (prev) => upsertTask(prev, task));
    const onUpdated = (task: Task) => queryClient.setQueryData<TaskListResult>(key, (prev) => upsertTask(prev, task));
    const onDeleted = ({ _id }: { _id: string }) =>
      queryClient.setQueryData<TaskListResult>(key, (prev) => dropTask(prev, _id));

    socket.on('task:created', onCreated);
    socket.on('task:updated', onUpdated);
    socket.on('task:deleted', onDeleted);

    return () => {
      socket.off('connect', onConnect);
      socket.off('task:created', onCreated);
      socket.off('task:updated', onUpdated);
      socket.off('task:deleted', onDeleted);
      leaveProject(projectId);
    };
  }, [projectId, queryClient]);
}
