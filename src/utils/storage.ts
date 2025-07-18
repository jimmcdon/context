import { GTDItem, Project, Context, Dashboard } from '../types/gtd';

const STORAGE_KEYS = {
  ITEMS: 'gtd-items',
  PROJECTS: 'gtd-projects',
  CONTEXTS: 'gtd-contexts',
  DASHBOARD: 'gtd-dashboard',
  LAST_REVIEW: 'gtd-last-review'
} as const;

export interface StoredData {
  items: GTDItem[];
  projects: Project[];
  contexts: Context[];
  dashboard: Dashboard;
  lastReview?: Date;
}

// Helper to safely parse JSON from localStorage
const safeParseJSON = <T>(key: string, defaultValue: T): T => {
  try {
    const stored = localStorage.getItem(key);
    if (stored === null) return defaultValue;
    
    const parsed = JSON.parse(stored);
    
    // Convert date strings back to Date objects and migrate old data
    if (key === STORAGE_KEYS.ITEMS && Array.isArray(parsed)) {
      return parsed.map(item => {
        // Migrate from old priority system
        const migratedItem = { ...item };
        
        // Remove priority field if it exists (from old version)
        if ('priority' in migratedItem) {
          delete migratedItem.priority;
        }
        
        // Add default energy level if missing
        if (!migratedItem.energyRequired) {
          migratedItem.energyRequired = 'medium';
        }
        
        // Convert dates
        return {
          ...migratedItem,
          createdAt: new Date(item.createdAt),
          updatedAt: new Date(item.updatedAt),
          dueDate: item.dueDate ? new Date(item.dueDate) : undefined,
          completedDate: item.completedDate ? new Date(item.completedDate) : undefined
        };
      }) as T;
    }
    
    if (key === STORAGE_KEYS.PROJECTS && Array.isArray(parsed)) {
      return parsed.map(project => ({
        ...project,
        createdAt: new Date(project.createdAt),
        updatedAt: new Date(project.updatedAt),
        dueDate: project.dueDate ? new Date(project.dueDate) : undefined,
        completedDate: project.completedDate ? new Date(project.completedDate) : undefined
      })) as T;
    }
    
    if (key === STORAGE_KEYS.LAST_REVIEW && typeof parsed === 'string') {
      return new Date(parsed) as T;
    }
    
    return parsed;
  } catch (error) {
    console.warn(`Failed to parse localStorage key "${key}":`, error);
    return defaultValue;
  }
};

// Helper to safely stringify and store data
const safeSetItem = (key: string, value: any): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Failed to save to localStorage key "${key}":`, error);
    // Handle quota exceeded or other storage errors
    if (error instanceof Error && error.name === 'QuotaExceededError') {
      console.warn('localStorage quota exceeded. Consider clearing old data.');
    }
  }
};

export const storage = {
  // Load all data from localStorage
  loadAll(): Partial<StoredData> {
    return {
      items: safeParseJSON(STORAGE_KEYS.ITEMS, []),
      projects: safeParseJSON(STORAGE_KEYS.PROJECTS, []),
      contexts: safeParseJSON(STORAGE_KEYS.CONTEXTS, []),
      dashboard: safeParseJSON(STORAGE_KEYS.DASHBOARD, {} as Dashboard),
      lastReview: safeParseJSON(STORAGE_KEYS.LAST_REVIEW, undefined)
    };
  },

  // Save items
  saveItems(items: GTDItem[]): void {
    safeSetItem(STORAGE_KEYS.ITEMS, items);
  },

  // Save projects
  saveProjects(projects: Project[]): void {
    safeSetItem(STORAGE_KEYS.PROJECTS, projects);
  },

  // Save contexts
  saveContexts(contexts: Context[]): void {
    safeSetItem(STORAGE_KEYS.CONTEXTS, contexts);
  },

  // Save dashboard
  saveDashboard(dashboard: Dashboard): void {
    safeSetItem(STORAGE_KEYS.DASHBOARD, dashboard);
  },

  // Save last review date
  saveLastReview(date: Date): void {
    safeSetItem(STORAGE_KEYS.LAST_REVIEW, date);
  },

  // Clear all data
  clearAll(): void {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  },

  // Export all data as JSON
  exportData(): string {
    const data = this.loadAll();
    return JSON.stringify(data, null, 2);
  },

  // Import data from JSON string
  importData(jsonString: string): boolean {
    try {
      const data = JSON.parse(jsonString) as Partial<StoredData>;
      
      if (data.items) this.saveItems(data.items);
      if (data.projects) this.saveProjects(data.projects);
      if (data.contexts) this.saveContexts(data.contexts);
      if (data.dashboard) this.saveDashboard(data.dashboard);
      if (data.lastReview) this.saveLastReview(data.lastReview);
      
      return true;
    } catch (error) {
      console.error('Failed to import data:', error);
      return false;
    }
  },

  // Get storage usage info
  getStorageInfo(): { used: number; available: number; percentage: number } {
    try {
      // Estimate current usage
      let used = 0;
      Object.values(STORAGE_KEYS).forEach(key => {
        const item = localStorage.getItem(key);
        if (item) {
          used += item.length;
        }
      });

      // Estimate available space (most browsers allow ~5-10MB)
      const available = 5 * 1024 * 1024; // 5MB estimate
      const percentage = (used / available) * 100;

      return { used, available, percentage };
    } catch {
      return { used: 0, available: 0, percentage: 0 };
    }
  }
};