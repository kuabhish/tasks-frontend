import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  startOfDay,
  endOfDay,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  subDays,
  formatISO,
} from 'date-fns';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import DayView from '../components/DayView';
import WeekView from '../components/WeekView';
import MonthView from '../components/MonthView';
import TimeEntryForm from '../components/TimeEntryForm';
import Modal from '../components/Modal';
import Button from '../components/ui/Button';
import { PlusIcon, ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import useTimeStore from '../store/timeStore';
import useTaskStore from '../store/taskStore';
import useAuthStore from '../store/authStore';
import { fetchTimeEntries, createTimeEntry, updateTimeEntry, fetchTasks } from '../utils/api';
import { toast } from 'react-toastify';
import { Subtask, Task, TimeEntry } from '../types/task';

const Timeline: React.FC = () => {
  const { timeEntries, setTimeEntries, addTimeEntry, updateTimeEntry: updateStoreTimeEntry } = useTimeStore();
  const { tasks, setTasks } = useTaskStore();
  const role = useAuthStore((state) => state.user?.role);
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get('projectId');
  const [view, setView] = useState<'day' | 'week' | 'month'>('day');
  const [currentDate, setCurrentDate] = useState(() => {
    const now = new Date();
    console.log('Timeline initialized currentDate:', now.toISOString());
    return now;
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<{
    id?: string;
    subtask_id: string;
    start_time: string;
    end_time: string;
    notes?: string;
  } | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const taskResponse = await fetchTasks();
        console.log('Fetched tasks response:', taskResponse.data);
        const taskData = Array.isArray(taskResponse.data.data) ? taskResponse.data.data : [];
        setTasks(taskData);

        // Adjust currentDate to UTC by removing local timezone offset (IST: +5:30)
        const offsetMs = currentDate.getTimezoneOffset() * 60 * 1000;
        const utcCurrentDate = new Date(currentDate.getTime() + offsetMs);

        console.log("debug time ", offsetMs, utcCurrentDate)
        let startDate: Date, endDate: Date;
        if (view === 'day') {
          startDate = startOfDay(utcCurrentDate);
          endDate = endOfDay(utcCurrentDate);
        } else if (view === 'week') {
          startDate = startOfWeek(utcCurrentDate, { weekStartsOn: 0 });
          endDate = endOfWeek(utcCurrentDate, { weekStartsOn: 0 });
        } else {
          startDate = startOfMonth(utcCurrentDate);
          endDate = endOfMonth(utcCurrentDate);
        }

        console.log('Fetching time entries for:', {
          start_date: formatISO(startDate),
          end_date: formatISO(endDate),
          project_id: projectId,
        });

        const timeResponse = await fetchTimeEntries({
          project_id: projectId || undefined,
          start_date: formatISO(startDate),
          end_date: formatISO(endDate),
        });

        console.log('Fetched time entries response:', timeResponse.data);

        // Ensure timeResponse.data is an array
        const timeData = Array.isArray(timeResponse?.data?.data) ? timeResponse.data.data : [];
        // if (!Array.isArray(timeResponse.data)) {
        //   console.warn('timeResponse.data is not an array:', timeResponse.data);
        //   toast.error('Invalid time entries data received');
        // }

        const enrichedEntries = timeData.map((entry: TimeEntry) => {
          const subtask = taskData
            .flatMap((t: Task) => t.subtasks)
            .find((s: Subtask) => s.id === entry.subtaskId);
          return {
            ...entry,
            subtask: subtask || {
              title: 'Unknown',
              tags: [],
              taskId: '',
              status: 'Not Started',
              createdAt: '',
              updatedAt: '',
            },
          };
        });

        setTimeEntries(enrichedEntries);
      } catch (err: any) {
        console.error('Error fetching data:', err);
        toast.error(err.response?.data?.error || 'Failed to fetch data');
      }
    };
    loadData();
  }, [projectId, view, currentDate, setTimeEntries, setTasks]);

  const handleOpenModal = () => {
    setEditingEntry(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingEntry(null);
  };

  const handleTimeEntrySubmit = async (data: {
    id?: string;
    subtask_id: string;
    start_time: string;
    end_time: string;
    duration: number;
    notes?: string;
  }) => {
    try {
      let response;
      const subtask = tasks
        .flatMap((t) => t.subtasks)
        .find((s) => s.id === data.subtask_id) || {
        title: 'Unknown',
        tags: [],
        taskId: '',
        status: 'Not Started',
        createdAt: '',
        updatedAt: '',
      };

      if (data.id) {
        response = await updateTimeEntry(data.id, {
          subtask_id: data.subtask_id,
          start_time: data.start_time,
          end_time: data.end_time,
          duration: data.duration,
          notes: data.notes,
        });
        updateStoreTimeEntry({
          ...response.data.timeEntry,
          subtask,
        });
        toast.success('Time entry updated successfully!');
      } else {
        response = await createTimeEntry({
          subtask_id: data.subtask_id,
          start_time: data.start_time,
          end_time: data.end_time,
          duration: data.duration,
          notes: data.notes,
        });
        console.log("debug -- ", response)
        addTimeEntry({
          ...response.data.data.timeEntry,
          subtask,
        });
        toast.success('Time entry created successfully!');
      }

      handleCloseModal();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to save time entry');
    }
  };

  const handleEditTimeEntry = (entry: TimeEntry) => {
    setEditingEntry({
      id: entry.id,
      subtask_id: entry.subtaskId,
      start_time: entry.startTime,
      end_time: entry.endTime,
      notes: entry.notes,
    });
    setIsModalOpen(true);
  };

  const handleTimeSlotClick = (startTime: string, endTime: string) => {
    if (!['Admin', 'Project Manager'].includes(role || '')) {
      toast.error('You do not have permission to create time entries.');
      return;
    }
    console.log('Time slot clicked:', { startTime, endTime });
    setEditingEntry({
      subtask_id: '',
      start_time: startTime,
      end_time: endTime,
      notes: '',
    });
    setIsModalOpen(true);
  };

  const handlePrev = () => {
    if (view === 'day') {
      setCurrentDate(subDays(currentDate, 1));
    } else if (view === 'week') {
      setCurrentDate(subDays(currentDate, 7));
    } else {
      setCurrentDate(subDays(currentDate, 30));
    }
  };

  const handleNext = () => {
    if (view === 'day') {
      setCurrentDate(addDays(currentDate, 1));
    } else if (view === 'week') {
      setCurrentDate(addDays(currentDate, 7));
    } else {
      setCurrentDate(addDays(currentDate, 30));
    }
  };

  console.log('Timeline currentDate:', currentDate);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Header />
      <div className="flex-1 flex">
        <Sidebar />
        <main className="flex-1 p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Timeline</h1>
            <div className="flex items-center space-x-4">
              <div className="flex space-x-2">
                <Button
                  variant={view === 'day' ? 'primary' : 'outline'}
                  onClick={() => setView('day')}
                >
                  Day
                </Button>
                <Button
                  variant={view === 'week' ? 'primary' : 'outline'}
                  onClick={() => setView('week')}
                >
                  Week
                </Button>
                <Button
                  variant={view === 'month' ? 'primary' : 'outline'}
                  onClick={() => setView('month')}
                >
                  Month
                </Button>
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" onClick={handlePrev}>
                  <ChevronLeftIcon className="h-4 w-4" />
                </Button>
                <Button variant="outline" onClick={handleNext}>
                  <ChevronRightIcon className="h-4 w-4" />
                </Button>
              </div>
              {['Admin', 'Project Manager'].includes(role || '') && (
                <Button variant="primary" onClick={handleOpenModal}>
                  <PlusIcon className="h-4 w-4 mr-2" />
                  New Time Entry
                </Button>
              )}
            </div>
          </div>
          {view === 'day' && (
            <DayView
              date={currentDate}
              onEditTimeEntry={handleEditTimeEntry}
              onTimeSlotClick={handleTimeSlotClick}
            />
          )}
          {view === 'week' && (
            <WeekView startDate={currentDate} onEditTimeEntry={handleEditTimeEntry} />
          )}
          {view === 'month' && (
            <MonthView date={currentDate} onEditTimeEntry={handleEditTimeEntry} />
          )}
        </main>
      </div>
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingEntry?.id ? 'Edit Time Entry' : 'Create New Time Entry'}
        maxWidth="lg"
      >
        <TimeEntryForm
          onSubmit={handleTimeEntrySubmit}
          onCancel={handleCloseModal}
          initialData={editingEntry}
        />
      </Modal>
    </div>
  );
};

export default Timeline;