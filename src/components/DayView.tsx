import React, { MouseEvent } from 'react';
import {
  format,
  addHours,
  startOfDay,
  endOfDay,
  isWithinInterval,
  differenceInMinutes,
  addMinutes,
  formatISO,
} from 'date-fns';
import useTimeStore from '../store/timeStore';
import { TimeEntry } from '../types/task';
import Badge from './ui/Badge';
import { toast } from 'react-toastify';

interface DayViewProps {
  date: Date;
  onEditTimeEntry: (timeEntry: TimeEntry) => void;
  onTimeSlotClick?: (startTime: string, endTime: string) => void;
}

const DayView: React.FC<DayViewProps> = ({ date, onEditTimeEntry, onTimeSlotClick }) => {
  const timeEntries = useTimeStore((state) => state.timeEntries);
  const categories = useTimeStore((state) => state.categories);

  console.log('DayView received date:', date.toISOString());

  const utcDate = new Date(date.getTime());

  console.log('DayView date (UTC):', utcDate.toISOString());
  console.log('DayView timeEntries:', timeEntries);



  const entriesForDay = timeEntries.filter((entry) => {

    const dayStart = startOfDay(utcDate);
    const dayEnd = endOfDay(utcDate);
    const startTime = new Date(entry.startTime);
    const endTime = new Date(entry.endTime);

    console.log(`Processing entry ${entry.id}:`, {
      rawStartTime: entry.startTime,
      rawEndTime: entry.endTime,
      parsedStartTime: startTime.toISOString(),
      parsedEndTime: endTime.toISOString(),
      dayStart: dayStart.toISOString(),
      dayEnd: dayEnd.toISOString(),
    });

    const isInDay =
      isWithinInterval(startTime, { start: dayStart, end: dayEnd }) ||
      isWithinInterval(endTime, { start: dayStart, end: dayEnd }) ||
      (startTime <= dayStart && endTime >= dayEnd);

    console.log(`Entry ${entry.id} isInDay:`, isInDay);
    return isInDay;
  });

  const getCategoryForEntry = (entry: TimeEntry) => {
    const tag = entry.subtask?.tags?.[0] || 'default';
    return (
      categories.find((c) => c.name.toLowerCase() === tag.toLowerCase()) || {
        id: 'default',
        name: 'Default',
        color: '#6B7280',
      }
    );
  };

  const calculateEntryStyle = (entry: TimeEntry) => {
    const dayStart = startOfDay(utcDate);
    const startTime = new Date(entry.startTime);
    const endTime = new Date(entry.endTime);
    const startMinutes = differenceInMinutes(startTime, dayStart);
    const endMinutes = differenceInMinutes(endTime, dayStart);
    const durationMinutes = endMinutes - startMinutes;

    const pixelsPerMinute = 80 / 60;
    const top = Math.max(startMinutes * pixelsPerMinute, 0);
    const height = durationMinutes * pixelsPerMinute;

    return {
      top: `${top}px`,
      height: `${height}px`,
    };
  };

  const handleGridClick = (e: MouseEvent<HTMLDivElement>) => {
    if (!onTimeSlotClick) return;

    if (e.target !== e.currentTarget) return;

    const grid = e.currentTarget.getBoundingClientRect();
    const clickY = e.clientY - grid.top;
    const gridHeight = grid.height;

    const minutesPerPixel = (24 * 60) / gridHeight;
    const clickedMinutes = clickY * minutesPerPixel;
    const roundedMinutes = Math.round(clickedMinutes / 15) * 15;

    const startTime = addMinutes(startOfDay(utcDate), roundedMinutes);
    const endTime = addMinutes(startTime, 60);

    const startTimeISO = formatISO(startTime);
    const endTimeISO = formatISO(endTime);

    console.log('Grid clicked:', {
      clickY,
      gridHeight,
      clickedMinutes,
      roundedMinutes,
      startTime: startTimeISO,
      endTime: endTimeISO,
    });

    onTimeSlotClick(startTimeISO, endTimeISO);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <h2 className="text-lg font-medium">{format(date, 'EEEE, MMMM d, yyyy')}</h2>
      </div>

      <div
        className="relative"
        style={{ height: `${24 * 80}px` }}
        onClick={handleGridClick}
      >
        {Array.from({ length: 24 }).map((_, index) => {
          const hour = addHours(startOfDay(utcDate), index);
          const label = format(hour, 'h a');
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

        <div className="absolute top-0 left-20 right-0">
          {entriesForDay.map((entry) => {
            const category = getCategoryForEntry(entry);
            const style = calculateEntryStyle(entry);

            return (
              <div
                key={entry.id}
                className="absolute left-2 right-2 rounded-md text-sm shadow-sm cursor-pointer animate-fade-in overflow-hidden"
                style={{
                  ...style,
                  backgroundColor: category.color,
                  color: '#fff',
                  opacity: 0.9,
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  onEditTimeEntry(entry);
                }}
              >
                <div className="p-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{entry.subtask?.title || 'Untitled'}</span>
                    <div className="text-xs">
                      {format(new Date(entry.startTime), 'h:mm a')} -{' '}
                      {format(new Date(entry.endTime), 'h:mm a')}
                    </div>
                  </div>

                  {entry.subtask?.tags && entry.subtask.tags.length > 0 && (
                    <div className="mt-1 flex flex-wrap gap-1">
                      {entry.subtask.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="default" className="text-xs bg-white bg-opacity-30 text-white">
                          {tag}
                        </Badge>
                      ))}
                      {entry.subtask.tags.length > 3 && (
                        <Badge variant="default" className="text-xs bg-white bg-opacity-30 text-white">
                          +{entry.subtask.tags.length - 3}
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
