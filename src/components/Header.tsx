import React from 'react';
import { ClockIcon } from 'lucide-react';
import Button from './ui/Button';
import useTimeStore from '../store/timeStore';
import { format, isValid } from 'date-fns';

const Header: React.FC = () => {
  const { currentView, setCurrentView, selectedDate, setSelectedDate, isTracking, activeTaskId, stopTracking } = useTimeStore();
  const tasks = useTimeStore((state) => state.tasks);

  const handleViewChange = (view: 'day' | 'week' | 'month') => {
    setCurrentView(view);
  };

  const handleDateChange = (offset: number) => {
    const newDate = new Date(selectedDate);
    
    if (currentView === 'day') {
      newDate.setDate(newDate.getDate() + offset);
    } else if (currentView === 'week') {
      newDate.setDate(newDate.getDate() + (offset * 7));
    } else if (currentView === 'month') {
      newDate.setMonth(newDate.getMonth() + offset);
    }
    
    setSelectedDate(newDate);
  };

  const activeTask = tasks.find(task => task.id === activeTaskId);

  const formatSelectedDate = () => {
    if (!isValid(selectedDate)) {
      setSelectedDate(new Date()); // Reset to current date if invalid
      return 'Invalid Date';
    }

    if (currentView === 'day') {
      return format(selectedDate, 'MMMM d, yyyy');
    } else if (currentView === 'week') {
      return `Week of ${format(selectedDate, 'MMM d')}`;
    } else {
      return format(selectedDate, 'MMMM yyyy');
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-2">
            <ClockIcon className="h-6 w-6 text-primary-600" />
            <h1 className="text-xl font-semibold text-gray-900">TimeFlow</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            {isTracking && activeTask && (
              <div className="flex items-center bg-green-50 px-3 py-1 rounded-md animate-pulse">
                <span className="text-sm font-medium text-green-800 mr-2">
                  Tracking: {activeTask.title}
                </span>
                <Button 
                  variant="danger" 
                  size="sm" 
                  onClick={() => stopTracking()}
                >
                  Stop
                </Button>
              </div>
            )}
            
            <div className="flex items-center space-x-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleDateChange(-1)}
              >
                Previous
              </Button>
              
              <span className="text-sm font-medium">
                {formatSelectedDate()}
              </span>
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleDateChange(1)}
              >
                Next
              </Button>
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setSelectedDate(new Date())}
              >
                Today
              </Button>
            </div>
            
            <div className="flex items-center space-x-1 bg-gray-100 p-1 rounded-md">
              <Button 
                variant={currentView === 'day' ? 'primary' : 'ghost'} 
                size="sm"
                onClick={() => handleViewChange('day')}
              >
                Day
              </Button>
              <Button 
                variant={currentView === 'week' ? 'primary' : 'ghost'} 
                size="sm"
                onClick={() => handleViewChange('week')}
              >
                Week
              </Button>
              <Button 
                variant={currentView === 'month' ? 'primary' : 'ghost'} 
                size="sm"
                onClick={() => handleViewChange('month')}
              >
                Month
              </Button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;