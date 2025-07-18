import React from 'react';
import {
  Target,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  MoreHorizontal,
  ArrowRight,
  Pause,
  Play
} from 'lucide-react';
import { Project, GTDIdea } from '../../types/gtd';

interface ProjectCardProps {
  project: Project;
  nextAction?: GTDIdea;
  relatedIdeas: GTDIdea[];
  onEdit: (project: Project) => void;
  onDelete: (projectId: string) => void;
  onViewDetails: (project: Project) => void;
  onStartNextAction?: (actionId: string) => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  nextAction,
  relatedIdeas,
  onEdit,
  onDelete,
  onViewDetails,
  onStartNextAction
}) => {
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

  const getHorizonLabel = (horizon: number) => {
    const horizons = {
      1: 'Projects',
      2: 'Areas of Focus',
      3: '1-2 Year Goals',
      4: '3-5 Year Vision',
      5: 'Purpose & Principles'
    };
    return horizons[horizon as keyof typeof horizons] || `Horizon ${horizon}`;
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };

  const isOverdue = project.dueDate && new Date(project.dueDate) < new Date();
  const isDueSoon = project.dueDate && !isOverdue && 
    new Date(project.dueDate).getTime() - Date.now() < 7 * 24 * 60 * 60 * 1000; // 7 days

  return (
    <div className="bg-cursor-sidebar border border-cursor-border rounded-lg p-4 hover:border-cursor-accent transition-colors group">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-medium text-cursor-text truncate mb-1">
            {project.title}
          </h3>
          <div className="flex items-center gap-2 text-sm">
            <span className={`font-medium ${getStatusColor(project.status)}`}>
              {getStatusLabel(project.status)}
            </span>
            <span className="text-cursor-text-muted">•</span>
            <span className="text-cursor-text-muted">
              {getHorizonLabel(project.horizon)}
            </span>
            {project.progress !== undefined && (
              <>
                <span className="text-cursor-text-muted">•</span>
                <span className="text-cursor-text-muted">
                  {project.progress}% complete
                </span>
              </>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEdit(project)}
            className="p-1 hover:bg-cursor-bg rounded transition-colors text-cursor-text-muted hover:text-cursor-text"
            title="Edit project"
          >
            <MoreHorizontal size={16} />
          </button>
        </div>
      </div>

      {/* Outcome */}
      <div className="mb-3">
        <div className="flex items-center gap-2 mb-1">
          <Target size={14} className="text-cursor-accent" />
          <span className="text-sm font-medium text-cursor-text">Outcome</span>
        </div>
        <p className="text-sm text-cursor-text-muted pl-5 line-clamp-2">
          {project.outcome}
        </p>
      </div>

      {/* Next Action */}
      {nextAction ? (
        <div className="mb-3 p-2 bg-cursor-bg border border-cursor-border rounded">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <ArrowRight size={14} className="text-green-400" />
              <span className="text-sm font-medium text-cursor-text">Next Action</span>
            </div>
            {onStartNextAction && nextAction.status === 'active' && (
              <button
                onClick={() => onStartNextAction(nextAction.id)}
                className="p-1 hover:bg-cursor-sidebar rounded transition-colors text-cursor-text-muted hover:text-cursor-text"
                title={nextAction.inProgress ? "Pause" : "Start"}
              >
                {nextAction.inProgress ? <Pause size={12} /> : <Play size={12} />}
              </button>
            )}
          </div>
          <p className="text-sm text-cursor-text-muted pl-5 truncate">
            {nextAction.content}
          </p>
          {nextAction.contextId && (
            <div className="flex items-center gap-1 pl-5 mt-1">
              <span className="text-xs text-cursor-text-muted">@{nextAction.contextId}</span>
              {nextAction.estimatedMinutes && (
                <>
                  <span className="text-cursor-text-muted">•</span>
                  <span className="text-xs text-cursor-text-muted">
                    {nextAction.estimatedMinutes}m
                  </span>
                </>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="mb-3 p-2 bg-red-500/10 border border-red-500/20 rounded">
          <div className="flex items-center gap-2">
            <AlertCircle size={14} className="text-red-400" />
            <span className="text-sm text-red-400">No next action defined</span>
          </div>
        </div>
      )}

      {/* Progress Bar */}
      {project.progress !== undefined && project.progress > 0 && (
        <div className="mb-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-cursor-text-muted">Progress</span>
            <span className="text-xs text-cursor-text-muted">{project.progress}%</span>
          </div>
          <div className="w-full bg-cursor-bg rounded-full h-2">
            <div 
              className="bg-cursor-accent rounded-full h-2 transition-all duration-300"
              style={{ width: `${project.progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 text-cursor-text-muted">
            <CheckCircle size={12} />
            <span>{relatedIdeas.filter(idea => idea.status === 'completed').length}</span>
          </div>
          <div className="flex items-center gap-1 text-cursor-text-muted">
            <span>📋</span>
            <span>{relatedIdeas.length} ideas</span>
          </div>
          {project.dueDate && (
            <div className={`flex items-center gap-1 ${
              isOverdue ? 'text-red-400' : 
              isDueSoon ? 'text-yellow-400' : 
              'text-cursor-text-muted'
            }`}>
              <Calendar size={12} />
              <span>{formatDate(project.dueDate)}</span>
            </div>
          )}
        </div>
        <button
          onClick={() => onViewDetails(project)}
          className="text-cursor-accent hover:text-cursor-accent/80 transition-colors"
        >
          View Details
        </button>
      </div>
    </div>
  );
};