import { Link } from 'react-router-dom';
import { Card } from './ui/Card';
import type { Project } from '../types';

export function ProjectCard({ project }: { project: Project }) {
  return (
    <Link to={`/projects/${project._id}`} className="project-card-link">
      <Card className="project-card">
        <h3>{project.name}</h3>
        {project.description && <p className="project-card-desc">{project.description}</p>}
        {project.myRole && <span className={`badge badge-role-${project.myRole}`}>{project.myRole}</span>}
      </Card>
    </Link>
  );
}
