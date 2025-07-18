import React from 'react';
import { Play, Pause, Square, RotateCcw, Clock, Target } from 'lucide-react';

interface TimerProps {
  isRunning: boolean;
  elapsedTime: number;
  formattedTime: string;
  progress?: number;
  estimatedMinutes?: number;
  taskName?: string;
  variant?: 'compact' | 'full' | 'focus';
  onStart?: () => void;
  onPause?: () => void;
  onStop?: () => void;
  onReset?: () => void;
  className?: string;
}

export const Timer: React.FC<TimerProps> = ({
  isRunning,
  elapsedTime,
  formattedTime,
  progress = 0,
  estimatedMinutes,
  taskName,
  variant = 'compact',
  onStart,
  onPause,
  onStop,
  onReset,
  className = ''
}) => {
  const formatEstimatedTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  const isOvertime = estimatedMinutes && elapsedTime > estimatedMinutes * 60;
  const progressColor = isOvertime ? 'bg-red-500' : progress > 75 ? 'bg-yellow-500' : 'bg-green-500';

  if (variant === 'compact') {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className="flex items-center gap-1 text-sm">
          <Clock size={14} className={isRunning ? 'text-blue-400' : 'text-cursor-text-muted'} />
          <span className={`font-mono ${isRunning ? 'text-blue-400' : 'text-cursor-text'}`}>
            {formattedTime}
          </span>
        </div>
        
        {isRunning ? (
          <button
            onClick={onPause}
            className="p-1 hover:bg-cursor-bg rounded transition-colors text-blue-400"
            title="Pause timer"
          >
            <Pause size={14} />
          </button>
        ) : (
          <button
            onClick={onStart}
            className="p-1 hover:bg-cursor-bg rounded transition-colors text-cursor-text-muted hover:text-green-400"
            title="Start timer"
          >
            <Play size={14} />
          </button>
        )}
      </div>
    );
  }

  if (variant === 'focus') {
    return (
      <div className={`bg-cursor-sidebar border border-cursor-border rounded-lg p-6 ${className}`}>
        {/* Task name */}
        {taskName && (
          <div className="text-center mb-4">
            <h3 className="text-lg font-medium text-cursor-text mb-1">{taskName}</h3>
            {estimatedMinutes && (
              <p className="text-sm text-cursor-text-muted">
                Estimated: {formatEstimatedTime(estimatedMinutes)}
              </p>
            )}
          </div>
        )}

        {/* Large timer display */}
        <div className="text-center mb-6">
          <div className="text-4xl font-mono font-bold text-cursor-text mb-2">
            {formattedTime}
          </div>
          
          {/* Progress bar */}
          {estimatedMinutes && (
            <div className="w-full bg-cursor-bg rounded-full h-2 mb-2">
              <div 
                className={`${progressColor} h-2 rounded-full transition-all duration-300`}
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>
          )}
          
          {/* Status */}
          <div className="flex items-center justify-center gap-4 text-sm text-cursor-text-muted">
            {estimatedMinutes && (
              <span className="flex items-center gap-1">
                <Target size={12} />
                {formatEstimatedTime(estimatedMinutes)}
              </span>
            )}
            {isOvertime && (
              <span className="text-red-400 font-medium">Overtime</span>
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-3">
          {isRunning ? (
            <button
              onClick={onPause}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Pause size={16} />
              Pause
            </button>
          ) : (
            <button
              onClick={onStart}
              className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              <Play size={16} />
              {elapsedTime > 0 ? 'Resume' : 'Start'}
            </button>
          )}
          
          <button
            onClick={onStop}
            className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            <Square size={16} />
            Stop
          </button>
          
          <button
            onClick={onReset}
            className="p-2 border border-cursor-border rounded-lg hover:bg-cursor-bg transition-colors text-cursor-text-muted hover:text-cursor-text"
            title="Reset timer"
          >
            <RotateCcw size={16} />
          </button>
        </div>
      </div>
    );
  }

  // Full variant
  return (
    <div className={`bg-cursor-bg rounded-lg p-4 border border-cursor-border ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Clock size={16} className="text-cursor-accent" />
          <span className="text-sm font-medium text-cursor-text">Timer</span>
        </div>
        {estimatedMinutes && (
          <span className="text-xs text-cursor-text-muted">
            Target: {formatEstimatedTime(estimatedMinutes)}
          </span>
        )}
      </div>

      {/* Timer display */}
      <div className="text-center mb-4">
        <div className="text-2xl font-mono font-bold text-cursor-text mb-2">
          {formattedTime}
        </div>
        
        {/* Progress bar */}
        {estimatedMinutes && (
          <div className="w-full bg-cursor-sidebar rounded-full h-1.5 mb-2">
            <div 
              className={`${progressColor} h-1.5 rounded-full transition-all duration-300`}
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
        )}
        
        {/* Status indicators */}
        <div className="text-xs text-cursor-text-muted">
          {isRunning && <span className="text-blue-400">● Running</span>}
          {!isRunning && elapsedTime > 0 && <span>Paused</span>}
          {!isRunning && elapsedTime === 0 && <span>Ready</span>}
          {isOvertime && <span className="text-red-400 ml-2">Overtime</span>}
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-2">
        {isRunning ? (
          <button
            onClick={onPause}
            className="flex items-center gap-1 bg-blue-600 text-white px-3 py-1.5 rounded text-sm hover:bg-blue-700 transition-colors"
          >
            <Pause size={12} />
            Pause
          </button>
        ) : (
          <button
            onClick={onStart}
            className="flex items-center gap-1 bg-green-600 text-white px-3 py-1.5 rounded text-sm hover:bg-green-700 transition-colors"
          >
            <Play size={12} />
            {elapsedTime > 0 ? 'Resume' : 'Start'}
          </button>
        )}
        
        <button
          onClick={onStop}
          className="flex items-center gap-1 bg-red-600 text-white px-3 py-1.5 rounded text-sm hover:bg-red-700 transition-colors"
        >
          <Square size={12} />
          Stop
        </button>
        
        <button
          onClick={onReset}
          className="p-1.5 border border-cursor-border rounded hover:bg-cursor-bg transition-colors text-cursor-text-muted hover:text-cursor-text"
          title="Reset timer"
        >
          <RotateCcw size={12} />
        </button>
      </div>
    </div>
  );
};