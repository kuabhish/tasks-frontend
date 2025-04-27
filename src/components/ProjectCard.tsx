import React from 'react';
import { Project } from '../types/project';
import { CalendarIcon, UserIcon, TagIcon } from 'lucide-react';
import Badge from './ui/Badge';

interface ProjectCardProps {
  project: Project;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  return (
    <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
      <h3 className="text-lg font-semibold text-gray-800 mb-2">{project.title}</h3>
      <p className="text-sm text-gray-600 mb-4">{project.description}</p>
      <div className="space-y-2">
        <div className="flex items-center text-sm text-gray-500">
          <CalendarIcon className="h-4 w-4 mr-2" />
          <span>Started: {new Date(project.startDate).toLocaleDateString()}</span>
        </div>
        <div className="flex items-center text-sm text-gray-500">
          <UserIcon className="h-4 w-4 mr-2" />
          <span>Status: {project.status}</span>
        </div>
        <div className="flex items-center text-sm text-gray-500">
          <TagIcon className="h-4 w-4 mr-2" />
          <div className="flex flex-wrap gap-1">
            {project.techStack.map((tech) => (
              <Badge key={tech} variant="default" className="text-xs">
                {tech}
              </Badge>
            ))}
          </div>
        </div>
      </div>
      <a
        href={project.repositoryUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 inline-block text-indigo-600 hover:underline text-sm"
      >
        View Repository
      </a>
    </div>
  );
};

export default ProjectCard;