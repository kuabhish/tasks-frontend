import React, { useState } from 'react';
import Button from './ui/Button';

interface SubtaskFormProps {
  taskId: string;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

const SubtaskForm: React.FC<SubtaskFormProps> = ({ taskId, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'Not Started',
    assigned_user_id: '',
    assigned_team_id: '',
    tags: '',
    estimated_duration: '',
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.title) newErrors.title = 'Title is required';
    if (!formData.status) newErrors.status = 'Status is required';
    if (formData.estimated_duration && isNaN(Number(formData.estimated_duration))) {
      newErrors.estimated_duration = 'Estimated duration must be a number';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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
      description: formData.description || undefined,
      status: formData.status,
      task_id: taskId,
      assigned_user_id: formData.assigned_user_id || undefined,
      assigned_team_id: formData.assigned_team_id || undefined,
      tags: formData.tags ? formData.tags.split(',').map((tag) => tag.trim()).filter(Boolean) : undefined,
      estimated_duration: formData.estimated_duration
        ? Number(formData.estimated_duration)
        : undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
          Subtask Title
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
          placeholder="navbar, react"
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
          placeholder="8"
        />
        {errors.estimated_duration && (
          <p className="mt-1 text-sm text-red-500">{errors.estimated_duration}</p>
        )}
      </div>
      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" variant="primary">
          Create Subtask
        </Button>
      </div>
    </form>
  );
};

export default SubtaskForm;