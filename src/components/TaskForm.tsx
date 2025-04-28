import React, { useState, useEffect } from 'react';
import Button from './ui/Button';
import { fetchProjects } from '../utils/api';
import { Project } from '../types/project';
import { Task } from '../types/task';
import { toast } from 'react-toastify';

interface TaskFormProps {
  onSubmit: (data: any) => void;
  onCancel: () => void;
  task?: Task; // Optional task for edit mode
}

const TaskForm: React.FC<TaskFormProps> = ({ onSubmit, onCancel, task }) => {
  const isEditMode = !!task;
  const [formData, setFormData] = useState({
    title: task?.title || '',
    description: task?.description || '',
    status: task?.status || 'Not Started',
    priority: task?.priority || 'Medium',
    project_id: task?.projectId || '',
    due_date: task?.dueDate?.split('T')[0] || '', // Convert ISO date to YYYY-MM-DD
    tags: task?.tags?.join(', ') || '',
    estimated_duration: task?.estimatedDuration?.toString() || '',
    actual_duration: task?.actualDuration?.toString() || '',
    category_id: task?.categoryId || '',
  });
  const [projects, setProjects] = useState<Project[]>([]);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadProjects = async () => {
      try {
        const response = await fetchProjects();
        setProjects(response.data.data);
      } catch (err) {
        toast.error('Failed to fetch projects');
      }
    };
    loadProjects();
  }, []);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.status) newErrors.status = 'Status is required';
    if (!isEditMode && !formData.project_id) newErrors.project_id = 'Project is required';
    if (formData.estimated_duration && isNaN(Number(formData.estimated_duration))) {
      newErrors.estimated_duration = 'Estimated duration must be a number';
    }
    if (formData.estimated_duration && Number(formData.estimated_duration) <= 0) {
      newErrors.estimated_duration = 'Estimated duration must be positive';
    }
    if (formData.actual_duration && isNaN(Number(formData.actual_duration))) {
      newErrors.actual_duration = 'Actual duration must be a number';
    }
    if (formData.actual_duration && Number(formData.actual_duration) < 0) {
      newErrors.actual_duration = 'Actual duration cannot be negative';
    }
    if (formData.due_date) {
      const dueDate = new Date(formData.due_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (dueDate < today) {
        newErrors.due_date = 'Due date cannot be in the past';
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErrors({ ...errors, [name]: '' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      await onSubmit({
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
        status: formData.status,
        priority: formData.priority,
        project_id: formData.project_id || undefined,
        category_id: formData.category_id || undefined,
        due_date: formData.due_date || undefined,
        tags: formData.tags
          ? formData.tags.split(',').map((tag) => tag.trim()).filter(Boolean)
          : undefined,
        estimated_duration: formData.estimated_duration
          ? Number(formData.estimated_duration)
          : undefined,
        actual_duration: formData.actual_duration
          ? Number(formData.actual_duration)
          : undefined,
      });
    } catch (err) {
      toast.error(`Failed to ${isEditMode ? 'update' : 'create'} task`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
          Task Title
        </label>
        <input
          type="text"
          name="title"
          id="title"
          value={formData.title}
          onChange={handleChange}
          className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 ${errors.title ? 'border-red-500' : ''}`}
          required
        />
        {errors.title && <p className="mt-1 text-sm text-red-500">{errors.title}</p>}
      </div>
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Description
        </label>
        <textarea
          name="description"
          id="description"
          value={formData.description}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          rows={4}
        />
      </div>
      <div>
        <label htmlFor="status" className="block text-sm font-medium text-gray-700">
          Status
        </label>
        <select
          name="status"
          id="status"
          value={formData.status}
          onChange={handleChange}
          className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 ${errors.status ? 'border-red-500' : ''}`}
          required
        >
          <option value="Not Started">Not Started</option>
          <option value="In Progress">In Progress</option>
          <option value="Completed">Completed</option>
        </select>
        {errors.status && <p className="mt-1 text-sm text-red-500">{errors.status}</p>}
      </div>
      <div>
        <label htmlFor="priority" className="block text-sm font-medium text-gray-700">
          Priority
        </label>
        <select
          name="priority"
          id="priority"
          value={formData.priority}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        >
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
        </select>
      </div>
      <div>
        <label htmlFor="project_id" className="block text-sm font-medium text-gray-700">
          Project
        </label>
        <select
          name="project_id"
          id="project_id"
          value={formData.project_id}
          onChange={handleChange}
          className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 ${errors.project_id ? 'border-red-500' : ''}`}
          required={!isEditMode}
          disabled={isEditMode}
        >
          <option value="">Select a project</option>
          {projects.map((project) => (
            <option key={project.id} value={project.id}>
              {project.title}
            </option>
          ))}
        </select>
        {errors.project_id && <p className="mt-1 text-sm text-red-500">{errors.project_id}</p>}
      </div>
      <div>
        <label htmlFor="category_id" className="block text-sm font-medium text-gray-700">
          Category ID (Optional)
        </label>
        <input
          type="text"
          name="category_id"
          id="category_id"
          value={formData.category_id}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          placeholder="Category ID"
        />
      </div>
      <div>
        <label htmlFor="due_date" className="block text-sm font-medium text-gray-700">
          Due Date (Optional)
        </label>
        <input
          type="date"
          name="due_date"
          id="due_date"
          value={formData.due_date}
          onChange={handleChange}
          className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 ${errors.due_date ? 'border-red-500' : ''}`}
        />
        {errors.due_date && <p className="mt-1 text-sm text-red-500">{errors.due_date}</p>}
      </div>
      <div>
        <label htmlFor="tags" className="block text-sm font-medium text-gray-700">
          Tags (comma-separated, Optional)
        </label>
        <input
          type="text"
          name="tags"
          id="tags"
          value={formData.tags}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          placeholder="frontend, react"
        />
      </div>
      <div>
        <label htmlFor="estimated_duration" className="block text-sm font-medium text-gray-700">
          Estimated Duration (hours, Optional)
        </label>
        <input
          type="number"
          name="estimated_duration"
          id="estimated_duration"
          value={formData.estimated_duration}
          onChange={handleChange}
          className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 ${errors.estimated_duration ? 'border-red-500' : ''}`}
          placeholder="40"
          min="0"
          step="1"
        />
        {errors.estimated_duration && (
          <p className="mt-1 text-sm text-red-500">{errors.estimated_duration}</p>
        )}
      </div>
      <div>
        <label htmlFor="actual_duration" className="block text-sm font-medium text-gray-700">
          Actual Duration (hours, Optional)
        </label>
        <input
          type="number"
          name="actual_duration"
          id="actual_duration"
          value={formData.actual_duration}
          onChange={handleChange}
          className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 ${errors.actual_duration ? 'border-red-500' : ''}`}
          placeholder="0"
          min="0"
          step="1"
        />
        {errors.actual_duration && (
          <p className="mt-1 text-sm text-red-500">{errors.actual_duration}</p>
        )}
      </div>
      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" disabled={isLoading}>
          {isLoading ? (isEditMode ? 'Updating...' : 'Creating...') : (isEditMode ? 'Update Task' : 'Create Task')}
        </Button>
      </div>
    </form>
  );
};

export default TaskForm;