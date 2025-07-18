import { useEffect, useCallback } from 'react';
import { useGTDStore } from '../store/gtdStore';

interface KeyboardShortcutsConfig {
  onQuickCapture: () => void;
  onOpenToday: () => void;
  onOpenEngage: () => void;
  onStartReview: () => void;
  onShowShortcuts: () => void;
  onOpenSettings: () => void;
}

export const useKeyboardShortcuts = (config: KeyboardShortcutsConfig) => {
  const {
    setActiveView,
    setFilters,
    clearFilters,
    setEngageDecision,
    engageDecision,
    selectedItem,
    setSelectedItem,
    completeItem,
    deleteItem,
    setProcessing
  } = useGTDStore();

  const handleKeyboardShortcut = useCallback((event: KeyboardEvent) => {
    // Don't trigger shortcuts when typing in inputs
    const target = event.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.contentEditable === 'true') {
      return;
    }

    const { key, metaKey, ctrlKey, shiftKey, altKey } = event;
    const cmdKey = metaKey || ctrlKey; // Support both Mac and Windows

    // Global shortcuts
    if (cmdKey && shiftKey) {
      switch (key.toLowerCase()) {
        case 'a':
          event.preventDefault();
          config.onQuickCapture();
          return;
        case 't':
          event.preventDefault();
          config.onOpenToday();
          return;
        case 'e':
          event.preventDefault();
          config.onOpenEngage();
          return;
        case 'r':
          event.preventDefault();
          config.onStartReview();
          return;
      }
    }

    // Command palette
    if (cmdKey && key.toLowerCase() === 'k') {
      event.preventDefault();
      // TODO: Implement command palette
      return;
    }

    // Show shortcuts
    if (key === '?' && !cmdKey && !shiftKey && !altKey) {
      event.preventDefault();
      config.onShowShortcuts();
      return;
    }

    // View navigation (number keys)
    if (!cmdKey && !shiftKey && !altKey) {
      switch (key) {
        case '1':
          event.preventDefault();
          setActiveView('inbox');
          return;
        case '2':
          event.preventDefault();
          setActiveView('next-actions');
          return;
        case '3':
          event.preventDefault();
          setActiveView('projects');
          return;
        case '4':
          event.preventDefault();
          setActiveView('waiting-for');
          return;
        case '5':
          event.preventDefault();
          setActiveView('someday-maybe');
          return;
        case '6':
          event.preventDefault();
          setActiveView('reference');
          return;
      }
    }

    // Context filters (Shift + number)
    if (shiftKey && !cmdKey && !altKey) {
      const contextMap: Record<string, string> = {
        '1': 'calls',
        '2': 'computer',
        '3': 'errands',
        '4': 'home',
        '5': 'office',
        '6': 'agenda'
      };
      
      const contextId = contextMap[key];
      if (contextId) {
        event.preventDefault();
        setFilters({ contexts: [contextId] });
        return;
      }
    }

    // Energy filters (Cmd + number)
    if (cmdKey && !shiftKey && !altKey) {
      const energyMap: Record<string, 'high' | 'medium' | 'low' | 'zombie'> = {
        '1': 'high',
        '2': 'medium',
        '3': 'low',
        '4': 'zombie'
      };
      
      const energy = energyMap[key];
      if (energy) {
        event.preventDefault();
        setFilters({ currentEnergy: energy });
        return;
      }
    }

    // Time filters (Alt + number)
    if (altKey && !cmdKey && !shiftKey) {
      const timeMap: Record<string, number | undefined> = {
        '1': 15,
        '2': 30,
        '3': 60,
        '0': undefined // Clear filter
      };
      
      if (timeMap.hasOwnProperty(key)) {
        event.preventDefault();
        setFilters({ maxMinutes: timeMap[key] });
        return;
      }
    }

    // Quick actions (single keys, no modifiers)
    if (!cmdKey && !shiftKey && !altKey) {
      switch (key.toLowerCase()) {
        case ' ': // Space bar
          event.preventDefault();
          // Toggle engage mode
          if (engageDecision) {
            clearFilters();
          } else {
            config.onOpenEngage();
          }
          return;

        case 'enter':
          if (selectedItem) {
            event.preventDefault();
            setProcessing(true);
          }
          return;

        case 'c':
          if (selectedItem) {
            event.preventDefault();
            completeItem(selectedItem.id);
          }
          return;

        case 'd':
          if (selectedItem) {
            event.preventDefault();
            if (window.confirm('Delete this item?')) {
              deleteItem(selectedItem.id);
              setSelectedItem(null);
            }
          }
          return;

        case 'escape':
          event.preventDefault();
          setSelectedItem(null);
          clearFilters();
          return;
      }
    }

    // Clear all filters (Cmd + 0)
    if (cmdKey && key === '0' && !shiftKey && !altKey) {
      event.preventDefault();
      clearFilters();
      return;
    }

  }, [
    config,
    setActiveView,
    setFilters,
    clearFilters,
    setEngageDecision,
    engageDecision,
    selectedItem,
    setSelectedItem,
    completeItem,
    deleteItem,
    setProcessing
  ]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyboardShortcut);
    return () => document.removeEventListener('keydown', handleKeyboardShortcut);
  }, [handleKeyboardShortcut]);

  // Return helper functions for manual shortcut triggering
  return {
    triggerViewChange: (view: string) => setActiveView(view),
    triggerFilter: (filters: any) => setFilters(filters),
    clearAllFilters: () => clearFilters()
  };
};