import React, { useState, useEffect, useCallback } from 'react';
import {
  X,
  CheckCircle,
  Circle,
  ArrowRight,
  ArrowLeft,
  Trophy,
  Clock,
  Target,
  Brain,
  Lightbulb,
  Zap,
  BookOpen,
  PlayCircle,
  Award,
  Star,
  Compass
} from 'lucide-react';
import { OnboardingModule, OnboardingProgress, OnboardingTheme } from '../../types/onboarding';
import { useGTDStore } from '../../store/gtdStore';

interface OnboardingFlowProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (progress: OnboardingProgress) => void;
  theme?: OnboardingTheme;
}

// Sample data for practice sessions
const sampleIdeas = [
  "Call dentist to schedule cleaning",
  "Buy groceries for dinner party",
  "Review quarterly budget report", 
  "Plan vacation to Italy",
  "Fix leaky faucet in kitchen",
  "Read new industry white paper",
  "Organize home office",
  "Learn Spanish",
  "Update emergency contact info",
  "Research new project management tools"
];

const onboardingModules: OnboardingModule[] = [
  {
    id: 'welcome',
    title: 'Welcome to GTD',
    description: 'Learn the core principles and benefits of Getting Things Done',
    icon: '👋',
    estimatedMinutes: 10,
    steps: [
      {
        id: 'intro',
        title: 'What is Getting Things Done?',
        description: 'Understanding the GTD methodology',
        content: null, // Will be rendered inline
        interactionType: 'read',
        estimatedMinutes: 5,
        required: true
      },
      {
        id: 'mind-like-water',
        title: 'Achieving Mind Like Water',
        description: 'The goal of mental clarity and focus',
        content: null,
        interactionType: 'read',
        estimatedMinutes: 3,
        required: true
      },
      {
        id: 'five-steps',
        title: 'The Five Steps of GTD',
        description: 'Capture → Clarify → Organize → Reflect → Engage',
        content: null,
        interactionType: 'read',
        estimatedMinutes: 2,
        required: true
      }
    ]
  },
  {
    id: 'capture',
    title: 'Capture Everything',
    description: 'Learn to collect all your thoughts and commitments',
    icon: '📥',
    estimatedMinutes: 15,
    steps: [
      {
        id: 'capture-theory',
        title: 'The Capture Habit',
        description: 'Why and how to capture everything',
        content: null,
        interactionType: 'read',
        estimatedMinutes: 5,
        required: true
      },
      {
        id: 'capture-practice',
        title: 'Practice Capturing',
        description: 'Hands-on practice with the capture system',
        content: null,
        interactionType: 'practice',
        estimatedMinutes: 10,
        required: true
      }
    ],
    practiceData: {
      sampleIdeas: sampleIdeas.slice(0, 5),
      expectedActions: ['capture-ideas', 'use-voice-capture', 'review-inbox']
    }
  },
  {
    id: 'clarify',
    title: 'Clarify Your Ideas',
    description: 'Process your inbox and make clear decisions',
    icon: '🤔',
    estimatedMinutes: 20,
    steps: [
      {
        id: 'clarify-theory',
        title: 'The Clarification Process',
        description: 'Learning the decision workflow',
        content: null,
        interactionType: 'read',
        estimatedMinutes: 8,
        required: true
      },
      {
        id: 'clarify-practice',
        title: 'Practice Clarifying',
        description: 'Process sample ideas through the workflow',
        content: null,
        interactionType: 'practice',
        estimatedMinutes: 12,
        required: true
      }
    ],
    practiceData: {
      sampleIdeas: sampleIdeas.slice(2, 7),
      expectedActions: ['process-inbox', 'create-actions', 'organize-references']
    }
  },
  {
    id: 'organize',
    title: 'Organize Your System',
    description: 'Set up contexts, projects, and lists',
    icon: '📁',
    estimatedMinutes: 25,
    steps: [
      {
        id: 'contexts-setup',
        title: 'Setting Up Contexts',
        description: 'Create your context system',
        content: null,
        interactionType: 'setup',
        estimatedMinutes: 10,
        required: true
      },
      {
        id: 'projects-setup',
        title: 'Organizing Projects',
        description: 'Learn project outcomes and next actions',
        content: null,
        interactionType: 'setup',
        estimatedMinutes: 15,
        required: true
      }
    ]
  },
  {
    id: 'engage',
    title: 'Choose and Do',
    description: 'Learn the four-criteria model for choosing actions',
    icon: '⚡',
    estimatedMinutes: 15,
    steps: [
      {
        id: 'four-criteria',
        title: 'The Four-Criteria Model',
        description: 'Context → Time → Energy → Priority',
        content: null,
        interactionType: 'read',
        estimatedMinutes: 8,
        required: true
      },
      {
        id: 'engage-practice',
        title: 'Practice Engaging',
        description: 'Use Today Dashboard and filtering',
        content: null,
        interactionType: 'practice',
        estimatedMinutes: 7,
        required: true
      }
    ]
  },
  {
    id: 'reflect',
    title: 'Review and Reflect',
    description: 'Master the weekly review and system maintenance',
    icon: '🔄',
    estimatedMinutes: 20,
    steps: [
      {
        id: 'weekly-review',
        title: 'The Weekly Review',
        description: 'Your system maintenance ritual',
        content: null,
        interactionType: 'read',
        estimatedMinutes: 10,
        required: true
      },
      {
        id: 'review-practice',
        title: 'Practice Reviewing',
        description: 'Complete a sample weekly review',
        content: null,
        interactionType: 'practice',
        estimatedMinutes: 10,
        required: true
      }
    ]
  }
];

export const OnboardingFlow: React.FC<OnboardingFlowProps> = ({
  isOpen,
  onClose,
  onComplete,
  theme = 'professional'
}) => {
  const { addIdea, processIdea, addProject } = useGTDStore();
  
  const [currentModuleIndex, setCurrentModuleIndex] = useState(0);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [startTime] = useState(new Date());
  const [practiceScore, setPracticeScore] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);

  const currentModule = onboardingModules[currentModuleIndex];
  const currentStep = currentModule?.steps[currentStepIndex];
  const totalSteps = onboardingModules.reduce((acc, module) => acc + module.steps.length, 0);
  const completedStepCount = completedSteps.length;
  const progress = (completedStepCount / totalSteps) * 100;

  const isStepCompleted = useCallback((stepId: string) => {
    return completedSteps.includes(stepId);
  }, [completedSteps]);

  const markStepCompleted = useCallback((stepId: string) => {
    if (!completedSteps.includes(stepId)) {
      setCompletedSteps(prev => [...prev, stepId]);
    }
  }, [completedSteps]);

  const canProceed = useCallback(() => {
    if (!currentStep) return false;
    
    // For required steps, must be completed
    if (currentStep.required) {
      return isStepCompleted(currentStep.id);
    }
    
    return true;
  }, [currentStep, isStepCompleted]);

  const handleNext = () => {
    if (!currentModule) return;

    if (currentStepIndex < currentModule.steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    } else if (currentModuleIndex < onboardingModules.length - 1) {
      setCurrentModuleIndex(currentModuleIndex + 1);
      setCurrentStepIndex(0);
    } else {
      // Completed all modules
      handleComplete();
    }
  };

  const handleBack = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    } else if (currentModuleIndex > 0) {
      setCurrentModuleIndex(currentModuleIndex - 1);
      setCurrentStepIndex(onboardingModules[currentModuleIndex - 1].steps.length - 1);
    }
  };

  const handleComplete = () => {
    const endTime = new Date();
    const timeSpent = Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60));
    
    const progress: OnboardingProgress = {
      userId: 'current-user',
      startedAt: startTime,
      lastActiveAt: endTime,
      completedAt: endTime,
      completedSteps,
      completedModules: onboardingModules.map(m => m.id),
      score: Math.round((completedStepCount / totalSteps) * 100),
      practiceResults: { score: practiceScore, timeSpent },
      preferences: {
        skipBasics: false,
        preferredPace: 'medium',
        focusAreas: ['productivity', 'organization']
      }
    };

    setShowCelebration(true);
    setTimeout(() => {
      onComplete(progress);
      onClose();
    }, 3000);
  };

  const renderStepContent = () => {
    if (!currentStep) return null;

    switch (currentStep.id) {
      case 'intro':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Brain size={40} className="text-white" />
              </div>
              <h3 className="text-2xl font-bold text-cursor-text mb-4">Getting Things Done</h3>
            </div>
            
            <div className="prose max-w-none text-cursor-text-muted">
              <p className="text-lg leading-relaxed">
                GTD is a personal productivity methodology developed by David Allen. 
                It's designed to help you achieve a state of <strong>"Mind Like Water"</strong> – 
                complete mental clarity and focus.
              </p>
              
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg my-6">
                <h4 className="font-semibold text-cursor-text mb-2">🧠 The Core Principle</h4>
                <p>
                  Your mind is for having ideas, not holding them. By capturing everything 
                  in a trusted system, you free your mental RAM for creative thinking.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                <div className="bg-cursor-bg p-4 rounded-lg">
                  <h5 className="font-medium text-cursor-text mb-2">✅ Benefits</h5>
                  <ul className="text-sm space-y-1">
                    <li>• Reduced stress and anxiety</li>
                    <li>• Improved focus and creativity</li>
                    <li>• Better work-life balance</li>
                    <li>• Increased productivity</li>
                  </ul>
                </div>
                <div className="bg-cursor-bg p-4 rounded-lg">
                  <h5 className="font-medium text-cursor-text mb-2">🎯 Key Outcomes</h5>
                  <ul className="text-sm space-y-1">
                    <li>• Clear mind and reduced overwhelm</li>
                    <li>• Reliable system you can trust</li>
                    <li>• Better decision making</li>
                    <li>• Consistent progress on goals</li>
                  </ul>
                </div>
              </div>
            </div>

            <button
              onClick={() => markStepCompleted(currentStep.id)}
              className="w-full bg-cursor-accent text-white py-3 rounded-lg hover:bg-cursor-accent/90 transition-colors font-medium"
            >
              I understand the GTD principles
            </button>
          </div>
        );

      case 'mind-like-water':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap size={32} className="text-white" />
              </div>
              <h3 className="text-xl font-bold text-cursor-text mb-2">Mind Like Water</h3>
              <p className="text-cursor-text-muted">The state of mental clarity and responsiveness</p>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 p-6 rounded-lg">
              <blockquote className="text-center italic text-lg text-cursor-text">
                "In karate, there is an image that's used to define the position of perfect readiness: 
                'mind like water.' Imagine throwing a pebble into a still pond. How does the water respond? 
                The answer is, totally appropriately to the force and mass of the input; 
                then it returns to calm."
              </blockquote>
              <cite className="block text-center mt-4 text-cursor-text-muted">— David Allen</cite>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <CheckCircle size={16} className="text-green-600" />
                </div>
                <div>
                  <h4 className="font-medium text-cursor-text">Appropriate Response</h4>
                  <p className="text-sm text-cursor-text-muted">Respond to each situation with exactly the right amount of energy and attention it deserves.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <Target size={16} className="text-blue-600" />
                </div>
                <div>
                  <h4 className="font-medium text-cursor-text">Present Moment Focus</h4>
                  <p className="text-sm text-cursor-text-muted">Stay fully engaged with what you're doing right now, without distraction from other commitments.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <Brain size={16} className="text-purple-600" />
                </div>
                <div>
                  <h4 className="font-medium text-cursor-text">Mental Clarity</h4>
                  <p className="text-sm text-cursor-text-muted">Clear mental space for creative thinking and problem-solving, not mental storage.</p>
                </div>
              </div>
            </div>

            <button
              onClick={() => markStepCompleted(currentStep.id)}
              className="w-full bg-cursor-accent text-white py-3 rounded-lg hover:bg-cursor-accent/90 transition-colors font-medium"
            >
              I want to achieve Mind Like Water
            </button>
          </div>
        );

      case 'five-steps':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-bold text-cursor-text mb-2">The Five Steps of GTD</h3>
              <p className="text-cursor-text-muted">A complete workflow for managing all your commitments</p>
            </div>

            <div className="space-y-4">
              {[
                { icon: '📥', title: 'Capture', description: 'Collect everything that has your attention', color: 'blue' },
                { icon: '🤔', title: 'Clarify', description: 'Process what each item means and what action is required', color: 'green' },
                { icon: '📁', title: 'Organize', description: 'Put reminders in appropriate categories and lists', color: 'yellow' },
                { icon: '🔄', title: 'Reflect', description: 'Review and update your system regularly', color: 'purple' },
                { icon: '⚡', title: 'Engage', description: 'Take action with confidence', color: 'red' }
              ].map((step, index) => (
                <div key={step.title} className="flex items-center gap-4 p-4 bg-cursor-bg rounded-lg">
                  <div className="text-2xl">{step.icon}</div>
                  <div className="flex-1">
                    <h4 className="font-medium text-cursor-text">{index + 1}. {step.title}</h4>
                    <p className="text-sm text-cursor-text-muted">{step.description}</p>
                  </div>
                  <ArrowRight size={20} className="text-cursor-text-muted" />
                </div>
              ))}
            </div>

            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Lightbulb size={16} className="text-yellow-600" />
                <span className="font-medium text-cursor-text">Key Insight</span>
              </div>
              <p className="text-sm text-cursor-text-muted">
                These five steps form a complete system. You'll practice each step in detail 
                as we progress through this onboarding.
              </p>
            </div>

            <button
              onClick={() => markStepCompleted(currentStep.id)}
              className="w-full bg-cursor-accent text-white py-3 rounded-lg hover:bg-cursor-accent/90 transition-colors font-medium"
            >
              Ready to learn the five steps
            </button>
          </div>
        );

      case 'capture-practice':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-bold text-cursor-text mb-2">Practice: Capture Ideas</h3>
              <p className="text-cursor-text-muted">Let's practice capturing some sample ideas</p>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <h4 className="font-medium text-cursor-text mb-2">🎯 Your Mission</h4>
              <ol className="text-sm text-cursor-text-muted space-y-1">
                <li>1. Use the "Capture Idea" button to add these items to your inbox</li>
                <li>2. Try both text and voice capture</li>
                <li>3. Don't worry about organizing yet - just capture!</li>
              </ol>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium text-cursor-text">Practice Items to Capture:</h4>
              {currentModule.practiceData?.sampleIdeas.map((idea: string, index: number) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-cursor-bg rounded-lg">
                  <Circle size={16} className="text-cursor-text-muted" />
                  <span className="text-cursor-text">{idea}</span>
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  // Simulate adding practice ideas
                  currentModule.practiceData?.sampleIdeas.forEach((idea: string) => {
                    addIdea(idea, { source: 'onboarding-practice' });
                  });
                  setPracticeScore(practiceScore + 20);
                  markStepCompleted(currentStep.id);
                }}
                className="flex-1 bg-cursor-accent text-white py-3 rounded-lg hover:bg-cursor-accent/90 transition-colors font-medium"
              >
                Add Practice Ideas
              </button>
              <button
                onClick={() => markStepCompleted(currentStep.id)}
                className="px-6 py-3 border border-cursor-border rounded-lg text-cursor-text hover:bg-cursor-bg transition-colors"
              >
                Skip Practice
              </button>
            </div>
          </div>
        );

      default:
        return (
          <div className="space-y-6 text-center">
            <div className="w-16 h-16 bg-cursor-accent/20 rounded-full flex items-center justify-center mx-auto">
              <BookOpen size={32} className="text-cursor-accent" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-cursor-text mb-2">{currentStep.title}</h3>
              <p className="text-cursor-text-muted">{currentStep.description}</p>
            </div>
            <button
              onClick={() => markStepCompleted(currentStep.id)}
              className="bg-cursor-accent text-white px-6 py-3 rounded-lg hover:bg-cursor-accent/90 transition-colors font-medium"
            >
              Continue
            </button>
          </div>
        );
    }
  };

  if (!isOpen) return null;

  if (showCelebration) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <div className="bg-cursor-sidebar border border-cursor-border rounded-lg shadow-2xl w-full max-w-md text-center p-8">
          <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <Trophy size={40} className="text-white" />
          </div>
          <h2 className="text-2xl font-bold text-cursor-text mb-4">Congratulations!</h2>
          <p className="text-cursor-text-muted mb-6">
            You've completed GTD onboarding and are ready to achieve Mind Like Water!
          </p>
          <div className="flex items-center justify-center gap-4 text-sm text-cursor-text-muted">
            <div className="flex items-center gap-1">
              <Star size={16} className="text-yellow-400" />
              <span>{Math.round(progress)}% Complete</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock size={16} />
              <span>{Math.round((new Date().getTime() - startTime.getTime()) / (1000 * 60))}m</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-cursor-sidebar border border-cursor-border rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex">
        {/* Sidebar - Module Navigation */}
        <div className="w-80 border-r border-cursor-border p-6 overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-cursor-text">GTD Onboarding</h2>
            <button
              onClick={onClose}
              className="p-1 hover:bg-cursor-bg rounded transition-colors text-cursor-text-muted hover:text-cursor-text"
            >
              <X size={18} />
            </button>
          </div>

          <div className="mb-6">
            <div className="flex items-center justify-between text-sm text-cursor-text-muted mb-2">
              <span>Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-cursor-bg rounded-full h-2">
              <div 
                className="bg-cursor-accent rounded-full h-2 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div className="space-y-3">
            {onboardingModules.map((module, moduleIndex) => (
              <div key={module.id} className="space-y-2">
                <div 
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    moduleIndex === currentModuleIndex 
                      ? 'bg-cursor-accent/20 border border-cursor-accent/30' 
                      : 'hover:bg-cursor-bg'
                  }`}
                  onClick={() => {
                    setCurrentModuleIndex(moduleIndex);
                    setCurrentStepIndex(0);
                  }}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-lg">{module.icon}</span>
                    <div className="flex-1">
                      <h3 className="font-medium text-cursor-text">{module.title}</h3>
                      <p className="text-xs text-cursor-text-muted">{module.estimatedMinutes}m</p>
                    </div>
                    {moduleIndex === currentModuleIndex && (
                      <ArrowRight size={16} className="text-cursor-accent" />
                    )}
                  </div>
                </div>
                
                {moduleIndex === currentModuleIndex && (
                  <div className="ml-6 space-y-1">
                    {module.steps.map((step, stepIndex) => (
                      <div 
                        key={step.id}
                        className={`flex items-center gap-2 p-2 rounded text-sm cursor-pointer ${
                          stepIndex === currentStepIndex 
                            ? 'bg-cursor-accent/10 text-cursor-accent' 
                            : 'text-cursor-text-muted hover:text-cursor-text'
                        }`}
                        onClick={() => setCurrentStepIndex(stepIndex)}
                      >
                        {isStepCompleted(step.id) ? (
                          <CheckCircle size={14} className="text-green-500" />
                        ) : (
                          <Circle size={14} />
                        )}
                        <span>{step.title}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-cursor-border">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-semibold text-cursor-text">{currentStep?.title}</h1>
                <p className="text-cursor-text-muted text-sm mt-1">{currentStep?.description}</p>
              </div>
              <div className="flex items-center gap-4 text-sm text-cursor-text-muted">
                <div className="flex items-center gap-1">
                  <Clock size={14} />
                  <span>{currentStep?.estimatedMinutes}m</span>
                </div>
                <div className="flex items-center gap-1">
                  <Compass size={14} />
                  <span>Step {completedStepCount + 1} of {totalSteps}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {renderStepContent()}
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-cursor-border">
            <div className="flex items-center justify-between">
              <button
                onClick={currentModuleIndex === 0 && currentStepIndex === 0 ? onClose : handleBack}
                className="flex items-center gap-2 px-4 py-2 text-cursor-text-muted hover:text-cursor-text transition-colors"
              >
                <ArrowLeft size={16} />
                {currentModuleIndex === 0 && currentStepIndex === 0 ? 'Exit' : 'Back'}
              </button>
              
              <button
                onClick={handleNext}
                disabled={!canProceed()}
                className="flex items-center gap-2 bg-cursor-accent text-white px-6 py-2 rounded hover:bg-cursor-accent/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {currentModuleIndex === onboardingModules.length - 1 && currentStepIndex === currentModule.steps.length - 1 
                  ? 'Complete Onboarding' 
                  : 'Next'
                }
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};