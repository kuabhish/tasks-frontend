import React, { useState, useEffect } from 'react';
import Button from './ui/Button';
import useAuthStore from '../store/authStore';
import { fetchProjects } from '../utils/api';
import { Project } from '../types/project';

interface TaskFormProps {
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

const TaskForm: React.FC<TaskFormProps> = ({ onSubmit, onCancel }) => {
  const user = useAuthStore((state) => state.user);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'Not Started',
    priority: 'Medium',
    project_id: '',
    category_id: '',
    assigned_user_id: '',
    assigned_team_id: '',
    due_date: '',
    is_recurring: false,
    recurring_pattern: '',
    tags: '',
    estimated_duration: '',
    actual_duration: '',
  });
  const [projects, setProjects] = useState<Project[]>([]);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    const loadProjects = async () => {
      try {
        const response = await fetchProjects();
        setProjects(response.data.data);
      } catch (err) {
        console.error('Failed to fetch projects:', err);
      }
    };
    loadProjects();
  }, []);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.title) newErrors.title = 'Title is required';
    if (!formData.status) newErrors.status = 'Status is required';
    if (!formData.project_id) newErrors.project_id = 'Project is required';
    if (formData.estimated_duration && isNaN(Number(formData.estimated_duration))) {
      newErrors.estimated_duration = 'Estimated duration must be a number';
    }
    if (formData.actual_duration && isNaN(Number(formData.actual_duration))) {
      newErrors.actual_duration = 'Actual duration must be a number';
    }
    try {
      if (formData.recurring_pattern) JSON.parse(formData.recurring_pattern);
    } catch {
      newErrors.recurring_pattern = 'Recurring pattern must be valid JSON';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    });
    setErrors({ ...errors, [name]: '' });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    onSubmit({
      title: formData.title,
      description: formData.description || undefined,
      status: formData.status,
      priority: formData.priority,
      project_id: formData.project_id,
      category_id: formData.category_id || undefined,
      assigned_user_id: formData.assigned_user_id || undefined,
      assigned_team_id: formData.assigned_team_id || undefined,
      due_date: formData.due_date || undefined,
      is_recurring: formData.is_recurring,
      recurring_pattern: formData.recurring_pattern
        ? JSON.parse(formData.recurring_pattern)
        : undefined,
      tags: formData.tags ? formData.tags.split(',').map((tag) => tag.trim()).filter(Boolean) : undefined,
      estimated_duration: formData.estimated_duration
        ? Number(formData.estimated_duration)
        : undefined,
      actual_duration: formData.actual_duration ? Number(formData.actual_duration) : undefined,
    });
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
          className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 ${errors.title ? 'border-red-500' : ''
            }`}
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
          className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 ${errors.status ? 'border-red-500' : ''
            }`}
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
          className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 ${errors.project_id ? 'border-red-500' : ''
            }`}
          required
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
        <label htmlFor="assigned_user_id" className="block text-sm font-medium text-gray-700">
          Assigned User ID (Optional)
        </label>
        <input
          type="text"
          name="assigned_user_id"
          id="assigned_user_id"
          value={formData.assigned_user_id}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          placeholder="User ID"
        />
      </div>
      <div>
        <label htmlFor="assigned_team_id" className="block text-sm font-medium text-gray-700">
          Assigned Team ID (Optional)
        </label>
        <input
          type="text"
          name="assigned_team_id"
          id="assigned_team_id"
          value={formData.assigned_team_id}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          placeholder="Team ID"
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
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
      </div>
      <div>
        <label htmlFor="is_recurring" className="block text-sm font-medium text-gray-700">
          Is Recurring
        </label>
        <input
          type="checkbox"
          name="is_recurring"
          id="is_recurring"
          checked={formData.is_recurring}
          onChange={handleChange}
          className="mt-1"
        />
      </div>
      <div>
        <label htmlFor="recurring_pattern" className="block text-sm font-medium text-gray-700">
          Recurring Pattern (JSON, Optional)
        </label>
        <textarea
          name="recurring_pattern"
          id="recurring_pattern"
          value={formData.recurring_pattern}
          onChange={handleChange}
          className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 ${errors.recurring_pattern ? 'border-red-500' : ''
            }`}
          placeholder='{"interval": "weekly", "days": ["Monday"]}'
          rows={4}
        />
        {errors.recurring_pattern && (
          <p className="mt-1 text-sm text-red-500">{errors.recurring_pattern}</p>
        )}
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
          className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 ${errors.estimated_duration ? 'border-red-500' : ''
            }`}
          placeholder="40"
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
          className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 ${errors.actual_duration ? 'border-red-500' : ''
            }`}
          placeholder="0"
        />
        {errors.actual_duration && (
          <p className="mt-1 text-sm text-red-500">{errors.actual_duration}</p>
        )}
      </div>
      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" variant="primary">
          Create Task
        </Button>
      </div>
    </form>
  );
};

export default TaskForm;