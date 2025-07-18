import { create } from 'zustand';
import { GTDIdea, GTDItem, Project, Context, ProcessingDecision, Dashboard, GTDFilters, EngageDecision, WeeklyReviewData, SystemHealthCheck } from '../types/gtd';
import { storage } from '../utils/storage';

interface GTDStore {
  // State
  ideas: GTDIdea[];
  items: GTDIdea[]; // Backward compatibility alias
  projects: Project[];
  contexts: Context[];
  dashboard: Dashboard;
  weeklyReviews: WeeklyReviewData[];
  lastSystemHealth: SystemHealthCheck | null;
  
  // UI State
  activeView: string;
  selectedIdea: GTDIdea | null;
  selectedItem: GTDIdea | null; // Backward compatibility alias
  isProcessing: boolean;
  
  // Filtering State
  currentFilters: GTDFilters;
  engageDecision: EngageDecision | null;
  todayTaskIds: string[];
  dailyNotes: string;
  
  // Actions
  addIdea: (content: string, metadata?: any) => string;
  addItem: (content: string, metadata?: any) => string; // Backward compatibility alias
  processIdea: (decision: ProcessingDecision) => void;
  processItem: (decision: ProcessingDecision) => void; // Backward compatibility alias
  updateIdea: (id: string, updates: Partial<GTDIdea>) => void;
  updateItem: (id: string, updates: Partial<GTDIdea>) => void; // Backward compatibility alias
  deleteIdea: (id: string) => void;
  deleteItem: (id: string) => void; // Backward compatibility alias
  completeIdea: (id: string) => void;
  completeItem: (id: string) => void; // Backward compatibility alias
  
  // View Actions
  setActiveView: (view: string) => void;
  setSelectedIdea: (idea: GTDIdea | null) => void;
  setSelectedItem: (item: GTDIdea | null) => void; // Backward compatibility alias
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
  updateTaskTime: (taskId: string, elapsedSeconds: number) => void;
  getActiveTask: () => GTDItem | null;
  
  // Project Actions
  addProject: (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => string;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  completeProject: (id: string) => void;
  linkIdeaToProject: (projectId: string, ideaId: string) => void;
  unlinkIdeaFromProject: (projectId: string, ideaId: string) => void;
  setProjectNextAction: (projectId: string, ideaId: string) => void;
  updateProjectProgress: (projectId: string, progress: number) => void;
  
  // Weekly Review Actions
  saveWeeklyReview: (reviewData: WeeklyReviewData) => void;
  getLatestReview: () => WeeklyReviewData | null;
  calculateSystemHealth: () => SystemHealthCheck;
  
  // Dashboard Actions
  updateDashboard: () => void;
  
  // Storage Actions
  loadFromStorage: () => void;
  exportData: () => string;
  importData: (jsonString: string) => boolean;
  clearAllData: () => void;
  
  // Getters
  getIdeasByView: (view: string) => GTDIdea[];
  getItemsByView: (view: string) => GTDIdea[]; // Backward compatibility alias
  getCapturedIdeas: () => GTDIdea[];
  getInboxItems: () => GTDIdea[]; // Backward compatibility alias
  getNextActions: () => GTDIdea[];
  getProjectIdeas: (projectId: string) => GTDIdea[];
  getProjectItems: (projectId: string) => GTDIdea[]; // Backward compatibility alias
  getContextIdeas: (contextId: string) => GTDIdea[];
  getContextItems: (contextId: string) => GTDIdea[]; // Backward compatibility alias
  getFilteredIdeas: () => GTDIdea[];
  getFilteredItems: () => GTDIdea[]; // Backward compatibility alias
  getEngagedIdeas: () => GTDIdea[];
  getEngagedItems: () => GTDIdea[]; // Backward compatibility alias
  calculatePriority: (idea: GTDIdea) => number;
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
  const ideas = stored.items || []; // Load from 'items' for backward compatibility
  return {
    ideas,
    items: ideas, // Backward compatibility alias
    projects: stored.projects || [],
    contexts: stored.contexts && stored.contexts.length > 0 ? stored.contexts : defaultContexts,
    weeklyReviews: [], // Would load from storage
    lastSystemHealth: null,
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
      selectedIdea: null,
      selectedItem: null, // Backward compatibility alias
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
      addIdea: (content: string, metadata?: any) => {
        console.log('Adding idea:', content, metadata); // Debug log
        const newIdea: GTDIdea = {
          id: generateId(),
          content: content.trim(),
          type: 'inbox',
          status: 'active',
          createdAt: new Date(),
          updatedAt: new Date(),
          isActionable: false,
          isNextAction: false,
          energyRequired: metadata?.detectedEnergy || 'medium',
          estimatedMinutes: metadata?.detectedTime,
          // Apply smart categorization from voice
          ...(metadata?.detectedContext && { contextId: metadata.detectedContext.toLowerCase().replace('@', '') }),
          ...(metadata?.isUrgent && { isUrgent: true }),
          ...(metadata?.isProject && { type: 'project' as const })
        };
    
        set((state) => {
          const newIdeas = [...state.ideas, newIdea];
          storage.saveItems(newIdeas); // Still save as 'items' for storage compatibility
          console.log('New ideas array:', newIdeas); // Debug log
          return { ideas: newIdeas, items: newIdeas };
        });
        
        get().updateDashboard();
        return newIdea.id;
      },
      
      // Backward compatibility alias
      addItem: (content: string, metadata?: any) => {
        return get().addIdea(content, metadata);
      },
  
  processIdea: (decision: ProcessingDecision) => {
    const { itemId, isActionable, actionType, resultType, contextId, projectId, estimatedMinutes, energyRequired } = decision;
    
        set((state) => {
          const updatedIdeas = state.ideas.map(idea => {
            if (idea.id !== itemId) return idea;
            
            const updates: Partial<GTDIdea> = {
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
              // Actionable idea
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
            
            return { ...idea, ...updates };
          });
          
          storage.saveItems(updatedIdeas);
          return { ideas: updatedIdeas, items: updatedIdeas };
        });
    
    get().updateDashboard();
    get().setProcessing(false);
    get().setSelectedIdea(null);
      },
      
      // Backward compatibility alias
      processItem: (decision: ProcessingDecision) => {
        get().processIdea(decision);
      },
      
      updateIdea: (id: string, updates: Partial<GTDIdea>) => {
        set((state) => {
          const updatedIdeas = state.ideas.map(idea =>
            idea.id === id 
              ? { ...idea, ...updates, updatedAt: new Date() }
              : idea
          );
          storage.saveItems(updatedIdeas);
          return { ideas: updatedIdeas, items: updatedIdeas };
        });
        get().updateDashboard();
      },
      
      // Backward compatibility alias
      updateItem: (id: string, updates: Partial<GTDIdea>) => {
        get().updateIdea(id, updates);
      },
      
      deleteIdea: (id: string) => {
        set((state) => {
          const filteredIdeas = state.ideas.filter(idea => idea.id !== id);
          storage.saveItems(filteredIdeas);
          return { ideas: filteredIdeas, items: filteredIdeas };
        });
        get().updateDashboard();
      },
      
      // Backward compatibility alias
      deleteItem: (id: string) => {
        get().deleteIdea(id);
      },
      
      completeIdea: (id: string) => {
        set((state) => {
          const updatedIdeas = state.ideas.map(idea =>
            idea.id === id
              ? { 
                  ...idea, 
                  status: 'completed' as const, 
                  completedDate: new Date(),
                  updatedAt: new Date(),
                  inProgress: false,
                  actualMinutes: idea.elapsedTime ? Math.round(idea.elapsedTime / 60) : undefined
                }
              : idea
          );
          storage.saveItems(updatedIdeas);
          return { ideas: updatedIdeas, items: updatedIdeas };
        });
        get().updateDashboard();
      },
      
      // Backward compatibility alias
      completeItem: (id: string) => {
        get().completeIdea(id);
      },
      
      // View Actions
      setActiveView: (view: string) => {
        set({ activeView: view });
      },
      
      setSelectedIdea: (idea: GTDIdea | null) => {
        set({ selectedIdea: idea, selectedItem: idea });
      },
      
      // Backward compatibility alias
      setSelectedItem: (item: GTDIdea | null) => {
        get().setSelectedIdea(item);
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
          const updatedIdeas = state.ideas.map(idea =>
            idea.id === taskId
              ? { 
                  ...idea, 
                  inProgress: true, 
                  startedAt: new Date(),
                  updatedAt: new Date()
                }
              : { ...idea, inProgress: false } // Pause other tasks
          );
          storage.saveItems(updatedIdeas);
          return { ideas: updatedIdeas, items: updatedIdeas };
        });
        get().updateDashboard();
      },
      
      pauseTask: (taskId: string) => {
        set((state) => {
          const updatedIdeas = state.ideas.map(idea =>
            idea.id === taskId
              ? { 
                  ...idea, 
                  inProgress: false,
                  updatedAt: new Date()
                }
              : idea
          );
          storage.saveItems(updatedIdeas);
          return { ideas: updatedIdeas, items: updatedIdeas };
        });
        get().updateDashboard();
      },
      
      updateTaskTime: (taskId: string, elapsedSeconds: number) => {
        set((state) => {
          const updatedIdeas = state.ideas.map(idea =>
            idea.id === taskId
              ? { 
                  ...idea, 
                  elapsedTime: elapsedSeconds,
                  updatedAt: new Date()
                }
              : idea
          );
          storage.saveItems(updatedIdeas);
          return { ideas: updatedIdeas, items: updatedIdeas };
        });
      },
      
      getActiveTask: () => {
        const state = get();
        return state.ideas.find(idea => idea.inProgress && idea.status === 'active') || null;
      },
      
      // Storage Actions
      loadFromStorage: () => {
        const stored = storage.loadAll();
        const ideas = stored.items || []; // Load from 'items' for backward compatibility
        set({
          ideas,
          items: ideas, // Backward compatibility alias
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
          ideas: [],
          items: [], // Backward compatibility alias
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
        const ideas = state.ideas;
        
        const capturedIdeas = ideas.filter(idea => idea.type === 'inbox' && idea.status === 'active');
        const nextActions = ideas.filter(idea => idea.isNextAction && idea.status === 'active');
        const projects = ideas.filter(idea => idea.type === 'project' && idea.status === 'active');
        const waitingFor = ideas.filter(idea => idea.type === 'waiting-for' && idea.status === 'active');
        const somedayMaybe = ideas.filter(idea => idea.type === 'someday-maybe' && idea.status === 'active');
        const recentlyCompleted = ideas
          .filter(idea => idea.status === 'completed' && idea.completedDate)
          .sort((a, b) => new Date(b.completedDate!).getTime() - new Date(a.completedDate!).getTime())
          .slice(0, 5);
        
        // Mock today's actions (would be based on schedule/priority in real app)
        const todayActions = nextActions.slice(0, 3);
        
        const updatedDashboard = {
          inboxCount: capturedIdeas.length,
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
      getIdeasByView: (view: string) => {
        const ideas = get().ideas;
        
        switch (view) {
          case 'inbox':
            return ideas.filter(idea => idea.type === 'inbox' && idea.status === 'active');
          case 'next-actions':
            return ideas.filter(idea => idea.isNextAction && idea.status === 'active');
          case 'projects':
            return ideas.filter(idea => idea.type === 'project' && idea.status === 'active');
          case 'waiting-for':
            return ideas.filter(idea => idea.type === 'waiting-for' && idea.status === 'active');
          case 'someday-maybe':
            return ideas.filter(idea => idea.type === 'someday-maybe' && idea.status === 'active');
          case 'reference':
            return ideas.filter(idea => idea.type === 'reference' && idea.status === 'active');
          default:
            if (view.startsWith('context-')) {
              const contextId = view.replace('context-', '');
              return ideas.filter(idea => idea.contextId === contextId && idea.status === 'active');
            }
            return [];
        }
      },
      
      // Backward compatibility alias
      getItemsByView: (view: string) => {
        return get().getIdeasByView(view);
      },
      
      getCapturedIdeas: () => {
        return get().ideas.filter(idea => idea.type === 'inbox' && idea.status === 'active');
      },
      
      // Backward compatibility alias
      getInboxItems: () => {
        return get().getCapturedIdeas();
      },
      
      getNextActions: () => {
        return get().ideas.filter(idea => idea.isNextAction && idea.status === 'active');
      },
      
      getProjectIdeas: (projectId: string) => {
        return get().ideas.filter(idea => idea.projectId === projectId && idea.status === 'active');
      },
      
      // Backward compatibility alias
      getProjectItems: (projectId: string) => {
        return get().getProjectIdeas(projectId);
      },
      
      getContextIdeas: (contextId: string) => {
        return get().ideas.filter(idea => idea.contextId === contextId && idea.status === 'active');
      },
      
      // Backward compatibility alias
      getContextItems: (contextId: string) => {
        return get().getContextIdeas(contextId);
      },
      
      // New GTD 4-step filtering
      getFilteredIdeas: () => {
        const state = get();
        const { currentFilters } = state;
        let ideas = state.ideas.filter(idea => idea.isNextAction && idea.status === 'active');
        
        // Step 1: Filter by contexts
        if (currentFilters.contexts.length > 0) {
          ideas = ideas.filter(idea => 
            idea.contextId && currentFilters.contexts.includes(idea.contextId)
          );
        }
        
        // Step 2: Filter by available time
        if (currentFilters.maxMinutes) {
          ideas = ideas.filter(idea => 
            !idea.estimatedMinutes || idea.estimatedMinutes <= currentFilters.maxMinutes!
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
          ideas = ideas.filter(idea => 
            !idea.energyRequired || acceptableEnergy.includes(idea.energyRequired)
          );
        }
        
        // Step 4: Sort by dynamic priority
        return ideas.sort((a, b) => {
          // Calculate priority score
          const scoreA = get().calculatePriority(a);
          const scoreB = get().calculatePriority(b);
          return scoreB - scoreA;
        });
      },
      
      // Backward compatibility alias
      getFilteredItems: () => {
        return get().getFilteredIdeas();
      },
      
      getEngagedIdeas: () => {
        const state = get();
        if (!state.engageDecision) {
          return state.getFilteredIdeas();
        }
        
        // Apply engage decision filters and return sorted results
        return state.getFilteredIdeas();
      },
      
      // Backward compatibility alias
      getEngagedItems: () => {
        return get().getEngagedIdeas();
      },
      
      // Helper to calculate dynamic priority
      calculatePriority: (idea: GTDIdea): number => {
        let score = 0;
        
        // Urgency scoring
        if (idea.dueDate) {
          const daysUntilDue = Math.floor((idea.dueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
          if (daysUntilDue < 0) score += 100; // Overdue
          else if (daysUntilDue === 0) score += 50; // Due today
          else if (daysUntilDue <= 3) score += 25; // Due soon
        }
        
        // Importance scoring
        if (idea.isUrgent) score += 30;
        if (idea.isImportant) score += 20;
        
        // Age scoring (older ideas get slight boost)
        const daysOld = Math.floor((Date.now() - idea.createdAt.getTime()) / (1000 * 60 * 60 * 24));
        score += Math.min(daysOld * 0.5, 10);
        
        return score;
      },
      
      // Project Actions Implementation
      addProject: (projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => {
        const newProject: Project = {
          ...projectData,
          id: generateId(),
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        set((state) => {
          const newProjects = [...state.projects, newProject];
          storage.saveProjects(newProjects);
          return { projects: newProjects };
        });
        
        get().updateDashboard();
        return newProject.id;
      },
      
      updateProject: (id: string, updates: Partial<Project>) => {
        set((state) => {
          const updatedProjects = state.projects.map(project =>
            project.id === id
              ? { ...project, ...updates, updatedAt: new Date() }
              : project
          );
          storage.saveProjects(updatedProjects);
          return { projects: updatedProjects };
        });
        get().updateDashboard();
      },
      
      deleteProject: (id: string) => {
        set((state) => {
          // Unlink all ideas from this project
          const updatedIdeas = state.ideas.map(idea =>
            idea.projectId === id
              ? { ...idea, projectId: undefined, updatedAt: new Date() }
              : idea
          );
          
          const filteredProjects = state.projects.filter(project => project.id !== id);
          
          storage.saveProjects(filteredProjects);
          storage.saveItems(updatedIdeas);
          
          return { 
            projects: filteredProjects,
            ideas: updatedIdeas,
            items: updatedIdeas
          };
        });
        get().updateDashboard();
      },
      
      completeProject: (id: string) => {
        get().updateProject(id, { 
          status: 'completed', 
          completedDate: new Date(),
          progress: 100
        });
      },
      
      linkIdeaToProject: (projectId: string, ideaId: string) => {
        get().updateIdea(ideaId, { projectId });
      },
      
      unlinkIdeaFromProject: (projectId: string, ideaId: string) => {
        const idea = get().ideas.find(i => i.id === ideaId);
        if (idea && idea.projectId === projectId) {
          get().updateIdea(ideaId, { projectId: undefined });
        }
      },
      
      setProjectNextAction: (projectId: string, ideaId: string) => {
        set((state) => {
          // Clear existing next action for this project
          const clearedIdeas = state.ideas.map(idea =>
            idea.projectId === projectId && idea.isNextAction
              ? { ...idea, isNextAction: false, updatedAt: new Date() }
              : idea
          );
          
          // Set new next action
          const updatedIdeas = clearedIdeas.map(idea =>
            idea.id === ideaId
              ? { ...idea, isNextAction: true, updatedAt: new Date() }
              : idea
          );
          
          // Update project's nextActionId
          const updatedProjects = state.projects.map(project =>
            project.id === projectId
              ? { ...project, nextActionId: ideaId, updatedAt: new Date() }
              : project
          );
          
          storage.saveItems(updatedIdeas);
          storage.saveProjects(updatedProjects);
          
          return {
            ideas: updatedIdeas,
            items: updatedIdeas,
            projects: updatedProjects
          };
        });
        get().updateDashboard();
      },
      
      updateProjectProgress: (projectId: string, progress: number) => {
        get().updateProject(projectId, { progress: Math.max(0, Math.min(100, progress)) });
      },
      
      // Weekly Review Implementation
      saveWeeklyReview: (reviewData: WeeklyReviewData) => {
        set((state) => {
          const newReviews = [...state.weeklyReviews, reviewData];
          // Keep only last 12 reviews (3 months)
          const recentReviews = newReviews.slice(-12);
          
          // Update dashboard with last review date
          const updatedDashboard = {
            ...state.dashboard,
            weeklyReviewDue: false,
            lastReviewDate: reviewData.completedAt
          };
          
          storage.saveDashboard(updatedDashboard);
          // Would also save reviews to storage
          
          return { 
            weeklyReviews: recentReviews,
            dashboard: updatedDashboard
          };
        });
      },
      
      getLatestReview: () => {
        const state = get();
        return state.weeklyReviews.length > 0 
          ? state.weeklyReviews[state.weeklyReviews.length - 1]
          : null;
      },
      
      calculateSystemHealth: (): SystemHealthCheck => {
        const state = get();
        const now = new Date();
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        
        // Inbox health
        const inboxIdeas = state.ideas.filter(idea => idea.type === 'inbox' && idea.status === 'active');
        const oldestInboxItem = inboxIdeas.length > 0 
          ? inboxIdeas.reduce((oldest, idea) => 
              idea.createdAt < oldest.createdAt ? idea : oldest
            ).createdAt 
          : null;
        
        const inboxScore = Math.max(0, 100 - (inboxIdeas.length * 5));
        
        // Project health
        const activeProjects = state.projects.filter(p => p.status === 'active');
        const projectsWithNextActions = activeProjects.filter(p => 
          state.ideas.some(idea => idea.projectId === p.id && idea.isNextAction && idea.status === 'active')
        );
        const stuckProjects = activeProjects.length - projectsWithNextActions.length;
        const completedProjects = state.projects.filter(p => 
          p.status === 'completed' && p.completedDate && p.completedDate >= oneWeekAgo
        );
        
        const projectScore = activeProjects.length === 0 ? 100 : 
          Math.max(0, 100 - (stuckProjects * 20));
        
        // Action health
        const activeActions = state.ideas.filter(idea => 
          idea.status === 'active' && idea.isActionable && idea.type === 'action'
        );
        const overdueActions = activeActions.filter(idea => 
          idea.dueDate && new Date(idea.dueDate) < now
        );
        const completedActions = state.ideas.filter(idea => 
          idea.status === 'completed' && idea.completedDate && idea.completedDate >= oneWeekAgo
        );
        
        const averageAge = activeActions.length > 0 
          ? activeActions.reduce((sum, idea) => 
              sum + Math.floor((now.getTime() - idea.createdAt.getTime()) / (1000 * 60 * 60 * 24)), 0
            ) / activeActions.length 
          : 0;
        
        const actionScore = Math.max(0, 100 - (overdueActions.length * 10) - (averageAge * 2));
        
        // Review health
        const lastReview = get().getLatestReview();
        const daysSinceReview = lastReview 
          ? Math.floor((now.getTime() - lastReview.completedAt.getTime()) / (1000 * 60 * 60 * 24))
          : 14; // Assume 2 weeks if no review
        const reviewScore = daysSinceReview <= 7 ? 100 : Math.max(0, 100 - (daysSinceReview * 5));
        
        // Overall health
        const overallScore = Math.round((inboxScore + projectScore + actionScore + reviewScore) / 4);
        const grade = overallScore >= 90 ? 'A' : 
                     overallScore >= 80 ? 'B' : 
                     overallScore >= 70 ? 'C' : 
                     overallScore >= 60 ? 'D' : 'F';
        
        const recommendations: string[] = [];
        if (inboxIdeas.length > 10) recommendations.push('Process inbox - too many unprocessed ideas');
        if (stuckProjects > 0) recommendations.push(`${stuckProjects} projects need next actions`);
        if (overdueActions.length > 0) recommendations.push(`${overdueActions.length} overdue actions need attention`);
        if (daysSinceReview > 7) recommendations.push('Weekly review is overdue');
        
        const healthCheck: SystemHealthCheck = {
          timestamp: now,
          inboxHealth: {
            count: inboxIdeas.length,
            oldestItem: oldestInboxItem,
            score: inboxScore
          },
          projectHealth: {
            total: activeProjects.length,
            withNextActions: projectsWithNextActions.length,
            stuck: stuckProjects,
            completed: completedProjects.length,
            score: projectScore
          },
          actionHealth: {
            total: activeActions.length,
            overdue: overdueActions.length,
            completed: completedActions.length,
            averageAge,
            score: actionScore
          },
          reviewHealth: {
            lastReview: lastReview?.completedAt || null,
            daysSinceReview,
            onSchedule: daysSinceReview <= 7,
            score: reviewScore
          },
          overallHealth: {
            score: overallScore,
            grade,
            recommendations
          }
        };
        
        // Update stored health check
        set({ lastSystemHealth: healthCheck });
        
        return healthCheck;
      }
    };
});