import React from 'react';
import {
  Inbox,
  CheckSquare,
  FolderOpen,
  Clock,
  Lightbulb,
  Calendar,
  Archive,
  Filter,
  Hash
} from 'lucide-react';

interface SidebarItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  count?: number;
  isActive?: boolean;
}

interface LeftSidebarProps {
  activeView: string;
  onViewChange: (view: string) => void;
  inboxCount: number;
  nextActionsCount: number;
  projectsCount: number;
  waitingForCount: number;
  somedayMaybeCount: number;
}

export const LeftSidebar: React.FC<LeftSidebarProps> = ({
  activeView,
  onViewChange,
  inboxCount,
  nextActionsCount,
  projectsCount,
  waitingForCount,
  somedayMaybeCount
}) => {
  const gtdSections: SidebarItem[] = [
    {
      id: 'inbox',
      label: 'Ideas',
      icon: <Inbox size={16} />,
      count: inboxCount,
      isActive: activeView === 'inbox'
    },
    {
      id: 'next-actions',
      label: 'Next Actions',
      icon: <CheckSquare size={16} />,
      count: nextActionsCount,
      isActive: activeView === 'next-actions'
    },
    {
      id: 'projects',
      label: 'Projects',
      icon: <FolderOpen size={16} />,
      count: projectsCount,
      isActive: activeView === 'projects'
    },
    {
      id: 'waiting-for',
      label: 'Waiting For',
      icon: <Clock size={16} />,
      count: waitingForCount,
      isActive: activeView === 'waiting-for'
    },
    {
      id: 'someday-maybe',
      label: 'Someday/Maybe',
      icon: <Lightbulb size={16} />,
      count: somedayMaybeCount,
      isActive: activeView === 'someday-maybe'
    }
  ];

  const otherSections: SidebarItem[] = [
    {
      id: 'calendar',
      label: 'Calendar',
      icon: <Calendar size={16} />,
      isActive: activeView === 'calendar'
    },
    {
      id: 'reference',
      label: 'Reference',
      icon: <Archive size={16} />,
      isActive: activeView === 'reference'
    }
  ];

  const contexts = [
    { id: 'calls', label: '@Calls', color: 'bg-blue-500' },
    { id: 'computer', label: '@Computer', color: 'bg-green-500' },
    { id: 'errands', label: '@Errands', color: 'bg-yellow-500' },
    { id: 'home', label: '@Home', color: 'bg-purple-500' },
    { id: 'office', label: '@Office', color: 'bg-red-500' }
  ];

  return (
    <div className="h-full flex flex-col bg-cursor-sidebar">
      {/* GTD Collections */}
      <div className="p-4">
        <h3 className="text-xs font-semibold text-cursor-text-muted uppercase tracking-wide mb-3">
          GTD Collections
        </h3>
        <nav className="space-y-1">
          {gtdSections.map((item) => (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-sm transition-colors ${
                item.isActive
                  ? 'bg-cursor-accent text-white'
                  : 'text-cursor-text hover:bg-cursor-bg'
              }`}
            >
              <div className="flex items-center gap-3">
                {item.icon}
                <span>{item.label}</span>
              </div>
              {item.count !== undefined && item.count > 0 && (
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  item.isActive 
                    ? 'bg-white/20 text-white' 
                    : 'bg-cursor-text-muted text-cursor-bg'
                }`}>
                  {item.count}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Contexts */}
      <div className="px-4 pb-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-semibold text-cursor-text-muted uppercase tracking-wide">
            Contexts
          </h3>
          <button className="text-cursor-text-muted hover:text-cursor-text">
            <Filter size={12} />
          </button>
        </div>
        <nav className="space-y-1">
          {contexts.map((context) => (
            <button
              key={context.id}
              onClick={() => onViewChange(`context-${context.id}`)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                activeView === `context-${context.id}`
                  ? 'bg-cursor-accent text-white'
                  : 'text-cursor-text hover:bg-cursor-bg'
              }`}
            >
              <div className={`w-2 h-2 rounded-full ${context.color}`} />
              <span>{context.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Other */}
      <div className="px-4 pb-4">
        <h3 className="text-xs font-semibold text-cursor-text-muted uppercase tracking-wide mb-3">
          Other
        </h3>
        <nav className="space-y-1">
          {otherSections.map((item) => (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                item.isActive
                  ? 'bg-cursor-accent text-white'
                  : 'text-cursor-text hover:bg-cursor-bg'
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Horizons of Focus */}
      <div className="px-4 pb-4 mt-auto">
        <h3 className="text-xs font-semibold text-cursor-text-muted uppercase tracking-wide mb-3">
          Horizons
        </h3>
        <div className="space-y-1 text-xs">
          {[
            { level: 0, label: 'Ground Level' },
            { level: 1, label: 'Projects' },
            { level: 2, label: 'Areas of Focus' },
            { level: 3, label: '1-2 Year Goals' },
            { level: 4, label: '3-5 Year Vision' },
            { level: 5, label: 'Purpose & Principles' }
          ].map((horizon) => (
            <button
              key={horizon.level}
              onClick={() => onViewChange(`horizon-${horizon.level}`)}
              className="w-full flex items-center gap-2 px-3 py-1.5 rounded text-cursor-text-muted hover:text-cursor-text hover:bg-cursor-bg transition-colors"
            >
              <Hash size={10} />
              <span>{horizon.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};