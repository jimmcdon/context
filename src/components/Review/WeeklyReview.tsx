import React, { useState, useCallback } from 'react';
import { 
  CheckCircle, 
  Circle, 
  Calendar, 
  Target, 
  Lightbulb, 
  Clock,
  ArrowRight,
  ArrowLeft,
  X
} from 'lucide-react';

interface WeeklyReviewProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

type ReviewStep = 'get-clear' | 'get-current' | 'get-creative' | 'complete';

interface ReviewChecklist {
  getClear: {
    collectPapers: boolean;
    processInbox: boolean;
    emptyHead: boolean;
  };
  getCurrent: {
    reviewNextActions: boolean;
    reviewCalendar: boolean;
    reviewWaitingFor: boolean;
    reviewProjects: boolean;
  };
  getCreative: {
    reviewSomedayMaybe: boolean;
    addNewIdeas: boolean;
    reviewGoals: boolean;
  };
}

export const WeeklyReview: React.FC<WeeklyReviewProps> = ({
  isOpen,
  onClose,
  onComplete
}) => {
  const [currentStep, setCurrentStep] = useState<ReviewStep>('get-clear');
  const [checklist, setChecklist] = useState<ReviewChecklist>({
    getClear: {
      collectPapers: false,
      processInbox: false,
      emptyHead: false
    },
    getCurrent: {
      reviewNextActions: false,
      reviewCalendar: false,
      reviewWaitingFor: false,
      reviewProjects: false
    },
    getCreative: {
      reviewSomedayMaybe: false,
      addNewIdeas: false,
      reviewGoals: false
    }
  });

  const [notes, setNotes] = useState('');
  const [startTime] = useState(new Date());

  const handleChecklistChange = useCallback((section: keyof ReviewChecklist, item: string) => {
    setChecklist(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [item]: !prev[section][item as keyof typeof prev[typeof section]]
      }
    }));
  }, []);

  const getStepProgress = (step: ReviewStep) => {
    switch (step) {
      case 'get-clear':
        const clearItems = Object.values(checklist.getClear);
        return clearItems.filter(Boolean).length / clearItems.length;
      case 'get-current':
        const currentItems = Object.values(checklist.getCurrent);
        return currentItems.filter(Boolean).length / currentItems.length;
      case 'get-creative':
        const creativeItems = Object.values(checklist.getCreative);
        return creativeItems.filter(Boolean).length / creativeItems.length;
      default:
        return 0;
    }
  };

  const canProceed = () => {
    return getStepProgress(currentStep) === 1;
  };

  const handleNext = () => {
    if (currentStep === 'get-clear') {
      setCurrentStep('get-current');
    } else if (currentStep === 'get-current') {
      setCurrentStep('get-creative');
    } else if (currentStep === 'get-creative') {
      setCurrentStep('complete');
    }
  };

  const handleBack = () => {
    if (currentStep === 'get-current') {
      setCurrentStep('get-clear');
    } else if (currentStep === 'get-creative') {
      setCurrentStep('get-current');
    } else if (currentStep === 'complete') {
      setCurrentStep('get-creative');
    }
  };

  const handleComplete = () => {
    const duration = Math.round((new Date().getTime() - startTime.getTime()) / 1000 / 60);
    console.log('Weekly review completed in', duration, 'minutes');
    onComplete();
    onClose();
  };

  const renderGetClearStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <Target size={48} className="text-cursor-accent mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-cursor-text mb-2">Get Clear</h3>
        <p className="text-cursor-text-muted">
          Collect and process everything that's accumulated since your last review
        </p>
      </div>

      <div className="space-y-4">
        {[
          { key: 'collectPapers', label: 'Collect loose papers and materials', description: 'Gather any physical items that need processing' },
          { key: 'processInbox', label: 'Get "Inbox" to zero', description: 'Process all items in your capture system' },
          { key: 'emptyHead', label: 'Empty your head', description: 'Capture any new thoughts or commitments' }
        ].map((item) => (
          <label
            key={item.key}
            className="flex items-start gap-3 p-4 bg-cursor-bg rounded-lg cursor-pointer hover:bg-cursor-border transition-colors"
          >
            <button
              onClick={() => handleChecklistChange('getClear', item.key)}
              className="mt-0.5"
            >
              {checklist.getClear[item.key as keyof typeof checklist.getClear] ? (
                <CheckCircle size={20} className="text-green-400" />
              ) : (
                <Circle size={20} className="text-cursor-text-muted" />
              )}
            </button>
            <div className="flex-1">
              <div className="font-medium text-cursor-text">{item.label}</div>
              <div className="text-sm text-cursor-text-muted">{item.description}</div>
            </div>
          </label>
        ))}
      </div>
    </div>
  );

  const renderGetCurrentStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <Calendar size={48} className="text-cursor-accent mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-cursor-text mb-2">Get Current</h3>
        <p className="text-cursor-text-muted">
          Review and update all your lists and commitments
        </p>
      </div>

      <div className="space-y-4">
        {[
          { key: 'reviewNextActions', label: 'Review "Next Actions" lists', description: 'Update and mark off completed actions' },
          { key: 'reviewCalendar', label: 'Review past and upcoming calendar', description: 'Process any new actions from meetings' },
          { key: 'reviewWaitingFor', label: 'Review "Waiting For" list', description: 'Follow up on delegated items' },
          { key: 'reviewProjects', label: 'Review "Projects" list', description: 'Ensure each project has a next action' }
        ].map((item) => (
          <label
            key={item.key}
            className="flex items-start gap-3 p-4 bg-cursor-bg rounded-lg cursor-pointer hover:bg-cursor-border transition-colors"
          >
            <button
              onClick={() => handleChecklistChange('getCurrent', item.key)}
              className="mt-0.5"
            >
              {checklist.getCurrent[item.key as keyof typeof checklist.getCurrent] ? (
                <CheckCircle size={20} className="text-green-400" />
              ) : (
                <Circle size={20} className="text-cursor-text-muted" />
              )}
            </button>
            <div className="flex-1">
              <div className="font-medium text-cursor-text">{item.label}</div>
              <div className="text-sm text-cursor-text-muted">{item.description}</div>
            </div>
          </label>
        ))}
      </div>
    </div>
  );

  const renderGetCreativeStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <Lightbulb size={48} className="text-cursor-accent mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-cursor-text mb-2">Get Creative</h3>
        <p className="text-cursor-text-muted">
          Think bigger picture and explore new possibilities
        </p>
      </div>

      <div className="space-y-4">
        {[
          { key: 'reviewSomedayMaybe', label: 'Review "Someday/Maybe" list', description: 'Consider activating any interesting ideas' },
          { key: 'addNewIdeas', label: 'Add new creative ideas', description: 'Brainstorm and capture new possibilities' },
          { key: 'reviewGoals', label: 'Review higher horizons', description: 'Check alignment with bigger goals and vision' }
        ].map((item) => (
          <label
            key={item.key}
            className="flex items-start gap-3 p-4 bg-cursor-bg rounded-lg cursor-pointer hover:bg-cursor-border transition-colors"
          >
            <button
              onClick={() => handleChecklistChange('getCreative', item.key)}
              className="mt-0.5"
            >
              {checklist.getCreative[item.key as keyof typeof checklist.getCreative] ? (
                <CheckCircle size={20} className="text-green-400" />
              ) : (
                <Circle size={20} className="text-cursor-text-muted" />
              )}
            </button>
            <div className="flex-1">
              <div className="font-medium text-cursor-text">{item.label}</div>
              <div className="text-sm text-cursor-text-muted">{item.description}</div>
            </div>
          </label>
        ))}
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-cursor-text">
          Weekly Review Notes
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Capture insights, wins, challenges, or anything else from this week..."
          className="w-full bg-cursor-bg border border-cursor-border rounded-md p-3 text-cursor-text placeholder-cursor-text-muted resize-none focus:outline-none focus:border-cursor-accent"
          rows={4}
        />
      </div>
    </div>
  );

  const renderCompleteStep = () => {
    const totalProgress = (
      getStepProgress('get-clear') + 
      getStepProgress('get-current') + 
      getStepProgress('get-creative')
    ) / 3;

    const duration = Math.round((new Date().getTime() - startTime.getTime()) / 1000 / 60);

    return (
      <div className="space-y-6 text-center">
        <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle size={32} className="text-green-400" />
        </div>
        
        <div>
          <h3 className="text-xl font-semibold text-cursor-text mb-2">Weekly Review Complete!</h3>
          <p className="text-cursor-text-muted">
            Great job maintaining your trusted system. You've achieved Mind Like Water.
          </p>
        </div>

        <div className="bg-cursor-bg rounded-lg p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-cursor-accent">{Math.round(totalProgress * 100)}%</div>
              <div className="text-sm text-cursor-text-muted">Completion</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-cursor-accent">{duration}m</div>
              <div className="text-sm text-cursor-text-muted">Duration</div>
            </div>
          </div>
          
          {notes && (
            <div className="text-left">
              <div className="text-sm font-medium text-cursor-text mb-2">Your Notes:</div>
              <div className="text-sm text-cursor-text-muted bg-cursor-sidebar rounded p-3">
                {notes}
              </div>
            </div>
          )}
        </div>

        <button
          onClick={handleComplete}
          className="w-full bg-cursor-accent text-white py-3 px-4 rounded-lg hover:bg-cursor-accent/90 transition-colors font-medium"
        >
          Finish Review
        </button>
      </div>
    );
  };

  const getCurrentStepContent = () => {
    switch (currentStep) {
      case 'get-clear':
        return renderGetClearStep();
      case 'get-current':
        return renderGetCurrentStep();
      case 'get-creative':
        return renderGetCreativeStep();
      case 'complete':
        return renderCompleteStep();
      default:
        return renderGetClearStep();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-cursor-sidebar border border-cursor-border rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-cursor-border">
          <div className="flex items-center gap-3">
            <Clock size={20} className="text-cursor-accent" />
            <div>
              <h2 className="text-lg font-semibold text-cursor-text">Weekly Review</h2>
              <p className="text-sm text-cursor-text-muted">
                The Critical Success Factor of GTD
              </p>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="p-1 hover:bg-cursor-bg rounded transition-colors text-cursor-text-muted hover:text-cursor-text"
          >
            <X size={18} />
          </button>
        </div>

        {/* Progress */}
        <div className="p-4 border-b border-cursor-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-cursor-text-muted">Progress</span>
            <span className="text-sm text-cursor-text">
              Step {currentStep === 'get-clear' ? '1' : currentStep === 'get-current' ? '2' : currentStep === 'get-creative' ? '3' : '4'} of 4
            </span>
          </div>
          <div className="flex gap-1">
            {['get-clear', 'get-current', 'get-creative', 'complete'].map((step, index) => (
              <div
                key={step}
                className={`flex-1 h-2 rounded-full ${
                  currentStep === step || (step === 'complete' && currentStep === 'complete')
                    ? 'bg-cursor-accent'
                    : index < ['get-clear', 'get-current', 'get-creative', 'complete'].indexOf(currentStep)
                    ? 'bg-cursor-accent/50'
                    : 'bg-cursor-border'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {getCurrentStepContent()}
        </div>

        {/* Footer */}
        {currentStep !== 'complete' && (
          <div className="flex items-center justify-between p-6 border-t border-cursor-border">
            <button
              onClick={currentStep === 'get-clear' ? onClose : handleBack}
              className="flex items-center gap-2 px-4 py-2 text-cursor-text-muted hover:text-cursor-text transition-colors"
            >
              <ArrowLeft size={16} />
              {currentStep === 'get-clear' ? 'Cancel' : 'Back'}
            </button>

            <button
              onClick={handleNext}
              disabled={!canProceed()}
              className="flex items-center gap-2 bg-cursor-accent text-white px-4 py-2 rounded hover:bg-cursor-accent/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {currentStep === 'get-creative' ? 'Finish' : 'Next'}
              <ArrowRight size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};