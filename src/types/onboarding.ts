export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  content: React.ReactNode;
  interactionType: 'read' | 'practice' | 'setup' | 'quiz';
  estimatedMinutes: number;
  required: boolean;
  prerequisites?: string[];
}

export interface OnboardingModule {
  id: string;
  title: string;
  description: string;
  icon: string;
  estimatedMinutes: number;
  steps: OnboardingStep[];
  practiceData?: any;
}

export interface OnboardingProgress {
  userId: string;
  startedAt: Date;
  lastActiveAt: Date;
  completedAt?: Date;
  currentModuleId?: string;
  currentStepId?: string;
  completedSteps: string[];
  completedModules: string[];
  score: number; // 0-100
  practiceResults: Record<string, any>;
  preferences: {
    skipBasics: boolean;
    preferredPace: 'fast' | 'medium' | 'slow';
    focusAreas: string[];
  };
}

export interface OnboardingQuizQuestion {
  id: string;
  question: string;
  type: 'multiple-choice' | 'true-false' | 'scenario';
  options?: string[];
  correctAnswer: string | number;
  explanation: string;
  points: number;
}

export interface OnboardingPracticeSession {
  id: string;
  title: string;
  description: string;
  scenario: string;
  sampleData: any[];
  expectedActions: string[];
  successCriteria: string[];
  hints: string[];
}

export interface OnboardingCertificate {
  id: string;
  userId: string;
  moduleId: string;
  completedAt: Date;
  score: number;
  timeSpent: number; // minutes
  certificateUrl?: string;
}

// GTD-specific learning objectives
export interface GTDLearningObjective {
  id: string;
  title: string;
  description: string;
  category: 'capture' | 'clarify' | 'organize' | 'reflect' | 'engage';
  level: 'beginner' | 'intermediate' | 'advanced';
  practicalApplication: string;
  commonMistakes: string[];
  tips: string[];
}

// Interactive tutorial types
export interface TutorialStep {
  id: string;
  title: string;
  instruction: string;
  targetElement?: string; // CSS selector for highlighting
  position: 'top' | 'bottom' | 'left' | 'right' | 'center';
  action?: 'click' | 'type' | 'wait' | 'observe';
  expectedInput?: string;
  validationFn?: (input: any) => boolean;
  helpText?: string;
}

export interface Tutorial {
  id: string;
  title: string;
  description: string;
  category: string;
  steps: TutorialStep[];
  practiceMode: boolean;
  sampleData?: any[];
}

export type OnboardingTheme = 'professional' | 'friendly' | 'minimal';
export type OnboardingDifficulty = 'beginner' | 'experienced' | 'expert';