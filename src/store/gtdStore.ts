import { create } from 'zustand';
import { GTDItem, Project, Context, ProcessingDecision, Dashboard, GTDFilters, EngageDecision } from '../types/gtd';
import { storage } from '../utils/storage';

interface GTDStore {
  // State
  items: GTDItem[];
  projects: Project[];
  contexts: Context[];
  dashboard: Dashboard;
  
  // UI State
  activeView: string;
  selectedItem: GTDItem | null;
  isProcessing: boolean;
  
  // Filtering State
  currentFilters: GTDFilters;
  engageDecision: EngageDecision | null;
  todayTaskIds: string[];
  dailyNotes: string;
  
  // Actions
  addItem: (content: string, metadata?: any) => void;
  processItem: (decision: ProcessingDecision) => void;
  updateItem: (id: string, updates: Partial<GTDItem>) => void;
  deleteItem: (id: string) => void;
  completeItem: (id: string) => void;
  
  // View Actions
  setActiveView: (view: string) => void;
  setSelectedItem: (item: GTDItem | null) => void;
  setProcessing: (isProcessing: boolean) => void;
  
  // Filter Actions
  setFilters: (filters: Partial<GTDFilters>) => void;
  setEngageDecision: (decision: EngageDecision | null) => void;
  clearFilters: () => void;
  
  // Today Actions
  addToToday: (taskId: string) => void;
  removeFromToday: (taskId: string) => void;
  setDailyNotes: (notes: string) => void;
  startTask: (taskId: string) => void;
  pauseTask: (taskId: string) => void;
  
  // Dashboard Actions
  updateDashboard: () => void;
  
  // Storage Actions
  loadFromStorage: () => void;
  exportData: () => string;
  importData: (jsonString: string) => boolean;
  clearAllData: () => void;
  
  // Getters
  getItemsByView: (view: string) => GTDItem[];
  getInboxItems: () => GTDItem[];
  getNextActions: () => GTDItem[];
  getProjectItems: (projectId: string) => GTDItem[];
  getContextItems: (contextId: string) => GTDItem[];
  getFilteredItems: () => GTDItem[];
  getEngagedItems: () => GTDItem[];
  calculatePriority: (item: GTDItem) => number;
}

// Default contexts
const defaultContexts: Context[] = [
  {
    id: 'calls',
    name: '@Calls',
    description: 'Phone calls to make',
    icon: '📞',
    color: 'bg-blue-500',
    type: 'tool',
    isActive: true,
    sortOrder: 1
  },
  {
    id: 'computer',
    name: '@Computer',
    description: 'Tasks requiring a computer',
    icon: '💻',
    color: 'bg-green-500',
    type: 'tool',
    isActive: true,
    sortOrder: 2
  },
  {
    id: 'errands',
    name: '@Errands',
    description: 'Tasks to do while out',
    icon: '🚗',
    color: 'bg-yellow-500',
    type: 'location',
    isActive: true,
    sortOrder: 3
  },
  {
    id: 'home',
    name: '@Home',
    description: 'Tasks to do at home',
    icon: '🏠',
    color: 'bg-purple-500',
    type: 'location',
    isActive: true,
    sortOrder: 4
  },
  {
    id: 'office',
    name: '@Office',
    description: 'Tasks to do at the office',
    icon: '🏢',
    color: 'bg-red-500',
    type: 'location',
    isActive: true,
    sortOrder: 5
  },
  {
    id: 'agenda',
    name: '@Agenda',
    description: 'Items to discuss with others',
    icon: '👥',
    color: 'bg-indigo-500',
    type: 'person',
    isActive: true,
    sortOrder: 6
  }
];

const generateId = () => Math.random().toString(36).substr(2, 9);

// Load initial state from localStorage
const loadInitialState = () => {
  const stored = storage.loadAll();
  return {
    items: stored.items || [],
    projects: stored.projects || [],
    contexts: stored.contexts && stored.contexts.length > 0 ? stored.contexts : defaultContexts,
    dashboard: stored.dashboard || {
      inboxCount: 0,
      nextActionsCount: 0,
      projectsCount: 0,
      waitingForCount: 0,
      somedayMaybeCount: 0,
      overdueTasks: 0,
      todayActions: [],
      upcomingDeadlines: [],
      recentlyCompleted: [],
      weeklyReviewDue: true
    }
  };
};

export const useGTDStore = create<GTDStore>((set, get) => {
    const initialState = loadInitialState();
    
    return {
      // Initial State (loaded from localStorage)
      ...initialState,
  
      // UI State
      activeView: 'inbox',
      selectedItem: null,
      isProcessing: false,
      
      // Filtering State
      currentFilters: {
        contexts: [],
        includeOverdue: true,
        includeToday: true,
        hideCompleted: true
      },
      engageDecision: null,
      todayTaskIds: [],
      dailyNotes: '',
  
      // Actions
      addItem: (content: string, metadata?: any) => {
        const newItem: GTDItem = {
          id: generateId(),
          content: content.trim(),
          type: 'inbox',
          status: 'active',
          createdAt: new Date(),
          updatedAt: new Date(),
          isActionable: false,
          isNextAction: false,
          energyRequired: 'medium', // Default energy level
          estimatedMinutes: undefined // Will be set during clarification
        };
    
        set((state) => {
          const newItems = [...state.items, newItem];
          storage.saveItems(newItems);
          return { items: newItems };
        });
        
        get().updateDashboard();
      },
  
  processItem: (decision: ProcessingDecision) => {
    const { itemId, isActionable, actionType, resultType, contextId, projectId, estimatedMinutes, energyRequired } = decision;
    
        set((state) => {
          const updatedItems = state.items.map(item => {
            if (item.id !== itemId) return item;
            
            const updates: Partial<GTDItem> = {
              isActionable,
              updatedAt: new Date(),
              ...(estimatedMinutes !== undefined && { estimatedMinutes }),
              ...(energyRequired && { energyRequired })
            };
            
            // Determine the new type based on decision
            if (!isActionable) {
              if (resultType === 'reference') {
                updates.type = 'reference';
              } else if (resultType === 'someday-maybe') {
                updates.type = 'someday-maybe';
              } else if (resultType === 'trash') {
                updates.status = 'cancelled';
              }
            } else {
              // Actionable item
              if (actionType === 'do-now') {
                // Mark as completed immediately for 2-minute rule
                updates.status = 'completed';
                updates.completedDate = new Date();
              } else if (actionType === 'delegate') {
                updates.type = 'waiting-for';
                updates.status = 'delegated';
              } else if (actionType === 'schedule') {
                updates.type = 'action';
                updates.isNextAction = true;
                // Would set due date in real implementation
              } else if (actionType === 'defer') {
                updates.type = 'action';
                updates.isNextAction = true;
              }
              
              if (contextId) {
                updates.contextId = contextId;
              }
              
              if (projectId) {
                updates.projectId = projectId;
              }
              
              if (resultType === 'project') {
                updates.type = 'project';
              }
            }
            
            return { ...item, ...updates };
          });
          
          storage.saveItems(updatedItems);
          return { items: updatedItems };
        });
    
    get().updateDashboard();
    get().setProcessing(false);
    get().setSelectedItem(null);
      },
      
      updateItem: (id: string, updates: Partial<GTDItem>) => {
        set((state) => {
          const updatedItems = state.items.map(item =>
            item.id === id 
              ? { ...item, ...updates, updatedAt: new Date() }
              : item
          );
          storage.saveItems(updatedItems);
          return { items: updatedItems };
        });
        get().updateDashboard();
      },
      
      deleteItem: (id: string) => {
        set((state) => {
          const filteredItems = state.items.filter(item => item.id !== id);
          storage.saveItems(filteredItems);
          return { items: filteredItems };
        });
        get().updateDashboard();
      },
      
      completeItem: (id: string) => {
        set((state) => {
          const updatedItems = state.items.map(item =>
            item.id === id
              ? { 
                  ...item, 
                  status: 'completed' as const, 
                  completedDate: new Date(),
                  updatedAt: new Date()
                }
              : item
          );
          storage.saveItems(updatedItems);
          return { items: updatedItems };
        });
        get().updateDashboard();
      },
      
      // View Actions
      setActiveView: (view: string) => {
        set({ activeView: view });
      },
      
      setSelectedItem: (item: GTDItem | null) => {
        set({ selectedItem: item });
      },
      
      setProcessing: (isProcessing: boolean) => {
        set({ isProcessing });
      },
      
      // Filter Actions
      setFilters: (filters: Partial<GTDFilters>) => {
        set((state) => ({
          currentFilters: { ...state.currentFilters, ...filters }
        }));
      },
      
      setEngageDecision: (decision: EngageDecision | null) => {
        set({ engageDecision: decision });
        if (decision) {
          // Update filters based on engage decision
          set((state) => ({
            currentFilters: {
              ...state.currentFilters,
              contexts: decision.whereAmI,
              maxMinutes: decision.timeAvailable,
              currentEnergy: decision.energyLevel
            }
          }));
        }
      },
      
      clearFilters: () => {
        set({
          currentFilters: {
            contexts: [],
            includeOverdue: true,
            includeToday: true,
            hideCompleted: true
          },
          engageDecision: null
        });
      },
      
      // Today Actions
      addToToday: (taskId: string) => {
        set((state) => ({
          todayTaskIds: [...state.todayTaskIds, taskId]
        }));
      },
      
      removeFromToday: (taskId: string) => {
        set((state) => ({
          todayTaskIds: state.todayTaskIds.filter(id => id !== taskId)
        }));
      },
      
      setDailyNotes: (notes: string) => {
        set({ dailyNotes: notes });
      },
      
      startTask: (taskId: string) => {
        set((state) => {
          const updatedItems = state.items.map(item =>
            item.id === taskId
              ? { 
                  ...item, 
                  inProgress: true, 
                  startedAt: new Date(),
                  updatedAt: new Date()
                }
              : { ...item, inProgress: false } // Pause other tasks
          );
          storage.saveItems(updatedItems);
          return { items: updatedItems };
        });
        get().updateDashboard();
      },
      
      pauseTask: (taskId: string) => {
        set((state) => {
          const updatedItems = state.items.map(item =>
            item.id === taskId
              ? { 
                  ...item, 
                  inProgress: false,
                  updatedAt: new Date()
                }
              : item
          );
          storage.saveItems(updatedItems);
          return { items: updatedItems };
        });
        get().updateDashboard();
      },
      
      // Storage Actions
      loadFromStorage: () => {
        const stored = storage.loadAll();
        set({
          items: stored.items || [],
          projects: stored.projects || [],
          contexts: stored.contexts && stored.contexts.length > 0 ? stored.contexts : defaultContexts
        });
        get().updateDashboard();
      },
      
      exportData: () => {
        return storage.exportData();
      },
      
      importData: (jsonString: string) => {
        const success = storage.importData(jsonString);
        if (success) {
          get().loadFromStorage();
        }
        return success;
      },
      
      clearAllData: () => {
        storage.clearAll();
        set({
          items: [],
          projects: [],
          contexts: defaultContexts,
          dashboard: {
            inboxCount: 0,
            nextActionsCount: 0,
            projectsCount: 0,
            waitingForCount: 0,
            somedayMaybeCount: 0,
            overdueTasks: 0,
            todayActions: [],
            upcomingDeadlines: [],
            recentlyCompleted: [],
            weeklyReviewDue: true
          }
        });
      },
      
      // Dashboard Actions
      updateDashboard: () => {
        const state = get();
        const items = state.items;
        
        const inboxItems = items.filter(item => item.type === 'inbox' && item.status === 'active');
        const nextActions = items.filter(item => item.isNextAction && item.status === 'active');
        const projects = items.filter(item => item.type === 'project' && item.status === 'active');
        const waitingFor = items.filter(item => item.type === 'waiting-for' && item.status === 'active');
        const somedayMaybe = items.filter(item => item.type === 'someday-maybe' && item.status === 'active');
        const recentlyCompleted = items
          .filter(item => item.status === 'completed' && item.completedDate)
          .sort((a, b) => new Date(b.completedDate!).getTime() - new Date(a.completedDate!).getTime())
          .slice(0, 5);
        
        // Mock today's actions (would be based on schedule/priority in real app)
        const todayActions = nextActions.slice(0, 3);
        
        const updatedDashboard = {
          inboxCount: inboxItems.length,
          nextActionsCount: nextActions.length,
          projectsCount: projects.length,
          waitingForCount: waitingFor.length,
          somedayMaybeCount: somedayMaybe.length,
          overdueTasks: 0, // Would calculate based on due dates
          todayActions,
          upcomingDeadlines: [], // Would calculate based on due dates
          recentlyCompleted,
          weeklyReviewDue: true // Would calculate based on last review date
        };
        
        storage.saveDashboard(updatedDashboard);
        set({ dashboard: updatedDashboard });
      },
      
      // Getters
      getItemsByView: (view: string) => {
        const items = get().items;
        
        switch (view) {
          case 'inbox':
            return items.filter(item => item.type === 'inbox' && item.status === 'active');
          case 'next-actions':
            return items.filter(item => item.isNextAction && item.status === 'active');
          case 'projects':
            return items.filter(item => item.type === 'project' && item.status === 'active');
          case 'waiting-for':
            return items.filter(item => item.type === 'waiting-for' && item.status === 'active');
          case 'someday-maybe':
            return items.filter(item => item.type === 'someday-maybe' && item.status === 'active');
          case 'reference':
            return items.filter(item => item.type === 'reference' && item.status === 'active');
          default:
            if (view.startsWith('context-')) {
              const contextId = view.replace('context-', '');
              return items.filter(item => item.contextId === contextId && item.status === 'active');
            }
            return [];
        }
      },
      
      getInboxItems: () => {
        return get().items.filter(item => item.type === 'inbox' && item.status === 'active');
      },
      
      getNextActions: () => {
        return get().items.filter(item => item.isNextAction && item.status === 'active');
      },
      
      getProjectItems: (projectId: string) => {
        return get().items.filter(item => item.projectId === projectId && item.status === 'active');
      },
      
      getContextItems: (contextId: string) => {
        return get().items.filter(item => item.contextId === contextId && item.status === 'active');
      },
      
      // New GTD 4-step filtering
      getFilteredItems: () => {
        const state = get();
        const { currentFilters } = state;
        let items = state.items.filter(item => item.isNextAction && item.status === 'active');
        
        // Step 1: Filter by contexts
        if (currentFilters.contexts.length > 0) {
          items = items.filter(item => 
            item.contextId && currentFilters.contexts.includes(item.contextId)
          );
        }
        
        // Step 2: Filter by available time
        if (currentFilters.maxMinutes) {
          items = items.filter(item => 
            !item.estimatedMinutes || item.estimatedMinutes <= currentFilters.maxMinutes!
          );
        }
        
        // Step 3: Filter by energy level
        if (currentFilters.currentEnergy) {
          const energyLevels = {
            'high': ['high'],
            'medium': ['high', 'medium'],
            'low': ['high', 'medium', 'low'],
            'zombie': ['high', 'medium', 'low', 'zombie']
          };
          const acceptableEnergy = energyLevels[currentFilters.currentEnergy];
          items = items.filter(item => 
            !item.energyRequired || acceptableEnergy.includes(item.energyRequired)
          );
        }
        
        // Step 4: Sort by dynamic priority
        return items.sort((a, b) => {
          // Calculate priority score
          const scoreA = get().calculatePriority(a);
          const scoreB = get().calculatePriority(b);
          return scoreB - scoreA;
        });
      },
      
      getEngagedItems: () => {
        const state = get();
        if (!state.engageDecision) {
          return state.getFilteredItems();
        }
        
        // Apply engage decision filters and return sorted results
        return state.getFilteredItems();
      },
      
      // Helper to calculate dynamic priority
      calculatePriority: (item: GTDItem): number => {
        let score = 0;
        
        // Urgency scoring
        if (item.dueDate) {
          const daysUntilDue = Math.floor((item.dueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
          if (daysUntilDue < 0) score += 100; // Overdue
          else if (daysUntilDue === 0) score += 50; // Due today
          else if (daysUntilDue <= 3) score += 25; // Due soon
        }
        
        // Importance scoring
        if (item.isUrgent) score += 30;
        if (item.isImportant) score += 20;
        
        // Age scoring (older items get slight boost)
        const daysOld = Math.floor((Date.now() - item.createdAt.getTime()) / (1000 * 60 * 60 * 24));
        score += Math.min(daysOld * 0.5, 10);
        
        return score;
      }
    };
});