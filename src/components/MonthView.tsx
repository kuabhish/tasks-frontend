import React from 'react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isToday, isSameDay } from 'date-fns';
import useTimeStore from '../store/timeStore';
import { Task } from '../types';

interface MonthViewProps {
  date: Date;
  onEditTask: (task: Task) => void;
}

const MonthView: React.FC<MonthViewProps> = ({ date, onEditTask }) => {
  const tasks = useTimeStore((state) => state.tasks);
  const categories = useTimeStore((state) => state.categories);
  
  // Get all days in the current month view (including days from prev/next months that appear in the calendar)
  const monthStart = startOfMonth(date);
  const monthEnd = endOfMonth(date);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  
  const days = [];
  let day = calendarStart;
  
  while (day <= calendarEnd) {
    days.push(day);
    day = addDays(day, 1);
  }
  
  // Group tasks by day
  const getTasksForDay = (day: Date) => {
    return tasks.filter((task) => isSameDay(task.startTime, day));
  };
  
  // Create weeks
  const weeks = [];
  let daysInWeek = [];
  
  for (let i = 0; i < days.length; i++) {
    daysInWeek.push(days[i]);
    
    if (daysInWeek.length === 7) {
      weeks.push(daysInWeek);
      daysInWeek = [];
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <h2 className="text-lg font-medium">{format(date, 'MMMM yyyy')}</h2>
      </div>
      
      <div className="grid grid-cols-7 border-b border-gray-200">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((dayName) => (
          <div key={dayName} className="px-2 py-3 text-center border-r last:border-r-0 border-gray-200">
            <p className="text-sm font-medium text-gray-500">{dayName}</p>
          </div>
        ))}
      </div>
      
      <div>
        {weeks.map((week, weekIndex) => (
          <div key={weekIndex} className="grid grid-cols-7 border-b last:border-b-0 border-gray-200">
            {week.map((day, dayIndex) => {
              const dayTasks = getTasksForDay(day);
              const isCurrentMonth = isSameMonth(day, date);
              const isCurrentDay = isToday(day);
              
              return (
                <div
                  key={dayIndex}
                  className={`min-h-[100px] border-r last:border-r-0 border-gray-200 p-2 ${
                    !isCurrentMonth ? 'bg-gray-50 text-gray-400' : ''
                  } ${isCurrentDay ? 'bg-blue-50' : ''}`}
                >
                  <div className="text-right">
                    <span className={`inline-block w-6 h-6 rounded-full text-center ${
                      isCurrentDay 
                        ? 'bg-primary-600 text-white' 
                        : 'text-gray-700'
                    }`}>
                      {format(day, 'd')}
                    </span>
                  </div>
                  
                  <div className="mt-1 space-y-1">
                    {dayTasks.slice(0, 3).map((task) => {
                      const category = categories.find((c) => c.id === task.category);
                      return (
                        <div
                          key={task.id}
                          className="text-xs p-1 rounded truncate cursor-pointer hover:bg-gray-100"
                          style={{ 
                            backgroundColor: `${category?.color}20`,
                            borderLeft: `2px solid ${category?.color}` 
                          }}
                          onClick={() => onEditTask(task)}
                        >
                          {task.title}
                        </div>
                      );
                    })}
                    
                    {dayTasks.length > 3 && (
                      <div className="text-xs text-gray-500 text-center">
                        +{dayTasks.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MonthView;