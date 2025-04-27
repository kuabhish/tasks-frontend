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
import ProjectSidebar from '../components/ProjectSidebar';
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
import { fetchTimeEntries, createTimeEntry, fetchTasks } from '../utils/api';
import { toast } from 'react-toastify';
import { Subtask, Task, TimeEntry } from '../types/task';

const Timeline: React.FC = () => {
  const { timeEntries, setTimeEntries, addTimeEntry } = useTimeStore();
  const { tasks, setTasks } = useTaskStore();
  const role = useAuthStore((state) => state.user?.role);
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get('projectId');
  const [view, setView] = useState<'day' | 'week' | 'month'>('day');
  const [currentDate, setCurrentDate] = useState(new Date('2025-04-27')); // Local time
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<{
    subtask_id: string;
    start_time: string;
    end_time: string;
    notes?: string;
  } | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const taskResponse = await fetchTasks();
        console.log('Fetched tasks:', taskResponse.data.data);
        setTasks(taskResponse.data.data);

        // Adjust currentDate to UTC by removing local timezone offset (IST: +5:30)
        const offsetMs = currentDate.getTimezoneOffset() * 60 * 1000;
        const utcCurrentDate = new Date(currentDate.getTime() - offsetMs);
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

        console.log('Fetched time entries:', timeResponse.data);

        const enrichedEntries = timeResponse?.data?.data?.map((entry: TimeEntry) => {
          const subtask = taskResponse.data.data
            .flatMap((t: Task) => t.subtasks)
            .find((s) => s.id === entry.subtaskId);
          return {
            ...entry,
            subtask: subtask || { title: 'Unknown', tags: [] },
          };
        });

        setTimeEntries(enrichedEntries);
      } catch (err: any) {
        console.error('Error fetching data:', err);
        toast.error(err.response?.data?.message || 'Failed to fetch data');
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
    subtask_id: string;
    start_time: string;
    end_time: string;
    duration: number;
    notes?: string;
  }) => {
    try {
      const response = await createTimeEntry(data);
      const newEntry = response.data.data.timeEntry;
      const subtask = tasks
        .flatMap((t) => t.subtasks)
        .find((s) => s.id === data.subtask_id) || { title: 'Unknown', tags: [] };

      addTimeEntry({
        ...newEntry,
        subtask,
      });
      toast.success('Time entry created successfully!');
      handleCloseModal();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create time entry');
    }
  };

  const handleEditTimeEntry = (entry: TimeEntry) => {
    setEditingEntry({
      subtask_id: entry.subtaskId,
      start_time: entry.startTime,
      end_time: entry.endTime,
      notes: entry.notes,
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

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Header />
      <div className="flex-1 flex">
        <ProjectSidebar onCreateProject={() => { }} />
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
          {view === 'day' && <DayView date={currentDate} onEditTimeEntry={handleEditTimeEntry} />}
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
        title={editingEntry ? 'Edit Time Entry' : 'Create New Time Entry'}
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