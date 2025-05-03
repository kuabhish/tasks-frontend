import React, { useEffect, useState, useMemo, useCallback } from 'react';
import ProjectCard from '../components/ProjectCard';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import useProjectStore from '../store/projectStore';
import { fetchProjects, createProject } from '../utils/api';
import { toast } from 'react-toastify';
import Modal from '../components/Modal';
import ProjectForm from '../components/ProjectForm';
import { Project } from '../types/project';
import Button from '../components/ui/Button';
import { PlusIcon } from 'lucide-react';

/**
 * Projects dashboard component
 */
const ProjectsDashboard: React.FC = () => {
  const { projects, setProjects } = useProjectStore();
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [isLoading, setIsLoading] = useState(false);

  const loadProjects = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetchProjects();
      setProjects(response.data.data);
    } catch (err) {
      // Error handled in api.ts
    } finally {
      setIsLoading(false);
    }
  }, [setProjects]);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  const handleOpenProjectModal = () => {
    setIsProjectModalOpen(true);
  };

  const handleCloseProjectModal = () => {
    setIsProjectModalOpen(false);
  };

  const handleProjectSubmit = async (projectData: Omit<Project, 'id'>) => {
    try {
      const response = await createProject({
        title: projectData.title,
        description: projectData.description,
        status: projectData.status,
        start_date: projectData.startDate,
        tech_stack: projectData.techStack,
        repository_url: projectData.repositoryUrl || undefined,
      });
      setProjects([...projects, response.data.data.project]);
      toast.success('Project created successfully!');
      handleCloseProjectModal();
    } catch (err) {
      // Error handled in api.ts
    }
  };

  const filteredProjects = useMemo(
    () =>
      filterStatus === 'All'
        ? projects
        : projects.filter((project) => project.status === filterStatus),
    [projects, filterStatus]
  );

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Header />
      <div className="flex-1 flex">
        <Sidebar />
        <main className="flex-1 p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Projects Dashboard</h1>
            <div className="flex items-center space-x-4">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
              >
                <option value="All">All Statuses</option>
                <option value="Active">Active</option>
                <option value="On Hold">On Hold</option>
                <option value="Completed">Completed</option>
              </select>
              <Button variant="primary" onClick={handleOpenProjectModal}>
                <PlusIcon className="h-4 w-4 mr-2" />
                New Project
              </Button>
            </div>
          </div>
          {isLoading ? (
            <div className="text-center text-gray-500">Loading projects...</div>
          ) : filteredProjects.length === 0 ? (
            <div className="text-center text-gray-500">No projects found.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProjects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          )}
        </main>
      </div>
      <Modal
        isOpen={isProjectModalOpen}
        onClose={handleCloseProjectModal}
        title="Create New Project"
        maxWidth="lg"
      >
        <ProjectForm onSubmit={handleProjectSubmit} onCancel={handleCloseProjectModal} />
      </Modal>
    </div>
  );
};

export default ProjectsDashboard;