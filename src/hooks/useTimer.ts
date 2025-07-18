import { useState, useEffect, useCallback, useRef } from 'react';

export interface TimerState {
  isRunning: boolean;
  elapsedTime: number; // in seconds
  startTime: Date | null;
  estimatedTime?: number; // in minutes
}

export interface UseTimerReturn {
  isRunning: boolean;
  elapsedTime: number;
  formattedTime: string;
  progress: number; // 0-100 percentage if estimated time provided
  start: () => void;
  pause: () => void;
  stop: () => void;
  reset: () => void;
}

export function useTimer(
  initialElapsedTime: number = 0,
  estimatedMinutes?: number,
  onTick?: (elapsedSeconds: number) => void
): UseTimerReturn {
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(initialElapsedTime);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Calculate progress percentage
  const progress = estimatedMinutes 
    ? Math.min((elapsedTime / (estimatedMinutes * 60)) * 100, 100)
    : 0;

  // Format time as MM:SS or HH:MM:SS
  const formattedTime = useCallback((seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  // Start timer
  const start = useCallback(() => {
    if (!isRunning) {
      setIsRunning(true);
    }
  }, [isRunning]);

  // Pause timer
  const pause = useCallback(() => {
    setIsRunning(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Stop timer (pause and can be resumed)
  const stop = useCallback(() => {
    pause();
  }, [pause]);

  // Reset timer to zero
  const reset = useCallback(() => {
    pause();
    setElapsedTime(0);
  }, [pause]);

  // Timer effect
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setElapsedTime(prev => {
          const newElapsed = prev + 1;
          onTick?.(newElapsed);
          return newElapsed;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, onTick]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    isRunning,
    elapsedTime,
    formattedTime: formattedTime(elapsedTime),
    progress,
    start,
    pause,
    stop,
    reset
  };
}