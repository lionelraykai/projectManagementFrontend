import type { MemberOption, Task, TaskStatus } from '../types';
import { TaskCard } from './TaskCard';

const COLUMN_TITLES: Record<TaskStatus, string> = {
  todo: 'To Do',
  in_progress: 'In Progress',
  done: 'Done',
};

export function TaskColumn({
  status,
  tasks,
  members,
}: {
  status: TaskStatus;
  tasks: Task[];
  members: MemberOption[];
}) {
  return (
    <div className="task-column">
      <div className="task-column-header">
        <h3>{COLUMN_TITLES[status]}</h3>
        <span className="task-count">{tasks.length}</span>
      </div>
      <div className="task-column-body">
        {tasks.length === 0 ? (
          <p className="task-column-empty">No tasks</p>
        ) : (
          tasks.map((task) => <TaskCard key={task._id} task={task} members={members} />)
        )}
      </div>
    </div>
  );
}
