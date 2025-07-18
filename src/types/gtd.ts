export interface GTDIdea {
  id: string;
  content: string;
  type: 'inbox' | 'action' | 'project' | 'reference' | 'someday-maybe' | 'waiting-for';
  status: 'active' | 'completed' | 'cancelled' | 'delegated';
  contextId?: string;
  projectId?: string;
  areaOfFocusId?: string;
  // Removed priority - GTD doesn't use static priorities
  estimatedMinutes?: number;
  energyRequired?: 'high' | 'medium' | 'low' | 'zombie';
  dueDate?: Date;
  completedDate?: Date;
  createdAt: Date;
  updatedAt: Date;
  notes?: string;
  isActionable: boolean;
  isNextAction: boolean;
  inProgress?: boolean;
  startedAt?: Date;
  elapsedTime?: number; // in seconds
  actualMinutes?: number; // total time spent when completed
  // Add urgency and importance for dynamic priority calculation
  isUrgent?: boolean;
  isImportant?: boolean;
}

// Backward compatibility alias
export type GTDItem = GTDIdea;

export interface Project {
  id: string;
  title: string;
  outcome: string; // Clear vision of successful completion
  description?: string;
  status: 'active' | 'completed' | 'cancelled' | 'on-hold' | 'someday-maybe';
  areaOfFocusId?: string;
  horizon: 1 | 2 | 3 | 4 | 5; // GTD Horizons of Focus
  createdAt: Date;
  updatedAt: Date;
  dueDate?: Date;
  completedDate?: Date;
  nextActionId?: string; // Current next action for this project
  isMultiStep: boolean;
  progress?: number; // 0-100 percentage
  estimatedHours?: number;
  actualHours?: number;
}

export interface Context {
  id: string;
  name: string;
  description?: string;
  icon: string;
  color: string;
  type: 'location' | 'tool' | 'person' | 'energy' | 'time';
  isActive: boolean;
  sortOrder: number;
}

export interface AreaOfFocus {
  id: string;
  name: string;
  description?: string;
  horizon: 2 | 3 | 4 | 5;
  parentId?: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Review {
  id: string;
  type: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  completedAt: Date;
  notes?: string;
  userId: string;
  duration: number; // in minutes
  itemsProcessed: number;
  completionPercentage: number;
}

export interface NaturalPlanningSession {
  id: string;
  projectId: string;
  purpose: string;
  principles: string[];
  outcome: string;
  brainstormIdeas: string[];
  organizationStructure: string;
  nextActions: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CaptureInput {
  content: string;
  source: 'web' | 'mobile' | 'email' | 'voice' | 'quick-add';
  metadata?: {
    location?: string;
    context?: string;
    urgency?: 'low' | 'medium' | 'high';
  };
}

export interface ProcessingDecision {
  itemId: string;
  isActionable: boolean;
  actionType?: 'do-now' | 'schedule' | 'delegate' | 'defer';
  resultType?: 'action' | 'project' | 'reference' | 'someday-maybe' | 'trash';
  contextId?: string;
  projectId?: string;
  estimatedMinutes?: number;
  energyRequired?: 'high' | 'medium' | 'low' | 'zombie';
  notes?: string;
  processedAt: Date;
}

export interface Dashboard {
  inboxCount: number;
  nextActionsCount: number;
  projectsCount: number;
  waitingForCount: number;
  somedayMaybeCount: number;
  overdueTasks: number;
  todayActions: GTDItem[];
  upcomingDeadlines: GTDItem[];
  recentlyCompleted: GTDItem[];
  weeklyReviewDue: boolean;
  lastReviewDate?: Date;
}

export type HorizonLevel = {
  0: 'Ground Level'; // Calendar and Next Actions
  1: 'Horizon 1';   // Projects (12 months)
  2: 'Horizon 2';   // Areas of Focus/Responsibility
  3: 'Horizon 3';   // 1-2 Year Goals
  4: 'Horizon 4';   // 3-5 Year Vision
  5: 'Horizon 5';   // Purpose and Principles
};

export interface GTDFilters {
  contexts: string[];          // Current contexts (can be multiple)
  maxMinutes?: number;         // Available time
  currentEnergy?: 'high' | 'medium' | 'low' | 'zombie';  // Current energy level
  includeOverdue: boolean;     // Include overdue items
  includeToday: boolean;       // Include items due today
  hideCompleted: boolean;      // Hide completed items
}

export interface EngageDecision {
  whereAmI: string[];          // Selected contexts
  timeAvailable: number;       // Minutes available
  energyLevel: 'high' | 'medium' | 'low' | 'zombie';
  focusArea?: string;          // Optional area of focus filter
}

// Weekly Review Types
export interface WeeklyReviewMetrics {
  // Capture metrics
  ideasCaptured: number;
  inboxProcessed: number;
  inboxProcessingRate: number; // percentage

  // Clarify metrics
  ideasClarified: number;
  actionableRate: number; // percentage of ideas that became actionable
  avgProcessingTime: number; // minutes per idea

  // Organize metrics
  projectsActive: number;
  projectsCompleted: number;
  projectsStuck: number; // projects without next actions
  contextDistribution: Record<string, number>;

  // Engage metrics
  ideasCompleted: number;
  completionRate: number; // percentage of planned actions completed
  avgTaskDuration: number; // actual vs estimated time
  overdueItems: number;

  // System health
  systemHealth: 'excellent' | 'good' | 'fair' | 'poor';
  healthScore: number; // 0-100
  healthFactors: {
    inboxEmpty: boolean;
    projectsHaveNextActions: boolean;
    lowOverdueItems: boolean;
    regularReviews: boolean;
  };
}

export interface WeeklyReviewData {
  id: string;
  weekStartDate: Date;
  weekEndDate: Date;
  completedAt: Date;
  metrics: WeeklyReviewMetrics;
  
  // Review outcomes
  wins: string[];
  challenges: string[];
  insights: string[];
  nextWeekFocus: string;
  
  // GTD Areas reviewed
  areasReviewed: {
    inbox: boolean;
    projects: boolean;
    waitingFor: boolean;
    somedayMaybe: boolean;
    calendar: boolean;
    contexts: boolean;
  };
  
  notes: string;
  duration: number; // minutes spent on review
}

export interface SystemHealthCheck {
  timestamp: Date;
  
  // Core GTD health indicators
  inboxHealth: {
    count: number;
    oldestItem: Date | null;
    score: number; // 0-100
  };
  
  projectHealth: {
    total: number;
    withNextActions: number;
    stuck: number;
    completed: number;
    score: number; // 0-100
  };
  
  actionHealth: {
    total: number;
    overdue: number;
    completed: number;
    averageAge: number; // days
    score: number; // 0-100
  };
  
  reviewHealth: {
    lastReview: Date | null;
    daysSinceReview: number;
    onSchedule: boolean;
    score: number; // 0-100
  };
  
  overallHealth: {
    score: number; // 0-100
    grade: 'A' | 'B' | 'C' | 'D' | 'F';
    recommendations: string[];
  };
}