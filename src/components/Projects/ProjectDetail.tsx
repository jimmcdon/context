import React, { useState, useCallback } from 'react';
import {
  X,
  Target,
  Calendar,
  Clock,
  CheckCircle,
  Plus,
  ArrowRight,
  Edit,
  Trash2,
  PlayCircle,
  PauseCircle,
  MoreHorizontal
} from 'lucide-react';
import { Project, GTDIdea } from '../../types/gtd';

interface ProjectDetailProps {
  project: Project;
  relatedIdeas: GTDIdea[];
  nextAction?: GTDIdea;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (project: Project) => void;
  onDelete: (projectId: string) => void;
  onUpdateProgress: (projectId: string, progress: number) => void;
  onLinkIdea: (projectId: string, ideaId: string) => void;
  onUnlinkIdea: (projectId: string, ideaId: string) => void;
  onSetNextAction: (projectId: string, ideaId: string) => void;
  onStartAction?: (actionId: string) => void;
  onPauseAction?: (actionId: string) => void;
  onCompleteAction?: (actionId: string) => void;
  availableIdeas: GTDIdea[];
}

export const ProjectDetail: React.FC<ProjectDetailProps> = ({
  project,
  relatedIdeas,
  nextAction,
  isOpen,
  onClose,
  onEdit,
  onDelete,
  onUpdateProgress,
  onLinkIdea,
  onUnlinkIdea,
  onSetNextAction,
  onStartAction,
  onPauseAction,
  onCompleteAction,
  availableIdeas
}) => {
  const [showLinkIdeas, setShowLinkIdeas] = useState(false);
  const [progressInput, setProgressInput] = useState(project.progress || 0);

  const getStatusColor = (status: Project['status']) => {
    switch (status) {
      case 'active': return 'text-green-400';
      case 'on-hold': return 'text-yellow-400';
      case 'completed': return 'text-blue-400';
      case 'cancelled': return 'text-red-400';
      case 'someday-maybe': return 'text-gray-400';
      default: return 'text-cursor-text-muted';
    }
  };

  const getStatusLabel = (status: Project['status']) => {
    switch (status) {
      case 'active': return 'Active';
      case 'on-hold': return 'On Hold';
      case 'completed': return 'Completed';
      case 'cancelled': return 'Cancelled';
      case 'someday-maybe': return 'Someday/Maybe';
      default: return status;
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', { 
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  const handleProgressUpdate = useCallback(() => {
    onUpdateProgress(project.id, progressInput);
  }, [project.id, progressInput, onUpdateProgress]);

  const handleLinkIdea = useCallback((ideaId: string) => {
    onLinkIdea(project.id, ideaId);
    setShowLinkIdeas(false);
  }, [project.id, onLinkIdea]);

  const unlinkedIdeas = availableIdeas.filter(idea => 
    idea.status === 'active' && 
    idea.isActionable && 
    !relatedIdeas.some(related => related.id === idea.id)
  );

  const completedIdeas = relatedIdeas.filter(idea => idea.status === 'completed');
  const activeIdeas = relatedIdeas.filter(idea => idea.status === 'active');
  const waitingIdeas = relatedIdeas.filter(idea => idea.type === 'waiting-for');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-cursor-sidebar border border-cursor-border rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-cursor-border">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-semibold text-cursor-text mb-2">{project.title}</h2>
            <div className="flex items-center gap-3">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)} bg-current/10`}>
                {getStatusLabel(project.status)}
              </span>
              <span className="text-cursor-text-muted text-sm">
                Created {formatDate(project.createdAt)}
              </span>
              {project.dueDate && (
                <span className="text-cursor-text-muted text-sm">
                  Due {formatDate(project.dueDate)}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onEdit(project)}
              className="p-2 hover:bg-cursor-bg rounded-lg transition-colors text-cursor-text-muted hover:text-cursor-text"
              title="Edit project"
            >
              <Edit size={18} />
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-cursor-bg rounded-lg transition-colors text-cursor-text-muted hover:text-cursor-text"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: Project Info */}
            <div className="lg:col-span-2 space-y-6">
              {/* Outcome */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Target size={20} className="text-cursor-accent" />
                  <h3 className="text-lg font-medium text-cursor-text">Successful Outcome</h3>
                </div>
                <p className="text-cursor-text bg-cursor-bg border border-cursor-border rounded-lg p-4">
                  {project.outcome}
                </p>
              </div>

              {/* Description */}
              {project.description && (
                <div>
                  <h3 className="text-lg font-medium text-cursor-text mb-3">Description</h3>
                  <p className="text-cursor-text-muted bg-cursor-bg border border-cursor-border rounded-lg p-4">
                    {project.description}
                  </p>
                </div>
              )}

              {/* Next Action */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <ArrowRight size={20} className="text-green-400" />
                    <h3 className="text-lg font-medium text-cursor-text">Next Action</h3>
                  </div>
                  {nextAction && onStartAction && (
                    <div className="flex items-center gap-2">
                      {nextAction.inProgress ? (
                        <button
                          onClick={() => onPauseAction?.(nextAction.id)}
                          className="flex items-center gap-2 px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded hover:bg-yellow-500/30 transition-colors"
                        >
                          <PauseCircle size={16} />
                          Pause
                        </button>
                      ) : (
                        <button
                          onClick={() => onStartAction(nextAction.id)}
                          className="flex items-center gap-2 px-3 py-1 bg-green-500/20 text-green-400 rounded hover:bg-green-500/30 transition-colors"
                        >
                          <PlayCircle size={16} />
                          Start
                        </button>
                      )}
                    </div>
                  )}
                </div>
                {nextAction ? (
                  <div className="bg-cursor-bg border border-cursor-border rounded-lg p-4">
                    <p className="text-cursor-text mb-2">{nextAction.content}</p>
                    <div className="flex items-center gap-4 text-sm text-cursor-text-muted">
                      {nextAction.contextId && (
                        <span>@{nextAction.contextId}</span>
                      )}
                      {nextAction.estimatedMinutes && (
                        <span>{nextAction.estimatedMinutes} minutes</span>
                      )}
                      {nextAction.energyRequired && (
                        <span>{nextAction.energyRequired} energy</span>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-red-400">
                      <Target size={16} />
                      <span>No next action defined</span>
                    </div>
                    <p className="text-red-400/80 text-sm mt-1">
                      This project needs a clear next action to move forward.
                    </p>
                  </div>
                )}
              </div>

              {/* Active Ideas */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-medium text-cursor-text">
                    Active Ideas ({activeIdeas.length})
                  </h3>
                  <button
                    onClick={() => setShowLinkIdeas(!showLinkIdeas)}
                    className="flex items-center gap-2 px-3 py-1 bg-cursor-accent text-white rounded hover:bg-cursor-accent/90 transition-colors text-sm"
                  >
                    <Plus size={16} />
                    Link Ideas
                  </button>
                </div>

                {showLinkIdeas && (
                  <div className="mb-4 p-3 bg-cursor-bg border border-cursor-border rounded-lg">
                    <h4 className="text-sm font-medium text-cursor-text mb-2">Available Ideas</h4>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {unlinkedIdeas.map(idea => (
                        <button
                          key={idea.id}
                          onClick={() => handleLinkIdea(idea.id)}
                          className="w-full text-left p-2 hover:bg-cursor-sidebar rounded text-sm flex items-center gap-2"
                        >
                          <Plus size={12} className="text-cursor-accent" />
                          <span className="text-cursor-text">{idea.content}</span>
                          {idea.contextId && (
                            <span className="text-cursor-text-muted text-xs">@{idea.contextId}</span>
                          )}
                        </button>
                      ))}
                      {unlinkedIdeas.length === 0 && (
                        <p className="text-cursor-text-muted text-sm">No available ideas to link</p>
                      )}
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  {activeIdeas.map(idea => (
                    <div
                      key={idea.id}
                      className="flex items-center justify-between p-3 bg-cursor-bg border border-cursor-border rounded-lg"
                    >
                      <div className="flex-1">
                        <p className="text-cursor-text">{idea.content}</p>
                        <div className="flex items-center gap-2 text-sm text-cursor-text-muted mt-1">
                          {idea.contextId && <span>@{idea.contextId}</span>}
                          {idea.estimatedMinutes && <span>{idea.estimatedMinutes}m</span>}
                          {idea.isNextAction && (
                            <span className="px-2 py-0.5 bg-green-500/20 text-green-400 rounded text-xs">
                              Next Action
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        {!idea.isNextAction && (
                          <button
                            onClick={() => onSetNextAction(project.id, idea.id)}
                            className="p-1 hover:bg-cursor-sidebar rounded text-cursor-text-muted hover:text-cursor-text"
                            title="Set as next action"
                          >
                            <ArrowRight size={14} />
                          </button>
                        )}
                        <button
                          onClick={() => onUnlinkIdea(project.id, idea.id)}
                          className="p-1 hover:bg-cursor-sidebar rounded text-cursor-text-muted hover:text-cursor-text"
                          title="Unlink from project"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                  {activeIdeas.length === 0 && (
                    <p className="text-cursor-text-muted text-sm bg-cursor-bg border border-cursor-border rounded-lg p-4">
                      No active ideas linked to this project.
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column: Stats & Progress */}
            <div className="space-y-6">
              {/* Progress */}
              <div>
                <h3 className="text-lg font-medium text-cursor-text mb-3">Progress</h3>
                <div className="bg-cursor-bg border border-cursor-border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-cursor-text-muted">Completion</span>
                    <span className="text-cursor-text font-medium">{progressInput}%</span>
                  </div>
                  <div className="w-full bg-cursor-sidebar rounded-full h-2 mb-3">
                    <div 
                      className="bg-cursor-accent rounded-full h-2 transition-all duration-300"
                      style={{ width: `${progressInput}%` }}
                    />
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={progressInput}
                      onChange={(e) => setProgressInput(parseInt(e.target.value))}
                      className="flex-1"
                    />
                    <button
                      onClick={handleProgressUpdate}
                      className="px-3 py-1 bg-cursor-accent text-white rounded text-sm hover:bg-cursor-accent/90 transition-colors"
                    >
                      Update
                    </button>
                  </div>
                </div>
              </div>

              {/* Statistics */}
              <div>
                <h3 className="text-lg font-medium text-cursor-text mb-3">Statistics</h3>
                <div className="bg-cursor-bg border border-cursor-border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-cursor-text-muted">Total Ideas</span>
                    <span className="text-cursor-text font-medium">{relatedIdeas.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-cursor-text-muted">Completed</span>
                    <span className="text-green-400 font-medium">{completedIdeas.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-cursor-text-muted">Active</span>
                    <span className="text-blue-400 font-medium">{activeIdeas.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-cursor-text-muted">Waiting For</span>
                    <span className="text-yellow-400 font-medium">{waitingIdeas.length}</span>
                  </div>
                  {project.estimatedHours && (
                    <>
                      <hr className="border-cursor-border" />
                      <div className="flex items-center justify-between">
                        <span className="text-cursor-text-muted">Estimated</span>
                        <span className="text-cursor-text font-medium">{project.estimatedHours}h</span>
                      </div>
                      {project.actualHours && (
                        <div className="flex items-center justify-between">
                          <span className="text-cursor-text-muted">Actual</span>
                          <span className="text-cursor-text font-medium">{project.actualHours}h</span>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Completed Ideas */}
              {completedIdeas.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium text-cursor-text mb-3">
                    Completed Ideas ({completedIdeas.length})
                  </h3>
                  <div className="bg-cursor-bg border border-cursor-border rounded-lg p-4">
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {completedIdeas.map(idea => (
                        <div key={idea.id} className="flex items-center gap-2 text-sm">
                          <CheckCircle size={12} className="text-green-400 flex-shrink-0" />
                          <span className="text-cursor-text-muted truncate">{idea.content}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};