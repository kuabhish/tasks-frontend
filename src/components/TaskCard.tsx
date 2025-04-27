import React from 'react';
import { Task } from '../types';
import { ClockIcon, TagIcon } from 'lucide-react';
import Badge from './ui/Badge';
import useTimeStore from '../store/timeStore';

interface TaskCardProps {
  task: Task;
}

const TaskCard: React.FC<TaskCardProps> = ({ task }) => {
  const categories = useTimeStore((state) => state.categories);
  const category = categories.find((c) => c.id === task.category) || {
    id: '',
    name: 'Unknown',
    color: '#gray',
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow">
      <h3 className="text-md font-semibold text-gray-800 mb-2">{task.title}</h3>
      <p className="text-sm text-gray-600 mb-3">{task.description}</p>
      <div className="space-y-2">
        <div className="flex items-center text-sm text-gray-500">
          <ClockIcon className="h-4 w-4 mr-2" />
          <span>
            {task.startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -{' '}
            {task.endTime?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
        <div className="flex items-center text-sm text-gray-500">
          <TagIcon className="h-4 w-4 mr-2" />
          <div className="flex flex-wrap gap-1">
            {task.tags.map((tag) => (
              <Badge key={tag} variant="default" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
        <div className="flex items-center text-sm">
          <span
            className="h-3 w-3 rounded-full mr-2"
            style={{ backgroundColor: category.color }}
          ></span>
          <span>{category.name}</span>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;