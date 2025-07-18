import React, { useMemo } from 'react';
import { Plus, Search, Filter, MoreHorizontal, CheckCircle, Clock, Calendar, User, Tag } from 'lucide-react';
import { useGTDStore } from '../../store/gtdStore';
import { ProjectsView } from '../Projects/ProjectsView';
import { VirtualList, useVirtualList } from '../VirtualList/VirtualList';
import { GTDIdea } from '../../types/gtd';

interface VirtualizedMainContentProps {
  activeView: string;
  onQuickCapture: () => void;
  onStartProcessing: () => void;
}

const ITEM_HEIGHT = 88; // Height of each item in pixels
const VIRTUAL_THRESHOLD = 50; // Use virtual scrolling when more than 50 items

export const VirtualizedMainContent: React.FC<VirtualizedMainContentProps> = ({
  activeView,
  onQuickCapture,
  onStartProcessing
}) => {
  const { 
    getItemsByView, 
    setSelectedItem, 
    completeItem, 
    contexts,
    getFilteredIdeas,
    currentFilters,
    engageDecision
  } = useGTDStore();

  // Get items for the current view
  const rawItems = getItemsByView(activeView);
  
  // Apply engage mode filtering if active
  const items = useMemo(() => {
    if (engageDecision && activeView === 'next-actions') {
      return getFilteredIdeas();
    }
    return rawItems;
  }, [rawItems, engageDecision, activeView, getFilteredIdeas]);

  const { containerRef, containerHeight, metrics } = useVirtualList(items, ITEM_HEIGHT);

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

  const handleItemClick = (item: GTDIdea) => {
    if (activeView === 'inbox') {
      setSelectedItem(item);
      onStartProcessing();
    }
  };

  const handleCompleteItem = (e: React.MouseEvent, itemId: string) => {
    e.stopPropagation();
    completeItem(itemId);
  };

  const getContextName = (contextId?: string) => {
    if (!contextId) return null;
    const context = contexts.find(c => c.id === contextId);
    return context?.name;
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return null;
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    }
    return `${minutes}m`;
  };

  const getEnergyColor = (energy?: string) => {
    switch (energy) {
      case 'high': return 'text-red-400';
      case 'medium': return 'text-yellow-400';
      case 'low': return 'text-green-400';
      case 'zombie': return 'text-gray-400';
      default: return 'text-cursor-text-muted';
    }
  };

  const renderItem = (item: GTDIdea, index: number, isVisible: boolean) => {
    const contextName = getContextName(item.contextId);
    const duration = formatDuration(item.elapsedTime);
    
    return (
      <div
        onClick={() => handleItemClick(item)}
        className={`bg-cursor-sidebar rounded-lg p-4 hover:bg-cursor-border transition-colors group border border-transparent hover:border-cursor-accent/20 ${
          activeView === 'inbox' ? 'cursor-pointer' : ''
        }`}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-medium text-cursor-text truncate group-hover:text-cursor-accent transition-colors">
                {item.content}
              </h3>
              {item.inProgress && (
                <div className="flex items-center gap-1 text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full">
                  <Clock size={12} />
                  In Progress
                </div>
              )}
              {item.isNextAction && (
                <div className="w-2 h-2 bg-cursor-accent rounded-full flex-shrink-0" title="Next Action" />
              )}
            </div>

            <div className="flex items-center gap-4 text-sm text-cursor-text-muted">
              {contextName && (
                <div className="flex items-center gap-1">
                  <Tag size={12} />
                  <span>{contextName}</span>
                </div>
              )}
              
              {item.estimatedMinutes && (
                <div className="flex items-center gap-1">
                  <Clock size={12} />
                  <span>{item.estimatedMinutes}m</span>
                </div>
              )}
              
              {item.energyRequired && (
                <div className={`flex items-center gap-1 ${getEnergyColor(item.energyRequired)}`}>
                  <div className="w-2 h-2 rounded-full bg-current" />
                  <span className="capitalize">{item.energyRequired}</span>
                </div>
              )}

              {duration && (
                <div className="flex items-center gap-1 text-blue-400">
                  <Clock size={12} />
                  <span>{duration} tracked</span>
                </div>
              )}

              {item.dueDate && (
                <div className="flex items-center gap-1">
                  <Calendar size={12} />
                  <span>{new Date(item.dueDate).toLocaleDateString()}</span>
                </div>
              )}
            </div>

            {item.notes && (
              <p className="mt-2 text-sm text-cursor-text-muted line-clamp-2">
                {item.notes}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2 ml-4">
            {item.status === 'active' && (
              <button
                onClick={(e) => handleCompleteItem(e, item.id)}
                className="p-1.5 rounded-full hover:bg-green-500/20 text-cursor-text-muted hover:text-green-400 transition-colors opacity-0 group-hover:opacity-100"
                title="Complete"
              >
                <CheckCircle size={16} />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Special handling for projects view
  if (activeView === 'projects') {
    return <ProjectsView />;
  }

  return (
    <div className="h-full flex flex-col bg-cursor-bg">
      {/* View Header */}
      <div className="border-b border-cursor-border p-6 flex-shrink-0">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold text-cursor-text">
              {getViewTitle(activeView)}
            </h1>
            {engageDecision && activeView === 'next-actions' && (
              <div className="text-sm bg-cursor-accent/20 text-cursor-accent px-3 py-1 rounded-full">
                Engage Mode Active
              </div>
            )}
            {items.length > VIRTUAL_THRESHOLD && (
              <div className="text-xs bg-cursor-sidebar text-cursor-text-muted px-2 py-1 rounded">
                Virtual Scrolling ({items.length} items)
              </div>
            )}
          </div>
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
        
        {/* Active Filters Display */}
        {(currentFilters.contexts.length > 0 || currentFilters.maxMinutes || currentFilters.currentEnergy) && (
          <div className="flex items-center gap-2 mt-3 text-xs">
            <span className="text-cursor-text-muted">Active filters:</span>
            {currentFilters.contexts.map(contextId => {
              const context = contexts.find(c => c.id === contextId);
              return context ? (
                <span key={contextId} className="bg-cursor-accent/20 text-cursor-accent px-2 py-1 rounded">
                  {context.name}
                </span>
              ) : null;
            })}
            {currentFilters.maxMinutes && (
              <span className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded">
                ≤ {currentFilters.maxMinutes}m
              </span>
            )}
            {currentFilters.currentEnergy && (
              <span className={`px-2 py-1 rounded ${getEnergyColor(currentFilters.currentEnergy)} bg-current/20`}>
                {currentFilters.currentEnergy} energy
              </span>
            )}
          </div>
        )}
      </div>

      {/* Content Area */}
      <div ref={containerRef} className="flex-1 overflow-hidden">
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
                  : engageDecision
                    ? 'No actions match your current context and energy. Try adjusting your filters or context.'
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
        ) : items.length > VIRTUAL_THRESHOLD ? (
          <div className="p-6 h-full">
            <VirtualList
              items={items}
              itemHeight={ITEM_HEIGHT}
              containerHeight={containerHeight - 48} // Account for padding
              renderItem={renderItem}
              getItemKey={(item) => item.id}
              className="space-y-3"
              overscan={10}
            />
          </div>
        ) : (
          <div className="p-6">
            <div className="space-y-3">
              {items.map((item) => (
                <div key={item.id}>
                  {renderItem(item, 0, true)}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};