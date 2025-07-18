import React, { useCallback, useEffect } from 'react';
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
  AlertCircle,
  Focus
} from 'lucide-react';
import { GTDItem } from '../../types/gtd';
import { useTimer } from '../../hooks/useTimer';

interface TaskCardProps {
  task: GTDItem;
  onStartTask: (taskId: string) => void;
  onPauseTask: (taskId: string) => void;
  onCompleteTask: (taskId: string) => void;
  onRemoveFromToday: (taskId: string) => void;
  onUpdateTaskTime: (taskId: string, elapsedSeconds: number) => void;
  onOpenFocusMode?: (taskId: string) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onStartTask,
  onPauseTask,
  onCompleteTask,
  onRemoveFromToday,
  onUpdateTaskTime,
  onOpenFocusMode
}) => {
  const timer = useTimer(
    task.elapsedTime || 0,
    task.estimatedMinutes,
    useCallback((elapsedSeconds: number) => {
      if (task.inProgress && elapsedSeconds % 5 === 0) {
        onUpdateTaskTime(task.id, elapsedSeconds);
      }
    }, [task.id, task.inProgress, onUpdateTaskTime])
  );

  // Sync timer with task state
  useEffect(() => {
    if (task.inProgress && !timer.isRunning) {
      timer.start();
    } else if (!task.inProgress && timer.isRunning) {
      timer.pause();
    }
  }, [task.inProgress, timer]);

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

  const handleTaskAction = (action: 'start' | 'pause' | 'complete') => {
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
  };

  return (
    <div className="bg-cursor-sidebar border border-cursor-border rounded-lg p-3 mb-3 hover:border-cursor-accent transition-all group">
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

      {/* Timer display for in-progress tasks */}
      {task.inProgress && (
        <div className="mb-3 p-2 bg-blue-500/10 border border-blue-500/20 rounded">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Timer size={14} className="text-blue-400" />
              <span className="font-mono text-blue-400">{timer.formattedTime}</span>
            </div>
            {onOpenFocusMode && (
              <button
                onClick={() => onOpenFocusMode(task.id)}
                className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition-colors"
                title="Open focus mode"
              >
                <Focus size={12} />
                Focus
              </button>
            )}
          </div>
          {task.estimatedMinutes && (
            <div className="mt-1">
              <div className="w-full bg-cursor-bg rounded-full h-1">
                <div 
                  className={`h-1 rounded-full transition-all duration-300 ${
                    timer.progress > 100 ? 'bg-red-400' : timer.progress > 75 ? 'bg-yellow-400' : 'bg-blue-400'
                  }`}
                  style={{ width: `${Math.min(timer.progress, 100)}%` }}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Action buttons */}
      <div className="flex items-center justify-between">
        {task.inProgress ? (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-blue-400 text-xs">
              <Timer size={12} />
              <span>In Progress</span>
            </div>
            <button
              onClick={() => handleTaskAction('pause')}
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
            {task.actualMinutes && (
              <span className="text-cursor-text-muted ml-2">
                ({task.actualMinutes}m actual)
              </span>
            )}
          </div>
        ) : (
          <button
            onClick={() => handleTaskAction('start')}
            className="flex items-center gap-1 px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 transition-colors"
          >
            <Play size={12} />
            Start
          </button>
        )}

        {task.status !== 'completed' && (
          <button
            onClick={() => handleTaskAction('complete')}
            className="p-1 hover:bg-cursor-bg rounded transition-colors text-green-400"
            title="Mark complete"
          >
            <CheckCircle size={14} />
          </button>
        )}
      </div>
    </div>
  );
};