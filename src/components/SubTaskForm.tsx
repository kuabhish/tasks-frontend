import React, { useState, useEffect } from 'react';
import Button from './ui/Button';
import { fetchUsers, fetchTeams } from '../utils/api';
import { User } from '../types/user';
import { Team } from '../types/team';
import { Subtask } from '../types/task';
import { toast } from 'react-toastify';

interface SubtaskFormProps {
  taskId: string;
  onSubmit: (data: Omit<Subtask, 'id' | 'created_at' | 'updated_at'>) => void;
  onCancel: () => void;
  subtask?: Subtask;
}

const SubtaskForm: React.FC<SubtaskFormProps> = ({ taskId, onSubmit, onCancel, subtask }) => {
  const isEditMode = !!subtask;
  const [formData, setFormData] = useState({
    title: subtask?.title || '',
    description: subtask?.description || '',
    status: subtask?.status || 'Not Started',
    assigned_user_id: subtask?.assigned_user_id || '',
    assigned_team_id: subtask?.assigned_team_id || '',
    due_date: subtask?.due_date?.split('T')[0] || '',
    tags: subtask?.tags?.join(', ') || '',
    estimated_duration: subtask?.estimated_duration?.toString() || '',
  });
  const [users, setUsers] = useState<User[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [usersResponse, teamsResponse] = await Promise.all([
          fetchUsers(),
          fetchTeams(),
        ]);
        setUsers(usersResponse.data.data);
        setTeams(teamsResponse.data.data);
      } catch (err) {
        toast.error('Failed to fetch users or teams');
      }
    };
    loadData();
  }, []);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.status) newErrors.status = 'Status is required';
    if (formData.estimated_duration && isNaN(Number(formData.estimated_duration))) {
      newErrors.estimated_duration = 'Estimated duration must be a number';
    }
    if (formData.estimated_duration && Number(formData.estimated_duration) <= 0) {
      newErrors.estimated_duration = 'Estimated duration must be positive';
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
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      await onSubmit({
        task_id: taskId,
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
        status: formData.status as Subtask['status'],
        assigned_user_id: formData.assigned_user_id || undefined,
        assigned_team_id: formData.assigned_team_id || undefined,
        due_date: formData.due_date || undefined,
        tags: formData.tags
          ? formData.tags.split(',').map((tag) => tag.trim()).filter(Boolean)
          : [],
        estimated_duration: formData.estimated_duration
          ? Number(formData.estimated_duration)
          : undefined,
      });
    } catch (err) {
      toast.error(`Failed to ${isEditMode ? 'update' : 'create'} subtask`);
    } finally {
      setIsLoading(false);
    }
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
        <label htmlFor="assigned_user_id" className="block text-sm font-medium text-gray-700">
          Assigned User (Optional)
        </label>
        <select
          name="assigned_user_id"
          id="assigned_user_id"
          value={formData.assigned_user_id}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        >
          <option value="">Select a user</option>
          {users.map((user) => (
            <option key={user.id} value={user.id}>
              {user.username} ({user.email})
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="assigned_team_id" className="block text-sm font-medium text-gray-700">
          Assigned Team (Optional)
        </label>
        <select
          name="assigned_team_id"
          id="assigned_team_id"
          value={formData.assigned_team_id}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        >
          <option value="">Select a team</option>
          {teams.map((team) => (
            <option key={team.id} value={team.id}>
              {team.name}
            </option>
          ))}
        </select>
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
          className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 ${errors.estimated_duration ? 'border-red-500' : ''}`}
          placeholder="8"
          min="0"
          step="1"
        />
        {errors.estimated_duration && (
          <p className="mt-1 text-sm text-red-500">{errors.estimated_duration}</p>
        )}
      </div>
      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" disabled={isLoading}>
          {isLoading ? (isEditMode ? 'Updating...' : 'Creating...') : (isEditMode ? 'Update Subtask' : 'Create Subtask')}
        </Button>
      </div>
    </form>
  );
};

export default SubtaskForm;