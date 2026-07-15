import { useQuery } from '@tanstack/react-query';
import { projectsApi } from '../api/projects.api';
import { queryKeys } from '../api/queryKeys';
import { ProjectCard } from '../components/ProjectCard';
import { CreateProjectForm } from '../components/CreateProjectForm';
import { Spinner } from '../components/ui/Spinner';
import { ErrorBanner } from '../components/ui/ErrorBanner';
import type { ApiErrorShape } from '../api/client';

export function ProjectListPage() {
  const {
    data: projects,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: queryKeys.projects,
    queryFn: projectsApi.list,
  });

  const apiError = error as ApiErrorShape | null;

  return (
    <div className="page">
      <div className="page-header">
        <h1>Your projects</h1>
      </div>

      <CreateProjectForm />

      {isLoading && <Spinner label="Loading projects" />}
      {apiError && <ErrorBanner message={apiError.message} onRetry={() => refetch()} />}

      {!isLoading &&
        !apiError &&
        (projects && projects.length > 0 ? (
          <div className="project-grid">
            {projects.map((project) => (
              <ProjectCard key={project._id} project={project} />
            ))}
          </div>
        ) : (
          <p className="empty-state">No projects yet — create your first one above.</p>
        ))}
    </div>
  );
}
