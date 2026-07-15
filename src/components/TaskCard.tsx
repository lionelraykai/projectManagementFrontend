import { useMutation, useQueryClient } from '@tanstack/react-query';
import { tasksApi } from '../api/tasks.api';
import { queryKeys } from '../api/queryKeys';
import { Card } from './ui/Card';
import { Select } from './ui/Select';
import { PriorityBadge } from './ui/Badge';
import type { MemberOption, Task, TaskListResult, TaskStatus } from '../types';

const STATUS_OPTIONS = [
  { value: 'todo', label: 'To Do' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'done', label: 'Done' },
];

export function TaskCard({ task, members }: { task: Task; members: MemberOption[] }) {
  const queryClient = useQueryClient();

  function patchCache(updated: Task) {
    queryClient.setQueryData<TaskListResult>(queryKeys.tasks(task.projectId), (prev) =>
      prev ? { ...prev, tasks: prev.tasks.map((t) => (t._id === updated._id ? updated : t)) } : prev
    );
  }

  const statusMutation = useMutation({
    mutationFn: (status: TaskStatus) => tasksApi.updateStatus(task._id, status),
    onSuccess: patchCache,
  });

  const assigneeMutation = useMutation({
    mutationFn: (assigneeId: string) => tasksApi.updateAssignee(task._id, assigneeId || null),
    onSuccess: patchCache,
  });

  const assigneeOptions = [
    { value: '', label: 'Unassigned' },
    ...members.map((m) => ({ value: m.id, label: m.name })),
  ];

  return (
    <Card className="task-card">
      <div className="task-card-header">
        <h4>{task.title}</h4>
        <PriorityBadge priority={task.priority} />
      </div>
      {task.description && <p className="task-card-desc">{task.description}</p>}
      <div className="task-card-controls">
        <Select
          options={STATUS_OPTIONS}
          value={task.status}
          onChange={(event) => statusMutation.mutate(event.target.value as TaskStatus)}
          disabled={statusMutation.isPending}
          aria-label={`Status for ${task.title}`}
        />
        <Select
          options={assigneeOptions}
          value={task.assigneeId ?? ''}
          onChange={(event) => assigneeMutation.mutate(event.target.value)}
          disabled={assigneeMutation.isPending}
          aria-label={`Assignee for ${task.title}`}
        />
      </div>
    </Card>
  );
}
