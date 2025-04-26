import React from 'react';
import { format, addDays, startOfWeek, getDay, isToday, isSameDay } from 'date-fns';
import useTimeStore from '../store/timeStore';
import { Task } from '../types';
import Card from './ui/Card';

interface WeekViewProps {
  startDate: Date;
  onEditTask: (task: Task) => void;
}

const WeekView: React.FC<WeekViewProps> = ({ startDate, onEditTask }) => {
  const tasks = useTimeStore((state) => state.tasks);
  const categories = useTimeStore((state) => state.categories);

  // Create days of the week
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const weekStart = startOfWeek(startDate);
  
  const days = Array.from({ length: 7 }).map((_, index) => {
    const date = addDays(weekStart, index);
    return {
      date,
      dayName: dayNames[getDay(date)],
      shortDay: format(date, 'EEE'),
      dayOfMonth: format(date, 'd'),
    };
  });
  
  // Group tasks by day
  const tasksByDay = days.map(({ date }) => {
    return tasks.filter((task) => isSameDay(task.startTime, date));
  });

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <h2 className="text-lg font-medium">
          Week of {format(weekStart, 'MMMM d, yyyy')}
        </h2>
      </div>
      
      <div className="grid grid-cols-7 border-b border-gray-200">
        {days.map((day, index) => (
          <div 
            key={day.shortDay} 
            className={`px-2 py-3 text-center border-r last:border-r-0 border-gray-200 ${
              isToday(day.date) ? 'bg-blue-50' : ''
            }`}
          >
            <p className="text-sm font-medium">{day.shortDay}</p>
            <p className={`text-2xl font-semibold ${isToday(day.date) ? 'text-blue-700' : 'text-gray-700'}`}>
              {day.dayOfMonth}
            </p>
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-7 min-h-[500px]">
        {days.map((day, index) => (
          <div 
            key={day.shortDay} 
            className={`border-r last:border-r-0 border-gray-200 p-2 ${
              isToday(day.date) ? 'bg-blue-50' : ''
            }`}
          >
            {tasksByDay[index].length === 0 ? (
              <div className="h-full flex items-center justify-center">
                <span className="text-sm text-gray-400">No tasks</span>
              </div>
            ) : (
              <div className="space-y-2">
                {tasksByDay[index].map((task) => {
                  const category = categories.find((c) => c.id === task.category);
                  return (
                    <div
                      key={task.id}
                      className="p-2 rounded-md text-sm bg-white border border-gray-200 hover:border-primary-200 shadow-sm cursor-pointer"
                      onClick={() => onEditTask(task)}
                      style={{
                        borderLeftWidth: '3px',
                        borderLeftColor: category?.color || '#ddd',
                      }}
                    >
                      <div className="font-medium truncate">{task.title}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {format(task.startTime, 'h:mm a')}
                        {task.endTime && ` - ${format(task.endTime, 'h:mm a')}`}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default WeekView;