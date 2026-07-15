import { useState } from 'react';
import type { FormEvent } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { tasksApi } from '../api/tasks.api';
import { queryKeys } from '../api/queryKeys';
import { Input } from './ui/Input';
import { Select } from './ui/Select';
import { Button } from './ui/Button';
import { ErrorBanner } from './ui/ErrorBanner';
import type { ApiErrorShape } from '../api/client';
import type { MemberOption, TaskListResult, TaskPriority } from '../types';

const PRIORITY_OPTIONS = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
];

export function CreateTaskForm({ projectId, members }: { projectId: string; members: MemberOption[] }) {
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [assigneeId, setAssigneeId] = useState('');
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: () => tasksApi.create(projectId, { title, priority, assigneeId: assigneeId || undefined }),
    onSuccess: (task) => {
      // Optimistic local upsert; the socket broadcast echoes the same task
      // back and overwrites this entry by _id, so there's no duplicate.
      queryClient.setQueryData<TaskListResult>(queryKeys.tasks(projectId), (prev) =>
        prev
          ? { ...prev, tasks: [task, ...prev.tasks.filter((t) => t._id !== task._id)], total: prev.total + 1 }
          : { tasks: [task], total: 1, page: 1, limit: 50 }
      );
      setTitle('');
      setPriority('medium');
      setAssigneeId('');
    },
  });

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!title.trim()) return;
    mutation.mutate();
  }

  const error = mutation.error as ApiErrorShape | null;

  return (
    <form className="inline-form task-form" onSubmit={handleSubmit}>
      <Input
        label="New task"
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        placeholder="Task title"
        required
      />
      <Select
        label="Priority"
        options={PRIORITY_OPTIONS}
        value={priority}
        onChange={(event) => setPriority(event.target.value as TaskPriority)}
      />
      <Select
        label="Assignee"
        options={[{ value: '', label: 'Unassigned' }, ...members.map((m) => ({ value: m.id, label: m.name }))]}
        value={assigneeId}
        onChange={(event) => setAssigneeId(event.target.value)}
      />
      {error && <ErrorBanner message={error.message} details={error.details} />}
      <div className="field field-submit">
        <span className="field-spacer-label" aria-hidden="true">
          &nbsp;
        </span>
        <Button type="submit" isLoading={mutation.isPending}>
          Add task
        </Button>
      </div>
    </form>
  );
}
