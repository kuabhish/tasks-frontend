import React, { useState } from 'react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import DayView from '../components/DayView';
import WeekView from '../components/WeekView';
import MonthView from '../components/MonthView';
import TaskForm from '../components/TaskForm';
import Modal from '../components/Modal';
import { Task } from '../types';
import useTimeStore from '../store/timeStore';
import { startOfWeek } from 'date-fns';

const TimelinePlanner: React.FC = () => {
  const { currentView, selectedDate, addTask, updateTask, getTasksForDay } = useTimeStore();
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const handleOpenTaskModal = (task?: Task) => {
    setEditingTask(task || null);
    setIsTaskModalOpen(true);
  };

  const handleCloseTaskModal = () => {
    setIsTaskModalOpen(false);
    setEditingTask(null);
  };

  const handleTaskSubmit = (taskData: Omit<Task, 'id'>) => {
    if (editingTask) {
      updateTask(editingTask.id, taskData);
    } else {
      addTask(taskData);
    }
    handleCloseTaskModal();
  };

  const renderView = () => {
    switch (currentView) {
      case 'day':
        return <DayView date={selectedDate} onEditTask={handleOpenTaskModal} />;
      case 'week':
        return <WeekView startDate={startOfWeek(selectedDate)} onEditTask={handleOpenTaskModal} />;
      case 'month':
        return <MonthView date={selectedDate} onEditTask={handleOpenTaskModal} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Header />
      <div className="flex-1 flex">
        <Sidebar onNewTask={() => handleOpenTaskModal()} />
        <main className="flex-1 p-6 overflow-y-auto">{renderView()}</main>
      </div>
      <Modal
        isOpen={isTaskModalOpen}
        onClose={handleCloseTaskModal}
        title={editingTask ? 'Edit Task' : 'Create Task'}
        maxWidth="lg"
      >
        <TaskForm
          initialTask={editingTask || undefined}
          onSubmit={handleTaskSubmit}
          onCancel={handleCloseTaskModal}
        />
      </Modal>
    </div>
  );
};

export default TimelinePlanner;