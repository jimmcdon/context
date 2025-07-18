import { create } from 'zustand';
import { OnboardingProgress } from '../types/onboarding';

interface OnboardingStore {
  // State
  progress: OnboardingProgress | null;
  isOnboardingCompleted: boolean;
  showOnboarding: boolean;
  firstVisit: boolean;
  
  // Actions
  setProgress: (progress: OnboardingProgress) => void;
  completeOnboarding: (progress: OnboardingProgress) => void;
  resetOnboarding: () => void;
  setShowOnboarding: (show: boolean) => void;
  checkFirstVisit: () => boolean;
  markVisited: () => void;
}

// Check if user has visited before
const checkFirstVisit = (): boolean => {
  try {
    const visited = localStorage.getItem('gtd-app-visited');
    return !visited;
  } catch {
    return true;
  }
};

// Load onboarding progress from localStorage
const loadProgress = (): OnboardingProgress | null => {
  try {
    const stored = localStorage.getItem('gtd-onboarding-progress');
    if (!stored) return null;
    
    const progress = JSON.parse(stored);
    return {
      ...progress,
      startedAt: new Date(progress.startedAt),
      lastActiveAt: new Date(progress.lastActiveAt),
      completedAt: progress.completedAt ? new Date(progress.completedAt) : undefined
    };
  } catch {
    return null;
  }
};

// Save onboarding progress to localStorage
const saveProgress = (progress: OnboardingProgress) => {
  try {
    localStorage.setItem('gtd-onboarding-progress', JSON.stringify(progress));
  } catch (error) {
    console.warn('Failed to save onboarding progress:', error);
  }
};

// Save completion status
const saveCompletionStatus = (completed: boolean) => {
  try {
    localStorage.setItem('gtd-onboarding-completed', JSON.stringify(completed));
  } catch (error) {
    console.warn('Failed to save onboarding completion status:', error);
  }
};

// Load completion status
const loadCompletionStatus = (): boolean => {
  try {
    const stored = localStorage.getItem('gtd-onboarding-completed');
    return stored ? JSON.parse(stored) : false;
  } catch {
    return false;
  }
};

// Mark as visited
const markVisited = () => {
  try {
    localStorage.setItem('gtd-app-visited', 'true');
  } catch (error) {
    console.warn('Failed to mark app as visited:', error);
  }
};

export const useOnboardingStore = create<OnboardingStore>((set, get) => {
  const firstVisit = checkFirstVisit();
  const isCompleted = loadCompletionStatus();
  const savedProgress = loadProgress();

  return {
    // Initial State
    progress: savedProgress,
    isOnboardingCompleted: isCompleted,
    showOnboarding: firstVisit && !isCompleted,
    firstVisit,
    
    // Actions
    setProgress: (progress: OnboardingProgress) => {
      saveProgress(progress);
      set({ progress });
    },
    
    completeOnboarding: (progress: OnboardingProgress) => {
      const completedProgress = {
        ...progress,
        completedAt: new Date()
      };
      
      saveProgress(completedProgress);
      saveCompletionStatus(true);
      
      set({ 
        progress: completedProgress,
        isOnboardingCompleted: true,
        showOnboarding: false
      });
    },
    
    resetOnboarding: () => {
      try {
        localStorage.removeItem('gtd-onboarding-progress');
        localStorage.removeItem('gtd-onboarding-completed');
      } catch (error) {
        console.warn('Failed to reset onboarding:', error);
      }
      
      set({
        progress: null,
        isOnboardingCompleted: false,
        showOnboarding: true
      });
    },
    
    setShowOnboarding: (show: boolean) => {
      set({ showOnboarding: show });
    },
    
    checkFirstVisit: () => {
      return get().firstVisit;
    },
    
    markVisited: () => {
      markVisited();
      set({ firstVisit: false });
    }
  };
});