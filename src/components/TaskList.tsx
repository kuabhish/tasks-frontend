import React from 'react';
import { Task } from '../types';
import TaskCard from './TaskCard';
import useTimeStore from '../store/timeStore';
import { format, isToday, isPast } from 'date-fns';

interface TaskListProps {
  title: string;
  tasks: Task[];
  onEditTask: (task: Task) => void;
}

const TaskList: React.FC<TaskListProps> = ({ title, tasks, onEditTask }) => {
  const categories = useTimeStore((state) => state.categories);
  
  const getCategoryForTask = (task: Task) => {
    return categories.find((c) => c.id === task.category) || { id: '', name: 'Unknown', color: '#gray' };
  };
  
  if (tasks.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 text-center mt-6">
        <p className="text-gray-500">No tasks found</p>
      </div>
    );
  }
  
  return (
    <div className="mt-6">
      <h2 className="text-lg font-medium mb-3">{title}</h2>
      <div className="grid grid-cols-1 gap-4">
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            category={getCategoryForTask(task)}
            onEdit={() => onEditTask(task)}
          />
        ))}
      </div>
    </div>
  );
};

export default TaskList;