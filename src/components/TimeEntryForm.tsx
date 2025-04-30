import React, { useState, useEffect } from 'react';
import Button from './ui/Button';
import { fetchTasks } from '../utils/api';
import { Task, Subtask } from '../types/task';
import { toast } from 'react-toastify';

interface TimeEntryFormProps {
  onSubmit: (data: {
    id?: string;
    subtask_id: string;
    start_time: string;
    end_time: string;
    duration: number;
    notes?: string;
  }) => void;
  onCancel: () => void;
  initialData?: {
    id?: string;
    subtask_id: string;
    start_time: string;
    end_time: string;
    notes?: string;
  };
}

const TimeEntryForm: React.FC<TimeEntryFormProps> = ({ onSubmit, onCancel, initialData }) => {
  // Helper function to format UTC ISO string to local datetime-local format (YYYY-MM-DDThh:mm)
  const formatToLocalDateTime = (utcDateString?: string): string => {
    if (!utcDateString) return '';
    try {
      const date = new Date(utcDateString);
      if (isNaN(date.getTime())) return '';
      // Convert to local timezone and format as YYYY-MM-DDThh:mm
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `${year}-${month}-${day}T${hours}:${minutes}`;
    } catch {
      console.warn(`Invalid date string: ${utcDateString}`);
      return '';
    }
  };

  const [formData, setFormData] = useState({
    id: initialData?.id || '',
    subtask_id: initialData?.subtask_id || '',
    start_time: formatToLocalDateTime(initialData?.start_time),
    end_time: formatToLocalDateTime(initialData?.end_time),
    notes: initialData?.notes || '',
  });
  const [tasks, setTasks] = useState<Task[]>([]);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    console.log('TimeEntryForm initialData:', initialData);
    console.log('TimeEntryForm formData:', formData);
  }, [initialData, formData]);

  useEffect(() => {
    const loadTasks = async () => {
      setLoading(true);
      try {
        const response = await fetchTasks();
        console.log('Fetched tasks response in TimeEntryForm:', response.data.data);
        const taskData = Array.isArray(response.data.data) ? response.data.data : [];
        if (!Array.isArray(response.data.data)) {
          console.warn('response.data is not an array:', response.data);
          toast.error('Invalid tasks data received');
        }
        setTasks(taskData);
      } catch (err: any) {
        console.error('Failed to fetch tasks:', err);
        toast.error(err.response?.data?.error || 'Failed to fetch tasks');
        setTasks([]);
      } finally {
        setLoading(false);
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

    // Convert local datetime to UTC ISO string
    // Since datetime-local provides local time, create Date object and convert to UTC
    const localStart = new Date(formData.start_time);
    const localEnd = new Date(formData.end_time);

    // Convert local time to UTC ISO string
    const start = localStart.toISOString();
    const end = localEnd.toISOString();
    const duration = Math.round((localEnd.getTime() - localStart.getTime()) / 1000 / 60);

    console.log('TimeEntryForm submitting:', {
      id: formData.id || undefined,
      subtask_id: formData.subtask_id,
      start_time: start,
      end_time: end,
      duration,
      notes: formData.notes || undefined,
    });

    onSubmit({
      id: formData.id || undefined,
      subtask_id: formData.subtask_id,
      start_time: start,
      end_time: end,
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
          disabled={loading}
        >
          <option value="">Select a subtask</option>
          {tasks.length > 0 ? (
            tasks.map((task) =>
              task.subtasks.map((subtask: Subtask) => (
                <option key={subtask.id} value={subtask.id}>
                  {task.title} - {subtask.title}
                </option>
              ))
            )
          ) : (
            <option value="" disabled>
              {loading ? 'Loading subtasks...' : 'No subtasks available'}
            </option>
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
        <Button type="submit" variant="primary" disabled={loading}>
          {formData.id ? 'Update Time Entry' : 'Create Time Entry'}
        </Button>
      </div>
    </form>
  );
};

export default TimeEntryForm;