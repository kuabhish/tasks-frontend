import React, { useState } from 'react';
import { Task } from '../types';
import Input from './ui/Input';
import Select from './ui/Select';
import Button from './ui/Button';
import useTimeStore from '../store/timeStore';
import { X } from 'lucide-react';
import { format, addHours } from 'date-fns';

interface TaskFormProps {
  initialTask?: Partial<Task>;
  onSubmit: (task: Omit<Task, 'id'>) => void;
  onCancel: () => void;
}

const TaskForm: React.FC<TaskFormProps> = ({
  initialTask,
  onSubmit,
  onCancel,
}) => {
  const categories = useTimeStore((state) => state.categories);

  // Initialize endTime to 1 hour after startTime if not provided
  const [formData, setFormData] = useState<Partial<Task>>({
    title: initialTask?.title || '',
    description: initialTask?.description || '',
    category: initialTask?.category || categories[0]?.id || '',
    startTime: initialTask?.startTime || new Date(),
    endTime: initialTask?.endTime || addHours(initialTask?.startTime || new Date(), 1),
    completed: initialTask?.completed || false,
    isRecurring: initialTask?.isRecurring || false,
    recurringPattern: initialTask?.recurringPattern || undefined,
    tags: initialTask?.tags || [],
    color: initialTask?.color || undefined,
  });

  const [newTag, setNewTag] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleDateChange = (name: string, value: string) => {
    try {
      const newDate = new Date(value);
      setFormData((prev) => ({ ...prev, [name]: newDate }));

      if (errors[name]) {
        setErrors((prev) => ({ ...prev, [name]: '' }));
      }
    } catch {
      setErrors((prev) => ({ ...prev, [name]: 'Invalid date format' }));
    }
  };

  const handleCheckboxChange = (name: string, checked: boolean) => {
    setFormData((prev) => ({ ...prev, [name]: checked }));
  };

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags?.includes(newTag.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...(prev.tags || []), newTag.trim()],
      }));
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags?.filter((tag) => tag !== tagToRemove) || [],
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    const newErrors: Record<string, string> = {};

    if (!formData.title?.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.category) {
      newErrors.category = 'Category is required';
    }

    if (!formData.startTime) {
      newErrors.startTime = 'Start time is required';
    }

    if (!formData.endTime) {
      newErrors.endTime = 'End time is required';
    }

    if (formData.endTime && formData.startTime && formData.endTime <= formData.startTime) {
      newErrors.endTime = 'End time must be after start time';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Submit the form
    onSubmit({
      title: formData.title!,
      description: formData.description,
      category: formData.category!,
      startTime: formData.startTime!,
      endTime: formData.endTime!,
      completed: formData.completed || false,
      isRecurring: formData.isRecurring || false,
      recurringPattern: formData.recurringPattern,
      tags: formData.tags || [],
      color: formData.color,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Title"
        name="title"
        value={formData.title || ''}
        onChange={handleChange}
        placeholder="Task title"
        fullWidth
        error={errors.title}
      />

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description || ''}
          onChange={handleChange}
          placeholder="Task description"
          className="w-full rounded-md border border-gray-300 py-2 px-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          rows={3}
        />
      </div>

      <Select
        label="Category"
        name="category"
        value={formData.category || ''}
        onChange={(value) => setFormData((prev) => ({ ...prev, category: value }))}
        options={categories.map((category) => ({
          value: category.id,
          label: category.name,
        }))}
        fullWidth
        error={errors.category}
      />

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="startTime" className="block text-sm font-medium text-gray-700 mb-1">
            Start Time
          </label>
          <input
            type="datetime-local"
            id="startTime"
            name="startTime"
            value={formData.startTime ? format(formData.startTime, "yyyy-MM-dd'T'HH:mm") : ''}
            onChange={(e) => handleDateChange('startTime', e.target.value)}
            className="w-full rounded-md border border-gray-300 py-2 px-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            required
          />
          {errors.startTime && (
            <p className="mt-1 text-sm text-error-500">{errors.startTime}</p>
          )}
        </div>

        <div>
          <label htmlFor="endTime" className="block text-sm font-medium text-gray-700 mb-1">
            End Time
          </label>
          <input
            type="datetime-local"
            id="endTime"
            name="endTime"
            value={formData.endTime ? format(formData.endTime, "yyyy-MM-dd'T'HH:mm") : ''}
            onChange={(e) => handleDateChange('endTime', e.target.value)}
            className="w-full rounded-md border border-gray-300 py-2 px-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            required
          />
          {errors.endTime && (
            <p className="mt-1 text-sm text-error-500">{errors.endTime}</p>
          )}
        </div>
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          id="completed"
          checked={formData.completed || false}
          onChange={(e) => handleCheckboxChange('completed', e.target.checked)}
          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
        />
        <label htmlFor="completed" className="ml-2 block text-sm text-gray-700">
          Mark as completed
        </label>
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          id="isRecurring"
          checked={formData.isRecurring || false}
          onChange={(e) => handleCheckboxChange('isRecurring', e.target.checked)}
          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
        />
        <label htmlFor="isRecurring" className="ml-2 block text-sm text-gray-700">
          This is a recurring task
        </label>
      </div>

      {formData.isRecurring && (
        <div className="ml-6 p-3 border border-gray-200 rounded-md bg-gray-50">
          <Select
            label="Recurring Type"
            name="recurringType"
            value={formData.recurringPattern?.type || 'daily'}
            onChange={(value) =>
              setFormData((prev) => ({
                ...prev,
                recurringPattern: {
                  ...prev.recurringPattern,
                  type: value as 'daily' | 'weekly' | 'monthly',
                },
              }))
            }
            options={[
              { value: 'daily', label: 'Daily' },
              { value: 'weekly', label: 'Weekly' },
              { value: 'monthly', label: 'Monthly' },
            ]}
            fullWidth
          />

          {formData.recurringPattern?.type === 'weekly' && (
            <div className="mt-3">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Repeat on
              </label>
              <div className="flex flex-wrap gap-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
                  <button
                    key={day}
                    type="button"
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${formData.recurringPattern?.days?.includes(index)
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    onClick={() => {
                      const days = formData.recurringPattern?.days || [];
                      const newDays = days.includes(index)
                        ? days.filter((d) => d !== index)
                        : [...days, index];

                      setFormData((prev) => ({
                        ...prev,
                        recurringPattern: {
                          ...prev.recurringPattern,
                          days: newDays,
                        },
                      }));
                    }}
                  >
                    {day[0]}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div>
        <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">
          Tags

        </label>
        <div className="flex">
          <Input
            id="tags"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            placeholder="Add a tag"
            className="rounded-r-none"
          />
          <Button type="button" onClick={handleAddTag} className="rounded-l-none">
            Add
          </Button>
        </div>
        {formData.tags && formData.tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {formData.tags.map((tag) => (
              <div
                key={tag}
                className="bg-gray-100 text-gray-700 rounded-full px-3 py-1 text-sm flex items-center"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="ml-1 text-gray-500 hover:text-gray-700"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" variant="primary">
          {initialTask?.id ? 'Update Task' : 'Create Task'}
        </Button>
      </div>
    </form>
  );
};

export default TaskForm;