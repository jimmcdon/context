import React, { useState, useEffect } from 'react';
import { X, Target, Calendar, Clock, AlertTriangle } from 'lucide-react';
import { Project } from '../../types/gtd';

interface ProjectFormProps {
  project?: Project | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => void;
}

export const ProjectForm: React.FC<ProjectFormProps> = ({
  project,
  isOpen,
  onClose,
  onSave
}) => {
  const [formData, setFormData] = useState({
    title: '',
    outcome: '',
    description: '',
    status: 'active' as Project['status'],
    horizon: 1 as Project['horizon'],
    dueDate: '',
    estimatedHours: '',
    isMultiStep: true
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (project) {
      setFormData({
        title: project.title,
        outcome: project.outcome,
        description: project.description || '',
        status: project.status,
        horizon: project.horizon,
        dueDate: project.dueDate ? project.dueDate.toISOString().split('T')[0] : '',
        estimatedHours: project.estimatedHours?.toString() || '',
        isMultiStep: project.isMultiStep
      });
    } else {
      setFormData({
        title: '',
        outcome: '',
        description: '',
        status: 'active',
        horizon: 1,
        dueDate: '',
        estimatedHours: '',
        isMultiStep: true
      });
    }
    setErrors({});
  }, [project, isOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Project title is required';
    }

    if (!formData.outcome.trim()) {
      newErrors.outcome = 'Successful outcome is required';
    }

    if (formData.estimatedHours && (isNaN(Number(formData.estimatedHours)) || Number(formData.estimatedHours) < 0)) {
      newErrors.estimatedHours = 'Estimated hours must be a positive number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    const projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt'> = {
      title: formData.title.trim(),
      outcome: formData.outcome.trim(),
      description: formData.description.trim() || undefined,
      status: formData.status,
      horizon: formData.horizon,
      dueDate: formData.dueDate ? new Date(formData.dueDate) : undefined,
      estimatedHours: formData.estimatedHours ? Number(formData.estimatedHours) : undefined,
      isMultiStep: formData.isMultiStep,
      progress: project?.progress || 0
    };

    onSave(projectData);
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const getHorizonLabel = (horizon: number) => {
    const horizons = {
      1: 'Projects (Outcomes to achieve)',
      2: 'Areas of Focus (Standards to maintain)',
      3: '1-2 Year Goals',
      4: '3-5 Year Vision',
      5: 'Purpose & Principles'
    };
    return horizons[horizon as keyof typeof horizons] || `Horizon ${horizon}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-cursor-sidebar border border-cursor-border rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-cursor-border">
          <h2 className="text-xl font-semibold text-cursor-text">
            {project ? 'Edit Project' : 'Create New Project'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-cursor-bg rounded-lg transition-colors text-cursor-text-muted hover:text-cursor-text"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-cursor-text mb-2">
                Project Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                className={`w-full px-3 py-2 bg-cursor-bg border rounded-md text-cursor-text placeholder-cursor-text-muted focus:outline-none focus:border-cursor-accent ${
                  errors.title ? 'border-red-500' : 'border-cursor-border'
                }`}
                placeholder="e.g., Plan family vacation to Japan"
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-400 flex items-center gap-1">
                  <AlertTriangle size={12} />
                  {errors.title}
                </p>
              )}
            </div>

            {/* Outcome */}
            <div>
              <label className="block text-sm font-medium text-cursor-text mb-2">
                <Target size={16} className="inline mr-1" />
                Successful Outcome *
              </label>
              <textarea
                value={formData.outcome}
                onChange={(e) => handleChange('outcome', e.target.value)}
                rows={3}
                className={`w-full px-3 py-2 bg-cursor-bg border rounded-md text-cursor-text placeholder-cursor-text-muted resize-none focus:outline-none focus:border-cursor-accent ${
                  errors.outcome ? 'border-red-500' : 'border-cursor-border'
                }`}
                placeholder="Describe what success looks like when this project is complete..."
              />
              {errors.outcome && (
                <p className="mt-1 text-sm text-red-400 flex items-center gap-1">
                  <AlertTriangle size={12} />
                  {errors.outcome}
                </p>
              )}
              <p className="mt-1 text-xs text-cursor-text-muted">
                Be specific about the end result you want to achieve.
              </p>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-cursor-text mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 bg-cursor-bg border border-cursor-border rounded-md text-cursor-text placeholder-cursor-text-muted resize-none focus:outline-none focus:border-cursor-accent"
                placeholder="Additional details, context, or notes about this project..."
              />
            </div>

            {/* Status and Horizon */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-cursor-text mb-2">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => handleChange('status', e.target.value)}
                  className="w-full px-3 py-2 bg-cursor-bg border border-cursor-border rounded-md text-cursor-text focus:outline-none focus:border-cursor-accent"
                >
                  <option value="active">Active</option>
                  <option value="on-hold">On Hold</option>
                  <option value="someday-maybe">Someday/Maybe</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-cursor-text mb-2">
                  GTD Horizon
                </label>
                <select
                  value={formData.horizon}
                  onChange={(e) => handleChange('horizon', Number(e.target.value))}
                  className="w-full px-3 py-2 bg-cursor-bg border border-cursor-border rounded-md text-cursor-text focus:outline-none focus:border-cursor-accent"
                >
                  {[1, 2, 3, 4, 5].map(horizon => (
                    <option key={horizon} value={horizon}>
                      {getHorizonLabel(horizon)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Due Date and Estimated Hours */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-cursor-text mb-2">
                  <Calendar size={16} className="inline mr-1" />
                  Due Date
                </label>
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => handleChange('dueDate', e.target.value)}
                  className="w-full px-3 py-2 bg-cursor-bg border border-cursor-border rounded-md text-cursor-text focus:outline-none focus:border-cursor-accent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-cursor-text mb-2">
                  <Clock size={16} className="inline mr-1" />
                  Estimated Hours
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={formData.estimatedHours}
                  onChange={(e) => handleChange('estimatedHours', e.target.value)}
                  className={`w-full px-3 py-2 bg-cursor-bg border rounded-md text-cursor-text placeholder-cursor-text-muted focus:outline-none focus:border-cursor-accent ${
                    errors.estimatedHours ? 'border-red-500' : 'border-cursor-border'
                  }`}
                  placeholder="0"
                />
                {errors.estimatedHours && (
                  <p className="mt-1 text-sm text-red-400 flex items-center gap-1">
                    <AlertTriangle size={12} />
                    {errors.estimatedHours}
                  </p>
                )}
              </div>
            </div>

            {/* Multi-step checkbox */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isMultiStep"
                checked={formData.isMultiStep}
                onChange={(e) => handleChange('isMultiStep', e.target.checked)}
                className="rounded border-cursor-border"
              />
              <label htmlFor="isMultiStep" className="text-sm text-cursor-text">
                This is a multi-step project requiring multiple actions
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 mt-8 pt-6 border-t border-cursor-border">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-cursor-text-muted hover:text-cursor-text transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 bg-cursor-accent text-white px-6 py-2 rounded-md hover:bg-cursor-accent/90 transition-colors"
            >
              <Target size={16} />
              {project ? 'Update Project' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};