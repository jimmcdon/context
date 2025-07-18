import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Play,
  Pause,
  Square,
  RotateCcw,
  Trophy,
  Zap,
  Target,
  Award,
  CheckCircle,
  Clock,
  TrendingUp,
  Flame,
  Star
} from 'lucide-react';

interface TwoMinuteTimerProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (success: boolean, timeSpent: number) => void;
  initialIdea?: string;
  targetMinutes?: number;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  unlocked: boolean;
  unlockedAt?: Date;
}

interface TimerStats {
  totalSessions: number;
  successfulSessions: number;
  totalTimeSpent: number; // in seconds
  currentStreak: number;
  longestStreak: number;
  averageSessionTime: number;
  quickWins: number; // completed under 2 minutes
  achievements: Achievement[];
}

const TIMER_DURATION = 120; // 2 minutes in seconds

const defaultAchievements: Achievement[] = [
  {
    id: 'first-timer',
    title: 'First Timer',
    description: 'Complete your first 2-minute session',
    icon: <Play size={16} className="text-green-500" />,
    unlocked: false
  },
  {
    id: 'speed-demon',
    title: 'Speed Demon',
    description: 'Complete 5 tasks under 2 minutes',
    icon: <Zap size={16} className="text-yellow-500" />,
    unlocked: false
  },
  {
    id: 'streak-starter',
    title: 'Streak Starter',
    description: 'Complete 3 sessions in a row',
    icon: <Flame size={16} className="text-orange-500" />,
    unlocked: false
  },
  {
    id: 'time-master',
    title: 'Time Master',
    description: 'Complete 25 total sessions',
    icon: <Trophy size={16} className="text-purple-500" />,
    unlocked: false
  },
  {
    id: 'efficiency-expert',
    title: 'Efficiency Expert',
    description: 'Complete 10 tasks in under 1 minute',
    icon: <Target size={16} className="text-blue-500" />,
    unlocked: false
  },
  {
    id: 'consistency-champion',
    title: 'Consistency Champion',
    description: 'Maintain a 10-session streak',
    icon: <Award size={16} className="text-gold-500" />,
    unlocked: false
  }
];

export const TwoMinuteTimer: React.FC<TwoMinuteTimerProps> = ({
  isOpen,
  onClose,
  onComplete,
  initialIdea,
  targetMinutes = 2
}) => {
  const [timeRemaining, setTimeRemaining] = useState(TIMER_DURATION);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentIdea, setCurrentIdea] = useState(initialIdea || '');
  const [showCompletion, setShowCompletion] = useState(false);
  const [newAchievements, setNewAchievements] = useState<Achievement[]>([]);
  const [stats, setStats] = useState<TimerStats>(() => loadStats());
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);

  // Load stats from localStorage
  function loadStats(): TimerStats {
    try {
      const stored = localStorage.getItem('gtd-timer-stats');
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          ...parsed,
          achievements: parsed.achievements.map((ach: any) => ({
            ...ach,
            unlockedAt: ach.unlockedAt ? new Date(ach.unlockedAt) : undefined
          }))
        };
      }
    } catch (error) {
      console.warn('Failed to load timer stats:', error);
    }
    
    return {
      totalSessions: 0,
      successfulSessions: 0,
      totalTimeSpent: 0,
      currentStreak: 0,
      longestStreak: 0,
      averageSessionTime: 0,
      quickWins: 0,
      achievements: defaultAchievements
    };
  }

  // Save stats to localStorage
  const saveStats = useCallback((newStats: TimerStats) => {
    try {
      localStorage.setItem('gtd-timer-stats', JSON.stringify(newStats));
    } catch (error) {
      console.warn('Failed to save timer stats:', error);
    }
  }, []);

  // Check for new achievements
  const checkAchievements = useCallback((newStats: TimerStats): Achievement[] => {
    const unlockedAchievements: Achievement[] = [];
    
    newStats.achievements.forEach((achievement, index) => {
      if (achievement.unlocked) return;
      
      let shouldUnlock = false;
      
      switch (achievement.id) {
        case 'first-timer':
          shouldUnlock = newStats.totalSessions >= 1;
          break;
        case 'speed-demon':
          shouldUnlock = newStats.quickWins >= 5;
          break;
        case 'streak-starter':
          shouldUnlock = newStats.currentStreak >= 3;
          break;
        case 'time-master':
          shouldUnlock = newStats.totalSessions >= 25;
          break;
        case 'efficiency-expert':
          shouldUnlock = newStats.quickWins >= 10;
          break;
        case 'consistency-champion':
          shouldUnlock = newStats.currentStreak >= 10;
          break;
      }
      
      if (shouldUnlock) {
        const unlockedAchievement = {
          ...achievement,
          unlocked: true,
          unlockedAt: new Date()
        };
        newStats.achievements[index] = unlockedAchievement;
        unlockedAchievements.push(unlockedAchievement);
      }
    });
    
    return unlockedAchievements;
  }, []);

  // Start timer
  const startTimer = () => {
    setIsRunning(true);
    setIsPaused(false);
    startTimeRef.current = Date.now();
    
    intervalRef.current = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          handleTimerComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Pause timer
  const pauseTimer = () => {
    setIsPaused(true);
    setIsRunning(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  // Resume timer
  const resumeTimer = () => {
    setIsPaused(false);
    setIsRunning(true);
    
    intervalRef.current = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          handleTimerComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Reset timer
  const resetTimer = () => {
    setIsRunning(false);
    setIsPaused(false);
    setTimeRemaining(TIMER_DURATION);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  // Handle timer completion (ran out of time)
  const handleTimerComplete = () => {
    setIsRunning(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    // Show completion screen
    setShowCompletion(true);
  };

  // Handle manual completion (task finished early)
  const handleTaskComplete = () => {
    const timeSpent = TIMER_DURATION - timeRemaining;
    setIsRunning(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    // Update stats
    const newStats: TimerStats = {
      ...stats,
      totalSessions: stats.totalSessions + 1,
      successfulSessions: stats.successfulSessions + 1,
      totalTimeSpent: stats.totalTimeSpent + timeSpent,
      currentStreak: stats.currentStreak + 1,
      longestStreak: Math.max(stats.longestStreak, stats.currentStreak + 1),
      quickWins: timeSpent <= 60 ? stats.quickWins + 1 : stats.quickWins,
      averageSessionTime: (stats.totalTimeSpent + timeSpent) / (stats.totalSessions + 1),
      achievements: [...stats.achievements]
    };
    
    // Check for achievements
    const newlyUnlocked = checkAchievements(newStats);
    setNewAchievements(newlyUnlocked);
    
    setStats(newStats);
    saveStats(newStats);
    
    onComplete(true, timeSpent);
    setShowCompletion(true);
  };

  // Handle giving up
  const handleGiveUp = () => {
    const timeSpent = TIMER_DURATION - timeRemaining;
    setIsRunning(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    // Update stats (break streak)
    const newStats: TimerStats = {
      ...stats,
      totalSessions: stats.totalSessions + 1,
      totalTimeSpent: stats.totalTimeSpent + timeSpent,
      currentStreak: 0, // Reset streak
      averageSessionTime: (stats.totalTimeSpent + timeSpent) / (stats.totalSessions + 1),
      achievements: [...stats.achievements]
    };
    
    setStats(newStats);
    saveStats(newStats);
    
    onComplete(false, timeSpent);
    setShowCompletion(true);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Format time display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Calculate progress percentage
  const progress = ((TIMER_DURATION - timeRemaining) / TIMER_DURATION) * 100;

  if (!isOpen) return null;

  if (showCompletion) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <div className="bg-cursor-sidebar border border-cursor-border rounded-lg shadow-2xl w-full max-w-md text-center p-6">
          <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={32} className="text-green-400" />
          </div>
          
          <h2 className="text-xl font-bold text-cursor-text mb-2">
            {timeRemaining === 0 ? 'Time\'s Up!' : 'Task Completed!'}
          </h2>
          
          <p className="text-cursor-text-muted mb-6">
            {timeRemaining === 0 
              ? 'The 2-minute timer has ended. How did it go?'
              : `Great job! You finished in ${formatTime(TIMER_DURATION - timeRemaining)}`
            }
          </p>

          {/* New Achievements */}
          {newAchievements.length > 0 && (
            <div className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
              <h3 className="font-medium text-yellow-400 mb-2 flex items-center justify-center gap-2">
                <Star size={16} />
                New Achievement{newAchievements.length > 1 ? 's' : ''}!
              </h3>
              {newAchievements.map(achievement => (
                <div key={achievement.id} className="flex items-center gap-2 text-sm text-cursor-text">
                  {achievement.icon}
                  <span>{achievement.title}</span>
                </div>
              ))}
            </div>
          )}

          {/* Stats Summary */}
          <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
            <div className="bg-cursor-bg p-3 rounded-lg">
              <div className="text-cursor-accent font-bold">{stats.currentStreak + 1}</div>
              <div className="text-cursor-text-muted">Current Streak</div>
            </div>
            <div className="bg-cursor-bg p-3 rounded-lg">
              <div className="text-cursor-accent font-bold">{stats.totalSessions + 1}</div>
              <div className="text-cursor-text-muted">Total Sessions</div>
            </div>
          </div>

          <button
            onClick={() => {
              setShowCompletion(false);
              onClose();
            }}
            className="w-full bg-cursor-accent text-white py-3 rounded-lg hover:bg-cursor-accent/90 transition-colors font-medium"
          >
            Continue
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-cursor-sidebar border border-cursor-border rounded-lg shadow-2xl w-full max-w-lg">
        {/* Header */}
        <div className="p-6 border-b border-cursor-border">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-cursor-text">2-Minute Rule</h2>
            <button
              onClick={onClose}
              className="text-cursor-text-muted hover:text-cursor-text transition-colors"
            >
              ✕
            </button>
          </div>
          
          <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
            <p className="text-sm text-cursor-text-muted">
              <strong>GTD Principle:</strong> If it takes less than 2 minutes, do it now!
            </p>
          </div>
        </div>

        {/* Timer */}
        <div className="p-6">
          <div className="text-center mb-6">
            <div className="relative w-32 h-32 mx-auto mb-4">
              {/* Circular Progress */}
              <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
                <circle
                  cx="60"
                  cy="60"
                  r="54"
                  stroke="currentColor"
                  strokeWidth="12"
                  fill="transparent"
                  className="text-cursor-border"
                />
                <circle
                  cx="60"
                  cy="60"
                  r="54"
                  stroke="currentColor"
                  strokeWidth="12"
                  fill="transparent"
                  strokeDasharray={`${2 * Math.PI * 54}`}
                  strokeDashoffset={`${2 * Math.PI * 54 * (1 - progress / 100)}`}
                  className="text-cursor-accent transition-all duration-1000"
                  strokeLinecap="round"
                />
              </svg>
              
              {/* Timer Display */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-2xl font-bold text-cursor-text">
                    {formatTime(timeRemaining)}
                  </div>
                  <div className="text-xs text-cursor-text-muted">
                    {timeRemaining > 0 ? 'remaining' : 'complete'}
                  </div>
                </div>
              </div>
            </div>

            {/* Current Task */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-cursor-text mb-2">
                What are you working on?
              </label>
              <input
                type="text"
                value={currentIdea}
                onChange={(e) => setCurrentIdea(e.target.value)}
                placeholder="Enter your 2-minute task..."
                className="w-full bg-cursor-bg border border-cursor-border rounded-md px-3 py-2 text-cursor-text placeholder-cursor-text-muted focus:outline-none focus:border-cursor-accent"
                disabled={isRunning && !isPaused}
              />
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-3 mb-6">
              {!isRunning && !isPaused && (
                <button
                  onClick={startTimer}
                  disabled={!currentIdea.trim()}
                  className="flex items-center gap-2 bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Play size={16} />
                  Start Timer
                </button>
              )}
              
              {isRunning && (
                <button
                  onClick={pauseTimer}
                  className="flex items-center gap-2 bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition-colors"
                >
                  <Pause size={16} />
                  Pause
                </button>
              )}
              
              {isPaused && (
                <button
                  onClick={resumeTimer}
                  className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
                >
                  <Play size={16} />
                  Resume
                </button>
              )}
              
              {(isRunning || isPaused) && (
                <>
                  <button
                    onClick={resetTimer}
                    className="flex items-center gap-2 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    <RotateCcw size={16} />
                    Reset
                  </button>
                  
                  <button
                    onClick={handleTaskComplete}
                    className="flex items-center gap-2 bg-cursor-accent text-white px-4 py-2 rounded-lg hover:bg-cursor-accent/90 transition-colors"
                  >
                    <CheckCircle size={16} />
                    Done!
                  </button>
                </>
              )}
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-4 text-center text-sm">
              <div className="bg-cursor-bg p-3 rounded-lg">
                <div className="text-cursor-accent font-bold">{stats.currentStreak}</div>
                <div className="text-cursor-text-muted">Streak</div>
              </div>
              <div className="bg-cursor-bg p-3 rounded-lg">
                <div className="text-cursor-accent font-bold">{stats.quickWins}</div>
                <div className="text-cursor-text-muted">Quick Wins</div>
              </div>
              <div className="bg-cursor-bg p-3 rounded-lg">
                <div className="text-cursor-accent font-bold">{stats.totalSessions}</div>
                <div className="text-cursor-text-muted">Sessions</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};