import React, { useEffect, useState } from 'react';
import ProjectCard from '../components/ProjectCard';
import ProjectSidebar from '../components/ProjectSidebar';
import Header from '../components/Header';
import useProjectStore from '../store/projectStore';
import { fetchProjects, createProject } from '../utils/api';
import { toast } from 'react-toastify';
import Modal from '../components/Modal';
import ProjectForm from '../components/ProjectForm';
import { Project } from '../types/project';
import Button from '../components/ui/Button';
import { PlusIcon } from 'lucide-react';

const ProjectsDashboard: React.FC = () => {
  const { projects, setProjects } = useProjectStore();
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('All');

  useEffect(() => {
    const loadProjects = async () => {
      try {
        const response = await fetchProjects();
        setProjects(response.data.data);
      } catch (err: any) {
        toast.error(err.response?.data?.message || 'Failed to fetch projects');
      }
    };
    loadProjects();
  }, [setProjects]);

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
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create project');
    }
  };

  const filteredProjects = filterStatus === 'All'
    ? projects
    : projects.filter((project) => project.status === filterStatus);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Header />
      <div className="flex-1 flex">
        <ProjectSidebar onCreateProject={handleOpenProjectModal} />
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
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