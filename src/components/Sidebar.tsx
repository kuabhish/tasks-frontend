import React, { useEffect, useState, useCallback } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { fetchProjects, createProject, updateProject, deleteProject } from '../utils/api';
import { Project } from '../types/project';
import { toast } from 'react-toastify';
import Modal from './Modal';
import Button from './ui/Button';
import { PlusIcon, PencilIcon, TrashIcon, ChevronDownIcon, ChevronRightIcon, FolderIcon, ClockIcon, UsersIcon, UserIcon } from 'lucide-react';
import useAuthStore from '../store/authStore';
import ConfirmDialog from './ConfirmDailog';

/**
 * Sidebar component with enhanced UI/UX for project navigation and management
 */
const Sidebar: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState<'create' | 'edit' | null>(null);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<string | null>(null);
  const [isProjectsCollapsed, setIsProjectsCollapsed] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const loadProjects = useCallback(async () => {
    try {
      const response = await fetchProjects();
      setProjects(response.data.data);
    } catch (err) {
      // Error handled in api.ts
    }
  }, []);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  const handleCreateProject = async (data: {
    title: string;
    description?: string;
    status?: string;
    start_date?: string;
    tech_stack?: string[];
    repository_url?: string;
    end_date?: string;
    budget?: number;
    goals?: Record<string, string>;
    milestones?: Record<string, string>;
  }) => {
    try {
      const response = await createProject(data);
      setProjects([...projects, response.data.data.project]);
      toast.success('Project created successfully!');
      setIsProjectModalOpen(null);
    } catch (err) {
      // Error handled in api.ts
    }
  };

  const handleUpdateProject = async (projectId: string, data: Partial<{
    title: string;
    description?: string;
    status?: string;
    start_date?: string;
    tech_stack?: string[];
    repository_url?: string;
    end_date?: string;
    budget?: number;
    goals?: Record<string, string>;
    milestones?: Record<string, string>;
  }>) => {
    try {
      const response = await updateProject(projectId, data);
      setProjects(projects.map((p) => (p.id === projectId ? response.data.data.project : p)));
      toast.success('Project updated successfully!');
      setIsProjectModalOpen(null);
      setEditingProject(null);
    } catch (err) {
      // Error handled in api.ts
    }
  };

  const handleDeleteProject = async () => {
    if (!isDeleteDialogOpen) return;
    try {
      await deleteProject(isDeleteDialogOpen);
      setProjects(projects.filter((p) => p.id !== isDeleteDialogOpen));
      toast.success('Project archived successfully!');
      navigate('/tasks');
      setIsDeleteDialogOpen(null);
    } catch (err) {
      // Error handled in api.ts
    }
  };

  const openCreateModal = () => setIsProjectModalOpen('create');
  const openEditModal = (project: Project) => {
    setEditingProject(project);
    setIsProjectModalOpen('edit');
  };
  const openDeleteDialog = (projectId: string) => setIsDeleteDialogOpen(projectId);
  const closeModal = () => {
    setIsProjectModalOpen(null);
    setEditingProject(null);
  };

  return (
    <aside className="w-64 bg-gray-50 flex flex-col h-screen transition-all duration-300 shadow-lg">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-xl font-bold text-gray-900 flex items-center">
          <FolderIcon className="h-6 w-6 mr-2 text-indigo-600" />
          Task Tracker
        </h2>
      </div>
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        <div className="mb-4">
          <div
            className="flex justify-between items-center mb-2 cursor-pointer"
            onClick={() => setIsProjectsCollapsed(!isProjectsCollapsed)}
            role="button"
            aria-expanded={!isProjectsCollapsed}
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && setIsProjectsCollapsed(!isProjectsCollapsed)}
          >
            <h3 className="text-sm font-semibold text-gray-800 flex items-center">
              <FolderIcon className="h-4 w-4 mr-2 text-indigo-500" />
              Projects
            </h3>
            <div className="flex items-center space-x-2">
              {['Admin', 'Project Manager'].includes(user?.role || '') && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    openCreateModal();
                  }}
                  aria-label="Create new project"
                >
                  <PlusIcon className="h-4 w-4" />
                </Button>
              )}
              {isProjectsCollapsed ? (
                <ChevronRightIcon className="h-4 w-4 text-gray-600" />
              ) : (
                <ChevronDownIcon className="h-4 w-4 text-gray-600" />
              )}
            </div>
          </div>
          {!isProjectsCollapsed && (
            <div className="mt-2">
              <NavLink
                to="/tasks"
                className={({ isActive }) =>
                  `flex items-center text-sm text-gray-700 hover:bg-indigo-50 rounded-md px-3 py-2 mb-1 transition-colors duration-200 ${isActive && !new URLSearchParams(window.location.search).get('projectId')
                    ? 'bg-indigo-100 text-indigo-800 font-medium'
                    : ''
                  }`
                }
                aria-label="All Tasks"
              >
                <ClockIcon className="h-4 w-4 mr-2 text-gray-500" />
                All Tasks
              </NavLink>
              {projects.length === 0 ? (
                <p className="text-sm text-gray-500 px-3 py-2">No projects found.</p>
              ) : (
                <ul className="space-y-1">
                  {projects.map((project) => (
                    <li key={project.id} className="flex items-center justify-between px-3 py-2 hover:bg-indigo-50 rounded-md transition-colors duration-200">
                      <NavLink
                        to={`/tasks?projectId=${project.id}`}
                        className={({ isActive }) =>
                          `flex-1 text-sm text-gray-700 rounded-md ${isActive ? 'text-indigo-800 font-medium' : ''
                          }`
                        }
                        aria-label={`View tasks for ${project.title}`}
                      >
                        {project.title}
                      </NavLink>
                      {['Admin', 'Project Manager'].includes(user?.role || '') && (
                        <div className="flex space-x-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditModal(project)}
                            aria-label={`Edit ${project.title}`}
                          >
                            <PencilIcon className="h-3 w-3 text-gray-500 hover:text-indigo-600" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openDeleteDialog(project.id)}
                            aria-label={`Archive ${project.title}`}
                          >
                            <TrashIcon className="h-3 w-3 text-gray-500 hover:text-red-600" />
                          </Button>
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
        <NavLink
          to="/timeline"
          className={({ isActive }) =>
            `flex items-center text-sm text-gray-700 hover:bg-indigo-50 rounded-md px-3 py-2 transition-colors duration-200 ${isActive ? 'bg-indigo-100 text-indigo-800 font-medium' : ''
            }`
          }
          aria-label="Timeline"
        >
          <ClockIcon className="h-4 w-4 mr-2 text-gray-500" />
          Timeline
        </NavLink>
        <NavLink
          to="/teams"
          className={({ isActive }) =>
            `flex items-center text-sm text-gray-700 hover:bg-indigo-50 rounded-md px-3 py-2 transition-colors duration-200 ${isActive ? 'bg-indigo-100 text-indigo-800 font-medium' : ''
            }`
          }
          aria-label="Teams"
        >
          <UsersIcon className="h-4 w-4 mr-2 text-gray-500" />
          Teams
        </NavLink>
        <NavLink
          to="/profile"
          className={({ isActive }) =>
            `flex items-center text-sm text-gray-700 hover:bg-indigo-50 rounded-md px-3 py-2 transition-colors duration-200 ${isActive ? 'bg-indigo-100 text-indigo-800 font-medium' : ''
            }`
          }
          aria-label="Profile"
        >
          <UserIcon className="h-4 w-4 mr-2 text-gray-500" />
          Profile
        </NavLink>
      </nav>
      <Modal
        isOpen={!!isProjectModalOpen}
        onClose={closeModal}
        title={isProjectModalOpen === 'create' ? 'Create New Project' : 'Edit Project'}
        maxWidth="md"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            try {
              const data = {
                title: formData.get('title') as string,
                description: formData.get('description') as string,
                status: formData.get('status') as string,
                start_date: formData.get('start_date') as string,
                tech_stack:
                  formData.get('tech_stack')?.toString().split(',').map((s) => s.trim()) || [],
                repository_url: formData.get('repository_url') as string,
                end_date: formData.get('end_date') as string || undefined,
                budget: formData.get('budget') ? Number(formData.get('budget')) : undefined,
                goals: formData.get('goals')
                  ? JSON.parse(formData.get('goals') as string)
                  : undefined,
                milestones: formData.get('milestones')
                  ? JSON.parse(formData.get('milestones') as string)
                  : undefined,
              };
              if (!data.title) throw new Error('Title is required');
              if (data.goals && typeof data.goals !== 'object')
                throw new Error('Goals must be valid JSON');
              if (data.milestones && typeof data.milestones !== 'object')
                throw new Error('Milestones must be valid JSON');
              if (isProjectModalOpen === 'create') {
                handleCreateProject(data);
              } else if (editingProject) {
                handleUpdateProject(editingProject.id, data);
              }
            } catch (err) {
              toast.error((err as Error).message || 'Invalid form data');
            }
          }}
        >
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700">Title *</label>
              <input
                name="title"
                type="text"
                required
                defaultValue={editingProject?.title}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition-all duration-200"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                name="description"
                defaultValue={editingProject?.description}
                rows={4}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition-all duration-200"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Status</label>
              <select
                name="status"
                defaultValue={editingProject?.status}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition-all duration-200"
              >
                <option value="Active">Active</option>
                <option value="On Hold">On Hold</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Start Date</label>
              <input
                name="start_date"
                type="date"
                defaultValue={editingProject?.start_date?.split('T')[0]}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition-all duration-200"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">End Date</label>
              <input
                name="end_date"
                type="date"
                defaultValue={editingProject?.end_date?.split('T')[0]}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition-all duration-200"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Budget</label>
              <input
                name="budget"
                type="number"
                step="0.01"
                defaultValue={editingProject?.budget}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition-all duration-200"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700">
                Tech Stack (comma-separated)
              </label>
              <input
                name="tech_stack"
                type="text"
                placeholder="e.g., React, Node.js, Python"
                defaultValue={editingProject?.tech_stack?.join(',')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition-all duration-200"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700">Repository URL</label>
              <input
                name="repository_url"
                type="url"
                defaultValue={editingProject?.repository_url}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition-all duration-200"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700">
                Goals (JSON format)
              </label>
              <textarea
                name="goals"
                defaultValue={
                  editingProject?.goals ? JSON.stringify(editingProject.goals, null, 2) : '{}'
                }
                rows={4}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 font-mono text-sm transition-all duration-200"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700">
                Milestones (JSON format)
              </label>
              <textarea
                name="milestones"
                defaultValue={
                  editingProject?.milestones
                    ? JSON.stringify(editingProject.milestones, null, 2)
                    : '{}'
                }
                rows={4}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 font-mono text-sm transition-all duration-200"
              />
            </div>
          </div>
          <div className="mt-6 flex justify-end space-x-3">
            <Button variant="outline" type="button" onClick={closeModal}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              {isProjectModalOpen === 'create' ? 'Create Project' : 'Update Project'}
            </Button>
          </div>
        </form>
      </Modal>
      {isDeleteDialogOpen && (
        <ConfirmDialog
          isOpen={!!isDeleteDialogOpen}
          onClose={() => setIsDeleteDialogOpen(null)}
          onConfirm={handleDeleteProject}
          title="Archive Project"
          message="Are you sure you want to archive this project? This action cannot be undone."
          confirmText="Archive"
          cancelText="Cancel"
        />
      )}
    </aside>
  );
};

export default Sidebar;