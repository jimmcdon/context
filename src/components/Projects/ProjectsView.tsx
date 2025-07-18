import React, { useState, useMemo } from 'react';
import { Plus, Search, Filter, Target, Calendar, AlertTriangle } from 'lucide-react';
import { useGTDStore } from '../../store/gtdStore';
import { ProjectCard } from './ProjectCard';
import { ProjectDetail } from './ProjectDetail';
import { ProjectForm } from './ProjectForm';
import { Project } from '../../types/gtd';

export const ProjectsView: React.FC = () => {
  const {
    projects,
    ideas,
    addProject,
    updateProject,
    deleteProject,
    completeProject,
    linkIdeaToProject,
    unlinkIdeaFromProject,
    setProjectNextAction,
    updateProjectProgress,
    startTask,
    pauseTask,
    completeIdea
  } = useGTDStore();

  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('active');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Filter projects
  const filteredProjects = useMemo(() => {
    return projects.filter(project => {
      const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          project.outcome.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [projects, searchTerm, statusFilter]);

  // Get related ideas for each project
  const getProjectIdeas = (projectId: string) => {
    return ideas.filter(idea => idea.projectId === projectId);
  };

  // Get next action for a project
  const getProjectNextAction = (projectId: string) => {
    return ideas.find(idea => 
      idea.projectId === projectId && 
      idea.isNextAction && 
      idea.status === 'active'
    );
  };

  const handleCreateProject = () => {
    setEditingProject(null);
    setShowProjectForm(true);
  };

  const handleEditProject = (project: Project) => {
    setEditingProject(project);
    setShowProjectForm(true);
  };

  const handleSaveProject = (projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingProject) {
      updateProject(editingProject.id, projectData);
    } else {
      addProject(projectData);
    }
    setShowProjectForm(false);
    setEditingProject(null);
  };

  const handleDeleteProject = (projectId: string) => {
    setDeleteConfirm(projectId);
  };

  const confirmDelete = () => {
    if (deleteConfirm) {
      deleteProject(deleteConfirm);
      setSelectedProject(null);
      setDeleteConfirm(null);
    }
  };

  const handleViewDetails = (project: Project) => {
    setSelectedProject(project);
  };

  const handleStartAction = (actionId: string) => {
    startTask(actionId);
  };

  const handlePauseAction = (actionId: string) => {
    pauseTask(actionId);
  };

  const handleCompleteAction = (actionId: string) => {
    completeIdea(actionId);
  };

  const availableIdeas = ideas.filter(idea => 
    idea.status === 'active' && 
    idea.isActionable &&
    idea.type === 'action'
  );

  const activeProjects = filteredProjects.filter(p => p.status === 'active');
  const stuckProjects = activeProjects.filter(p => !getProjectNextAction(p.id));
  const overdueProjects = activeProjects.filter(p => 
    p.dueDate && new Date(p.dueDate) < new Date()
  );

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="border-b border-cursor-border p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-semibold text-cursor-text">Projects</h1>
            <p className="text-cursor-text-muted text-sm">
              Multi-step commitments with defined outcomes. Each project needs a next action.
            </p>
          </div>
          <button
            onClick={handleCreateProject}
            className="flex items-center gap-2 bg-cursor-accent text-white px-4 py-2 rounded-md hover:bg-cursor-accent/90 transition-colors"
          >
            <Plus size={16} />
            <span>New Project</span>
          </button>
        </div>

        {/* Filters and Search */}
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-cursor-text-muted" />
            <input
              type="text"
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-cursor-sidebar border border-cursor-border rounded-md text-cursor-text placeholder-cursor-text-muted focus:outline-none focus:border-cursor-accent"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-cursor-sidebar border border-cursor-border rounded-md text-cursor-text focus:outline-none focus:border-cursor-accent"
          >
            <option value="active">Active</option>
            <option value="all">All Status</option>
            <option value="completed">Completed</option>
            <option value="on-hold">On Hold</option>
            <option value="someday-maybe">Someday/Maybe</option>
          </select>
        </div>

        {/* Quick Stats */}
        {statusFilter === 'active' && (
          <div className="flex items-center gap-6 mt-4 text-sm">
            <div className="flex items-center gap-2">
              <Target size={16} className="text-cursor-accent" />
              <span className="text-cursor-text">{activeProjects.length} Active</span>
            </div>
            {stuckProjects.length > 0 && (
              <div className="flex items-center gap-2">
                <AlertTriangle size={16} className="text-yellow-400" />
                <span className="text-yellow-400">{stuckProjects.length} Need Next Action</span>
              </div>
            )}
            {overdueProjects.length > 0 && (
              <div className="flex items-center gap-2">
                <Calendar size={16} className="text-red-400" />
                <span className="text-red-400">{overdueProjects.length} Overdue</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Projects Grid */}
      <div className="flex-1 overflow-auto p-6">
        {filteredProjects.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-cursor-accent/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Target size={32} className="text-cursor-accent" />
            </div>
            <h3 className="text-lg font-medium text-cursor-text mb-2">
              {searchTerm ? 'No projects found' : 'No projects yet'}
            </h3>
            <p className="text-cursor-text-muted mb-6">
              {searchTerm 
                ? 'Try adjusting your search terms or filters.'
                : 'Create your first project to organize multi-step commitments.'
              }
            </p>
            {!searchTerm && (
              <button
                onClick={handleCreateProject}
                className="bg-cursor-accent text-white px-6 py-3 rounded-md hover:bg-cursor-accent/90 transition-colors"
              >
                Create Project
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredProjects.map((project) => {
              const relatedIdeas = getProjectIdeas(project.id);
              const nextAction = getProjectNextAction(project.id);
              
              return (
                <ProjectCard
                  key={project.id}
                  project={project}
                  nextAction={nextAction}
                  relatedIdeas={relatedIdeas}
                  onEdit={handleEditProject}
                  onDelete={handleDeleteProject}
                  onViewDetails={handleViewDetails}
                  onStartNextAction={handleStartAction}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* Project Detail Modal */}
      {selectedProject && (
        <ProjectDetail
          project={selectedProject}
          relatedIdeas={getProjectIdeas(selectedProject.id)}
          nextAction={getProjectNextAction(selectedProject.id)}
          availableIdeas={availableIdeas}
          isOpen={!!selectedProject}
          onClose={() => setSelectedProject(null)}
          onEdit={handleEditProject}
          onDelete={handleDeleteProject}
          onUpdateProgress={updateProjectProgress}
          onLinkIdea={linkIdeaToProject}
          onUnlinkIdea={unlinkIdeaFromProject}
          onSetNextAction={setProjectNextAction}
          onStartAction={handleStartAction}
          onPauseAction={handlePauseAction}
          onCompleteAction={handleCompleteAction}
        />
      )}

      {/* Project Form Modal */}
      {showProjectForm && (
        <ProjectForm
          project={editingProject}
          isOpen={showProjectForm}
          onClose={() => {
            setShowProjectForm(false);
            setEditingProject(null);
          }}
          onSave={handleSaveProject}
        />
      )}

      {/* Delete Confirmation Dialog */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-cursor-sidebar border border-cursor-border rounded-lg shadow-2xl w-full max-w-md">
            <div className="p-6">
              <h3 className="text-lg font-medium text-cursor-text mb-2">Delete Project</h3>
              <p className="text-cursor-text-muted mb-6">
                Are you sure you want to delete this project? All linked ideas will be unlinked. This action cannot be undone.
              </p>
              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="px-4 py-2 text-cursor-text-muted hover:text-cursor-text transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                >
                  Delete Project
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};