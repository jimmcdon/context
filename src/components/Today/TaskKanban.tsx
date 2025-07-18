import React, { useCallback, useMemo } from 'react';
import { 
  Clock,
  CheckCircle,
  Play,
  Pause,
  MoreHorizontal,
  Timer,
  Brain,
  Battery,
  Coffee,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { GTDItem } from '../../types/gtd';

interface TaskKanbanProps {
  tasks: GTDItem[];
  onStartTask: (taskId: string) => void;
  onPauseTask: (taskId: string) => void;
  onCompleteTask: (taskId: string) => void;
  onRemoveFromToday: (taskId: string) => void;
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
  onRemoveFromToday
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

  const getEnergyIcon = (energy?: string) => {
    switch (energy) {
      case 'high': return <Brain size={12} className="text-purple-400" />;
      case 'medium': return <Battery size={12} className="text-green-400" />;
      case 'low': return <Coffee size={12} className="text-yellow-400" />;
      case 'zombie': return <Coffee size={12} className="text-gray-400" />;
      default: return null;
    }
  };

  const formatTime = (minutes?: number) => {
    if (!minutes) return '';
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  const handleTaskAction = useCallback((task: GTDItem, action: 'start' | 'pause' | 'complete') => {
    switch (action) {
      case 'start':
        onStartTask(task.id);
        break;
      case 'pause':
        onPauseTask(task.id);
        break;
      case 'complete':
        onCompleteTask(task.id);
        break;
    }
  }, [onStartTask, onPauseTask, onCompleteTask]);

  const renderTask = (task: GTDItem) => (
    <div
      key={task.id}
      className="bg-cursor-sidebar border border-cursor-border rounded-lg p-3 mb-3 hover:border-cursor-accent transition-all group"
    >
      <div className="flex items-start justify-between mb-2">
        <h4 className="text-cursor-text font-medium text-sm flex-1 pr-2">{task.content}</h4>
        <button
          onClick={() => onRemoveFromToday(task.id)}
          className="opacity-0 group-hover:opacity-100 p-1 hover:bg-cursor-bg rounded transition-all text-cursor-text-muted"
        >
          <MoreHorizontal size={12} />
        </button>
      </div>

      {/* Task metadata */}
      <div className="flex items-center gap-2 mb-3 text-xs">
        {task.contextId && (
          <span className="text-cursor-text-muted">@{task.contextId}</span>
        )}
        {task.estimatedMinutes && (
          <span className="flex items-center gap-1 text-cursor-text-muted">
            <Clock size={10} />
            {formatTime(task.estimatedMinutes)}
          </span>
        )}
        {task.energyRequired && (
          <span className="flex items-center gap-1">
            {getEnergyIcon(task.energyRequired)}
          </span>
        )}
        {task.dueDate && (
          <span className="flex items-center gap-1 text-orange-400">
            <Calendar size={10} />
            Due
          </span>
        )}
        {task.isUrgent && (
          <span className="flex items-center gap-1 text-red-400">
            <AlertCircle size={10} />
          </span>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex items-center justify-between">
        {task.inProgress ? (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-blue-400 text-xs">
              <Timer size={12} />
              <span>In Progress</span>
            </div>
            <button
              onClick={() => handleTaskAction(task, 'pause')}
              className="p-1 hover:bg-cursor-bg rounded transition-colors text-blue-400"
              title="Pause task"
            >
              <Pause size={14} />
            </button>
          </div>
        ) : task.status === 'completed' ? (
          <div className="flex items-center gap-1 text-green-400 text-xs">
            <CheckCircle size={12} />
            <span>Completed</span>
          </div>
        ) : (
          <button
            onClick={() => handleTaskAction(task, 'start')}
            className="flex items-center gap-1 px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 transition-colors"
          >
            <Play size={12} />
            Start
          </button>
        )}

        {task.status !== 'completed' && (
          <button
            onClick={() => handleTaskAction(task, 'complete')}
            className="p-1 hover:bg-cursor-bg rounded transition-colors text-green-400"
            title="Mark complete"
          >
            <CheckCircle size={14} />
          </button>
        )}
      </div>

      {/* Progress indicator for in-progress tasks */}
      {task.inProgress && (
        <div className="mt-2 pt-2 border-t border-cursor-border">
          <div className="flex items-center justify-between text-xs text-cursor-text-muted">
            <span>Timer running...</span>
            {task.estimatedMinutes && (
              <span>Est. {formatTime(task.estimatedMinutes)}</span>
            )}
          </div>
        </div>
      )}
    </div>
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