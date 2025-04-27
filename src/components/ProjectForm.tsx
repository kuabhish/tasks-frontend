import React, { useState } from 'react';
import Button from './ui/Button';
import useAuthStore from '../store/authStore';

interface ProjectFormProps {
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

const ProjectForm: React.FC<ProjectFormProps> = ({ onSubmit, onCancel }) => {
  const user = useAuthStore((state) => state.user);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'Active',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    budget: '',
    techStack: '',
    repositoryUrl: '',
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.title) newErrors.title = 'Title is required';
    if (!formData.status) newErrors.status = 'Status is required';
    if (!formData.startDate) newErrors.startDate = 'Start date is required';
    if (formData.budget && isNaN(Number(formData.budget))) newErrors.budget = 'Budget must be a number';
    if (formData.repositoryUrl && !isValidUrl(formData.repositoryUrl)) {
      newErrors.repositoryUrl = 'Invalid URL format';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '' });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    onSubmit({
      title: formData.title,
      description: formData.description,
      status: formData.status,
      startDate: formData.startDate,
      endDate: formData.endDate || undefined,
      budget: formData.budget ? Number(formData.budget) : undefined,
      techStack: formData.techStack.split(',').map((tech) => tech.trim()).filter(Boolean),
      repositoryUrl: formData.repositoryUrl || undefined,
      customerId: user?.customerId || '',
      projectManagerId: user?.id || '',
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
          Project Title
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
          <option value="Active">Active</option>
          <option value="On Hold">On Hold</option>
          <option value="Completed">Completed</option>
        </select>
        {errors.status && <p className="mt-1 text-sm text-red-500">{errors.status}</p>}
      </div>
      <div>
        <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
          Start Date
        </label>
        <input
          type="date"
          name="startDate"
          id="startDate"
          value={formData.startDate}
          onChange={handleChange}
          className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 ${errors.startDate ? 'border-red-500' : ''
            }`}
          required
        />
        {errors.startDate && <p className="mt-1 text-sm text-red-500">{errors.startDate}</p>}
      </div>
      <div>
        <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
          End Date (Optional)
        </label>
        <input
          type="date"
          name="endDate"
          id="endDate"
          value={formData.endDate}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
      </div>
      <div>
        <label htmlFor="budget" className="block text-sm font-medium text-gray-700">
          Budget (Optional)
        </label>
        <input
          type="number"
          name="budget"
          id="budget"
          value={formData.budget}
          onChange={handleChange}
          className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 ${errors.budget ? 'border-red-500' : ''
            }`}
          placeholder="Enter budget in USD"
        />
        {errors.budget && <p className="mt-1 text-sm text-red-500">{errors.budget}</p>}
      </div>
      <div>
        <label htmlFor="techStack" className="block text-sm font-medium text-gray-700">
          Tech Stack (comma-separated)
        </label>
        <input
          type="text"
          name="techStack"
          id="techStack"
          value={formData.techStack}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          placeholder="React, Node.js, PostgreSQL"
        />
      </div>
      <div>
        <label htmlFor="repositoryUrl" className="block text-sm font-medium text-gray-700">
          Repository URL (Optional)
        </label>
        <input
          type="url"
          name="repositoryUrl"
          id="repositoryUrl"
          value={formData.repositoryUrl}
          onChange={handleChange}
          className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 ${errors.repositoryUrl ? 'border-red-500' : ''
            }`}
          placeholder="https://github.com/repo"
        />
        {errors.repositoryUrl && (
          <p className="mt-1 text-sm text-red-500">{errors.repositoryUrl}</p>
        )}
      </div>
      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" variant="primary">
          Create Project
        </Button>
      </div>
    </form>
  );
};

export default ProjectForm;