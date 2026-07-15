import { useState } from 'react';
import type { FormEvent } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { projectsApi } from '../api/projects.api';
import { queryKeys } from '../api/queryKeys';
import { Input } from './ui/Input';
import { TextArea } from './ui/TextArea';
import { Button } from './ui/Button';
import { ErrorBanner } from './ui/ErrorBanner';
import type { ApiErrorShape } from '../api/client';
import type { Project } from '../types';

export function CreateProjectForm({ onCreated }: { onCreated?: () => void }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: () => projectsApi.create({ name, description }),
    onSuccess: (project) => {
      // The creator is always made "owner" server-side (see project.service.js),
      // but the create response itself doesn't carry myRole the way the list
      // endpoint does — set it locally so the badge doesn't wait for a refetch.
      const withRole: Project = { ...project, myRole: 'owner' };
      queryClient.setQueryData<Project[]>(queryKeys.projects, (prev) => (prev ? [withRole, ...prev] : [withRole]));
      setName('');
      setDescription('');
      onCreated?.();
    },
  });

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!name.trim()) return;
    mutation.mutate();
  }

  const error = mutation.error as ApiErrorShape | null;

  return (
    <form className="inline-form" onSubmit={handleSubmit}>
      <Input
        label="Project name"
        value={name}
        onChange={(event) => setName(event.target.value)}
        placeholder="e.g. Launch Plan"
        required
      />
      <TextArea
        label="Description"
        value={description}
        onChange={(event) => setDescription(event.target.value)}
        placeholder="Optional"
        rows={2}
      />
      {error && <ErrorBanner message={error.message} details={error.details} />}
      <div className="field field-submit">
        <span className="field-spacer-label" aria-hidden="true">
          &nbsp;
        </span>
        <Button type="submit" isLoading={mutation.isPending}>
          Create project
        </Button>
      </div>
    </form>
  );
}
