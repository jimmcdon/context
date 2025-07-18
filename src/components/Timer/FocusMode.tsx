import React, { useEffect, useCallback } from 'react';
import { X, Minimize2, Target, Clock } from 'lucide-react';
import { Timer } from './Timer';
import { useTimer } from '../../hooks/useTimer';
import { useGTDStore } from '../../store/gtdStore';
import { GTDItem } from '../../types/gtd';

interface FocusModeProps {
  task: GTDItem;
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
  onMinimize?: () => void;
}

export const FocusMode: React.FC<FocusModeProps> = ({
  task,
  isOpen,
  onClose,
  onComplete,
  onMinimize
}) => {
  const { updateTaskTime, pauseTask } = useGTDStore();

  // Initialize timer with existing elapsed time
  const timer = useTimer(
    task.elapsedTime || 0,
    task.estimatedMinutes,
    useCallback((elapsedSeconds: number) => {
      // Update task time every 10 seconds to avoid too frequent saves
      if (elapsedSeconds % 10 === 0) {
        updateTaskTime(task.id, elapsedSeconds);
      }
    }, [task.id, updateTaskTime])
  );

  // Start timer when task is in progress
  useEffect(() => {
    if (task.inProgress && !timer.isRunning) {
      timer.start();
    } else if (!task.inProgress && timer.isRunning) {
      timer.pause();
    }
  }, [task.inProgress, timer]);

  // Save time when component unmounts or task changes
  useEffect(() => {
    return () => {
      if (timer.elapsedTime !== (task.elapsedTime || 0)) {
        updateTaskTime(task.id, timer.elapsedTime);
      }
    };
  }, [task.id, timer.elapsedTime, task.elapsedTime, updateTaskTime]);

  const handleClose = useCallback(() => {
    // Save current time and pause
    updateTaskTime(task.id, timer.elapsedTime);
    if (task.inProgress) {
      pauseTask(task.id);
    }
    onClose();
  }, [task.id, timer.elapsedTime, task.inProgress, updateTaskTime, pauseTask, onClose]);

  const handleComplete = useCallback(() => {
    // Save final time
    updateTaskTime(task.id, timer.elapsedTime);
    onComplete();
  }, [task.id, timer.elapsedTime, updateTaskTime, onComplete]);

  const handlePause = useCallback(() => {
    timer.pause();
    pauseTask(task.id);
  }, [timer, pauseTask, task.id]);

  const progressColor = timer.progress > 100 
    ? 'text-red-400' 
    : timer.progress > 75 
    ? 'text-yellow-400' 
    : 'text-green-400';

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-cursor-sidebar border border-cursor-border rounded-lg shadow-2xl w-full max-w-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-cursor-border">
          <div className="flex items-center gap-2">
            <Target size={20} className="text-cursor-accent" />
            <span className="text-lg font-medium text-cursor-text">Focus Mode</span>
          </div>
          <div className="flex items-center gap-2">
            {onMinimize && (
              <button
                onClick={onMinimize}
                className="p-2 hover:bg-cursor-bg rounded transition-colors text-cursor-text-muted hover:text-cursor-text"
                title="Minimize to taskbar"
              >
                <Minimize2 size={16} />
              </button>
            )}
            <button
              onClick={handleClose}
              className="p-2 hover:bg-cursor-bg rounded transition-colors text-cursor-text-muted hover:text-cursor-text"
              title="Close focus mode"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Main focus area */}
        <div className="p-8 text-center">
          {/* Task info */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-cursor-text mb-2">{task.content}</h2>
            <div className="flex items-center justify-center gap-4 text-sm text-cursor-text-muted">
              {task.contextId && (
                <span>@{task.contextId}</span>
              )}
              {task.estimatedMinutes && (
                <span className="flex items-center gap-1">
                  <Clock size={12} />
                  Estimated: {task.estimatedMinutes}m
                </span>
              )}
              {task.energyRequired && (
                <span className="capitalize">{task.energyRequired} energy</span>
              )}
            </div>
          </div>

          {/* Timer display */}
          <div className="mb-8">
            <div className="text-6xl font-mono font-bold text-cursor-text mb-4">
              {timer.formattedTime}
            </div>
            
            {/* Progress bar */}
            {task.estimatedMinutes && (
              <div className="w-full bg-cursor-bg rounded-full h-3 mb-4 max-w-md mx-auto">
                <div 
                  className={`bg-current h-3 rounded-full transition-all duration-300 ${progressColor}`}
                  style={{ width: `${Math.min(timer.progress, 100)}%` }}
                />
              </div>
            )}
            
            {/* Status */}
            <div className="flex items-center justify-center gap-4 text-sm">
              <span className={timer.isRunning ? 'text-blue-400' : 'text-cursor-text-muted'}>
                {timer.isRunning ? '● Recording time' : 'Paused'}
              </span>
              {task.estimatedMinutes && (
                <span className={progressColor}>
                  {timer.progress > 100 ? 'Overtime' : `${Math.round(timer.progress)}% complete`}
                </span>
              )}
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-4">
            <Timer
              isRunning={timer.isRunning}
              elapsedTime={timer.elapsedTime}
              formattedTime={timer.formattedTime}
              progress={timer.progress}
              estimatedMinutes={task.estimatedMinutes}
              variant="compact"
              onStart={timer.start}
              onPause={handlePause}
              onReset={timer.reset}
              className="hidden" // Hide the timer component, we're using custom controls
            />
            
            <button
              onClick={handleComplete}
              className="flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              Complete Task
            </button>
          </div>
        </div>

        {/* Quick stats */}
        <div className="px-6 pb-6">
          <div className="bg-cursor-bg rounded-lg p-4">
            <div className="grid grid-cols-3 gap-4 text-center text-sm">
              <div>
                <div className="text-cursor-text-muted">Session</div>
                <div className="font-semibold text-cursor-text">{timer.formattedTime}</div>
              </div>
              {task.estimatedMinutes && (
                <div>
                  <div className="text-cursor-text-muted">Target</div>
                  <div className="font-semibold text-cursor-text">{task.estimatedMinutes}m</div>
                </div>
              )}
              <div>
                <div className="text-cursor-text-muted">Context</div>
                <div className="font-semibold text-cursor-text">@{task.contextId || 'None'}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};