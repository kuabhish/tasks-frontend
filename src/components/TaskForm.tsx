import { useForm } from 'react-hook-form';
import Button from './ui/Button';
import { Task } from '../types/task';

interface TaskFormProps {
  onSubmit: (data: Omit<Task, 'id' | 'subtasks'>) => void;
  onCancel: () => void;
  initialData?: Partial<Omit<Task, 'id' | 'subtasks'>>;
  task?: Task;
}

const TaskForm: React.FC<TaskFormProps> = ({ onSubmit, onCancel, initialData, task }) => {
  const { register, handleSubmit, formState: { errors } } = useForm<Omit<Task, 'id' | 'subtasks'>>({
    defaultValues: task || initialData || {
      status: 'Not Started',
      priority: 'Medium',
      tags: [],
      project_id: initialData?.project_id,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Title</label>
        <input
          {...register('title', { required: 'Title is required' })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
        {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>}
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Description</label>
        <textarea
          {...register('description')}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          rows={4}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Status</label>
        <select
          {...register('status', { required: 'Status is required' })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        >
          <option value="Not Started">Not Started</option>
          <option value="In Progress">In Progress</option>
          <option value="Completed">Completed</option>
        </select>
        {errors.status && <p className="mt-1 text-sm text-red-600">{errors.status.message}</p>}
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Priority</label>
        <select
          {...register('priority', { required: 'Priority is required' })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        >
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
        </select>
        {errors.priority && <p className="mt-1 text-sm text-red-600">{errors.priority.message}</p>}
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Due Date (Optional)</label>
        <input
          type="date"
          {...register('due_date')}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Tags (comma-separated, Optional)</label>
        <input
          {...register('tags')}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          placeholder="e.g., frontend, urgent"
          onChange={(e) => {
            const value = e.target.value;
            e.target.value = value.split(',').map((tag) => tag.trim()).filter(Boolean).join(',');
          }}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Estimated Duration (hours, Optional)</label>
        <input
          type="number"
          {...register('estimated_duration', {
            min: { value: 0, message: 'Estimated duration must be positive' },
          })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          min="0"
          step="1"
        />
        {errors.estimated_duration && <p className="mt-1 text-sm text-red-600">{errors.estimated_duration.message}</p>}
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Actual Duration (hours, Optional)</label>
        <input
          type="number"
          {...register('actual_duration', {
            min: { value: 0, message: 'Actual duration must be positive' },
          })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          min="0"
          step="1"
        />
        {errors.actual_duration && <p className="mt-1 text-sm text-red-600">{errors.actual_duration.message}</p>}
      </div>
      {initialData?.project_id && (
        <input
          type="hidden"
          {...register('project_id')}
          value={initialData.project_id}
        />
      )}
      <div className="flex justify-end space-x-2">
        <Button variant="outline" type="button" onClick={onCancel}>
          Cancel
        </Button>
        <Button variant="primary" type="submit">
          {task ? 'Update' : 'Create'}
        </Button>
      </div>
    </form>
  );
};

export default TaskForm;