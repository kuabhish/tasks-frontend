import React from 'react';
import { format, addHours, startOfDay, endOfDay, isWithinInterval, differenceInMinutes } from 'date-fns';
import useTimeStore from '../store/timeStore';
import { Task } from '../types';
import Badge from './ui/Badge';

interface DayViewProps {
  date: Date;
  onEditTask: (task: Task) => void;
}

const DayView: React.FC<DayViewProps> = ({ date, onEditTask }) => {
  const tasks = useTimeStore((state) => state.tasks);
  const categories = useTimeStore((state) => state.categories);

  // Create hour slots for the day (24 hours)
  const hours = Array.from({ length: 24 }).map((_, index) => {
    const hour = addHours(startOfDay(date), index);
    return {
      hour,
      label: format(hour, 'h a'),
    };
  });

  // Get tasks for the current day
  const tasksForDay = tasks.filter((task) => {
    const dayStart = startOfDay(date);
    const dayEnd = endOfDay(date);

    return (
      isWithinInterval(task.startTime, { start: dayStart, end: dayEnd }) ||
      (task.endTime && isWithinInterval(task.endTime, { start: dayStart, end: dayEnd })) ||
      (task.endTime && task.startTime <= dayStart && task.endTime >= dayEnd)
    );
  });

  const getCategoryForTask = (task: Task) => {
    return categories.find((c) => c.id === task.category) || { id: '', name: 'Unknown', color: '#gray' };
  };

  // Calculate task position and height
  const calculateTaskStyle = (task: Task) => {
    const dayStart = startOfDay(date);
    const startMinutes = differenceInMinutes(task.startTime, dayStart);
    const endMinutes = task.endTime ? differenceInMinutes(task.endTime, dayStart) : startMinutes + 60; // Default to 1 hour if no endTime
    const durationMinutes = endMinutes - startMinutes;

    // Each hour is 80px tall, so 1 minute = 80/60 px
    const pixelsPerMinute = 80 / 60;
    const top = startMinutes * pixelsPerMinute;
    const height = durationMinutes * pixelsPerMinute;

    return {
      top: `${top}px`,
      height: `${height}px`,
    };
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <h2 className="text-lg font-medium">{format(date, 'EEEE, MMMM d, yyyy')}</h2>
      </div>

      <div className="relative" style={{ height: `${24 * 80}px` }}> {/* 24 hours * 80px per hour */}
        {/* Hour Slots */}
        {hours.map(({ hour, label }) => {
          const isCurrentHour =
            new Date().getHours() === hour.getHours() &&
            new Date().getDate() === hour.getDate() &&
            new Date().getMonth() === hour.getMonth();

          return (
            <div
              key={label}
              className={`flex h-[80px] border-b border-gray-100 ${isCurrentHour ? 'bg-blue-50' : ''}`}
            >
              <div className="w-20 flex-shrink-0 py-4 px-4 flex flex-col items-center border-r border-gray-100">
                <span className={`text-sm font-medium ${isCurrentHour ? 'text-blue-700' : 'text-gray-500'}`}>
                  {label}
                </span>
                {isCurrentHour && (
                  <div className="mt-1 w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                )}
              </div>
              <div className="flex-grow"></div>
            </div>
          );
        })}

        {/* Tasks */}
        <div className="absolute top-0 left-20 right-0">
          {tasksForDay.map((task) => {
            const category = getCategoryForTask(task);
            const style = calculateTaskStyle(task);

            return (
              <div
                key={task.id}
                className="absolute left-2 right-2 rounded-md text-sm shadow-sm cursor-pointer animate-fade-in overflow-hidden"
                style={{
                  ...style,
                  backgroundColor: category.color,
                  color: '#fff', // White text for contrast
                  opacity: 0.9,
                }}
                onClick={() => onEditTask(task)}
              >
                <div className="p-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{task.title}</span>
                    <div className="text-xs">
                      {format(task.startTime, 'h:mm a')} - {task.endTime && format(task.endTime, 'h:mm a')}
                    </div>
                  </div>

                  {task.tags && task.tags.length > 0 && (
                    <div className="mt-1 flex flex-wrap gap-1">
                      {task.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="default" className="text-xs bg-white bg-opacity-30 text-white">
                          {tag}
                        </Badge>
                      ))}
                      {task.tags.length > 3 && (
                        <Badge variant="default" className="text-xs bg-white bg-opacity-30 text-white">
                          +{task.tags.length - 3}
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default DayView;