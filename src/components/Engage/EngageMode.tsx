import React, { useState, useCallback } from 'react';
import { 
  MapPin, 
  Clock, 
  Battery, 
  Play,
  Filter,
  CheckCircle,
  AlertCircle,
  Calendar,
  Zap,
  Brain,
  Coffee
} from 'lucide-react';
import { useGTDStore } from '../../store/gtdStore';

interface EngageModeProps {
  isOpen: boolean;
  onClose: () => void;
}

const TIME_OPTIONS = [
  { value: 5, label: '5 min' },
  { value: 15, label: '15 min' },
  { value: 30, label: '30 min' },
  { value: 60, label: '1 hour' },
  { value: 120, label: '2 hours' },
  { value: 999, label: 'No limit' }
];

const ENERGY_OPTIONS = [
  { value: 'high', label: 'High Focus', icon: Brain, color: 'text-purple-400' },
  { value: 'medium', label: 'Normal', icon: Battery, color: 'text-green-400' },
  { value: 'low', label: 'Low Energy', icon: Coffee, color: 'text-yellow-400' },
  { value: 'zombie', label: 'Zombie Mode', icon: Coffee, color: 'text-gray-400' }
];

export const EngageMode: React.FC<EngageModeProps> = ({ isOpen, onClose }) => {
  const { 
    contexts,
    getFilteredItems,
    setEngageDecision,
    completeItem,
    items
  } = useGTDStore();

  const [selectedContexts, setSelectedContexts] = useState<string[]>([]);
  const [timeAvailable, setTimeAvailable] = useState(30);
  const [energyLevel, setEnergyLevel] = useState<'high' | 'medium' | 'low' | 'zombie'>('medium');
  const [showResults, setShowResults] = useState(false);

  const filteredItems = showResults ? getFilteredItems() : [];
  const totalActions = items.filter(item => item.isNextAction && item.status === 'active').length;

  const handleContextToggle = useCallback((contextId: string) => {
    setSelectedContexts(prev => 
      prev.includes(contextId) 
        ? prev.filter(id => id !== contextId)
        : [...prev, contextId]
    );
  }, []);

  const handleEngage = useCallback(() => {
    if (selectedContexts.length === 0) return;
    
    setEngageDecision({
      whereAmI: selectedContexts,
      timeAvailable,
      energyLevel
    });
    setShowResults(true);
  }, [selectedContexts, timeAvailable, energyLevel, setEngageDecision]);

  const handleReset = useCallback(() => {
    setShowResults(false);
    setSelectedContexts([]);
    setTimeAvailable(30);
    setEnergyLevel('medium');
    setEngageDecision(null);
  }, [setEngageDecision]);

  const handleCompleteItem = useCallback((itemId: string) => {
    completeItem(itemId);
  }, [completeItem]);

  const getEnergyIcon = (energy?: string) => {
    switch (energy) {
      case 'high': return <Brain size={14} className="text-purple-400" />;
      case 'medium': return <Battery size={14} className="text-green-400" />;
      case 'low': return <Coffee size={14} className="text-yellow-400" />;
      case 'zombie': return <Coffee size={14} className="text-gray-400" />;
      default: return null;
    }
  };

  const formatTime = (minutes?: number) => {
    if (!minutes) return '';
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-cursor-sidebar border border-cursor-border rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-cursor-border">
          <div>
            <h2 className="text-xl font-semibold text-cursor-text">What should I do now?</h2>
            <p className="text-sm text-cursor-text-muted">
              Filter your {totalActions} available actions to find the perfect task
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-cursor-bg rounded-lg transition-colors text-cursor-text-muted hover:text-cursor-text"
          >
            ✕
          </button>
        </div>

        {!showResults ? (
          <div className="flex-1 overflow-auto p-6">
            {/* Step 1: Context */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <MapPin size={20} className="text-cursor-accent" />
                <h3 className="text-lg font-medium text-cursor-text">Where are you?</h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {contexts.map((context) => (
                  <button
                    key={context.id}
                    onClick={() => handleContextToggle(context.id)}
                    className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                      selectedContexts.includes(context.id)
                        ? 'bg-cursor-accent text-white border-cursor-accent'
                        : 'bg-cursor-bg border-cursor-border hover:border-cursor-accent text-cursor-text'
                    }`}
                  >
                    <span className="text-lg">{context.icon}</span>
                    <span className="font-medium">{context.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Step 2: Time */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <Clock size={20} className="text-cursor-accent" />
                <h3 className="text-lg font-medium text-cursor-text">How much time do you have?</h3>
              </div>
              <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                {TIME_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setTimeAvailable(option.value)}
                    className={`p-3 rounded-lg border transition-colors ${
                      timeAvailable === option.value
                        ? 'bg-cursor-accent text-white border-cursor-accent'
                        : 'bg-cursor-bg border-cursor-border hover:border-cursor-accent text-cursor-text'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Step 3: Energy */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <Zap size={20} className="text-cursor-accent" />
                <h3 className="text-lg font-medium text-cursor-text">What's your energy level?</h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {ENERGY_OPTIONS.map((option) => {
                  const Icon = option.icon;
                  return (
                    <button
                      key={option.value}
                      onClick={() => setEnergyLevel(option.value as any)}
                      className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                        energyLevel === option.value
                          ? 'bg-cursor-accent text-white border-cursor-accent'
                          : 'bg-cursor-bg border-cursor-border hover:border-cursor-accent text-cursor-text'
                      }`}
                    >
                      <Icon size={20} className={energyLevel === option.value ? 'text-white' : option.color} />
                      <span className="font-medium">{option.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Engage Button */}
            <div className="flex justify-center">
              <button
                onClick={handleEngage}
                disabled={selectedContexts.length === 0}
                className="flex items-center gap-2 bg-cursor-accent text-white px-8 py-3 rounded-lg hover:bg-cursor-accent/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Play size={20} />
                <span className="font-medium">Show Me What To Do</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-auto p-6">
            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-medium text-cursor-text">
                  Your Actions Right Now
                </h3>
                <p className="text-sm text-cursor-text-muted">
                  Showing {filteredItems.length} of {totalActions} actions
                </p>
              </div>
              <button
                onClick={handleReset}
                className="flex items-center gap-2 px-4 py-2 bg-cursor-bg border border-cursor-border rounded-lg hover:border-cursor-accent transition-colors text-cursor-text"
              >
                <Filter size={16} />
                <span>Change Filters</span>
              </button>
            </div>

            {/* Filtered Actions */}
            {filteredItems.length > 0 ? (
              <div className="space-y-3">
                {filteredItems.slice(0, 15).map((item) => (
                  <div
                    key={item.id}
                    className="bg-cursor-bg rounded-lg p-4 hover:bg-cursor-border transition-colors group"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-cursor-text mb-2">{item.content}</p>
                        <div className="flex items-center gap-4 text-sm">
                          <span className="text-cursor-text-muted">@{item.contextId}</span>
                          {item.estimatedMinutes && (
                            <span className="flex items-center gap-1 text-cursor-text-muted">
                              <Clock size={12} />
                              {formatTime(item.estimatedMinutes)}
                            </span>
                          )}
                          {item.energyRequired && (
                            <span className="flex items-center gap-1">
                              {getEnergyIcon(item.energyRequired)}
                            </span>
                          )}
                          {item.dueDate && (
                            <span className="flex items-center gap-1 text-cursor-text-muted">
                              <Calendar size={12} />
                              {new Date(item.dueDate).toLocaleDateString()}
                            </span>
                          )}
                          {item.isUrgent && (
                            <span className="flex items-center gap-1 text-orange-400">
                              <AlertCircle size={12} />
                              Urgent
                            </span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => handleCompleteItem(item.id)}
                        className="opacity-0 group-hover:opacity-100 p-2 hover:bg-cursor-bg rounded transition-all text-green-400"
                        title="Mark complete"
                      >
                        <CheckCircle size={20} />
                      </button>
                    </div>
                  </div>
                ))}
                {filteredItems.length > 15 && (
                  <div className="text-center text-cursor-text-muted text-sm">
                    Showing top 15 of {filteredItems.length} actions
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-cursor-text-muted mb-4">
                  No actions match your current filters.
                </p>
                <button
                  onClick={handleReset}
                  className="text-cursor-accent hover:underline"
                >
                  Try different filters
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};