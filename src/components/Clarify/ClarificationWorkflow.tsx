import React, { useState, useCallback } from 'react';
import { 
  ArrowLeft, 
  CheckCircle, 
  Calendar, 
  Users, 
  FolderOpen, 
  Lightbulb,
  Trash2,
  Clock,
  Target,
  Zap,
  Brain,
  Battery,
  Coffee,
  Timer
} from 'lucide-react';
import { GTDItem, ProcessingDecision } from '../../types/gtd';
import { TwoMinuteTimer } from '../Timer/TwoMinuteTimer';

interface ClarificationWorkflowProps {
  item: GTDItem;
  onDecision: (decision: ProcessingDecision) => void;
  onCancel: () => void;
}

type WorkflowStep = 'actionable' | 'action-type' | 'time-energy' | 'context' | 'confirm';

export const ClarificationWorkflow: React.FC<ClarificationWorkflowProps> = ({
  item,
  onDecision,
  onCancel
}) => {
  const [currentStep, setCurrentStep] = useState<WorkflowStep>('actionable');
  const [decision, setDecision] = useState<Partial<ProcessingDecision>>({
    itemId: item.id,
    processedAt: new Date()
  });
  const [estimatedMinutes, setEstimatedMinutes] = useState<number | undefined>(undefined);
  const [energyRequired, setEnergyRequired] = useState<'high' | 'medium' | 'low' | 'zombie'>('medium');
  const [showTwoMinuteTimer, setShowTwoMinuteTimer] = useState(false);

  const handleActionableDecision = useCallback((isActionable: boolean) => {
    setDecision(prev => ({ ...prev, isActionable }));
    if (isActionable) {
      setCurrentStep('action-type');
    } else {
      // Not actionable - determine if reference, someday/maybe, or trash
      setCurrentStep('confirm');
    }
  }, []);

  const handleActionType = useCallback((actionType: 'do-now' | 'schedule' | 'delegate' | 'defer') => {
    setDecision(prev => ({ 
      ...prev, 
      actionType,
      resultType: actionType === 'defer' ? 'action' : 'action'
    }));
    
    if (actionType === 'do-now') {
      setShowTwoMinuteTimer(true);
    } else {
      setCurrentStep('time-energy');
    }
  }, []);

  const handleResultType = useCallback((resultType: 'reference' | 'someday-maybe' | 'trash') => {
    setDecision(prev => ({ ...prev, resultType }));
    setCurrentStep('confirm');
  }, []);


  const handleTimeEnergyComplete = useCallback(() => {
    // Update the item with time and energy values
    setDecision(prev => ({ 
      ...prev, 
      estimatedMinutes,
      energyRequired 
    }));
    setCurrentStep('context');
  }, [estimatedMinutes, energyRequired]);

  const handleTwoMinuteTimerComplete = useCallback((success: boolean, timeSpent: number) => {
    setShowTwoMinuteTimer(false);
    
    if (success) {
      // Task completed within 2 minutes - mark as done
      onDecision({
        ...decision,
        actionType: 'do-now',
        isActionable: true,
        estimatedMinutes: Math.round(timeSpent / 60),
        notes: `Completed in ${Math.round(timeSpent / 60)} minutes using 2-minute rule`
      } as ProcessingDecision);
    } else {
      // Task not completed - continue with normal workflow
      setCurrentStep('time-energy');
    }
  }, [decision, onDecision]);

  const handleContextSelection = useCallback((contextId: string) => {
    setDecision(prev => ({ ...prev, contextId }));
    setCurrentStep('confirm');
  }, []);

  const handleConfirm = useCallback(() => {
    onDecision(decision as ProcessingDecision);
  }, [decision, onDecision]);

  const handleBack = useCallback(() => {
    switch (currentStep) {
      case 'action-type':
        setCurrentStep('actionable');
        break;
      case 'time-energy':
        setCurrentStep('action-type');
        break;
      case 'context':
        setCurrentStep('time-energy');
        break;
      case 'confirm':
        if (decision.isActionable && decision.actionType !== 'do-now') {
          setCurrentStep('context');
        } else if (decision.isActionable) {
          setCurrentStep('action-type');
        } else {
          setCurrentStep('actionable');
        }
        break;
    }
  }, [currentStep, decision]);

  const renderActionableStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-semibold text-cursor-text mb-2">
          Is this actionable?
        </h3>
        <p className="text-cursor-text-muted">
          Can you do something about this right now?
        </p>
      </div>

      <div className="bg-cursor-bg rounded-lg p-4 border border-cursor-border">
        <p className="text-cursor-text">{item.content}</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => handleActionableDecision(false)}
          className="flex flex-col items-center gap-3 p-6 bg-cursor-bg border border-cursor-border rounded-lg hover:border-cursor-accent transition-colors"
        >
          <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center">
            <Target size={24} className="text-red-400" />
          </div>
          <div className="text-center">
            <div className="font-medium text-cursor-text">No</div>
            <div className="text-sm text-cursor-text-muted">Not actionable</div>
          </div>
        </button>

        <button
          onClick={() => handleActionableDecision(true)}
          className="flex flex-col items-center gap-3 p-6 bg-cursor-bg border border-cursor-border rounded-lg hover:border-cursor-accent transition-colors"
        >
          <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
            <CheckCircle size={24} className="text-green-400" />
          </div>
          <div className="text-center">
            <div className="font-medium text-cursor-text">Yes</div>
            <div className="text-sm text-cursor-text-muted">I can act on this</div>
          </div>
        </button>
      </div>
    </div>
  );

  const renderNonActionableStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-semibold text-cursor-text mb-2">
          What should we do with this?
        </h3>
        <p className="text-cursor-text-muted">
          Since it's not actionable, where does it belong?
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3">
        <button
          onClick={() => handleResultType('reference')}
          className="flex items-center gap-4 p-4 bg-cursor-bg border border-cursor-border rounded-lg hover:border-cursor-accent transition-colors text-left"
        >
          <FolderOpen size={20} className="text-blue-400" />
          <div>
            <div className="font-medium text-cursor-text">Reference</div>
            <div className="text-sm text-cursor-text-muted">Keep for future reference</div>
          </div>
        </button>

        <button
          onClick={() => handleResultType('someday-maybe')}
          className="flex items-center gap-4 p-4 bg-cursor-bg border border-cursor-border rounded-lg hover:border-cursor-accent transition-colors text-left"
        >
          <Lightbulb size={20} className="text-yellow-400" />
          <div>
            <div className="font-medium text-cursor-text">Someday/Maybe</div>
            <div className="text-sm text-cursor-text-muted">Maybe do this later</div>
          </div>
        </button>

        <button
          onClick={() => handleResultType('trash')}
          className="flex items-center gap-4 p-4 bg-cursor-bg border border-cursor-border rounded-lg hover:border-cursor-accent transition-colors text-left"
        >
          <Trash2 size={20} className="text-red-400" />
          <div>
            <div className="font-medium text-cursor-text">Trash</div>
            <div className="text-sm text-cursor-text-muted">Delete - no longer needed</div>
          </div>
        </button>
      </div>
    </div>
  );

  const renderActionTypeStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-semibold text-cursor-text mb-2">
          How should we handle this action?
        </h3>
        <p className="text-cursor-text-muted">
          What's the best approach for this task?
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => handleActionType('do-now')}
          className="flex flex-col items-center gap-3 p-6 bg-cursor-bg border border-cursor-border rounded-lg hover:border-cursor-accent transition-colors"
        >
          <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
            <CheckCircle size={24} className="text-green-400" />
          </div>
          <div className="text-center">
            <div className="font-medium text-cursor-text">Do Now</div>
            <div className="text-sm text-cursor-text-muted">Takes &lt; 2 minutes</div>
          </div>
        </button>

        <button
          onClick={() => handleActionType('schedule')}
          className="flex flex-col items-center gap-3 p-6 bg-cursor-bg border border-cursor-border rounded-lg hover:border-cursor-accent transition-colors"
        >
          <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center">
            <Calendar size={24} className="text-blue-400" />
          </div>
          <div className="text-center">
            <div className="font-medium text-cursor-text">Schedule</div>
            <div className="text-sm text-cursor-text-muted">Time-specific</div>
          </div>
        </button>

        <button
          onClick={() => handleActionType('delegate')}
          className="flex flex-col items-center gap-3 p-6 bg-cursor-bg border border-cursor-border rounded-lg hover:border-cursor-accent transition-colors"
        >
          <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center">
            <Users size={24} className="text-purple-400" />
          </div>
          <div className="text-center">
            <div className="font-medium text-cursor-text">Delegate</div>
            <div className="text-sm text-cursor-text-muted">Someone else can do it</div>
          </div>
        </button>

        <button
          onClick={() => handleActionType('defer')}
          className="flex flex-col items-center gap-3 p-6 bg-cursor-bg border border-cursor-border rounded-lg hover:border-cursor-accent transition-colors"
        >
          <div className="w-12 h-12 bg-yellow-500/20 rounded-full flex items-center justify-center">
            <Clock size={24} className="text-yellow-400" />
          </div>
          <div className="text-center">
            <div className="font-medium text-cursor-text">Defer</div>
            <div className="text-sm text-cursor-text-muted">Do later</div>
          </div>
        </button>
      </div>
    </div>
  );

  const renderTimeEnergyStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-semibold text-cursor-text mb-2">
          Time and Energy Required
        </h3>
        <p className="text-cursor-text-muted">
          How much time and energy will this take?
        </p>
      </div>

      <div className="space-y-6">
        {/* Time Estimation */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Clock size={18} className="text-cursor-accent" />
            <label className="text-sm font-medium text-cursor-text">
              Estimated Time (minutes)
            </label>
          </div>
          <div className="grid grid-cols-4 gap-2 mb-3">
            {[5, 15, 30, 60].map((minutes) => (
              <button
                key={minutes}
                onClick={() => setEstimatedMinutes(minutes)}
                className={`p-2 rounded border text-sm transition-colors ${
                  estimatedMinutes === minutes
                    ? 'bg-cursor-accent text-white border-cursor-accent'
                    : 'bg-cursor-bg border-cursor-border hover:border-cursor-accent text-cursor-text'
                }`}
              >
                {minutes}m
              </button>
            ))}
          </div>
          <input
            type="number"
            value={estimatedMinutes || ''}
            onChange={(e) => setEstimatedMinutes(e.target.value ? parseInt(e.target.value) : undefined)}
            placeholder="Custom time in minutes"
            className="w-full bg-cursor-bg border border-cursor-border rounded px-3 py-2 text-cursor-text placeholder-cursor-text-muted focus:outline-none focus:border-cursor-accent"
          />
        </div>

        {/* Energy Level */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Zap size={18} className="text-cursor-accent" />
            <label className="text-sm font-medium text-cursor-text">
              Energy Required
            </label>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setEnergyRequired('high')}
              className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                energyRequired === 'high'
                  ? 'bg-cursor-accent text-white border-cursor-accent'
                  : 'bg-cursor-bg border-cursor-border hover:border-cursor-accent text-cursor-text'
              }`}
            >
              <Brain size={20} className={energyRequired === 'high' ? 'text-white' : 'text-purple-400'} />
              <div className="text-left">
                <div className="font-medium">High Focus</div>
                <div className="text-xs opacity-75">Deep thinking required</div>
              </div>
            </button>
            
            <button
              onClick={() => setEnergyRequired('medium')}
              className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                energyRequired === 'medium'
                  ? 'bg-cursor-accent text-white border-cursor-accent'
                  : 'bg-cursor-bg border-cursor-border hover:border-cursor-accent text-cursor-text'
              }`}
            >
              <Battery size={20} className={energyRequired === 'medium' ? 'text-white' : 'text-green-400'} />
              <div className="text-left">
                <div className="font-medium">Normal</div>
                <div className="text-xs opacity-75">Standard focus</div>
              </div>
            </button>
            
            <button
              onClick={() => setEnergyRequired('low')}
              className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                energyRequired === 'low'
                  ? 'bg-cursor-accent text-white border-cursor-accent'
                  : 'bg-cursor-bg border-cursor-border hover:border-cursor-accent text-cursor-text'
              }`}
            >
              <Coffee size={20} className={energyRequired === 'low' ? 'text-white' : 'text-yellow-400'} />
              <div className="text-left">
                <div className="font-medium">Low Energy</div>
                <div className="text-xs opacity-75">Simple, routine task</div>
              </div>
            </button>
            
            <button
              onClick={() => setEnergyRequired('zombie')}
              className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                energyRequired === 'zombie'
                  ? 'bg-cursor-accent text-white border-cursor-accent'
                  : 'bg-cursor-bg border-cursor-border hover:border-cursor-accent text-cursor-text'
              }`}
            >
              <Coffee size={20} className={energyRequired === 'zombie' ? 'text-white' : 'text-gray-400'} />
              <div className="text-left">
                <div className="font-medium">Zombie Mode</div>
                <div className="text-xs opacity-75">Mindless work</div>
              </div>
            </button>
          </div>
        </div>

        {/* Continue Button */}
        <button
          onClick={handleTimeEnergyComplete}
          className="w-full bg-cursor-accent text-white py-3 px-4 rounded-lg hover:bg-cursor-accent/90 transition-colors font-medium"
        >
          Continue to Context
        </button>
      </div>
    </div>
  );

  const renderContextStep = () => {
    const contexts = [
      { id: 'calls', name: '@Calls', icon: '📞', color: 'bg-blue-500' },
      { id: 'computer', name: '@Computer', icon: '💻', color: 'bg-green-500' },
      { id: 'errands', name: '@Errands', icon: '🚗', color: 'bg-yellow-500' },
      { id: 'home', name: '@Home', icon: '🏠', color: 'bg-purple-500' },
      { id: 'office', name: '@Office', icon: '🏢', color: 'bg-red-500' },
      { id: 'agenda', name: '@Agenda', icon: '👥', color: 'bg-indigo-500' }
    ];

    return (
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="text-xl font-semibold text-cursor-text mb-2">
            What context is needed?
          </h3>
          <p className="text-cursor-text-muted">
            Where or when can you do this action?
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {contexts.map((context) => (
            <button
              key={context.id}
              onClick={() => handleContextSelection(context.id)}
              className="flex items-center gap-3 p-4 bg-cursor-bg border border-cursor-border rounded-lg hover:border-cursor-accent transition-colors text-left"
            >
              <div className={`w-8 h-8 ${context.color} rounded-full flex items-center justify-center text-sm`}>
                {context.icon}
              </div>
              <div className="font-medium text-cursor-text">{context.name}</div>
            </button>
          ))}
        </div>
      </div>
    );
  };

  const renderConfirmStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-semibold text-cursor-text mb-2">
          Confirm Your Decision
        </h3>
        <p className="text-cursor-text-muted">
          Review and confirm how this item will be processed
        </p>
      </div>

      <div className="bg-cursor-bg rounded-lg p-4 border border-cursor-border">
        <p className="text-cursor-text mb-4">{item.content}</p>
        
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-cursor-text-muted">Actionable:</span>
            <span className="text-cursor-text">{decision.isActionable ? 'Yes' : 'No'}</span>
          </div>
          
          {decision.actionType && (
            <div className="flex justify-between">
              <span className="text-cursor-text-muted">Action Type:</span>
              <span className="text-cursor-text capitalize">{decision.actionType.replace('-', ' ')}</span>
            </div>
          )}
          
          {decision.contextId && (
            <div className="flex justify-between">
              <span className="text-cursor-text-muted">Context:</span>
              <span className="text-cursor-text">@{decision.contextId}</span>
            </div>
          )}
          
          {decision.resultType && (
            <div className="flex justify-between">
              <span className="text-cursor-text-muted">Goes to:</span>
              <span className="text-cursor-text capitalize">{decision.resultType.replace('-', ' ')}</span>
            </div>
          )}
          
          {estimatedMinutes && (
            <div className="flex justify-between">
              <span className="text-cursor-text-muted">Estimated Time:</span>
              <span className="text-cursor-text">{estimatedMinutes} minutes</span>
            </div>
          )}
          
          {energyRequired && (
            <div className="flex justify-between">
              <span className="text-cursor-text-muted">Energy Required:</span>
              <span className="text-cursor-text capitalize">{energyRequired === 'zombie' ? 'Zombie Mode' : energyRequired}</span>
            </div>
          )}
        </div>
      </div>

      <button
        onClick={handleConfirm}
        className="w-full bg-cursor-accent text-white py-3 px-4 rounded-lg hover:bg-cursor-accent/90 transition-colors font-medium"
      >
        Process Item
      </button>
    </div>
  );

  const getCurrentStepContent = () => {
    switch (currentStep) {
      case 'actionable':
        return decision.isActionable === false ? renderNonActionableStep() : renderActionableStep();
      case 'action-type':
        return renderActionTypeStep();
      case 'time-energy':
        return renderTimeEnergyStep();
      case 'context':
        return renderContextStep();
      case 'confirm':
        return renderConfirmStep();
      default:
        return renderActionableStep();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-cursor-sidebar border border-cursor-border rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-cursor-border">
          <div>
            <h2 className="text-lg font-semibold text-cursor-text">Clarify Item</h2>
            <p className="text-sm text-cursor-text-muted">Process this item using GTD methodology</p>
          </div>
          
          {/* Progress indicator */}
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${currentStep === 'actionable' ? 'bg-cursor-accent' : 'bg-cursor-border'}`} />
            <div className={`w-2 h-2 rounded-full ${currentStep === 'action-type' ? 'bg-cursor-accent' : 'bg-cursor-border'}`} />
            <div className={`w-2 h-2 rounded-full ${currentStep === 'time-energy' ? 'bg-cursor-accent' : 'bg-cursor-border'}`} />
            <div className={`w-2 h-2 rounded-full ${currentStep === 'context' ? 'bg-cursor-accent' : 'bg-cursor-border'}`} />
            <div className={`w-2 h-2 rounded-full ${currentStep === 'confirm' ? 'bg-cursor-accent' : 'bg-cursor-border'}`} />
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {getCurrentStepContent()}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-cursor-border">
          <button
            onClick={currentStep === 'actionable' ? onCancel : handleBack}
            className="flex items-center gap-2 px-4 py-2 text-cursor-text-muted hover:text-cursor-text transition-colors"
          >
            <ArrowLeft size={16} />
            {currentStep === 'actionable' ? 'Cancel' : 'Back'}
          </button>

          <div className="text-sm text-cursor-text-muted">
            Step {currentStep === 'actionable' ? '1' : currentStep === 'action-type' ? '2' : currentStep === 'time-energy' ? '3' : currentStep === 'context' ? '4' : '5'} of 5
          </div>
        </div>
      </div>

      {/* Two Minute Timer */}
      <TwoMinuteTimer
        isOpen={showTwoMinuteTimer}
        onClose={() => setShowTwoMinuteTimer(false)}
        onComplete={handleTwoMinuteTimerComplete}
        initialIdea={item.content}
      />
    </div>
  );
};