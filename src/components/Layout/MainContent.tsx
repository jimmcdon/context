import React from 'react';
import { Plus, Search, Filter, MoreHorizontal, ArrowRight } from 'lucide-react';
import { useGTDStore } from '../../store/gtdStore';
import { ProjectsView } from '../Projects/ProjectsView';

interface MainContentProps {
  activeView: string;
  onQuickCapture: () => void;
  onStartProcessing: () => void;
}

export const MainContent: React.FC<MainContentProps> = ({
  activeView,
  onQuickCapture,
  onStartProcessing
}) => {
  const { getItemsByView, setSelectedItem, completeItem } = useGTDStore();
  const items = getItemsByView(activeView);
  const getViewTitle = (view: string) => {
    const titles: { [key: string]: string } = {
      'inbox': 'Ideas',
      'next-actions': 'Next Actions',
      'projects': 'Projects',
      'waiting-for': 'Waiting For',
      'someday-maybe': 'Someday/Maybe',
      'calendar': 'Calendar',
      'reference': 'Reference'
    };
    
    if (view.startsWith('context-')) {
      const context = view.replace('context-', '');
      return `@${context.charAt(0).toUpperCase() + context.slice(1)}`;
    }
    
    if (view.startsWith('horizon-')) {
      const level = view.replace('horizon-', '');
      const horizons: { [key: string]: string } = {
        '0': 'Ground Level - Current Actions',
        '1': 'Horizon 1 - Projects',
        '2': 'Horizon 2 - Areas of Focus',
        '3': 'Horizon 3 - 1-2 Year Goals',
        '4': 'Horizon 4 - 3-5 Year Vision',
        '5': 'Horizon 5 - Purpose & Principles'
      };
      return horizons[level] || 'Unknown Horizon';
    }
    
    return titles[view] || 'Unknown View';
  };

  const getViewDescription = (view: string) => {
    const descriptions: { [key: string]: string } = {
      'inbox': 'Capture and process all your ideas and open loops. Apply the two-minute rule and clarify each idea.',
      'next-actions': 'Single-step actions organized by context. Choose based on time, energy, and priority.',
      'projects': 'Multi-step commitments with defined outcomes. Each project needs a next action.',
      'waiting-for': 'Items delegated to others or dependent on external factors. Review regularly.',
      'someday-maybe': 'Ideas and possibilities to review during weekly planning sessions.',
      'calendar': 'Time-specific and day-specific commitments that must be done at particular times.',
      'reference': 'Support materials, documents, and information that you might need to reference.'
    };
    
    return descriptions[view] || 'Manage your tasks and projects effectively.';
  };

  const handleItemClick = (item: any) => {
    if (activeView === 'inbox') {
      setSelectedItem(item);
      onStartProcessing();
    }
  };

  const handleCompleteItem = (e: React.MouseEvent, itemId: string) => {
    e.stopPropagation();
    completeItem(itemId);
  };

  // Special handling for projects view
  if (activeView === 'projects') {
    return <ProjectsView />;
  }

  return (
    <div className="h-full flex flex-col bg-cursor-bg">
      {/* View Header */}
      <div className="border-b border-cursor-border p-6">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-semibold text-cursor-text">
            {getViewTitle(activeView)}
          </h1>
          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-cursor-sidebar rounded-md transition-colors text-cursor-text-muted hover:text-cursor-text">
              <Search size={18} />
            </button>
            <button className="p-2 hover:bg-cursor-sidebar rounded-md transition-colors text-cursor-text-muted hover:text-cursor-text">
              <Filter size={18} />
            </button>
            <button className="p-2 hover:bg-cursor-sidebar rounded-md transition-colors text-cursor-text-muted hover:text-cursor-text">
              <MoreHorizontal size={18} />
            </button>
            <button
              onClick={onQuickCapture}
              className="flex items-center gap-2 bg-cursor-accent text-white px-4 py-2 rounded-md hover:bg-cursor-accent/90 transition-colors"
            >
              <Plus size={16} />
              <span>Capture Idea</span>
            </button>
          </div>
        </div>
        <p className="text-cursor-text-muted text-sm">
          {getViewDescription(activeView)}
        </p>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-auto">
        {items.length === 0 ? (
          <div className="p-6">
            <div className="bg-cursor-sidebar rounded-lg p-8 text-center">
              <div className="w-16 h-16 bg-cursor-accent/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Plus size={32} className="text-cursor-accent" />
              </div>
              <h3 className="text-lg font-medium text-cursor-text mb-2">
                {activeView === 'inbox' ? 'No ideas captured yet!' : `No ${getViewTitle(activeView).toLowerCase()} found`}
              </h3>
              <p className="text-cursor-text-muted mb-6">
                {activeView === 'inbox' 
                  ? 'Capture all your ideas and thoughts. Get them out of your head and into your trusted system.'
                  : 'Great job! This list is clear. Focus on your current priorities.'
                }
              </p>
              {activeView === 'inbox' && (
                <button
                  onClick={onQuickCapture}
                  className="bg-cursor-accent text-white px-6 py-3 rounded-md hover:bg-cursor-accent/90 transition-colors"
                >
                  Capture Ideas
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="p-6">
            <div className="space-y-3">
              {items.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleItemClick(item)}
                  className={`bg-cursor-sidebar rounded-lg p-4 hover:bg-cursor-border transition-colors group ${
                    activeView === 'inbox' ? 'cursor-pointer' : ''
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-cursor-text mb-1">{item.content}</p>
                      <div className="flex items-center gap-3 text-sm">
                        {item.contextId && (
                          <span className="text-cursor-text-muted">@{item.contextId}</span>
                        )}
                        {item.isUrgent && (
                          <span className="px-2 py-0.5 rounded-full text-xs bg-red-500/20 text-red-400">
                            Urgent
                          </span>
                        )}
                        {item.energyRequired && (
                          <span className={`px-2 py-0.5 rounded-full text-xs ${
                            item.energyRequired === 'high' 
                              ? 'bg-purple-500/20 text-purple-400'
                              : item.energyRequired === 'medium'
                              ? 'bg-green-500/20 text-green-400'
                              : item.energyRequired === 'low'
                              ? 'bg-yellow-500/20 text-yellow-400'
                              : 'bg-gray-500/20 text-gray-400'
                          }`}>
                            {item.energyRequired === 'zombie' ? 'Zombie' : item.energyRequired}
                          </span>
                        )}
                        <span className="text-xs text-cursor-text-muted">
                          {new Date(item.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {activeView === 'inbox' && (
                        <button
                          onClick={() => handleItemClick(item)}
                          className="p-1 hover:bg-cursor-bg rounded transition-colors text-cursor-accent"
                          title="Process item"
                        >
                          <ArrowRight size={16} />
                        </button>
                      )}
                      {item.isNextAction && (
                        <button
                          onClick={(e) => handleCompleteItem(e, item.id)}
                          className="p-1 hover:bg-cursor-bg rounded transition-colors text-green-400"
                          title="Mark complete"
                        >
                          ✓
                        </button>
                      )}
                      <button className="p-1 hover:bg-cursor-bg rounded transition-colors">
                        <MoreHorizontal size={16} className="text-cursor-text-muted" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};