import React from 'react';
import { Task, Category } from '../types';
import Card, { CardContent } from './ui/Card';
import Badge from './ui/Badge';
import Button from './ui/Button';
import { PlayIcon, PauseIcon, CheckIcon, ClockIcon, EditIcon, TrashIcon } from 'lucide-react';
import useTimeStore from '../store/timeStore';
import { formatDistance, format, isToday, isPast, isWithinInterval, addDays, isValid } from 'date-fns';

interface TaskCardProps {
  task: Task;
  category: Category;
  onEdit: (task: Task) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, category, onEdit }) => {
  const { startTracking, isTracking, activeTaskId, stopTracking, deleteTask } = useTimeStore();
  
  const isActive = isTracking && activeTaskId === task.id;
  
  const handleStartTracking = () => {
    if (isTracking && activeTaskId === task.id) {
      stopTracking();
    } else {
      startTracking(task.id);
    }
  };
  
  const getTaskStatus = () => {
    if (task.completed) {
      return {
        label: 'Completed',
        variant: 'success' as const,
      };
    }
    
    if (isActive) {
      return {
        label: 'In Progress',
        variant: 'primary' as const,
      };
    }
    
    if (task.endTime && isValid(task.endTime) && isPast(task.endTime) && !task.completed) {
      return {
        label: 'Overdue',
        variant: 'error' as const,
      };
    }
    
    if ((task.startTime && isValid(task.startTime) && isToday(task.startTime)) || 
        (task.endTime && isValid(task.endTime) && isToday(task.endTime))) {
      return {
        label: 'Today',
        variant: 'accent' as const,
      };
    }
    
    if (task.startTime && isValid(task.startTime) && isWithinInterval(new Date(), { 
      start: new Date(), 
      end: addDays(new Date(), 2)
    })) {
      return {
        label: 'Upcoming',
        variant: 'warning' as const,
      };
    }
    
    return {
      label: 'Scheduled',
      variant: 'secondary' as const,
    };
  };
  
  const status = getTaskStatus();
  
  const handleDelete = () => {
    // Confirm before deleting
    if (window.confirm(`Are you sure you want to delete "${task.title}"?`)) {
      deleteTask(task.id);
    }
  };
  
  const formatTimeRange = () => {
    const validStartTime = task.startTime && isValid(task.startTime);
    const validEndTime = task.endTime && isValid(task.endTime);

    if (validStartTime && validEndTime) {
      if (isToday(task.startTime) && isToday(task.endTime)) {
        return `Today, ${format(task.startTime, 'h:mm a')} - ${format(task.endTime, 'h:mm a')}`;
      }
      
      return `${format(task.startTime, 'MMM d, h:mm a')} - ${format(task.endTime, 'MMM d, h:mm a')}`;
    }
    
    if (validStartTime) {
      if (isToday(task.startTime)) {
        return `Today at ${format(task.startTime, 'h:mm a')}`;
      }
      
      return format(task.startTime, 'MMM d, h:mm a');
    }
    
    return 'No time set';
  };
  
  return (
    <Card className="group hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h3 className="font-medium text-gray-900">{task.title}</h3>
            <p className="text-sm text-gray-500">{formatTimeRange()}</p>
          </div>
          <Badge variant={status.variant}>{status.label}</Badge>
        </div>
        
        {task.description && (
          <p className="text-sm text-gray-700 mb-3 line-clamp-2">{task.description}</p>
        )}
        
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center">
            <span
              className="h-3 w-3 rounded-full mr-2"
              style={{ backgroundColor: category.color }}
            ></span>
            <span className="text-xs text-gray-600">{category.name}</span>
            
            {task.isRecurring && (
              <Badge variant="secondary" className="ml-2">
                Recurring
              </Badge>
            )}
          </div>
          
          <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(task)}
              className="h-8 w-8 p-0"
            >
              <EditIcon className="h-4 w-4" />
            </Button>
            <Button
              variant={isActive ? 'primary' : 'ghost'}
              size="sm"
              onClick={handleStartTracking}
              className="h-8 w-8 p-0"
            >
              {isActive ? <PauseIcon className="h-4 w-4" /> : <PlayIcon className="h-4 w-4" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              className="h-8 w-8 p-0 text-error-500 hover:text-error-700"
            >
              <TrashIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {task.tags && task.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1">
            {task.tags.map((tag) => (
              <Badge key={tag} variant="default" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TaskCard;