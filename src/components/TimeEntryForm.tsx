import React, { useState, useEffect } from 'react';
import Button from './ui/Button';
import { fetchTasks } from '../utils/api';
import { Task, Subtask } from '../types/task';

interface TimeEntryFormProps {
  onSubmit: (data: any) => void;
  onCancel: () => void;
  initialData?: {
    subtask_id: string;
    start_time: string;
    end_time: string;
    notes?: string;
  };
}

const TimeEntryForm: React.FC<TimeEntryFormProps> = ({ onSubmit, onCancel, initialData }) => {
  const [formData, setFormData] = useState({
    subtask_id: initialData?.subtask_id || '',
    start_time: initialData?.start_time ? new Date(initialData.start_time).toISOString().slice(0, 16) : '',
    end_time: initialData?.end_time ? new Date(initialData.end_time).toISOString().slice(0, 16) : '',
    notes: initialData?.notes || '',
  });
  const [tasks, setTasks] = useState<Task[]>([]);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    const loadTasks = async () => {
      try {
        const response = await fetchTasks();
        setTasks(response.data.data);
      } catch (err) {
        console.error('Failed to fetch tasks:', err);
      }
    };
    loadTasks();
  }, []);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.subtask_id) newErrors.subtask_id = 'Subtask is required';
    if (!formData.start_time) newErrors.start_time = 'Start time is required';
    if (!formData.end_time) newErrors.end_time = 'End time is required';
    try {
      const start = new Date(formData.start_time);
      const end = new Date(formData.end_time);
      if (end <= start) newErrors.end_time = 'End time must be after start time';
    } catch {
      newErrors.start_time = 'Invalid date format';
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

    const start = new Date(formData.start_time);
    const end = new Date(formData.end_time);
    const duration = Math.round((end.getTime() - start.getTime()) / 1000 / 60);

    onSubmit({
      subtask_id: formData.subtask_id,
      start_time: start.toISOString(), // Sends UTC time (e.g., 2025-04-27T17:33:00Z)
      end_time: end.toISOString(),
      duration,
      notes: formData.notes || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="subtask_id" className="block text-sm font-medium text-gray-700">
          Subtask
        </label>
        <select
          name="subtask_id"
          id="subtask_id"
          value={formData.subtask_id}
          onChange={handleChange}
          className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 ${errors.subtask_id ? 'border-red-500' : ''
            }`}
          required
        >
          <option value="">Select a subtask</option>
          {tasks.map((task) =>
            task.subtasks.map((subtask: Subtask) => (
              <option key={subtask.id} value={subtask.id}>
                {task.title} - {subtask.title}
              </option>
            ))
          )}
        </select>
        {errors.subtask_id && <p className="mt-1 text-sm text-red-500">{errors.subtask_id}</p>}
      </div>
      <div>
        <label htmlFor="start_time" className="block text-sm font-medium text-gray-700">
          Start Time
        </label>
        <input
          type="datetime-local"
          name="start_time"
          id="start_time"
          value={formData.start_time}
          onChange={handleChange}
          className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 ${errors.start_time ? 'border-red-500' : ''
            }`}
          required
        />
        {errors.start_time && <p className="mt-1 text-sm text-red-500">{errors.start_time}</p>}
      </div>
      <div>
        <label htmlFor="end_time" className="block text-sm font-medium text-gray-700">
          End Time
        </label>
        <input
          type="datetime-local"
          name="end_time"
          id="end_time"
          value={formData.end_time}
          onChange={handleChange}
          className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 ${errors.end_time ? 'border-red-500' : ''
            }`}
          required
        />
        {errors.end_time && <p className="mt-1 text-sm text-red-500">{errors.end_time}</p>}
      </div>
      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
          Notes (Optional)
        </label>
        <textarea
          name="notes"
          id="notes"
          value={formData.notes}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          rows={4}
        />
      </div>
      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" variant="primary">
          {initialData ? 'Update Time Entry' : 'Create Time Entry'}
        </Button>
      </div>
    </form>
  );
};

export default TimeEntryForm;