import React, { useState, useCallback, useMemo } from 'react';
import { 
  Calendar,
  Clock,
  CheckCircle,
  Plus,
  Target,
  Zap,
  Brain,
  Battery,
  Coffee,
  AlertCircle,
  TrendingUp,
  BookOpen,
  List,
  Columns
} from 'lucide-react';
import { useGTDStore } from '../../store/gtdStore';
import { TaskKanban } from './TaskKanban';

interface TodayDashboardProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TodayDashboard: React.FC<TodayDashboardProps> = ({ isOpen, onClose }) => {
  const {
    items,
    todayTaskIds,
    dailyNotes,
    completeItem,
    addToToday,
    removeFromToday,
    setDailyNotes,
    startTask,
    pauseTask
  } = useGTDStore();

  const [showTaskSelector, setShowTaskSelector] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('kanban');

  // Get today's date info (memoized to prevent unnecessary re-renders)
  const today = useMemo(() => new Date(), []);
  const todayString = useMemo(() => today.toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  }), [today]);

  // Get tasks for today
  const todayTasks = useMemo(() => {
    return items.filter(item => 
      item.status === 'active' && 
      (todayTaskIds.includes(item.id) || 
       (item.dueDate && new Date(item.dueDate).toDateString() === today.toDateString()) ||
       item.isUrgent)
    );
  }, [items, todayTaskIds, today]);

  // Get available tasks to add to today
  const availableTasks = useMemo(() => {
    return items.filter(item => 
      item.status === 'active' && 
      item.isNextAction && 
      !todayTaskIds.includes(item.id) &&
      (!item.dueDate || new Date(item.dueDate).toDateString() !== today.toDateString())
    );
  }, [items, todayTaskIds, today]);

  // Yesterday's completed tasks for context
  const yesterday = useMemo(() => {
    const date = new Date(today);
    date.setDate(date.getDate() - 1);
    return date;
  }, [today]);
  
  const yesterdayCompleted = useMemo(() => {
    return items.filter(item => 
      item.status === 'completed' && 
      item.completedDate &&
      new Date(item.completedDate).toDateString() === yesterday.toDateString()
    );
  }, [items, yesterday]);

  const handleAddTaskToToday = useCallback((taskId: string) => {
    addToToday(taskId);
  }, [addToToday]);

  const handleRemoveTaskFromToday = useCallback((taskId: string) => {
    removeFromToday(taskId);
  }, [removeFromToday]);

  const handleCompleteTask = useCallback((taskId: string) => {
    completeItem(taskId);
    removeFromToday(taskId);
  }, [completeItem, removeFromToday]);

  const getEnergyIcon = (energy?: string) => {
    switch (energy) {
      case 'high': return <Brain size={14} className="text-purple-400" />;
      case 'medium': return <Battery size={14} className="text-green-400" />;
      case 'low': return <Coffee size={14} className="text-yellow-400" />;
      case 'zombie': return <Coffee size={14} className="text-gray-400" />;
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-cursor-sidebar border border-cursor-border rounded-lg shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-cursor-border">
          <div>
            <h2 className="text-2xl font-semibold text-cursor-text">Today's Focus</h2>
            <p className="text-sm text-cursor-text-muted">{todayString}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-cursor-bg rounded-lg transition-colors text-cursor-text-muted hover:text-cursor-text"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: Today's Tasks */}
            <div className="lg:col-span-2 space-y-6">
              {/* Today's Task Management */}
              <div className="bg-cursor-bg rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-cursor-text flex items-center gap-2">
                    <Target size={20} className="text-cursor-accent" />
                    Today's Tasks ({todayTasks.length})
                  </h3>
                  <div className="flex items-center gap-2">
                    {/* View Toggle */}
                    <div className="flex bg-cursor-sidebar rounded-lg p-1">
                      <button
                        onClick={() => setViewMode('list')}
                        className={`p-1.5 rounded ${viewMode === 'list' ? 'bg-cursor-accent text-white' : 'text-cursor-text-muted hover:text-cursor-text'}`}
                        title="List view"
                      >
                        <List size={16} />
                      </button>
                      <button
                        onClick={() => setViewMode('kanban')}
                        className={`p-1.5 rounded ${viewMode === 'kanban' ? 'bg-cursor-accent text-white' : 'text-cursor-text-muted hover:text-cursor-text'}`}
                        title="Kanban view"
                      >
                        <Columns size={16} />
                      </button>
                    </div>
                    <button
                      onClick={() => setShowTaskSelector(!showTaskSelector)}
                      className="flex items-center gap-2 px-3 py-1.5 bg-cursor-accent text-white rounded hover:bg-cursor-accent/90 transition-colors text-sm"
                    >
                      <Plus size={16} />
                      Add Task
                    </button>
                  </div>
                </div>

                {/* Task Selector */}
                {showTaskSelector && (
                  <div className="mb-4 p-3 bg-cursor-sidebar border border-cursor-border rounded">
                    <h4 className="text-sm font-medium text-cursor-text mb-2">Available Tasks</h4>
                    <div className="max-h-32 overflow-y-auto space-y-1">
                      {availableTasks.slice(0, 10).map((task) => (
                        <button
                          key={task.id}
                          onClick={() => {
                            handleAddTaskToToday(task.id);
                            setShowTaskSelector(false);
                          }}
                          className="w-full text-left p-2 hover:bg-cursor-bg rounded text-sm text-cursor-text flex items-center gap-2"
                        >
                          <Plus size={12} />
                          {task.content}
                          {task.contextId && (
                            <span className="text-cursor-text-muted text-xs">@{task.contextId}</span>
                          )}
                        </button>
                      ))}
                      {availableTasks.length === 0 && (
                        <p className="text-cursor-text-muted text-sm">No available tasks</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Task Views */}
                {viewMode === 'kanban' ? (
                  <div className="h-96">
                    <TaskKanban
                      tasks={todayTasks}
                      onStartTask={startTask}
                      onPauseTask={pauseTask}
                      onCompleteTask={handleCompleteTask}
                      onRemoveFromToday={handleRemoveTaskFromToday}
                    />
                  </div>
                ) : (
                  <div className="space-y-3">
                    {todayTasks.map((task) => (
                      <div
                        key={task.id}
                        className="flex items-start gap-3 p-3 bg-cursor-sidebar border border-cursor-border rounded-lg hover:border-cursor-accent transition-colors group"
                      >
                        <button
                          onClick={() => handleCompleteTask(task.id)}
                          className="mt-0.5 p-1 hover:bg-cursor-bg rounded transition-colors text-green-400"
                        >
                          <CheckCircle size={16} />
                        </button>
                        
                        <div className="flex-1">
                          <p className="text-cursor-text mb-1">{task.content}</p>
                          <div className="flex items-center gap-3 text-sm">
                            {task.contextId && (
                              <span className="text-cursor-text-muted">@{task.contextId}</span>
                            )}
                            {task.estimatedMinutes && (
                              <span className="flex items-center gap-1 text-cursor-text-muted">
                                <Clock size={12} />
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
                                <Calendar size={12} />
                                Due Today
                              </span>
                            )}
                            {task.isUrgent && (
                              <span className="flex items-center gap-1 text-red-400">
                                <AlertCircle size={12} />
                                Urgent
                              </span>
                            )}
                          </div>
                        </div>

                        <button
                          onClick={() => handleRemoveTaskFromToday(task.id)}
                          className="opacity-0 group-hover:opacity-100 p-1 hover:bg-cursor-bg rounded transition-all text-cursor-text-muted"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                    
                    {todayTasks.length === 0 && (
                      <div className="text-center py-8">
                        <p className="text-cursor-text-muted mb-2">No tasks planned for today</p>
                        <button
                          onClick={() => setShowTaskSelector(true)}
                          className="text-cursor-accent hover:underline"
                        >
                          Add some tasks to get started
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Daily Notes */}
              <div className="bg-cursor-bg rounded-lg p-4">
                <h3 className="text-lg font-medium text-cursor-text flex items-center gap-2 mb-4">
                  <BookOpen size={20} className="text-cursor-accent" />
                  Daily Notes
                </h3>
                <textarea
                  value={dailyNotes}
                  onChange={(e) => setDailyNotes(e.target.value)}
                  placeholder="What's on your mind today? Goals, thoughts, reflections..."
                  className="w-full h-32 bg-cursor-sidebar border border-cursor-border rounded px-3 py-2 text-cursor-text placeholder-cursor-text-muted resize-none focus:outline-none focus:border-cursor-accent"
                />
              </div>
            </div>

            {/* Right Column: Context & Progress */}
            <div className="space-y-6">
              {/* Yesterday's Progress */}
              <div className="bg-cursor-bg rounded-lg p-4">
                <h3 className="text-lg font-medium text-cursor-text flex items-center gap-2 mb-4">
                  <TrendingUp size={20} className="text-green-400" />
                  Yesterday's Win
                </h3>
                <div className="space-y-2">
                  <p className="text-sm text-cursor-text-muted">
                    Completed {yesterdayCompleted.length} tasks
                  </p>
                  {yesterdayCompleted.slice(0, 3).map((task) => (
                    <div key={task.id} className="flex items-center gap-2 text-sm">
                      <CheckCircle size={12} className="text-green-400" />
                      <span className="text-cursor-text truncate">{task.content}</span>
                    </div>
                  ))}
                  {yesterdayCompleted.length > 3 && (
                    <p className="text-xs text-cursor-text-muted">
                      +{yesterdayCompleted.length - 3} more
                    </p>
                  )}
                  {yesterdayCompleted.length === 0 && (
                    <p className="text-sm text-cursor-text-muted">No tasks completed</p>
                  )}
                </div>
              </div>

              {/* Today's Summary */}
              <div className="bg-cursor-bg rounded-lg p-4">
                <h3 className="text-lg font-medium text-cursor-text mb-4">Today's Summary</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-cursor-text-muted">Planned Tasks</span>
                    <span className="text-cursor-text font-medium">{todayTasks.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-cursor-text-muted">Due Today</span>
                    <span className="text-orange-400 font-medium">
                      {todayTasks.filter(t => t.dueDate).length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-cursor-text-muted">Urgent</span>
                    <span className="text-red-400 font-medium">
                      {todayTasks.filter(t => t.isUrgent).length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-cursor-text-muted">Total Time</span>
                    <span className="text-cursor-text font-medium">
                      {formatTime(todayTasks.reduce((sum, t) => sum + (t.estimatedMinutes || 0), 0))}
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-cursor-bg rounded-lg p-4">
                <h3 className="text-lg font-medium text-cursor-text mb-4">Quick Actions</h3>
                <div className="space-y-2">
                  <button className="w-full text-left p-2 hover:bg-cursor-sidebar rounded text-sm text-cursor-text flex items-center gap-2">
                    <Zap size={16} />
                    Start Focus Session
                  </button>
                  <button className="w-full text-left p-2 hover:bg-cursor-sidebar rounded text-sm text-cursor-text flex items-center gap-2">
                    <Calendar size={16} />
                    Schedule Planning
                  </button>
                  <button className="w-full text-left p-2 hover:bg-cursor-sidebar rounded text-sm text-cursor-text flex items-center gap-2">
                    <CheckCircle size={16} />
                    Weekly Review
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};