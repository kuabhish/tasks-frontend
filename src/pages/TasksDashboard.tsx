import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Header from '../components/Header';
import ProjectSidebar from '../components/ProjectSidebar';
import TaskForm from '../components/TaskForm';
import Modal from '../components/Modal';
import Button from '../components/ui/Button';
import { PlusIcon } from 'lucide-react';
import useTaskStore from '../store/taskStore';
import useAuthStore from '../store/authStore';
import { fetchTasks, createTask, createSubtask } from '../utils/api';
import { toast } from 'react-toastify';
import { Task } from '../types/task';
import SubtaskForm from '../components/SubTaskForm';

const TasksDashboard: React.FC = () => {
  const { tasks, setTasks, addTask, addSubtask } = useTaskStore();
  const role = useAuthStore((state) => state.user?.role);
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get('projectId');
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isSubtaskModalOpen, setIsSubtaskModalOpen] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('All');

  useEffect(() => {
    const loadTasks = async () => {
      try {
        const response = await fetchTasks(projectId || undefined);
        setTasks(response.data.data);
      } catch (err: any) {
        toast.error(err.response?.data?.message || 'Failed to fetch tasks');
      }
    };
    loadTasks();
  }, [projectId, setTasks]);

  const handleOpenTaskModal = () => {
    setIsTaskModalOpen(true);
  };

  const handleCloseTaskModal = () => {
    setIsTaskModalOpen(false);
  };

  const handleOpenSubtaskModal = (taskId: string) => {
    setIsSubtaskModalOpen(taskId);
  };

  const handleCloseSubtaskModal = () => {
    setIsSubtaskModalOpen(null);
  };

  const handleTaskSubmit = async (taskData: Omit<Task, 'id' | 'subtasks'>) => {
    try {
      const response = await createTask(taskData);
      addTask(response.data.data.task);
      toast.success('Task created successfully!');
      handleCloseTaskModal();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create task');
    }
  };

  const handleSubtaskSubmit = async (subtaskData: Omit<Task['subtasks'][0], 'id'>) => {
    try {
      const response = await createSubtask(subtaskData);
      addSubtask(subtaskData.task_id, response.data.data.subtask);
      toast.success('Subtask created successfully!');
      handleCloseSubtaskModal();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create subtask');
    }
  };

  const filteredTasks = filterStatus === 'All'
    ? tasks
    : tasks.filter((task) => task.status === filterStatus);

  const priorityColors: { [key: string]: string } = {
    High: 'bg-red-100 text-red-800',
    Medium: 'bg-yellow-100 text-yellow-800',
    Low: 'bg-green-100 text-green-800',
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Header />
      <div className="flex-1 flex">
        <ProjectSidebar onCreateProject={() => { }} />
        <main className="flex-1 p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Tasks Dashboard</h1>
            <div className="flex items-center space-x-4">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
              >
                <option value="All">All Statuses</option>
                <option value="Not Started">Not Started</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
              {['Admin', 'Project Manager'].includes(role || '') && (
                <Button variant="primary" onClick={handleOpenTaskModal}>
                  <PlusIcon className="h-4 w-4 mr-2" />
                  New Task
                </Button>
              )}
            </div>
          </div>
          <div className="space-y-6">
            {filteredTasks.map((task) => (
              <div key={task.id} className="bg-white rounded-lg shadow p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">{task.title}</h3>
                    <p className="text-sm text-gray-600">{task.description || 'No description'}</p>
                    <div className="mt-2 space-y-1 text-sm text-gray-500">
                      <p>
                        Status: {task.status} | Priority:{' '}
                        <span className={`px-2 py-1 text-xs rounded-full ${priorityColors[task.priority]}`}>
                          {task.priority}
                        </span>
                      </p>
                      <p>Due: {task.dueDate || 'N/A'}</p>
                      <p>Tags: {task.tags?.join(', ') || 'None'}</p>
                      <p>Estimated Duration: {task.estimatedDuration || 'N/A'} hours</p>
                      <p>Actual Duration: {task.actualDuration || 0} hours</p>
                      <p>Recurring: {task.isRecurring ? 'Yes' : 'No'}</p>
                      {task.recurringPattern && (
                        <p>Recurring Pattern: {JSON.stringify(task.recurringPattern)}</p>
                      )}
                    </div>
                  </div>
                  {['Admin', 'Project Manager'].includes(role || '') && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenSubtaskModal(task.id)}
                    >
                      Add Subtask
                    </Button>
                  )}
                </div>
                {task.subtasks.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-700">Subtasks</h4>
                    <ul className="mt-2 space-y-2">
                      {task.subtasks.map((subtask) => (
                        <li key={subtask.id} className="pl-4 border-l-2 border-gray-200">
                          <p className="text-sm font-medium text-gray-800">{subtask.title}</p>
                          <p className="text-sm text-gray-600">{subtask.description || 'No description'}</p>
                          <div className="text-sm text-gray-500">
                            <p>Status: {subtask.status}</p>
                            <p>Tags: {subtask.tags?.join(', ') || 'None'}</p>
                            <p>Estimated Duration: {subtask.estimatedDuration || 'N/A'} hours</p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </main>
      </div>
      <Modal
        isOpen={isTaskModalOpen}
        onClose={handleCloseTaskModal}
        title="Create New Task"
        maxWidth="lg"
      >
        <TaskForm onSubmit={handleTaskSubmit} onCancel={handleCloseTaskModal} />
      </Modal>
      {isSubtaskModalOpen && (
        <Modal
          isOpen={!!isSubtaskModalOpen}
          onClose={handleCloseSubtaskModal}
          title="Create New Subtask"
          maxWidth="lg"
        >
          <SubtaskForm
            taskId={isSubtaskModalOpen}
            onSubmit={handleSubtaskSubmit}
            onCancel={handleCloseSubtaskModal}
          />
        </Modal>
      )}
    </div>
  );
};

export default TasksDashboard;