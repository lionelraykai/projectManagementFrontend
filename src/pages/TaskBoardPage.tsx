import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { tasksApi } from '../api/tasks.api';
import { projectsApi } from '../api/projects.api';
import { queryKeys } from '../api/queryKeys';
import { useProjectSocket } from '../hooks/useProjectSocket';
import { TaskColumn } from '../components/TaskColumn';
import { CreateTaskForm } from '../components/CreateTaskForm';
import { ProjectMembers } from '../components/ProjectMembers';
import { Spinner } from '../components/ui/Spinner';
import { ErrorBanner } from '../components/ui/ErrorBanner';
import { TASK_STATUSES } from '../types';
import type { ApiErrorShape } from '../api/client';
import type { MemberOption } from '../types';

export function TaskBoardPage() {
  const { projectId } = useParams<{ projectId: string }>();

  // Joins the project's socket room for the lifetime of this page; see
  // useProjectSocket for how live task events patch the query cache below.
  useProjectSocket(projectId);

  const projectQuery = useQuery({
    queryKey: queryKeys.project(projectId ?? ''),
    queryFn: () => projectsApi.get(projectId as string),
    enabled: Boolean(projectId),
  });

  const tasksQuery = useQuery({
    queryKey: queryKeys.tasks(projectId ?? ''),
    queryFn: () => tasksApi.list(projectId as string),
    enabled: Boolean(projectId),
  });

  if (!projectId) return <ErrorBanner message="No project selected" />;

  const isLoading = projectQuery.isLoading || tasksQuery.isLoading;
  const error = (projectQuery.error ?? tasksQuery.error) as ApiErrorShape | null;

  const memberOptions: MemberOption[] = (projectQuery.data?.members ?? []).flatMap((member) =>
    typeof member.userId === 'string' ? [] : [{ id: member.userId._id, name: member.userId.name }]
  );

  return (
    <div className="page">
      <div className="page-header">
        <Link to="/projects" className="back-link">
          &larr; All projects
        </Link>
        <h1>{projectQuery.data?.project.name ?? 'Task board'}</h1>
      </div>

      {projectQuery.data && <ProjectMembers projectId={projectId} members={projectQuery.data.members} />}

      <CreateTaskForm projectId={projectId} members={memberOptions} />

      {isLoading && <Spinner label="Loading board" />}
      {error && (
        <ErrorBanner
          message={error.message}
          onRetry={() => {
            projectQuery.refetch();
            tasksQuery.refetch();
          }}
        />
      )}

      {!isLoading && !error && (
        <div className="task-board">
          {TASK_STATUSES.map((status) => (
            <TaskColumn
              key={status}
              status={status}
              tasks={(tasksQuery.data?.tasks ?? []).filter((task) => task.status === status)}
              members={memberOptions}
            />
          ))}
        </div>
      )}
    </div>
  );
}
