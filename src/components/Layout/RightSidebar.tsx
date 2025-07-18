import React from 'react';
import {
  Calendar,
  Clock,
  Target,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Plus
} from 'lucide-react';

interface RightSidebarProps {
  selectedItem?: any;
  todayActions: any[];
  upcomingDeadlines: any[];
  recentlyCompleted: any[];
  weeklyReviewDue: boolean;
  onQuickAction: (action: string) => void;
}

export const RightSidebar: React.FC<RightSidebarProps> = ({
  selectedItem,
  todayActions = [],
  upcomingDeadlines = [],
  recentlyCompleted = [],
  weeklyReviewDue,
  onQuickAction
}) => {
  return (
    <div className="h-full flex flex-col bg-cursor-sidebar">
      {/* Quick Actions */}
      <div className="p-4 border-b border-cursor-border">
        <h3 className="text-xs font-semibold text-cursor-text-muted uppercase tracking-wide mb-3">
          Quick Actions
        </h3>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => onQuickAction('capture')}
            className="flex items-center gap-2 p-2 bg-cursor-bg rounded hover:bg-cursor-border transition-colors text-sm"
          >
            <Plus size={14} />
            <span className="text-cursor-text">Capture</span>
          </button>
          <button
            onClick={() => onQuickAction('process')}
            className="flex items-center gap-2 p-2 bg-cursor-bg rounded hover:bg-cursor-border transition-colors text-sm"
          >
            <Target size={14} />
            <span className="text-cursor-text">Process</span>
          </button>
        </div>
      </div>

      {/* Today's Focus */}
      <div className="p-4 border-b border-cursor-border">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-semibold text-cursor-text-muted uppercase tracking-wide">
            Today's Focus
          </h3>
          <Calendar size={12} className="text-cursor-text-muted" />
        </div>
        {todayActions.length > 0 ? (
          <div className="space-y-2">
            {todayActions.slice(0, 3).map((action, index) => (
              <div key={index} className="flex items-start gap-2 p-2 bg-cursor-bg rounded">
                <div className="w-1.5 h-1.5 rounded-full bg-cursor-accent mt-1.5 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-cursor-text truncate">{action.content || 'Sample task'}</p>
                  <p className="text-xs text-cursor-text-muted">@{action.context || 'computer'}</p>
                </div>
              </div>
            ))}
            {todayActions.length > 3 && (
              <button className="text-xs text-cursor-accent hover:underline">
                +{todayActions.length - 3} more
              </button>
            )}
          </div>
        ) : (
          <p className="text-sm text-cursor-text-muted italic">No actions scheduled for today</p>
        )}
      </div>

      {/* Weekly Review Status */}
      {weeklyReviewDue && (
        <div className="p-4 border-b border-cursor-border">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle size={14} className="text-yellow-500" />
            <h3 className="text-xs font-semibold text-cursor-text uppercase tracking-wide">
              Weekly Review Due
            </h3>
          </div>
          <p className="text-sm text-cursor-text-muted mb-3">
            Your weekly review is overdue. Take 30 minutes to get current.
          </p>
          <button
            onClick={() => onQuickAction('weekly-review')}
            className="w-full bg-cursor-accent text-white py-2 px-3 rounded text-sm hover:bg-cursor-accent/90 transition-colors"
          >
            Start Weekly Review
          </button>
        </div>
      )}

      {/* Upcoming Deadlines */}
      <div className="p-4 border-b border-cursor-border">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-semibold text-cursor-text-muted uppercase tracking-wide">
            Upcoming Deadlines
          </h3>
          <Clock size={12} className="text-cursor-text-muted" />
        </div>
        {upcomingDeadlines.length > 0 ? (
          <div className="space-y-2">
            {upcomingDeadlines.slice(0, 3).map((item, index) => (
              <div key={index} className="flex items-start gap-2 p-2 bg-cursor-bg rounded">
                <AlertCircle size={14} className="text-orange-500 mt-0.5 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-cursor-text truncate">{item.content || 'Sample deadline'}</p>
                  <p className="text-xs text-cursor-text-muted">Due in 2 days</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-cursor-text-muted italic">No upcoming deadlines</p>
        )}
      </div>

      {/* Recently Completed */}
      <div className="p-4 flex-1">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-semibold text-cursor-text-muted uppercase tracking-wide">
            Recently Completed
          </h3>
          <TrendingUp size={12} className="text-cursor-text-muted" />
        </div>
        {recentlyCompleted.length > 0 ? (
          <div className="space-y-2">
            {recentlyCompleted.slice(0, 4).map((item, index) => (
              <div key={index} className="flex items-start gap-2 p-2 bg-cursor-bg rounded">
                <CheckCircle size={14} className="text-green-500 mt-0.5 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-cursor-text truncate line-through opacity-75">
                    {item.content || 'Sample completed task'}
                  </p>
                  <p className="text-xs text-cursor-text-muted">2 hours ago</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-cursor-text-muted italic">No recent completions</p>
        )}
      </div>

      {/* System Stats */}
      <div className="p-4 border-t border-cursor-border">
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <div className="text-lg font-semibold text-cursor-accent">12</div>
            <div className="text-xs text-cursor-text-muted">Actions Today</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-cursor-accent">95%</div>
            <div className="text-xs text-cursor-text-muted">Weekly Goal</div>
          </div>
        </div>
      </div>
    </div>
  );
};