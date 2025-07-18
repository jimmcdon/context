import React, { useMemo } from 'react';
import { GTDItem } from '../../types/gtd';
import { TaskCard } from './TaskCard';

interface TaskKanbanProps {
  tasks: GTDItem[];
  onStartTask: (taskId: string) => void;
  onPauseTask: (taskId: string) => void;
  onCompleteTask: (taskId: string) => void;
  onRemoveFromToday: (taskId: string) => void;
  onUpdateTaskTime: (taskId: string, elapsedSeconds: number) => void;
  onOpenFocusMode?: (taskId: string) => void;
}

interface KanbanColumn {
  id: 'pending' | 'in-progress' | 'completed';
  title: string;
  tasks: GTDItem[];
  color: string;
}

export const TaskKanban: React.FC<TaskKanbanProps> = ({
  tasks,
  onStartTask,
  onPauseTask,
  onCompleteTask,
  onRemoveFromToday,
  onUpdateTaskTime,
  onOpenFocusMode
}) => {
  
  // Group tasks by status for Kanban columns
  const columns: KanbanColumn[] = useMemo(() => {
    const pending = tasks.filter(task => task.status === 'active' && !task.inProgress);
    const inProgress = tasks.filter(task => task.status === 'active' && task.inProgress);
    const completed = tasks.filter(task => task.status === 'completed');

    return [
      {
        id: 'pending',
        title: 'Pending',
        tasks: pending,
        color: 'bg-gray-500/10 border-gray-500/20'
      },
      {
        id: 'in-progress',
        title: 'In Progress',
        tasks: inProgress,
        color: 'bg-blue-500/10 border-blue-500/20'
      },
      {
        id: 'completed',
        title: 'Completed',
        tasks: completed,
        color: 'bg-green-500/10 border-green-500/20'
      }
    ];
  }, [tasks]);


  const renderTask = (task: GTDItem) => (
    <TaskCard
      key={task.id}
      task={task}
      onStartTask={onStartTask}
      onPauseTask={onPauseTask}
      onCompleteTask={onCompleteTask}
      onRemoveFromToday={onRemoveFromToday}
      onUpdateTaskTime={onUpdateTaskTime}
      onOpenFocusMode={onOpenFocusMode}
    />
  );

  return (
    <div className="grid grid-cols-3 gap-4 h-full">
      {columns.map((column) => (
        <div key={column.id} className="flex flex-col">
          {/* Column Header */}
          <div className={`${column.color} rounded-lg border-2 border-dashed p-3 mb-4`}>
            <h3 className="font-medium text-cursor-text text-center">
              {column.title} ({column.tasks.length})
            </h3>
          </div>

          {/* Column Content */}
          <div className="flex-1 min-h-0">
            <div className="h-full overflow-y-auto pr-2">
              {column.tasks.length > 0 ? (
                column.tasks.map(renderTask)
              ) : (
                <div className="text-center text-cursor-text-muted text-sm py-8">
                  {column.id === 'pending' && 'No tasks pending'}
                  {column.id === 'in-progress' && 'No tasks in progress'}
                  {column.id === 'completed' && 'No tasks completed'}
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};