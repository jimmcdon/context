import React from 'react';
import { 
  Menu, 
  Search, 
  Plus, 
  Settings, 
  User,
  PanelLeft,
  PanelRight,
  RotateCcw,
  Play,
  Calendar
} from 'lucide-react';

interface HeaderProps {
  leftSidebarVisible: boolean;
  rightSidebarVisible: boolean;
  onToggleLeftSidebar: () => void;
  onToggleRightSidebar: () => void;
  onQuickCapture: () => void;
  onStartReview: () => void;
  onOpenSettings: () => void;
  onOpenEngage: () => void;
  onOpenToday: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  leftSidebarVisible,
  rightSidebarVisible,
  onToggleLeftSidebar,
  onToggleRightSidebar,
  onQuickCapture,
  onStartReview,
  onOpenSettings,
  onOpenEngage,
  onOpenToday
}) => {
  return (
    <header className="h-12 bg-cursor-sidebar border-b border-cursor-border flex items-center justify-between px-4 flex-shrink-0">
      {/* Left section */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleLeftSidebar}
          className={`p-1.5 rounded hover:bg-cursor-bg transition-colors ${
            leftSidebarVisible ? 'text-cursor-accent' : 'text-cursor-text-muted'
          }`}
          title="Toggle left sidebar"
        >
          <PanelLeft size={16} />
        </button>
        
        <div className="flex items-center gap-2">
          <Menu size={16} className="text-cursor-accent" />
          <span className="text-cursor-text font-medium text-sm">GTD Mind Like Water</span>
        </div>
      </div>

      {/* Center section - Quick search */}
      <div className="flex-1 max-w-md mx-8">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-cursor-text-muted" />
          <input
            type="text"
            placeholder="Search everything..."
            className="w-full bg-cursor-bg border border-cursor-border rounded-md pl-9 pr-4 py-1.5 text-sm text-cursor-text placeholder-cursor-text-muted focus:outline-none focus:border-cursor-accent"
          />
        </div>
      </div>

      {/* Right section */}
      <div className="flex items-center gap-2">
        <button
          onClick={onOpenToday}
          className="flex items-center gap-2 bg-blue-600 text-white px-3 py-1.5 rounded hover:bg-blue-700 transition-colors"
          title="Today's Focus Dashboard"
        >
          <Calendar size={14} />
          <span className="text-sm font-medium">Today</span>
        </button>
        
        <button
          onClick={onOpenEngage}
          className="flex items-center gap-2 bg-cursor-accent text-white px-3 py-1.5 rounded hover:bg-cursor-accent/90 transition-colors"
          title="What should I do now?"
        >
          <Play size={14} />
          <span className="text-sm font-medium">Engage</span>
        </button>
        
        <div className="w-px h-6 bg-cursor-border mx-1" />
        
        <button
          onClick={onQuickCapture}
          className="p-1.5 rounded hover:bg-cursor-bg transition-colors text-cursor-text-muted hover:text-cursor-accent"
          title="Quick capture (Ctrl+Shift+A)"
        >
          <Plus size={16} />
        </button>
        
        <button
          onClick={onStartReview}
          className="p-1.5 rounded hover:bg-cursor-bg transition-colors text-cursor-text-muted hover:text-cursor-accent"
          title="Start weekly review"
        >
          <RotateCcw size={16} />
        </button>
        
        <div className="w-px h-6 bg-cursor-border mx-1" />
        
        <button 
          onClick={onOpenSettings}
          className="p-1.5 rounded hover:bg-cursor-bg transition-colors text-cursor-text-muted hover:text-cursor-accent"
          title="Data management"
        >
          <Settings size={16} />
        </button>
        
        <button className="p-1.5 rounded hover:bg-cursor-bg transition-colors text-cursor-text-muted hover:text-cursor-accent">
          <User size={16} />
        </button>
        
        <button
          onClick={onToggleRightSidebar}
          className={`p-1.5 rounded hover:bg-cursor-bg transition-colors ${
            rightSidebarVisible ? 'text-cursor-accent' : 'text-cursor-text-muted'
          }`}
          title="Toggle right sidebar"
        >
          <PanelRight size={16} />
        </button>
      </div>
    </header>
  );
};